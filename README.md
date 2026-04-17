# AirHealth Monitor

![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React 18](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node-RED](https://img.shields.io/badge/Node--RED-flow-BB2222?style=for-the-badge&logo=nodered&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-enabled-660066?style=for-the-badge&logo=eclipsemosquitto&logoColor=white)

**Turning Environmental Data into Meaningful Health Insights**

> Team 11 — Honey
> · Karnpon POOCHITKANON · Thitirat SOMSUPANGSRI

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

- What is the **current health risk score** based on live PM2.5, CO, temperature, humidity, and official AQI data?
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
| Correlation graphs | Relationships among PM2.5, CO, humidity, temperature, and illness signals |
| Predictive summaries | Estimated discomfort or health-concern levels based on current trends |

---

## Run the Project

This project can be run in 3 common ways depending on what you want to test.

### Option 1: Run everything with Docker Compose

Use this if you want the local stack with frontend, backend, MySQL, and Node-RED.

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8000/health`
- Backend docs: `http://localhost:8000/docs`
- Node-RED: `http://localhost:1880`

### Seed 7 days of test data for Docker Compose

After the containers are running, seed sample data into MySQL:

```bash
curl -X POST "http://localhost:8000/api/v1/integration/seed-test-data?days=7&clear_existing=true"
```

### Option 2: Run backend only on your machine

Use this if you want to work on the FastAPI app directly without Docker.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### Seed 7 days of test data for local backend

If your backend can connect to MySQL through `.env`, you can seed data in 2 ways.

Using the script:

```bash
cd backend
python3 seed_mysql.py
```

Using the API:

```bash
curl -X POST "http://localhost:8000/api/v1/integration/seed-test-data?days=7&clear_existing=true"
```

### Option 3: Run frontend only on your machine

Use this if you want to work on the React app directly.

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL, usually `http://localhost:5173`.

If you want the frontend to call the backend, set the API base in your env file before starting it.

### Frontend and backend together without Docker

Run backend in one terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

### Current API routes

- `GET /health`
- `GET /api/v1/readings/latest`
- `POST /api/v1/readings`
- `POST /api/v1/integration/seed-test-data`
- `GET /api/v1/integration/health-risk`
- `GET /api/v1/integration/correlation`
- `GET /api/v1/integration/discomfort`
- `GET /api/v1/integration/worst-hours`
- `GET /api/v1/integration/main-contributor`
- `GET /api/v1/integration/history`
- `GET /api/v1/integration/compare-official`
- `GET /api/v1/integration/trend`
- `GET /api/v1/integration/safety`
- `GET /api/v1/integration/visualization/time-series`
- `GET /api/v1/integration/visualization/correlation-scatter`
- `GET /api/v1/integration/live-dashboard`
- `GET /api/v1/integration/source-rows`

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
| Karnpon POOCHITKANON | Team Member 🧑‍💻 |
| Thitirat SOMSUPANGSRI | Team Member 👩‍💻 |

**Course:** Data Acquisition (DAQ) · Team 11 — Honey
