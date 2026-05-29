# SERVER

## Main Technology

* [Caddy](https://caddyserver.com/docs/)
* [VictoriaMetrics](https://docs.victoriametrics.com/victoriametrics/quick-start/)
* [ntfy](https://docs.ntfy.sh/)

## Deployment

VPS: ~4GB RAM / ~10GB DISK

1. Build website and move files from `/dir` in `/website`
2. Edit `.env.deploy`
3. Start via `bash deploy.sh`
4. (optional) Stop via `docker stack rm giesbert`

## Testing

### Notify

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
