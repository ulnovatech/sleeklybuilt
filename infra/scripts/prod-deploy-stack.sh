#!/usr/bin/env bash
# Run on the Linode VM after rsync (from /opt/sleeklybuilt/repo).
set -euo pipefail

cd /opt/sleeklybuilt/repo

# Google credentials stay under /opt/sleeklybuilt/secrets (mounted :ro at /var/www/secrets).
# Never copy service-account.json into public_html — nginx must not be able to serve it.
if [[ -f /opt/sleeklybuilt/secrets/service-account.json ]]; then
  chmod 600 /opt/sleeklybuilt/secrets/service-account.json || true
  echo "==> Google credentials present at /opt/sleeklybuilt/secrets (not in docroot)"
else
  echo "WARN: /opt/sleeklybuilt/secrets/service-account.json missing — dash Analytics/FCM will stay disconnected"
fi
# Remove any legacy copy left under the web root from older deploys
rm -f /opt/sleeklybuilt/public_html/sleekly-dash/backend/service-account.json \
  /opt/sleeklybuilt/public_html/ulndash/backend/service-account.json 2>/dev/null || true
rm -rf /opt/sleeklybuilt/public_html/ulndash 2>/dev/null || true

export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env
export DISCOVERY_BUILD_CONTEXT=../discovery
export COMPOSE_PROJECT_NAME=infra

if [[ ! -f "$SLEEKLYBUILT_ENV_FILE" ]]; then
  echo "Missing $SLEEKLYBUILT_ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$DISCOVERY_ENV_FILE" ]]; then
  echo "Missing $DISCOVERY_ENV_FILE" >&2
  exit 1
fi

chmod 644 "$SLEEKLYBUILT_ENV_FILE" 2>/dev/null || true
chmod 644 "$DISCOVERY_ENV_FILE" 2>/dev/null || true
test -r "$SLEEKLYBUILT_ENV_FILE"
test -r "$DISCOVERY_ENV_FILE"

echo "==> validate production env"
chmod +x /opt/sleeklybuilt/repo/infra/scripts/validate-prod-env.sh
bash /opt/sleeklybuilt/repo/infra/scripts/validate-prod-env.sh "$SLEEKLYBUILT_ENV_FILE" "$DISCOVERY_ENV_FILE"

# Empty host stubs so Docker can bind-mount real env into php-fpm.
# Nginx denies /.env and /php/*.non-php — stubs must stay empty on the host.
mkdir -p /opt/sleeklybuilt/public_html/php /opt/sleeklybuilt/public_html/sleekly-dash/backend
: > /opt/sleeklybuilt/public_html/php/.env
: > /opt/sleeklybuilt/public_html/sleekly-dash/backend/.env
chmod 600 /opt/sleeklybuilt/public_html/php/.env /opt/sleeklybuilt/public_html/sleekly-dash/backend/.env || true

if [[ -f /opt/sleeklybuilt/repo/.env && ! -f /opt/sleeklybuilt/repo/infra/.env ]]; then
  install -m 600 /opt/sleeklybuilt/repo/.env /opt/sleeklybuilt/repo/infra/.env
fi

set -a
# shellcheck disable=SC1090
source "$DISCOVERY_ENV_FILE"
set +a

mkdir -p /opt/sleeklybuilt/data/template-imports \
  /opt/sleeklybuilt/data/template-profiles \
  /opt/sleeklybuilt/logs/template-import

