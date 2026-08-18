#!/usr/bin/env bash
set -euo pipefail

# Patch isDevAuthEnabled on the VM source tree (same fix as repo)
FILE=/opt/sleeklybuilt/repo/discovery/packages/config/src/env.ts
if [[ ! -f "$FILE" ]]; then
  echo "missing $FILE" >&2
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
p = Path('/opt/sleeklybuilt/repo/discovery/packages/config/src/env.ts')
text = p.read_text()
old = """export function isDevAuthEnabled(): boolean {
  return process.env.ALLOW_DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production';
}"""
new = """export function isDevAuthEnabled(): boolean {
  // Match dashboard middleware: Next production builds inline NODE_ENV=production,
  // so gating on NODE_ENV would disable interim GCE deploys that rely on ALLOW_DEV_AUTH.
  return process.env.ALLOW_DEV_AUTH === 'true';
}"""
if old not in text:
    if 'Match dashboard middleware' in text:
        print('already patched')
    else:
        raise SystemExit('expected isDevAuthEnabled block not found')
else:
    p.write_text(text.replace(old, new, 1))
    print('patched env.ts')
PY

cd /opt/sleeklybuilt/repo
export PUBLIC_HTML_PATH=/opt/sleeklybuilt/public_html
export SLEEKLYBUILT_ENV_FILE=/opt/sleeklybuilt/env/docker.sleeklybuilt.env
export DISCOVERY_ENV_FILE=/opt/sleeklybuilt/env/docker.discovery.env

# Bake NEXT_PUBLIC_* from env file into image build args
set -a
# shellcheck disable=SC1090
source "$DISCOVERY_ENV_FILE"
set +a

echo "== rebuilding discovery-web =="
docker compose --env-file "$DISCOVERY_ENV_FILE" \
  -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  build discovery-web

echo "== recreate discovery-web + nginx (refresh upstream IP) =="
docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  up -d --force-recreate --no-deps discovery-web

# Wait for healthy
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
    break
  fi
  sleep 2
done

docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  up -d --force-recreate --no-deps nginx
sleep 3

echo "== auth status =="
curl -s -H 'Host: discovery.34.66.94.12.nip.io' -H 'X-Dev-User: operator' http://127.0.0.1/api/auth/status; echo
echo "== POST with X-Dev-User =="
curl -s -o /tmp/post.json -w 'HTTP %{http_code}\n' \
  -X POST -H 'Host: discovery.34.66.94.12.nip.io' -H 'Content-Type: application/json' \
  -H 'X-Dev-User: operator' \
  -d '{"country":"Uganda","city":"Kampala","industry":"Restaurant","runProfile":"micro"}' \
  http://127.0.0.1/api/discovery/runs
head -c 400 /tmp/post.json; echo
