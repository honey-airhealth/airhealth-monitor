from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


SensorName = Literal["PMS7003", "KY015", "MQ2", "MQ9"]


class SensorReadingIn(BaseModel):
    project_name: str = Field(default="AirHealth Monitor")
    sensor_name: SensorName
    temperature: float | None = None
    humidity: float | None = None
    pm1_0: int | None = None
    pm2_5: int | None = None
    pm10: int | None = None
    mq2_raw: int | None = None
    mq9_raw: int | None = None
    timestamp: datetime | None = None


class SensorReading(SensorReadingIn):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LatestReadingsResponse(BaseModel):
    readings: dict[str, SensorReading]
