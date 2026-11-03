#!/usr/bin/env bash
# usage: swarm/run.sh wave A|B|C   |   swarm/run.sh merge A|B|C
set -uo pipefail
ROOT=$(git rev-parse --show-toplevel); cd "$ROOT"
WT="$ROOT/../mv-wt"; mkdir -p "$WT" swarm/logs swarm/notes
cmd=$1; wave=$2; AG_CMD=${AG_CMD:-"gemini --yolo -p"}

launch() { # id backend
  local id=$1 be=$2 dir="$WT/$1"
  git worktree remove -f "$dir" 2>/dev/null; git worktree add -q -B "ag/$id" "$dir" main
  local p; p="$(cat swarm/RULES.md swarm/cards/$id.md)"
  ( cd "$dir" && case $be in
      claude) claude -p "$p" --dangerously-skip-permissions --max-turns 40 ;;
      codex)  codex exec --full-auto "$p" ;;
      dgx)    codex exec --full-auto -p dgx "$p" ;;
      ag)     $AG_CMD "$p" ;;
    esac ) > "swarm/logs/$id.log" 2>&1 || echo "FAIL $id" >> swarm/logs/FAILED
  tail -n 1 "swarm/logs/$id.log"
}

if [ "$cmd" = wave ]; then
  while IFS=$'\t' read -r id be w own; do
    [[ "$id" == \#* || "$w" != "$wave" ]] && continue
    launch "$id" "$be" &
    while [ "$(jobs -rp | wc -l)" -ge "${MAX:-40}" ]; do sleep 5; done
  done < swarm/agents.tsv
  wait
fi

if [ "$cmd" = merge ]; then
  while IFS=$'\t' read -r id be w own; do
    [[ "$id" == \#* || "$w" != "$wave" ]] && continue
    git rev-parse -q --verify "ag/$id" >/dev/null || { echo "MISSING $id"; continue; }
    pat="^(${own//,/|}|swarm/notes/$id\.md)"
    bad=$(git diff --name-only main..."ag/$id" | grep -vE "$pat" || true)
    [ -n "$bad" ] && { echo "REJECT $id: $bad"; continue; }
    git merge -q --no-ff "ag/$id" -m "merge $id" || { git merge --abort; echo "CONFLICT $id"; }
  done < swarm/agents.tsv
  npm install --silent && npm run check; echo "check exit $?"
  git push origin main
fi
