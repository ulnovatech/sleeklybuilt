#!/usr/bin/env bash
# Fail closed if production env files are missing required hardening.
# Usage: validate-prod-env.sh [sleeklybuilt.env] [discovery.env]
set -euo pipefail

HUB_ENV="${1:-${SLEEKLYBUILT_ENV_FILE:-/opt/sleeklybuilt/env/docker.sleeklybuilt.env}}"
DISC_ENV="${2:-${DISCOVERY_ENV_FILE:-/opt/sleeklybuilt/env/docker.discovery.env}}"
failed=0

env_val() {
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${key}=" "$file" 2>/dev/null | tail -n 1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//'
}

is_false() {
  local v
  v="$(echo "${1:-}" | tr '[:upper:]' '[:lower:]')"
  [[ "$v" == "false" || "$v" == "0" || "$v" == "no" ]]
}

is_blank_or_placeholder() {
  local v="${1:-}"
  [[ -z "$v" || "$v" == *"YOUR_"* || "$v" == *"change_me"* || "$v" == *"changeme"* || "$v" == *"REPLACE"* ]]
}

fail() {
  echo "FAIL: $1" >&2
  failed=1
}

ok() {
  echo "OK  $1"
}

echo "==> validate prod env"
echo "    hub: $HUB_ENV"
echo "    discovery: $DISC_ENV"

[[ -f "$HUB_ENV" ]] || fail "missing hub env file"
[[ -f "$DISC_ENV" ]] || fail "missing discovery env file"

if [[ -f "$HUB_ENV" ]]; then
  app_debug="$(env_val "$HUB_ENV" APP_DEBUG)"
  if is_false "$app_debug"; then
    ok "APP_DEBUG is false"
  else
    fail "APP_DEBUG must be false (got '${app_debug:-empty}')"
  fi

  base_url="$(env_val "$HUB_ENV" BASE_URL)"
  if [[ "$base_url" == https://* ]]; then
    ok "BASE_URL is HTTPS"
  else
    fail "BASE_URL must start with https:// (got '${base_url:-empty}')"
  fi

  jwks="$(env_val "$HUB_ENV" CLERK_JWKS_URL)"
  issuer="$(env_val "$HUB_ENV" CLERK_ISSUER)"
  pk="$(env_val "$HUB_ENV" CLERK_PUBLISHABLE_KEY)"
  if is_blank_or_placeholder "$jwks" || is_blank_or_placeholder "$issuer" || is_blank_or_placeholder "$pk"; then
    fail "hub Clerk CLERK_PUBLISHABLE_KEY + CLERK_JWKS_URL + CLERK_ISSUER must be set (not placeholders)"
  else
    ok "hub Clerk JWT verify vars present"
  fi
fi

if [[ -f "$DISC_ENV" ]]; then
  allow_dev="$(env_val "$DISC_ENV" ALLOW_DEV_AUTH)"
  if is_false "$allow_dev" || [[ -z "$allow_dev" ]]; then
    ok "ALLOW_DEV_AUTH is false"
  else
    fail "ALLOW_DEV_AUTH must be false (got '${allow_dev}')"
  fi

  app_url="$(env_val "$DISC_ENV" NEXT_PUBLIC_APP_URL)"
  if [[ "$app_url" == https://* ]]; then
    ok "NEXT_PUBLIC_APP_URL is HTTPS"
  else
    fail "NEXT_PUBLIC_APP_URL must start with https:// (got '${app_url:-empty}')"
  fi

  clerk_sk="$(env_val "$DISC_ENV" CLERK_SECRET_KEY)"
  clerk_pk="$(env_val "$DISC_ENV" NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
  if is_blank_or_placeholder "$clerk_sk" || is_blank_or_placeholder "$clerk_pk"; then
    fail "Discovery CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be set"
  else
    ok "Discovery Clerk keys present"
  fi
fi

if [[ "$failed" -ne 0 ]]; then
  echo "validate-prod-env: failed" >&2
  exit 1
fi

echo "validate-prod-env: ok"
