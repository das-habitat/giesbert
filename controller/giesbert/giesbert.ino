#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>

// ========== PIN CONFIGURATION ==========
#define MOISTURE_PIN A1
#define BATTERY_PIN A0
#define SENSOR_POWER_PIN D10

// ========== NETWORK SETTINGS ==========
#define PORTAL_TIMEOUT 120 // 120 = 2 minutes
#define AP_ID "giesbert"
#define DEVICE_NAME "Beispielpflanze" // --> CHANGE ME PLS <--
#define CHANNEL_REF "beispielkanal"   // --> CHANGE ME PLS <--
#define NOTIFICATION_API "https://giesbert.das-habitat.de/api/notifications?action=send"
#define TELEMETRY_API "https://giesbert.das-habitat.de/api/telemetry"

// ========== MEASUREMENT SETTINGS ==========
#define TIME_TO_SLEEP 3600 // 300 = 5 minutes, 3600 = 1 hour
#define uS_TO_S_FACTOR 1000000ULL
#define MAX_VALUES 24

RTC_DATA_ATTR int bootCount = 0;
RTC_DATA_ATTR int measureCount = 0;
RTC_DATA_ATTR int batteryValues[MAX_VALUES];
RTC_DATA_ATTR int moistureValues[MAX_VALUES];

void resetValues() {
  measureCount = 0;
  memset(moistureValues, 0, sizeof(moistureValues));
  memset(batteryValues, 0, sizeof(batteryValues));
}

// ========== MEASUREMENT FUNCTIONS ==========

float readBatteryVoltage() {
  // Dummy read then short delay to stabilize the measurement
  analogRead(BATTERY_PIN);
  delay(50);
  const int SAMPLES = 16;
  const int DIVIDER_RATIO = 2; // scale voltage down 1:2
  uint32_t Vbatt = 0;
  for (int i = 0; i < SAMPLES; i++) {
    Vbatt += analogReadMilliVolts(BATTERY_PIN);
  }
  return DIVIDER_RATIO * Vbatt / SAMPLES / 1000.0;
}

// Approximation of alkaline discharge curve (3xAAA, alkaline):
// * 4.8-4.5 = 100%
// * 4.2–4.4 = 80–100%
// * 3.6-4.2 = 20–80% (long flat nominal discharge)
// * 3.6–3.0 = 0-20% (fast drop)
int batteryVoltageToPercent(float voltage) {
  if (voltage >= 4.5) return 100;
  if (voltage <= 3.0) return 0;
  if (voltage > 4.2) return map(voltage * 100, 420, 450, 80, 100);
  if (voltage > 3.6) return map(voltage * 100, 360, 420, 20, 80);
  return map(voltage * 100, 300, 360, 0, 20);
}

float readMoistureVoltage() {
  // Dummy read then short delay to stabilize the measurement
  analogRead(MOISTURE_PIN);
  delay(50);
  const int SAMPLES = 16;
  uint32_t Vraw = 0;
  for (int i = 0; i < SAMPLES; i++) {
    Vraw += analogReadMilliVolts(MOISTURE_PIN);
  }
  return Vraw / SAMPLES / 1000.0;
}

float moistureVoltageToPercent(float voltage) {
  const float MIN_V = 0.5;
  const float MAX_V = 2.5;
  float percent = (MAX_V - voltage) / (MAX_V - MIN_V) * 100.0;
  return constrain(percent, 0.0, 100.0);
}

// ========== SYSTEM FUNCTIONS ==========

void shutdownAndSleep() {
  digitalWrite(SENSOR_POWER_PIN, LOW);
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(200);
  Serial.flush();
  Serial.end();
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  esp_deep_sleep_start();
}

void printWakeupReason() {
  esp_sleep_wakeup_cause_t reason = esp_sleep_get_wakeup_cause();
  switch (reason) {
    case ESP_SLEEP_WAKEUP_TIMER:
      Serial.println("Wakeup: Timer");
      break;
    default:
      Serial.printf("Wakeup not from timer: %d\n", reason);
      break;
  }
}

// ========== NETWORK FUNCTIONS ==========

void setupWiFi() {
  WiFi.mode(WIFI_STA); // station mode → ESP connects to a router like a client
  WiFi.begin();
  Serial.print("Connecting to WiFi");
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected: " + WiFi.localIP().toString());
    return;
  }
  // Start WiFiManager if connection could not be established
  // WiFi.mode switches to WIFI_AP → ESP creates its own network for the login portal
  Serial.println("WiFi failed. Starting WiFiManager...");
  WiFiManager wm;
  String apName = String(AP_ID) + " WifiManager";
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT);
  bool response = wm.autoConnect(apName.c_str()); // temporary network without password
  if (!response) {
    Serial.println("WiFiManager failed or timed out. Sleeping...");
    shutdownAndSleep();
  } else {
    Serial.println("WiFi connected via WiFiManager.");
    sendNotification("bibup bibup – Gerät erfolgreich eingerichtet.");
  }
}

