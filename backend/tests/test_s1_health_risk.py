"""Q1 — Health risk endpoint (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/health-risk"

# _combined_at: 3 fetchone (pm, ky, mq) + _get_official_pm25: 1 fetchone = 4 total
PM_ROW       = {"pm2_5": 35.0, "pm10": 50.0, "recorded_at": "2026-04-18 10:00:00"}
KY_ROW       = {"temperature": 28.5, "humidity": 65.0, "recorded_at": "2026-04-18 10:00:00"}
MQ_ROW       = {"mq9_raw": 350.0, "recorded_at": "2026-04-18 10:00:00"}
OFFICIAL_ROW = {"pm25": 38.0}

def _setup(client):
    conn = make_conn(
        fetchall_returns=[],
        fetchone_returns=[PM_ROW, KY_ROW, MQ_ROW, OFFICIAL_ROW],
    )
    override_db(conn)
    return client


# TC-Q1-01: Default → 200
def test_q1_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-Q1-02: Response has all required fields
def test_q1_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("timestamp", "risk_score", "risk_level", "main_contributor", "contributions", "recommendation"):
        assert f in body, f"missing: {f}"


# TC-Q1-03: risk_score is between 0 and 100
def test_q1_risk_score_range(client):
    _setup(client)
    score = client.get(BASE).json()["risk_score"]
    assert isinstance(score, (int, float))
    assert 0 <= score <= 100


# TC-Q1-04: risk_level is one of the valid enum values
def test_q1_risk_level_valid(client):
    _setup(client)
    level = client.get(BASE).json()["risk_level"]
    assert level in ("safe", "moderate", "unhealthy")


# TC-Q1-05: recommendation is a non-empty string
def test_q1_recommendation_not_empty(client):
    _setup(client)
    rec = client.get(BASE).json()["recommendation"]
    assert isinstance(rec, str) and len(rec) > 0
