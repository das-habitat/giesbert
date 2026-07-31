# microCONTROLLER

## Components

* 1x SeedStudio XIAO [ESP32-S3](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/get-started/index.html)
* 1x Breadboard
* 1x [Capacitive Soil Moisture Sensor v2.0](https://docs.cirkitdesigner.com/component/20211c29-d8ec-444a-bbf9-fdfb286903ee/capacitive-soil-)
* 3x Battery-Case (AAA)
* 1x Schottky-Diode
* 2x 220 kΩ Resistor
* Small items (cable, pins, led, ...)

For software developing we use [Arduiono IDE](https://docs.arduino.cc/software/ide/) and [VS Code](https://code.visualstudio.com).

## Guides

### 0. Setup

1. Download Arduino IDE
2. Install packages: HttpClient, WifiManger
3. Clip Antenne an ESP32

### 1. Upload code to the microcontroller

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
5. (Click the RESET button)
6. Try uploading again

### 2. Calibration of the moisture sensor

The moisture sensor gives you a voltage that decreases as moisture increases. To convert this into a percentage, you need to define two reference points:

* Dry: The voltage when the sensor is in air or dry soil (corresponds to 0%).
* Wet: The voltage when the sensor is in water or fully saturated soil (corresponds to 100%).
* These voltages vary slightly between sensors, so calibrating each one improves accuracy.

#### Dry measurement

1. Leave the sensor in air.
2. Wait a few seconds and note the voltage value printed to the Serial Monitor.
3. This is your maximum voltage (corresponds to 0% moisture).

#### Wet measurement

1. Insert the sensor tips into very wet soil or a glass of water (only the metal part).
2. Wait a few seconds and note the voltage value.
3. This is your minimum voltage (corresponds to 100% moisture).

Update your code `moistureVoltageToPercent()`:

```c
  const float MIN_V = 0.5;
  const float MAX_V = 2.5;
```

## Expand your knowledge

### ESP32

* [ESP32 Models](https://www.youtube.com/watch?v=CfIjInYch7U)
* [ESP32 Power Modes](https://www.youtube.com/watch?v=DYIlM0nRLT0)
* [ESP32 Storage Types](https://www.youtube.com/watch?v=x5ew5GjKLlQ)
* [XIAO ESP32_S3](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/)

### Guides

* [Microcontrollers](https://www.youtube.com/watch?v=KzKw_483pbI)
* [Multimeters](https://www.youtube.com/watch?v=viitNbwrUMI)
* [Diodes](https://www.youtube.com/watch?v=QlsEq7cwW6s)
* [Spannungsteiler](https://www.youtube.com/watch?v=v6wyopZCLjU)
* [LoRA (Long Range RAdio)](https://www.youtube.com/watch?v=YQ7aLHCTeeE)
* [WifiManger](https://www.youtube.com/watch?v=VnfX9YJbaU8)

### Rust

* [Embedded Rust setup #1](https://www.youtube.com/watch?v=TOAynddiu5M)
* [Embedded Rust setup #2](https://youtu.be/dxgufYRcNDg?t=467)
