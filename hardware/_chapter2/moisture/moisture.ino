#define MOISTURE_PIN A1
#define SENSOR_POWER_PIN D10 // versorgt den Sensor mit Strom

float moistureVoltageToPercent(float voltage)
{
    const float MIN_V = 0.5; // deine eigene Nass-Messung eintragen
    const float MAX_V = 2.5; // deine eigene Trocken-Messung eintragen
    float percent = (MAX_V - voltage) / (MAX_V - MIN_V) * 100.0;
    return percent;
}

void setup()
{
    Serial.begin(115200);
    pinMode(SENSOR_POWER_PIN, OUTPUT);
    digitalWrite(SENSOR_POWER_PIN, HIGH); // Sensor einschalten
}

void loop()
{
    int moistureMilliVoltage = analogReadMilliVolts(MOISTURE_PIN);
    float moistureVoltage = moistureMilliVoltage / 1000.0;
    float moisturePercent = moistureVoltageToPercent(moistureVoltage);

    Serial.print("Spannung: ");
    Serial.print(moistureVoltage);
    Serial.print(" V  →  Bodenfeuchte: ");
    Serial.print(moisturePercent);
    Serial.println(" %");

    delay(500);
}
