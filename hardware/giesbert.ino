#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>

// ========== DOCUMENTATION ==========
// 1. https://github.com/vektorious/hpi_smart_plants
// 2. https://wiki.seeedstudio.com/xiao_esp32c6_getting_started

// ========== PIN CONFIGURATION ==========
#define MOISTURE_PIN A1;
#define BATTERY_PIN A0;
#define SENSOR_POWER_PIN D10;

// ========== MEASUREMENT SETTINGS ==========
#define TIME_TO_SLEEP 3600 // 300 = 5 minutes, 3600 = 1 hour
#define uS_TO_S_FACTOR 1000000ULL
RTC_DATA_ATTR int bootCount = 0;

// ========== DEVICE SETTINGS ==========
#define DEVICE_NAME "Pflanze001";
#define AP_ID "Pflanze001";
#define DEVICE_UUID "b3e839ee"; // first 8 symbols by https://www.uuidgenerator.net/version4
#define PORTAL_TIMEOUT 120; // 120 = 2 minutes

// ========== API SETTINGS ==========
// Push Notifications (optional)
#define PUSH_API "https://giesbert.das-habitat.de/api/notifications?action=send";
#define USER_REF "changemepls@mail.de";
#define CHANNEL_REF "changemepls";

// ========== FUNCTIONS ==========
#define MAX_VALUES 24
RTC_DATA_ATTR int batteryValues[MAX_VALUES];
RTC_DATA_ATTR int moistureValues[MAX_VALUES];
RTC_DATA_ATTR int measureCount = 0;

void resetValues() {
  measureCount = 0;
  memset(moistureValues, 0, sizeof(moistureValues));
  memset(batteryValues, 0, sizeof(batteryValues));
}

void shutdownAndSleep() {
  digitalWrite(sensorPowerPin, LOW);
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

float readBatteryVoltage() {
  // Doing dummy reads, then a short delay to stabilizes the measurement
  analogRead(batteryPin);
  delay(50);
  uint32_t Vbatt = 0;
  // contanten nach oben + define
  const int SAMPLES = 16;
  const int DIVIDER_RATIO = 2; // scale voltage down 1:2
  // Read and accumulate ADC voltage
  for (int i = 0; i < SAMPLES; i++) {
    uint32_t voltage = analogReadMilliVolts(batteryPin);
    Vbatt += voltage;
  }
  return DIVIDER_RATIO * Vbatt / SAMPLES / 1000.0;
}

// Approximation of alkaline discharge curve (3xAAA, alkaline):
// * 4.8-4.5 = 100%
// * 4.2–4.4 = 80–100%
// * 3.6-4.2 = 20–80% (long flat nominal discharge)
// * 3.6–3.0 = 0-20% (fast drop)
int batteryVoltageToPercent(float voltage) {
  // Clamp extreme values
  if (voltage >= 4.5) return 100;
  if (voltage <= 3.0) return 0;
  if (voltage > 4.2) return map(voltage * 100, 450, 480, 80, 100); 
  if (voltage > 3.6) return map(voltage * 100, 360, 420, 20, 80);
  return map(voltage * 100, 300, 360, 0, 20);
}

float readMoistureVoltage() {
  // short delay, stabilizes the measurement
  delay(50);
  uint32_t Vraw = 0;
  const int SAMPLES = 16;
  // Read and accumulate capacity
  for (int i = 0; i < SAMPLES; i++) {
    Vraw += analogReadMilliVolts(moisturePin);
  }
  return Vraw / SAMPLES / 1000.0;
}

float moistureVoltageToPercent(float voltage) {
  const float MIN_V = 0.5;
  const float MAX_V = 2.5;
  float percent = (MAX_V - voltage) / (MAX_V - MIN_V) * 100.0;
  return constrain(percent, 0.0, 100.0);
}

void setupWiFi() {
  // Try to connect to Wifi
  WiFi.mode(WIFI_STA); // station mode -> ESP connects to a router like a client
  WiFi.begin();
  Serial.print("Connecting to Wifi");
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wifi connected: " + WiFi.localIP().toString());
    return;
  }
  // Start Wifi-Manager if connection could not be established
  // WiFi.mode switches to WIFI_AP (Access Point) → ESP creates its own network for wifi-login portal
  Serial.println("Wifi failed. Starting WiFiManager...");
  WiFiManager wm;
  String apName = "WifiManager-" + String(apID); // Name of the wifi network
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT);
  bool response = wm.autoConnect(apName.c_str()); // temporary network without password
  if (!response) {
    Serial.println("WiFiManager failed or timed out. Sleeping...");
    shutdownAndSleep();
  }
  else {
    Serial.println("Wifi connected... yeey :)");
    sendNotification("bibup bibup – Gerät erfolgreich eingerichtet ...yeey :)");
  }
}

