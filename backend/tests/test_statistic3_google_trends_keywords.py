"""Statistic 3 — Google Trends keyword search terms by date (5 test cases)."""
from datetime import date

import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/statistic/google-trends-keywords"

TREND_ROWS = [
    {
        "period": date(2026, 4, 16),
        "samples": 12,
        "cough": 70.0,
        "breathless": 14.0,
        "chest_tight": 8.0,
        "wheeze": 6.0,
        "allergy": 16.0,
        "sore_throat": 30.0,
        "itchy_throat": 4.0,
        "stuffy_nose": 9.0,
        "runny_nose": 10.0,
        "headache": 42.0,
        "dizziness": 12.0,
        "nausea": 5.0,
        "itchy_eyes": 7.0,
        "pm25_search": 11.0,
    },
    {
        "period": date(2026, 4, 17),
        "samples": 12,
        "cough": 80.0,
        "breathless": 18.0,
        "chest_tight": 10.0,
        "wheeze": 7.0,
        "allergy": 17.0,
        "sore_throat": 32.0,
        "itchy_throat": 5.0,
        "stuffy_nose": 11.0,
        "runny_nose": 12.0,
        "headache": 50.0,
        "dizziness": 13.0,
        "nausea": 6.0,
        "itchy_eyes": 8.0,
        "pm25_search": 15.0,
    },
    {
        "period": date(2026, 4, 18),
        "samples": 12,
        "cough": 90.0,
        "breathless": 20.0,
        "chest_tight": 12.0,
        "wheeze": 8.0,
        "allergy": 18.0,
        "sore_throat": 34.0,
        "itchy_throat": 6.0,
        "stuffy_nose": 13.0,
        "runny_nose": 14.0,
        "headache": 60.0,
        "dizziness": 14.0,
        "nausea": 7.0,
        "itchy_eyes": 9.0,
        "pm25_search": 19.0,
    },
]


def _setup(client):
    conn = make_conn([TREND_ROWS])
    override_db(conn)
    return client


# TC-STATISTIC3-01: Default params -> 200
def test_statistic3_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-STATISTIC3-02: Response has statistic, period, count, keywords and data fields
def test_statistic3_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("statistic", "period_days", "sample_count", "count", "keywords", "data"):
        assert f in body, f"missing: {f}"


# TC-STATISTIC3-03: Data is grouped by date
def test_statistic3_data_is_by_date(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["data"][0]["period"] == "2026-04-16"
    assert body["data"][1]["period"] == "2026-04-17"
    assert body["data"][2]["period"] == "2026-04-18"


# TC-STATISTIC3-04: Count matches number of date points
def test_statistic3_count_matches_date_points(client):
    _setup(client)
    body = client.get(BASE).json()
    assert body["count"] == len(body["data"]) == 3


# TC-STATISTIC3-05: Keyword summary still ranks by average search
def test_statistic3_keywords_ranked_by_average(client):
    _setup(client)
    keywords = client.get(BASE).json()["keywords"]
    avg_values = [k["avg_search"] for k in keywords if k["avg_search"] is not None]
    assert avg_values == sorted(avg_values, reverse=True)
    assert keywords[0]["key"] == "cough"
