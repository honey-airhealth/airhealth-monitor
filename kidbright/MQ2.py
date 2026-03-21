from machine import Pin, ADC
import time
import network
from umqtt.robust import MQTTClient
import ujson
from config import WIFI_SSID, WIFI_PASS, MQTT_BROKER, MQTT_USER, MQTT_PASS

# Board O1 
MQ2_PIN = 36

MQTT_TOPIC = b"AirHealth/MQ2"

adc = ADC(Pin(MQ2_PIN))
adc.atten(ADC.ATTN_11DB)   
adc.width(ADC.WIDTH_12BIT) 

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
        client_id="AirHealth_MQ2",
        server=MQTT_BROKER,
        user=MQTT_USER,
        password=MQTT_PASS
    )
    client.connect()
    print("MQTT connected")
    return client

def read_mq2(samples=10, delay_ms=100):
    total = 0
    for _ in range(samples):
        total += adc.read()
        time.sleep_ms(delay_ms)
    avg_value = total / samples

    return {
        "project_name": "AirHealth Monitor",
        "sensor_name": "MQ2",
        "mq2_raw": int(avg_value)
    }

connect_wifi()
client = connect_mqtt()

print("Warming up MQ-2...")
time.sleep(20)

while True:
    data = read_mq2()
    msg = ujson.dumps(data)
    print(msg)
    client.publish(MQTT_TOPIC, msg)
    print("Published to AirHealth/MQ2")
    client.ping()
    time.sleep(5)
