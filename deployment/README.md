# Giesbert Deployment

Configuration files for production environment: [/deployment](../deployment/).

## Infrastructure

- GitLab: Docker Registry, Repository, CI/CD Pipeline
- [IONOS VPS XS](https://www.ionos.de/server/vps) (1€/month)
  - 1 GB RAM / 10 GB NVMe SSD
  - Orcestration via Docker Swarm + Shepherd

## Production Environment

1. Connect to the server via `ssh <user>@<server>`

2. Add `/deployment` into `opt/docker/giesbert`

3. Edit `.env.deploy` file for production

4. Start-Command only on setup or if stack file has changed:

    ```bash
    cd giesbert && bash deploy.sh
    ```

5. Check if everything is running:

    ```bash
    docker service ls
    docker stack ps giesbert
    docker service logs giesbert_server
    docker service logs giesbert_pwa
    ```

6. Tear down:

    ```bash
    docker stack rm giesbert
    docker swarm leave --force
    ```
