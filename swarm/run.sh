#!/usr/bin/env bash
# MiraVerse v0.1.0 Swarm Orchestrator (`swarm/run.sh`)
# Usage:
#   ./swarm/run.sh preflight
#   ./swarm/run.sh bootstrap
#   ./swarm/run.sh wave A|A1|A2|A3|B|C
#   ./swarm/run.sh merge A|A1|A2|A3|B|C
#   ./swarm/run.sh verify
#   ./swarm/run.sh status
#   ./swarm/run.sh report
#   ./swarm/run.sh resume [A|A1|A2|A3|B|C]
set -uo pipefail

export PATH="/home/wael/.local/bin:/home/wael/.cargo/bin:$PATH"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

WT_ROOT="${WT_ROOT:-$(realpath "$ROOT/..")/mv-wt}"
STATUS_FILE="${STATUS_FILE:-$ROOT/swarm/status.json}"
LOCK_FILE="$ROOT/swarm/.status.lock"
SLOTS_DIR="$ROOT/swarm/.slots"

MAX_GLOBAL="${MAX_GLOBAL:-8}"
MAX_CLAUDE="${MAX_CLAUDE:-2}"
MAX_CODEX="${MAX_CODEX:-3}"
MAX_AG="${MAX_AG:-3}"
MAX_DGX="${MAX_DGX:-1}"

mkdir -p "$WT_ROOT" "$ROOT/swarm/logs" "$ROOT/swarm/notes" "$SLOTS_DIR/claude" "$SLOTS_DIR/codex" "$SLOTS_DIR/ag" "$SLOTS_DIR/dgx"

select_model() {
  local provider="$1" tier="$2"
  case "$provider" in
    claude)
      if [ "$tier" = "strong_writing" ]; then
        echo "${CLAUDE_MODEL_WRITING:-claude-opus-5-5}"
      else
        echo "${CLAUDE_MODEL_HIGH:-claude-sonnet-5-5}"
      fi
      ;;
    codex)
      echo "${CODEX_MODEL:-gpt-6-astra}"
      ;;
    ag)
      case "$tier" in
        high|high_language) echo "${AG_MODEL_HIGH:-gemini-4-argon-high}" ;;
        economical)         echo "${AG_MODEL_ECON:-gemini-3.8-flash-medium}" ;;
        *)                  echo "${AG_MODEL_STD:-gemini-4-argon-medium}" ;;
      esac
      ;;
    dgx)
      echo "${DGX_MODEL:-qwen/qwen3-coder-next}"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

