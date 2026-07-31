#define MOISTURE_PIN A1

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
}

void loop()
{
    int moistureMilliVoltage = analogReadMilliVolts(MOISTURE_PIN);
    int moistureVoltage = moistureMilliVoltage / 1000;
    float moisturePercent = moistureVoltageToPercent(moistureVoltage);

    Serial.print("Spannung: ");
    Serial.print(moistureVoltage);
    Serial.print(" V  →  Bodenfeuchte: ");
    Serial.print(percmoisturePercentent);
    Serial.println(" %");

    delay(500);
}
