# Giesbert Deployment

Configuration files for production environment: [/deployment](../deployment/).

## Infrastructure

- GitLab: Docker Registry, Repository, CI/CD Pipeline
- [IONOS VPS XS](https://www.ionos.de/server/vps) (1€/month)
  - 2 GB RAM / 2 vCore / 80 GB NVMe SSD
  - Orcestration via Docker Swarm + Shepherd

## Linux Settings

1. Install docker:

    ```bash
    curl -fsSL https://get.docker.com | sh
    docker --version
    docker run hello-world
    ```

2. Create new user:

    ```bash
    adduser deinuser
    usermod -aG sudo deinuser
    usermod -aG docker deinuser
    ```

3. Add your ssh key to `authorized_keys` file in `deinuser/.ssh/`
4. Configure `/etc/ssh/sshd_config`:

    ```bash
    PermitRootLogin no
    PasswordAuthentication no
    PubkeyAuthentication yes
    ```

## Production Deployment

1. Connect to the server via `ssh <deinuser>@<host>`

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
