"""V5 — Visualization API 5: Correlation matrix (10 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/correlation-matrix"

SENSOR_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "v": 30.0 + i * 2} for i in range(10)
]
KY_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "temp": 28.0 + i * 0.3, "humid": 60.0 + i} for i in range(10)
]
TREND_ROWS = [
    {"period": f"2026-04-{10+i:02d}",
     "cough": 50.0 + i, "breathless": i, "chest_tight": 0.0, "wheeze": 0.0,
     "allergy": i * 2, "sore_throat": 0.0, "itchy_throat": 0.0, "stuffy_nose": 0.0,
     "runny_nose": 0.0, "headache": 40.0 + i * 3, "dizziness": 0.0,
     "nausea": 0.0, "itchy_eyes": 0.0, "pm25_search": 0.0}
    for i in range(10)
]

def _setup(client, keywords="headache,cough"):
    # 4 queries: pm25, co, ky015, google_trends
    conn = make_conn([SENSOR_ROWS, SENSOR_ROWS, KY_ROWS, TREND_ROWS])
    override_db(conn)
    return client


# TC-V5-01: Default params → 200
def test_v5_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V5-02: Response schema has required fields
def test_v5_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("visualization", "period_days", "variables", "cells"):
        assert f in body, f"missing: {f}"


# TC-V5-03: visualization identifier correct
def test_v5_identifier(client):
    _setup(client)
    assert client.get(BASE).json()["visualization"] == "correlation-matrix"


# TC-V5-04: Always has 4 sensor variables (pm25, co, temp, humid)
def test_v5_sensor_variables(client):
    _setup(client)
    keys = [v["key"] for v in client.get(BASE).json()["variables"]]
    for sensor in ("pm25", "co", "temp", "humid"):
        assert sensor in keys


# TC-V5-05: Cell count = N² where N = len(variables)
def test_v5_cell_count(client):
    _setup(client)
    body = client.get(BASE).json()
    n = len(body["variables"])
    assert len(body["cells"]) == n * n


# TC-V5-06: Diagonal cells have r=1.0
def test_v5_diagonal_r_is_one(client):
    _setup(client)
    body = client.get(BASE).json()
    diag = [c for c in body["cells"] if c["row"] == c["col"]]
    for cell in diag:
        assert cell["r"] == 1.0


# TC-V5-07: keywords param filters variables correctly
def test_v5_keyword_filter(client):
    _setup(client, "headache")
    body = client.get(BASE, params={"keywords": "headache"}).json()
    kw_keys = [v["key"] for v in body["variables"] if v["group"] == "keyword"]
    assert kw_keys == ["headache"]


# TC-V5-08: days=14 echoed in period_days
def test_v5_period_days_echoed(client):
    _setup(client)
    body = client.get(BASE, params={"days": 14}).json()
    assert body["period_days"] == 14


# TC-V5-09: days=6 (below min) → 422
def test_v5_below_min_days(client):
    r = client.get(BASE, params={"days": 6})
    assert r.status_code == 422


# TC-V5-10: Each cell has row, col, r, p_value, significant, n
def test_v5_cell_structure(client):
    _setup(client)
    cells = client.get(BASE).json()["cells"]
    for cell in cells:
        for f in ("row", "col", "significant", "n"):
            assert f in cell, f"missing: {f}"
        assert isinstance(cell["significant"], bool)
