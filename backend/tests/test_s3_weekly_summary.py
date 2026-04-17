"""S3 — Weekly summary strip endpoint (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/weekly-summary"

PM_ROWS = [{"day_date": f"2026-04-{12+i:02d}", "pm25_avg": round(35.0 + i * 5, 1)} for i in range(7)]
TREND_ROWS = [
    {
        "day_date": f"2026-04-{12+i:02d}",
        "cough": 40.0, "chest_tight": 30.0, "wheeze": 20.0, "allergy": 50.0,
        "sore_throat": 25.0, "itchy_throat": 15.0, "stuffy_nose": 35.0,
        "runny_nose": 28.0, "headache": 45.0, "dizziness": 18.0,
        "nausea": 12.0, "itchy_eyes": 22.0,
    }
    for i in range(7)
]


def _setup(client):
    conn = make_conn([PM_ROWS, TREND_ROWS])
    override_db(conn)
    return client


# TC-S3-01: Default → 200
def test_s3_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-S3-02: Response has a "days" list with 7 entries
def test_s3_returns_7_days(client):
    _setup(client)
    body = client.get(BASE).json()
    assert "days" in body
    assert len(body["days"]) == 7


# TC-S3-03: Each day has required fields
def test_s3_day_schema(client):
    _setup(client)
    for day in client.get(BASE).json()["days"]:
        for f in ("date", "day_name", "is_today"):
            assert f in day, f"missing field: {f}"


# TC-S3-04: pm25_avg is a float or null
def test_s3_pm25_type(client):
    _setup(client)
    for day in client.get(BASE).json()["days"]:
        if day["pm25_avg"] is not None:
            assert isinstance(day["pm25_avg"], (int, float))


# TC-S3-05: Exactly one day has is_today=True
def test_s3_one_today(client):
    _setup(client)
    today_days = [d for d in client.get(BASE).json()["days"] if d["is_today"]]
    assert len(today_days) == 1
