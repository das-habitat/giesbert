#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="giesbert"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_FILE="$SCRIPT_DIR/docker-stack.yml"

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
read -rp "GitHub Username: " REGISTRY_USER
read -rsp "GitHub Personal Access Token (PAT): " REGISTRY_PASSWORD
echo
echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USER" --password-stdin "ghcr.io"

# --- Deploy Stack ---
echo "Deploying stack '$STACK_NAME'..."
docker stack deploy -c "$STACK_FILE" --with-registry-auth --detach "$STACK_NAME"

echo ""
echo "Done. Verify with:"
echo "  docker service ls"
echo "  docker stack ps $STACK_NAME"
