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