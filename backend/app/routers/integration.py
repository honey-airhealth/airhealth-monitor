"""
Data Integration Router — 9 Endpoints (Q1–Q9)

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
from datetime import datetime, timedelta
from typing import Optional
import math
import numpy as np

from app.store import get_db
from app.models import (
    HealthRiskResponse,
    CorrelationResponse,
    DiscomfortResponse,
    WorstHoursResponse,
    MainContributorResponse,
    CompareOfficialResponse,
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
    RiskLevel,
    TrendDirection,
)

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


def _calc_risk(pm25: float, mq9_raw: float, temp: float, humidity: float, official_pm25=None):
    """
    Health risk score 0–100.
    mq9_raw is analog (0–4095): ~100-200 clean, ~500 moderate, ~1000+ high.
    """
    # PM2.5 (0-40 pts)
    if pm25 <= 15:       p = 0
    elif pm25 <= 37.5:   p = (pm25 - 15) / 22.5 * 20
    elif pm25 <= 75:     p = 20 + (pm25 - 37.5) / 37.5 * 10
    else:                p = min(30 + (pm25 - 75) / 75 * 10, 40)
    if official_pm25 is not None and (pm25 + official_pm25) / 2 > pm25:
        p = min(p * 1.1, 40)

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

    total = min(round(p + c + h + hu, 1), 100)
    contribs = {"pm25": round(p, 1), "co": round(c, 1), "heat": round(h, 1), "humidity": round(hu, 1)}
    main = max(contribs, key=contribs.get)

    if total <= 25:
        level, rec = RiskLevel.safe, "Air quality is good. Safe for outdoor activities."
    elif total <= 55:
        level, rec = RiskLevel.moderate, "Moderate risk. Sensitive groups should limit outdoor activity."
    else:
        level, rec = RiskLevel.unhealthy, "Unhealthy. Avoid outdoor exercise. Wear a mask."

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


# Q1: Current Health Risk Score
@router.get("/health-risk", response_model=HealthRiskResponse,
            summary="Q1: What is the current health risk score right now?")
def q1_health_risk(timestamp: Optional[datetime] = Query(None), conn=Depends(get_db)):
    """What is your current health risk score?"""
    sensor = _combined_at(conn, timestamp)
    official = _get_official_pm25(conn, timestamp)
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["mq9_raw"],
        sensor["temperature"], sensor["humidity"], official)
    return HealthRiskResponse(
        timestamp=sensor["recorded_at"], risk_score=score, risk_level=level,
        main_contributor=main, contributions=contribs,
        recommendation=rec, official_pm25=official)


# Q2: Correlation
@router.get("/correlation", response_model=CorrelationResponse,
            summary="Q2: PM2.5 + CO vs illness search trends?")
def q2_correlation(days: int = Query(7, le=30), conn=Depends(get_db)):
    """How does PM2.5 + MQ9 correlate with illness search trends?"""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(days=days)

    # Daily avg PM2.5
    cursor.execute(
        """SELECT DATE(recorded_at) as day, AVG(pm2_5) as avg_pm25
           FROM pms7003_readings WHERE recorded_at >= %s
           GROUP BY DATE(recorded_at) ORDER BY day""", (since,))
    pm_daily = {str(r["day"]): float(r["avg_pm25"]) for r in cursor.fetchall()}

    # Daily avg MQ9
    cursor.execute(
        """SELECT DATE(recorded_at) as day, AVG(mq9_raw) as avg_mq9
           FROM mq9_readings WHERE recorded_at >= %s
           GROUP BY DATE(recorded_at) ORDER BY day""", (since,))
    mq_daily = {str(r["day"]): float(r["avg_mq9"]) for r in cursor.fetchall()}

    # Google Trends — columns are individual keywords, not rows
    cursor.execute(
        """SELECT DATE(timestamp) as day,
                  AVG(headache) as avg_headache,
                  AVG(cough) as avg_cough,
                  AVG(breathless) as avg_breathless,
                  AVG(pm25) as avg_pm25_search
           FROM google_trends WHERE timestamp >= %s
           GROUP BY DATE(timestamp) ORDER BY day""", (since,))
    trends_daily = {str(r["day"]): r for r in cursor.fetchall()}
    cursor.close()

    common_days = sorted(set(pm_daily.keys()) & set(mq_daily.keys()) & set(trends_daily.keys()))
    if len(common_days) < 3:
        return CorrelationResponse(period_days=days,
                                   interpretation=f"Found only {len(common_days)} overlapping day(s) within the last {days} days. Need at least 3 overlapping days to calculate a reliable correlation.")

    pm25_vals = [pm_daily[d] for d in common_days]
    mq9_vals = [mq_daily[d] for d in common_days]

    # Correlate: PM2.5 vs headache, PM2.5 vs cough, MQ9 vs breathless, PM2.5 vs pm25 search
    corrs: dict = {}
    mapping = [
        ("pm25_vs_headache",    pm25_vals, [float(trends_daily[d]["avg_headache"] or 0) for d in common_days]),
        ("pm25_vs_cough",       pm25_vals, [float(trends_daily[d]["avg_cough"] or 0) for d in common_days]),
        ("co_vs_breathing",     mq9_vals,  [float(trends_daily[d]["avg_breathless"] or 0) for d in common_days]),
        ("pm25_vs_pm25_search", pm25_vals, [float(trends_daily[d]["avg_pm25_search"] or 0) for d in common_days]),
    ]

    for field, src, trend_vals in mapping:
        if any(v != 0 for v in trend_vals):
            r = np.corrcoef(src, trend_vals)[0, 1]
            corrs[field] = round(float(r), 3) if not np.isnan(r) else None

    sig = [v for v in corrs.values() if v and abs(v) > 0.5]
    interp = (f"Found {len(sig)} significant correlation(s) (|r|>0.5) using the latest {len(common_days)} overlapping day(s) within the last {days} days."
              if sig else f"No strong correlations in the latest {len(common_days)} overlapping day(s) within the last {days} days. More data may help.")
    return CorrelationResponse(period_days=days, interpretation=interp, **corrs)


# Q3: Discomfort Index
@router.get("/discomfort", response_model=DiscomfortResponse,
            summary="Q3: Predicted discomfort index?")
def q3_discomfort(conn=Depends(get_db)):
    """What is your predicted discomfort index?"""
    sensor = _latest_combined(conn)
    temp, hum, pm = sensor["temperature"], sensor["humidity"], sensor["pm2_5"]

    hi = temp
    if temp >= 27 and hum >= 40:
        hi = (-8.785 + 1.611*temp + 2.339*hum - 0.146*temp*hum
              - 0.013*temp**2 - 0.016*hum**2 + 0.002*temp**2*hum
              + 0.001*temp*hum**2 - 0.000004*temp**2*hum**2)

    heat_c = min(max((hi - 25) / 30 * 50, 0), 50)
    pm_c = min(pm / 150 * 35, 35)
    hum_c = (min((hum - 70) / 30 * 15, 15) if hum > 70
             else min((30 - hum) / 30 * 10, 15) if hum < 30 else 0)
    idx = round(min(heat_c + pm_c + hum_c, 100), 1)

    if idx <= 25:   desc = "Comfortable — no concerns."
    elif idx <= 50: desc = "Mildly uncomfortable — stay hydrated."
    elif idx <= 75: desc = "Uncomfortable — limit outdoor exposure."
    else:           desc = "Very uncomfortable — stay indoors if possible."

    return DiscomfortResponse(
        timestamp=sensor["recorded_at"], discomfort_index=idx,
        heat_component=round(heat_c, 1), humidity_component=round(hum_c, 1),
        pm25_component=round(pm_c, 1), description=desc)


# Q4: Worst Hours
@router.get("/worst-hours", response_model=list[WorstHoursResponse],
            summary="Q4: Worst hours of day?")
def q4_worst_hours(days: int = Query(7, le=30), conn=Depends(get_db)):
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


# Q5: Main Contributor
@router.get("/main-contributor", response_model=MainContributorResponse,
            summary="Q5: Main risk contributor?")
def q5_main_contributor(timestamp: Optional[datetime] = Query(None), conn=Depends(get_db)):
    """What is the main risk contributor?"""
    sensor = _combined_at(conn, timestamp)
    official = _get_official_pm25(conn, timestamp)
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["mq9_raw"], sensor["temperature"], sensor["humidity"], official)
    return MainContributorResponse(
        timestamp=sensor["recorded_at"], main_contributor=main,
        pm25_contribution=contribs["pm25"], co_contribution=contribs["co"],
        heat_contribution=contribs["heat"], humidity_contribution=contribs["humidity"],
        total_risk=score)


# Q6: History
@router.get("/history", summary="Q6: Air quality over time?")
def q6_history(
    hours: int = Query(168, description="Past N hours (168=7days)"),
    interval: str = Query("hourly", description="hourly or daily"),
    conn=Depends(get_db),
):
    """How has air quality changed over time?"""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)
    grp_fmt = "%Y-%m-%d" if interval == "daily" else "%Y-%m-%d %H:00:00"

    cursor.execute(f"""
        SELECT DATE_FORMAT(recorded_at, '{grp_fmt}') as period,
               ROUND(AVG(pm2_5), 2) as avg_pm25
        FROM pms7003_readings WHERE recorded_at >= %s
        GROUP BY period ORDER BY period""", (since,))
    pm_data = {r["period"]: r["avg_pm25"] for r in cursor.fetchall()}

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
    cursor.close()

    all_periods = sorted(set(pm_data) | set(ky_data) | set(mq_data))
    data = []
    for p in all_periods:
        ky = ky_data.get(p, {})
        data.append({
            "period": p,
            "avg_pm25": pm_data.get(p),
            "avg_mq9_raw": mq_data.get(p),
            "avg_temperature": ky.get("avg_temperature"),
            "avg_humidity": ky.get("avg_humidity"),
        })
    return {"interval": interval, "count": len(data), "data": data}


# Q7: Local vs Official
@router.get("/compare-official", response_model=CompareOfficialResponse,
            summary="Q7: Local sensor vs official PM2.5?")
def q7_compare_official(conn=Depends(get_db)):
    """How does the local sensor compare to official PM2.5 reports?"""
    sensor = _latest_combined(conn)
    official = _get_official_pm25(conn)
    diff = round(sensor["pm2_5"] - official, 2) if official is not None else None
    return CompareOfficialResponse(
        timestamp=sensor["recorded_at"], local_pm25=sensor["pm2_5"],
        official_pm25=official, difference=diff)


# Q8: Trend
@router.get("/trend", response_model=TrendResponse,
            summary="Q8: Improving, stable, or worsening?")
def q8_trend(hours: int = Query(24), conn=Depends(get_db)):
    """How has air quality changed over time?"""
    cursor = conn.cursor(dictionary=True)
    since = datetime.now() - timedelta(hours=hours)

    cursor.execute("SELECT pm2_5 FROM pms7003_readings WHERE recorded_at >= %s ORDER BY recorded_at", (since,))
    pm_vals = [float(r["pm2_5"]) for r in cursor.fetchall()]

    cursor.execute("SELECT mq9_raw FROM mq9_readings WHERE recorded_at >= %s ORDER BY recorded_at", (since,))
    mq_vals = [float(r["mq9_raw"]) for r in cursor.fetchall()]

    cursor.execute("SELECT temperature, humidity FROM ky015_readings WHERE recorded_at >= %s ORDER BY recorded_at", (since,))
    ky_rows = cursor.fetchall()
    cursor.close()

    temp_vals = [float(r["temperature"]) for r in ky_rows]
    hum_vals = [float(r["humidity"]) for r in ky_rows]

    pt, ct = _get_trend(pm_vals), _get_trend(mq_vals)
    tt, ht = _get_trend(temp_vals), _get_trend(hum_vals)
    overall = (TrendDirection.worsening if "worsening" in (pt, ct)
               else TrendDirection.improving if "improving" in (pt, ct)
               else TrendDirection.stable)

    return TrendResponse(
        direction=overall, pm25_trend=pt, co_trend=ct,
        temperature_trend=tt, humidity_trend=ht,
        summary=f"Air quality is {overall.value} over past {hours}h. PM2.5: {pt.value}, MQ9: {ct.value}.")


# Q9: Safety
@router.get("/safety", response_model=SafetyResponse,
            summary="Q9: Safe for daily activity?")
def q9_safety(timestamp: Optional[datetime] = Query(None), conn=Depends(get_db)):
    """Is the current environment safe for daily activity?"""
    sensor = _combined_at(conn, timestamp)
    official = _get_official_pm25(conn, timestamp)
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["mq9_raw"], sensor["temperature"], sensor["humidity"], official)
    emoji = {"safe": "🟢", "moderate": "🟡", "unhealthy": "🔴"}
    return SafetyResponse(
        timestamp=sensor["recorded_at"],
        status=f"{emoji.get(level, '')} {level.value.upper()}",
        risk_level=level, risk_score=score, recommendation=rec)


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
               ROUND(AVG(pm2_5), 2) as avg_pm25
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
    rows = []
    keyword_fields = [
        "cough", "breathless", "chest_tight", "wheeze", "allergy", "sore_throat",
        "itchy_throat", "stuffy_nose", "runny_nose", "headache", "dizziness",
        "nausea", "itchy_eyes",
    ]

    for week in all_weeks:
        pm = pm_by_week.get(week, {})
        co = co_by_week.get(week, {})
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
            "week_start": pm.get("week_start") or co.get("week_start") or trend.get("week_start"),
            "avg_pm25": _coerce_float(pm.get("avg_pm25")),
            "avg_co": _coerce_float(co.get("avg_co")),
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
    pollutant: str = Query("pm25", pattern="^(pm25|co)$"),
    keyword: str = Query("illness_index"),
    interval: str = Query("daily", pattern="^(daily|weekly)$"),
    conn=Depends(get_db),
):
    """Pair PM2.5 or MQ9 values with Google Trends health searches and test Pearson correlation."""
    pollutant_labels = {
        "pm25": "PM2.5",
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

    if pollutant == "pm25":
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


@router.get("/live-dashboard", response_model=LiveDashboardResponse,
            summary="Live dashboard bundle for the frontend")
def live_dashboard(hours: int = Query(24, ge=6, le=168), conn=Depends(get_db)):
    sensor = _latest_combined(conn)
    official = _get_official_pm25(conn)
    pm_cursor = conn.cursor(dictionary=True)
    pm_cursor.execute("SELECT pm10 FROM pms7003_readings ORDER BY recorded_at DESC LIMIT 1")
    latest_pm_row = pm_cursor.fetchone()
    pm_cursor.close()
    score, level, main, contribs, rec = _calc_risk(
        sensor["pm2_5"], sensor["mq9_raw"], sensor["temperature"], sensor["humidity"], official
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
        "SELECT pm2_5 FROM pms7003_readings WHERE recorded_at >= %s ORDER BY recorded_at",
        (since,),
    )
    pm_vals = [_coerce_float(r["pm2_5"]) or 0 for r in cursor.fetchall()]

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

    pt, ct = _get_trend(pm_vals), _get_trend(mq_vals)
    tt, ht = _get_trend(temp_vals), _get_trend(hum_vals)
    overall = (TrendDirection.worsening if "worsening" in (pt, ct)
               else TrendDirection.improving if "improving" in (pt, ct)
               else TrendDirection.stable)
    trend = TrendResponse(
        direction=overall,
        pm25_trend=pt,
        co_trend=ct,
        temperature_trend=tt,
        humidity_trend=ht,
        summary=f"Air quality is {overall.value} over the last {hours} hours.",
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
            pm10=_coerce_float(latest_pm_row["pm10"]) if latest_pm_row else None,
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
