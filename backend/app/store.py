import os
import time
from pathlib import Path

import mysql.connector
from fastapi import HTTPException
from dotenv import load_dotenv
from mysql.connector import Error, pooling

from app.models import SensorReading

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_ROOT / ".env")
load_dotenv()


# Existing: In-memory store for readings router
class InMemoryReadingStore:
    def __init__(self) -> None:
        self._readings: dict[str, SensorReading] = {}

    def upsert(self, reading: SensorReading) -> SensorReading:
        self._readings[reading.sensor_name] = reading
        return reading

    def latest(self) -> dict[str, SensorReading]:
        return dict(self._readings)


reading_store = InMemoryReadingStore()


# New: MySQL connection for integration router
db_config = {
    "host": os.getenv("DB_HOST", "iot.cpe.ku.ac.th"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", ""),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", ""),
}

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 5))
DB_STARTUP_MAX_RETRIES = int(os.getenv("DB_STARTUP_MAX_RETRIES", 3))
DB_STARTUP_RETRY_DELAY = float(os.getenv("DB_STARTUP_RETRY_DELAY", 1.0))
pool = None


def get_pool():
    global pool
    if pool is None:
        pool = pooling.MySQLConnectionPool(
            pool_name="airhealth",
            pool_size=DB_POOL_SIZE,
            **db_config,
        )
    return pool


def is_db_configured() -> bool:
    return bool(db_config["host"] and db_config["user"] and db_config["database"])


def verify_db_connection() -> None:
    conn = get_pool().get_connection()
    try:
        conn.ping(reconnect=True, attempts=1, delay=0)
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        finally:
            cursor.close()
    finally:
        conn.close()


def wait_for_db_ready(
    max_retries: int = DB_STARTUP_MAX_RETRIES,
    retry_delay: float = DB_STARTUP_RETRY_DELAY,
) -> None:
    if not is_db_configured():
        return

    last_error = None
    attempts = max(max_retries, 1)
    for attempt in range(attempts):
        try:
            verify_db_connection()
            return
        except Error as exc:
            last_error = exc
            if attempt < attempts - 1:
                time.sleep(retry_delay)

    if last_error is not None:
        raise RuntimeError(f"Database unavailable during startup: {last_error.msg}") from last_error


def get_db():
    """FastAPI dependency — yields a MySQL connection."""
    try:
        conn = get_pool().get_connection()
    except Error as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc.msg}") from exc

    try:
        yield conn
    finally:
        conn.close()
