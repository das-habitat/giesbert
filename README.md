# giesbert

<img alt="giesbert-logo" src="./docs/giesbert-logo.svg" width="auto" height="100px"></img>

## Main Technology

* Grafana for dashboard
* Ntfy for push notifications
* Quirk as frontend framework for website
* Arduiono IDE with ESP32S3 contorller

## Deployment

1. `docker swarm init`
2. `docker stack deploy -c docker-stack.yml --with-registry-auth --detach giesbert`
3. (optional) `docker stack rm giesbert`, to stop the stack

## Misc

* [Embedded Rust setup #1](https://www.youtube.com/watch?v=TOAynddiu5M)
* [Embedded Rust setup #2](https://youtu.be/dxgufYRcNDg?t=467)
* [Microcontroller overview](https://www.youtube.com/watch?v=KzKw_483pbI)
* [ESP32 overview](https://www.youtube.com/watch?v=CfIjInYch7U)
