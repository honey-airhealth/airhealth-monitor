"""V5 — Visualization API 5: Correlation matrix (5 test cases)."""
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

def _setup(client):
    conn = make_conn([SENSOR_ROWS, SENSOR_ROWS, SENSOR_ROWS, KY_ROWS, TREND_ROWS])
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


# TC-V5-04: Always has sensor variables including pm10
def test_v5_sensor_variables(client):
    _setup(client)
    keys = [v["key"] for v in client.get(BASE).json()["variables"]]
    for sensor in ("pm25", "pm10", "co", "temp", "humid"):
        assert sensor in keys


# TC-V5-05: Cell count = N² where N = len(variables)
def test_v5_cell_count(client):
    _setup(client)
    body = client.get(BASE).json()
    n = len(body["variables"])
    assert len(body["cells"]) == n * n