// Push Notifications (optional)
// Requires that the user has installed the P15Ns PWA: https://notifications.digimunea.de
void sendNotification(String message) {
    if (WiFi.status() == WL_CONNECTED) { 
        HTTPClient http;
        http.begin(pushApi);
        http.addHeader("Content-Type", "application/json");
        String json = "{";
        json += "\"userRef\": \"" + String(userRef) + "\",";
        json += "\"channelRef\": \"" + String(channelRef) + "\",";
        json += "\"title\": \"" + String(deviceName) + "\",";
        json += "\"body\": \"" + String(message) + "\"";
        json += "}";
        int httpResponseCode = http.POST(json);
        Serial.println("Response: " + String(httpResponseCode));        
        Serial.println("Payload: " + json);
        http.end();
    } else { 
        Serial.println("WiFi not connected, skipping data send.");
    }
}

// IoT Dashboard (optional)
// Requires that the user has an account: https://thingsboard.io/docs/user-guide/install/installation-options/?ceInstallType=liveDemo
void sendTelemetry(float moisturePercent, int batteryPercent) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(thingsApi);
        http.addHeader("Content-Type", "application/json");
        String json = "{";
        json += "\"moisture\":" + String(moisturePercent, 2) + ",";
        json += "\"battery\":" + String(batteryPercent);
        json += "}";
        int httpResponseCode = http.POST(json);
        Serial.println("Response: " + String(httpResponseCode));        
        Serial.println("Payload: " + json);
        http.end();
    } else { 
        Serial.println("WiFi not connected, skipping data send.");
    }
}

/** ========== MAIN ==========
1. First boot: setup everything
2. Read values every hour and persist them safely
3. Send average measurements once a day (notification, thingsboard)
4. Sleep
*/

// The setup function runs once when you press reset or power the board
void setup() {
  // Initialize serial communication for debugging at 115200 baud
  // This allows us to print messages to the Serial Monitor
  Serial.begin(115200);

  // Short delay to let the serial connection establish properly
  delay(1000);

  // Log boot informations for better debugging and monitoring
  ++bootCount;
  Serial.println("Boot #" + String(bootCount));
  printWakeupReason();

  // Initialize Wifi (only once a day. no measurement, only send data)
  // setupWiFi();
  
  // Set NTP with GMT+1 (Germany standard time) -> works only with wifi
  // configTime(3600, 0, "pool.ntp.org");  // 3600 seconds = +1 hour

  // Initialize Pins
  pinMode(batteryPin, INPUT); // ADC input
  //analogSetPinAttenuation(batteryPin, ADC_ATTENDB_MAX);
  pinMode(sensorPowerPin, OUTPUT); // Moisture power
  pinMode(moisturePin, INPUT); // Moisture input
  pinMode(LED_BUILTIN, OUTPUT); // TEMP BLINKY

  // // Read sensor values and battery life
  // // 1. Moisture
  // digitalWrite(sensorPowerPin, HIGH);
  // delay(200);
  // float moistureVoltage = readMoistureVoltage();
  // float moisturePercent = moistureVoltageToPercent(moistureVoltage);
  // Serial.println("Moisture: " + String(moisturePercent) + "%");
  // digitalWrite(sensorPowerPin, LOW);
  // // 2. Battery
  // float batteryVoltage = readBatteryVoltage();
  // int batteryPercent = batteryVoltageToPercent(batteryVoltage);
  // Serial.println("Battery: " + String(batteryPercent) + "%");

  // // IoT Dashboard (optional)
  // sendTelemetry(moisturePercent, batteryPercent);

  // Push Notification (optional)
  // if(moisturePercent < 5 || batteryPercent < 5) { // TODO: Check if thresholds make sense
  //     String message = "bibup bibup :) – ";
  //     message += "Bodenfeuchte: " + String(moisturePercent) + "%";
  //     message += ", "; 
  //     message += "Batterie: " + String(batteryPercent) + "%";
  //     sendNotification(message);
  // }

  // Put to sleep after work is done
  delay(3000);
  // shutdownAndSleep();
}

// The loop function runs over and over again forever
void loop() {
  // Nothing here, because the code runs via sleep_wakeup timer.
  // If wakeup, setup() is called – otherwise the controller is in sleep mode to safe battery.
  
  // Read sensor values and battery life
  // 1. Moisture
  digitalWrite(sensorPowerPin, HIGH);
  delay(200);
  float moistureVoltage = readMoistureVoltage();
  float moisturePercent = moistureVoltageToPercent(moistureVoltage);
  Serial.println("Moisture: " + String(moisturePercent) + "%");
  digitalWrite(sensorPowerPin, LOW);
  // 2. Battery
  float batteryVoltage = readBatteryVoltage();
  // int batteryPercent = batteryVoltageToPercent(batteryVoltage);
  Serial.println("Battery: " + String(batteryVoltage));
  
  // IoT Dashboard (optional)
  // sendTelemetry(moisturePercent, batteryPercent);

  digitalWrite(LED_BUILTIN, HIGH);  // turn the LED on (HIGH is the voltage level)
  delay(1000);                      // wait for a second
  digitalWrite(LED_BUILTIN, LOW);   // turn the LED off by making the voltage LOW
  delay(10000);  
}
