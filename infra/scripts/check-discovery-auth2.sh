#!/usr/bin/env bash
set -euo pipefail
echo "== GET with browser-like headers =="
curl -s -o /tmp/runs.json -w 'HTTP %{http_code}\n' \
  -H 'Host: discovery.34.66.94.12.nip.io' \
  -H 'Accept: application/json' \
  -H 'X-Dev-User: operator' \
  http://127.0.0.1/api/discovery/runs
head -c 200 /tmp/runs.json; echo
echo "== GET without X-Dev-User =="
curl -s -o /tmp/runs2.json -w 'HTTP %{http_code}\n' \
  -H 'Host: discovery.34.66.94.12.nip.io' \
  -H 'Accept: application/json' \
  http://127.0.0.1/api/discovery/runs
head -c 200 /tmp/runs2.json; echo
echo "== auth status with X-Dev-User =="
curl -s -H 'Host: discovery.34.66.94.12.nip.io' -H 'X-Dev-User: operator' http://127.0.0.1/api/auth/status; echo
echo "== node env inside next process =="
# Inspect what Next sees via a tiny probe through health isn't enough; check server.js env
docker exec infra-discovery-web-1 node -e 'console.log({NODE_ENV:process.env.NODE_ENV,ALLOW_DEV_AUTH:process.env.ALLOW_DEV_AUTH,CLERK:!!process.env.CLERK_SECRET_KEY})'
