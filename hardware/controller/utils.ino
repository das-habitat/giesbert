// ========== SYSTEM FUNCTIONS ==========

namespace giesbert
{

    void shutdownAndSleep()
    {
        digitalWrite(SENSOR_POWER_PIN, LOW);
        WiFi.disconnect(true);
        WiFi.mode(WIFI_OFF);
        delay(200);
        Serial.flush();
        Serial.end();
        esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
        esp_deep_sleep_start();
    }

    void printWakeupReason()
    {
        esp_sleep_wakeup_cause_t reason = esp_sleep_get_wakeup_cause();
        switch (reason)
        {
        case ESP_SLEEP_WAKEUP_TIMER:
            Serial.println("Wakeup: Timer");
            break;
        default:
            Serial.printf("Wakeup not from timer: %d\n", reason);
            break;
        }
    }

// ========== WIFI SETUP ==========
#define PORTAL_TIMEOUT 120 // 120 = 2 minutes
#define AP_ID "giesbert"

    void ensureWiFiConnected()
{
    WiFi.mode(WIFI_STA);

    // 1. Versuch: mit gespeicherten Zugangsdaten verbinden
    WiFi.begin();
    Serial.print("Connecting to WiFi");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 8)
    {
        delay(500);
        Serial.print(".");
        retries++;
    }
    Serial.println("");

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("WiFi connected: " + WiFi.localIP().toString());
        return;
    }

    // Kein WLAN: ab dem zweiten Start nur schlafen, kein Portal
    // (sonst würde der Akku leergesaugt, wenn der Router mal ausfällt)
    if (bootCount > 1)
    {
        Serial.println("WiFi not connected. Sleeping...");
        shutdownAndSleep();
    }

    // Erster Start ohne gespeicherte Daten: Portal öffnen
    Serial.println("WiFi failed. Starting WiFiManager...");
    WiFi.mode(WIFI_STA);
    WiFiManager wm;
    wm.setConfigPortalTimeout(PORTAL_TIMEOUT);
    if (!wm.autoConnect(AP_ID " WifiManager"))
    {
        Serial.println("WiFiManager failed or timed out. Sleeping...");
        shutdownAndSleep();
    }
    Serial.println("WiFi connected via WiFiManager.");
    sendNotification("bibup bibup – Gerät erfolgreich eingerichtet.",
                     "giesbert – Setup", "[\"white_check_mark\",\"raised_hands\"]");
}

}