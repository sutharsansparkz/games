#!/usr/bin/env bash
# Start the SparkzWorlds API and Vite development server from any directory.
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

for command in node npm; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Error: $command is required but was not found in PATH." >&2
    exit 1
  fi
done

if [[ ! -d node_modules ]]; then
  echo "Installing project dependencies…"
  npm install
fi

if ! node --input-type=module -e "import { hasSteamCredentials } from './server/steam.js'; if (!hasSteamCredentials()) process.exit(1)" >/dev/null 2>&1; then
  echo "Warning: Steam is not configured. Add STEAM_API_KEY and STEAM_ID to .env to enable Steam sync."
fi

API_PID=''
WEB_PID=''

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  if [[ -n "$API_PID" ]]; then kill "$API_PID" 2>/dev/null || true; fi
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; fi
  if [[ -n "$API_PID" ]]; then wait "$API_PID" 2>/dev/null || true; fi
  if [[ -n "$WEB_PID" ]]; then wait "$WEB_PID" 2>/dev/null || true; fi

  exit "$exit_code"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

node server/index.js &
API_PID=$!
./node_modules/.bin/vite --host 0.0.0.0 "$@" &
WEB_PID=$!

echo "SparkzWorlds API: http://localhost:3001"
echo "SparkzWorlds web: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

# Keep the launcher alive and stop both processes if either one exits.
wait -n "$API_PID" "$WEB_PID"
