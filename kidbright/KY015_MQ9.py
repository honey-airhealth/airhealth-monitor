from machine import Pin, ADC
import dht
import time
import network
from umqtt.robust import MQTTClient
import ujson
from config import WIFI_SSID, WIFI_PASS, MQTT_BROKER, MQTT_USER, MQTT_PASS

# Pin setting
MQ9_PIN = 32
KY015_PIN = 33

# MQTT topics
MQTT_TOPIC_MQ9 = b"AirHealth/MQ9"
MQTT_TOPIC_KY015 = b"AirHealth/KY015"

# Sensor setup
adc = ADC(Pin(MQ9_PIN))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)

ky015_sensor = dht.DHT11(Pin(KY015_PIN))

# WiFi
wlan = network.WLAN(network.STA_IF)

def connect_wifi():
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting WiFi...")
        wlan.connect(WIFI_SSID, WIFI_PASS)
        while not wlan.isconnected():
            time.sleep(1)
    print("WiFi connected:", wlan.ifconfig())

def ensure_wifi():
    if not wlan.isconnected():
        print("WiFi lost, reconnecting...")
        connect_wifi()

# MQTT
def connect_mqtt():
    client = MQTTClient(
        client_id="AirHealth_AllSensor",
        server=MQTT_BROKER,
        user=MQTT_USER,
        password=MQTT_PASS,
        keepalive=60
    )
    client.connect()
    print("MQTT connected")
    return client

# Read MQ9
def read_mq9(samples=10, delay_ms=100):
    total = 0
    for _ in range(samples):
        total += adc.read()
        time.sleep_ms(delay_ms)

    avg_value = total / samples

    return {
        "project_name": "AirHealth Monitor",
        "sensor_name": "MQ9",
        "mq9_raw": int(avg_value)
    }

# Read KY015
def read_ky015():
    try:
        ky015_sensor.measure()
        temp = ky015_sensor.temperature()
        hum = ky015_sensor.humidity()

        if temp == 0 and hum == 0:
            time.sleep(2)
            ky015_sensor.measure()
            temp = ky015_sensor.temperature()
            hum = ky015_sensor.humidity()

        return {
            "project_name": "AirHealth Monitor",
            "sensor_name": "KY015",
            "temperature": temp,
            "humidity": hum
        }
    except Exception as e:
        print("KY015 read error:", e)
        return None

# Main
connect_wifi()

print("Warming up MQ-9...")
time.sleep(20)

INTERVAL = 15 * 60

while True:
    client = None
    try:
        ensure_wifi()

        print("----- New cycle -----")

        client = connect_mqtt()

        # MQ9
        mq9_data = read_mq9()
        mq9_msg = ujson.dumps(mq9_data)
        print("MQ9:", mq9_msg)
        client.publish(MQTT_TOPIC_MQ9, mq9_msg)
        print("Published to AirHealth/MQ9")

        time.sleep(2)

        # KY015
        ky015_data = read_ky015()
        if ky015_data:
            ky015_msg = ujson.dumps(ky015_data)
            print("KY015:", ky015_msg)
            client.publish(MQTT_TOPIC_KY015, ky015_msg)
            print("Published to AirHealth/KY015")
        else:
            print("KY015 no_data")

    except Exception as e:
        print("Cycle error:", e)

    finally:
        try:
            if client is not None:
                client.disconnect()
                print("MQTT disconnected")
        except:
            pass

    print("Sleep 15 minutes...")
    time.sleep(INTERVAL)
