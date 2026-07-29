#!/usr/bin/env bash

set -euo pipefail

cd /opt/ulnovatech/repo
export PUBLIC_HTML_PATH="${PUBLIC_HTML_PATH:-/opt/ulnovatech/public_html}"
export ULNOVATECH_ENV_FILE="${ULNOVATECH_ENV_FILE:-/opt/ulnovatech/env/docker.ulnovatech.env}"
export DISCOVERY_ENV_FILE="${DISCOVERY_ENV_FILE:-/opt/ulnovatech/env/docker.discovery.env}"

docker compose \
  -f infra/docker-compose.full.yml \
  -f infra/docker-compose.prod.yml \
  exec -T -u www-data php-fpm \
  php /var/www/public_html/ulndash/backend/scripts/purge_template_import_artifacts.php
