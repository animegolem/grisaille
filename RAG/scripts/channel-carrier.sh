#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OWNER_REPO="${OWNER_REPO:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
export CARRIER_CHANNEL=.relay
export CARRIER_STATE_DIR="$OWNER_REPO/.relay/state"
exec python3 "$SCRIPT_DIR/carrier.py" "$@" --repo "$OWNER_REPO"
