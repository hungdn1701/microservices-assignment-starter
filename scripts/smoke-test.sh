#!/usr/bin/env bash
# Smoke test: every component that has source code answers on its published port.
# Usage: bash scripts/smoke-test.sh   (start the system first with `make up-d`)
# Edit the CHECKS list when you rename or add components:  "<folder>|<url>"
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

CHECKS=(
  "gateway|http://localhost:${GATEWAY_PORT:-8080}/health"
  "services/service-a|http://localhost:${SERVICE_A_PORT:-5001}/health"
  "services/service-b|http://localhost:${SERVICE_B_PORT:-5002}/health"
  "frontend|http://localhost:${FRONTEND_PORT:-3000}/"
)

has_code() { find "$1/src" -type f ! -name .gitkeep 2>/dev/null | grep -q .; }

failed=0; checked=0
for entry in "${CHECKS[@]}"; do
  dir=${entry%%|*}; url=${entry#*|}
  if ! has_code "$dir"; then echo "SKIP $dir (no code yet)"; continue; fi
  checked=$((checked + 1))
  ok=0
  for _ in $(seq 1 30); do
    body=$(curl -fsS "$url" 2>/dev/null) && { ok=1; break; }
    sleep 2
  done
  if [ $ok -eq 0 ]; then echo "FAIL $dir — no response from $url"; failed=1; continue; fi
  if [[ "$url" == */health ]] && ! echo "$body" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
    echo "FAIL $dir — $url returned: $body"; failed=1; continue
  fi
  echo "OK   $dir ($url)"
done

[ $checked -eq 0 ] && echo "Nothing to check yet — add code to a component's src/."
exit $failed
