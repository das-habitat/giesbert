#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="giesbert"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_FILE="$SCRIPT_DIR/docker-stack.yml"

# --- Load .env.deploy ---
if [[ ! -f "$SCRIPT_DIR/.env.deploy" ]]; then
  echo "Error: $SCRIPT_DIR/.env.deploy not found." >&2
  exit 1
fi
set -a
source "$SCRIPT_DIR/.env.deploy"
set +a

# --- Preflight checks ---
if ! docker info &>/dev/null; then
  echo "Error: Docker daemon is not running." >&2
  exit 1
fi

# --- Init Swarm (skip if already active) ---
if docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "inactive"; then
  echo "Initializing Docker Swarm..."
  docker swarm init
else
  echo "Docker Swarm already active."
fi

# --- Registry Login (GitHub Container Registry) ---
echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USER" --password-stdin "ghcr.io"

# --- Deploy Stack ---
echo "Deploying stack '$STACK_NAME'..."
docker stack deploy -c "$STACK_FILE" --with-registry-auth --detach "$STACK_NAME"
echo "Done. Verify with:"
echo "  docker service ls"
echo "  docker stack ps $STACK_NAME"

# --- Cron Job: Docker Cleanup ---
CLEANUP_MARKER="# giesbert-docker-cleanup"
CLEANUP_JOB="0 3 * * * docker container prune -f >> /var/log/docker_cleanup.log 2>&1"
({ crontab -l 2>/dev/null || true; } | sed "/$CLEANUP_MARKER/d"; echo "$CLEANUP_MARKER"; echo "$CLEANUP_JOB") | crontab -
echo "Cron job giesbert-docker-cleanup installed (runs daily at 03:00)."
