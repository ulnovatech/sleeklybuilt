#!/usr/bin/env bash
# Restore a gzip SQL dump produced by sleeklybuilt-backup.sh.
# Does not run automatically. Requires CONFIRM=YES.
#
#   CONFIRM=YES bash infra/scripts/sleeklybuilt-restore.sh /opt/sleeklybuilt/backups/sleeklybuilt-2026-09-04.sql.gz
#   CONFIRM=YES bash infra/scripts/sleeklybuilt-restore.sh /opt/sleeklybuilt/backups/discovery-2026-09-04.sql.gz
set -euo pipefail

DUMP="${1:-}"
if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "Usage: CONFIRM=YES $0 /opt/sleeklybuilt/backups/<file>.sql.gz" >&2
  exit 1
fi

if [[ "${CONFIRM:-}" != "YES" ]]; then
  echo "Refusing to restore without CONFIRM=YES (this overwrites the live database)." >&2
  exit 1
fi

ROOT=/opt/sleeklybuilt
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
BASE="$(basename "$DUMP")"

dc() {
  docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml "$@"
}

if [[ "$BASE" == sleeklybuilt-*.sql.gz ]]; then
  echo "==> restore MySQL ${MYSQL_DB} from ${BASE}"
  gunzip -c "$DUMP" | dc exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "$MYSQL_DB"
elif [[ "$BASE" == discovery-*.sql.gz ]]; then
  echo "==> restore Postgres ${PG_DB} from ${BASE}"
  gunzip -c "$DUMP" | dc exec -T postgres psql -U "$PG_USER" -d "$PG_DB"
else
  echo "Unrecognized dump name '${BASE}'. Expected sleeklybuilt-YYYY-MM-DD.sql.gz or discovery-YYYY-MM-DD.sql.gz" >&2
  exit 1
fi

echo "==> restore complete"