CRON_MARKER='# sleeklybuilt-template-import-maintenance'
CRON_JOB="17 3 * * * /bin/bash /opt/sleeklybuilt/repo/infra/scripts/run-template-import-maintenance.sh 2>&1 | /usr/bin/logger -t sleeklybuilt-template-import-maintenance ${CRON_MARKER}"
BACKUP_MARKER='# sleeklybuilt-db-backup'
BACKUP_JOB="12 2 * * * /bin/bash /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-backup.sh 2>&1 | /usr/bin/logger -t sleeklybuilt-backup ${BACKUP_MARKER}"
# Plan B: weekly Geofabrik Uganda extract (Sunday 03:00 Africa/Kampala ≈ 00:00 UTC)
GEOFABRIK_MARKER='# sleeklybuilt-osm-geofabrik'
GEOFABRIK_JOB="0 0 * * 0 docker compose --env-file /opt/sleeklybuilt/env/docker.discovery.env -f /opt/sleeklybuilt/repo/infra/docker-compose.full.yml -f /opt/sleeklybuilt/repo/infra/docker-compose.prod.yml exec -T discovery-worker pnpm discovery:osm-geofabrik 2>&1 | /usr/bin/logger -t sleeklybuilt-osm-geofabrik ${GEOFABRIK_MARKER}"
{
  crontab -l 2>/dev/null | grep -vF "$CRON_MARKER" | grep -vF "$BACKUP_MARKER" | grep -vF "$GEOFABRIK_MARKER" || true
  printf '%s\n' "$CRON_JOB"
  printf '%s\n' "$BACKUP_JOB"
  printf '%s\n' "$GEOFABRIK_JOB"
} | crontab -

dc() {
  docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml "$@"
}

# Compose interpolates build args from this file (service env_file is runtime-only).
dc_discovery() {
  docker compose --env-file "$DISCOVERY_ENV_FILE" \
    -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml "$@"
}

echo "==> hub up (mysql php-fpm postgres)"
dc up -d --build mysql php-fpm postgres

echo "==> wait for mysql + postgres"
for i in $(seq 1 60); do
  if dc exec -T mysql sh -c 'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' 2>/dev/null \
    && dc exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "databases ready"
    break
  fi
  sleep 2
done

echo "==> nginx up (--no-deps)"
dc up -d --build --no-deps nginx

echo "==> hydrate empty DBs from Cloudflare R2 (if configured)"
chmod +x /opt/sleeklybuilt/repo/infra/scripts/r2-s3.sh \
  /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-hydrate-from-r2.sh \
  /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-backup.sh \
  /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-restore.sh 2>/dev/null || true
bash /opt/sleeklybuilt/repo/infra/scripts/sleeklybuilt-hydrate-from-r2.sh \
  || echo "WARN: R2 hydrate skipped or failed"

echo "==> portfolio permissions"
dc exec -T php-fpm \
  sh -lc 'chgrp 33 /var/www/public_html/portfolio/portfolio && chmod 2775 /var/www/public_html/portfolio/portfolio' \
  || echo "WARN: portfolio chgrp skipped"

echo "==> apply_crm_foundation_migration"
dc exec -T php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/apply_crm_foundation_migration.php

echo "==> apply_admin_mobile_migrations"
dc exec -T php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/apply_admin_mobile_migrations.php

echo "==> apply_dash_users_migration"
dc exec -T php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/apply_dash_users_migration.php

echo "==> apply_template_import_migrations"
dc exec -T php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/apply_template_import_migrations.php

echo "==> apply_attendant_migration"
dc exec -T php-fpm \
  php /var/www/public_html/php/attendant/scripts/apply_attendant_migration.php \
  || echo "WARN: attendant migration skipped"

echo "==> template screenshot deps (puppeteer)"
dc exec -T php-fpm \
  sh -lc 'dir=/var/www/public_html/sleekly-dash/backend/scripts/template-screenshots
    if [ -f "$dir/package.json" ]; then
      cd "$dir" && npm install --omit=dev --no-fund --no-audit
    else
      echo "WARN: screenshot package missing — skipped"
    fi'

echo "==> merge_template_catalog"
dc exec -T php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/merge_template_catalog.php

echo "==> discovery-migrate"
if ! dc_discovery run --rm discovery-migrate; then
  echo "WARN: discovery-migrate failed — hub/dash auth already migrated; Discovery apps not started"
  docker compose -f infra/docker-compose.full.yml logs --no-color --tail=120 discovery-migrate || true
