#!/usr/bin/env bash
# Resolve Lead Discover / Discovery Intelligence source directory (C0).
# Prints an absolute path to stdout. Exit 1 if not found.
#
# Order:
#   1) DISCOVERY_SRC env (explicit)
#   2) Sibling ../lead discover - sleekly (local htdocs layout)
#   3) ./discovery (junction locally, or rsynced tree on GCE / in-repo checkout)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -n "${DISCOVERY_SRC:-}" ]]; then
  if [[ -d "$DISCOVERY_SRC" && -f "$DISCOVERY_SRC/package.json" ]]; then
    cd "$DISCOVERY_SRC" && pwd
    exit 0
  fi
  echo "DISCOVERY_SRC set but invalid: $DISCOVERY_SRC" >&2
  exit 1
fi

SIBLING="$(cd "$ROOT/.." && pwd)/lead discover - sleekly"
if [[ -d "$SIBLING" && -f "$SIBLING/package.json" ]]; then
  cd "$SIBLING" && pwd
  exit 0
fi

if [[ -d "$ROOT/discovery" && -f "$ROOT/discovery/package.json" ]]; then
  cd "$ROOT/discovery" && pwd
  exit 0
fi

echo "Discovery source not found. Set DISCOVERY_SRC or place the Lead Discover tree at:" >&2
echo "  $SIBLING" >&2
echo "  or $ROOT/discovery" >&2
echo "See docs/DISCOVERY_SOURCE.md" >&2
exit 1
