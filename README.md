# AirHealth Monitor

**Turning Environmental Data into Meaningful Health Insights**

> Team 11 — Honey
> Karnpon POOCHITKANON · Thitirat SOMSUPANGSRI

---

## Overview

AirHealth Monitor is a smart data acquisition and analytics system that explores how air quality influences everyday health conditions. The system continuously collects environmental data from real-world sensors installed in locations such as dormitories, homes, or university buildings, then combines those readings with trusted public datasets to uncover patterns between air pollution, weather, and health-related concerns.

Rather than exposing raw numbers, AirHealth Monitor transforms sensor readings into understandable indicators, visual insights, and predictive information that ordinary users can easily interpret — bridging the gap between environmental sensing and personal well-being.

---

## Data Sources

### Primary — On-site Sensors

| Module   | Sensor Name                        | Qty | Measures |
|----------|------------------------------------|-----|----------|
| PMS7003  | PM2.5 Dust Sensor                  | 1×  | Fine particulate matter (PM2.5) concentration |
| KY-015   | Temperature & Humidity Sensor      | 1×  | Ambient temperature and relative humidity |
| MQ-2     | Smoke & Combustible Gas Sensor     | 1×  | Smoke, LPG, and combustible gases |
| MQ-9     | Carbon Monoxide (CO) Sensor        | 1×  | CO concentration from exhaust / incomplete combustion |
| —        | Automatic Timestamp Logger         | —   | Exact date and time of every reading |

### Secondary — External APIs

| Source              | Purpose |
|---------------------|---------|
| **Google Trends API** | Monitor search interest for health keywords in Thailand (headache, cough, difficulty breathing, PM2.5) |
| **IQAir / OpenAQ API** | Obtain nearby official PM2.5 / AQI measurements for comparison and validation |
| **Open-Meteo API**   | Provide supplementary weather data to support environmental interpretation |

---

## What the API Provides

The API delivers processed, health-relevant outputs rather than raw measurements.

### Key Questions Answered

- What is the **current health risk score** based on live PM2.5, CO, smoke, temperature, humidity, and official AQI data?
- Over the past **7 days**, how have PM2.5 and CO spikes related to illness-related search trends?
- What is the **predicted discomfort index** based on current environmental conditions?
- At what **times of day** does air quality become most concerning in a specific location?
- How do **local sensor readings compare** with official nearby air-quality reports?

### Output Formats

| Format | Description |
|--------|-------------|
| Real-time health risk indicator | Instant summary of current environmental risk level |
| Time-series charts | PM2.5 and CO readings plotted against health-search interest |
| Hourly / daily heatmaps | Most critical periods of poor air quality at a glance |
| Trend analysis dashboard | Long-term monitoring of environmental changes |
| Correlation graphs | Relationships among PM2.5, CO, smoke, humidity, temperature, and illness signals |
| Predictive summaries | Estimated discomfort or health-concern levels based on current trends |

---

## Project Goals

1. Make invisible air conditions **visible, meaningful, and actionable**.
2. Provide a continuous, multi-dimensional picture of local air quality.
3. Correlate environmental sensor data with real-world health signals from public sources.
4. Offer a foundation for future data-driven health and environmental applications.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Maintenance tasks |

**Example:**
```
feat: add PM2.5 real-time endpoint
fix: correct CO sensor calibration offset
docs: update API response format in README
```

---

## Team

| Name | Role |
|------|------|
| Karnpon POOCHITKANON | Team Member |
| Thitirat SOMSUPANGSRI | Team Member |

**Course:** Data Acquisition (DAQ) · Team 11 — Honey
