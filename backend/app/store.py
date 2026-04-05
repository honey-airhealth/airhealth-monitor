import os
from pathlib import Path

import mysql.connector
from fastapi import HTTPException
from dotenv import load_dotenv
from mysql.connector import Error, pooling

from app.models import SensorReading

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
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

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 1))
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
