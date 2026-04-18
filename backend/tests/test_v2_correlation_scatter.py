"""V2 — Visualization API 2: Correlation scatter plot (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/correlation-scatter"

PM_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "period_start": f"2026-04-{10+i:02d}", "pollutant_value": 30.0 + i * 2}
    for i in range(8)
]
TREND_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "period_start": f"2026-04-{10+i:02d}",
     "cough": 50.0 + i, "breathless": 0.0, "chest_tight": 0.0, "wheeze": 0.0,
     "allergy": 0.0, "sore_throat": 0.0, "itchy_throat": 0.0, "stuffy_nose": 0.0,
     "runny_nose": 0.0, "headache": 40.0 + i * 3, "dizziness": 0.0,
     "nausea": 0.0, "itchy_eyes": 0.0, "pm25_search": 0.0}
    for i in range(8)
]
FIRST_ROW = {"first_sensor_at": "2026-04-10"}

def _setup(client):
    conn = make_conn(
        fetchall_returns=[PM_ROWS, TREND_ROWS],
        fetchone_returns=[FIRST_ROW],
    )
    override_db(conn)
    return client


# TC-V2-01: Default params return 200
def test_v2_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V2-02: Response schema has required fields
def test_v2_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("visualization", "pollutant", "keyword", "pearson_r", "p_value", "significant", "overlap_points", "interpretation", "data"):
        assert f in body, f"missing: {f}"


# TC-V2-03: pm25 + headache — Pearson r is a number
def test_v2_pearson_r_is_number(client):
    _setup(client)
    body = client.get(BASE, params={"pollutant": "pm25", "keyword": "headache"}).json()
    assert isinstance(body["pearson_r"], float)


# TC-V2-04: significant is boolean
def test_v2_significant_is_bool(client):
    _setup(client)
    body = client.get(BASE).json()
    assert isinstance(body["significant"], bool)


# TC-V2-05: interpretation is a non-empty string
def test_v2_interpretation_not_empty(client):
    _setup(client)
    body = client.get(BASE).json()
    assert isinstance(body["interpretation"], str)
    assert len(body["interpretation"]) > 0


def test_v2_pm10_supported(client):
    _setup(client)
    body = client.get(BASE, params={"pollutant": "pm10", "keyword": "headache"}).json()
    assert body["pollutant"] == "pm10"
    assert body["pollutant_label"] == "PM10"
