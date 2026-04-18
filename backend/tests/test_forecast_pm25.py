"""Forecast PM2.5 endpoint tests."""
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/forecast/pm25"

PM_ROW = {"pm2_5": 34.0, "pm10": 56.0, "recorded_at": "2026-04-18 10:00:00"}
KY_ROW = {"temperature": 30.0, "humidity": 62.0, "recorded_at": "2026-04-18 10:00:00"}
MQ_ROW = {"mq9_raw": 380.0, "recorded_at": "2026-04-18 10:00:00"}
PM_HISTORY = [
    {"pm2_5": 28.0, "pm10": 48.0, "recorded_at": "2026-04-18 00:00:00"},
    {"pm2_5": 30.0, "pm10": 50.0, "recorded_at": "2026-04-18 02:00:00"},
    {"pm2_5": 31.5, "pm10": 52.0, "recorded_at": "2026-04-18 04:00:00"},
    {"pm2_5": 34.0, "pm10": 56.0, "recorded_at": "2026-04-18 06:00:00"},
]
WEATHER_HISTORY = [
    {"precipitation": 0.4, "weather_code": 61, "wind_speed_10m": 9.5},
    {"precipitation": 0.2, "weather_code": 61, "wind_speed_10m": 10.0},
]


def _setup(client):
    conn = make_conn(
        fetchall_returns=[PM_HISTORY, WEATHER_HISTORY],
        fetchone_returns=[PM_ROW, KY_ROW, MQ_ROW],
    )
    override_db(conn)
    return client


def test_forecast_default(client):
    _setup(client)
    response = client.get(BASE)
    assert response.status_code == 200


def test_forecast_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for field in ("forecast", "generated_at", "current_pm25", "pm25_trend", "summary", "points"):
        assert field in body


def test_forecast_has_6_and_12h_points(client):
    _setup(client)
    body = client.get(BASE).json()
    horizons = [point["hours_ahead"] for point in body["points"]]
    assert 6 in horizons
    assert 12 in horizons
