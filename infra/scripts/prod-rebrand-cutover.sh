#!/usr/bin/env bash
# Rename /opt/ulnovatech → /opt/sleeklybuilt and align compose mounts.
# Causes brief downtime. Run as root on the GCE host.
set -euo pipefail

OLD=/opt/ulnovatech
NEW=/opt/sleeklybuilt

if [[ -d "$NEW" && ! -d "$OLD" ]]; then
  echo "Already at $NEW"
  exit 0
fi
[[ -d "$OLD" ]] || { echo "Missing $OLD"; exit 1; }

COMPOSE_DIR="$OLD/repo/infra"
cd "$COMPOSE_DIR"
echo "==> Stopping stack"
docker compose -f docker-compose.full.yml -f docker-compose.prod.yml down || true

echo "==> Renaming deploy root"
mv "$OLD" "$NEW"

if [[ -f "$NEW/env/docker.ulnovatech.env" && ! -f "$NEW/env/docker.sleeklybuilt.env" ]]; then
  mv "$NEW/env/docker.ulnovatech.env" "$NEW/env/docker.sleeklybuilt.env"
fi

# Keep ulndash working until public_html is fully rebranded; optionally alias.
if [[ -d "$NEW/public_html/ulndash" && ! -d "$NEW/public_html/sleekly-dash" ]]; then
  ln -sfn ulndash "$NEW/public_html/sleekly-dash"
  echo "Created sleekly-dash → ulndash symlink"
fi

# Rewrite absolute paths in compose files currently on the VM
echo "==> Rewriting compose absolute paths"
find "$NEW/repo/infra" -type f \( -name '*.yml' -o -name '*.yaml' -o -name '*.conf' -o -name '*.sh' -o -name '*.env' \) \
  -print0 | xargs -0 sed -i \
  -e 's|/opt/ulnovatech|/opt/sleeklybuilt|g' \
  -e 's|docker.ulnovatech.env|docker.sleeklybuilt.env|g' \
  -e 's|/var/lib/ulnovatech|/var/lib/sleeklybuilt|g' \
  -e 's|/var/log/ulnovatech|/var/log/sleeklybuilt|g' || true

# Prefer sleekly-dash in nginx if conf still says ulndash — keep ulndash for compatibility
if [[ -f "$NEW/repo/infra/nginx/conf.d/ulnovatech.conf" ]]; then
  cp -a "$NEW/repo/infra/nginx/conf.d/ulnovatech.conf" "$NEW/repo/infra/nginx/conf.d/sleeklybuilt.conf" || true
  sed -i 's|ulndash/backend/api.php|sleekly-dash/backend/api.php|g' \
    "$NEW/repo/infra/nginx/conf.d/sleeklybuilt.conf" || true
fi

COMPOSE_DIR="$NEW/repo/infra"
cd "$COMPOSE_DIR"
export SLEEKLYBUILT_ENV_FILE="$NEW/env/docker.sleeklybuilt.env"
export PUBLIC_HTML_PATH="$NEW/public_html"

echo "==> Starting stack"
# Prefer sleeklybuilt.conf if present in compose; otherwise start with existing files
docker compose -f docker-compose.full.yml -f docker-compose.prod.yml up -d

echo "==> Waiting for mysql"
sleep 8
docker ps --format 'table {{.Names}}\t{{.Status}}' | head -20

echo "DONE. Deploy root is $NEW"
echo "Next: bash /tmp/prod-apply-site-contact.sh /tmp/site-contact-stage"
echo "Optional DB rename: mysqldump + create sleeklybuilt + update DB_NAME in env"
