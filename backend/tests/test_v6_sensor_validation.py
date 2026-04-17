"""V6 — Visualization API 6: Sensor validation (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/sensor-validation"

SENSOR_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "sensor_pm25": round(30.0 + i * 1.5, 2)}
    for i in range(10)
]
REF_ROWS = [
    {"period": f"2026-04-{10+i:02d}", "reference_pm25": round(32.0 + i * 1.2, 2), "station_name": "Bangkok - Lat Phrao"}
    for i in range(10)
]

def _setup(client):
    conn = make_conn([SENSOR_ROWS, REF_ROWS])
    override_db(conn)
    return client


# TC-V6-01: Default params → 200
def test_v6_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V6-02: Response schema has required fields
def test_v6_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("visualization", "period_days", "station_name", "rmse", "correlation", "n_overlap", "data"):
        assert f in body, f"missing: {f}"


# TC-V6-03: visualization identifier correct
def test_v6_identifier(client):
    _setup(client)
    assert client.get(BASE).json()["visualization"] == "sensor-validation"


# TC-V6-04: rmse is a non-negative float when overlap exists
def test_v6_rmse_non_negative(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["n_overlap"] > 0
    assert isinstance(body["rmse"], float)
    assert body["rmse"] >= 0


# TC-V6-05: n_overlap matches paired data points
def test_v6_n_overlap(client):
    _setup(client)
    body = client.get(BASE).json()
    paired = sum(
        1 for d in body["data"]
        if d["sensor_pm25"] is not None and d["reference_pm25"] is not None
    )
    assert body["n_overlap"] == paired
