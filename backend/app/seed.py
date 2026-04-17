from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from math import cos, pi, sin


SEED_TABLES = [
    "google_trends",
    "openmeteo_readings",
    "official_pm25",
    "pms7003_readings",
    "mq9_readings",
    "ky015_readings",
]


@dataclass
class SeedResult:
    days: int
    clear_existing: bool
    inserted_rows: dict[str, int]
    latest_snapshot: dict[str, float | datetime]


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _round2(value: float) -> float:
    return round(value, 2)


def seed_test_data(conn, *, days: int = 7, clear_existing: bool = True) -> SeedResult:
    days = max(1, days)
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(days=days) + timedelta(hours=1)
    total_hours = days * 24

    pms_rows: list[tuple[float, float, datetime]] = []
    ky_rows: list[tuple[float, float, datetime]] = []
    mq_rows: list[tuple[float, datetime]] = []
    openmeteo_rows: list[tuple[str, float, float, float, float, float, int, float, datetime, datetime]] = []
    official_rows: list[tuple[str, str, float, float, float, float, str, datetime, datetime]] = []
    trend_rows: list[tuple] = []

    for index in range(total_hours):
        recorded_at = start + timedelta(hours=index)
        hour_angle = 2 * pi * (recorded_at.hour / 24)
        progress = index / max(total_hours - 1, 1)
        weekly_wave = sin(2 * pi * progress)
        weekly_cos = cos(2 * pi * progress)

        pm25 = _round2(_clamp(28 + 11 * sin(hour_angle - 0.6) + 7 * weekly_wave + (recorded_at.hour % 5), 8, 95))
        pm10 = _round2(_clamp(pm25 * 1.34 + 8 + 2 * cos(hour_angle), pm25 + 3, 150))
        temperature = _round2(_clamp(30 + 3.8 * sin(hour_angle - 1.2) + 1.6 * weekly_cos, 24, 39))
        humidity = _round2(_clamp(66 - 10 * sin(hour_angle - 1.2) + 6 * weekly_wave, 38, 92))
        mq9_raw = _round2(_clamp(255 + 85 * sin(hour_angle + 0.4) + 120 * weekly_wave + (pm25 - 25) * 3, 120, 980))

        openmeteo_temp = _round2(_clamp(temperature - 0.7 + 0.8 * cos(hour_angle / 2), 23, 38))
        openmeteo_humidity = _round2(_clamp(humidity + 2.5 * sin(hour_angle / 2), 35, 96))
        precipitation = _round2(max(0.0, 0.6 * weekly_cos - 0.15))
        weather_code = 61 if precipitation > 0.2 else 3 if humidity > 80 else 1
        wind_speed = _round2(_clamp(8 + 2.5 * cos(hour_angle) + 1.5 * weekly_wave, 2, 18))

        pms_rows.append((pm25, pm10, recorded_at))
        ky_rows.append((temperature, humidity, recorded_at))
        mq_rows.append((mq9_raw, recorded_at))
        openmeteo_rows.append((
            "openmeteo",
            13.8462,
            100.5690,
            openmeteo_temp,
            openmeteo_humidity,
            precipitation,
            weather_code,
            wind_speed,
            recorded_at,
            recorded_at,
        ))

        if recorded_at.hour % 6 == 0:
            official_rows.append((
                "seeded-openaq",
                "Kasetsart University",
                13.8462,
                100.5690,
                1.2,
                _round2(_clamp(pm25 + 3 + 2 * weekly_cos, 10, 110)),
                "ug/m3",
                recorded_at,
                recorded_at,
            ))

    for day_index in range(days):
        timestamp = (start + timedelta(days=day_index)).replace(hour=12)
        day_progress = day_index / max(days - 1, 1)
        weekly_wave = sin(2 * pi * day_progress)
        cough = int(round(_clamp(42 + 18 * weekly_wave + day_index * 1.4, 10, 100)))
        breathless = int(round(_clamp(24 + 12 * weekly_wave + day_index, 5, 100)))
        chest_tight = int(round(_clamp(18 + 10 * weekly_wave, 3, 90)))
        wheeze = int(round(_clamp(14 + 8 * weekly_wave, 2, 80)))
        allergy = int(round(_clamp(30 + 14 * cos(2 * pi * day_progress), 5, 100)))
        sore_throat = int(round(_clamp(28 + 11 * weekly_wave, 4, 100)))
        itchy_throat = int(round(_clamp(20 + 9 * weekly_wave, 3, 90)))
        stuffy_nose = int(round(_clamp(25 + 9 * cos(2 * pi * day_progress), 4, 100)))
        runny_nose = int(round(_clamp(23 + 8 * cos(2 * pi * day_progress + 0.6), 4, 100)))
        headache = int(round(_clamp(35 + 16 * weekly_wave + day_index * 1.1, 6, 100)))
        dizziness = int(round(_clamp(12 + 7 * weekly_wave, 1, 60)))
        nausea = int(round(_clamp(9 + 5 * weekly_wave, 1, 50)))
        itchy_eyes = int(round(_clamp(16 + 7 * cos(2 * pi * day_progress), 2, 70)))
        pm25_search = int(round(_clamp(26 + 18 * weekly_wave + day_index * 1.3, 5, 100)))

        trend_rows.append((
            timestamp,
            cough,
            breathless,
            chest_tight,
            wheeze,
            allergy,
            sore_throat,
            itchy_throat,
            stuffy_nose,
            runny_nose,
            headache,
            dizziness,
            nausea,
            itchy_eyes,
            pm25_search,
            "TH-10",
            timestamp,
        ))

    latest_pm25, latest_pm10, latest_at = pms_rows[-1]
    latest_temp, latest_humidity, _ = ky_rows[-1]
    latest_mq9, _ = mq_rows[-1]
    latest_official = official_rows[-1][5] if official_rows else latest_pm25
    latest_openmeteo_temp = openmeteo_rows[-1][3]
    latest_openmeteo_humidity = openmeteo_rows[-1][4]

    cursor = conn.cursor()
    try:
        if clear_existing:
            for table_name in SEED_TABLES:
                cursor.execute(f"DELETE FROM {table_name}")

        cursor.executemany(
            "INSERT INTO pms7003_readings (pm2_5, pm10, recorded_at) VALUES (%s, %s, %s)",
            pms_rows,
        )
        cursor.executemany(
            "INSERT INTO ky015_readings (temperature, humidity, recorded_at) VALUES (%s, %s, %s)",
            ky_rows,
        )
        cursor.executemany(
            "INSERT INTO mq9_readings (mq9_raw, recorded_at) VALUES (%s, %s)",
            mq_rows,
        )
        cursor.executemany(
            """
            INSERT INTO openmeteo_readings
            (source, lat, lon, temperature_2m, relative_humidity_2m, precipitation, weather_code, wind_speed_10m, recorded_at, fetched_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            openmeteo_rows,
        )
        if official_rows:
            cursor.executemany(
                """
                INSERT INTO official_pm25
                (source, station_name, lat, lon, distance_km, pm25, unit, recorded_at, fetched_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                official_rows,
            )
        cursor.executemany(
            """
            INSERT INTO google_trends
            (timestamp, cough, breathless, chest_tight, wheeze, allergy, sore_throat, itchy_throat, stuffy_nose, runny_nose,
             headache, dizziness, nausea, itchy_eyes, pm25, geo, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            trend_rows,
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()

    return SeedResult(
        days=days,
        clear_existing=clear_existing,
        inserted_rows={
            "pms7003_readings": len(pms_rows),
            "ky015_readings": len(ky_rows),
            "mq9_readings": len(mq_rows),
            "official_pm25": len(official_rows),
            "openmeteo_readings": len(openmeteo_rows),
            "google_trends": len(trend_rows),
        },
        latest_snapshot={
            "recorded_at": latest_at,
            "pm2_5": latest_pm25,
            "pm10": latest_pm10,
            "temperature": latest_temp,
            "humidity": latest_humidity,
            "mq9_raw": latest_mq9,
            "official_pm25": latest_official,
            "openmeteo_temperature": latest_openmeteo_temp,
            "openmeteo_humidity": latest_openmeteo_humidity,
        },
    )
