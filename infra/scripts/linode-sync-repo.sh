#!/usr/bin/env bash
set -euo pipefail
KEY="${LINODE_SSH_KEY:-/mnt/c/Users/Ojoh/.ssh/google_compute_engine}"
HOST="deploy@172.238.122.106"
SRC="/mnt/c/xampp/htdocs/ulnovatech/"

ssh -i "${KEY}" -o StrictHostKeyChecking=no "${HOST}" 'mkdir -p /opt/sleeklybuilt/public_html /opt/sleeklybuilt/repo/discovery'

rsync -az --delete -e "ssh -i ${KEY} -o StrictHostKeyChecking=no" \
  --exclude node_modules \
  --exclude vendor \
  --exclude public_html \
  --exclude .next \
  --exclude .turbo \
  --exclude .git \
  --exclude 'portfolio/portfolio' \
  "${SRC}" "${HOST}:/opt/sleeklybuilt/repo/"

DISCOVERY_SRC="$("${SRC}scripts/resolve-discovery-src.sh")"
rsync -az -e "ssh -i ${KEY} -o StrictHostKeyChecking=no" \
  --exclude node_modules \
  --exclude .next \
  --exclude .turbo \
  --exclude .env \
  "${DISCOVERY_SRC}/" "${HOST}:/opt/sleeklybuilt/repo/discovery/"

echo "repo sync complete"
