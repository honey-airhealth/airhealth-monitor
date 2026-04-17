"""Statistic 2 — Air quality history line chart (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/history"

PM_ROWS  = [{"period": f"2026-04-{10+i:02d} 00:00:00", "avg_pm25": 30.0 + i} for i in range(7)]
KY_ROWS  = [{"period": f"2026-04-{10+i:02d} 00:00:00", "avg_temperature": 28.0 + i * 0.2, "avg_humidity": 60.0 + i} for i in range(7)]
MQ_ROWS  = [{"period": f"2026-04-{10+i:02d} 00:00:00", "avg_mq9": 300.0 + i * 5} for i in range(7)]

def _setup(client):
    conn = make_conn([PM_ROWS, KY_ROWS, MQ_ROWS])
    override_db(conn)
    return client


# TC-STATISTIC2-01: Default params -> 200
def test_statistic2_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-STATISTIC2-02: Response has interval, count, data fields
def test_statistic2_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("interval", "count", "data"):
        assert f in body, f"missing: {f}"


# TC-STATISTIC2-03: interval=daily echoed back
def test_statistic2_daily_interval(client):
    _setup(client)
    body = client.get(BASE, params={"interval": "daily"}).json()
    assert body["interval"] == "daily"


# TC-STATISTIC2-04: count matches length of data array
def test_statistic2_count_matches_data(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["count"] == len(body["data"])


# TC-STATISTIC2-05: Each data point has period field
def test_statistic2_data_has_period(client):
    _setup(client)
    body = client.get(BASE).json()
    assert len(body["data"]) > 0
    for d in body["data"]:
        assert "period" in d
