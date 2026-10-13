// WLI MPU — DASHBOARD ONLY (Google Sheet link nahi hai)
// Board: STM32F103 (Blue Pill) + SIM GSM (Serial1) + GPS (PB7/PB6) + Sensor (PA0)
//
// Kaam: Button dabao = turant dashboard par bhejo + LED toggle
//       Bina dabaye = har 15 min me auto dashboard par (RDSO Clause 6.7)
//
// PEHLE KARO:
//   1. Dashboard Coaches page par WLI-009 REGISTER karo
//   2. Neeche CONFIG me apna SERVER_HOST / APN check karo
//   3. Serial Monitor (USB, 115200) par "POST=200" dikhe = data pahunch gaya

#include <Arduino.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// ---------- PINS ----------
const int buttonPin = PA4;
const int outputPin = PA3;
const int analogPin = PA0;

// ---------- CONFIG ----------
const char APN_NAME[]    = "airtelgprs.com";  // SIM: airtelgprs.com / jionet / www
const char SERVER_HOST[] = "watch-landed-removed.ngrok-free.dev";  // tumhara ngrok (woh terminal band mat karna)
const int  SERVER_PORT   = 443;
const int  USE_HTTPS     = 1;  // tunnel https hai, isliye 1
const char DASH_TOKEN[]  = "railway-wli-prototype-token-2026";
const char DEVICE_ID[]   = "WLI-009";
const char MPU_ID[]      = "MPU-009";
const char MAC_ID[]      = "AA:BB:CC:DD:EE:09";
const int ADC_EMPTY = 400;    // khali tank ka analogRead value
const int ADC_FULL  = 3600;   // full tank ka analogRead value
const unsigned long DASH_PERIOD = 15UL * 60UL * 1000UL;  // 15 min
// ----------------------------

int lastButtonState = HIGH;
int buttonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;
unsigned long lastDashSend = 0;

SoftwareSerial gpsSerial(PB7, PB6);
TinyGPSPlus gps;

void drainSerial1(unsigned long ms) {
  unsigned long s = millis();
  while (millis() - s < ms) { while (Serial1.available()) Serial1.read(); }
}

// HTTPACTION ka reply ("+HTTPACTION: 1,200,123") padho, status code nikalo
int waitHttpResult(unsigned long timeoutMs) {
  String line = "";
  unsigned long s = millis();
  int code = -1;
  while (millis() - s < timeoutMs) {
    while (Serial1.available()) {
      char c = (char)Serial1.read();
      Serial.write(c);  // USB monitor par sab dikhao
      if (c == '\n') {
        int idx = line.indexOf("+HTTPACTION:");
        if (idx >= 0) {
          int c1 = line.indexOf(',', idx);
          int c2 = line.indexOf(',', c1 + 1);
          if (c1 > 0 && c2 > 0) code = line.substring(c1 + 1, c2).toInt();
        }
        line = "";
      } else if (c != '\r') {
        line += c;
      }
    }
    if (code > 0) break;
  }
  return code;  // 200 = OK | 601 = network error | 603 = DNS | 604 = stack busy | -1 = jawab nahi
}

bool setupBearer() {
  Serial.println("GPRS bearer khol raha...");
  Serial1.println("AT+SAPBR=3,1,\"Contype\",\"GPRS\"");
  delay(500);
  Serial1.print("AT+SAPBR=3,1,\"APN\",\"");
  Serial1.print(APN_NAME);
  Serial1.println("\"");
  delay(500);
  Serial1.println("AT+SAPBR=1,1");
  delay(4000);
  Serial1.println("AT+SAPBR=2,1");
  delay(1000);
  drainSerial1(500);
  Serial.println("Bearer setup done (upar IP dikha to OK)");
  return true;
}

