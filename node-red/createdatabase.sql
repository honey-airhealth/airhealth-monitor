DROP TABLE IF EXISTS pms7003_readings;
DROP TABLE IF EXISTS mq9_readings;
DROP TABLE IF EXISTS ky015_readings;

CREATE TABLE ky015_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE mq9_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mq9_raw DECIMAL(6,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pms7003_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pm2_5 DECIMAL(6,2) NOT NULL,
    pm10 DECIMAL(6,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE google_trends (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    timestamp       DATETIME NOT NULL,
    
    cough           INT,
    breathless      INT,
    chest_tight     INT,
    wheeze          INT,

    allergy         INT, 
    sore_throat     INT, 
    itchy_throat    INT,
    stuffy_nose     INT,
    runny_nose      INT,
    
    headache        INT,
    dizziness       INT,
    nausea          INT,
    itchy_eyes      INT,
    
    pm25            INT,

    geo             VARCHAR(10) DEFAULT 'TH-10',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);