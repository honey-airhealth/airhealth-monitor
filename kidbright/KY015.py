from machine import Pin
import dht
import time
import network
from umqtt.robust import MQTTClient
import ujson
from config import WIFI_SSID, WIFI_PASS, MQTT_BROKER, MQTT_USER, MQTT_PASS

# Broad pin I1 
KY015_PIN = 32

MQTT_TOPIC = b"AirHealth/KY015"

sensor = dht.DHT11(Pin(KY015_PIN))

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting WiFi...")
        wlan.connect(WIFI_SSID, WIFI_PASS)
        while not wlan.isconnected():
            time.sleep(1)
    print("WiFi connected:", wlan.ifconfig())

def connect_mqtt():
    client = MQTTClient(
        client_id="AirHealth_KY015",
        server=MQTT_BROKER,
        user=MQTT_USER,
        password=MQTT_PASS
    )
    client.connect()
    print("MQTT connected")
    return client

def read_ky015():
    try:
        sensor.measure()
        temp = sensor.temperature()
        hum = sensor.humidity()

        return {
            "project_name": "AirHealth Monitor",
            "sensor_name": "KY015",
            "temperature": temp,
            "humidity": hum
        }
    except Exception as e:
        print("Read error:", e)
        return None

connect_wifi()
client = connect_mqtt()

while True:
    data = read_ky015()
    if data:
        msg = ujson.dumps(data)
        print(msg)
        client.publish(MQTT_TOPIC, msg)
        print("Published to AirHealth/KY015")
    else:
        print("no_data")

    client.ping()
    time.sleep(5)
