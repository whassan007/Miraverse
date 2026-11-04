# MiraVerse v0.7 (Option A) — Repository Audit & Reuse Baseline (`reports/v06/BASELINE.md`)

- **Audit Timestamp:** 2026-11-03T21:23:00-08:00
- **Active Branch:** `integration/miraverse-v0.6-option-a`
- **Starting Commit SHA:** `8115452` (parent `3aeed35` on `release/v0.4-subscriptions`, `5158471` on `main`)
- **Working Tree Status:** Clean (`git status --porcelain` empty; 0 untracked or modified files)
- **Safe Rollback Plan:**
  - `main` (`5158471`) and `release/v0.4-subscriptions` (`3aeed35`) remain untouched.
  - All 65 v0.6/v0.7 worker assignments execute in isolated git worktrees (`/home/wael/Code/mv-wt-v06/<ID>`) on dedicated branches (`v06/<ID>`) and merge into `integration/miraverse-v0.6-option-a` only after passing path-ownership and acceptance checks.
  - Instant rollback to pre-Option-A state: `git checkout integration/miraverse-v0.6-option-a && git reset --hard 8115452`.

---

## 1. Subsystem Audit & `REUSE / IMPROVE / REPLACE / DEFER / REMOVE` Matrix

| Subsystem | Paths | Decision | Rationale |
|---|---|---|---|
| **Shared Cultural Packs & Stories (`LB`, `EG`, `IQ`, `KR`, `FR`)** | `packages/content/packs/*.json`, `packages/content/stories/*.json`, `packages/content/vocab/*.json`, `packages/content/schema.ts` | **REUSE** | Five country packs, bilingual stories (including *Lebanon: Summer at Teta's* with Mira & Teta Nahla), NPC mentors, and 5 challenge types (`gather`, `trade`, `cook`, `build`, `word`) are validated and complete. |
| **Versioned Contracts (`v06`)** | `packages/contracts/`, `packages/contracts/v06/` | **IMPROVE** | Extend `packages/contracts` with `packages/contracts/v06/` (`CL02`) for rendering-independent quest envelopes (`event_id`, `player_id`, `quest_id`, `objective_id`, `server_timestamp`, `reward_status`), native identifiers, and semantic parity checks. |
| **Cross-Platform Content Compiler** | `tools/compiler/`, `tools/content-compiler/v06/` | **REUSE & IMPROVE** | Deterministic compiler (`tools/compiler/index.ts`) compiles JSON packs to Luau (`apps/roblox/src/shared/Packs.luau`), Bedrock (`apps/minecraft/scripts/generated/packs.ts`), and Web (`apps/web/src/generated/packs.ts`). Add `tools/content-compiler/v06/` (`CX02`) for v06 native Luau/Bedrock exports. |
| **Roblox Native Experience (Flagship)** | `apps/roblox/default.project.json`, `apps/roblox/src/` | **IMPROVE (PRIMARY CRITICAL PATH)** | Upgrade from v0.4 scaffold to full Option A flagship: `Foundation/` + `Social/` (`CL03`), `QuestEngine/` + `Coop/` (`CL04`), `NPCs/` (`CL05`), `Building/` + `Collaboration/` (`CL06`), `Activities/` (`CL07`), `Progression/` + `Avatar/` (`CL08`), `Systems/` + `SocialAvatar/` (`CX05`), `Controls/` (`CX06`), and `Presentation/` + `social-avatar/` (`AG06`). |
| **Minecraft Bedrock Companion** | `apps/minecraft/bp/`, `apps/minecraft/rp/`, `apps/minecraft/scripts/`, `apps/minecraft/structures/`, `apps/minecraft/world/` | **IMPROVE (RC2 COMPANION)** | Reuse validated BP/RP manifests and 6 `.mcstructure.json` templates (`hub`, `LB`, `FR`, `EG`, `IQ`, `KR`). Upgrade `scripts/core/` (`CL10`), `scripts/challenges/` (`CL11`), and `tools/release/` (`CL12`) for Byblos-first block-building companion and `.mcworld`/`.mcaddon` packaging. |
| **Marketing, Launch & Parent Website** | `apps/web/src/App.tsx`, `apps/web/src/landing/`, `apps/web/src/pages/`, `apps/web/src/parent/`, `apps/web/src/storefront/` | **IMPROVE & REPLACE CTAs** | Pivot from browser-game-first to Option A front door: main CTA **"Play free on Roblox"** (and returning visitor **"Open MiraVerse on Roblox"**), truthful `/play` & `/play/:country` Roblox share-link launcher (`CX08`), `/minecraft` companion status/downloads, `/explore`, `/explore/:country`, `/adventures`, `/characters`, `/passport`, and adult-only `/shop`, `/gifts`, `/gifts/redeem`, `/parents`, `/parent/dashboard`, `/account`, `/help`, `/legal/privacy`, `/legal/terms`. |
| **Browser 3D Game (`@babylonjs/core`)** | `apps/web/src/game3d/`, `apps/web/src/pages/Play.tsx` | **DEFER (PRESERVE BEHIND LEGACY ROUTE/FLAG)** | Preserve working Babylon.js 3D preview behind `/legacy-game` and `?mode=browser-preview` for existing E2E regression tests while removing browser-game claims from primary marketing CTAs and making `/play` the truthful Roblox launch page. |
| **Server API: Adult Identity, Stripe Test Checkout & Web Gifts** | `apps/api/src/`, `functions/api/` | **REUSE & IMPROVE** | Keep adult-only Stripe test Checkout (`CX10`), web-only digital gift SKUs (`CX11`), and adult identity (`CX09`). Enforce `STRIPE_LIVE_ENABLED = false` and `ENABLE_SUBSCRIPTIONS = false`. Never imply web purchases unlock Roblox or Minecraft items. |
| **Cross-Platform Shared Web Token Wallet Sync** | `apps/api/src/wallet/` | **DEFER** | Keep internal API unit tests intact, but do not expose a cross-platform web token wallet or claim Roblox/Minecraft balance sync on the public website. |

---

## 2. Functional Status Matrix Across Platforms (Baseline at `8115452`)

| Deliverable / World | Source Present | Compilation Passes | Static / Unit Tests Pass | Native Studio / Client Runtime Passes | Published & Publicly Accessible |
|---|---|---|---|---|---|
| **Roblox Flagship (`apps/roblox` — Byblos `LB` + Hub + `EG`/`IQ`/`KR`/`FR`)** | `YES` (`apps/roblox/src/**`) | `PASS` (`rojo build` -> `apps/roblox/dist/miraverse.rbxlx`) | `PASS` (`tests/roblox/roblox-v04.test.ts`) | `BLOCKED` on Linux `aarch64` headless host (no native Roblox Studio Linux binary; `rbx-studio-mcp` installed for remote/bridge Studio sessions) | `NOT PUBLISHED` (requires human creator authorization & published Place/Universe ID) |
| **Minecraft Companion (`apps/minecraft` — Byblos `LB` + `EG`/`IQ`/`KR`/`FR`)** | `YES` (`apps/minecraft/{bp,rp,scripts,structures}`) | `PASS` (`npm -w apps/minecraft run build` + `npm run pack:mcaddon`) | `PASS` (`tests/cross-platform/parity.test.ts`) | `BLOCKED` on Linux `aarch64` headless host (no Bedrock GUI client on Linux ARM64) | `LOCAL ARTIFACT ONLY` (`apps/minecraft/dist/miraverse.mcaddon` generated; `.mcworld` LevelDB requires native Bedrock client export) |
| **Public Website & Adult Commerce (`apps/web`, `apps/api`)** | `YES` (`apps/web/src/**`, `apps/api/src/**`) | `PASS` (`npm -w apps/web run build`, `npm -w apps/api run build`) | `PASS` (13 Vitest suites, 109 tests) | `PASS` (Playwright Chromium E2E & multi-viewport captures verified) | `TEST MODE ONLY` (Stripe test mode only; live charges and subscriptions disabled) |
| **Localization (`en`, `fr`, `ar-LB`, `ar-EG`, `ar-IQ`, `ko`)** | `YES` (`packages/content/{stories,vocab}`, `apps/web/src/i18n.tsx`) | `PASS` | `PASS` (`tests/validate.test.ts`) | `PASS` (RTL `dir="rtl"` and 6 locales verified in Chromium) | `HUMAN NATIVE-SPEAKER SIGN-OFF PENDING` |

---

## 3. Existing Asset, Mesh, Animation & Pack Audit

- **Original Licensed Assets (`art/`, `apps/web/public/assets/models/`, `apps/web/public/art/`):**
  - 6 binary glTF 2.0 (`.glb`) procedural/sculpted world & prop models (`hub.glb`, `LB.glb`, `FR.glb`, `EG.glb`, `IQ.glb`, `KR.glb`) built deterministically via `tools/assets/build-glb.ts` from `tools/procedural-props/recipes.json`.
  - Original SVG/PNG region emblems, story illustrations, and procedural PBR/pixel textures (`tools/textures/gen.mjs`).
  - Audio cues and style documentation in `art/audio/`, `art/branding/`, `art/direction/`, `art/source/`.
- **Gaps Identified for v0.7 Option A Execution:**
  - Need dedicated `art/v06/` source manifests, Roblox R15 rig/animation metadata (`idle`, `walk`, `run`, `jump`, `interact`, `cook`, `build`, `celebrate`), Avatar Marketplace candidate specifications (`art/v06/characters/avatar-marketplace/`), Byblos modular stone-house restoration kit (`art/v06/roblox-activities/build/`), saj cooking station (`art/v06/roblox-activities/cook/`), and country world kits (`LB`, `FR`, `EG`, `IQ`, `KR`).

---

## 4. Installed Host Capabilities & Toolchains (`waelbot` — Linux `aarch64`)

| Capability | Status | Version / Endpoint | Notes |
|---|---|---|---|
| **OS & Hardware** | `AVAILABLE` | Ubuntu 24.04 LTS (`Linux 7.0.0-1019-nvidia aarch64`), NVIDIA GB10 Unified Memory (`121.7 GiB`) | Headless/workstation ARM64 Linux host |
| **Antigravity Orchestrator & Subagents** | `AVAILABLE` | `agy 1.4.12` / `Gemini 4 Argon` | Master orchestrator + `invoke_subagent` |
| **Claude CLI** | `AVAILABLE` | `/home/wael/.local/bin/claude` (`2.1.318`) | Configured with `Roblox_Studio` and `minecraft` MCP servers |
| **Codex CLI** | `AVAILABLE` | `/home/wael/.local/bin/codex` (`0.166.0`, `gpt-6-astra`) | Verified non-interactive execution |
| **DGX Spark Local LLM Endpoint** | `AVAILABLE` | `http://localhost:1234/v1` (`qwen/qwen3-coder-next`) & Ollama `http://localhost:11434` (`qwen3-coder:30b`) | Concurrency ceiling `1` (`MAX_DGX=1`) |
| **Rojo CLI** | `AVAILABLE` | `/home/wael/.local/bin/rojo` (`7.7.1`) | Builds `apps/roblox/dist/miraverse.rbxlx` |
| **Roblox Studio MCP Server** | `INSTALLED` | `/home/wael/.local/bin/rbx-studio-mcp` + `apps/roblox/dist/MCPStudioPlugin.rbxm` | Built from `Roblox/studio-rust-mcp-server` for `aarch64`; awaits remote/tunneled Roblox Studio GUI session on port `44755` |
| **Minecraft MCP Server** | `INSTALLED` | `/home/wael/.local/bin/minecraft-mcp-server` (`v2.0.4`) | Mineflayer MCP server (`22` tools); connects to Java `1.21.11` server on `localhost:25565` |
| **Roblox Studio Desktop GUI** | `UNAVAILABLE ON HOST` | N/A on Linux `aarch64` | Requires Windows or macOS machine; Studio-dependent runtime gates are truthfully marked `BLOCKED` |
| **Minecraft Bedrock Desktop GUI** | `UNAVAILABLE ON HOST` | N/A on Linux `aarch64` | Requires Windows/iOS/Android/Console Bedrock client; runtime import gates are truthfully marked `BLOCKED` |
| **Blender CLI** | `UNAVAILABLE ON HOST` | N/A on Linux `aarch64` | Deterministic Node.js glTF/mesh/rig/texture builders (`tools/assets/`) produce validated 3D/model sources |
| **Browser Test Runner** | `AVAILABLE` | `@playwright/test` (`1.49.0`, Chromium `156.0.8078.4`) + `vitest` (`2.1.5`) | Full headless E2E, RTL, responsive viewport screenshot & WebM video capture |

---

## 5. External Publishing & Commercial Authority Boundaries

- **Roblox Publishing:** `HUMAN APPROVAL REQUIRED` — No live Roblox Place ID or Universe ID is published automatically. All Marketplace candidate assets, Roblox Community creation, and fee-bearing submissions require explicit creator sign-off.
- **Minecraft Distribution:** `FREE COMPANION ARTIFACTS` — `.mcaddon` and `.mcworld` companion packages are generated locally with SHA-256 checksums and truthful compatibility disclosures.
- **Stripe Commerce:** `TEST MODE ONLY` — `STRIPE_LIVE_ENABLED = false`, `ENABLE_SUBSCRIPTIONS = false`. Only genuine web-deliverable adult digital products (printable family activity & storybook packs, web gift cards) are offered in test mode; zero web offers claim to unlock Roblox or Minecraft items.
