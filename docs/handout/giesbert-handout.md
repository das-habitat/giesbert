# Giesbert – Sprechender Blumentopf

**Handout zum Elektronikkurs**

Willkommen bei Giesbert! In diesem Kurs baust du deinen eigenen Sensor, der misst, wie durstig deine Zimmerpflanze ist – und der dir das sogar aufs Smartphone schickt. Dieses Handout begleitet dich durch alle drei Kapitel des Kurses. Zu jedem Kapitel gibt es zuerst ein bisschen Theorie mit Kontrollfragen und danach eine Schritt-für-Schritt-Anleitung für die Praxis.

## Deine Bauteile

- 1× Mikrocontroller (Seeed XIAO ESP32-S3)
- 1× Kapazitiver Bodenfeuchtesensor (v2.0)
- 1× Batteriehalter (3xAAA)
- 1× Schottky-Diode
- 2× 220kΩ Widerstand
- 1x 120Ω Widerstand
- 1x LED (Gelb)
- 1× Steckbrett
- 3x Kabel (Rot, Gelb, Schwarz)

## Was du am Ende kannst

- Spannung und Widerstand mit einem Multimeter messen
- Verstehen, wie ein Sensor eine physikalische Größe (Feuchtigkeit) in ein elektrisches Signal verwandelt
- Einen Mikrocontroller mit der Arduino IDE programmieren
- Sensordaten über WLAN ins Internet schicken
- Deine Messwerte auf einem Dashboard sehen und eine Push-Benachrichtigung aufs Handy bekommen

---

# Kapitel 1: Sensoren mit dem Multimeter messen

## 1.1 Theorie

### Was ist elektrischer Strom eigentlich?

Stell dir Strom wie Wasser vor, das durch ein Rohr fließt:

| Wasser-Bild | Elektrischer Fachbegriff | Einheit |
| --- | --- | --- |
| Wasserdruck | **Spannung** (U) | Volt (V) |
| Wassermenge pro Sekunde | **Stromstärke** (I) | Ampere (A) |
| Enges Rohr, das bremst | **Widerstand** (R) | Ohm (Ω) |

Je höher die Spannung, desto mehr "Druck" steht dahinter. Je größer der Widerstand, desto schwerer kommt der Strom durch.

### Was macht ein Multimeter?

Ein Multimeter ist ein Messgerät, das (mindestens) drei Dinge kann:

1. **Spannung messen** (Einheit Volt, Einstellung meist "V" mit Wellenlinie ~ oder Strich – für unseren Kurs: Gleichspannung, "DCV"). Die Messspitzen werden **parallel** zur Spannugnsquelle angelegt. Es gibt verschiedene Messgrößen und falls man sich unsicher ist, sollte man mit dem größten Messbereich anfangen und sich dann nach und nach an die kleineren Bereiche herantasten.
2. **Widerstand messen** (Einheit Ohm, Einstellung "Ω"). Bauteil **spannungsfrei** machen und ebenfalls Messspitzen **parallel** anlegen.
3. **Strom messen** (Einheit Ampere, Einstellung "A") – brauchen wir heute nicht.

### Wie funktioniert unser Bodenfeuchtesensor?

Unser Sensor (ein **kapazitiver** Bodenfeuchtesensor v2.0) hat zwei Elektroden, die in die Erde gesteckt werden. Zusammen mit der Erde dazwischen bildet er einen kleinen **Kondensator**: ein Bauteil, das elektrische Ladung speichern kann. Wie gut das funktioniert, hängt davon ab, wie feucht die Erde ist – feuchte Erde verändert die Speicherfähigkeit stärker als trockene.

Der Sensor wandelt das in eine **Ausgangsspannung** um. Wichtig zu merken – und das ist bei diesem Sensortyp erstmal unerwartet:

> **Je feuchter die Erde, desto niedriger die Ausgangsspannung.** Trockene Erde erzeugt also die höhere Spannung.

Genau diese Spannung kannst du direkt mit dem Multimeter messen – und später vom Microcontroller auslesen lassen.

### Warum messen wir auch die Batteriespannung?

