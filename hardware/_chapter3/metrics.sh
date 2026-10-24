#!/usr/bin/env bash
# Erfolg: keine Ausgabe (HTTP 204). Werte danach im Dashboard prüfen:
# https://metrics.giesbert.das-habitat.de/vmui/#/?g0.expr={device="DEIN_GERÄTENAME"}

# Messwert testen
# Bitte anpassen: DEIN_GERÄTENAME (in beiden Zeilen)
curl -X POST https://metrics.giesbert.das-habitat.de/api/v1/import/prometheus \
  -H "Content-Type: text/plain" \
  -d 'moisture_percent{device="DEIN_GERÄTENAME"} 45.2
battery_percent{device="DEIN_GERÄTENAME"} 85.4'
