# giesbert

<img alt="giesbert-logo" src="./docs/giesbert-logo.svg" width="auto" height="100px"></img>

## Main Technology

* Grafana for dashboard
* ntfy for push notifications
* qwik as frontend framework for website
* Arduiono IDE with ESP32S3 contorller

## Deployment

1. `docker swarm init`
2. `docker stack deploy -c docker-stack.yml --with-registry-auth --detach giesbert`
3. (optional) `docker stack rm giesbert`, to stop the stack
