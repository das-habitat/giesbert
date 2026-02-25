# Deployment

## [IONOS VPS XS](https://www.ionos.de/server/vps)

- 1 GB RAM
- 10 GB NVMe SSD
- 1 €/month

Configuration files for production environment: [/deployment](../deployment/).

## Infrastructure

- GitLab: Docker Registry, Repository, CI/CD Pipeline
- THA Server
  - Connect via `ssh <username>@TODO`
  - Orcestration via Docker Swarm + Shepher

## GitHub Actions

```bash
GITHUB_TOKEN=
```

## Production Environment

1. Connect to the server via `ssh …`

2. Add `/deployment` into `opt/docker/giesbert`

3. Edit `.env.prod` file

4. Add environment variables to your `/home/<username>/.bashrc`
  
  ```bash
  export SITE_ADDRESS=
  export REGISTRY_USER=
  export REGISTRY_PASSWORD=
  ```

5. Start-Command only on setup or if stack file has changed:

  ```bash
  cd giesbert && bash deploy.sh
  ```

6. Check if everything is running:
  
  ```bash
  docker service ls
  docker stack ps giesbert
  docker service logs giesbert_server
  docker service logs giesbert_pwa
  ```

7. Tear down:

  ```bash
  docker stack rm giesbert
  docker swarm leave --force
  ```
