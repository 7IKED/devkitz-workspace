"""
DkZ CoPilot — Pico Claw MicroPython
Flashe auf Raspberry Pi Pico mit MAX30102 Sensor.
Sendet Herzfrequenz-Daten via USB Serial an Desktop.
"""

from machine import SoftI2C, Pin
from max30102 import MAX30102
import time
import sys
import json

# === Konfiguration ===
SDA_PIN = 8
SCL_PIN = 9
I2C_FREQ = 400000
SAMPLE_RATE = 100  # Hz
REPORT_INTERVAL = 1  # Sekunden

# === I2C + Sensor Setup ===
i2c = SoftI2C(sda=Pin(SDA_PIN), scl=Pin(SCL_PIN), freq=I2C_FREQ)
sensor = MAX30102(i2c=i2c)
sensor.setup_sensor()

# Status LED (onboard)
led = Pin(25, Pin.OUT)
led.on()

print("DkZ Pico Claw — Herzschlag Sensor aktiv")
print("Format: red,ir")

# === Hauptschleife ===
sample_count = 0
last_report = time.ticks_ms()

while True:
    try:
        if sensor.check():
            red = sensor.pop_red_from_storage()
            ir = sensor.pop_ir_from_storage()

            if red > 0 and ir > 0:
                # Rohdaten senden (PC berechnet BPM/SpO2)
                print(f"{red},{ir}")
                sample_count += 1

            # LED blinken als Heartbeat
            if sample_count % 50 == 0:
                led.toggle()

        time.sleep_ms(10)

    except KeyboardInterrupt:
        led.off()
        print("Sensor gestoppt")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR:{e}")
        time.sleep(1)
