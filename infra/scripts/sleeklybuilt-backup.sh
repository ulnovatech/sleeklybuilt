#!/usr/bin/env bash
# Daily MySQL + Postgres dumps on the Linode VM.
# Installed via prod-deploy-stack.sh crontab (02:12 UTC).
set -euo pipefail

ROOT=/opt/sleeklybuilt
OUT="${ROOT}/backups"
STAMP=$(date +%F)
mkdir -p "$OUT"
cd "${ROOT}/repo"

export PUBLIC_HTML_PATH="${ROOT}/public_html"
export SLEEKLYBUILT_ENV_FILE="${ROOT}/env/docker.sleeklybuilt.env"
export DISCOVERY_ENV_FILE="${ROOT}/env/docker.discovery.env"
export COMPOSE_PROJECT_NAME=infra

set -a
# shellcheck disable=SC1091
[[ -f "${ROOT}/repo/infra/.env" ]] && source "${ROOT}/repo/infra/.env"
[[ -f "${ROOT}/repo/.env" ]] && source "${ROOT}/repo/.env"
set +a

MYSQL_DB="${MYSQL_DATABASE:-sleeklybuilt}"
PG_DB="${POSTGRES_DB:-agency_platform}"
PG_USER="${POSTGRES_USER:-postgres}"

dc() {
  docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml "$@"
}

echo "==> dump MySQL ${MYSQL_DB}"
dc exec -T mysql \
  mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" --single-transaction "$MYSQL_DB" \
  | gzip > "${OUT}/sleeklybuilt-${STAMP}.sql.gz"

echo "==> dump Postgres ${PG_DB}"
dc exec -T postgres \
  pg_dump -U "$PG_USER" "$PG_DB" \
  | gzip > "${OUT}/discovery-${STAMP}.sql.gz"

find "$OUT" -type f -name '*.sql.gz' -mtime +14 -delete
echo "==> backups in ${OUT} (retained 14 days)"
ls -lh "$OUT"/*-"${STAMP}".sql.gz
