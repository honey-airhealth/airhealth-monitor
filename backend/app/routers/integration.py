"""
Data Integration Router — suggestion, visualization, and statistic endpoints

Actual table schemas:
  pms7003_readings:   id, pm2_5, pm10, recorded_at
  ky015_readings:     id, temperature, humidity, recorded_at
  mq9_readings:       id, mq9_raw, recorded_at
  official_pm25:      id, source, station_name, lat, lon, distance_km, pm25, unit, recorded_at, fetched_at
  openmeteo_readings: id, source, lat, lon, temperature_2m, relative_humidity_2m, precipitation, weather_code, wind_speed_10m, recorded_at, fetched_at
  google_trends:      id, timestamp, cough, breathless, chest_tight, wheeze, allergy, sore_throat, itchy_throat,
                      stuffy_nose, runny_nose, headache, dizziness, nausea, itchy_eyes, pm25, geo, created_at
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import date, datetime, timedelta
from typing import Optional
from collections import Counter
import math
import os
import numpy as np
import requests

from app.store import get_db
from app.seed import seed_test_data
from app.models import (
    AIChatRequest,
    AIChatResponse,
    HealthRiskResponse,
    WorstHoursResponse,
    TrendResponse,
    SafetyResponse,
    LiveDashboardResponse,
    LiveSnapshotResponse,
    LiveSourceStatus,
    SourceRowsResponse,
    VisualizationCorrelationScatterResponse,
    VisualizationTimeSeriesResponse,
    HourlyHeatmapCell,
    HourlyHeatmapResponse,
    RadarAxis,
    RadarResponse,
    MatrixVariable,
    MatrixCell,
    CorrelationMatrixResponse,
    ForecastPoint,
    ForecastResponse,
    PM25ForecastPoint,
    PM25ForecastResponse,
    SeedTestDataResponse,
    SensorValidationPoint,
    SensorValidationResponse,
    WeeklySummaryDay,
    WeeklySummaryResponse,
    WindSpeedPoint,
    WindSpeedResponse,
    StatisticSensorDescriptiveResponse,
    StatisticSensorMetricStats,
    StatisticGoogleTrendKeyword,
    StatisticGoogleTrendPoint,
    StatisticGoogleTrendsResponse,
    RiskLevel,
    TrendDirection,
    SensorReading,
)
from app.store import reading_store

router = APIRouter(prefix="/integration", tags=["Data Integration"])

SOURCE_TABLE_CONFIG = {
    "PMS7003": {
        "table": "pms7003_readings",
        "order_by": "recorded_at DESC, id DESC",
        "columns": ["id", "pm2_5", "pm10", "recorded_at"],
    },
    "KY-015": {
        "table": "ky015_readings",
        "order_by": "recorded_at DESC, id DESC",
        "columns": ["id", "temperature", "humidity", "recorded_at"],
    },
    "MQ-9": {
        "table": "mq9_readings",
        "order_by": "recorded_at DESC, id DESC",
        "columns": ["id", "mq9_raw", "recorded_at"],
    },
    "Open-Meteo": {
        "table": "openmeteo_readings",
        "order_by": "fetched_at DESC, id DESC",
        "columns": [
            "id", "source", "temperature_2m", "relative_humidity_2m",
            "precipitation", "weather_code", "wind_speed_10m", "recorded_at", "fetched_at",
        ],
    },
    "Official PM2.5": {
        "table": "official_pm25",
        "order_by": "fetched_at DESC, id DESC",
        "columns": [
            "id", "source", "station_name", "pm25", "unit",
            "distance_km", "recorded_at", "fetched_at",
        ],
    },
    "Google Trends": {
        "table": "google_trends",
        "order_by": "created_at DESC, id DESC",
        "columns": [
            "id", "timestamp", "cough", "breathless", "allergy",
            "headache", "dizziness", "pm25", "created_at",
        ],
    },
}

GOOGLE_TRENDS_KEYWORDS = [
    ("cough", "Cough", "cough"),
    ("breathless", "Breathless", "breathless"),
    ("chest_tight", "Chest tight", "chest_tight"),
    ("wheeze", "Wheeze", "wheeze"),
    ("allergy", "Allergy", "allergy"),
    ("sore_throat", "Sore throat", "sore_throat"),
    ("itchy_throat", "Itchy throat", "itchy_throat"),
    ("stuffy_nose", "Stuffy nose", "stuffy_nose"),
    ("runny_nose", "Runny nose", "runny_nose"),
    ("headache", "Headache", "headache"),
    ("dizziness", "Dizziness", "dizziness"),
    ("nausea", "Nausea", "nausea"),
    ("itchy_eyes", "Itchy eyes", "itchy_eyes"),
    ("pm25_search", "PM2.5 search", "pm25"),
]

AI_SYSTEM_INSTRUCTION = """
You are AirHealth AI, an English-first assistant for the AirHealth Monitor dashboard.
Answer in the same language as the user's question. Use English by default only when the language is unclear.
Focus on practical first steps for PM2.5, air pollution exposure, cough, headache, throat irritation,
breathing discomfort, allergy-like symptoms, and when to seek medical care.
Use the live sensor context when provided, but do not claim to diagnose disease.
For severe symptoms such as chest pain, severe breathing difficulty, confusion, fainting,
blue lips, or symptoms that rapidly worsen, tell the user to seek urgent medical help.
Keep answers concise, actionable, and easy for a general user to follow.
"""


def _ai_snapshot_context(conn) -> dict:
    try:
        sensor = _latest_combined(conn)
        official = _get_official_pm25(conn)
        score, level, main, _contribs, rec = _calc_risk(
            sensor["pm2_5"],
            sensor["pm10"],
            sensor["mq9_raw"],
            sensor["temperature"],
            sensor["humidity"],
            official,
        )
        return {
            "recorded_at": sensor["recorded_at"].isoformat() if sensor.get("recorded_at") else None,
            "pm2_5": round(sensor["pm2_5"], 2),
            "pm10": round(sensor["pm10"], 2),
            "mq9_raw": round(sensor["mq9_raw"], 2),
            "temperature": round(sensor["temperature"], 2),
            "humidity": round(sensor["humidity"], 2),
            "official_pm25": round(official, 2) if official is not None else None,
            "risk_score": round(score, 2),
            "risk_level": level.value,
            "main_contributor": main,
            "recommendation": rec,
        }
    except HTTPException:
        return {}


def _sync_in_memory_readings(snapshot: dict) -> None:
    recorded_at = snapshot["recorded_at"]
    reading_store.upsert(SensorReading(
        sensor_name="PMS7003",
        pm2_5=int(round(snapshot["pm2_5"])),
        pm10=int(round(snapshot["pm10"])),
        timestamp=recorded_at,
    ))
    reading_store.upsert(SensorReading(
        sensor_name="KY015",
        temperature=float(snapshot["temperature"]),
        humidity=float(snapshot["humidity"]),
        timestamp=recorded_at,
    ))
    reading_store.upsert(SensorReading(
        sensor_name="MQ9",
        mq9_raw=int(round(snapshot["mq9_raw"])),
        timestamp=recorded_at,
    ))


# Helpers
def _latest_combined(conn) -> dict:
    """Combine latest from pms7003, ky015, mq9."""
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT pm2_5, pm10, recorded_at FROM pms7003_readings ORDER BY recorded_at DESC LIMIT 1")
    pm = cursor.fetchone()

    cursor.execute("SELECT temperature, humidity, recorded_at FROM ky015_readings ORDER BY recorded_at DESC LIMIT 1")
    ky = cursor.fetchone()

    cursor.execute("SELECT mq9_raw, recorded_at FROM mq9_readings ORDER BY recorded_at DESC LIMIT 1")
    mq = cursor.fetchone()

    cursor.close()

    if not pm and not ky and not mq:
        raise HTTPException(404, "No sensor data available yet")

    return {
        "recorded_at": (pm or ky or mq)["recorded_at"],
        "pm2_5": float(pm["pm2_5"]) if pm else 0,
        "pm10": float(pm["pm10"]) if pm else 0,
        "temperature": float(ky["temperature"]) if ky else 0,
        "humidity": float(ky["humidity"]) if ky else 0,
        "mq9_raw": float(mq["mq9_raw"]) if mq else 0,
    }


def _combined_at(conn, snapshot_at: Optional[datetime] = None) -> dict:
    if snapshot_at is None:
        return _latest_combined(conn)

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT pm2_5, pm10, recorded_at FROM pms7003_readings WHERE recorded_at <= %s ORDER BY recorded_at DESC LIMIT 1",
        (snapshot_at,),
    )
    pm = cursor.fetchone()

    cursor.execute(
        "SELECT temperature, humidity, recorded_at FROM ky015_readings WHERE recorded_at <= %s ORDER BY recorded_at DESC LIMIT 1",
        (snapshot_at,),
    )
    ky = cursor.fetchone()

    cursor.execute(
        "SELECT mq9_raw, recorded_at FROM mq9_readings WHERE recorded_at <= %s ORDER BY recorded_at DESC LIMIT 1",
        (snapshot_at,),
    )
    mq = cursor.fetchone()

    cursor.close()

    if not pm and not ky and not mq:
        raise HTTPException(404, "No sensor data available for the selected timestamp")

    return {
        "recorded_at": snapshot_at,
        "pm2_5": float(pm["pm2_5"]) if pm else 0,
        "pm10": float(pm["pm10"]) if pm else 0,
        "temperature": float(ky["temperature"]) if ky else 0,
        "humidity": float(ky["humidity"]) if ky else 0,
        "mq9_raw": float(mq["mq9_raw"]) if mq else 0,
    }


def _get_official_pm25(conn, snapshot_at: Optional[datetime] = None) -> Optional[float]:
    cursor = conn.cursor(dictionary=True)
    if snapshot_at is None:
        cursor.execute("SELECT pm25 FROM official_pm25 ORDER BY recorded_at DESC LIMIT 1")
    else:
        cursor.execute(
            "SELECT pm25 FROM official_pm25 WHERE recorded_at <= %s ORDER BY recorded_at DESC LIMIT 1",
            (snapshot_at,),
        )
    row = cursor.fetchone()
    cursor.close()
    return float(row["pm25"]) if row and row["pm25"] is not None else None


def _coerce_float(value) -> Optional[float]:
    return float(value) if value is not None else None


def _freshness_minutes(latest_at: Optional[datetime]) -> Optional[int]:
    if latest_at is None:
        return None
    delta = datetime.now() - latest_at
    return max(int(delta.total_seconds() // 60), 0)


def _latest_table_timestamp(conn, table_name: str, column: str = "recorded_at") -> Optional[datetime]:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"SELECT MAX({column}) as latest_at FROM {table_name}")
    row = cursor.fetchone()
    cursor.close()
    return row["latest_at"] if row else None


def _serialize_row(row: dict) -> dict:
    serialized = {}
    for key, value in row.items():
        serialized[key] = value.isoformat() if isinstance(value, datetime) else value
    return serialized


WEATHER_CODE_LABELS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail",
}

RAINY_CODES = {51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99}
FOG_CODES = {45, 48}


def _weather_code_label(code: Optional[int]) -> str:
    if code is None:
        return "Unknown weather"
    return WEATHER_CODE_LABELS.get(code, f"Weather code {code}")


def _dominant_weather_code(values: list[Optional[int]]) -> Optional[int]:
    present = [int(value) for value in values if value is not None]
    if not present:
        return None
    return Counter(present).most_common(1)[0][0]


def _build_weather_pm25_insight(
    pm25_trend: TrendDirection,
    avg_precipitation: Optional[float],
    weather_code: Optional[int],
) -> tuple[str, str]:
    label = _weather_code_label(weather_code)
    avg_precipitation = round(avg_precipitation, 2) if avg_precipitation is not None else None

    rainy = weather_code in RAINY_CODES or (avg_precipitation is not None and avg_precipitation >= 0.2)
    foggy = weather_code in FOG_CODES

    if rainy:
        summary = (
            f"{label} with average precipitation around {avg_precipitation} mm suggests washout conditions "
            "that can help lower PM2.5."
            if avg_precipitation is not None
            else f"{label} suggests washout conditions that can help lower PM2.5."
        )
        if pm25_trend == TrendDirection.worsening:
            outlook = "PM2.5 is still rising, but continued rain may limit further buildup."
        elif pm25_trend == TrendDirection.improving:
            outlook = "Rain-supported washout is consistent with the improving PM2.5 trend."
        else:
            outlook = "If rain persists, PM2.5 should stay stable or ease slightly."
        return summary, outlook

    if foggy:
        summary = f"{label} often traps pollutants near the surface, so PM2.5 can linger even without new emissions."
        if pm25_trend == TrendDirection.worsening:
            outlook = "With foggy conditions and a worsening trend, PM2.5 may keep climbing until mixing improves."
        elif pm25_trend == TrendDirection.improving:
            outlook = "PM2.5 is improving, but fog can still slow down full dispersion."
        else:
            outlook = "Expect slow PM2.5 clearing unless wind or rain improves ventilation."
        return summary, outlook

    summary = (
        f"{label} with little rain offers limited particle washout, so PM2.5 depends more on nearby emissions and airflow."
    )
    if pm25_trend == TrendDirection.worsening:
        outlook = "Dry, stable weather means PM2.5 may continue rising if emission sources stay active."
    elif pm25_trend == TrendDirection.improving:
        outlook = "PM2.5 is easing, but without rain the improvement may be gradual rather than sharp."
    else:
        outlook = "Without rain support, PM2.5 is likely to stay near current levels unless conditions change."
    return summary, outlook


def _weather_period_insight(conn, since: datetime, pm25_trend: TrendDirection) -> tuple[Optional[float], Optional[int], str, str]:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT precipitation, weather_code
        FROM openmeteo_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    rows = cursor.fetchall()
    cursor.close()

    precip_values = [_coerce_float(row.get("precipitation")) for row in rows]
    avg_precipitation = (
        round(sum(value for value in precip_values if value is not None) / len([value for value in precip_values if value is not None]), 2)
        if any(value is not None for value in precip_values)
        else None
    )
    weather_code = _dominant_weather_code([row.get("weather_code") for row in rows])
    summary, outlook = _build_weather_pm25_insight(pm25_trend, avg_precipitation, weather_code)
    return avg_precipitation, weather_code, summary, outlook


def _trend_slope(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    return values[-1] - values[0]


def _forecast_weather_adjustment(avg_precipitation: Optional[float], weather_code: Optional[int], avg_wind_speed: Optional[float]) -> float:
    adjustment = 0.0
    if avg_precipitation is not None:
        adjustment -= min(avg_precipitation * 3.5, 8.0)
    if weather_code in RAINY_CODES:
        adjustment -= 2.0
    elif weather_code in FOG_CODES:
        adjustment += 2.5
    elif weather_code in {0, 1, 2, 3}:
        adjustment += 1.0

    if avg_wind_speed is not None:
        if avg_wind_speed >= 14:
            adjustment -= 4.0
        elif avg_wind_speed >= 8:
            adjustment -= 2.0
        elif avg_wind_speed <= 3:
            adjustment += 2.0
    return round(adjustment, 2)


def _forecast_confidence(sample_count: int, avg_wind_speed: Optional[float], avg_precipitation: Optional[float]) -> str:
    if sample_count < 6:
        return "low"
    if avg_wind_speed is None or avg_precipitation is None:
        return "medium"
    return "medium-high" if sample_count >= 12 else "medium"


def _generic_weather_summary(metric_label: str, trend: TrendDirection, avg_precipitation: Optional[float], weather_code: Optional[int], avg_wind_speed: Optional[float]) -> str:
    weather_label = _weather_code_label(weather_code)
    rain_text = f"Rain {avg_precipitation} mm" if avg_precipitation is not None else "No rain estimate"
    wind_text = f"wind {avg_wind_speed} km/h" if avg_wind_speed is not None else "unknown wind"
    return f"{metric_label} is {trend.value} with {weather_label.lower()}, {rain_text}, and {wind_text} in the latest weather window."


def _calc_risk(pm25: float, pm10: float, mq9_raw: float, temp: float, humidity: float, official_pm25=None):
    """
    Health risk score 0–100.
    mq9_raw is analog (0–4095): ~100-200 clean, ~500 moderate, ~1000+ high.
    """
    # PM2.5 (0-32 pts)
    if pm25 <= 15:
        p25 = 0
    elif pm25 <= 37.5:
        p25 = (pm25 - 15) / 22.5 * 16
    elif pm25 <= 75:
        p25 = 16 + (pm25 - 37.5) / 37.5 * 8
    else:
        p25 = min(24 + (pm25 - 75) / 75 * 8, 32)

    # PM10 (0-8 pts)
    if pm10 <= 45:
        p10 = 0
    elif pm10 <= 100:
        p10 = (pm10 - 45) / 55 * 4
    elif pm10 <= 180:
        p10 = 4 + (pm10 - 100) / 80 * 2
    else:
        p10 = min(6 + (pm10 - 180) / 120 * 2, 8)

    dust = p25 + p10
    if official_pm25 is not None and (pm25 + official_pm25) / 2 > pm25:
        dust = min(dust * 1.1, 40)
        if dust > 0:
            scale = dust / max(p25 + p10, 1e-9)
            p25 *= scale
            p10 *= scale

    # MQ9 raw → CO score (0-25 pts)
    if mq9_raw <= 200:       c = 0
    elif mq9_raw <= 500:     c = (mq9_raw - 200) / 300 * 10
    elif mq9_raw <= 1000:    c = 10 + (mq9_raw - 500) / 500 * 10
    else:                    c = min(20 + (mq9_raw - 1000) / 1000 * 5, 25)

    # Heat (0-20 pts)
    if temp <= 27:       h = 0
    elif temp <= 35:     h = (temp - 27) / 8 * 10
    else:                h = min(10 + (temp - 35) / 5 * 10, 20)

    # Humidity (0-15 pts)
    if 30 <= humidity <= 70:   hu = 0
    elif humidity > 70:        hu = min((humidity - 70) / 30 * 15, 15)
    else:                      hu = min((30 - humidity) / 30 * 10, 15)

    total = min(round(dust + c + h + hu, 1), 100)
    contribs = {
        "pm25": round(p25, 1),
        "pm10": round(p10, 1),
        "co": round(c, 1),
        "heat": round(h, 1),
        "humidity": round(hu, 1),
    }
    main = max(contribs, key=contribs.get)

    if total <= 25:
        level, rec = RiskLevel.safe, "Air quality is good. Safe for outdoor activities."
    elif total <= 55:
        level, rec = RiskLevel.moderate, "Moderate risk. Sensitive groups should limit outdoor activity."
    else:
        level, rec = RiskLevel.unhealthy, "Unhealthy. Avoid outdoor exercise. Wear a mask."

    if p10 >= 3:
        rec += " Elevated coarse dust (PM10) suggests road dust or resuspended particles may also be contributing."

    return total, level, main, contribs, rec


def _get_trend(values: list[float]) -> TrendDirection:
    if len(values) < 3:
        return TrendDirection.stable
    n = len(values)
    x_mean = (n - 1) / 2
    y_mean = sum(values) / n
    if y_mean == 0:
        return TrendDirection.stable
    num = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
    den = sum((i - x_mean) ** 2 for i in range(n))
    slope = num / den if den else 0
    rel = slope / y_mean
    if rel > 0.02:     return TrendDirection.worsening
    elif rel < -0.02:  return TrendDirection.improving
    return TrendDirection.stable


def _student_t_pdf(x: float, df: int) -> float:
    coeff = math.exp(math.lgamma((df + 1) / 2) - math.lgamma(df / 2))
    coeff /= math.sqrt(df * math.pi)
    return coeff * ((1 + (x * x) / df) ** (-(df + 1) / 2))


def _student_t_two_tailed_p_value(t_stat: float, df: int) -> Optional[float]:
    if df <= 0 or math.isnan(t_stat):
        return None
    x = abs(t_stat)
    if x == 0:
        return 1.0
    if x > 40:
        return 0.0

    steps = 1000
    if steps % 2:
        steps += 1
    h = x / steps
    total = _student_t_pdf(0, df) + _student_t_pdf(x, df)
    for i in range(1, steps):
        total += (4 if i % 2 else 2) * _student_t_pdf(i * h, df)
    integral = total * h / 3
    cdf = min(0.5 + integral, 1.0)
    return max(2 * (1 - cdf), 0.0)


@router.post(
    "/seed-test-data",
    response_model=SeedTestDataResponse,
    summary="Seed deterministic test data into MySQL for local demos",
)
def seed_integration_test_data(
    days: int = Query(7, ge=1, le=30),
    clear_existing: bool = Query(True),
    conn=Depends(get_db),
):
    result = seed_test_data(conn, days=days, clear_existing=clear_existing)
    _sync_in_memory_readings(result.latest_snapshot)
    return SeedTestDataResponse(
        days=result.days,
        clear_existing=result.clear_existing,
        inserted_rows=result.inserted_rows,
        latest_snapshot=result.latest_snapshot,
    )


# Suggestion S1: Current Health Risk Score
@router.get("/health-risk", response_model=HealthRiskResponse,
            summary="Q1: What is the current health risk score right now?")
def q1_health_risk(timestamp: Optional[datetime] = Query(None), conn=Depends(get_db)):
    """What is your current health risk score?"""
    sensor = _combined_at(conn, timestamp)
    official = _get_official_pm25(conn, timestamp)
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["pm10"], sensor["mq9_raw"],
        sensor["temperature"], sensor["humidity"], official)
    return HealthRiskResponse(
        timestamp=sensor["recorded_at"], risk_score=score, risk_level=level,
        main_contributor=main, contributions=contribs,
        recommendation=rec, pm10=sensor["pm10"], official_pm25=official)


# Suggestion S2: Worst Hours
@router.get("/worst-hours", response_model=list[WorstHoursResponse],
            summary="Q2: Worst hours of day?")
def q2_worst_hours(days: int = Query(7, le=30), conn=Depends(get_db)):
    """What are the worst hours of the day for air quality?"""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    cursor.execute(
        """SELECT HOUR(recorded_at) as hour, AVG(pm2_5) as avg_pm25
           FROM pms7003_readings WHERE recorded_at >= %s
           GROUP BY HOUR(recorded_at)""", (since,))
    pm_by_hour = {r["hour"]: float(r["avg_pm25"]) for r in cursor.fetchall()}

    cursor.execute(
        """SELECT HOUR(recorded_at) as hour, AVG(mq9_raw) as avg_mq9
           FROM mq9_readings WHERE recorded_at >= %s
           GROUP BY HOUR(recorded_at)""", (since,))
    mq_by_hour = {r["hour"]: float(r["avg_mq9"]) for r in cursor.fetchall()}
    cursor.close()

    results = []
    for h in sorted(set(pm_by_hour) | set(mq_by_hour)):
        pm = pm_by_hour.get(h, 0)
        mq = mq_by_hour.get(h, 0)
        combined = pm / 37.5 * 50 + mq / 500 * 50
        level = (RiskLevel.safe if combined <= 30
                 else RiskLevel.moderate if combined <= 60
                 else RiskLevel.unhealthy)
        results.append(WorstHoursResponse(
            hour=h, avg_pm25=round(pm, 2), avg_co=round(mq, 2), risk_level=level))
    return results

# Suggestion S3: Weekly Summary Strip — last 7 days PM2.5 + illness search volume.
@router.get(
    "/weekly-summary",
    response_model=WeeklySummaryResponse,
    summary="S3: Weekly summary strip — 7-day PM2.5 and illness searches",
)
def s3_weekly_summary(conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    today = datetime.now().date()
    since = today - timedelta(days=6)

    ILLNESS_COLS = [
        "cough", "chest_tight", "wheeze", "allergy", "sore_throat",
        "itchy_throat", "stuffy_nose", "runny_nose", "headache",
        "dizziness", "nausea", "itchy_eyes",
    ]

    cursor.execute(
        """
        SELECT DATE(recorded_at) AS day_date, ROUND(AVG(pm2_5), 1) AS pm25_avg
        FROM pms7003_readings
        WHERE DATE(recorded_at) >= %s
        GROUP BY DATE(recorded_at)
        ORDER BY day_date
        """,
        (since,),
    )
    pm_by_day = {str(r["day_date"]): r["pm25_avg"] for r in cursor.fetchall()}

    ill_cols_sql = ", ".join(f"ROUND(AVG({c}), 2) AS {c}" for c in ILLNESS_COLS)
    cursor.execute(
        f"""
        SELECT DATE(timestamp) AS day_date, {ill_cols_sql}
        FROM google_trends
        WHERE DATE(timestamp) >= %s
        GROUP BY DATE(timestamp)
        ORDER BY day_date
        """,
        (since,),
    )
    trend_by_day = {str(r["day_date"]): r for r in cursor.fetchall()}
    cursor.close()

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    days_out = []
    for i in range(7):
        d = since + timedelta(days=i)
        ds = str(d)
        pm = _coerce_float(pm_by_day.get(ds))
        trend = trend_by_day.get(ds, {})
        ill_vals = [_coerce_float(trend.get(c)) for c in ILLNESS_COLS]
        present = [v for v in ill_vals if v is not None]
        searches = round(sum(present) / len(present), 1) if present else None
        days_out.append(WeeklySummaryDay(
            date=ds,
            day_name=day_names[d.weekday()],
            is_today=(d == today),
            pm25_avg=pm,
            searches=searches,
        ))

    return WeeklySummaryResponse(days=days_out)



# Visualization API 1: Time-series chart for PM2.5 or CO vs Google Trends sickness keywords over weeks.
@router.get(
    "/visualization/time-series",
    response_model=VisualizationTimeSeriesResponse,
    summary="Visualization 1: PM2.5 or CO vs illness keyword trends over weeks",
)
def visualization_time_series(
    days: int = Query(84, ge=1, le=365),
    interval: str = Query("daily", pattern="^(daily|weekly)$"),
    conn=Depends(get_db),
):
    """Daily or weekly PM2.5/MQ9 averages aligned with Google Trends illness keywords."""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)
    sensor_period = "DATE(recorded_at)" if interval == "daily" else "YEARWEEK(recorded_at, 3)"
    trend_period = "DATE(timestamp)" if interval == "daily" else "YEARWEEK(timestamp, 3)"

    cursor.execute(
        """
        SELECT MIN(first_seen) as first_sensor_at
        FROM (
            SELECT MIN(recorded_at) as first_seen
            FROM pms7003_readings
            WHERE recorded_at >= %s
            UNION ALL
            SELECT MIN(recorded_at) as first_seen
            FROM mq9_readings
            WHERE recorded_at >= %s
        ) sensor_start
        """,
        (since, since),
    )
    start_row = cursor.fetchone()
    aligned_since = start_row["first_sensor_at"] if start_row and start_row["first_sensor_at"] else since

    cursor.execute(
        f"""
        SELECT {sensor_period} as week_key,
               MIN(DATE(recorded_at)) as week_start,
               ROUND(AVG(pm2_5), 2) as avg_pm25,
               ROUND(AVG(pm10), 2) as avg_pm10
        FROM pms7003_readings
        WHERE recorded_at >= %s
        GROUP BY week_key
        ORDER BY week_key
        """,
        (aligned_since,),
    )
    pm_by_week = {str(r["week_key"]): r for r in cursor.fetchall()}

    cursor.execute(
        f"""
        SELECT {sensor_period} as week_key,
               MIN(DATE(recorded_at)) as week_start,
               ROUND(AVG(mq9_raw), 2) as avg_co
        FROM mq9_readings
        WHERE recorded_at >= %s
        GROUP BY week_key
        ORDER BY week_key
        """,
        (aligned_since,),
    )
    co_by_week = {str(r["week_key"]): r for r in cursor.fetchall()}

    cursor.execute(
        f"""
        SELECT {sensor_period} as week_key,
               MIN(DATE(recorded_at)) as week_start,
               ROUND(AVG(precipitation), 2) as avg_precipitation,
               CAST(ROUND(AVG(weather_code), 0) AS SIGNED) as weather_code
        FROM openmeteo_readings
        WHERE recorded_at >= %s
        GROUP BY week_key
        ORDER BY week_key
        """,
        (aligned_since,),
    )
    weather_by_week = {str(r["week_key"]): r for r in cursor.fetchall()}

    cursor.execute(
        f"""
        SELECT {trend_period} as week_key,
               MIN(DATE(timestamp)) as week_start,
               ROUND(AVG(cough), 2) as cough,
               ROUND(AVG(breathless), 2) as breathless,
               ROUND(AVG(chest_tight), 2) as chest_tight,
               ROUND(AVG(wheeze), 2) as wheeze,
               ROUND(AVG(headache), 2) as headache,
               ROUND(AVG(sore_throat), 2) as sore_throat,
               ROUND(AVG(itchy_throat), 2) as itchy_throat,
               ROUND(AVG(stuffy_nose), 2) as stuffy_nose,
               ROUND(AVG(runny_nose), 2) as runny_nose,
               ROUND(AVG(dizziness), 2) as dizziness,
               ROUND(AVG(nausea), 2) as nausea,
               ROUND(AVG(itchy_eyes), 2) as itchy_eyes,
               ROUND(AVG(allergy), 2) as allergy,
               ROUND(AVG(pm25), 2) as pm25_search
        FROM google_trends
        WHERE timestamp >= %s
        GROUP BY week_key
        ORDER BY week_key
        """,
        (aligned_since,),
    )
    trends_by_week = {str(r["week_key"]): r for r in cursor.fetchall()}
    cursor.close()

    sensor_weeks = set(pm_by_week) | set(co_by_week)
    all_weeks = sorted(sensor_weeks)
    pm25_trend = _get_trend([_coerce_float(row.get("avg_pm25")) or 0 for row in pm_by_week.values()])
    _avg_precipitation, _weather_code, weather_summary, weather_outlook = _weather_period_insight(conn, aligned_since, pm25_trend)
    rows = []
    keyword_fields = [
        "cough", "breathless", "chest_tight", "wheeze", "allergy", "sore_throat",
        "itchy_throat", "stuffy_nose", "runny_nose", "headache", "dizziness",
        "nausea", "itchy_eyes",
    ]

    for week in all_weeks:
        pm = pm_by_week.get(week, {})
        co = co_by_week.get(week, {})
        weather = weather_by_week.get(week, {})
        trend = trends_by_week.get(week, {})
        keyword_values = [_coerce_float(trend.get(field)) for field in keyword_fields]
        present_keywords = [value for value in keyword_values if value is not None]
        illness_index = (
            round(sum(present_keywords) / len(present_keywords), 2)
            if present_keywords
            else None
        )

        rows.append({
            "week": week,
            "week_start": pm.get("week_start") or co.get("week_start") or trend.get("week_start") or weather.get("week_start"),
            "avg_pm25": _coerce_float(pm.get("avg_pm25")),
            "avg_pm10": _coerce_float(pm.get("avg_pm10")),
            "avg_co": _coerce_float(co.get("avg_co")),
            "avg_precipitation": _coerce_float(weather.get("avg_precipitation")),
            "weather_code": weather.get("weather_code"),
            "cough": _coerce_float(trend.get("cough")),
            "breathless": _coerce_float(trend.get("breathless")),
            "chest_tight": _coerce_float(trend.get("chest_tight")),
            "wheeze": _coerce_float(trend.get("wheeze")),
            "headache": _coerce_float(trend.get("headache")),
            "sore_throat": _coerce_float(trend.get("sore_throat")),
            "itchy_throat": _coerce_float(trend.get("itchy_throat")),
            "stuffy_nose": _coerce_float(trend.get("stuffy_nose")),
            "runny_nose": _coerce_float(trend.get("runny_nose")),
            "dizziness": _coerce_float(trend.get("dizziness")),
            "nausea": _coerce_float(trend.get("nausea")),
            "itchy_eyes": _coerce_float(trend.get("itchy_eyes")),
            "allergy": _coerce_float(trend.get("allergy")),
            "pm25_search": _coerce_float(trend.get("pm25_search")),
            "illness_index": illness_index,
        })

    return VisualizationTimeSeriesResponse(
        visualization="time-series-pollution-vs-illness-keywords",
        period_days=days,
        interval=interval,
        weather_summary=weather_summary,
        weather_outlook=weather_outlook,
        count=len(rows),
        data=rows,
    )


# Visualization API 2: Correlation scatter plot for PM2.5 or CO/MQ9 vs Google Trends.
@router.get(
    "/visualization/correlation-scatter",
    response_model=VisualizationCorrelationScatterResponse,
    summary="Visualization 2: Correlation scatter plot with Pearson r and p-value",
)
def visualization_correlation_scatter(
    days: int = Query(14, ge=1, le=365),
    pollutant: str = Query("pm25", pattern="^(pm25|pm10|co)$"),
    keyword: str = Query("illness_index"),
    interval: str = Query("daily", pattern="^(daily|weekly)$"),
    conn=Depends(get_db),
):
    """Pair PM2.5 or MQ9 values with Google Trends health searches and test Pearson correlation."""
    pollutant_labels = {
        "pm25": "PM2.5",
        "pm10": "PM10",
        "co": "CO / MQ9 raw",
    }
    keyword_labels = {
        "illness_index": "Illness index",
        "cough": "Cough",
        "breathless": "Breathless",
        "chest_tight": "Chest tight",
        "wheeze": "Wheeze",
        "allergy": "Allergy",
        "sore_throat": "Sore throat",
        "itchy_throat": "Itchy throat",
        "stuffy_nose": "Stuffy nose",
        "runny_nose": "Runny nose",
        "headache": "Headache",
        "dizziness": "Dizziness",
        "nausea": "Nausea",
        "itchy_eyes": "Itchy eyes",
        "pm25_search": "PM2.5 search",
    }
    if keyword not in keyword_labels:
        raise HTTPException(status_code=400, detail=f"Unsupported Google Trends keyword: {keyword}")

    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)
    sensor_period = "DATE(recorded_at)" if interval == "daily" else "YEARWEEK(recorded_at, 3)"
    trend_period = "DATE(timestamp)" if interval == "daily" else "YEARWEEK(timestamp, 3)"

    if pollutant in {"pm25", "pm10"}:
        cursor.execute(
            "SELECT MIN(recorded_at) as first_sensor_at FROM pms7003_readings WHERE recorded_at >= %s",
            (since,),
        )
    else:
        cursor.execute(
            "SELECT MIN(recorded_at) as first_sensor_at FROM mq9_readings WHERE recorded_at >= %s",
            (since,),
        )
    start_row = cursor.fetchone()
    aligned_since = start_row["first_sensor_at"] if start_row and start_row["first_sensor_at"] else since

    if pollutant == "pm25":
        cursor.execute(
            f"""
            SELECT {sensor_period} as period,
                   MIN(DATE(recorded_at)) as period_start,
                   ROUND(AVG(pm2_5), 2) as pollutant_value
            FROM pms7003_readings
            WHERE recorded_at >= %s
            GROUP BY period
            ORDER BY period
            """,
            (aligned_since,),
        )
    elif pollutant == "pm10":
        cursor.execute(
            f"""
            SELECT {sensor_period} as period,
                   MIN(DATE(recorded_at)) as period_start,
                   ROUND(AVG(pm10), 2) as pollutant_value
            FROM pms7003_readings
            WHERE recorded_at >= %s
            GROUP BY period
            ORDER BY period
            """,
            (aligned_since,),
        )
    else:
        cursor.execute(
            f"""
            SELECT {sensor_period} as period,
                   MIN(DATE(recorded_at)) as period_start,
                   ROUND(AVG(mq9_raw), 2) as pollutant_value
            FROM mq9_readings
            WHERE recorded_at >= %s
            GROUP BY period
            ORDER BY period
            """,
            (aligned_since,),
        )
    pollutant_by_period = {str(r["period"]): r for r in cursor.fetchall()}

    cursor.execute(
        f"""
        SELECT {trend_period} as period,
               MIN(DATE(timestamp)) as period_start,
               ROUND(AVG(cough), 2) as cough,
               ROUND(AVG(breathless), 2) as breathless,
               ROUND(AVG(chest_tight), 2) as chest_tight,
               ROUND(AVG(wheeze), 2) as wheeze,
               ROUND(AVG(allergy), 2) as allergy,
               ROUND(AVG(sore_throat), 2) as sore_throat,
               ROUND(AVG(itchy_throat), 2) as itchy_throat,
               ROUND(AVG(stuffy_nose), 2) as stuffy_nose,
               ROUND(AVG(runny_nose), 2) as runny_nose,
               ROUND(AVG(headache), 2) as headache,
               ROUND(AVG(dizziness), 2) as dizziness,
               ROUND(AVG(nausea), 2) as nausea,
               ROUND(AVG(itchy_eyes), 2) as itchy_eyes,
               ROUND(AVG(pm25), 2) as pm25_search
        FROM google_trends
        WHERE timestamp >= %s
        GROUP BY period
        ORDER BY period
        """,
        (aligned_since,),
    )
    trends_by_period = {str(r["period"]): r for r in cursor.fetchall()}
    cursor.close()

    illness_fields = [
        "cough", "breathless", "chest_tight", "wheeze", "allergy", "sore_throat",
        "itchy_throat", "stuffy_nose", "runny_nose", "headache", "dizziness",
        "nausea", "itchy_eyes",
    ]
    rows = []
    x_values = []
    y_values = []

    for period in sorted(pollutant_by_period):
        pollutant_row = pollutant_by_period.get(period, {})
        trend = trends_by_period.get(period, {})
        if keyword == "illness_index":
            trend_values = [_coerce_float(trend.get(field)) for field in illness_fields]
            present_values = [value for value in trend_values if value is not None]
            search_volume = (
                round(sum(present_values) / len(present_values), 2)
                if present_values
                else None
            )
        else:
            search_volume = _coerce_float(trend.get(keyword))

        pollutant_value = _coerce_float(pollutant_row.get("pollutant_value"))
        if pollutant_value is not None and search_volume is not None:
            x_values.append(pollutant_value)
            y_values.append(search_volume)

        rows.append({
            "period": period,
            "period_start": pollutant_row.get("period_start") or trend.get("period_start"),
            "pollutant_value": pollutant_value,
            "search_volume": search_volume,
        })

    pearson_r = None
    p_value = None
    if len(x_values) >= 3 and len(set(x_values)) > 1 and len(set(y_values)) > 1:
        r = np.corrcoef(x_values, y_values)[0, 1]
        if not np.isnan(r):
            pearson_r = round(float(r), 3)
            df = len(x_values) - 2
            t_stat = abs(r) * math.sqrt(df / max(1 - (r * r), 1e-12))
            p = _student_t_two_tailed_p_value(t_stat, df)
            p_value = round(float(p), 5) if p is not None else None

    significant = bool(pearson_r is not None and p_value is not None and abs(pearson_r) >= 0.5 and p_value < 0.05)
    if pearson_r is None or p_value is None:
        interpretation = "Need at least 3 overlapping non-flat points to calculate Pearson r and p-value."
    elif significant:
        interpretation = f"Statistically meaningful relationship detected: r={pearson_r}, p={p_value}."
    elif abs(pearson_r) >= 0.5:
        interpretation = f"Correlation is visually strong (r={pearson_r}) but not statistically significant at p<0.05 (p={p_value})."
    else:
        interpretation = f"No strong statistically significant relationship in this window: r={pearson_r}, p={p_value}."

    return VisualizationCorrelationScatterResponse(
        visualization="correlation-scatter-pollution-vs-google-trends",
        pollutant=pollutant,
        pollutant_label=pollutant_labels[pollutant],
        keyword=keyword,
        keyword_label=keyword_labels[keyword],
        period_days=days,
        interval=interval,
        pearson_r=pearson_r,
        p_value=p_value,
        significant=significant,
        overlap_points=len(x_values),
        interpretation=interpretation,
        count=len(rows),
        data=rows,
    )


# Visualization API 3: Hourly heatmap of PM2.5 intensity by hour of day and day of week.
@router.get("/visualization/hourly-heatmap", response_model=HourlyHeatmapResponse,
            summary="V3: Hourly PM2.5 heatmap (hour × day-of-week)")
def v3_hourly_heatmap(days: int = Query(30, ge=7, le=90), conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    # DAYOFWEEK: 1=Sun…7=Sat → remap to 0=Mon…6=Sun
    cursor.execute(
        """SELECT
               MOD(DAYOFWEEK(recorded_at) + 5, 7) AS day,
               HOUR(recorded_at)                   AS hour,
               ROUND(AVG(pm2_5), 2)                AS avg_pm25,
               COUNT(*)                            AS cnt
           FROM pms7003_readings
           WHERE recorded_at >= %s
           GROUP BY day, hour
           ORDER BY day, hour""",
        (since,),
    )
    rows = cursor.fetchall()
    cursor.close()

    cells = [
        HourlyHeatmapCell(day=r["day"], hour=r["hour"], avg_pm25=r["avg_pm25"], count=r["cnt"])
        for r in rows
    ]

    all_vals = [c.avg_pm25 for c in cells if c.avg_pm25 is not None]
    overall_avg = round(sum(all_vals) / len(all_vals), 2) if all_vals else None

    # peak hour: hour with highest average across all days
    from collections import defaultdict
    hour_sums: dict = defaultdict(list)
    day_sums: dict = defaultdict(list)
    for c in cells:
        if c.avg_pm25 is not None:
            hour_sums[c.hour].append(c.avg_pm25)
            day_sums[c.day].append(c.avg_pm25)

    peak_hour = max(hour_sums, key=lambda h: sum(hour_sums[h]) / len(hour_sums[h])) if hour_sums else None
    worst_day = max(day_sums, key=lambda d: sum(day_sums[d]) / len(day_sums[d])) if day_sums else None

    return HourlyHeatmapResponse(
        visualization="hourly-heatmap-pm25",
        period_days=days,
        overall_avg=overall_avg,
        peak_hour=peak_hour,
        worst_day=worst_day,
        cells=cells,
    )


# Visualization API 4: Multi-pollutant radar comparing a selected day vs 7-day average.
@router.get("/visualization/radar-pollutant", response_model=RadarResponse,
            summary="V4: Multi-pollutant radar — selected day vs weekly average")
def v4_radar_pollutant(
    selected_date: Optional[date] = Query(None, alias="date", description="Day to inspect in YYYY-MM-DD format"),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    now = datetime.now()
    target_date = selected_date or now.date()
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)
    week_ago = day_start - timedelta(days=7)

    def avg(cursor, sql, params):
        cursor.execute(sql, params)
        row = cursor.fetchone()
        return float(list(row.values())[0]) if row and list(row.values())[0] is not None else None

    day_params = (day_start, day_end)
    week_params = (week_ago, day_start)

    # Selected day averages.
    pm25_today = avg(cursor, "SELECT AVG(pm2_5) FROM pms7003_readings WHERE recorded_at >= %s AND recorded_at < %s", day_params)
    co_today = avg(cursor, "SELECT AVG(mq9_raw) FROM mq9_readings WHERE recorded_at >= %s AND recorded_at < %s", day_params)
    temp_today = avg(cursor, "SELECT AVG(temperature) FROM ky015_readings WHERE recorded_at >= %s AND recorded_at < %s", day_params)
    hum_today = avg(cursor, "SELECT AVG(humidity) FROM ky015_readings WHERE recorded_at >= %s AND recorded_at < %s", day_params)
    wind_today = avg(cursor, "SELECT AVG(wind_speed_10m) FROM openmeteo_readings WHERE recorded_at >= %s AND recorded_at < %s", day_params)

    # Previous 7 complete days before the selected day.
    pm25_week = avg(cursor, "SELECT AVG(pm2_5) FROM pms7003_readings WHERE recorded_at >= %s AND recorded_at < %s", week_params)
    co_week = avg(cursor, "SELECT AVG(mq9_raw) FROM mq9_readings WHERE recorded_at >= %s AND recorded_at < %s", week_params)
    temp_week = avg(cursor, "SELECT AVG(temperature) FROM ky015_readings WHERE recorded_at >= %s AND recorded_at < %s", week_params)
    hum_week = avg(cursor, "SELECT AVG(humidity) FROM ky015_readings WHERE recorded_at >= %s AND recorded_at < %s", week_params)
    wind_week = avg(cursor, "SELECT AVG(wind_speed_10m) FROM openmeteo_readings WHERE recorded_at >= %s AND recorded_at < %s", week_params)
    cursor.close()

    # Reference max for normalization (domain-appropriate for Thai climate)
    axes_cfg = [
        ("pm25",  "PM2.5",       "µg/m³",  pm25_today,  pm25_week,  100.0),
        ("co",    "CO / MQ9",    "raw",     co_today,    co_week,    800.0),
        ("temp",  "Temperature", "°C",      temp_today,  temp_week,  45.0),
        ("hum",   "Humidity",    "%",       hum_today,   hum_week,   100.0),
        ("wind",  "Wind",        "km/h",    wind_today,  wind_week,  30.0),
    ]

    def norm(val, max_ref):
        if val is None or max_ref == 0:
            return None
        return round(min(val / max_ref, 1.0), 4)

    axes = [
        RadarAxis(
            key=key, label=label, unit=unit,
            today=round(t, 2) if t is not None else None,
            weekly_avg=round(w, 2) if w is not None else None,
            today_norm=norm(t, mx),
            weekly_norm=norm(w, mx),
            max_ref=mx,
        )
        for key, label, unit, t, w, mx in axes_cfg
    ]

    return RadarResponse(
        visualization="multi-pollutant-radar",
        snapshot_at=now,
        axes=axes,
    )


# Visualization API 5: Full NxN symmetric correlation matrix (sensors + selected keywords).
@router.get("/visualization/correlation-matrix", response_model=CorrelationMatrixResponse,
            summary="V5: Full symmetric correlation matrix")
def v5_correlation_matrix(
    days: int = Query(30, ge=7, le=365),
    keywords: str = Query("headache,cough,breathless,allergy", description="Comma-separated keyword keys"),
    conn=Depends(get_db),
):
    ILLNESS_FIELDS = [
        "cough", "breathless", "chest_tight", "wheeze", "allergy", "sore_throat",
        "itchy_throat", "stuffy_nose", "runny_nose", "headache", "dizziness",
        "nausea", "itchy_eyes",
    ]
    KEYWORD_LABELS = {
        "illness_index": "Illness idx", "cough": "Cough", "breathless": "Breathless",
        "chest_tight": "Chest tight", "wheeze": "Wheeze", "allergy": "Allergy",
        "sore_throat": "Sore throat", "itchy_throat": "Itchy throat",
        "stuffy_nose": "Stuffy nose", "runny_nose": "Runny nose", "headache": "Headache",
        "dizziness": "Dizziness", "nausea": "Nausea", "itchy_eyes": "Itchy eyes",
        "pm25_search": "PM2.5 search",
    }
    selected_kws = [k.strip() for k in keywords.split(",") if k.strip() in KEYWORD_LABELS]

    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    cursor.execute("""
        SELECT DATE(recorded_at) as period, ROUND(AVG(pm2_5), 2) as v
        FROM pms7003_readings WHERE recorded_at >= %s GROUP BY period""", (since,))
    pm25_ser = {str(r["period"]): r["v"] for r in cursor.fetchall()}

    cursor.execute("""
        SELECT DATE(recorded_at) as period, ROUND(AVG(pm10), 2) as v
        FROM pms7003_readings WHERE recorded_at >= %s GROUP BY period""", (since,))
    pm10_ser = {str(r["period"]): r["v"] for r in cursor.fetchall()}

    cursor.execute("""
        SELECT DATE(recorded_at) as period, ROUND(AVG(mq9_raw), 2) as v
        FROM mq9_readings WHERE recorded_at >= %s GROUP BY period""", (since,))
    co_ser = {str(r["period"]): r["v"] for r in cursor.fetchall()}

    cursor.execute("""
        SELECT DATE(recorded_at) as period,
               ROUND(AVG(temperature), 2) as temp, ROUND(AVG(humidity), 2) as humid
        FROM ky015_readings WHERE recorded_at >= %s GROUP BY period""", (since,))
    temp_ser, humid_ser = {}, {}
    for r in cursor.fetchall():
        temp_ser[str(r["period"])] = r["temp"]
        humid_ser[str(r["period"])] = r["humid"]

    cursor.execute("""
        SELECT DATE(timestamp) as period,
               ROUND(AVG(cough),2) as cough, ROUND(AVG(breathless),2) as breathless,
               ROUND(AVG(chest_tight),2) as chest_tight, ROUND(AVG(wheeze),2) as wheeze,
               ROUND(AVG(allergy),2) as allergy, ROUND(AVG(sore_throat),2) as sore_throat,
               ROUND(AVG(itchy_throat),2) as itchy_throat, ROUND(AVG(stuffy_nose),2) as stuffy_nose,
               ROUND(AVG(runny_nose),2) as runny_nose, ROUND(AVG(headache),2) as headache,
               ROUND(AVG(dizziness),2) as dizziness, ROUND(AVG(nausea),2) as nausea,
               ROUND(AVG(itchy_eyes),2) as itchy_eyes, ROUND(AVG(pm25),2) as pm25_search
        FROM google_trends WHERE timestamp >= %s GROUP BY period""", (since,))
    trends_ser = {str(r["period"]): r for r in cursor.fetchall()}
    cursor.close()

    all_periods = sorted(
        set(pm25_ser) | set(pm10_ser) | set(co_ser) | set(temp_ser) | set(humid_ser) | set(trends_ser)
    )

    # Pre-compute illness_index
    illness_idx_ser = {}
    for p in all_periods:
        t = trends_ser.get(p, {})
        vals = [_coerce_float(t.get(f)) for f in ILLNESS_FIELDS]
        present = [v for v in vals if v is not None]
        illness_idx_ser[p] = round(sum(present) / len(present), 2) if present else None

    def get_series(key):
        if key == "pm25":    return pm25_ser
        if key == "pm10":    return pm10_ser
        if key == "co":      return co_ser
        if key == "temp":    return temp_ser
        if key == "humid":   return humid_ser
        if key == "illness_index": return illness_idx_ser
        return {p: _coerce_float(trends_ser.get(p, {}).get(key)) for p in all_periods}

    SENSOR_VARS = [
        MatrixVariable(key="pm25",  label="PM2.5",    group="sensor"),
        MatrixVariable(key="pm10",  label="PM10",     group="sensor"),
        MatrixVariable(key="co",    label="CO / MQ9", group="sensor"),
        MatrixVariable(key="temp",  label="Temp",     group="sensor"),
        MatrixVariable(key="humid", label="Humid",    group="sensor"),
    ]
    kw_vars = [MatrixVariable(key=k, label=KEYWORD_LABELS[k], group="keyword") for k in selected_kws]
    variables = SENSOR_VARS + kw_vars
    var_keys = [v.key for v in variables]

    series_cache = {k: get_series(k) for k in var_keys}

    def pearson_cell(row_key, col_key):
        if row_key == col_key:
            return MatrixCell(row=row_key, col=col_key, r=1.0, p_value=0.0, significant=True, n=len(all_periods))
        sx, sy = series_cache[row_key], series_cache[col_key]
        x, y = [], []
        for p in all_periods:
            xv, yv = _coerce_float(sx.get(p)), _coerce_float(sy.get(p))
            if xv is not None and yv is not None:
                x.append(xv); y.append(yv)
        r = pv = None
        if len(x) >= 3 and len(set(x)) > 1 and len(set(y)) > 1:
            rv = np.corrcoef(x, y)[0, 1]
            if not np.isnan(rv):
                r = round(float(rv), 2)
                df = len(x) - 2
                t_stat = abs(rv) * math.sqrt(df / max(1 - rv ** 2, 1e-12))
                p_raw = _student_t_two_tailed_p_value(t_stat, df)
                pv = round(float(p_raw), 5) if p_raw is not None else None
        return MatrixCell(
            row=row_key, col=col_key, r=r, p_value=pv,
            significant=bool(r is not None and pv is not None and abs(r) >= 0.5 and pv < 0.05),
            n=len(x),
        )

    cells = [pearson_cell(r, c) for r in var_keys for c in var_keys]

    return CorrelationMatrixResponse(
        visualization="correlation-matrix",
        period_days=days,
        variables=variables,
        cells=cells,
    )


@router.get("/live-dashboard", response_model=LiveDashboardResponse,
            summary="Live dashboard bundle for the frontend")
def live_dashboard(hours: int = Query(24, ge=6, le=168), conn=Depends(get_db)):
    sensor = _latest_combined(conn)
    official = _get_official_pm25(conn)
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["pm10"], sensor["mq9_raw"], sensor["temperature"], sensor["humidity"], official
    )

    safety = SafetyResponse(
        timestamp=sensor["recorded_at"],
        status=level.value.upper(),
        risk_level=level,
        risk_score=score,
        recommendation=rec,
    )

    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)

    cursor.execute(
        "SELECT pm2_5, pm10 FROM pms7003_readings WHERE recorded_at >= %s ORDER BY recorded_at",
        (since,),
    )
    pm_rows = cursor.fetchall()
    pm_vals = [_coerce_float(r["pm2_5"]) or 0 for r in pm_rows]
    pm10_vals = [_coerce_float(r["pm10"]) or 0 for r in pm_rows]

    cursor.execute(
        "SELECT mq9_raw FROM mq9_readings WHERE recorded_at >= %s ORDER BY recorded_at",
        (since,),
    )
    mq_vals = [_coerce_float(r["mq9_raw"]) or 0 for r in cursor.fetchall()]

    cursor.execute(
        "SELECT temperature, humidity FROM ky015_readings WHERE recorded_at >= %s ORDER BY recorded_at",
        (since,),
    )
    ky_rows = cursor.fetchall()
    temp_vals = [_coerce_float(r["temperature"]) or 0 for r in ky_rows]
    hum_vals = [_coerce_float(r["humidity"]) or 0 for r in ky_rows]

    pt, p10t, ct = _get_trend(pm_vals), _get_trend(pm10_vals), _get_trend(mq_vals)
    tt, ht = _get_trend(temp_vals), _get_trend(hum_vals)
    avg_precipitation, weather_code, weather_summary, weather_outlook = _weather_period_insight(conn, since, pt)
    overall = (TrendDirection.worsening if "worsening" in (pt, p10t, ct)
               else TrendDirection.improving if "improving" in (pt, p10t, ct)
               else TrendDirection.stable)
    trend = TrendResponse(
        direction=overall,
        pm25_trend=pt,
        pm10_trend=p10t,
        co_trend=ct,
        temperature_trend=tt,
        humidity_trend=ht,
        summary=f"PM2.5 and PM10 are {overall.value} over the last {hours} hours.",
        weather_summary=weather_summary,
        weather_outlook=weather_outlook,
    )

    cursor.execute(
        """
        SELECT temperature_2m, relative_humidity_2m
        FROM openmeteo_readings
        ORDER BY recorded_at DESC
        LIMIT 1
        """
    )
    openmeteo = cursor.fetchone()
    cursor.close()

    pms_latest = _latest_table_timestamp(conn, "pms7003_readings")
    ky_latest = _latest_table_timestamp(conn, "ky015_readings")
    mq_latest = _latest_table_timestamp(conn, "mq9_readings")
    openmeteo_latest = _latest_table_timestamp(conn, "openmeteo_readings", "fetched_at")
    official_latest = _latest_table_timestamp(conn, "official_pm25", "fetched_at")
    trends_latest = _latest_table_timestamp(conn, "google_trends", "created_at")
    source_status = [
        LiveSourceStatus(
            source="PMS7003",
            latest_at=pms_latest,
            freshness_minutes=_freshness_minutes(pms_latest),
        ),
        LiveSourceStatus(
            source="KY-015",
            latest_at=ky_latest,
            freshness_minutes=_freshness_minutes(ky_latest),
        ),
        LiveSourceStatus(
            source="MQ-9",
            latest_at=mq_latest,
            freshness_minutes=_freshness_minutes(mq_latest),
        ),
        LiveSourceStatus(
            source="Open-Meteo",
            latest_at=openmeteo_latest,
            freshness_minutes=_freshness_minutes(openmeteo_latest),
        ),
        LiveSourceStatus(
            source="Official PM2.5",
            latest_at=official_latest,
            freshness_minutes=_freshness_minutes(official_latest),
        ),
        LiveSourceStatus(
            source="Google Trends",
            latest_at=trends_latest,
            freshness_minutes=_freshness_minutes(trends_latest),
        ),
    ]

    return LiveDashboardResponse(
        generated_at=datetime.now(),
        snapshot=LiveSnapshotResponse(
            recorded_at=sensor["recorded_at"],
            pm2_5=sensor["pm2_5"],
            pm10=sensor["pm10"],
            mq9_raw=sensor["mq9_raw"],
            temperature=sensor["temperature"],
            humidity=sensor["humidity"],
            official_pm25=official,
            openmeteo_temperature=_coerce_float(openmeteo["temperature_2m"]) if openmeteo else None,
            openmeteo_humidity=_coerce_float(openmeteo["relative_humidity_2m"]) if openmeteo else None,
        ),
        safety=safety,
        trend=trend,
        source_status=source_status,
    )


@router.get("/source-rows", response_model=SourceRowsResponse, summary="Paginated table rows by source")
def get_source_rows(
    source: str = Query(..., description="One of PMS7003, KY-015, MQ-9, Open-Meteo, Official PM2.5, Google Trends"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    conn=Depends(get_db),
):
    config = SOURCE_TABLE_CONFIG.get(source)
    if not config:
        raise HTTPException(status_code=400, detail=f"Unsupported source: {source}")

    offset = (page - 1) * page_size
    cursor = conn.cursor(dictionary=True)

    cursor.execute(f"SELECT COUNT(*) as total_rows FROM {config['table']}")
    total_rows = int(cursor.fetchone()["total_rows"])
    total_pages = max((total_rows + page_size - 1) // page_size, 1)

    cursor.execute(
        f"""
        SELECT {", ".join(config["columns"])}
        FROM {config["table"]}
        ORDER BY {config["order_by"]}
        LIMIT %s OFFSET %s
        """,
        (page_size, offset),
    )
    rows = [_serialize_row(row) for row in cursor.fetchall()]
    cursor.close()

    return SourceRowsResponse(
        source=source,
        page=page,
        page_size=page_size,
        total_rows=total_rows,
        total_pages=total_pages,
        columns=config["columns"],
        rows=rows,
    )


# Visualization API 6: Sensor validation — PMS7003 vs official PM2.5 station, RMSE & Pearson r.
@router.get(
    "/visualization/sensor-validation",
    response_model=SensorValidationResponse,
    summary="V6: Sensor validation — PMS7003 vs official reference station",
)
def v6_sensor_validation(
    days: int = Query(14, ge=7, le=90),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    cursor.execute(
        """
        SELECT DATE(recorded_at) AS period, ROUND(AVG(pm2_5), 2) AS sensor_pm25
        FROM pms7003_readings
        WHERE recorded_at >= %s
        GROUP BY DATE(recorded_at)
        ORDER BY period
        """,
        (since,),
    )
    sensor_by_day = {str(r["period"]): r["sensor_pm25"] for r in cursor.fetchall()}

    cursor.execute(
        """
        SELECT DATE(recorded_at) AS period,
               ROUND(AVG(pm25), 2) AS reference_pm25,
               MIN(station_name) AS station_name
        FROM official_pm25
        WHERE recorded_at >= %s
        GROUP BY DATE(recorded_at)
        ORDER BY period
        """,
        (since,),
    )
    ref_rows = cursor.fetchall()
    ref_by_day = {str(r["period"]): r["reference_pm25"] for r in ref_rows}
    station_name = ref_rows[0]["station_name"] if ref_rows else "N/A"

    all_dates = sorted(set(list(sensor_by_day.keys()) + list(ref_by_day.keys())))
    data = []
    pairs = []
    for d in all_dates:
        s = sensor_by_day.get(d)
        r = ref_by_day.get(d)
        data.append(SensorValidationPoint(period=d, sensor_pm25=s, reference_pm25=r))
        if s is not None and r is not None:
            pairs.append((float(s), float(r)))

    rmse = None
    correlation = None
    if pairs:
        rmse = round((sum((s - r) ** 2 for s, r in pairs) / len(pairs)) ** 0.5, 2)
        if len(pairs) >= 2:
            s_arr = np.array([p[0] for p in pairs])
            r_arr = np.array([p[1] for p in pairs])
            if s_arr.std() > 0 and r_arr.std() > 0:
                correlation = round(float(np.corrcoef(s_arr, r_arr)[0, 1]), 3)

    return SensorValidationResponse(
        visualization="sensor-validation",
        period_days=days,
        station_name=station_name,
        rmse=rmse,
        correlation=correlation,
        n_overlap=len(pairs),
        data=data,
    )


# Statistic 1: Sensor data descriptive statistics.
@router.get(
    "/statistic/sensor-descriptive",
    response_model=StatisticSensorDescriptiveResponse,
    summary="Statistic 1: Sensor data descriptive statistics — Average, SD, Max and Min",
)
def statistic_1_sensor_descriptive(
    hours: int = Query(168, description="Past N hours (168=7days)"),
    interval: str = Query("hourly", description="Fixed display interval label for the statistic card"),
    conn=Depends(get_db),
):
    """Statistic 1: descriptive statistics for sensor readings in the selected time range."""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)

    metric_queries = [
        ("pm25", "PM2.5", "µg/m³", "pms7003_readings", "pm2_5", "recorded_at"),
        ("temp", "Temp", "°C", "ky015_readings", "temperature", "recorded_at"),
        ("hum", "Humidity", "%", "ky015_readings", "humidity", "recorded_at"),
        ("co", "MQ9 raw", "", "mq9_readings", "mq9_raw", "recorded_at"),
    ]

    metrics = []
    period_start = None
    period_end = None
    for key, label, unit, table, column, time_col in metric_queries:
        cursor.execute(
            f"""
            SELECT
                COUNT({column}) AS count,
                ROUND(AVG({column}), 2) AS average,
                ROUND(STDDEV_SAMP({column}), 2) AS sd,
                ROUND(MAX({column}), 2) AS max,
                ROUND(MIN({column}), 2) AS min,
                MIN({time_col}) AS period_start,
                MAX({time_col}) AS period_end
            FROM {table}
            WHERE {time_col} >= %s
            """,
            (since,),
        )
        row = cursor.fetchone() or {}
        if row.get("period_start") and (period_start is None or row["period_start"] < period_start):
            period_start = row["period_start"]
        if row.get("period_end") and (period_end is None or row["period_end"] > period_end):
            period_end = row["period_end"]
        metrics.append(StatisticSensorMetricStats(
            key=key,
            label=label,
            unit=unit,
            count=int(row.get("count") or 0),
            average=_coerce_float(row.get("average")),
            sd=_coerce_float(row.get("sd")),
            max=_coerce_float(row.get("max")),
            min=_coerce_float(row.get("min")),
        ))

    cursor.close()
    return StatisticSensorDescriptiveResponse(
        statistic="sensor-data-descriptive",
        period_hours=hours,
        interval=interval,
        period_start=str(period_start) if period_start else None,
        period_end=str(period_end) if period_end else None,
        metrics=metrics,
    )


# Statistic 2: Air quality history line chart — multi-metric time series.
@router.get("/history", summary="Statistic 2: Air quality history line chart — PM2.5, temperature, humidity and MQ9 over time")
def statistic_2_history(
    hours: int = Query(168, description="Past N hours (168=7days)"),
    interval: str = Query("hourly", description="hourly or daily"),
    conn=Depends(get_db),
):
    """Statistic 2: line chart data for air quality changes over time."""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)
    grp_fmt = "%Y-%m-%d" if interval == "daily" else "%Y-%m-%d %H:00:00"

    cursor.execute(f"""
        SELECT DATE_FORMAT(recorded_at, '{grp_fmt}') as period,
               ROUND(AVG(pm2_5), 2) as avg_pm25,
               ROUND(AVG(pm10), 2) as avg_pm10
        FROM pms7003_readings WHERE recorded_at >= %s
        GROUP BY period ORDER BY period""", (since,))
    pm_data = {r["period"]: r for r in cursor.fetchall()}

    cursor.execute(f"""
        SELECT DATE_FORMAT(recorded_at, '{grp_fmt}') as period,
               ROUND(AVG(temperature), 1) as avg_temperature,
               ROUND(AVG(humidity), 1) as avg_humidity
        FROM ky015_readings WHERE recorded_at >= %s
        GROUP BY period ORDER BY period""", (since,))
    ky_data = {r["period"]: r for r in cursor.fetchall()}

    cursor.execute(f"""
        SELECT DATE_FORMAT(recorded_at, '{grp_fmt}') as period,
               ROUND(AVG(mq9_raw), 2) as avg_mq9
        FROM mq9_readings WHERE recorded_at >= %s
        GROUP BY period ORDER BY period""", (since,))
    mq_data = {r["period"]: r["avg_mq9"] for r in cursor.fetchall()}

    cursor.execute(f"""
        SELECT DATE_FORMAT(recorded_at, '{grp_fmt}') as period,
               ROUND(AVG(precipitation), 2) as avg_precipitation,
               CAST(ROUND(AVG(weather_code), 0) AS SIGNED) as weather_code
        FROM openmeteo_readings WHERE recorded_at >= %s
        GROUP BY period ORDER BY period""", (since,))
    weather_data = {r["period"]: r for r in cursor.fetchall()}
    cursor.close()

    pm25_vals = [_coerce_float(row.get("avg_pm25")) or 0 for row in pm_data.values()]
    pm25_trend = _get_trend(pm25_vals)
    avg_precipitation, weather_code, weather_summary, weather_outlook = _weather_period_insight(conn, since, pm25_trend)

    all_periods = sorted(set(pm_data) | set(ky_data) | set(mq_data) | set(weather_data))
    data = []
    for p in all_periods:
        ky = ky_data.get(p, {})
        pm = pm_data.get(p, {})
        weather = weather_data.get(p, {})
        data.append({
            "period": p,
            "avg_pm25": pm.get("avg_pm25"),
            "avg_pm10": pm.get("avg_pm10"),
            "avg_mq9_raw": mq_data.get(p),
            "avg_temperature": ky.get("avg_temperature"),
            "avg_humidity": ky.get("avg_humidity"),
            "avg_precipitation": weather.get("avg_precipitation"),
            "weather_code": weather.get("weather_code"),
        })
    return {
        "interval": interval,
        "count": len(data),
        "weather_summary": weather_summary,
        "weather_outlook": weather_outlook,
        "latest_weather_code": weather_code,
        "avg_precipitation": avg_precipitation,
        "data": data,
    }


# Statistic 3: Google Trends keyword search trends by date.
# Shows Google search terms as daily time-series points for the statistic tab.
@router.get(
    "/statistic/google-trends-keywords",
    response_model=StatisticGoogleTrendsResponse,
    summary="Statistic 3: Google Trends keyword search terms by date",
)
def statistic_3_google_trends_keywords(
    days: int = Query(30, ge=1, le=365, description="Past N days of Google Trends data"),
    conn=Depends(get_db),
):
    """Statistic 3: Google Trends search keyword time series by date."""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    daily_columns = []
    for key, _label, column in GOOGLE_TRENDS_KEYWORDS:
        daily_columns.append(f"ROUND(AVG({column}), 2) AS {key}")

    cursor.execute(
        f"""
        SELECT DATE(timestamp) AS period,
               COUNT(*) AS samples,
               {", ".join(daily_columns)}
        FROM google_trends
        WHERE timestamp >= %s
        GROUP BY DATE(timestamp)
        ORDER BY period
        """,
        (since,),
    )
    rows = cursor.fetchall()
    cursor.close()

    data = []
    for row in rows:
        data.append(StatisticGoogleTrendPoint(
            period=str(row["period"]),
            samples=int(row.get("samples") or 0),
            cough=_coerce_float(row.get("cough")),
            breathless=_coerce_float(row.get("breathless")),
            chest_tight=_coerce_float(row.get("chest_tight")),
            wheeze=_coerce_float(row.get("wheeze")),
            allergy=_coerce_float(row.get("allergy")),
            sore_throat=_coerce_float(row.get("sore_throat")),
            itchy_throat=_coerce_float(row.get("itchy_throat")),
            stuffy_nose=_coerce_float(row.get("stuffy_nose")),
            runny_nose=_coerce_float(row.get("runny_nose")),
            headache=_coerce_float(row.get("headache")),
            dizziness=_coerce_float(row.get("dizziness")),
            nausea=_coerce_float(row.get("nausea")),
            itchy_eyes=_coerce_float(row.get("itchy_eyes")),
            pm25_search=_coerce_float(row.get("pm25_search")),
        ))

    keywords = []
    for key, label, _column in GOOGLE_TRENDS_KEYWORDS:
        values = [getattr(point, key) for point in data if getattr(point, key) is not None]
        latest_point = next((point for point in reversed(data) if getattr(point, key) is not None), None)
        keywords.append(StatisticGoogleTrendKeyword(
            key=key,
            label=label,
            avg_search=round(sum(values) / len(values), 2) if values else None,
            max_search=max(values) if values else None,
            latest_search=getattr(latest_point, key) if latest_point else None,
            latest_at=None,
        ))

    keywords.sort(
        key=lambda item: (
            item.avg_search is not None,
            item.avg_search if item.avg_search is not None else -1,
        ),
        reverse=True,
    )

    return StatisticGoogleTrendsResponse(
        statistic="google-trends-keyword-search",
        period_days=days,
        sample_count=sum(point.samples for point in data),
        count=len(data),
        keywords=keywords,
        data=data,
    )


# Statistic 4: Wind speed from Open-Meteo secondary data.
@router.get(
    "/statistic/wind-speed",
    response_model=WindSpeedResponse,
    summary="Statistic 4: Wind speed statistics from Open-Meteo",
)
def statistic_4_wind_speed(
    hours: int = Query(168, ge=1, le=720, description="Past N hours"),
    interval: str = Query("hourly", description="hourly or daily"),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)
    grp_fmt = "%Y-%m-%d" if interval == "daily" else "%Y-%m-%d %H:00:00"

    cursor.execute(
        f"""
        SELECT
            DATE_FORMAT(recorded_at, '{grp_fmt}') AS period,
            ROUND(AVG(wind_speed_10m), 2)          AS avg_wind,
            COUNT(*)                                AS cnt,
            MIN(recorded_at)                        AS period_start,
            MAX(recorded_at)                        AS period_end
        FROM openmeteo_readings
        WHERE recorded_at >= %s AND wind_speed_10m IS NOT NULL
        GROUP BY period
        ORDER BY period
        """,
        (since,),
    )
    rows = cursor.fetchall()

    cursor.execute(
        """
        SELECT
            ROUND(AVG(wind_speed_10m), 2) AS avg_wind,
            ROUND(MAX(wind_speed_10m), 2) AS max_wind,
            ROUND(MIN(wind_speed_10m), 2) AS min_wind,
            COUNT(*)                       AS cnt,
            MIN(recorded_at)               AS period_start,
            MAX(recorded_at)               AS period_end
        FROM openmeteo_readings
        WHERE recorded_at >= %s AND wind_speed_10m IS NOT NULL
        """,
        (since,),
    )
    summary = cursor.fetchone() or {}
    cursor.close()

    data = [WindSpeedPoint(period=str(r["period"]), avg_wind=_coerce_float(r["avg_wind"])) for r in rows]

    return WindSpeedResponse(
        statistic="wind-speed",
        period_hours=hours,
        interval=interval,
        avg_wind=_coerce_float(summary.get("avg_wind")),
        max_wind=_coerce_float(summary.get("max_wind")),
        min_wind=_coerce_float(summary.get("min_wind")),
        count=int(summary.get("cnt") or 0),
        period_start=str(summary["period_start"]) if summary.get("period_start") else None,
        period_end=str(summary["period_end"]) if summary.get("period_end") else None,
        data=data,
    )


@router.get(
    "/forecast/pm25",
    response_model=PM25ForecastResponse,
    summary="PM2.5 forecast for the next 6 to 12 hours using current trend and weather context",
)
def forecast_pm25(
    lookahead_hours: int = Query(12, ge=6, le=12),
    base_hours: int = Query(12, ge=6, le=24),
    conn=Depends(get_db),
):
    sensor = _latest_combined(conn)
    since = datetime.now() - timedelta(hours=base_hours)
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT pm2_5, pm10, recorded_at
        FROM pms7003_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    pm_rows = cursor.fetchall()
    cursor.execute(
        """
        SELECT precipitation, weather_code, wind_speed_10m
        FROM openmeteo_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    weather_rows = cursor.fetchall()
    cursor.close()

    pm25_values = [_coerce_float(row.get("pm2_5")) or 0 for row in pm_rows]
    pm25_trend = _get_trend(pm25_values)
    sample_count = len(pm25_values)
    trend_delta_total = _trend_slope(pm25_values)
    hourly_trend_delta = (trend_delta_total / max(sample_count - 1, 1)) if sample_count > 1 else 0.0

    precip_values = [_coerce_float(row.get("precipitation")) for row in weather_rows if row.get("precipitation") is not None]
    wind_values = [_coerce_float(row.get("wind_speed_10m")) for row in weather_rows if row.get("wind_speed_10m") is not None]
    avg_precipitation = round(sum(precip_values) / len(precip_values), 2) if precip_values else None
    avg_wind_speed = round(sum(wind_values) / len(wind_values), 2) if wind_values else None
    weather_code = _dominant_weather_code([row.get("weather_code") for row in weather_rows])
    weather_adjustment_per_window = _forecast_weather_adjustment(avg_precipitation, weather_code, avg_wind_speed)
    summary, weather_outlook = _build_weather_pm25_insight(pm25_trend, avg_precipitation, weather_code)
    confidence = _forecast_confidence(sample_count, avg_wind_speed, avg_precipitation)

    points = []
    for hours_ahead in (6, lookahead_hours):
        trend_delta = round(hourly_trend_delta * hours_ahead, 2)
        weather_adjustment = round(weather_adjustment_per_window * (hours_ahead / 6), 2)
        predicted = max(round(sensor["pm2_5"] + trend_delta + weather_adjustment, 1), 0.0)
        if predicted <= 15:
            outlook = "Low PM2.5 range if current trend and weather continue."
        elif predicted <= 37.5:
            outlook = "Moderate PM2.5 range; sensitive groups should keep watching conditions."
        else:
            outlook = "Elevated PM2.5 risk; reduce exposure if this trajectory holds."
        points.append(PM25ForecastPoint(
            hours_ahead=hours_ahead,
            predicted_pm25=predicted,
            trend_delta=trend_delta,
            weather_adjustment=weather_adjustment,
            dominant_weather_code=weather_code,
            avg_precipitation=avg_precipitation,
            avg_wind_speed=avg_wind_speed,
            outlook=outlook,
        ))

    return PM25ForecastResponse(
        forecast="pm25-next-6-12h",
        generated_at=datetime.now(),
        based_on_hours=base_hours,
        current_pm25=round(sensor["pm2_5"], 1),
        current_pm10=round(sensor["pm10"], 1),
        pm25_trend=pm25_trend,
        dominant_weather_code=weather_code,
        avg_precipitation=avg_precipitation,
        avg_wind_speed=avg_wind_speed,
        confidence=confidence,
        summary=summary if weather_outlook == summary else f"{summary} {weather_outlook}",
        points=points,
    )


