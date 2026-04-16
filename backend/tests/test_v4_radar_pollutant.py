"""V4 — Visualization API 4: Multi-pollutant radar (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/radar-pollutant"

def _setup(client):
    from unittest.mock import MagicMock
    cursor = MagicMock()
    cursor.fetchone.side_effect = [
        {"AVG(pm2_5)": 30.2},
        {"AVG(mq9_raw)": 319.6},
        {"AVG(temperature)": 24.5},
        {"AVG(humidity)": 40.4},
        {"AVG(wind_speed_10m)": 8.8},
        {"AVG(pm2_5)": 36.6},
        {"AVG(mq9_raw)": 482.6},
        {"AVG(temperature)": 26.0},
        {"AVG(humidity)": 48.1},
        {"AVG(wind_speed_10m)": 8.2},
    ]
    conn = MagicMock()
    conn.cursor.return_value = cursor
    override_db(conn)
    return client


# TC-V4-01: No params → 200
def test_v4_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V4-02: Response schema has required fields
def test_v4_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("visualization", "snapshot_at", "axes"):
        assert f in body


# TC-V4-03: visualization identifier correct
def test_v4_identifier(client):
    _setup(client)
    assert client.get(BASE).json()["visualization"] == "multi-pollutant-radar"


# TC-V4-04: axes has exactly 5 items
def test_v4_axes_count(client):
    _setup(client)
    assert len(client.get(BASE).json()["axes"]) == 5


# TC-V4-05: axis keys are pm25, co, temp, hum, wind
def test_v4_axes_keys(client):
    _setup(client)
    keys = [a["key"] for a in client.get(BASE).json()["axes"]]
    assert keys == ["pm25", "co", "temp", "hum", "wind"]
