"""Generic forecast endpoint tests."""
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/forecast"

PM_ROW = {"pm2_5": 34.0, "pm10": 56.0, "recorded_at": "2026-04-18 10:00:00"}
KY_ROW = {"temperature": 30.0, "humidity": 62.0, "recorded_at": "2026-04-18 10:00:00"}
MQ_ROW = {"mq9_raw": 380.0, "recorded_at": "2026-04-18 10:00:00"}
PM_HISTORY = [
    {"pm2_5": 28.0, "pm10": 48.0, "recorded_at": "2026-04-18 00:00:00"},
    {"pm2_5": 30.0, "pm10": 50.0, "recorded_at": "2026-04-18 02:00:00"},
    {"pm2_5": 31.5, "pm10": 52.0, "recorded_at": "2026-04-18 04:00:00"},
    {"pm2_5": 34.0, "pm10": 56.0, "recorded_at": "2026-04-18 06:00:00"},
]
KY_HISTORY = [
    {"temperature": 28.5, "humidity": 66.0, "recorded_at": "2026-04-18 00:00:00"},
    {"temperature": 29.0, "humidity": 65.0, "recorded_at": "2026-04-18 02:00:00"},
    {"temperature": 29.4, "humidity": 63.5, "recorded_at": "2026-04-18 04:00:00"},
    {"temperature": 30.0, "humidity": 62.0, "recorded_at": "2026-04-18 06:00:00"},
]
WEATHER_HISTORY = [
    {"precipitation": 0.4, "weather_code": 61, "wind_speed_10m": 9.5},
    {"precipitation": 0.2, "weather_code": 61, "wind_speed_10m": 10.0},
]


def _setup(client):
    conn = make_conn(
        fetchall_returns=[PM_HISTORY, KY_HISTORY, WEATHER_HISTORY],
        fetchone_returns=[PM_ROW, KY_ROW, MQ_ROW],
    )
    override_db(conn)
    return client


def test_forecast_metric_pm25(client):
    _setup(client)
    body = client.get(BASE, params={"metric": "pm25"}).json()
    assert body["metric"] == "pm25"
    assert body["label"] == "PM2.5"


def test_forecast_metric_temperature(client):
    _setup(client)
    body = client.get(BASE, params={"metric": "temperature"}).json()
    assert body["metric"] == "temperature"
    assert body["unit"] == "C"


def test_forecast_metric_humidity(client):
    _setup(client)
    body = client.get(BASE, params={"metric": "humidity"}).json()
    assert body["metric"] == "humidity"
    assert body["unit"] == "%"