@router.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="Short-horizon forecast for PM2.5, temperature, or humidity using recent trend and weather context",
)
def forecast_metric(
    metric: str = Query("pm25", pattern="^(pm25|temperature|humidity)$"),
    lookahead_hours: int = Query(12, ge=6, le=12),
    base_hours: int = Query(12, ge=6, le=24),
    conn=Depends(get_db),
):
    sensor = _latest_combined(conn)
    since = datetime.now() - timedelta(hours=base_hours)
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT pm2_5, pm10, recorded_at
        FROM pms7003_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    pm_rows = cursor.fetchall()
    cursor.execute(
        """
        SELECT temperature, humidity, recorded_at
        FROM ky015_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    ky_rows = cursor.fetchall()
    cursor.execute(
        """
        SELECT precipitation, weather_code, wind_speed_10m
        FROM openmeteo_readings
        WHERE recorded_at >= %s
        ORDER BY recorded_at
        """,
        (since,),
    )
    weather_rows = cursor.fetchall()
    cursor.close()

    precip_values = [_coerce_float(row.get("precipitation")) for row in weather_rows if row.get("precipitation") is not None]
    wind_values = [_coerce_float(row.get("wind_speed_10m")) for row in weather_rows if row.get("wind_speed_10m") is not None]
    avg_precipitation = round(sum(precip_values) / len(precip_values), 2) if precip_values else None
    avg_wind_speed = round(sum(wind_values) / len(wind_values), 2) if wind_values else None
    weather_code = _dominant_weather_code([row.get("weather_code") for row in weather_rows])

    metric_config = {
        "pm25": {
            "label": "PM2.5",
            "unit": "ug/m3",
            "current_value": sensor["pm2_5"],
            "aux_value": sensor["pm10"],
            "values": [_coerce_float(row.get("pm2_5")) or 0 for row in pm_rows],
        },
        "temperature": {
            "label": "Temperature",
            "unit": "C",
            "current_value": sensor["temperature"],
            "aux_value": sensor["humidity"],
            "values": [_coerce_float(row.get("temperature")) or 0 for row in ky_rows],
        },
        "humidity": {
            "label": "Humidity",
            "unit": "%",
            "current_value": sensor["humidity"],
            "aux_value": sensor["temperature"],
            "values": [_coerce_float(row.get("humidity")) or 0 for row in ky_rows],
        },
    }
    config = metric_config[metric]
    values = config["values"]
    trend = _get_trend(values)
    sample_count = len(values)
    trend_delta_total = _trend_slope(values)
    hourly_trend_delta = (trend_delta_total / max(sample_count - 1, 1)) if sample_count > 1 else 0.0

    if metric == "pm25":
        weather_adjustment_per_window = _forecast_weather_adjustment(avg_precipitation, weather_code, avg_wind_speed)
        summary, weather_outlook = _build_weather_pm25_insight(trend, avg_precipitation, weather_code)
        summary = summary if weather_outlook == summary else f"{summary} {weather_outlook}"
    elif metric == "temperature":
        weather_adjustment_per_window = 0.0
        if avg_precipitation is not None:
            weather_adjustment_per_window -= min(avg_precipitation * 1.2, 3.0)
        if weather_code in RAINY_CODES:
            weather_adjustment_per_window -= 0.8
        if avg_wind_speed is not None and avg_wind_speed >= 10:
            weather_adjustment_per_window -= 0.6
        summary = _generic_weather_summary(config["label"], trend, avg_precipitation, weather_code, avg_wind_speed)
    else:
        weather_adjustment_per_window = 0.0
        if avg_precipitation is not None:
            weather_adjustment_per_window += min(avg_precipitation * 4.0, 10.0)
        if weather_code in RAINY_CODES:
            weather_adjustment_per_window += 2.0
        if avg_wind_speed is not None and avg_wind_speed >= 10:
            weather_adjustment_per_window -= 1.5
        summary = _generic_weather_summary(config["label"], trend, avg_precipitation, weather_code, avg_wind_speed)

    confidence = _forecast_confidence(sample_count, avg_wind_speed, avg_precipitation)

    points = []
    for hours_ahead in (6, lookahead_hours):
        trend_delta = round(hourly_trend_delta * hours_ahead, 2)
        weather_adjustment = round(weather_adjustment_per_window * (hours_ahead / 6), 2)
        predicted = round(config["current_value"] + trend_delta + weather_adjustment, 1)
        if metric in {"pm25", "humidity"}:
            predicted = max(predicted, 0.0)

        if metric == "pm25":
            if predicted <= 15:
                outlook = "Low PM2.5 range if this trajectory holds."
            elif predicted <= 37.5:
                outlook = "Moderate PM2.5 range; sensitive groups should keep monitoring."
            else:
                outlook = "Elevated PM2.5 risk remains likely in this horizon."
        elif metric == "temperature":
            outlook = "Warmer conditions likely." if predicted >= config["current_value"] else "Slight cooling likely."
        else:
            outlook = "Humidity may stay sticky." if predicted >= config["current_value"] else "Humidity may ease slightly."

        points.append(ForecastPoint(
            hours_ahead=hours_ahead,
            predicted_value=predicted,
            trend_delta=trend_delta,
            weather_adjustment=weather_adjustment,
            dominant_weather_code=weather_code,
            avg_precipitation=avg_precipitation,
            avg_wind_speed=avg_wind_speed,
            outlook=outlook,
        ))

    return ForecastResponse(
        forecast=f"{metric}-next-6-12h",
        metric=metric,
        label=config["label"],
        unit=config["unit"],
        generated_at=datetime.now(),
        based_on_hours=base_hours,
        current_value=round(config["current_value"], 1),
        current_aux_value=round(config["aux_value"], 1) if config["aux_value"] is not None else None,
        trend=trend,
        dominant_weather_code=weather_code,
        avg_precipitation=avg_precipitation,
        avg_wind_speed=avg_wind_speed,
        confidence=confidence,
        summary=summary,
        points=points,
    )

# API AI: Gemini chat assistant for PM2.5, cough, headache, and first-care guidance.
@router.post("/ai-chat", response_model=AIChatResponse, summary="AirHealth AI chat powered by Gemini")
def airhealth_ai_chat(payload: AIChatRequest, conn=Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured. Add it to the backend environment before using AI chat.",
        )

    primary_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
    fallback_models = [
        item.strip()
        for item in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-2.0-flash,gemini-2.5-flash-lite").split(",")
        if item.strip()
    ]
    models_to_try = list(dict.fromkeys([primary_model, *fallback_models]))
    snapshot = _ai_snapshot_context(conn)
    context_lines = [
        "Live AirHealth sensor context:",
        f"- PM2.5: {snapshot.get('pm2_5', 'unknown')} ug/m3",
        f"- PM10: {snapshot.get('pm10', 'unknown')} ug/m3",
        f"- MQ-9 raw: {snapshot.get('mq9_raw', 'unknown')}",
        f"- Temperature: {snapshot.get('temperature', 'unknown')} C",
        f"- Humidity: {snapshot.get('humidity', 'unknown')}%",
        f"- Official PM2.5: {snapshot.get('official_pm25', 'unknown')} ug/m3",
        f"- Risk level: {snapshot.get('risk_level', 'unknown')}",
        f"- Current recommendation: {snapshot.get('recommendation', 'unknown')}",
    ]

    contents = []
    for item in payload.history[-10:]:
        contents.append({
            "role": "model" if item.role == "assistant" else "user",
            "parts": [{"text": item.content}],
        })
    contents.append({
        "role": "user",
        "parts": [{"text": "\n".join(context_lines) + f"\n\nUser question: {payload.message}"}],
    })

    result = None
    used_model = models_to_try[0]
    last_error = "Gemini request failed"
    last_status = "network"

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        try:
            response = requests.post(
                url,
                params={"key": api_key},
                json={
                    "systemInstruction": {"parts": [{"text": AI_SYSTEM_INSTRUCTION.strip()}]},
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.35,
                        "topP": 0.9,
                        "maxOutputTokens": 800,
                    },
                },
                timeout=25,
            )
            response.raise_for_status()
            result = response.json()
            used_model = model
            break
        except requests.RequestException as exc:
            last_status = exc.response.status_code if exc.response is not None else "network"
            last_error = "Gemini request failed"
            try:
                error_payload = exc.response.json() if exc.response is not None else {}
                message = error_payload.get("error", {}).get("message")
                if message:
                    last_error = message
            except ValueError:
                pass

            if last_status not in (404, 429):
                break

    if result is None:
        if last_status == 429:
            raise HTTPException(
                status_code=429,
                detail="Gemini quota is currently unavailable for this project. Check AI Studio quota/billing or try again later.",
            )
        raise HTTPException(status_code=502, detail=f"Gemini request failed ({last_status}): {last_error}")

    parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    answer = "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
    if not answer:
        raise HTTPException(status_code=502, detail="Gemini returned an empty answer")

    return AIChatResponse(
        answer=answer,
        model=used_model,
        generated_at=datetime.now(),
        snapshot=snapshot or None,
    )
