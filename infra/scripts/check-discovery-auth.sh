#!/usr/bin/env bash
set -euo pipefail
echo "== container auth env =="
docker exec infra-discovery-web-1 printenv | grep -E '^(ALLOW_DEV_AUTH|NODE_ENV|CLERK_|NEXT_PUBLIC_CLERK)' || true
echo "== auth status =="
curl -s -H 'Host: discovery.34.66.94.12.nip.io' http://127.0.0.1/api/auth/status; echo
echo "== runs GET =="
curl -sI -H 'Host: discovery.34.66.94.12.nip.io' http://127.0.0.1/api/discovery/runs | head -20
curl -s -H 'Host: discovery.34.66.94.12.nip.io' http://127.0.0.1/api/discovery/runs; echo
echo "== runs POST no header =="
curl -s -o /tmp/post.json -w '%{http_code}' -X POST -H 'Host: discovery.34.66.94.12.nip.io' -H 'Content-Type: application/json' -d '{}' http://127.0.0.1/api/discovery/runs; echo
cat /tmp/post.json; echo
