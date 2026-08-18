#!/usr/bin/env bash
set -euo pipefail
cd /opt/sleeklybuilt/repo
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  up -d --force-recreate --no-deps nginx

sleep 4
echo "== discovery via nginx =="
curl -sI -H 'Host: discovery.34.66.94.12.nip.io' http://127.0.0.1/ | head -15
echo "== health =="
curl -sf -H 'Host: discovery.34.66.94.12.nip.io' http://127.0.0.1/api/health
echo
echo "== discovery-web IP =="
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' infra-discovery-web-1