Unser Sensor läuft über einen Batteriehalter mit drei AAA-Batterien. Eine Batterie liefert nicht immer exakt dieselbe Spannung – sie sinkt langsam, während die Batterie sich entlädt. Wenn du weißt, wie eine volle und eine leere Batterie sich in der Spannung unterscheiden, kannst du später sogar erkennen, wann die Batterie deines Sensors zur Neige geht.

### Der Spannungsteiler: Warum wir die Batteriespannung nicht direkt messen

Drei AAA-Batterien in Reihe liefern zusammen bis zu etwa 4,5 V. Der Microcontroller kann an seinen analogen Eingängen aber nur Spannungen bis maximal 3,3 V sicher verarbeiten – eine höhere Spannung könnte den Chip beschädigen. Deshalb wird die Batteriespannung nicht direkt an den Microcontroller angeschlossen, sondern vorher "verkleinert". Das übernimmt ein **Spannungsteiler**.

Ein Spannungsteiler besteht aus zwei Widerständen (bei uns: **zwei gleich große 220-kΩ-Widerstände**), die hintereinandergeschaltet werden:

```
Batterie(+) ──[ R1 = 220 kΩ ]──●── zum Microcontroller-Pin (gemessene Spannung)
                                │
                          [ R2 = 220 kΩ ]
                                │
Batterie(−) ────────────────────
```

An dem Punkt zwischen den beiden Widerständen (●) liegt nur noch ein Teil der ursprünglichen Spannung an. Wie groß dieser Anteil ist, verrät die Formel:

$$U_{aus} = U_{ein} \cdot \frac{R2}{R1 + R2}$$

Da bei uns R1 und R2 **gleich groß** sind, kürzt sich das zu:

$$U_{aus} = U_{ein} \cdot \frac{1}{2}$$

Der Microcontroller misst also immer nur die **Hälfte** der tatsächlichen Batteriespannung. Willst du später die echte Batteriespannung wissen, musst du den gemessenen Wert einfach wieder **verdoppeln**. Ein Beispiel: Sind die Batterien voll und liefern 4,5 V, misst du am Spannungsteiler nur 2,25 V – verdoppelst du diesen Wert bekommst du 4,5 V.

### Kontrollfragen Kapitel 1

1. Was misst man in Volt, was in Ohm?
2. Wie müssen die Messspitzen des Multimeters angeschlossen werden, um eine Spannung zu messen?
3. Was musst du beachten, wenn du mit dem Multimeter einen Widerstand messen möchtest?
4. Was passiert mit der Ausgangsspannung unseres Bodenfeuchtesensors, wenn die Erde **feuchter** wird – steigt oder sinkt sie?
5. Warum wird die Batteriespannung nicht direkt, sondern über einen Spannungsteiler an den Microcontroller angeschlossen?

## 1.2 Praxis

**Du brauchst:** Multimeter, Bodenfeuchtesensor, Becher mit trockener Erde, Becher mit feuchter Erde (oder ein Glas Wasser), Batteriehalter mit Batterien

**Schritt 1 – Multimeter einstellen**

1. Schalte das Multimeter ein.
2. Stelle den Drehschalter auf Gleichspannung (meist "DCV", Bereich 20V ist für unsere Zwecke passend).

**Schritt 2 – Spannung am Bodenfeuchtesensor messen**

1. Verbinde den Sensor mit Spannungsversorgung (wie im Kurs gezeigt).
2. Stecke die rote Messspitze an den Signal-Ausgang des Sensors, die schwarze an Masse (GND).
3. Lass den Sensor **an der Luft** hängen (das entspricht "ganz trocken") und notiere die angezeigte Spannung. Das ist deine **maximale** Spannung.
4. Stecke nur die Metallspitzen des Sensors in **sehr nasse** Erde oder ein Glas Wasser und notiere die Spannung erneut. Das ist deine **minimale** Spannung.
5. Vergleiche: War der Unterschied so, wie du es nach der Theorie erwartet hast (trocken = höhere Spannung)?

| Messung | Spannung (V) |
| --- | --- |
| Trocken (an der Luft) | |
| Nass (Wasser/sehr nasse Erde) | |

**Schritt 3 – Batteriespannung messen**

