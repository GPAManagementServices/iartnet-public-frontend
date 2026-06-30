#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/iartnet_frontend"
COMPOSE_FILE="docker/compose.yaml"
ENV_FILE="docker/.env"

cd "$APP_DIR"

# non deve sparire: è config locale del server
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: manca $APP_DIR/$ENV_FILE"
  echo "Crea docker/.env a partire da .env.example (o copia il template)."
  exit 1
fi

echo "== sync repo =="
git fetch origin main
git reset --hard origin/main

# pulisci untracked ma NON cancellare docker/.env
git clean -fd -e "$ENV_FILE"

# Versione build (git describe) per UI; usata da docker compose come build-arg
export NUXT_PUBLIC_APP_VERSION=$(git describe --tags --always --long 2>/dev/null || echo "0.0.0-dev")

# --env-file: docker compose interpola i build.args (NUXT_PUBLIC_*, NUXT_SITE_URL, …)
# definiti in docker/compose.yaml a partire da docker/.env (vedi .env.example).
echo "== deploy compose (version: $NUXT_PUBLIC_APP_VERSION) =="
docker compose -p iartnet-frontend \
  --project-directory "$APP_DIR" \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  up -d --build

echo "== status =="
docker compose -p iartnet-frontend \
  --project-directory "$APP_DIR" \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  ps

echo "== last logs =="
docker logs --tail=120 iartnet_frontend 2>/dev/null || true
