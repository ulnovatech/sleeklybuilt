#!/usr/bin/env bash
# SleeklyBuilt rebrand smoke — local build artifacts + optional live host checks.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

HUB_URL="${HUB_URL:-http://hub.34.66.94.12.nip.io}"
BLOG_URL="${BLOG_URL:-http://hub.34.66.94.12.nip.io/blog/}"
PORTFOLIO_URL="${PORTFOLIO_URL:-http://hub.34.66.94.12.nip.io/portfolio-app/}"

fail=0

echo "==> Rebrand smoke (SleeklyBuilt)"

LEGACY_BRAND_RE='ulnovatech|ulnova|UlnoVaTech|Ulnovatech|UlnovaTech|Reachout'

check_no_legacy_brand_in() {
  local label="$1"
  shift
  local hits
  hits=$(rg -l -i "$LEGACY_BRAND_RE" "$@" 2>/dev/null || true)
  if [[ -n "$hits" ]]; then
    echo "FAIL: $label still contains legacy UlnoVaTech/ulnova/Reachout references:"
    echo "$hits"
    fail=1
  else
    echo "OK:   $label — no legacy brand strings"
  fi
}

check_has_sleekly_in() {
  local label="$1"
  local file="$2"
  if [[ ! -f "$file" ]]; then
    echo "WARN: $label missing ($file) — run build-production.sh first"
    return 0
  fi
  if rg -q 'SleeklyBuilt' "$file"; then
    echo "OK:   $label contains SleeklyBuilt"
  else
    echo "FAIL: $label missing SleeklyBuilt in $file"
    fail=1
  fi
}

for app in marketing portfolio/frontend sleekly-blog sleekly-dash/frontend; do
  if [[ -f "$app/package.json" ]]; then
    echo "==> Build $app"
    npm --prefix "$app" run build
  fi
done

echo "==> Scan built artifacts"
if [[ -d marketing/dist ]]; then
  check_no_legacy_brand_in "marketing/dist" marketing/dist
  check_has_sleekly_in "marketing index" marketing/dist/index.html
fi
if [[ -d portfolio/frontend/dist ]]; then
  check_no_legacy_brand_in "portfolio/dist" portfolio/frontend/dist
  check_has_sleekly_in "portfolio index" portfolio/frontend/dist/index.html
fi
if [[ -d sleekly-blog/dist ]]; then
  check_no_legacy_brand_in "blog/dist" sleekly-blog/dist
  check_has_sleekly_in "blog index" sleekly-blog/dist/index.html
fi

echo "==> Scan source configs (customer-facing)"
check_no_legacy_brand_in "marketing src" marketing/src --glob '!**/site.config.js'
check_no_legacy_brand_in "portfolio frontend src" portfolio/frontend/src --glob '!**/vite.config.js'
check_no_legacy_brand_in "sleekly-blog src pages" sleekly-blog/src/pages sleekly-blog/src/components/layout

if [[ "${SMOKE_LIVE:-0}" == "1" ]]; then
  echo "==> Live route checks"
  for url in "$HUB_URL" "$BLOG_URL" "$PORTFOLIO_URL"; do
    code=$(curl -sS -o /tmp/rebrand-smoke.html -w '%{http_code}' "$url" || echo "000")
    if [[ "$code" != "200" ]]; then
      echo "FAIL: $url returned HTTP $code"
      fail=1
      continue
    fi
    if rg -q 'SleeklyBuilt' /tmp/rebrand-smoke.html; then
      echo "OK:   $url — SleeklyBuilt present (HTTP $code)"
    else
      echo "WARN: $url — HTTP $code but SleeklyBuilt not found (deploy may be stale)"
    fi
    if rg -qi 'ulnovatech|ulnova|UlnoVaTech|Ulnovatech|Reachout' /tmp/rebrand-smoke.html; then
      echo "FAIL: $url still shows legacy brand"
      fail=1
    fi
  done
fi

if [[ "$fail" -ne 0 ]]; then
  echo "==> Rebrand smoke FAILED"
  exit 1
fi

echo "==> Rebrand smoke PASSED"
