// ========== BATTERY ==========
#define BATTERY_PIN A0

namespace giesbert
{

    void initBattery()
    {
        pinMode(BATTERY_PIN, INPUT);
    }

    float readBatteryVoltage()
    {
        // Dummy read then short delay to stabilize the measurement
        analogRead(BATTERY_PIN);
        delay(50);
        const int SAMPLES = 16;
        const int DIVIDER_RATIO = 2; // scale voltage down 1:2
        uint32_t Vbatt = 0;
        for (int i = 0; i < SAMPLES; i++)
        {
            Vbatt += analogReadMilliVolts(BATTERY_PIN);
        }
        return DIVIDER_RATIO * Vbatt / SAMPLES / 1000.0;
    }

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

}
