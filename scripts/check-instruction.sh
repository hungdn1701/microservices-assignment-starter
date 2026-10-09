#!/usr/bin/env bash
# Verifies INSTRUCTION.md is identical to the official version published by the instructor.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="https://raw.githubusercontent.com/hungdn1701/microservices-assignment-starter/main/INSTRUCTION.md"

if ! official="$(curl -fsSL "$URL")"; then
  echo "WARN: could not download $URL — skipping check"
  exit 0
fi
if [ "$official" == "$(cat INSTRUCTION.md)" ]; then
  echo "OK: INSTRUCTION.md matches the official version"
else
  echo "FAIL: INSTRUCTION.md differs from the official version."
  echo "It is read-only for students. If the instructor updated it, sync your copy:"
  echo "  curl -fsSL $URL -o INSTRUCTION.md"
  diff <(echo "$official") INSTRUCTION.md | head -40 || true
  exit 1
fi
