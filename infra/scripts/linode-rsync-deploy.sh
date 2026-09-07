#!/usr/bin/env bash
# Mirror .github/workflows/deploy.yml rsync steps to Linode from WSL/bash.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IP="${LINODE_IP:-172.238.122.106}"
SSH_KEY="${LINODE_SSH_KEY:-$HOME/.ssh/google_compute_engine}"
DEPLOY_USER="${LINODE_SSH_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_USER}@${IP}"
SSH_OPTS="-i ${SSH_KEY} -o StrictHostKeyChecking=no"

cd "$ROOT"

DISCOVERY_SRC="$(bash scripts/resolve-discovery-src.sh)"
echo "Discovery source: $DISCOVERY_SRC"

ssh $SSH_OPTS "$DEPLOY_HOST" 'mkdir -p /opt/sleeklybuilt/public_html /opt/sleeklybuilt/repo/discovery'

rsync -az --delete -e "ssh $SSH_OPTS" \
  --exclude '.env' \
  --exclude 'php/.env' \
  --exclude 'sleekly-dash/backend/.env' \
  --exclude '**/service-account.json' \
  --exclude 'ulndash/' \
  --exclude 'portfolio/portfolio/' \
  public_html/ "${DEPLOY_HOST}:/opt/sleeklybuilt/public_html/"

ssh $SSH_OPTS "$DEPLOY_HOST" 'mkdir -p /opt/sleeklybuilt/public_html/attendant'
rsync -az --delete -e "ssh $SSH_OPTS" \
  attendant/schemas attendant/prompts attendant/rules attendant/skills \
  attendant/company attendant/expertise \
  "${DEPLOY_HOST}:/opt/sleeklybuilt/public_html/attendant/"

ssh $SSH_OPTS "$DEPLOY_HOST" \
  'mkdir -p /opt/sleeklybuilt/public_html/portfolio/portfolio'
rsync -az -e "ssh $SSH_OPTS" \
  --exclude 'catalog.json' \
  public_html/portfolio/portfolio/ \
  "${DEPLOY_HOST}:/opt/sleeklybuilt/public_html/portfolio/portfolio/" 2>/dev/null || true
if [[ -f public_html/portfolio/portfolio/catalog.json ]]; then
  rsync -az -e "ssh $SSH_OPTS" \
    public_html/portfolio/portfolio/catalog.json \
    "${DEPLOY_HOST}:/opt/sleeklybuilt/public_html/sleekly-dash/backend/.catalog.build.json"
fi

rsync -az -e "ssh $SSH_OPTS" \
  --exclude 'env/*.env' \
  --exclude 'env/docker.sleeklybuilt.env' \
  --exclude 'env/docker.discovery.env' \
  --exclude '.env' \
  infra/ "${DEPLOY_HOST}:/opt/sleeklybuilt/repo/infra/"

rsync -az -e "ssh $SSH_OPTS" \
  --exclude node_modules \
  --exclude .next \
  --exclude .turbo \
  --exclude .env \
  "${DISCOVERY_SRC}/" "${DEPLOY_HOST}:/opt/sleeklybuilt/repo/discovery/"

echo "Rsync complete -> ${IP}"

ssh $SSH_OPTS "$DEPLOY_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
# Credentials live only under /opt/sleeklybuilt/secrets (php-fpm mount).
rm -f /opt/sleeklybuilt/public_html/sleekly-dash/backend/service-account.json \
  /opt/sleeklybuilt/public_html/ulndash/backend/service-account.json 2>/dev/null || true
rm -rf /opt/sleeklybuilt/public_html/ulndash 2>/dev/null || true
if [[ -f /opt/sleeklybuilt/secrets/service-account.json ]]; then
  chmod 600 /opt/sleeklybuilt/secrets/service-account.json || true
  echo "Google credentials confirmed outside docroot"
else
  echo "WARN: Linode secrets/service-account.json missing"
fi
REMOTE
