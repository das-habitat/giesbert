#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="giesbert"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-stack.yml"

# --- Load .env variables ---
set -a
source "$SCRIPT_DIR/.env.deploy"
set +a

# --- Init Swarm (skip if already active) ---
if ! docker info &>/dev/null; then
  echo "Error: Docker daemon is not running." >&2
  exit 1
fi
if docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "inactive"; then
  echo "Initializing Docker Swarm..."
  docker swarm init
else
  echo "Docker Swarm already active."
fi

# --- Deploy Stack ---
echo "Deploying stack '$STACK_NAME'..."
docker stack deploy -c "$COMPOSE_FILE" --with-registry-auth --detach "$STACK_NAME"

echo ""
echo "Done. Verify with:"
echo "  docker service ls"
echo "  docker stack ps $STACK_NAME"
