# microCONTROLLER

## Main Technology

* [Arduiono IDE](https://docs.arduino.cc/software/ide/)
* [ESP32-S3](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/get-started/index.html)
* [Capacitive Soil Moisture Sensor v2.0](https://www.youtube.com/watch?v=pFQaFnqpOtQ)

## How to upload code to the Microcontroller

Here are the general steps to upload a programm to your microcontroller:

1. Connect your XIAO ESP32-S3 to your computer via USB
2. In the Arduino IDE:
  i) Select the correct board under Tools > Board (the correct board is "XIAO_ESP32-C6")
  ii) Select the correct port under Tools > Port (this is usually already preselected)
3. Click the Upload button

⚠️ If the upload fails because the device is in deep sleep (only if you have programmed it before):

1. Unplug the board
2. Hold the BOOT button
3. Plug it back in while still holding BOOT
4. Release the button after 2 seconds
5. Try uploading again

## Moisture Sensor Calibration

The moisture sensor gives you a voltage that decreases as moisture increases. To convert this into a percentage, you need to define two reference points:

* Dry: The voltage when the sensor is in air or dry soil (corresponds to 0%).
* Wet: The voltage when the sensor is in water or fully saturated soil (corresponds to 100%).
* These voltages vary slightly between sensors, so calibrating each one improves accuracy.

### Dry measurement

1. Leave the sensor in air.
2. Wait a few seconds and note the voltage value printed to the Serial Monitor.
3. This is your maximum voltage (corresponds to 0% moisture).

### Wet measurement

1. Insert the sensor tips into very wet soil or a glass of water (only the metal part).
2. Wait a few seconds and note the voltage value.
3. This is your minimum voltage (corresponds to 100% moisture).

Update your code `moistureVoltageToPercent()`:

```c
  const float MIN_V = 0.5;
  const float MAX_V = 2.5;
```

---

## Misc

* [Microcontroller overview](https://www.youtube.com/watch?v=KzKw_483pbI)
* [ESP32 overview](https://www.youtube.com/watch?v=CfIjInYch7U)
* [Getting started](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/)
* [Embedded Rust setup #1](https://www.youtube.com/watch?v=TOAynddiu5M)
* [Embedded Rust setup #2](https://youtu.be/dxgufYRcNDg?t=467)
