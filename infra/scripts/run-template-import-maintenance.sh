#!/usr/bin/env bash

set -euo pipefail

cd /opt/sleeklybuilt/repo
export PUBLIC_HTML_PATH="${PUBLIC_HTML_PATH:-/opt/sleeklybuilt/public_html}"
export SLEEKLYBUILT_ENV_FILE="${SLEEKLYBUILT_ENV_FILE:-/opt/sleeklybuilt/env/docker.sleeklybuilt.env}"
export DISCOVERY_ENV_FILE="${DISCOVERY_ENV_FILE:-/opt/sleeklybuilt/env/docker.discovery.env}"

docker compose \
  -f infra/docker-compose.full.yml \
  -f infra/docker-compose.prod.yml \
  exec -T -u www-data php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/purge_template_import_artifacts.php
