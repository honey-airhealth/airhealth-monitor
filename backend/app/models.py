from datetime import date, datetime, timezone
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field
from enum import Enum

# Existing models (sensor readings)
SensorName = Literal["PMS7003", "KY015", "MQ9"]

class SensorReadingIn(BaseModel):
    project_name: str = Field(default="AirHealth Monitor")
    sensor_name: SensorName
    temperature: float | None = None
    humidity: float | None = None
    pm2_5: int | None = None
    pm10: int | None = None
    mq9_raw: int | None = None
    timestamp: datetime | None = None


class SensorReading(SensorReadingIn):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LatestReadingsResponse(BaseModel):
    readings: dict[str, SensorReading]


# Integration models (Q1–Q9)
class RiskLevel(str, Enum):
    safe = "safe"
    moderate = "moderate"
    unhealthy = "unhealthy"


class TrendDirection(str, Enum):
    improving = "improving"
    stable = "stable"
    worsening = "worsening"


class HealthRiskResponse(BaseModel):
    """Q1"""
    timestamp: datetime
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    main_contributor: str
    contributions: dict
    recommendation: str
    official_pm25: Optional[float] = None


class CorrelationResponse(BaseModel):
    """Q2"""
    period_days: int
    pm25_vs_headache: Optional[float] = None
    pm25_vs_cough: Optional[float] = None
    co_vs_breathing: Optional[float] = None
    pm25_vs_pm25_search: Optional[float] = None
    interpretation: str


class DiscomfortResponse(BaseModel):
    """Q3"""
    timestamp: datetime
    discomfort_index: float = Field(..., ge=0, le=100)
    heat_component: float
    humidity_component: float
    pm25_component: float
    description: str


class WorstHoursResponse(BaseModel):
    """Q4"""
    hour: int
    avg_pm25: float
    avg_co: float
    risk_level: RiskLevel


class MainContributorResponse(BaseModel):
    """Q5"""
    timestamp: datetime
    main_contributor: str
    pm25_contribution: float
    co_contribution: float
    heat_contribution: float
    humidity_contribution: float
    total_risk: float


class CompareOfficialResponse(BaseModel):
    """Q7"""
    timestamp: datetime
    local_pm25: Optional[float]
    official_pm25: Optional[float]
    difference: Optional[float]
    local_source: str = "PMS7003 sensor"
    official_source: str = "OpenAQ"


class TrendResponse(BaseModel):
    """Q8"""
    direction: TrendDirection
    pm25_trend: TrendDirection
    co_trend: TrendDirection
    temperature_trend: TrendDirection
    humidity_trend: TrendDirection
    summary: str


class SafetyResponse(BaseModel):
    """Q9"""
    timestamp: datetime
    status: str
    risk_level: RiskLevel
    risk_score: float
    recommendation: str


class LiveSourceStatus(BaseModel):
    source: str
    latest_at: Optional[datetime] = None
    freshness_minutes: Optional[int] = None


class LiveSnapshotResponse(BaseModel):
    recorded_at: datetime
    pm2_5: float
    pm10: Optional[float] = None
    mq9_raw: float
    temperature: float
    humidity: float
    official_pm25: Optional[float] = None
    openmeteo_temperature: Optional[float] = None
    openmeteo_humidity: Optional[float] = None


class LiveDashboardResponse(BaseModel):
    generated_at: datetime
    snapshot: LiveSnapshotResponse
    safety: SafetyResponse
    trend: TrendResponse
    source_status: list[LiveSourceStatus]


class SourceRowsResponse(BaseModel):
    source: str
    page: int
    page_size: int
    total_rows: int
    total_pages: int
    columns: list[str]
    rows: list[dict[str, Any]]


class VisualizationTimeSeriesPoint(BaseModel):
    week: str
    week_start: Optional[date] = None
    avg_pm25: Optional[float] = None
    avg_co: Optional[float] = None
    cough: Optional[float] = None
    breathless: Optional[float] = None
    chest_tight: Optional[float] = None
    wheeze: Optional[float] = None
    headache: Optional[float] = None
    sore_throat: Optional[float] = None
    itchy_throat: Optional[float] = None
    stuffy_nose: Optional[float] = None
    runny_nose: Optional[float] = None
    dizziness: Optional[float] = None
    nausea: Optional[float] = None
    itchy_eyes: Optional[float] = None
    allergy: Optional[float] = None
    pm25_search: Optional[float] = None
    illness_index: Optional[float] = None


class VisualizationTimeSeriesResponse(BaseModel):
    visualization: str
    period_days: int
    interval: str
    count: int
    data: list[VisualizationTimeSeriesPoint]