1. Stelle das Multimeter weiterhin auf DCV.
2. Halte die rote Spitze an den Pluspol, die schwarze an den Minuspol des Batteriehalters.
3. Notiere die gemessene Spannung.

| Batteriehalter | Spannung (V) |
|---|---|

**Schritt 4 – Spannung am Spannungsteiler messen**

1. Baue die zwei 220-kΩ-Widerstände wie im Kurs gezeigt als Spannungsteiler auf dem Breadboard auf.
2. Miss die Spannung direkt an der Batterie (Punkt "Batterie(+)" zu "Batterie(−)").
3. Miss die Spannung am mittleren Punkt (●) gegen Minuspol – also genau dort, wo später der Microcontroller-Pin angeschlossen wird.
4. Vergleiche beide Werte: Ist der zweite Wert ungefähr halb so groß wie der erste?

| Messung | Spannung (V) |
| --- | --- |
| Direkt an der Batterie | |
| Am Spannungsteiler (mittlerer Punkt) | |

✅ **Fertig, wenn:** Du zwei unterschiedliche Spannungswerte für trocken und nass notiert hast (trocken = höher!), die Batteriespannung kennst und bestätigen konntest, dass der Spannungsteiler die Spannung etwa halbiert.

---

# Kapitel 2: Sensorwerte digital auslesen (Microcontroller mit dem PC)

## 2.1 Theorie

### Was ist ein ESP32?

Der **ESP32** ist ein kleiner Computer auf einem Chip (ein sogenannter **Mikrocontroller**) – mit WLAN eingebaut! Wir verwenden das **Seeed XIAO ESP32-S3**, ein besonders kleines Entwicklungsboard mit diesem Chip. Er kann:

- Spannungen an seinen Pins messen (**analoge Eingänge**)
- Ein- und Ausgänge schalten (**digitale Pins**)
- Ein Programm ausführen, das du selbst schreibst
- Sich mit einem WLAN-Netzwerk verbinden

### Analog vs. digital

Ein digitales Signal kennt nur zwei Zustände: An (1) oder Aus (0). Ein analoges Signal kann dagegen jeden Wert dazwischen annehmen – wie unsere Sensorspannung, die zum Beispiel 0,7 V oder 2,3 V betragen kann.

Damit der ESP32 mit dem analogen Spannungswert des Sensors "rechnen" kann, wandelt er ihn zunächst in eine Zahl um. Das übernimmt der **ADC** (Analog-Digital-Wandler / *Analog-to-Digital-Converter*), der fest im Chip eingebaut ist.

### Was ist die Arduino IDE?

Die **Arduino IDE** ist ein Programm auf deinem PC, mit dem du Code schreibst und ihn auf den ESP32 überträgst ("hochlädst"/"flashst"). Ein Arduino-Programm heißt **Sketch** und besteht immer aus zwei Grundbausteinen:

```cpp
void setup() {
  // wird einmal ausgeführt, wenn der ESP32 startet
}

void loop() {
  // wird danach immer wieder ausgeführt, in Dauerschleife
}
```

### Den Bodenfeuchtesensor auslesen

Mit dem Befehl `analogReadMilliVolts(PIN)` liest der ESP32 die Spannung an einem bestimmten Pin aus. Über die serielle Schnittstelle (`Serial`) kannst du die Werte auf deinem PC sichtbar machen.

"73 % feucht" ist viel leichter zu verstehen als ein roher Messwert. Deshalb rechnen wir die gemessene Spannung in eine Prozentzahl um – dafür brauchen wir genau die zwei Referenzwerte aus Kapitel 1:

- **MIN_V**: die Spannung bei völliger Nässe → entspricht **100 %** Feuchtigkeit
- **MAX_V**: die Spannung bei völliger Trockenheit → entspricht **0 %** Feuchtigkeit

```cpp
#define MOISTURE_PIN A1

float moistureVoltageToPercent(float voltage) {
  const float MIN_V = 0.5; // deine eigene Nass-Messung eintragen
  const float MAX_V = 2.5; // deine eigene Trocken-Messung eintragen
  float percent = (MAX_V - voltage) / (MAX_V - MIN_V) * 100.0;
  return percent;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
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
```

### Die Batteriespannung auslesen

