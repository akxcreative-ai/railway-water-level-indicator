// WLI MPU Firmware — STM32F103C8T6 (Blue Pill) + SIM800L GSM + NEO-6M GPS
// Railway IoT Water Level Indicator — POSTs to dashboard every 15 min (Clause 6.7)
//
// Libraries (Arduino IDE Library Manager):
//   - STM32duino (STM32 core), TinyGSM, TinyGPSPlus, ArduinoHttpClient
//
// Wiring:
//   SIM800L TX -> PA10 (Serial1 RX), SIM800L RX -> PA9 (Serial1 TX), buck 4.0V 2A supply
//   GPS TX -> PA3 (Serial2 RX), GPS RX -> PA2, 3.3V
//   Hydrostatic sensor signal -> PA0 (ADC). 4-20mA sensor ho to 165 ohm shunt se 0.66-3.3V banao.
//   STM32 USB serial = debug + USB bridge mode (neeche dekho)
//
// SERVER must be HTTP (SIM800L HTTPS nahi karta) aur mobile internet se reachable ho.
// Bench test ke liye: tools/usb_bridge.py use karo (laptop localhost par hi kaam karega).

#define TINY_GSM_MODEM_SIM800
#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>
#include <TinyGPSPlus.h>

// ---------- CONFIG: apne hisab se badlo ----------
#define APN_NAME      "airtelgprs.com"   // SIM ke hisab se: airtelgprs.com / jionet / www
#define SERVER_HOST   "YOUR-SERVER-IP"   // bina http:// ke, e.g. "103.21.55.10"
#define SERVER_PORT   4000
#define AUTH_TOKEN    "railway-wli-prototype-token-2026"  // server/.env wala token
#define DEVICE_ID     "WLI-009"          // dashboard me Coaches page par pehle REGISTER karo
#define MPU_ID        "MPU-009"
#define MAC_ID        "AA:BB:CC:DD:EE:09"
#define POST_INTERVAL_MS (15UL * 60UL * 1000UL)  // 15 min — RDSO Clause 6.7
#define SENSOR_PIN    PA0
// ADC calibration: 0% aur 100% tank par raw value note karke yahan dalo
#define ADC_EMPTY     400
#define ADC_FULL      3600
// --------------------------------------------------

HardwareSerial SerialGSM(PA10, PA9);  // RX, TX
HardwareSerial SerialGPS(PA3, PA2);   // RX, TX
TinyGPSPlus gps;
TinyGsm modem(SerialGSM);
TinyGsmClient gsmClient(modem);
HttpClient http(gsmClient, SERVER_HOST, SERVER_PORT);

int readWaterPercent() {
  long sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(SENSOR_PIN); delay(5); }
  int raw = sum / 16;  // 0..4095
  int pct = map(raw, ADC_EMPTY, ADC_FULL, 0, 100);
  return constrain(pct, 0, 100);
}

void readGps(unsigned long ms) {
  unsigned long start = millis();
  while (millis() - start < ms) {
    while (SerialGPS.available()) gps.encode(SerialGPS.read());
  }
}

void setup() {
  Serial.begin(115200);        // USB debug (bridge script isi ko padhega)
  SerialGSM.begin(9600);       // SIM800L
  SerialGPS.begin(9600);       // NEO-6M
  delay(3000);
  Serial.println("WLI MPU boot...");
  modem.restart();
  Serial.println(modem.getModemInfo());
  if (!modem.waitForNetwork()) Serial.println("GSM network wait fail");
  if (!modem.gprsConnect(APN_NAME, "", "")) Serial.println("GPRS connect fail");
  else Serial.println("GPRS connected");
}

void loop() {
  int level = readWaterPercent();
  readGps(30000);  // 30 sec GPS window (antenna ko khula aasmaan chahiye)

  float lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  float lng = gps.location.isValid() ? gps.location.lng() : 0.0;
  String gpsSt = gps.location.isValid() ? "FIXED" : "NO_FIX";

  // Battery: divider se actual pin par lagao; abhi placeholder
  int battPct = 85;
  float battV = 13.1;

  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"mpuId\":\"" + String(MPU_ID) + "\",";
  payload += "\"macId\":\"" + String(MAC_ID) + "\",";
  payload += "\"waterLevel\":" + String(level) + ",";
  payload += "\"batteryPercentage\":" + String(battPct) + ",";
  payload += "\"batteryVoltage\":" + String(battV, 1) + ",";
  payload += "\"latitude\":" + String(lat, 6) + ",";
  payload += "\"longitude\":" + String(lng, 6) + ",";
  payload += "\"network\":\"4G\",";   // SIM800L 2G hai — yahan "2G" likho agar wahi hai
  payload += "\"signalStrength\":" + String(modem.getSignalQuality()) + ",";
  payload += "\"sensorStatus\":\"OK\",";
  payload += "\"gpsStatus\":\"" + gpsSt + "\"";
  payload += "}";

  Serial.println(payload);  // USB bridge ke liye bhi print

  if (!modem.isGprsConnected() && !modem.gprsConnect(APN_NAME, "", "")) {
    Serial.println("GPRS reconnect fail, retry next cycle");
  } else {
    http.beginRequest();
    http.post("/api/device/data");
    http.sendHeader("Content-Type", "application/json");
    http.sendHeader("Authorization", String("Bearer ") + AUTH_TOKEN);
    http.sendHeader("Content-Length", payload.length());
    http.beginBody();
    http.print(payload);
    http.endRequest();
    int code = http.responseStatusCode();
    Serial.print("POST status: "); Serial.println(code);
    http.stop();
  }

  delay(POST_INTERVAL_MS);
}
