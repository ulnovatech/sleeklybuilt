#!/usr/bin/env bash
# Run on the GCE VM after rsync (from /opt/sleeklybuilt/repo).
set -euo pipefail

cd /opt/sleeklybuilt/repo

if [[ -f /opt/sleeklybuilt/secrets/service-account.json ]]; then
  install -m 600 -D /opt/sleeklybuilt/secrets/service-account.json \
    /opt/sleeklybuilt/public_html/sleekly-dash/backend/service-account.json
fi

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

mkdir -p /opt/sleeklybuilt/public_html/php /opt/sleeklybuilt/public_html/sleekly-dash/backend
: > /opt/sleeklybuilt/public_html/php/.env
: > /opt/sleeklybuilt/public_html/sleekly-dash/backend/.env

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
{
  crontab -l 2>/dev/null | grep -vF "$CRON_MARKER" || true
  printf '%s\n' "$CRON_JOB"
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

echo "==> nginx up (--no-deps)"
dc up -d --build --no-deps nginx

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
  dc_discovery up -d --build discovery-web discovery-worker
  sleep 3
  dc_discovery up -d discovery-web
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
  else
    echo "WARN: discovery /api/health failed after wait"
    dc_discovery logs --no-color --tail=80 discovery-web || true
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
