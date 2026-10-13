// WLI MPU — Google Sheet (purana) + Railway Dashboard (NAYA - add kiya gaya)
// Board: STM32F103 (Blue Pill) + SIM GSM (Serial1) + GPS (SoftwareSerial PB7/PB6)
//
// DASHBOARD ADD wali lines "DASHBOARD:" comment se mark hain.
// Google Sheet wala pura flow same rakha hai — kuch hataya nahi.
//
// Dashboard par bhejne se PEHLE:
//   1. Coaches page par Device ID REGISTER karo (e.g. WLI-009)
//   2. Neeche SERVER_HOST / DASH_TOKEN / DEVICE_ID bharo
//   3. Server mobile-internet se reachable hona chahiye (public IP/cloud).
//      SIM800 HTTPS nahi karta, isliye dashboard URL http:// hai.

#include <Arduino.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

const int buttonPin = PA4;
const int outputPin = PA3;
const int analogPin = PA0;

int lastButtonState = HIGH;
int buttonState = HIGH;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

SoftwareSerial gpsSerial(PB7, PB6);
TinyGPSPlus gps;

const char scriptURL[] = "https://script.google.com/macros/s/AKfycbzos8XDEpcby0hYRvW6iBz_OSqeykjVGFhEikwo7Mip31BcO6j_gCAbrdTzo4Meixg/exec";

// ================= DASHBOARD: apna config yahan bharo =================
const char APN_NAME[]    = "airtelgprs.com";  // SIM ke hisab se: airtelgprs.com / jionet / www
const char SERVER_HOST[] = "103.21.55.10";  // tumhara server public IP (bina http:// ke)
const int  SERVER_PORT   = 4000;
const char DASH_TOKEN[]  = "railway-wli-prototype-token-2026";  // server/.env wala AUTH_TOKEN
const char DEVICE_ID[]   = "WLI-009";   // dashboard me pehle REGISTER karo
const char MPU_ID[]      = "MPU-009";
const char MAC_ID[]      = "AA:BB:CC:DD:EE:09";
// ADC calibration: khali tank aur full tank par analogRead value note karke dalo
const int ADC_EMPTY = 400;
const int ADC_FULL  = 3600;
const unsigned long DASH_PERIOD = 15UL * 60UL * 1000UL;  // 15 min — RDSO Clause 6.7
unsigned long lastDashSend = 0;
// =====================================================================

void drainSerial1(unsigned long ms) {
  unsigned long s = millis();
  while (millis() - s < ms) { while (Serial1.available()) Serial1.read(); }
}

// DASHBOARD: GPRS bearer kholo (Sheet HTTPS ke liye bhi zaroori hai)
void setupBearer() {
  Serial1.println("AT+SAPBR=3,1,\"Contype\",\"GPRS\"");
  delay(500);
  Serial1.print("AT+SAPBR=3,1,\"APN\",\"");
  Serial1.print(APN_NAME);
  Serial1.println("\"");
  delay(500);
  Serial1.println("AT+SAPBR=1,1");
  delay(3000);
  drainSerial1(500);
}

int readLevelPct() {
  int adcValue = analogRead(analogPin);
  int percentage = map(adcValue, ADC_EMPTY, ADC_FULL, 0, 100);
  return constrain(percentage, 0, 100);
}

// DASHBOARD: reading ko apne server par POST karo (token URL me, SIM800 header nahi de sakta)
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

  Serial1.println("AT+HTTPTERM");
  delay(500);
  drainSerial1(200);
  Serial1.println("AT+HTTPINIT");
  delay(800);
  Serial1.println("AT+HTTPPARA=\"CID\",1");
  delay(300);
  Serial1.print("AT+HTTPPARA=\"URL\",\"http://");
  Serial1.print(SERVER_HOST);
  Serial1.print(":");
  Serial1.print(SERVER_PORT);
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
  delay(6000);
  drainSerial1(1000);
  Serial1.println("AT+HTTPTERM");
  delay(500);
}

void sendDataToSheet(int state, double lat, double lon, int percentage) {
  Serial1.println("AT+HTTPSSL=1");
  delay(500);

  Serial1.println("AT+HTTPINIT");
  delay(1000);

  Serial1.println("AT+HTTPPARA=\"REDIRECTION\",1");
  delay(500);

  Serial1.print("AT+HTTPPARA=\"URL\",\"");
  Serial1.print(scriptURL);
  if (state == HIGH) {
    Serial1.print("?status=ON");
  } else {
    Serial1.print("?status=OFF");
  }
  Serial1.print("&lat=");
  Serial1.print(lat, 6);
  Serial1.print("&lon=");
  Serial1.print(lon, 6);
  Serial1.print("&percent=");
  Serial1.print(percentage);
  Serial1.println("\"");
  delay(1000);

  Serial1.println("AT+HTTPACTION=0");
  delay(4000);

  Serial1.println("AT+HTTPTERM");
  delay(500);
}

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(outputPin, OUTPUT);
  pinMode(analogPin, INPUT);
  digitalWrite(outputPin, LOW);

  analogReadResolution(12);

  Serial1.begin(115200);
  gpsSerial.begin(9600);
  delay(3000);

  setupBearer();  // DASHBOARD: GPRS bearer (pehle missing tha)
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  int reading = digitalRead(buttonPin);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      if (buttonState == LOW) {
        int currentStatus = digitalRead(outputPin);
        int newStatus;

        if (currentStatus == LOW) {
          newStatus = HIGH;
          digitalWrite(outputPin, HIGH);
        } else {
          newStatus = LOW;
          digitalWrite(outputPin, LOW);
        }

        double lat = 0.0, lon = 0.0;
        if (gps.location.isValid()) {
          lat = gps.location.lat();
          lon = gps.location.lng();
        }

        int percentage = readLevelPct();  // DASHBOARD: calibrated (pehle 0-4095 map tha)

        sendDataToSheet(newStatus, lat, lon, percentage);
        sendDataToDashboard(percentage, lat, lon);  // DASHBOARD: naya — Sheet ke saath dashboard par bhi
      }
    }
  }
  lastButtonState = reading;

  // DASHBOARD: naya — button dabaye bina har 15 min me dashboard par auto-send (Railway rule)
  if (millis() - lastDashSend > DASH_PERIOD) {
    lastDashSend = millis();
    double lat = 0.0, lon = 0.0;
    if (gps.location.isValid()) {
      lat = gps.location.lat();
      lon = gps.location.lng();
    }
    sendDataToDashboard(readLevelPct(), lat, lon);
  }
}
