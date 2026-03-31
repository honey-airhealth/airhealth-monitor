# pytrends_test.py — mock data ทดสอบ flow โดยไม่แตะ Google Trends
import json, requests
from datetime import datetime, timedelta

# สร้าง mock timestamps (7 วัน ทุก 1 ชั่วโมง)
timestamps = [
    (datetime.now() - timedelta(hours=i)).strftime('%Y-%m-%d %H:%M:%S')
    for i in range(168, 0, -1)
]

payload = []
for ts in timestamps:
    payload.append({
        "timestamp":   ts,
        "cough":       50,
        "breathless":  30,
        "chest_tight": 20,
        "wheeze":      15,
        "allergy":     60,
        "sore_throat": 40,
        "itchy_throat":35,
        "headache":    55,
        "dizziness":   25,
        "nausea":      10,
        "itchy_eyes":  45,
        "stuffy_nose": 70,
        "runny_nose":  65,
        "pm25":        80,
    })

response = requests.post(
    "https://iot.cpe.ku.ac.th/red/b6710545563/trends",
    json=payload
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")