"""Statistic 1 — Sensor data descriptive statistics (5 test cases)."""
from datetime import datetime

import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/statistic/sensor-descriptive"

STAT_ROWS = [
    {
        "count": 146,
        "average": 36.55,
        "sd": 8.82,
        "max": 60.5,
        "min": 20.75,
        "period_start": datetime(2026, 4, 11, 2, 0, 0),
        "period_end": datetime(2026, 4, 18, 1, 0, 0),
    },
    {
        "count": 147,
        "average": 26.02,
        "sd": 2.16,
        "max": 35.0,
        "min": 22.3,
        "period_start": datetime(2026, 4, 11, 1, 0, 0),
        "period_end": datetime(2026, 4, 18, 1, 0, 0),
    },
    {
        "count": 147,
        "average": 47.43,
        "sd": 11.86,
        "max": 74.5,
        "min": 32.5,
        "period_start": datetime(2026, 4, 11, 1, 0, 0),
        "period_end": datetime(2026, 4, 18, 1, 0, 0),
    },
    {
        "count": 147,
        "average": 478.13,
        "sd": 603.8,
        "max": 3028.0,
        "min": 23.5,
        "period_start": datetime(2026, 4, 11, 1, 0, 0),
        "period_end": datetime(2026, 4, 18, 1, 0, 0),
    },
]


def _setup(client):
    conn = make_conn([], fetchone_returns=STAT_ROWS)
    override_db(conn)
    return client


# TC-STATISTIC1-01: Default params -> 200
def test_statistic1_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-STATISTIC1-02: Response has statistic and metrics fields
def test_statistic1_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("statistic", "period_hours", "interval", "period_start", "period_end", "metrics"):
        assert f in body, f"missing: {f}"


# TC-STATISTIC1-03: Statistic identifier is correct
def test_statistic1_identifier(client):
    _setup(client)
    assert client.get(BASE).json()["statistic"] == "sensor-data-descriptive"


# TC-STATISTIC1-04: Returns one metric row for each sensor metric
def test_statistic1_metric_count(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["metrics"][0]["key"] == "pm25"
    assert body["metrics"][1]["key"] == "temp"
    assert body["metrics"][2]["key"] == "hum"
    assert body["metrics"][3]["key"] == "co"


# TC-STATISTIC1-05: Metric rows include Average, SD, Max and Min
def test_statistic1_metric_stats(client):
    _setup(client)
    pm25 = client.get(BASE).json()["metrics"][0]
    assert pm25["average"] == 36.55
    assert pm25["sd"] == 8.82
    assert pm25["max"] == 60.5
    assert pm25["min"] == 20.75
