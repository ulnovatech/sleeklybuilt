#!/usr/bin/env bash
# One-shot: harden Discovery auth + seed hub Clerk JWT verify vars from Discovery publishable key.
set -euo pipefail

DISC="${DISCOVERY_ENV_FILE:-/opt/sleeklybuilt/env/docker.discovery.env}"
HUB="${SLEEKLYBUILT_ENV_FILE:-/opt/sleeklybuilt/env/docker.sleeklybuilt.env}"

if [[ ! -f "$DISC" || ! -f "$HUB" ]]; then
  echo "Missing env files" >&2
  exit 1
fi

if grep -qE '^ALLOW_DEV_AUTH=' "$DISC"; then
  sed -i 's/^ALLOW_DEV_AUTH=.*/ALLOW_DEV_AUTH=false/' "$DISC"
else
  printf '\nALLOW_DEV_AUTH=false\n' >> "$DISC"
fi
echo "OK ALLOW_DEV_AUTH=false"

pk="$(grep -E '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' "$DISC" | tail -n 1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')"
if [[ -z "$pk" || "$pk" == *"YOUR_"* ]]; then
  echo "FAIL: Discovery NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing" >&2
  exit 1
fi

fapi="$(PK="$pk" python3 - <<'PY'
import base64, os, re
pk = os.environ["PK"].strip().strip('"').strip("'")
m = re.match(r"pk_(?:test|live)_(.+)$", pk)
if not m:
    raise SystemExit("unrecognized publishable key shape")
raw = m.group(1)
pad = "=" * ((4 - len(raw) % 4) % 4)
decoded = base64.urlsafe_b64decode(raw + pad).decode("utf-8", errors="ignore").rstrip("\x00").rstrip("$")
if "." not in decoded:
    raise SystemExit(f"decoded FAPI invalid: {decoded!r}")
print(decoded)
PY
)"

issuer="https://${fapi}"
jwks="${issuer}/.well-known/jwks.json"

upsert_hub() {
  local key="$1" val="$2"
  if grep -qE "^${key}=" "$HUB"; then
    # escape & for sed
    local esc
    esc="$(printf '%s' "$val" | sed 's/[&|\\]/\\&/g')"
    sed -i "s|^${key}=.*|${key}=${esc}|" "$HUB"
  else
    printf '\n%s=%s\n' "$key" "$val" >> "$HUB"
  fi
}

upsert_hub CLERK_PUBLISHABLE_KEY "$pk"
upsert_hub CLERK_ISSUER "$issuer"
upsert_hub CLERK_JWKS_URL "$jwks"

admin="$(grep -E '^CLERK_ADMIN_USER_ID=' "$DISC" | tail -n 1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//' || true)"
if [[ -n "${admin:-}" && "$admin" != *"YOUR_"* ]]; then
  upsert_hub CLERK_ADMIN_USER_ID "$admin"
fi

echo "OK hub Clerk JWT verify vars seeded (issuer host: ${fapi})"
bash "$(dirname "$0")/validate-prod-env.sh" "$HUB" "$DISC"
