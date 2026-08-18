#!/usr/bin/env bash
set -euo pipefail

ENV=/opt/sleeklybuilt/env/docker.discovery.env
PLACES_KEY="${1:?places key required}"
PLACES_ROTATION="${2:?places rotation required}"
CSE_KEY="${3:?cse key required}"

cp -a "$ENV" "$ENV.bak.$(date +%Y%m%d%H%M%S)"

grep -vE '^(GOOGLE_PLACES_API_KEY|GOOGLE_PLACES_API_KEYS|GOOGLE_CSE_API_KEY|ACQUISITION_MODE)=' "$ENV" > "$ENV.tmp"

{
  cat "$ENV.tmp"
  cat <<EOF
ACQUISITION_MODE=standard
GOOGLE_PLACES_API_KEY=${PLACES_KEY}
GOOGLE_PLACES_API_KEYS=${PLACES_ROTATION}
GOOGLE_CSE_API_KEY=${CSE_KEY}
EOF
} > "$ENV.new"

mv "$ENV.new" "$ENV"
rm -f "$ENV.tmp"
chmod 644 "$ENV"

echo "Updated env keys:"
grep -E '^(ACQUISITION_MODE|GOOGLE_PLACES_API_KEY|GOOGLE_PLACES_API_KEYS|GOOGLE_CSE_API_KEY)=' "$ENV" \
  | sed -E 's/(API_KEY|API_KEYS)=.*/\1=***SET***/'

cd /opt/sleeklybuilt/repo
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  up -d --force-recreate --no-deps discovery-web discovery-worker

sleep 10
docker compose -f infra/docker-compose.full.yml ps discovery-web discovery-worker
curl -sf http://127.0.0.1:3000/api/health
echo
