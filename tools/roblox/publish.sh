#!/usr/bin/env bash
# Builds, tests and uploads the Roblox place through the Open Cloud Place Publishing API,
# so an update needs no manual save in Studio.
#
#   tools/roblox/publish.sh setup               store the API key (one time)
#   tools/roblox/publish.sh check               verify settings without uploading
#   tools/roblox/publish.sh saved [--phoenicia]     upload as a saved version; players don't get it
#   tools/roblox/publish.sh published [--phoenicia] upload and make it live for players
#
# An upload replaces the whole place with what this repo builds, so anything added only
# in Studio is overwritten. Earlier versions stay available in the place's version history.
set -euo pipefail

CONFIG="${HOME}/.config/miraverse/roblox.env"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_BASE="https://apis.roblox.com/universes/v1"
# The Miraverse experience. These IDs are public; only the API key is secret.
ROBLOX_UNIVERSE_ID=10774667343
ROBLOX_PLACE_ID=137990683693866

load_config() {
  if [[ ! -f "$CONFIG" ]]; then
    echo "Missing $CONFIG. Run tools/roblox/publish.sh setup in your own terminal." >&2
    exit 1
  fi
  # shellcheck disable=SC1090
  source "$CONFIG"
  if [[ -z "${ROBLOX_API_KEY:-}" ]]; then
    echo "ROBLOX_API_KEY is not set in $CONFIG." >&2
    exit 1
  fi
}

setup() {
  mkdir -p "$(dirname "$CONFIG")"
  read -r -s -p "Open Cloud API key (hidden): " api_key
  echo
  (
    umask 077
    printf 'ROBLOX_API_KEY=%q\n' "$api_key" >"$CONFIG"
  )
  echo "Saved to $CONFIG."
}

publish() {
  local version_type="$1" phoenicia="$2" mode place
  load_config
  cd "$ROOT"
  if [[ "$phoenicia" == "yes" ]]; then
    mode="phoenicia"
    place="apps/roblox/dist/miraverse-phoenicia-staging.rbxlx"
    npm run -s build:phoenicia:roblox
  else
    mode="default"
    place="apps/roblox/dist/miraverse.rbxlx"
    npm run -s build:roblox
  fi

  # A place that fails the boot test never reaches Roblox.
  lune run tests/roblox/boot.luau "$mode" "$place" | tail -1

  local url="${API_BASE}/${ROBLOX_UNIVERSE_ID}/places/${ROBLOX_PLACE_ID}/versions?versionType=${version_type}"
  local response status body
  # The key goes through stdin so it never appears in the process list.
  response="$(printf 'x-api-key: %s\n' "$ROBLOX_API_KEY" | curl -sS -X POST "$url" \
    -H @- -H 'Content-Type: application/xml' \
    --data-binary "@${place}" -w '\n%{http_code}')"
  status="${response##*$'\n'}"
  body="${response%$'\n'*}"
  if [[ "$status" != "200" ]]; then
    echo "Upload failed (HTTP $status): $body" >&2
    exit 1
  fi
  echo "Uploaded $mode build as $version_type to place $ROBLOX_PLACE_ID: $body"
}

command="${1:-}"
option="${2:-}"
phoenicia="no"
if [[ "$option" == "--phoenicia" ]]; then
  phoenicia="yes"
elif [[ -n "$option" ]]; then
  echo "Unknown option: $option" >&2
  exit 1
fi

case "$command" in
  setup) setup ;;
  check)
    load_config
    echo "Settings found for universe $ROBLOX_UNIVERSE_ID, place $ROBLOX_PLACE_ID."
    ;;
  saved) publish Saved "$phoenicia" ;;
  published) publish Published "$phoenicia" ;;
  *)
    echo "Usage: tools/roblox/publish.sh setup|check|saved|published [--phoenicia]" >&2
    exit 1
    ;;
esac
