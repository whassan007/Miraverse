# MiraVerse Global v1.1 — Startup Audit & Truth Baseline (`reports/minecraft-global/BASELINE.md`)

- **Audit Timestamp:** 2026-11-04T05:22:00-08:00
- **Repository Root:** `/home/wael/Code/Miraverse`
- **Baseline Git Commit:** `45ff65dd1309cc86e22114ccfa1feb5ab4864250` (`main` -> `integration/minecraft-global-v1.1`)
- **Orchestrator Host:** Linux `waelbot 7.0.0-1024-nvidia #25~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC aarch64`
- **Hardware & Local Model Capacity:**
  - **GPU / Memory:** NVIDIA GB10 Unified Memory (`121 GiB` RAM, `70 GiB` available, Driver `580.178.04`, CUDA `13.0`, Temp `40°C`, Power `10W`)
  - **Active Local Model Endpoints:** LM Studio (`http://localhost:1234/v1/models` with `qwen/qwen3-coder-next`, `qwen/qwen3.8-27b`, `gemma-4-26b-a4b-it-qat`, `nvidia/nemotron-3-super`, `openai/gpt-oss-120b`) and Ollama (`http://localhost:11434/api/tags` with `qwen3.6:35b-a3b-q8_0`, `qwen3-coder:30b`, `qwen2.5vl:72b`, `gemma4:26b`).
  - **Measured DGX Concurrency Policy:** Because two LM Studio processes currently occupy `~44.5 GiB` of unified memory, `DX01–DX20` are scheduled with `maxConcurrency = 1` (FIFO sequential execution) to prevent RAM/VRAM thrashing or thermal throttling.
- **Installed Toolchain:**
  - Node.js `v22.22.3`, npm, `tsx@4.19.2`, `typescript@5.6.3`, `esbuild@0.24.0`, `vitest@2.1.5`, `@playwright/test@1.49.0`, `python3` (Miniconda), `claude` CLI, `codex` CLI, `ollama`.
- **Target Minecraft Bedrock Release Version:**
  - Manifest `min_engine_version: [1, 21, 50]`
  - Pinned Stable Script APIs: `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0` (Zero beta/experimental flags).
- **Windows Minecraft Bedrock Editor / Native GUI Client Access:**
  - **`BLOCKED (native runtime missing)` on this Linux `aarch64` host.**
  - Minecraft Bedrock Editor and the retail Windows Minecraft: Bedrock Edition client are Windows PC-only (`x64`).
  - Per Section A (Red-Line Delivery Rules) and Section I (Status Taxonomy): We **never** claim a `.mcworld` exists by renaming a ZIP archive on Linux, and we **never** fabricate GUI screenshots. All Windows Editor/client runtime gates and live GUI screenshot captures are truthfully marked `BLOCKED (native runtime missing)` with an executable Windows PowerShell/Editor handoff kit (`apps/minecraft/editor/`).

---

## 1. Classification of Existing Repository & Prior v1.0 50-Agent Artifacts

Every existing subsystem and claim in `/home/wael/Code/Miraverse` was audited prior to v1.1 Global execution using the strict taxonomy: `VERIFIED`, `IMPLEMENTED_UNVERIFIED`, `PARTIAL`, `STUB`, `MISSING`, `BLOCKED`.

