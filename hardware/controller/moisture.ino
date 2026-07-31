// ========== MOISTURE ==========
#define MOISTURE_PIN A1

namespace giesbert
{

    void initMoisture()
    {
        pinMode(MOISTURE_PIN, INPUT);
    }

    float readMoistureVoltage()
    {
        // Dummy read then short delay to stabilize the measurement
        analogRead(MOISTURE_PIN);
        delay(50);
        const int SAMPLES = 16;
        uint32_t Vraw = 0;
        for (int i = 0; i < SAMPLES; i++)
        {
            Vraw += analogReadMilliVolts(MOISTURE_PIN);
        }
        return Vraw / SAMPLES / 1000.0;
    }

    int moistureVoltageToPercent(float voltage)
    {
        const float MIN_V = 0.9; // --> CHANGE ME PLS <--
        const float MAX_V = 2.6; // --> CHANGE ME PLS <--
        float percent = (MAX_V - voltage) / (MAX_V - MIN_V) * 100.0;
        return (int)constrain(percent, 0.0, 100.0);
    }

}
