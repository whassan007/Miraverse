#!/usr/bin/env bash
# Deterministic Merge Script (`swarm/merge.sh`)
# Merges PASSED worker branches into the feature branch (`build/miraverse-v0.1`)
# after verifying path boundaries and status. Never touches or pushes to `main`.
set -uo pipefail

export PATH="/home/wael/.local/bin:/home/wael/.cargo/bin:$PATH"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

STATUS_FILE="${STATUS_FILE:-$ROOT/swarm/status.json}"
LOCK_FILE="$ROOT/swarm/.status.lock"
TARGET="${1:-A}"

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current_branch" = "main" ]; then
  echo "ERROR: Refusing to merge directly onto 'main'. Switch to 'build/miraverse-v0.1'." >&2
  exit 1
fi

is_path_allowed() {
  local file="$1" write_paths="$2" id="$3"
  if [ "$file" = "swarm/notes/$id.md" ]; then
    return 0
  fi
  local IFS=','
  for allowed in $write_paths; do
    allowed="${allowed#./}"
    if [[ "$allowed" == */ ]]; then
      if [[ "$file" == "$allowed"* ]]; then
        return 0
      fi
    else
      if [ "$file" = "$allowed" ]; then
        return 0
      fi
    fi
  done
  return 1
}

matches_batch() {
  local id="$1" wave="$2" depends_on="$3" target="$4"
  case "$target" in
    A)  [ "$wave" = "A" ] ;;
    A1) [ "$wave" = "A" ] && [ "$depends_on" = "none" ] ;;
    A2) [ "$wave" = "A" ] && [[ "$depends_on" == G1* ]] ;;
    A3) [ "$wave" = "A" ] && [[ "$depends_on" == X1* ]] ;;
    B)  [ "$wave" = "B" ] ;;
    C)  [ "$wave" = "C" ] ;;
    *)  [ "$id" = "$target" ] ;;
  esac
}

merge_errors=0

while IFS=$'\t' read -r id provider wave write_paths reads task_card model_tier depends_on; do
  [[ -z "$id" || "$id" == \#* ]] && continue
  if ! matches_batch "$id" "$wave" "$depends_on" "$TARGET"; then
    continue
  fi

  st="$(jq -r --arg id "$id" '.agents[$id].status // "PENDING"' "$STATUS_FILE")"
  if [ "$st" = "MERGED" ]; then
    echo "Already MERGED: $id"
    continue
  fi
  if [ "$st" != "PASSED" ]; then
    echo "SKIP $id: status is $st (must be PASSED to merge)" >&2
    merge_errors=$((merge_errors + 1))
    continue
  fi

  branch="ag/$id"
  if ! git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "MISSING branch $branch for $id" >&2
    merge_errors=$((merge_errors + 1))
    continue
  fi

  base_sha="$(jq -r --arg id "$id" '.agents[$id].baseSha // ""' "$STATUS_FILE")"
  if [ -z "$base_sha" ]; then
    base_sha="$(git merge-base HEAD "$branch")"
  fi

  changed="$(git diff --name-only "$base_sha...$branch")"
  if [ -z "$changed" ]; then
    echo "REJECT $id: empty diff on $branch" >&2
    merge_errors=$((merge_errors + 1))
    continue
  fi

  bad_paths=()
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if ! is_path_allowed "$f" "$write_paths" "$id"; then
      bad_paths+=("$f")
    fi
  done <<< "$changed"

  if [ "${#bad_paths[@]}" -gt 0 ]; then
    echo "REJECT $id: forbidden path(s): ${bad_paths[*]}" >&2
    merge_errors=$((merge_errors + 1))
    continue
  fi

  # Perform merge (or cherry-pick of commits on branch since base_sha if branch diverged cleanly)
  if git merge --no-ff -q "$branch" -m "Merge agent $id ($provider/$wave)"; then
    merged_sha="$(git rev-parse --short HEAD)"
    (
      flock -x 200
      tmp="$(mktemp)"
      jq --arg id "$id" --arg sha "$merged_sha" --arg now "$(date -Iseconds)" \
        '.agents[$id].status = "MERGED" | .agents[$id].mergedSha = $sha | .agents[$id].updatedAt = $now | .updatedAt = $now' \
        "$STATUS_FILE" > "$tmp" && mv "$tmp" "$STATUS_FILE"
    ) 200>"$LOCK_FILE"
    echo "MERGED $id -> $merged_sha"
  else
    if git rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1; then
      git merge --abort
    fi
    echo "CONFLICT merging $id" >&2
    merge_errors=$((merge_errors + 1))
  fi
done < "$ROOT/swarm/agents.tsv"

# Regenerate compiled outputs after merge
npx tsx tools/compiler/index.ts >/dev/null 2>&1 || true

exit "$merge_errors"
