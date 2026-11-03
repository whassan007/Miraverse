# MiraVerse v0.1.0 — Phase 0 Preflight Report

**Timestamp:** 2026-11-03T15:20:00-08:00
**Baseline SHA:** `b3ca64aa258769a16e4e0b9567fa2257ff833632`
**Feature Branch:** `build/miraverse-v0.1` (branched from `main`, preserving `main` untouched)
**Host Architecture:** Linux `aarch64` (`7.0.0-1019-nvidia` Ubuntu 24.04 SMP PREEMPT_DYNAMIC, NVIDIA GB10 GPU)

---

## 1. Detected Toolchain & Versions

| Tool | Status | Version / Path | Notes |
|---|---|---|---|
| `node` | VERIFIED | `v22.22.3` (`/home/wael/.local/bin/node`) | Meets Node 20+ requirement |
| `npm` | VERIFIED | `10.9.8` (`/home/wael/.local/bin/npm`) | Supports npm workspaces and deterministic `npm ci` |
| `git` | VERIFIED | `2.43.0` (`/usr/bin/git`) | Worktrees and branch management verified |
| `rojo` | VERIFIED | `Rojo 7.7.1` (`/home/wael/.local/bin/rojo`) | Official `rojo-7.7.1-linux-aarch64` installed and verified |
| `claude` | VERIFIED | `2.1.318 (Claude Code)` (`/home/wael/.local/bin/claude`) | Non-interactive `-p` with `--output-format json`, `--permission-mode acceptEdits`, `--allowedTools` verified |
| `codex` | VERIFIED | `codex-cli 0.166.0` (`/home/wael/.local/bin/codex`) | Non-interactive `codex exec` verified |
| `agy` | VERIFIED | `1.4.12` (`/home/wael/.local/bin/agy`) | Headless `agy -p <prompt> --output-format json --mode accept-edits` verified |
| `jq` | VERIFIED | `jq-1.7` (`/usr/bin/jq`) | Used for atomic JSON status and manifest verification |
| `zip` / `unzip` | VERIFIED | `Info-ZIP 3.0` / `UnZip 6.00` (`/usr/bin/zip`, `/usr/bin/unzip`) | Used for `.mcaddon` packaging and archive inspection |
| Local DGX | VERIFIED | NVIDIA GB10 GPU + OpenAI-compatible HTTP API (`http://localhost:1234/v1` LM Studio & `http://localhost:11434/v1` Ollama) | Active GPU model: `qwen/qwen3-coder-next` (48.49 GB loaded on GB10, `IDLE`); Ollama also provides `qwen3.6:35b-a3b-q8_0` (262k context) |

---

## 2. Provider Launch Adapter Preflight Results

All four required provider backends were probed with minimal read-only and isolated-workspace tasks prior to swarm execution:

1. **Claude CLI (`claude` — 10 workers: C1–C10)**
   - **Verified Models:** `claude-opus-5-5` (`--model opus`, high/strong-writing tier), `claude-sonnet-5-5` (`--model sonnet`, standard/high tier), `claude-haiku-5-5` (`--model haiku`).
   - **Launch Adapter:** `claude -p <prompt> --model <model> --permission-mode acceptEdits --allowedTools "Read Edit Write Bash" --no-session-persistence --output-format json`
   - **Preflight Probe:** Passed (`stop_reason: "end_turn"`, `total_cost_usd` and token usage reported in JSON output). Does not use `--dangerously-skip-permissions`.

2. **Codex CLI (`codex` — 10 workers: X1–X10)**
   - **Verified Models:** `gpt-6-astra` (default configured model in `~/.codex/config.toml`), `gpt-6.1-sol`.
   - **Launch Adapter:** `codex exec -m <model> -s danger-full-access --ephemeral -C <worktree_dir> <prompt>`
   - **Host Note:** Ubuntu 24.04 AppArmor restricts unprivileged bubblewrap user namespaces (`kernel.apparmor_restrict_unprivileged_userns=1`), causing `-s workspace-write` bubblewrap initialization to fail with `Operation not permitted`. Each worker is confined to its dedicated Git worktree directory via `-C <worktree_dir>` with strict pre/post `git status --porcelain` and `git diff --name-only` path allowlist enforcement.

3. **Antigravity / Gemini CLI (`ag` — 17 workers: G1–G17)**
   - **Verified Models:** `gemini-4-argon-high` (high language/engineering tier), `gemini-4-argon-medium` (standard tier), `gemini-3.8-flash-medium` (economical tier).
   - **Launch Adapter:** `agy -p <prompt> --model <model> --mode accept-edits --add-dir <worktree_dir> --output-format json`
   - **Preflight Probe:** Passed (`status: "SUCCESS"`, structured `usage` tokens reported).

