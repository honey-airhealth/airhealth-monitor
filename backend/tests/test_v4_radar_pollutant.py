"""V4 — Visualization API 4: Multi-pollutant radar (10 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/radar-pollutant"

def _setup(client):
    # 5 queries: pm25_today, co_today, temp_today, hum_today, wind_today,
    #            pm25_week, co_week, temp_week, hum_week, wind_week
    # Each cursor.execute → fetchone via avg()
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


# TC-V4-06: Each axis has today_norm and weekly_norm
def test_v4_axes_have_norm(client):
    _setup(client)
    for axis in client.get(BASE).json()["axes"]:
        assert "today_norm" in axis
        assert "weekly_norm" in axis


# TC-V4-07: today_norm and weekly_norm in [0, 1]
def test_v4_norm_in_range(client):
    _setup(client)
    for axis in client.get(BASE).json()["axes"]:
        for key in ("today_norm", "weekly_norm"):
            val = axis[key]
            if val is not None:
                assert 0.0 <= val <= 1.0, f"{key}={val} out of range"


# TC-V4-08: PM2.5 max_ref is 100
def test_v4_pm25_max_ref(client):
    _setup(client)
    pm25_axis = next(a for a in client.get(BASE).json()["axes"] if a["key"] == "pm25")
    assert pm25_axis["max_ref"] == 100.0


# TC-V4-09: snapshot_at is a non-empty string (ISO datetime)
def test_v4_snapshot_at_is_datetime(client):
    _setup(client)
    snap = client.get(BASE).json()["snapshot_at"]
    assert isinstance(snap, str) and len(snap) > 0


# TC-V4-10: wind max_ref is 30
def test_v4_wind_max_ref(client):
    _setup(client)
    wind = next(a for a in client.get(BASE).json()["axes"] if a["key"] == "wind")
    assert wind["max_ref"] == 30.0