else
  echo "==> discovery-web / discovery-worker up"
  if [[ -n "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" ]]; then
    echo "Clerk publishable key present for image build (${#NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} chars)"
  else
    echo "WARN: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY empty — Discovery will skip Clerk init"
  fi
  echo "ALLOW_DEV_AUTH=${ALLOW_DEV_AUTH:-} (baked into discovery-web middleware)"

  # Free 127.0.0.1:3000 before recreate — stale discovery-web (or orphans) cause EADDRINUSE.
  echo "==> free host port 3000 for discovery-web"
  dc_discovery stop discovery-web discovery-worker 2>/dev/null || true
  dc_discovery rm -f discovery-web discovery-worker 2>/dev/null || true
  mapfile -t _port3000 < <(docker ps -q --filter publish=3000 2>/dev/null || true)
  if ((${#_port3000[@]})); then
    docker stop "${_port3000[@]}" 2>/dev/null || true
    docker rm -f "${_port3000[@]}" 2>/dev/null || true
  fi
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp 2>/dev/null || true
  fi
  sleep 1

  if ! dc_discovery up -d --build --force-recreate --remove-orphans discovery-web discovery-worker; then
    echo "WARN: discovery-web/worker up failed — hub/dash remain; check port 3000 / compose logs"
    dc_discovery logs --no-color --tail=80 discovery-web || true
  else
    echo "==> wait for discovery /api/health"
    discovery_ok=0
    for i in $(seq 1 45); do
      if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
        discovery_ok=1
        break
      fi
      sleep 2
    done
    if [[ "$discovery_ok" -eq 1 ]]; then
      echo "discovery health ok"
      echo "==> ensure Plan B Places dormancy on discovery env"
      if ! grep -qE '^GOOGLE_ACQUISITION_DISABLED=' "$DISCOVERY_ENV_FILE"; then
        printf '\n# Plan B — Places dormant; OSM harvest continues\nGOOGLE_ACQUISITION_DISABLED=true\n' >> "$DISCOVERY_ENV_FILE"
        dc_discovery up -d --force-recreate --no-deps discovery-web discovery-worker || true
      elif grep -qE '^GOOGLE_ACQUISITION_DISABLED=(false|0|no)\s*$' "$DISCOVERY_ENV_FILE"; then
        echo "WARN: GOOGLE_ACQUISITION_DISABLED is off — Plan B expects true while Places billing is down"
      fi
      echo "==> factory health (Plan B)"
      dc_discovery exec -T discovery-worker pnpm discovery:factory-health \
        || echo "WARN: factory-health failed — check OSM / credentials"
      echo "==> Geofabrik status (refresh if missing/stale)"
      if ! dc_discovery exec -T discovery-worker pnpm discovery:osm-geofabrik -- --status; then
        echo "==> Geofabrik refresh (first-time / status failed)"
        dc_discovery exec -T discovery-worker pnpm discovery:osm-geofabrik \
          || echo "WARN: Geofabrik refresh failed — Overpass fallback remains"
      fi
    else
      echo "WARN: discovery /api/health failed after wait"
      dc_discovery logs --no-color --tail=80 discovery-web || true
    fi
  fi
fi

echo "==> restore deploy ownership of public_html for next rsync"
HOST_UID="$(id -u)"
HOST_GID="$(id -g)"
dc exec -T -u 0 php-fpm chown -R "${HOST_UID}:${HOST_GID}" /var/www/public_html \
  || echo "WARN: public_html chown skipped"
dc exec -T php-fpm \
  sh -lc 'chgrp 33 /var/www/public_html/portfolio/portfolio && chmod 2775 /var/www/public_html/portfolio/portfolio' \
  || echo "WARN: portfolio chgrp skipped"

echo "==> recreate nginx"
dc up -d --force-recreate --no-deps nginx

dc ps
echo "==> prod-deploy-stack complete"