void sendNotification(String message) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping notification.");
    return;
  }
  HTTPClient http;
  http.begin(NOTIFICATION_API);
  http.addHeader("Content-Type", "application/json");
  String json = "{";
  json += "\"channelRef\": \"" + String(CHANNEL_REF) + "\",";
  json += "\"title\": \"" + String(DEVICE_NAME) + " – Tagesbericht\",";
  json += "\"body\": \"" + String(message) + "\",";
  json += "\"author\": \"" + String(DEVICE_NAME) + "\"";
  json += "}";
  int httpResponseCode = http.POST(json);
  Serial.println("Notification response: " + String(httpResponseCode));
  http.end();
}

void sendTelemetry(float moisturePercent, int batteryPercent) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping telemetry.");
    return;
  }
  HTTPClient http;
  http.begin(TELEMETRY_API);
  http.addHeader("Content-Type", "application/json");
  String json = "{";
  json += "\"channelRef\": \"" + String(CHANNEL_REF) + "\",";
  json += "\"deviceName\": \"" + String(DEVICE_NAME) + "\",";
  json += "\"moisture\": " + String(moisturePercent, 1) + ",";
  json += "\"battery\": " + String(batteryPercent);
  json += "}";
  int httpResponseCode = http.POST(json);
  Serial.println("Telemetry response: " + String(httpResponseCode));
  http.end();
}

/** ========== MAIN ==========
 * Flow (runs once per wakeup, then sleeps):
 * 1. Every TIME_TO_SLEEP (1h): read moisture + battery, store in RTC arrays, connect to WiFi and send telemetry
 * 2. Every MAX_VALUES (24h): calculate daily avg, connect to WiFi and send push notification
 * 3. Go back to sleep
 */
void setup() {
  Serial.begin(115200);
  delay(1000);

  ++bootCount;
  Serial.println("Boot #" + String(bootCount));
  printWakeupReason();

  // Initialize pins
  pinMode(BATTERY_PIN, INPUT);
  pinMode(SENSOR_POWER_PIN, OUTPUT);
  pinMode(MOISTURE_PIN, INPUT);

  // Read moisture
  digitalWrite(SENSOR_POWER_PIN, HIGH);
  delay(200);
  float moistureVoltage = readMoistureVoltage();
  float moisturePercent = moistureVoltageToPercent(moistureVoltage);
  digitalWrite(SENSOR_POWER_PIN, LOW);
  Serial.println("Moisture: " + String(moisturePercent, 1) + "%");

  // Read battery
  float batteryVoltage = readBatteryVoltage();
  int batteryPercent = batteryVoltageToPercent(batteryVoltage);
  Serial.println("Battery: " + String(batteryVoltage, 2) + "V (" + String(batteryPercent) + "%)");

  // Store in RTC arrays
  moistureValues[measureCount] = (int)moisturePercent;
  batteryValues[measureCount] = batteryPercent;
  measureCount++;
  Serial.println("Measurement " + String(measureCount) + "/" + String(MAX_VALUES));
  
  // Initialize Wifi
  setupWiFi();

  // Send daily average (once MAX_VALUES readings are collected)
  if (measureCount >= MAX_VALUES) {
    long sumMoisture = 0, sumBattery = 0;
    for (int i = 0; i < MAX_VALUES; i++) {
      sumMoisture += moistureValues[i];
      sumBattery += batteryValues[i];
    }
    float avgMoisture = sumMoisture / (float)MAX_VALUES;
    int avgBattery = sumBattery / MAX_VALUES;
  
    Serial.println("Daily avg – Moisture: " + String(avgMoisture, 1) + "%, Battery: " + String(avgBattery) + "%");
    sendTelemetry(avgMoisture, avgBattery);

    // Optional: Only send notifications, if values reach a specific point, like (avgMoisture < 20 || avgBattery < 10)
    String msg = "bibup bibup – Bodenfeuchte: " + String(avgMoisture, 0) + "%, Akkustand: " + String(avgBattery) + "%";
    sendNotification(msg);

    resetValues();
  }

  shutdownAndSleep();
}

// loop() is never reached because setup() ends with esp_deep_sleep_start().
// On wakeup the chip resets and setup() runs again.
void loop() {}
