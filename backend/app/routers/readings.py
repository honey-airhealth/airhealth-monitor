from fastapi import APIRouter, status

from app.models import LatestReadingsResponse, SensorReading, SensorReadingIn
from app.store import reading_store


router = APIRouter(prefix="/readings", tags=["readings"])


@router.get("/latest", response_model=LatestReadingsResponse)
def get_latest_readings() -> LatestReadingsResponse:
    return LatestReadingsResponse(readings=reading_store.latest())


@router.post("", response_model=SensorReading, status_code=status.HTTP_201_CREATED)
def create_reading(payload: SensorReadingIn) -> SensorReading:
    reading = SensorReading(**payload.model_dump(exclude_none=True))
    return reading_store.upsert(reading)
