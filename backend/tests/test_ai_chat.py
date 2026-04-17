"""AI chat endpoint tests."""
from datetime import datetime
from unittest.mock import MagicMock

import requests

from tests.conftest import client, make_conn, override_db  # noqa: F401

BASE = "/api/v1/integration/ai-chat"

PM_ROW = {"pm2_5": 42.0, "pm10": 70.0, "recorded_at": datetime(2026, 4, 18, 10, 0, 0)}
KY_ROW = {"temperature": 30.0, "humidity": 62.0, "recorded_at": datetime(2026, 4, 18, 10, 0, 0)}
MQ_ROW = {"mq9_raw": 480.0, "recorded_at": datetime(2026, 4, 18, 10, 0, 0)}
OFFICIAL_ROW = {"pm25": 40.0}


def _setup_db():
    conn = make_conn(
        fetchall_returns=[],
        fetchone_returns=[PM_ROW, KY_ROW, MQ_ROW, OFFICIAL_ROW],
    )
    override_db(conn)


def _mock_gemini_response(text="Wear a well-fitted N95 mask and reduce outdoor exposure."):
    response = MagicMock()
    response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": text}],
                },
            },
        ],
    }
    response.raise_for_status.return_value = None
    return response


def test_ai_chat_success(client, monkeypatch):
    _setup_db()
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
    post = MagicMock(return_value=_mock_gemini_response())
    monkeypatch.setattr("app.routers.integration.requests.post", post)

    response = client.post(BASE, json={"message": "PM2.5 is high. What should I do?"})

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "Wear a well-fitted N95 mask and reduce outdoor exposure."
    assert body["model"] == "gemini-2.0-flash-lite"
    assert body["snapshot"]["pm2_5"] == 42.0
    post.assert_called_once()


def test_ai_chat_requires_api_key(client, monkeypatch):
    _setup_db()
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = client.post(BASE, json={"message": "PM2.5 is high. What should I do?"})

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


def test_ai_chat_fallback_model_after_not_found(client, monkeypatch):
    _setup_db()
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "missing-model")
    monkeypatch.setenv("GEMINI_FALLBACK_MODELS", "gemini-2.0-flash-lite")

    not_found = MagicMock()
    not_found.status_code = 404
    not_found.json.return_value = {"error": {"message": "model not found"}}
    http_error = requests.HTTPError(response=not_found)

    first = MagicMock()
    first.raise_for_status.side_effect = http_error
    first.json.return_value = not_found.json.return_value

    second = _mock_gemini_response("Fallback answer")
    post = MagicMock(side_effect=[first, second])
    monkeypatch.setattr("app.routers.integration.requests.post", post)

    response = client.post(BASE, json={"message": "PM2.5 is high. What should I do?"})

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "Fallback answer"
    assert body["model"] == "gemini-2.0-flash-lite"
    assert post.call_count == 2


def test_ai_chat_quota_returns_429(client, monkeypatch):
    _setup_db()
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
    monkeypatch.setenv("GEMINI_FALLBACK_MODELS", "")

    quota_response = MagicMock()
    quota_response.status_code = 429
    quota_response.json.return_value = {"error": {"message": "quota exceeded"}}
    http_error = requests.HTTPError(response=quota_response)

    gemini_response = MagicMock()
    gemini_response.raise_for_status.side_effect = http_error
    gemini_response.json.return_value = quota_response.json.return_value
    monkeypatch.setattr("app.routers.integration.requests.post", MagicMock(return_value=gemini_response))

    response = client.post(BASE, json={"message": "PM2.5 is high. What should I do?"})

    assert response.status_code == 429
    assert "quota" in response.json()["detail"].lower()


def test_ai_chat_rejects_empty_message(client, monkeypatch):
    _setup_db()
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    response = client.post(BASE, json={"message": ""})

    assert response.status_code == 422