| Feature / Claim | Existing Path(s) | Status | Factual Evidence & Audit Notes |
|---|---|---|---|
| **5-Country Legacy Packs & Stories (`LB`, `IQ`, `EG`, `FR`, `KR`)** | `packages/content/packs/{LB,IQ,EG,FR,KR}.json`, `packages/content/stories/*.json`, `packages/content/vocab/*.json` | `VERIFIED` | `npm run check` passes all 22 test suites (132 tests) including Gates G1–G6. Preserved 100% intact for backwards compatibility. |
| **Source-Grounded Cultural Knowledge Ontology (v1.2)** | `packages/knowledge-v12/index.ts`, `content/v12/source-registry/transnational_quest_for_home_source.txt` | `VERIFIED` | Contains segmented research passages (`LB-P01`..`KR-P05`) and epistemic guardrails (`mythology`, `folklore`, `historical_claim`, `contested_history`). |
| **Behavior & Resource Pack Manifests (`bp`, `rp`)** | `apps/minecraft/bp/manifest.json`, `apps/minecraft/rp/manifest.json` | `VERIFIED` | Valid `format_version: 2`, distinct UUIDv4 headers/modules, pinned `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0`. |
| **Legacy v1.0 5-Country Bedrock World Districts** | `apps/minecraft/world/{hub,LB,EG,IQ,KR,FR}/` | `PARTIAL` | Contains 5 countries with 1 chapter (5 challenges: gather/trade/cook/build/word) each, plus 5 portals in Hub. Does not yet have 11 countries, 66 sequential chapters, or 264 age-track variants. |
| **6 New Global Countries (`DE`, `CN`, `JP`, `RU`, `UA`, `MA`)** | `apps/minecraft/world/{DE,CN,JP,RU,UA,MA}/`, `packages/content/minecraft-global/` | `MISSING` (at baseline) | Must be authored in v1.1 with 6 chapters each, 5 exteriors, 3 furnished interiors, 4 NPCs, 8+ interactive spots, custom blocks, and artifacts. |
| **66 Connected Chapters × 4 Age Tracks (264 Authored Variants)** | `packages/content/minecraft-global/chapters/*.json`, `apps/minecraft/scripts/src/quests/` | `MISSING` (at baseline) | v1.0 only implemented a single difficulty track across 5 countries. v1.1 requires 66 chapters (`LB01`–`MA06`) × 4 distinct age behavior tracks (`5-7`, `8-10`, `11-13`, `14-17`) = 264 variants. |
| **14 Supported Interface/Content Locale Profiles** | `packages/content/locales/*`, `apps/minecraft/rp/texts/` | `PARTIAL` | v1.0 had `en_US.lang` and `fr_FR.lang` plus 6 web locales. v1.1 requires 14 profiles (`en-US`, `fr-FR`, `fr-CA`, `de-DE`, `zh-Hans-CN`, `ja-JP`, `ru-RU`, `uk-UA`, `ko-KR`, `ar`, `ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`) with native Bedrock `.lang` adapter + application-level Arabic dialect catalogs. |
| **66 Tangible Chapter Artifacts + 11 Capstone Keepsakes + 11 Stamps + Global Finale (`The Circle of Stories`)** | `apps/minecraft/assets-src/artifacts/`, `apps/minecraft/bp/items/` | `PARTIAL` | v1.0 had 50 regional food/material items and 5 stamps. v1.1 requires all 66 named chapter artifacts, 11 capstone cultural keepsakes, 11 country stamps, and the 3+-keepsake Observatory finale (*The Circle of Stories*). |
| **Backwards-Compatible Save Migration (v0.4 / v1.0 -> v1.1 Global)** | `apps/minecraft/scripts/src/state/` | `PARTIAL` | v1.0 migrated `mv:stamp:<CC>` to `mv:v10:player:<ID>`. v1.1 must preserve and migrate both `mv:stamp:<CC>` and `mv:v10:player:<ID>` into `mv:global:v11:player:<ID>` without losing any stamps, inventory, or completed quests. |
| **Playable Exported `.mcworld` & Live Windows Bedrock Client Captures** | `apps/minecraft/dist/miraverse-global.mcworld`, `reports/minecraft-global/client-captures/` | `BLOCKED` | Blocked on Linux `aarch64` host because Windows Minecraft Bedrock Editor/Client is required to generate a genuine LevelDB `.mcworld` and capture live native GUI screenshots. |

---

## 2. Preservation & Non-Destructive Execution Contract

1. **Preserve Existing 5-Country Packs, Web, Roblox, and API:**
   - `packages/content/packs/{LB,IQ,EG,FR,KR}.json`, `packages/content/stories/*.json`, `packages/content/vocab/*.json`, `tools/validate.ts`, and `tools/compiler/index.ts` remain untouched so all existing 22 test files (132 tests) continue passing.
2. **Single Shared Global Content Registry:**
   - All 11 countries, 66 chapters, 264 age variants, 66 chapter artifacts, 11 capstone keepsakes, 55 NPCs, and provenance source citations are defined in `packages/content/minecraft-global/` and compiled by `CX01` into `apps/minecraft/dist/global-content-catalog.json` and runtime TypeScript/Bedrock definitions.
3. **50-Agent Isolated Worktree Execution:**
   - Every agent (`AG01–AG20`, `DX01–DX20`, `CL01–CL05`, `CX01–CX05`) executes in its own isolated git worktree (`/home/wael/Code/mv-wt-mcg/<ID>`) on branch `minecraft-global/<ID>`, verifies its deliverables, writes `reports/minecraft-global/agents/<ID>.md`, commits only its owned paths, and merges cleanly into `integration/minecraft-global-v1.1`.
