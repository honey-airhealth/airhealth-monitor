from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.readings import router as readings_router
import os


default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

configured_origins = os.getenv("ALLOWED_ORIGINS")
allowed_origins = (
    [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    if configured_origins
    else default_origins
)


app = FastAPI(
    title="AirHealth Monitor API",
    version="0.1.0",
    description="Backend API for sensor ingestion and dashboard data access.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(readings_router, prefix="/api/v1")