4. **Local DGX (`dgx` — 3 workers: D1, D2, D3)**
   - **Verified Endpoint & Models:** Local NVIDIA GB10 GPU running OpenAI-compatible `/v1/chat/completions` endpoint at `http://localhost:1234/v1` with `qwen/qwen3-coder-next` (48.49 GB loaded in VRAM, 8192 context) and Ollama at `http://localhost:11434/v1` with `qwen3.6:35b-a3b-q8_0`.
   - **Launch Adapter:** Dedicated Node OpenAI-compatible client adapter (`swarm/dgx-agent.mjs`) targeting `http://localhost:1234/v1` (`qwen/qwen3-coder-next`) with strict worktree path confinement and concurrency limit `MAX_DGX=1` so the GB10 GPU is never oversubscribed. (Note: `codex exec -c model_provider="lmstudio"` failed preflight because Codex's 11,793-token system prompt exceeds the 8,192 context window configured on the LM Studio server; the lightweight OpenAI-compatible client adapter keeps prompts compact and well within the 8,192-token limit.)

---

## 3. Target Platform & SDK Verification

- **Web Client (`apps/web`):** React 18, TypeScript 5 (strict mode), Vite 5, Phaser 3, React Router 6 (`HashRouter` for deterministic static-host reload compatibility). Bundled local WOFF2/TTF font assets (`Noto Sans`, `Noto Sans Arabic`, `Noto Sans KR` / OFL-1.1) with zero third-party network requests.
- **Roblox Place (`apps/roblox`):** Rojo `7.7.1` (`default.project.json`, `$className: "DataModel"`). Server-authoritative chapter progression (`ServerScriptService`), disabled default `TextChatService` chat window/input bar, predefined safe phrase buttons only, session-only progress in v0.1, souvenir stamp generation on chapter completion.
- **Minecraft Bedrock Add-On (`apps/minecraft`):**
  - Verified stable npm packages: `@minecraft/server` `2.11.0` (or `1.17.0` compatible stable release; we pin `1.17.0` / `2.11.0` matching manifest version) and `@minecraft/server-ui` `2.3.0` (or `1.3.0`). Note: For maximum Bedrock stable runtime compatibility (`min_engine_version: [1, 21, 50]`), we verify that `bp/manifest.json` module dependencies exactly match the pinned stable `@minecraft/server` and `@minecraft/server-ui` versions in `apps/minecraft/package.json`. No `-beta` or `-preview` versions are used.

---

## 4. External Dependency Licenses

| Package | Version | License | Usage |
|---|---|---|---|
| `react`, `react-dom` | `^18.3.1` | MIT | Web UI shell & pages |
| `react-router-dom` | `^6.28.0` | MIT | Client-side routing (`HashRouter`) |
| `phaser` | `^3.87.0` | MIT | Web 2D minigames & globe |
| `vite`, `@vitejs/plugin-react` | `^5.4.11` | MIT | Web bundler |
| `esbuild` | `^0.24.0` | MIT | Minecraft Bedrock script bundler |
| `@minecraft/server` | `1.17.0` | MIT | Bedrock Script API type definitions |
| `@minecraft/server-ui` | `1.3.0` | MIT | Bedrock UI forms type definitions |
| `pngjs` | `^7.0.0` | MIT | Deterministic 16x16 PNG texture generator |
| `vitest` | `^2.1.5` | MIT | Unit & integration test runner |
| `playwright` / `@playwright/test` | `^1.49.0` | Apache-2.0 | Web E2E & responsive screenshot verification |
| `typescript`, `tsx` | `^5.6.3`, `^4.19.2` | Apache-2.0 / MIT | TypeScript compiler & script runner |
| Bundled Fonts (Noto family subset) | Local | SIL OFL 1.1 | Self-hosted UI & story typography |

---

## 5. Dependency Lockfile Strategy

- A single root `package-lock.json` covers the root repository and both npm workspaces (`apps/web`, `apps/minecraft`).
- All dependencies required by any worker (`react`, `react-dom`, `react-router-dom`, `phaser`, `vite`, `esbuild`, `pngjs`, `vitest`, `@minecraft/server`, `@minecraft/server-ui`, `@playwright/test`) are installed and locked in Phase 1 before Wave A begins.
- Worktrees link to the root `node_modules` (excluded from Git tracking via `.gitignore`) so workers execute deterministic local builds and tests offline without running unconstrained `npm install` during waves.
- CI and release verification use `npm ci` against the committed `package-lock.json`.

---

## 6. Available Test Environments, Limitations & Risk List

- **Available locally:**
  - Node.js `v22.22.3`, Vitest unit/integration suite, TypeScript strict type-checking, Vite production bundler, esbuild bundler, Rojo `7.7.1` `.rbxlx` place builder, `.mcaddon` ZIP/manifest validator, Playwright headless browser for Web E2E and responsive viewport checks (360px, 768px, 1280px).
- **Unavailable locally (recorded per Gate G4/G5 rules):**
  - **Roblox Studio (`NOT_RUN_STUDIO`):** Roblox Studio does not run natively on Linux `aarch64`. Place structure, Luau syntax/module structure, security rules, and Rojo build (`miraverse.rbxlx`) are verified statically; live Studio playtest is marked `NOT_RUN_STUDIO`.
  - **Minecraft Bedrock Runtime (`NOT_RUN_BEDROCK`):** Minecraft Bedrock GUI client is not installed on this headless Linux `aarch64` workflow. `.mcaddon` archive structure, BP/RP manifests, item/recipe/entity JSON schemas, texture cross-references, and bundled JS are verified statically; live Bedrock world playtest is marked `NOT_RUN_BEDROCK`.
  - **Maximum Achievable Stage on Host:** `BUILDABLE_RC` (as defined in Section 7: all content, compilers, web build, web E2E, `.rbxlx`, `.mcaddon`, and static checks pass, pending live Roblox Studio / Minecraft Bedrock runtime playtests and human native-speaker review).
- **Key Risks & Mitigations:**
  1. *LM Studio 8,192-token context limit on DGX:* Mitigated by using a dedicated compact OpenAI-compatible client (`swarm/dgx-agent.mjs`) for D1, D2, and D3 with `MAX_DGX=1`.
  2. *Cross-worker file collisions:* Mitigated by disjoint `write_paths` in `swarm/agents.tsv`, pre-merge `git diff --name-only` path boundary verification, and separating compiler-owned `generated/` outputs from source files.
  3. *Dialect authenticity:* Mitigated by Wave A native-script drafting (C1–C5), Wave B editorial review (G13–G17) with documented dialect notes in `swarm/notes/G13..G17.md`, and explicit `AI_REVIEWED_PENDING_HUMAN` status.
