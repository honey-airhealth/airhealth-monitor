from app.models import SensorReading


class InMemoryReadingStore:
    def __init__(self) -> None:
        self._readings: dict[str, SensorReading] = {}

    def upsert(self, reading: SensorReading) -> SensorReading:
        self._readings[reading.sensor_name] = reading
        return reading

    def latest(self) -> dict[str, SensorReading]:
        return dict(self._readings)


reading_store = InMemoryReadingStore()
