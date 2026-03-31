DROP TABLE IF EXISTS pms7003_readings;
DROP TABLE IF EXISTS mq2_readings;
DROP TABLE IF EXISTS mq9_readings;
DROP TABLE IF EXISTS ky015_readings;

CREATE TABLE pms7003_readings (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pm2_5       DECIMAL(5,2)    NOT NULL,
    pm10        DECIMAL(5,2)    NOT NULL,
    recorded_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recorded_at (recorded_at)
);

CREATE TABLE mq2_readings (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mq2_raw     DECIMAL(5,2)    NOT NULL,
    recorded_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recorded_at (recorded_at)
);

CREATE TABLE mq9_readings (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mq9_raw     DECIMAL(5,2)    NOT NULL,
    recorded_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recorded_at (recorded_at)
);

CREATE TABLE ky015_readings (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    temperature DECIMAL(5,2)    NOT NULL,
    humidity    DECIMAL(5,2)    NOT NULL,
    recorded_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recorded_at (recorded_at)
);

CREATE TABLE official_pm25 (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(20) NOT NULL DEFAULT 'openaq',
    station_name VARCHAR(255),
    lat DECIMAL(10,6),
    lon DECIMAL(10,6),
    distance_km DECIMAL(8,2),
    pm25 DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'ug/m3',
    recorded_at DATETIME NOT NULL,
    fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE openmeteo_readings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(20) NOT NULL DEFAULT 'openmeteo',
    lat DECIMAL(10,6),
    lon DECIMAL(10,6),
    temperature_2m DECIMAL(6,2),
    relative_humidity_2m DECIMAL(6,2),
    precipitation DECIMAL(6,2),
    weather_code INT,
    wind_speed_10m DECIMAL(6,2),
    recorded_at DATETIME NOT NULL,
    fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recorded_at (recorded_at)
);