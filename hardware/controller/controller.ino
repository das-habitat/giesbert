#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>

// ========== PIN CONFIGURATION ==========
#define SENSOR_POWER_PIN D10

// ========== NOTIFY & METRICS SETTINGS ==========
#define NOTIFY_TOPIC "beispielkanal-habitat" // --> CHANGE ME PLS <--
#define NOTIFY_URL "https://notify.giesbert.das-habitat.de"
#define METRICS_URL "https://metrics.giesbert.das-habitat.de/api/v1/import/prometheus"
#define METRICS_ID "beispielsensor-habitat" // --> CHANGE ME PLS <--

// ========== MEASUREMENT SETTINGS ==========
#define TIME_TO_SLEEP 60 // 300 = 5 minutes, 3600 = 1 hour
#define uS_TO_S_FACTOR 1000000ULL
#define MAX_VALUES 24

RTC_DATA_ATTR int bootCount = 0;
RTC_DATA_ATTR int measureCount = 0;
RTC_DATA_ATTR int batteryValues[MAX_VALUES];
RTC_DATA_ATTR int moistureValues[MAX_VALUES];

void resetValues()
{
    measureCount = 0;
    memset(moistureValues, 0, sizeof(moistureValues));
    memset(batteryValues, 0, sizeof(batteryValues));
}

// ========== NOTIFY & TELEMETRY FUNCTIONS ==========

int sendNotification(String message, String title, String tags)
{
    HTTPClient http;
    http.begin(NOTIFY_URL);
    http.addHeader("Content-Type", "application/json");
    String json = "{";
    json += "\"topic\": \"" + String(NOTIFY_TOPIC) + "\",";
    json += "\"title\": \"" + title + "\",";
    json += "\"message\": \"" + message + "\",";
    json += "\"tags\": " + tags + ",";
    json += "\"priority\": " + String(5);
    json += "}";
    int httpResponseCode = http.POST(json);
    Serial.println("Notification response: " + String(httpResponseCode));
    http.end();
    return httpResponseCode;
}

void sendTelemetry(int moisturePercent, int batteryPercent)
{
    HTTPClient http;
    http.begin(METRICS_URL);
    http.addHeader("Content-Type", "text/plain");
    String body = "";
    body += "moisture_percent{device=\"" + String(METRICS_ID) + "\"} " + String(moisturePercent) + "\n";
    body += "battery_percent{device=\"" + String(METRICS_ID) + "\"} " + String(batteryPercent) + "\n";
    int httpResponseCode = http.POST(body);
    Serial.println("Telemetry response: " + String(httpResponseCode));
    http.end();
}

/** ========== MAIN ==========
 * Flow (runs once per wakeup, then sleeps):
 * 1. Every TIME_TO_SLEEP (1h): read moisture + battery, store in RTC arrays, connect to WiFi and send telemetry
 * 2. Every MAX_VALUES (24h): calculate daily avg, connect to WiFi and send push notification
 * 3. Go back to sleep
 */
void setup()
{
    // LEVEL 2 + 3 – Konfiguration
    Serial.begin(115200);
    delay(1000);

    ++bootCount;
    Serial.println("Boot #" + String(bootCount));
    giesbert::printWakeupReason();

    // Initialize pins
    giesbert::initBattery();
    giesbert::initMoisture();
    pinMode(SENSOR_POWER_PIN, OUTPUT);

    // LEVEL 3 – Internet: Dashboard + Notify
    //
    // Read moisture
    digitalWrite(SENSOR_POWER_PIN, HIGH);
    delay(200);
    float moistureVoltage = giesbert::readMoistureVoltage();
    int moisturePercent = giesbert::moistureVoltageToPercent(moistureVoltage);
    digitalWrite(SENSOR_POWER_PIN, LOW);
    Serial.println("READ moisture: " + String(moistureVoltage) + "V (" + String(moisturePercent) + "%)");

    // Read battery
    float batteryVoltage = giesbert::readBatteryVoltage();
    int batteryPercent = giesbert::batteryVoltageToPercent(batteryVoltage);
    Serial.println("READ battery: " + String(batteryVoltage) + "V (" + String(batteryPercent) + "%)");

    // Store in RTC arrays
    int index = measureCount % MAX_VALUES;
    moistureValues[index] = moisturePercent;
    batteryValues[index] = batteryPercent;
    measureCount++;
    Serial.println("COUNT measurement: " + String(measureCount) + "/" + String(MAX_VALUES));

    // Connect to Wifi or showdown and sleep
    giesbert::ensureWiFiConnected();

    // Send telemetry (each TIME_TO_SLEEP)
    Serial.println("SEND telemetry: { moisture: " + String(moisturePercent) + "%, battery: " + String(batteryPercent) + "% }");
    sendTelemetry(moisturePercent, batteryPercent);

    // Send daily average (once MAX_VALUES readings are collected)
    if (measureCount >= MAX_VALUES)
    {
        long sumMoisture = 0, sumBattery = 0;
        for (int i = 0; i < MAX_VALUES; i++)
        {
            sumMoisture += moistureValues[i];
            sumBattery += batteryValues[i];
        }
        int avgMoisture = sumMoisture / MAX_VALUES;
        int avgBattery = sumBattery / MAX_VALUES;

        // Optional: Only send notifications, if values reach a specific point, like (avgMoisture < 20 || avgBattery < 10)
        String msg = "Bodenfeuchte (VWC): " + String(avgMoisture) + "%, Akkustand (SoC): " + String(avgBattery) + "%";
        Serial.println("SEND notification: " + msg);
        int notifyResponse = sendNotification(msg, "giesbert – Tagesbericht", "[\"droplet\",\"zap\"]");
        if (notifyResponse >= 200 && notifyResponse < 300)
        {
            resetValues();
        }
    }

    giesbert::shutdownAndSleep();
}

// loop() is never reached because setup() ends with esp_deep_sleep_start().
// On wakeup the chip resets and setup() runs again.
void loop() {}
