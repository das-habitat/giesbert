#define BATTERY_PIN A0

// Approximation of alkaline discharge curve (3xAAA, alkaline):
// * 4.8-4.5 = 100%
// * 4.2–4.4 = 80–100%
// * 3.6-4.2 = 20–80% (long flat nominal discharge)
// * 3.6–3.0 = 0-20% (fast drop)
int batteryVoltageToPercent(float voltage)
{
    if (voltage >= 4.5)
        return 100;
    if (voltage <= 3.0)
        return 0;
    if (voltage > 4.2)
        return map(voltage * 100, 420, 450, 80, 100);
    if (voltage > 3.6)
        return map(voltage * 100, 360, 420, 20, 80);
    return map(voltage * 100, 300, 360, 0, 20);
}

void setup()
{
    Serial.begin(115200);
}

void loop()
{
    const int DIVIDER_RATIO = 2;
    int batteryMilliVoltage = analogReadMilliVolts(BATTERY_PIN);
    int batteryVoltage = (batteryMilliVoltage * DIVIDER_RATIO) / 1000;
    float batteryPercent = batteryVoltageToPercent(batteryVoltage);

    Serial.print("Spannung: ");
    Serial.print(batteryVoltage);
    Serial.print(" V  →  Akkustand: ");
    Serial.print(batteryPercent);
    Serial.println(" %");

    delay(500);
}
