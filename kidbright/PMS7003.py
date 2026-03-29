from machine import UART, Pin
import time
import struct
import network
from umqtt.robust import MQTTClient
import ujson
from config import WIFI_SSID, WIFI_PASS, MQTT_BROKER, MQTT_USER, MQTT_PASS

uart = UART(1, baudrate=9600, tx=Pin(23), rx=Pin(19))
MQTT_TOPIC = b"AirHealth/PMS7003"

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
        client_id="AirHealth_PMS7003",
        server=MQTT_BROKER,
        user=MQTT_USER,
        password=MQTT_PASS
    )
    client.connect()
    print("MQTT connected")
    return client

def read_pms7003():
    timeout = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), timeout) < 2000:
        if uart.any():
            b1 = uart.read(1)
            if b1 == b'B':
                b2 = uart.read(1)
                if b2 == b'M':
                    time.sleep_ms(100)
                    data = uart.read(30)
                    if data is not None and len(data) == 30:
                        packet = b'BM' + data
                        try:
                            values = struct.unpack('>2sHHHHHHHHHHHHHBBH', packet)
                            return {
                                "project_name": "AirHealth Monitor",
                                "sensor_name": "PMS7003",
                                "pm2_5": values[6],
                                "pm10": values[7]
                            }
                        except Exception as e:
                            print("Unpack error:", e)
                            return None
    return None

connect_wifi()
client = connect_mqtt()

while True:
    data = read_pms7003()
    if data:
        msg = ujson.dumps(data)
        print(msg)
        client.publish(MQTT_TOPIC, msg)
        print("Published to AirHealth/PMS7003")
    else:
        print("no_data")
    client.ping()
    time.sleep(5)