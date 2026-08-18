#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-}"
BASE_URL="${2:-http://127.0.0.1}"

if [[ ! "$SLUG" =~ ^[a-z0-9.-]+$ ]]; then
  echo "Usage: $0 <template-slug> [base-url]" >&2
  exit 2
fi

CURL_HEADERS=()
if [[ -n "${SMOKE_HOST:-}" ]]; then
  CURL_HEADERS=(-H "Host: ${SMOKE_HOST}")
fi

TMP_HTML="$(mktemp)"
TMP_CATALOG="$(mktemp)"
trap 'rm -f "$TMP_HTML" "$TMP_CATALOG"' EXIT

curl -fsS "${CURL_HEADERS[@]}" \
  "${BASE_URL%/}/portfolio/portfolio/${SLUG}/" \
  -o "$TMP_HTML"

if ! grep -Fq '/portfolio/portfolio/cta.js' "$TMP_HTML"; then
  echo "FAIL: absolute SleeklyBuilt CTA is missing from ${SLUG}" >&2
  exit 1
fi

if grep -Eiq \
  'hireus-|webocean|webflow\.com/(templates|dashboard|made-in-webflow)|purchase[[:space:]]+website|transform[[:space:]]+this[[:space:]]+example[[:space:]]+website' \
  "$TMP_HTML"; then
  echo "FAIL: seller promotion remains in ${SLUG}" >&2
  exit 1
fi

curl -fsS "${CURL_HEADERS[@]}" \
  "${BASE_URL%/}/portfolio/api/portfolios.php" \
  -o "$TMP_CATALOG"

if ! grep -Fq "\"name\": \"${SLUG}\"" "$TMP_CATALOG"; then
  echo "FAIL: ${SLUG} is missing from the portfolio catalog API" >&2
  exit 1
fi

echo "OK: ${SLUG} publish smoke passed"