int readLevelPct() {
  long sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(analogPin); delay(5); }
  int raw = sum / 16;
  Serial.print("ADC=");
  Serial.print(raw);
  int pct = map(raw, ADC_EMPTY, ADC_FULL, 0, 100);
  pct = constrain(pct, 0, 100);
  Serial.print(" LVL=");
  Serial.println(pct);
  return pct;
}

void sendDataToDashboard(int percentage, double lat, double lon) {
  char body[300];
  const char *gpsSt = (lat != 0.0 || lon != 0.0) ? "FIXED" : "NO_FIX";
  snprintf(body, sizeof(body),
    "{\"deviceId\":\"%s\",\"mpuId\":\"%s\",\"macId\":\"%s\","
    "\"waterLevel\":%d,\"batteryPercentage\":85,\"batteryVoltage\":13.1,"
    "\"latitude\":%.6f,\"longitude\":%.6f,"
    "\"network\":\"2G\",\"signalStrength\":75,"
    "\"sensorStatus\":\"OK\",\"gpsStatus\":\"%s\"}",
    DEVICE_ID, MPU_ID, MAC_ID, percentage, lat, lon, gpsSt);

  Serial.print("POST bhej raha LVL=");
  Serial.println(percentage);

  Serial1.println("AT+HTTPTERM");
  delay(500);
  drainSerial1(200);
  if (USE_HTTPS) { Serial1.println("AT+HTTPSSL=1"); delay(500); }
  Serial1.println("AT+HTTPINIT");
  delay(800);
  Serial1.println("AT+HTTPPARA=\"CID\",1");
  delay(300);
  Serial1.print("AT+HTTPPARA=\"URL\",\"");
  Serial1.print(USE_HTTPS ? "https://" : "http://");
  Serial1.print(SERVER_HOST);
  if (!USE_HTTPS || SERVER_PORT != 443) { Serial1.print(":"); Serial1.print(SERVER_PORT); }
  Serial1.print("/api/device/data?token=");
  Serial1.print(DASH_TOKEN);
  Serial1.println("\"");
  delay(800);
  Serial1.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(300);
  Serial1.print("AT+HTTPDATA=");
  Serial1.print(strlen(body));
  Serial1.println(",10000");
  delay(800);
  drainSerial1(200);
  Serial1.print(body);
  delay(1200);
  Serial1.println("AT+HTTPACTION=1");  // 1 = POST
  int code = waitHttpResult(15000);
  Serial.print("POST result=");
  Serial.println(code);  // 200 = pahunch gaya
  Serial1.println("AT+HTTPTERM");
  delay(500);
}

void getPos(double &lat, double &lon) {
  lat = 0.0; lon = 0.0;
  if (gps.location.isValid()) { lat = gps.location.lat(); lon = gps.location.lng(); }
}

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(outputPin, OUTPUT);
  pinMode(analogPin, INPUT);
  digitalWrite(outputPin, LOW);
  analogReadResolution(12);

  Serial.begin(115200);   // USB debug
  Serial1.begin(115200);  // GSM
  gpsSerial.begin(9600);  // GPS
  delay(3000);
  Serial.println("WLI Dashboard-Only boot");
  setupBearer();
}

void loop() {
  while (gpsSerial.available() > 0) { gps.encode(gpsSerial.read()); }

  int reading = digitalRead(buttonPin);
  if (reading != lastButtonState) { lastDebounceTime = millis(); }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {
        // LED toggle
        if (digitalRead(outputPin) == LOW) digitalWrite(outputPin, HIGH);
        else digitalWrite(outputPin, LOW);
        // turant bhejo
        double lat, lon;
        getPos(lat, lon);
        sendDataToDashboard(readLevelPct(), lat, lon);
      }
    }
  }
  lastButtonState = reading;

  // har 15 min auto-send
  if (millis() - lastDashSend > DASH_PERIOD) {
    lastDashSend = millis();
    double lat, lon;
    getPos(lat, lon);
    sendDataToDashboard(readLevelPct(), lat, lon);
  }
}
