# pytrends_fetch.py
import json, requests
from pytrends.request import TrendReq

print("Fetching data from Google Trends...")

pytrends = TrendReq(hl='th-TH', tz=420)
kw_list = [
    "ไอ", "หายใจลำบาก", "แน่นหน้าอก", "หอบ", "ภูมิแพ้",
    "เจ็บคอ", "คันคอ", "ปวดหัว", "เวียนหัว", "คลื่นไส้",
    "แสบตา", "คัดจมูก", "น้ำมูกไหล", "PM2.5"
]

results = {}
for i in range(0, len(kw_list), 5):
    batch = kw_list[i:i+5]
    print(f"Fetching batch {i//5 + 1}/3: {batch}")
    pytrends.build_payload(batch, timeframe='now 7-d', geo='TH-10')
    df = pytrends.interest_over_time()
    if not df.empty:
        df = df.drop(columns=['isPartial'])
        for col in batch:
            results[col] = df[col].to_dict()

if not results:
    print("ERROR: No data returned from Google Trends")
    exit(1)

timestamps = list(next(iter(results.values())).keys())
print(f"Success: {len(timestamps)} records fetched")

payload = []
for ts in timestamps:
    payload.append({
        "timestamp":    str(ts),
        "cough":        results.get("ไอ", {}).get(ts),
        "breathless":   results.get("หายใจลำบาก", {}).get(ts),
        "chest_tight":  results.get("แน่นหน้าอก", {}).get(ts),
        "wheeze":       results.get("หอบ", {}).get(ts),
        "allergy":      results.get("ภูมิแพ้", {}).get(ts),
        "sore_throat":  results.get("เจ็บคอ", {}).get(ts),
        "itchy_throat": results.get("คันคอ", {}).get(ts),
        "headache":     results.get("ปวดหัว", {}).get(ts),
        "dizziness":    results.get("เวียนหัว", {}).get(ts),
        "nausea":       results.get("คลื่นไส้", {}).get(ts),
        "itchy_eyes":   results.get("แสบตา", {}).get(ts),
        "stuffy_nose":  results.get("คัดจมูก", {}).get(ts),
        "runny_nose":   results.get("น้ำมูกไหล", {}).get(ts),
        "pm25":         results.get("PM2.5", {}).get(ts),
    })

print("Sending data to Node-RED...")
try:
    response = requests.post(
        "https://iot.cpe.ku.ac.th/red/b6710545563/trends",
        json=payload,
        timeout=10
    )
    if response.status_code == 200:
        print(f"Done! {len(payload)} records inserted successfully")
    else:
        print(f"Warning: Node-RED responded with status {response.status_code}")
except requests.exceptions.Timeout:
    print("ERROR: Timeout — Node-RED did not respond")
except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to Node-RED")