"""Static 4 — Wind speed endpoint (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/statistic/wind-speed"

WIND_ROWS = [{"period": f"2026-04-{10+i:02d} 08:00:00", "avg_wind": round(10.0 + i * 1.5, 2), "cnt": 1} for i in range(7)]
SUMMARY_ROW = {"avg_wind": 14.5, "max_wind": 22.0, "min_wind": 10.0, "cnt": 7, "period_start": "2026-04-10", "period_end": "2026-04-16"}


def _setup(client):
    conn = make_conn([WIND_ROWS, SUMMARY_ROW])
    override_db(conn)
    return client


# TC-Static4-01: Default → 200
def test_static4_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-Static4-02: Response has required top-level fields
def test_static4_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("statistic", "period_hours", "interval", "avg_wind", "max_wind", "min_wind", "count", "data"):
        assert f in body, f"missing: {f}"


# TC-Static4-03: statistic field equals "wind-speed"
def test_static4_statistic_name(client):
    _setup(client)
    assert client.get(BASE).json()["statistic"] == "wind-speed"


# TC-Static4-04: data is a list
def test_static4_data_list(client):
    _setup(client)
    body = client.get(BASE).json()
    assert isinstance(body["data"], list)


# TC-Static4-05: interval param accepted
def test_static4_daily_interval(client):
    _setup(client)
    r = client.get(BASE, params={"hours": 168, "interval": "daily"})
    assert r.status_code == 200
    assert r.json()["interval"] == "daily"
