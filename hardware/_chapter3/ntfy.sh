#!/usr/bin/env bash

# Push-Nachricht testen
curl https://notify.giesbert.das-habitat.de \
  -d '{
    "topic": "DEIN_TOPIC", # Bitte anpassen
    "title": "giesbert – Tagesbericht",
    "message": "Bodenfeuchte (VWC): 45%, Akkustand (SoC): 85%",
    "tags": ["droplet", "zap"],
    "priority": 5
  }'
