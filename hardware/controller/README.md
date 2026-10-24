# microCONTROLLER

## Components

* 1x SeedStudio XIAO [ESP32-S3](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/get-started/index.html)
* 1x Breadboard
* 1x [Capacitive Soil Moisture Sensor v2.0](https://docs.cirkitdesigner.com/component/20211c29-d8ec-444a-bbf9-fdfb286903ee/capacitive-soil-)
* 3x Battery-Case (AAA)
* 1x Schottky-Diode
* 2x 220 kΩ Resistor
* Small items (cable, pins, led, ...)

For software developing we use [Arduino IDE](https://docs.arduino.cc/software/ide/) and [VS Code](https://code.visualstudio.com).

## Guides

### 0. Setup

1. Download and install the [Arduino IDE](https://www.arduino.cc/en/software) (2.x)
2. Install the board package: *Tools > Board > Boards Manager*, search for `esp32`, install **"esp32" by Espressif Systems**
3. Install the library: *Tools > Manage Libraries*, search for `WiFiManager`, install **"WiFiManager" by tzapu**
   * `WiFi.h` and `HTTPClient.h` are part of the esp32 board package – do **not** install a separate "HttpClient" library (the library of that name is a different one; on some systems its `HttpClient.h` can shadow `HTTPClient.h` and break the build)
4. Clip the antenna onto the ESP32's antenna connector

### 1. Upload code to the microcontroller

Here are the general steps to upload a program to your microcontroller:

1. Connect your XIAO ESP32-S3 to your computer via USB-C. The cable must support data – charge-only cables power the board but no port shows up.
2. In the Arduino IDE:
   1. Select the board under *Tools > Board > esp32 >* **"XIAO_ESP32S3"**
   2. Select the port under *Tools > Port* (macOS: `/dev/cu.usbmodem…`, Windows: `COM…`). If no such port exists, the board is not detected – try another cable or the BOOT procedure below.
   3. Check that *Tools > USB CDC On Boot* is **Enabled**, otherwise nothing appears in the Serial Monitor
3. Click the Upload button

⚠️ If no port shows up or the upload fails – e.g. because the device is in deep sleep (`controller.ino` puts it to sleep between measurements, which turns its USB port off):

1. Unplug the board
2. Hold the BOOT button
3. Plug it back in while still holding BOOT
4. Release the button after 2 seconds
5. Re-select the port under *Tools > Port* and try uploading again
6. After the upload, press the RESET button to start the new program

### Check that it works

1. **Upload path:** Upload *File > Examples > 01.Basics > Blink*. The onboard LED blinks.
2. **Sensors:** Upload [`_chapter2/moisture`](../_chapter2/moisture/moisture.ino) or [`_chapter2/battery`](../_chapter2/battery/battery.ino), open the Serial Monitor at **115200** baud. A new line with voltage and percentage appears every 0.5 s.
3. **Controller:** Upload `controller.ino` and open the Serial Monitor right away. You should see `Boot #1`, `READ moisture: …`, `READ battery: …` and a WiFi attempt.
   * On the first boot, the board opens the WiFi network **"giesbert WifiManager"**. Connect to it with a phone within 2 minutes and enter your WiFi credentials. On success, a "giesbert – Setup" push message is sent to `NOTIFY_TOPIC`.
   * Afterwards the board sleeps for `TIME_TO_SLEEP` seconds between measurements. The Serial Monitor loses its connection while the board sleeps – this is expected.
4. **Dashboard:** `https://metrics.giesbert.das-habitat.de/vmui/#/?g0.expr={device="<METRICS_ID>"}` shows a new value after every wakeup.
5. **Push notification:** Subscribe to `https://notify.giesbert.das-habitat.de/<NOTIFY_TOPIC>` (ntfy app or browser). The daily report arrives after `MAX_VALUES` measurements (24 × `TIME_TO_SLEEP`).

The servers can be tested without the board using the scripts in [`_chapter3/`](../_chapter3/).

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