init_status_json() {
  (
    flock -x 200
    if [ ! -f "$STATUS_FILE" ]; then
      local base_sha branch
      base_sha="$(git rev-parse HEAD)"
      branch="$(git rev-parse --abbrev-ref HEAD)"
      jq -n \
        --arg branch "$branch" \
        --arg baseSha "$base_sha" \
        --arg createdAt "$(date -Iseconds)" \
        '{branch: $branch, baselineSha: $baseSha, createdAt: $createdAt, updatedAt: $createdAt, agents: {}}' > "$STATUS_FILE"
    fi
    while IFS=$'\t' read -r id provider wave write_paths reads task_card model_tier depends_on; do
      [[ -z "$id" || "$id" == \#* ]] && continue
      local model
      model="$(select_model "$provider" "$model_tier")"
      local tmp
      tmp="$(mktemp)"
      jq \
        --arg id "$id" \
        --arg provider "$provider" \
        --arg wave "$wave" \
        --arg writePaths "$write_paths" \
        --arg reads "$reads" \
        --arg taskCard "$task_card" \
        --arg modelTier "$model_tier" \
        --arg model "$model" \
        --arg dependsOn "$depends_on" \
        'if .agents[$id] == null then
          .agents[$id] = {
            id: $id,
            provider: $provider,
            model: $model,
            modelTier: $modelTier,
            wave: $wave,
            writePaths: $writePaths,
            reads: $reads,
            taskCard: $taskCard,
            dependsOn: $dependsOn,
            status: "PENDING",
            attempts: 0,
            branch: ("ag/" + $id),
            workspace: "",
            baseSha: "",
            commitSha: "",
            testCommand: "",
            testExitCode: null,
            logFile: ("swarm/logs/" + $id + ".log"),
            usage: "unknown",
            blockers: []
          }
        else . end' "$STATUS_FILE" > "$tmp" && mv "$tmp" "$STATUS_FILE"
    done < "$ROOT/swarm/agents.tsv"
  ) 200>"$LOCK_FILE"
}

update_agent_status() {
  local id="$1" status="$2" commit_sha="${3:-}" test_exit="${4:-null}" msg="${5:-}" usage_json="${6:-}"
  (
    flock -x 200
    local tmp
    tmp="$(mktemp)"
    local now
    now="$(date -Iseconds)"
    jq \
      --arg id "$id" \
      --arg status "$status" \
      --arg commitSha "$commit_sha" \
      --argjson testExit "${test_exit:-null}" \
      --arg msg "$msg" \
      --arg usage "$usage_json" \
      --arg now "$now" \
      '.updatedAt = $now |
       .agents[$id].status = $status |
       .agents[$id].updatedAt = $now |
       (if $status == "RUNNING" then .agents[$id].startedAt = $now | .agents[$id].attempts += 1 else . end) |
       (if ($status == "PASSED" or $status == "FAILED" or $status == "MERGED" or ($status | startswith("BLOCKED"))) then .agents[$id].finishedAt = $now else . end) |
       (if $commitSha != "" then .agents[$id].commitSha = $commitSha else . end) |
       (if $testExit != null then .agents[$id].testExitCode = $testExit else . end) |
       (if $usage != "" then .agents[$id].usage = $usage else . end) |
       (if $msg != "" then .agents[$id].blockers = ([$msg]) else .agents[$id].blockers = [] end)' \
      "$STATUS_FILE" > "$tmp" && mv "$tmp" "$STATUS_FILE"
  ) 200>"$LOCK_FILE"
}

# Exact path boundary check: returns 0 if $file is allowed by comma-separated $write_paths or is swarm/notes/$id.md
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

verify_diff_boundaries() {
  local base_sha="$1" target_ref="$2" write_paths="$3" id="$4" repo_dir="${5:-$ROOT}"
  local changed
  changed="$(git -C "$repo_dir" diff --name-only "$base_sha...$target_ref")"
  if [ -z "$changed" ]; then
    echo "EMPTY_DIFF"
    return 1
  fi
  local bad=()
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if ! is_path_allowed "$f" "$write_paths" "$id"; then
      bad+=("$f")
    fi
  done <<< "$changed"
  if [ "${#bad[@]}" -gt 0 ]; then
    printf '%s\n' "${bad[@]}"
    return 1
  fi
  return 0
}

clean_forbidden_worktree_changes() {
  local wt_dir="$1" base_sha="$2" write_paths="$3" id="$4"
  # 1. Revert any modified tracked files outside allowlist back to base_sha
  local modified
  modified="$(git -C "$wt_dir" diff --name-only "$base_sha")"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if ! is_path_allowed "$f" "$write_paths" "$id"; then
      git -C "$wt_dir" checkout -q "$base_sha" -- "$f" 2>/dev/null || rm -rf "$wt_dir/$f"
    fi
  done <<< "$modified"

  # 2. Remove any untracked files outside allowlist (excluding node_modules symlink)
  local untracked
  untracked="$(git -C "$wt_dir" ls-files --others --exclude-standard)"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if ! is_path_allowed "$f" "$write_paths" "$id"; then
      rm -rf "$wt_dir/$f"
    fi
  done <<< "$untracked"
}

extract_done_cmd() {
  local card_file="$1"
  local line
  line="$(grep -E '^DONE `' "$card_file" | tail -n 1 || true)"
  if [[ "$line" =~ ^DONE\ \`(.*)\` ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "npm run validate"
  fi
}

prepare_worktree() {
  local id="$1"
  local wt_dir="$WT_ROOT/$id"
  local branch="ag/$id"
  local base_sha
  base_sha="$(git rev-parse HEAD)"

  if [ -d "$wt_dir/.git" ] || [ -f "$wt_dir/.git" ]; then
    # Worktree already exists; reuse safely. If Wave B agent is starting after Wave A merged,
    # ensure branch is updated to current HEAD if it has no Wave B commits yet.
    local wt_head
    wt_head="$(git -C "$wt_dir" rev-parse HEAD)"
    if git merge-base --is-ancestor "$wt_head" "$base_sha" && [ "$wt_head" != "$base_sha" ]; then
      git -C "$wt_dir" merge --ff-only "$base_sha" >/dev/null 2>&1 || true
    fi
  else
    if git show-ref --verify --quiet "refs/heads/$branch"; then
      git worktree add -q "$wt_dir" "$branch"
    else
      git worktree add -q -b "$branch" "$wt_dir" "$base_sha"
    fi
  fi

  # Record baseSha and workspace in status.json
  (
    flock -x 200
    local tmp
    tmp="$(mktemp)"
    jq --arg id "$id" --arg ws "$wt_dir" --arg base "$base_sha" \
      'if .agents[$id].baseSha == "" then .agents[$id].baseSha = $base else . end | .agents[$id].workspace = $ws' \
      "$STATUS_FILE" > "$tmp" && mv "$tmp" "$STATUS_FILE"
  ) 200>"$LOCK_FILE"

  # Link root node_modules into worktree so tools work offline and fast
  if [ ! -e "$wt_dir/node_modules" ] && [ -d "$ROOT/node_modules" ]; then
    ln -s "$ROOT/node_modules" "$wt_dir/node_modules"
  fi

  # Run compiler inside worktree so ignored generated stubs exist for web/roblox/minecraft builds
  (cd "$wt_dir" && npx tsx tools/compiler/index.ts >/dev/null 2>&1 || true)
}

invoke_provider() {
  local id="$1" provider="$2" model="$3" wt_dir="$4" prompt_text="$5" log_file="$6"
  case "$provider" in
    claude)
      (
        cd "$wt_dir" && \
        claude -p "$prompt_text" \
          --model "$model" \
          --permission-mode acceptEdits \
          --allowedTools "Read Edit Write Bash" \
          --no-session-persistence \
          --output-format json
      ) >> "$log_file" 2>&1
      ;;
    codex)
      (
        cd "$wt_dir" && \
        codex exec \
          -m "$model" \
          -s danger-full-access \
          --ephemeral \
          -C "$wt_dir" \
          "$prompt_text"
      ) >> "$log_file" 2>&1
      ;;
    ag)
      (
        cd "$wt_dir" && \
        agy -p "$prompt_text" \
          --model "$model" \
          --mode accept-edits \
          --add-dir "$wt_dir" \
          --output-format json
      ) >> "$log_file" 2>&1
      ;;
    dgx)
      (
        cd "$wt_dir" && \
        DGX_MODEL="$model" node "$ROOT/swarm/dgx-agent.mjs" "$id" "$wt_dir"
      ) >> "$log_file" 2>&1
      ;;
    *)
      echo "Unknown provider: $provider" >> "$log_file"
      return 2
      ;;
  esac
}

stage_and_commit_owned() {
  local wt_dir="$1" id="$2" write_paths="$3" base_sha="$4"
  clean_forbidden_worktree_changes "$wt_dir" "$base_sha" "$write_paths" "$id"

  local IFS=','
  for p in $write_paths; do
    p="${p#./}"
    if [ -e "$wt_dir/$p" ]; then
      git -C "$wt_dir" add -- "$p" 2>/dev/null || true
    fi
  done
  if [ -f "$wt_dir/swarm/notes/$id.md" ]; then
    git -C "$wt_dir" add -- "swarm/notes/$id.md" 2>/dev/null || true
  fi

  if ! git -C "$wt_dir" diff --cached --quiet; then
    git -C "$wt_dir" commit -q -m "$id: implementation and verification" || true
  fi
}

run_single_agent() {
  local id="$1" provider="$2" wave="$3" write_paths="$4" reads="$5" task_card="$6" model_tier="$7"
  local slot_file="$SLOTS_DIR/$provider/$id.pid"
  echo "$$" > "$slot_file"
  trap 'rm -f "$slot_file"' EXIT

  local model
  model="$(select_model "$provider" "$model_tier")"
  local wt_dir="$WT_ROOT/$id"
  local log_file="$ROOT/swarm/logs/$id.log"
  local done_cmd
  done_cmd="$(extract_done_cmd "$ROOT/$task_card")"

  prepare_worktree "$id"
  local base_sha
  base_sha="$(jq -r --arg id "$id" '.agents[$id].baseSha' "$STATUS_FILE")"

  update_agent_status "$id" "RUNNING" "" "null" "" ""
  (
    flock -x 200
    local tmp
    tmp="$(mktemp)"
    jq --arg id "$id" --arg cmd "$done_cmd" '.agents[$id].testCommand = $cmd' "$STATUS_FILE" > "$tmp" && mv "$tmp" "$STATUS_FILE"
  ) 200>"$LOCK_FILE"

  local base_prompt
  base_prompt="$(cat "$ROOT/swarm/RULES.md")

---
AGENT ID: $id
WAVE: $wave
WORKING DIRECTORY: $wt_dir
STRICT WRITE ALLOWLIST (OWN): $write_paths,swarm/notes/$id.md
ALLOWED READS: $reads
TARGETED VERIFICATION COMMAND: $done_cmd

TASK CARD:
$(cat "$ROOT/$task_card")"

  local passed=0
  local max_repairs=2
  local attempt=0
  local last_err=""

  while [ "$attempt" -le "$max_repairs" ]; do
    local prompt_to_send="$base_prompt"
    if [ "$attempt" -gt 0 ]; then
      prompt_to_send="$base_prompt

---
REPAIR ATTEMPT $attempt OF $max_repairs:
Your previous attempt failed verification with the following error output:
$last_err

Fix ONLY files within your STRICT WRITE ALLOWLIST ($write_paths), re-run '$done_cmd', and commit."
    fi

    echo "=== [$id] Attempt $((attempt + 1)) with $provider ($model) at $(date -Iseconds) ===" >> "$log_file"
    invoke_provider "$id" "$provider" "$model" "$wt_dir" "$prompt_to_send" "$log_file" || true

    # Ensure owned changes are committed and non-owned changes are cleaned
    stage_and_commit_owned "$wt_dir" "$id" "$write_paths" "$base_sha"

    # Re-ensure generated files exist before running targeted test command
    (cd "$wt_dir" && npx tsx tools/compiler/index.ts >/dev/null 2>&1 || true)

    local test_out=""
    local test_exit=0
    test_out="$(cd "$wt_dir" && bash -c "$done_cmd" 2>&1)" || test_exit=$?
    echo "=== [$id] Targeted test '$done_cmd' exit=$test_exit ===" >> "$log_file"
    echo "$test_out" >> "$log_file"

    # Clean any temporary artifacts created by test command outside allowlist
    clean_forbidden_worktree_changes "$wt_dir" "$base_sha" "$write_paths" "$id"
    stage_and_commit_owned "$wt_dir" "$id" "$write_paths" "$base_sha"

    local boundary_out=""
    local boundary_ok=0
    boundary_out="$(verify_diff_boundaries "$base_sha" "HEAD" "$write_paths" "$id" "$wt_dir" 2>&1)" || boundary_ok=$?

    local head_msg
    head_msg="$(git -C "$wt_dir" log -1 --pretty=%s 2>/dev/null || echo "")"

    if [ "$test_exit" -eq 0 ] && [ "$boundary_ok" -eq 0 ] && [[ ! "$head_msg" =~ ^WIP: ]]; then
      passed=1
      local commit_sha
      commit_sha="$(git -C "$wt_dir" rev-parse --short HEAD)"
      local usage_info="measured_in_log"
      local last_json
      last_json="$(tail -n 5 "$log_file" | grep -E '^\{.*\}$' | tail -n 1 || true)"
      if [ -n "$last_json" ]; then
        usage_info="$(echo "$last_json" | jq -c '.usage // .total_cost_usd // "logged"' 2>/dev/null || echo "logged")"
      fi
      update_agent_status "$id" "PASSED" "$commit_sha" "0" "" "$usage_info"
      echo "PASSED $id ($commit_sha)"
      break
    else
      last_err="Test exit: $test_exit
Test output:
$(echo "$test_out" | tail -n 25)
Boundary check: $boundary_out"
      attempt=$((attempt + 1))
    fi
  done

  if [ "$passed" -eq 0 ]; then
    local fail_sha
    fail_sha="$(git -C "$wt_dir" rev-parse --short HEAD 2>/dev/null || echo "")"
    update_agent_status "$id" "FAILED" "$fail_sha" "1" "$last_err" ""
    echo "FAILED $id"
    return 1
  fi
  return 0
}

active_count_all() {
  find "$SLOTS_DIR" -name "*.pid" 2>/dev/null | wc -l
}

active_count_provider() {
  local prov="$1"
  find "$SLOTS_DIR/$prov" -name "*.pid" 2>/dev/null | wc -l
}

provider_limit() {
  local prov="$1"
  case "$prov" in
    claude) echo "$MAX_CLAUDE" ;;
    codex)  echo "$MAX_CODEX" ;;
    ag)     echo "$MAX_AG" ;;
    dgx)    echo "$MAX_DGX" ;;
    *)      echo 1 ;;
  esac
}

cleanup_stale_slots() {
  local f pid
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    pid="$(cat "$f" 2>/dev/null || echo "")"
    if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$f"
    fi
  done < <(find "$SLOTS_DIR" -name "*.pid" 2>/dev/null)
}

wait_for_slot() {
  local prov="$1"
  local plimit
  plimit="$(provider_limit "$prov")"
  while true; do
    cleanup_stale_slots
    local total pcount
    total="$(active_count_all)"
    pcount="$(active_count_provider "$prov")"
    if [ "$total" -lt "$MAX_GLOBAL" ] && [ "$pcount" -lt "$plimit" ]; then
      break
    fi
    sleep 2
  done
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

run_provider_queue() {
  local target="$1" resume_mode="$2" target_prov="$3"
  local pids=()
  while IFS=$'\t' read -r id provider wave write_paths reads task_card model_tier depends_on; do
    [[ -z "$id" || "$id" == \#* ]] && continue
    [ "$provider" != "$target_prov" ] && continue
    if ! matches_batch "$id" "$wave" "$depends_on" "$target"; then
      continue
    fi

    local cur_status
    cur_status="$(jq -r --arg id "$id" '.agents[$id].status' "$STATUS_FILE")"
    if [ "$resume_mode" -eq 1 ] && [[ "$cur_status" == "PASSED" || "$cur_status" == "MERGED" ]]; then
      echo "Skipping already-$cur_status agent $id"
      continue
    fi

    if [ "$depends_on" != "none" ]; then
      local IFS=','
      local dep_missing=0
      for dep in $depends_on; do
        local dep_st
        dep_st="$(jq -r --arg d "$dep" '.agents[$d].status // "PENDING"' "$STATUS_FILE")"
        if [[ "$dep_st" != "PASSED" && "$dep_st" != "MERGED" ]]; then
          dep_missing=1
          update_agent_status "$id" "BLOCKED_DEPENDENCY" "" "null" "Waiting on dependency $dep ($dep_st)" ""
          break
        fi
      done
      if [ "$dep_missing" -eq 1 ]; then
        echo "BLOCKED_DEPENDENCY $id"
        continue
      fi
    fi

    wait_for_slot "$provider"
    run_single_agent "$id" "$provider" "$wave" "$write_paths" "$reads" "$task_card" "$model_tier" &
    pids+=("$!")
    sleep 0.5
  done < "$ROOT/swarm/agents.tsv"

  local fail_count=0
  for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
      fail_count=$((fail_count + 1))
    fi
  done
  return "$fail_count"
}

run_batch() {
  local target="$1" resume_mode="${2:-0}"
  init_status_json
  local q_pids=()
  for prov in claude codex ag dgx; do
    run_provider_queue "$target" "$resume_mode" "$prov" &
    q_pids+=("$!")
  done

  local fail_count=0
  for qpid in "${q_pids[@]}"; do
    if ! wait "$qpid"; then
      fail_count=$((fail_count + 1))
    fi
  done
  cleanup_stale_slots
  return "$fail_count"
}

merge_batch() {
  local target="$1"
  init_status_json
  "$ROOT/swarm/merge.sh" "$target"
}

cmd="${1:-status}"
arg="${2:-}"

case "$cmd" in
  preflight)
    echo "=== MiraVerse Preflight Check ==="
    for tool in node npm git rojo claude codex agy jq zip unzip; do
      printf "%-8s : %s\n" "$tool" "$(command -v "$tool" || echo MISSING)"
    done
    cat "$ROOT/swarm/PREFLIGHT.md" | head -n 35
    ;;
  bootstrap)
    init_status_json
    echo "Initialized $STATUS_FILE with $(jq '.agents | length' "$STATUS_FILE") agent assignments."
    ;;
  wave)
    if [ "$arg" = "A" ]; then
      run_batch "A1" 0 && merge_batch "A1" && \
      run_batch "A2" 0 && merge_batch "A2" && \
      run_batch "A3" 0
    else
      run_batch "$arg" 0
    fi
    ;;
  merge)
    merge_batch "$arg"
    ;;
  resume)
    target_wave="${arg:-A}"
    if [ "$target_wave" = "A" ]; then
      run_batch "A1" 1 && merge_batch "A1" && \
      run_batch "A2" 1 && merge_batch "A2" && \
      run_batch "A3" 1 && merge_batch "A3"
    else
      run_batch "$target_wave" 1
    fi
    ;;
  verify)
    npm run check:release
    ;;
  status)
    init_status_json
    jq -r '.agents | to_entries[] | "\(.value.id)\t\(.value.provider)\t\(.value.wave)\t\(.value.status)\t\(.value.commitSha)"' "$STATUS_FILE"
    echo "--- Summary ---"
    jq -r '[.agents[].status] | group_by(.) | map("\(.[0]): \(length)") | join(", ")' "$STATUS_FILE"
    ;;
  report)
    if [ -f "$ROOT/swarm/REPORT.md" ]; then
      cat "$ROOT/swarm/REPORT.md"
    else
      echo "swarm/REPORT.md not yet generated (run Wave C)."
    fi
    ;;
  *)
    echo "Usage: $0 {preflight|bootstrap|wave|merge|resume|verify|status|report} [target]"
    exit 1
    ;;
esac
