#!/usr/bin/env bash
# Smoke tests for sleeklybuilt Docker stack (Chunk 3)
set -euo pipefail

BASE="${1:-http://localhost:8080}"
HOST_HDR="${SMOKE_HOST:-sleeklybuilt.pro}"
ADMIN_USER="${DASH_ADMIN_USER:-sales@sleeklybuilt.pro}"
ADMIN_PASS="${DASH_ADMIN_PASS:-changeme}"
CURL=(curl -s -H "Host: ${HOST_HDR}")

echo "=== SleeklyBuilt smoke tests @ ${BASE} (Host: ${HOST_HDR}) ==="

code_health=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "${BASE}/health")
echo "GET /health → ${code_health}"
[[ "$code_health" == "200" ]] || { echo "FAIL: /health"; exit 1; }

code_home=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "${BASE}/")
echo "GET / → ${code_home}"
[[ "$code_home" == "200" ]] || { echo "FAIL: /"; exit 1; }

code_dash=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "${BASE}/dash/")
echo "GET /dash/ → ${code_dash}"
[[ "$code_dash" == "200" ]] || { echo "FAIL: /dash/"; exit 1; }

login_body=$("${CURL[@]}" -X POST "${BASE}/api/auth/mobile/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}")
echo "POST /api/auth/mobile/login → ${login_body:0:120}"

if echo "$login_body" | grep -q '"token"'; then
  echo "OK: mobile login returned token"
else
  echo "WARN: mobile login did not return token (check DASH_ADMIN_* in env file)"
fi

code_newsletter=$("${CURL[@]}" -o /dev/null -w '%{http_code}' -X POST "${BASE}/php/newsletter.php" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'email=smoke-test@example.com')
echo "POST /php/newsletter.php → ${code_newsletter}"
# 200/400/409/500 — 500 may mean missing DB table; still proves PHP-FPM routing
if [[ "$code_newsletter" =~ ^(200|400|409|422|500)$ ]]; then
  echo "OK: newsletter endpoint reachable"
else
  echo "FAIL: unexpected newsletter status ${code_newsletter}"
  exit 1
fi

perf_file="$(mktemp)"
code_perf=$("${CURL[@]}" -o "$perf_file" -w '%{http_code}' "${BASE}/performante")
echo "GET /performante → ${code_perf}"
[[ "$code_perf" == "200" ]] || { echo "FAIL: /performante"; rm -f "$perf_file"; exit 1; }
if grep -q 'Operator destinations' "$perf_file"; then
  echo "FAIL: unsigned /performante HTML leaked operator destinations"
  rm -f "$perf_file"
  exit 1
fi
echo "OK: /performante reachable without destination list in HTML"
rm -f "$perf_file"

echo "=== Smoke tests complete ==="
