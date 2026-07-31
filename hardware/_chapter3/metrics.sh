#!/usr/bin/env bash

# Messwert testen
curl -X POST https://metrics.giesbert.das-habitat.de/api/v1/import/prometheus \
  -H "Content-Type: text/plain" \
  -d 'moisture_percent{device="DEIN_GERÄTENAME"} 45.2 # Bitte anpassen
battery_percent{device="DEIN_GERÄTENAME"} 85.4' # Bitte anpassen
