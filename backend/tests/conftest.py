"""Shared fixtures for Visualization API tests."""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.store import get_db


def make_cursor(fetchall_returns: list[list[dict]]):
    """Return a mock cursor whose fetchall() cycles through the given list of results."""
    cursor = MagicMock()
    cursor.fetchall.side_effect = list(fetchall_returns)
    cursor.fetchone.return_value = None
    return cursor


def make_conn(fetchall_returns: list[list[dict]], fetchone_returns: list | None = None):
    """Return a mock DB connection with a preconfigured cursor."""
    cursor = make_cursor(fetchall_returns)
    if fetchone_returns:
        cursor.fetchone.side_effect = list(fetchone_returns)
    conn = MagicMock()
    conn.cursor.return_value = cursor
    return conn


def override_db(conn):
    def _dep():
        yield conn
    app.dependency_overrides[get_db] = _dep


def clear_overrides():
    app.dependency_overrides.clear()


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c
    clear_overrides()
