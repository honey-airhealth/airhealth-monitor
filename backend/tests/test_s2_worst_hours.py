"""Q2 — Worst hours of day endpoint (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/worst-hours"

PM_HOURS = [{"hour": h, "avg_pm25": 30.0 + h * 0.5} for h in range(24)]
MQ_HOURS = [{"hour": h, "avg_mq9":  300.0 + h * 5}  for h in range(24)]

def _setup(client):
    conn = make_conn([PM_HOURS, MQ_HOURS])
    override_db(conn)
    return client


# TC-Q2-01: Default → 200
def test_q2_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-Q2-02: Response is a non-empty list
def test_q2_returns_list(client):
    _setup(client)
    body = client.get(BASE).json()
    assert isinstance(body, list)
    assert len(body) > 0


# TC-Q2-03: Each item has hour, avg_pm25, avg_co, risk_level
def test_q2_item_schema(client):
    _setup(client)
    for item in client.get(BASE).json():
        for f in ("hour", "avg_pm25", "avg_co", "risk_level"):
            assert f in item, f"missing: {f}"


# TC-Q2-04: All hours are within 0–23
def test_q2_hour_range(client):
    _setup(client)
    for item in client.get(BASE).json():
        assert 0 <= item["hour"] <= 23


# TC-Q2-05: All risk_level values are valid
def test_q2_risk_level_valid(client):
    _setup(client)
    for item in client.get(BASE).json():
        assert item["risk_level"] in ("safe", "moderate", "unhealthy")
