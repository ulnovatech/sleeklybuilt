#!/usr/bin/env bash
set -euo pipefail
echo "== POST without header =="
curl -s -o /tmp/a.json -w 'HTTP %{http_code} len=%{size_download}\n' \
  -X POST -H 'Host: discovery.34.66.94.12.nip.io' -H 'Content-Type: application/json' \
  -d '{"country":"Uganda","city":"Kampala","industry":"Restaurant","runProfile":"standard"}' \
  http://127.0.0.1/api/discovery/runs
cat /tmp/a.json; echo
echo "== POST with X-Dev-User =="
curl -s -o /tmp/b.json -w 'HTTP %{http_code} len=%{size_download}\n' \
  -X POST -H 'Host: discovery.34.66.94.12.nip.io' -H 'Content-Type: application/json' \
  -H 'X-Dev-User: operator' \
  -d '{"country":"Uganda","city":"Kampala","industry":"Restaurant","runProfile":"standard"}' \
  http://127.0.0.1/api/discovery/runs
cat /tmp/b.json; echo
echo "== what Next server process sees for NODE_ENV =="
PID=$(docker inspect -f '{{.State.Pid}}' infra-discovery-web-1)
# Read environ of the node server process
sudo tr '\0' '\n' < /proc/$PID/environ | grep -E '^(NODE_ENV|ALLOW_DEV_AUTH|CLERK_|NEXT_PUBLIC_CLERK_PUBLISHABLE)' || true
# child node may be different
CHILD=$(pgrep -P "$PID" -a | head -5 || true)
echo "children: $CHILD"
for p in $(pgrep -f 'apps/dashboard/server.js' || true); do
  echo "-- pid $p --"
  sudo tr '\0' '\n' < /proc/$p/environ | grep -E '^(NODE_ENV|ALLOW_DEV_AUTH)' || true
done