Da der ESP32 wegen des Spannungsteilers nur die **halbe** Batteriespannung misst, musst du den gemessenen Wert im Code wieder verdoppeln, um die echte Batteriespannung zu bekommen. Da die Spannung der Batterie nicht linear abfällt, rechnen wir den gemessenen Wert anhand einer Kurve um.

```cpp
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

void setup() {
  Serial.begin(115200);
}

void loop() {
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
```

### Kontrollfragen Kapitel 2

1. Was ist der Unterschied zwischen einem analogen und einem digitalen Signal?
2. Wofür steht die Abkürzung ADC, und was macht er?
3. Wofür stehen MIN_V und MAX_V, und warum kalibriert jede Person ihre eigenen Werte?
4. Welcher Befehl liest eine Spannung an einem Pin des ESP32 aus?
5. Warum muss der am ESP32-Pin gemessene Batteriewert im Code mit 2 multipliziert werden, bevor er der echten Batteriespannung entspricht?

## 2.2 Praxis

**Du brauchst:** PC mit installierter Arduino IDE, XIAO ESP32-S3-Board, USB-Kabel, Bodenfeuchtesensor, deine Notizen aus Kapitel 1

**Schritt 1 – ESP32 vorbereiten**

1. Öffne die Arduino IDE.
2. Prüfe unter *Werkzeuge → Board*, ob das passende XIAO-ESP32-Board ausgewählt ist. Falls das Boardpaket fehlt, installiere es über den *Boardverwalter* (Suchbegriff: "esp32").
3. Verbinde den ESP32 per USB mit dem PC.
4. Wähle unter *Werkzeuge → Port* den passenden Port aus (meist schon vorausgewählt).
5. Klicke auf **Hochladen**.

⚠️ **Falls das Hochladen fehlschlägt** (nur, wenn das Board schon vorher programmiert wurde und in den Tiefschlaf gegangen ist):

1. Board vom USB trennen
2. BOOT-Taste gedrückt halten
3. Wieder einstecken, dabei BOOT weiter gedrückt halten
4. Nach 2 Sekunden loslassen
5. (Optional: RESET-Taste drücken)
6. Hochladen erneut versuchen

**Schritt 2 – Kalibrierwerte eintragen**

1. Übernimm den Beispielcode aus Abschnitt 2.1
2. Trage bei `MIN_V` deine Nass-Messung und bei `MAX_V` deine Trocken-Messung aus Kapitel 1 ein.
3. Trage den Pin ein, an dem dein Sensor angeschlossen ist.

**Schritt 3 – Hochladen und testen**

1. Öffne den **Serial Monitor** (Lupensymbol oben rechts) und stelle die Baudrate auf 115200.
2. Stecke den Sensor abwechselnd in trockene und feuchte Erde.

**Schritt 4 – Werte protokollieren**

| Zustand | Feuchtigkeit (%) |
| --- | --- |
| Trockene Erde | |
| Feuchte Erde | |

✅ **Fertig, wenn:** Im Serial Monitor sinnvolle Prozentwerte erscheinen – nahe 0 % bei trockener und nahe 100 % bei sehr feuchter Erde.

---

# Kapitel 3: Ab ins Internet – Dashboard & Push-Nachricht

## 3.1 Theorie

### Was ist eigentlich IoT?

**IoT** steht für *Internet of Things* ("Internet der Dinge") – gemeint sind Alltagsgegenstände, die über das Internet Daten senden oder empfangen können. Dein Bodenfeuchtesensor wird heute Teil des IoT!

### Client und Server

Man unterscheidet meist zwei Rollen:

- **Client**: fragt Daten an oder schickt Daten los (das wird gleich dein ESP32 sein)
- **Server**: nimmt Daten entgegen, speichert oder verarbeitet sie

Den Server samt Dashboard und Push-Dienst musst du für diesen Kurs **nicht selbst bauen** – diese Infrastruktur wird euch gestellt. Du musst also nur wissen, *was* dort passiert, nicht *wie* der Server im Hintergrund aufgebaut ist. Zwei Dienste sind für dich als Nutzer:in wichtig:

