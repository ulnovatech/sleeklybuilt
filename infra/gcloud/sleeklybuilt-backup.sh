#!/usr/bin/env bash
# Compatibility wrapper — production backups live in infra/scripts/sleeklybuilt-backup.sh
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts/sleeklybuilt-backup.sh" "$@"
