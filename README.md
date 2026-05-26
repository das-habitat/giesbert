# giesbert

<img alt="giesbert-logo" src="./docs/giesbert-logo.svg" width="auto" height="100px"></img>

## Main Technology

* [VictoriaMetrics](https://docs.victoriametrics.com/victoriametrics/quick-start/)
* [ntfy](https://docs.ntfy.sh/)
* [qwik](https://qwik.dev/docs/)
* [Arduiono IDE](https://docs.arduino.cc/software/ide/)
* [ESP32S3](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/get-started/index.html)

## Deployment

1. `bash deploy.sh`
2. (optional) `docker stack rm giesbert`, to stop the stack

## Testing

### Push Notification

```bash
curl https://notify.giesbert.das-habitat.de \
  -d '{
    "topic": "beispielkanal",
    "title": "giesbert – Tagesbericht",
    "message": "Bodenfeuchte (VWC): 45%, Akkustand (SoC): 85%",
    "tags": ["droplet", "zap"],
    "priority": 5
  }'
```

### Metrics

```bash
curl -X POST https://metrics.giesbert.das-habitat.de/api/v1/import/prometheus \
  -H "Content-Type: text/plain" \
  -d 'moisture_percent{device="beispielsensor"} 45.2
battery_percent{device="beispielsensor"} 85.4'
```
