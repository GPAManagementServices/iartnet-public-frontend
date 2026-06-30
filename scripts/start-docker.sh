#!/usr/bin/env bash
# Avvio stack Docker dalla root del repo (es. /opt/frontend sulla VM IARTNET_STG).
# Uso: ./scripts/start-docker.sh   oppure   bash scripts/start-docker.sh
set -e
cd "$(dirname "$0")/.."
docker compose -f docker/compose.yaml up -d
