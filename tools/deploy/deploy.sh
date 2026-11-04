#!/usr/bin/env bash
# Non-interactive Cloudflare Pages deploy. Credentials live outside the repo.
# Usage: tools/deploy/deploy.sh setup | check | preview | production [--allow-dirty]
set -euo pipefail

CREDS="${MIRAVERSE_DEPLOY_ENV:-$HOME/.config/miraverse/deploy.env}"
PROJECT="miraverse"
ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "$ROOT"

die() { echo "error: $*" >&2; exit 1; }

# Secrets go to curl on stdin so they never appear in the process list.
api() { # api <bearer-token> <url>
  printf 'header = "Authorization: Bearer %s"\n' "$1" | curl -sS --fail-with-body --config - "$2"
}
json() { # json <python expression over d>
  python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"
}

setup() {
  [ -t 0 ] || die "setup needs a terminal; run it yourself so keys stay out of the Claude session"
  read -rp "Cloudflare account ID: " account
  read -rsp "Cloudflare API token (Cloudflare Pages: Edit): " cf_token; echo
  read -rsp "Stripe restricted key (Prices: Read; Enter to skip): " stripe_key; echo
  mkdir -p "$(dirname "$CREDS")"
  chmod 700 "$(dirname "$CREDS")"
  ( umask 077
    { printf 'CLOUDFLARE_ACCOUNT_ID=%q\nCLOUDFLARE_API_TOKEN=%q\n' "$account" "$cf_token"
      [ -z "$stripe_key" ] || printf 'STRIPE_API_KEY=%q\n' "$stripe_key"
    } > "$CREDS" )
  echo "Saved $CREDS"
}

load_creds() {
  [ -f "$CREDS" ] || die "$CREDS not found; run: tools/deploy/deploy.sh setup"
  [ -z "$(find "$CREDS" -perm /077)" ] || die "$CREDS is readable by others; run: chmod 600 $CREDS"
  set -a; . "$CREDS"; set +a
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] \
    || die "$CREDS must set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID"
}

production_branch() {
  api "$CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT" \
    | json "d['result']['production_branch']"
}

check() {
  local branch price
  branch="$(production_branch)" || die "Cloudflare token cannot read Pages project '$PROJECT'"
  echo "Cloudflare: OK (production branch: $branch)"
  if [ -z "${STRIPE_API_KEY:-}" ]; then
    echo "Stripe: skipped (no STRIPE_API_KEY)"
    return
  fi
  for price in $(grep -oE 'price_[A-Za-z0-9]+' wrangler.toml); do
    api "$STRIPE_API_KEY" "https://api.stripe.com/v1/prices/$price" \
      | json "'Stripe: OK $price active=%s live=%s' % (d['active'], d['livemode'])" \
      || die "Stripe could not read $price"
  done
}

deploy() { # deploy <preview|production> [--allow-dirty]
  local mode="$1" flag="${2:-}" branch current dirty_arg=()
  check
  current="$(git rev-parse --abbrev-ref HEAD)"
  if [ -n "$(git status --porcelain)" ]; then
    [ "$flag" = "--allow-dirty" ] || die "working tree has uncommitted changes; commit them or pass --allow-dirty"
    dirty_arg=(--commit-dirty=true)
  fi
  if [ "$mode" = "production" ]; then
    branch="$(production_branch)"
    [ "$current" = "$branch" ] || die "production deploys must run from '$branch' (on '$current')"
  else
    branch="$current"
    [ "$branch" != "$(production_branch)" ] || branch="preview"
  fi
  npm run build:cloudflare
  wrangler pages deploy apps/web/dist --project-name "$PROJECT" --branch "$branch" "${dirty_arg[@]}"
}

case "${1:-}" in
  setup) setup ;;
  check) load_creds; check ;;
  preview|production) load_creds; deploy "$1" "${2:-}" ;;
  *) die "usage: $0 setup | check | preview | production [--allow-dirty]" ;;
esac
