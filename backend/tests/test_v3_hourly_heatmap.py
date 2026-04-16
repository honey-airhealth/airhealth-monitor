"""V3 — Visualization API 3: Hourly heatmap (5 test cases)."""
import pytest
from tests.conftest import client, override_db, make_conn  # noqa: F401

BASE = "/api/v1/integration/visualization/hourly-heatmap"

CELLS = [
    {"day": d, "hour": h, "avg_pm25": 30.0 + d + h * 0.5, "cnt": 5}
    for d in range(7) for h in range(24)
]

def _setup(client):
    conn = make_conn([[*CELLS]])
    override_db(conn)
    return client


# TC-V3-01: Default days=30 → 200
def test_v3_default(client):
    _setup(client)
    r = client.get(BASE)
    assert r.status_code == 200


# TC-V3-02: Response schema has required fields
def test_v3_schema(client):
    _setup(client)
    body = client.get(BASE).json()
    for f in ("visualization", "period_days", "overall_avg", "peak_hour", "worst_day", "cells"):
        assert f in body, f"missing: {f}"


# TC-V3-03: visualization identifier correct
def test_v3_identifier(client):
    _setup(client)
    assert client.get(BASE).json()["visualization"] == "hourly-heatmap-pm25"


# TC-V3-04: cells contain day (0-6) and hour (0-23)
def test_v3_cell_structure(client):
    _setup(client)
    cells = client.get(BASE).json()["cells"]
    assert len(cells) == 168  # 7×24
    for cell in cells:
        assert 0 <= cell["day"] <= 6
        assert 0 <= cell["hour"] <= 23
        assert cell["avg_pm25"] is not None


# TC-V3-05: overall_avg is a positive float
def test_v3_overall_avg(client):
    _setup(client)
    avg = client.get(BASE).json()["overall_avg"]
    assert isinstance(avg, float)
    assert avg > 0