- **VictoriaMetrics** – speichert eure Messwerte über die Zeit (das Dashboard)
- **ntfy** – verschickt die Push-Benachrichtigungen ans Smartphone

Die gängigste Sprache, in der Client und Server im Web miteinander reden, heißt **HTTP**. Eine häufige Anfrageart ist **POST** – damit schickt man Daten *an* einen Server. Genau das macht gleich dein ESP32.

### VictoriaMetrics – dein Dashboard

**VictoriaMetrics** ist eine Datenbank, die auf Messwerte über die Zeit spezialisiert ist (eine sogenannte **Zeitreihendatenbank**). Jeder Messwert wird zusammen mit einem Zeitstempel gespeichert. Damit man später mehrere Sensoren unterscheiden kann, bekommt jeder Messwert außerdem ein **Label**, zum Beispiel den Namen deines Geräts (`device="..."`).

### ntfy – deine Push-Nachricht

**ntfy** ist ein einfacher Push-Benachrichtigungsdienst. Man schickt eine HTTP-Anfrage mit ein paar Angaben (Thema/Topic, Titel, Nachrichtentext, …), und jeder, der dieses Topic auf seinem Handy abonniert hat, bekommt sofort eine Benachrichtigung. Für uns heißt das: Wird die Erde zu trocken, schickt der ESP32 eine Nachricht an ntfy – und dein Handy klingelt.

### Kontrollfragen Kapitel 3

1. Was bedeutet die Abkürzung IoT?
2. Welche Rolle übernimmt der ESP32 – Client oder Server – wenn er Daten losschickt?
3. Welche zwei Dienste auf dem (bereits fertig eingerichteten) Server sind für dich als Sensor-Bastler:in wichtig, und was macht jeder davon?
4. Wofür wird ein Label wie `device="..."` bei einem Messwert gebraucht?
5. Was müsste in deinem Sketch passieren, damit du nur *bei zu trockener Erde* eine Nachricht bekommst und nicht bei jeder Messung?

## 3.2 Praxis

**Du brauchst:** Deinen ESP32-Sketch aus Kapitel 2, WLAN-Zugangsdaten, dein persönliches ntfy-Topic (im Kurs vergeben), ntfy-App auf dem Smartphone (oder Browser)

**Schritt 1 – Testen, wie der Server reagiert**

Bevor du etwas programmierst, kannst du die beiden Wege einmal von deinem PC aus ausprobieren (z. B. über ein Terminal):

```bash
# Push-Nachricht testen
curl https://notify.giesbert.das-habitat.de \
  -d '{
    "topic": "DEIN_TOPIC", # Bitte anpassen
    "title": "giesbert – Tagesbericht",
    "message": "Bodenfeuchte (VWC): 45%, Akkustand (SoC): 85%",
    "tags": ["droplet", "zap"],
    "priority": 5
  }'
```

```bash
# Messwert testen
curl -X POST https://metrics.giesbert.das-habitat.de/api/v1/import/prometheus \
  -H "Content-Type: text/plain" \
  -d 'moisture_percent{device="DEIN_GERÄTENAME"} 45.2 # Bitte anpassen
battery_percent{device="DEIN_GERÄTENAME"} 85.4' # Bitte anpassen
```

**Schritt 2 – WLAN-Funktionalität einbauen**

Nutze jetzt den Sketch `controller.ino` aus dem Kurs und passe die Variablen `NOTIFY_TOPIC`, `METRICS_ID`, `TIME_TO_SLEEP`, `MIN_V` und `MAX_V` an.

**Schritt 6 – Testen**

1. Abonniere im ntfy-App/Browser dein Topic.
2. Lade den Sketch hoch und beobachte den Serial Monitor.
3. Schau im Dashboard nach, ob deine Werte ankommen.
4. Prüfe ebenfalls, ob eine Push-Nachricht angekommen ist.

✅ **Fertig, wenn:** Deine Messwerte im Dashboard erscheinen **und** du eine Push-Nachricht auf dem Handy/Browser bekommst.

## Herzlichen Glückwunsch

🎉 Du hast jetzt deinen eigenen, netzwerkfähigen Bodenfeuchtesensor gebaut und verstehst, wie er von der Erde bis auf dein Smartphone funkt!
