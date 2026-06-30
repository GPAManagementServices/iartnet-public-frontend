#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/opt/iartnet_frontend"
DOCKER_DIR="${REPO_DIR}/docker"
ENV_FILE="${DOCKER_DIR}/.env"
SERVICE_NAME="frontend"
CONTAINER_NAME="iartnet_frontend"

# Build-time URLs: docker/compose.yaml passa i build.args da variabili presenti in
# ENV_FILE (NUXT_PUBLIC_BASE_URL, NUXT_PUBLIC_BASE_DATA_URL, NUXT_PUBLIC_BASEIIIF_URL,
# NUXT_SITE_URL, NUXT_PUBLIC_SITE_URL, NUXT_PUBLIC_WAI_*, NUXT_PUBLIC_SITEMAP_ENABLED, …).
# Impostarle in docker/.env — vedi docker/.env.example. Immagine CI (main) = host STG: non promuovere in PROD senza rebuild PROD.

VERSION_MODE="${VERSION_MODE:-count-hash}"   # count | hash | count-hash
FETCH_REMOTE="${FETCH_REMOTE:-1}"            # 1 = esegue git fetch --all --prune
PULL_REMOTE="${PULL_REMOTE:-1}"              # 1 = esegue git pull --ff-only
PULL_REMOTE_NAME="${PULL_REMOTE_NAME:-origin}"
PULL_REMOTE_BRANCH="${PULL_REMOTE_BRANCH:-}"
GIT_REF="${GIT_REF:-HEAD}"                   # HEAD = codice realmente buildato

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  log "ERRORE: $*"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando mancante: $1"
}

update_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -qE "^${key}=" "$file"; then
    sed -i -E "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

wait_container_running() {
  local name="$1"
  local max_wait="${2:-30}"
  local i

  for i in $(seq 1 "$max_wait"); do
    local status
    status="$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null || true)"
    if [[ "$status" == "running" ]]; then
      return 0
    fi
    sleep 1
  done

  return 1
}

wait_container_healthy_if_defined() {
  local name="$1"
  local max_wait="${2:-60}"

  local health
  health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$name" 2>/dev/null || true)"

  if [[ "$health" == "no-healthcheck" ]]; then
    return 0
  fi

  local i
  for i in $(seq 1 "$max_wait"); do
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$name" 2>/dev/null || true)"
    if [[ "$health" == "healthy" ]]; then
      return 0
    fi
    if [[ "$health" == "unhealthy" ]]; then
      return 1
    fi
    sleep 1
  done

  return 1
}

main() {
  require_cmd git
  require_cmd docker
  require_cmd sed
  require_cmd grep
  require_cmd date

  [[ -d "$REPO_DIR" ]] || fail "Repo non trovato: $REPO_DIR"
  [[ -d "$DOCKER_DIR" ]] || fail "Cartella docker non trovata: $DOCKER_DIR"
  [[ -f "$ENV_FILE" ]] || fail "File .env non trovato: $ENV_FILE"

  cd "$REPO_DIR"

  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"

  if [[ "$FETCH_REMOTE" == "1" ]]; then
    log "Eseguo git fetch --all --prune"
    git fetch --all --prune
  fi

  if [[ "$PULL_REMOTE" == "1" ]]; then
    if [[ -z "$PULL_REMOTE_BRANCH" ]]; then
      PULL_REMOTE_BRANCH="$current_branch"
    fi

    log "Eseguo git pull --ff-only ${PULL_REMOTE_NAME} ${PULL_REMOTE_BRANCH}"
    git pull --ff-only "$PULL_REMOTE_NAME" "$PULL_REMOTE_BRANCH"
  fi

  local commit_count short_hash version branch_name
  commit_count="$(git rev-list --count "$GIT_REF")"
  short_hash="$(git rev-parse --short "$GIT_REF")"
  branch_name="$(git rev-parse --abbrev-ref HEAD)"

  case "$VERSION_MODE" in
    count)
      version="0.0.${commit_count}-dev"
      ;;
    hash)
      version="0.0.0-dev+${short_hash}"
      ;;
    count-hash)
      version="0.0.${commit_count}-dev+${short_hash}"
      ;;
    *)
      fail "VERSION_MODE non valido: $VERSION_MODE (usa: count | hash | count-hash)"
      ;;
  esac

  log "Branch corrente: ${branch_name}"
  log "Git ref usato per la versione: ${GIT_REF}"
  log "Versione calcolata: ${version}"

  local backup_file
  backup_file="${ENV_FILE}.bak.$(date '+%Y%m%d_%H%M%S')"
  cp "$ENV_FILE" "$backup_file"
  log "Backup .env creato: $backup_file"

  update_env_var "NUXT_PUBLIC_APP_VERSION" "$version" "$ENV_FILE"
  log "Aggiornato ${ENV_FILE}"

  for k in NUXT_PUBLIC_BASE_URL NUXT_PUBLIC_BASE_DATA_URL NUXT_PUBLIC_BASEIIIF_URL NUXT_SITE_URL NUXT_PUBLIC_SITE_URL; do
    if ! grep -qE "^${k}=" "$ENV_FILE"; then
      log "ATTENZIONE: manca ${k} in ${ENV_FILE} — il build userà i default di nuxt.config (STG) per questa chiave"
    fi
  done

  cd "$DOCKER_DIR"

  log "Rebuild e recreate del servizio ${SERVICE_NAME}"
  docker compose --env-file "$ENV_FILE" up -d --build --force-recreate "$SERVICE_NAME"

  log "Attendo che il container sia running"
  wait_container_running "$CONTAINER_NAME" 30 || fail "Il container ${CONTAINER_NAME} non è partito"

  log "Attendo healthcheck del container"
  if ! wait_container_healthy_if_defined "$CONTAINER_NAME" 90; then
    log "Il container non risulta healthy. Ultimi log:"
    docker logs --tail 100 "$CONTAINER_NAME" || true
    fail "Healthcheck fallito per ${CONTAINER_NAME}"
  fi

  local deployed_env ports image_id container_id
  deployed_env="$(docker exec "$CONTAINER_NAME" sh -lc 'printenv NUXT_PUBLIC_APP_VERSION || true' 2>/dev/null || true)"
  ports="$(docker ps --filter "name=^/${CONTAINER_NAME}$" --format '{{.Ports}}')"
  image_id="$(docker inspect -f '{{.Image}}' "$CONTAINER_NAME" 2>/dev/null || true)"
  container_id="$(docker inspect -f '{{.Id}}' "$CONTAINER_NAME" 2>/dev/null | cut -c1-12 || true)"

  echo
  echo "============================================"
  echo "Deploy completato"
  echo "============================================"
  echo "Repository      : $REPO_DIR"
  echo "Branch          : $branch_name"
  echo "Git ref         : $GIT_REF"
  echo "Commit count    : $commit_count"
  echo "Commit hash     : $short_hash"
  echo "Versione attesa : $version"
  echo "Versione .env   : $(grep '^NUXT_PUBLIC_APP_VERSION=' "$ENV_FILE" | head -n1)"
  echo "Versione in ctr : ${deployed_env:-<non letta>}"
  echo "Container       : ${CONTAINER_NAME} (${container_id:-n/a})"
  echo "Image           : ${image_id:-n/a}"
  echo "Ports           : ${ports:-n/a}"
  echo "============================================"
  echo

  if [[ -n "${deployed_env:-}" && "$deployed_env" != "$version" ]]; then
    log "ATTENZIONE: la versione nel container non coincide con quella attesa"
    exit 2
  fi
}

main "$@"
