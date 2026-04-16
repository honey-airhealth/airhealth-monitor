"""V1 — Visualization API 1: Time-series chart (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/time-series"

PM_ROW = {"week_key": "2026-04-10", "week_start": "2026-04-10", "avg_pm25": 36.75}
CO_ROW = {"week_key": "2026-04-10", "week_start": "2026-04-10", "avg_co": 375.09}
TREND_ROW = {
    "week_key": "2026-04-10", "week_start": "2026-04-10",
    "cough": 77.1, "breathless": 0.0, "chest_tight": 0.0, "wheeze": 0.2,
    "allergy": 0.95, "sore_throat": 20.25, "itchy_throat": 0.5,
    "stuffy_nose": 0.0, "runny_nose": 0.0, "headache": 54.15,
    "dizziness": 15.95, "nausea": 4.05, "itchy_eyes": 0.0, "pm25_search": 1.25,
}
FIRST_ROW = {"first_sensor_at": "2026-04-10"}

def _setup(client):
    conn = make_conn(
        fetchall_returns=[[PM_ROW], [CO_ROW], [TREND_ROW]],
        fetchone_returns=[FIRST_ROW],
    )
    override_db(conn)
    return client


# TC-V1-01: Default params return 200
def test_v1_default_params(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V1-02: Response contains required top-level fields
def test_v1_response_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for field in ("visualization", "period_days", "interval", "count", "data"):
        assert field in body, f"missing field: {field}"


# TC-V1-03: visualization identifier is correct
def test_v1_visualization_identifier(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["visualization"] == "time-series-pollution-vs-illness-keywords"


# TC-V1-04: days=7 interval=daily — period_days echoed back
def test_v1_period_days_echoed(client):
    _setup(client)
    body = client.get(BASE, params={"days": 7, "interval": "daily"}).json()
    assert body["period_days"] == 7
    assert body["interval"] == "daily"


# TC-V1-05: Each data point has illness_index computed
def test_v1_data_has_illness_index(client):
    _setup(client)
    data = client.get(BASE).json()["data"]
    assert len(data) == 1
    assert "illness_index" in data[0]
    assert data[0]["illness_index"] is not None
