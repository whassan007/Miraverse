# MiraVerse v0.5 — Technical & Product Baseline Audit (`reports/V05_BASELINE.md`)

- **Audit Date:** 2026-11-03T20:52:00-08:00
- **Integration Branch:** `integration/miraverse-v0.5`
- **Baseline Parent Commit:** `3aeed35` (`release/v0.4-subscriptions`) / `1204426` (`integration/miraverse-v0.5`)
- **Main Branch Reference:** `5158471` (`main` — Release MiraVerse v0.4)
- **Hardware & OS:** Linux `aarch64` workstation with **NVIDIA GB10 Unified Memory GPU** (Driver `580.178.04`, CUDA `13.0`)
- **Installed Runtimes Verified:**
  - **Antigravity Orchestrator & Subagents:** `Gemini 4 Argon` (`invoke_subagent` available)
  - **Claude Code CLI:** `/home/wael/.local/bin/claude` (`2.1.318`) — non-interactive execution verified
  - **OpenAI Codex CLI:** `/home/wael/.local/bin/codex` (`codex-cli 0.166.0`, model `gpt-6-astra`) — non-interactive execution verified
  - **Local DGX Spark Inference Server:** `http://localhost:1234/v1` (`qwen/qwen3-coder-next`) and Ollama `http://localhost:11434` (`qwen3-coder:30b`, `qwen3.6:35b-a3b-q8_0`, `qwen2.5vl:72b`, `gemma4:26b`) — live completion verified
  - **Rojo CLI:** `/home/wael/.local/bin/rojo` (`Rojo 7.7.1`)
  - **Playwright:** `@playwright/test` (`1.64.1` / Chromium headless browser + video recording)
  - **Node.js / npm / Vitest:** Node `v22`, Vitest `v2.1.9`

---

## 1. Existing Worktree & Repository Status

- **Root Worktree:** `/home/wael/Code/Miraverse` on `integration/miraverse-v0.5` (clean working tree at `1204426`).
- **Legacy v0.4 Worktrees:** 58 worktrees under `/home/wael/Code/mv-wt/` (`AG01`–`AG30`, `CL01`–`CL10`, `CX01`–`CX10`, `DX01`–`DX08`) preserved untouched for historical auditability.
- **v0.5 Worktree Isolation Plan:** All 65 v0.5 worker agents (`AG01`–`AG20`, `CL01`–`CL15`, `CX01`–`CX15`, `DX01`–`DX15`) use dedicated isolated worktrees under `/home/wael/Code/mv-wt-v05/<ID>` on branches `v05/<ID>`.
- **Baseline Test Suite Execution (`npm run check`):**
  - `npm run validate` (`structural` & `release` profiles): **PASS (0 errors)**
  - `npm run compile`: **PASS (5 country packs compiled deterministically)**
  - `npm -w apps/web run build`: **PASS**
  - `npm -w apps/minecraft run build` + `npm run pack:mcaddon`: **PASS (`apps/minecraft/dist/miraverse.mcaddon`)**
  - `npm run build:roblox`: **PASS (`apps/roblox/dist/miraverse.rbxlx`)**
  - `vitest run`: **13 test files passed, 109 tests passed (0 failures)**

---

## 2. Current Route Map vs. v0.5 Target Route Map

| Route | v0.4 Status | v0.5 Requirement & Action |
|---|---|---|
| `/` | Present (`CinematicLandingPage`) | **IMPROVE:** Upgrade via `AG04` (`apps/web/src/marketing/landing/`) + `CX02` (`apps/web/src/app/`) to include all 10 required sections in exact order, returning-player `Continue Adventure` primary CTA detection, compact translucent nav (`Explore`, `Adventures`, `Characters`, `Shop`, `Gifts`, `For Parents`, `Play Free`), while preserving existing test IDs (`cta-play-free`, `country-card-*`, `read-story-*`). |
| `/explore` | Missing (only anchor `#worlds`) | **ADD (`AG05` / `CX02`):** Interactive illustrated & 3D world atlas with 5 destinations, keyboard/touch accessible selection, and cultural region filters. |
| `/explore/:country` | Missing | **ADD (`AG05` / `CX02`):** Country trailer/3D vignette preview, mentor & NPC cast, story synopsis, 5 chapter quests, vocabulary preview, and direct `Play Free` CTA. |
| `/adventures` | Missing | **ADD (`AG06` / `CX02`):** Quest/chapter catalog across all 5 stories (`LB`, `EG`, `IQ`, `KR`, `FR`), 5 challenge types (`Gather`, `Trade`, `Build`, `Cook`, `Word`), and progression explanation. |
| `/characters` | Missing | **ADD (`AG08` / `CX02`):** Hero (Mira) & 5 elder mentor / NPC showcase, animation clip previewer (`idle`, `walk`, `run`, `interact`, `cook`, `build`, `celebrate`), and safe earned-only outfit customization preview. |
| `/play` | Present (`Play.tsx`) | **IMPROVE (`AG07`, `AG10`, `CX03`, `CX04`):** Add returning-player portal bar/drawer (`Continue Adventure`, hero portrait, last country, active quest, next recommended world, passport link) integrated cleanly with the 3D World Hub and zero commerce CTAs. |
| `/play/:country` | Present (`Play.tsx`) | **IMPROVE (`AG10`, `AG11`–`AG15`, `CX03`, `CX04`):** Direct 3D world entry with quest continuity, in-world 3-stage building restoration, NPC dialogue, and diegetic challenge stations. |
| `/passport` | Present (`Passport.tsx`) | **IMPROVE (`AG09`):** Preserve all v0.1/v0.4 stamp redemption/reset test hooks (`#souvenir-code`, `#passport-feedback`) while adding rich v0.5 Passport UI (`apps/web/src/player/passport/`) showing earned Mira Tokens, storybook links, visited landmarks, and achievement badges. |
| `/shop` | Only at `/parents/shop` | **ADD & ALIAS (`AG16`, `CX02`):** Serve adult-gated cosmetic & bundle shop at `/shop` AND preserve `/parents/shop`. Require adult verification boundary before any transaction. |
| `/gifts` | Only at `/parents/gifts` | **ADD & ALIAS (`AG17`, `CX02`):** Adult gifting overview, card personalization, print/copy code flow at `/gifts` AND `/parents/gifts`. |
| `/gifts/redeem` | Only at `/parents/gifts/redeem` | **ADD & ALIAS (`AG17`, `CX08`):** Secure single-use gift redemption with rate limits, adult approval, and log redaction at `/gifts/redeem` AND `/parents/gifts/redeem`. |
| `/parents` | Present (`ParentPortalPage`) | **IMPROVE (`AG18`):** Public adult-facing guide, safety guarantees, learning value, FAQs, and neutral adult verification gate (never a direct checkout). |
| `/parent/dashboard` | At `/parents/dashboard` | **ADD & ALIAS (`AG18`, `CX10`):** Authenticated adult dashboard at `/parent/dashboard` AND `/parents/dashboard` for linked pseudonymous profiles, order history, permissions, screen-time preferences, and data export/deletion. |
| `/account` | At `/parents/settings` | **ADD & ALIAS (`AG18`, `CX06`):** Adult account settings & session management at `/account`, `/parents/settings`, and `/parents/sign-in`. |
| `/help` | At `/support` & `/refunds` | **ADD & ALIAS (`AG18`):** Family help, refund policy, privacy questions, and support at `/help`, `/support`, and `/refunds`. |
| `/legal/privacy`, `/legal/terms` | At `/privacy`, `/terms` | **ADD & ALIAS (`AG18`, `CL03`):** Current reviewed privacy & terms documents at `/legal/privacy`, `/legal/terms`, `/privacy`, and `/terms`. |
| `/story/:lang`, `/about` | Present | **PRESERVE:** Keep 100% functional for bilingual 15-scene story reading and Educator Guide compatibility. |

---

## 3. Baseline Screenshot Inventory

Existing v0.4 screenshots verified on disk before v0.5 changes:
- `reports/screens/v0.4/home-hero-1440x900.png`, `home-hero-768x1024.png`, `home-hero-390x844.png`, `home-hero-360x800.png`
- `reports/screens/v0.4/world-hub-3d-1440x900.png`
- `reports/screens/v0.4/france-3d-1440x900.png`, `france-3d-768x1024.png`, `france-3d-390x844.png`, `france-3d-360x800.png`
- `reports/screens/v0.4/lebanon-3d-1440x900.png`, `egypt-3d-390x844.png`, `iraq-3d-390x844.png`, `korea-3d-1440x900.png`, `korea-3d-390x844.png`
- `reports/screens/v0.4/passport-v04-1440x900.png`, `passport-v04-390x844.png`
- `reports/screens/commerce/parents-overview-1440x900.png`, `parents-overview-390x844.png`, `parents-shop-1920x1080.png`, `parents-shop-1440x900.png`, `parents-shop-768x1024.png`, `parents-shop-390x844.png`, `parents-shop-360x800.png`, `parents-redeem-1440x900.png`, `parents-redeem-390x844.png`
- `dist/screenshots/{en,ar-LB}-{360,768,1280}px.png`

All v0.4 captures will be copied into `reports/v05/screens/before/` as baseline evidence, and fresh Playwright captures + WebM video recordings of the v0.5 build will be written to `reports/v05/screens/` and `reports/v05/video/`.

---

## 4. Architecture Audit: REUSE / IMPROVE / REPLACE / DELETE Decisions

| Subsystem | Path | Decision | Rationale |
|---|---|---|---|
| **3D Web Engine (`@babylonjs/core` 7.34.2)** | `apps/web/src/game3d/` | **REUSE & IMPROVE** | Babylon.js 7.34.2 is already integrated and working with GLB loading, procedural sculpted fallback meshes, camera bounds, and NullEngine headless support. Do not replace with Three.js or revert to Phaser. |
| **Shared Content Packs & Compiler** | `packages/content/`, `tools/compiler/` | **REUSE & EXTEND** | Deterministic compiler generates Web JSON, Roblox Luau, and Minecraft Bedrock TypeScript/JSON/recipes/textures. Keep 100% intact and add `packages/contracts/worlds/` (`CL02`). |
| **Game Domain & Save Migration (`mv.save.v4`)** | `packages/game-domain/` | **REUSE & IMPROVE** | Pure TS state machine already migrates `mv.stamps` and `v1..v3` saves into `mv.save.v4`. Add `packages/game-domain/progression/` (`CL14`) and `packages/game-domain/state/` (`CX05`) for pure reducer, onboarding pacing, and return-to-play state selectors. |
| **Public Site & Route Shell** | `apps/web/src/App.tsx`, `apps/web/src/app/` | **IMPROVE** | Expand route shell (`CX02`) to support all 16 v0.5 routes, distinct context-aware headers (Public Marketing Header vs. Player Portal HUD vs. Adult Portal Header), code splitting/lazy loading, and legacy route aliases. |
| **Backend Commerce, Gifts & Wallet API** | `apps/api/src/` | **REUSE & IMPROVE** | Existing `MiraVerseCommerceApi` passes `C01`–`C20`. Modularize and harden with `apps/api/src/identity/` (`CX06`), `apps/api/src/payments/` (`CX07`), `apps/api/src/gifts/` (`CX08`), `apps/api/src/wallet/` (`CX09`), and `apps/api/src/parent/` (`CX10`), including rate limits, out-of-order webhook reconciliation, and order state transitions (`CREATED`, `PENDING`, `PAID`, `FULFILLED`, `REFUNDED`, `DISPUTED`, `CANCELED`). |
| **Cloudflare Functions (`functions/api/`)** | `functions/api/checkout.ts`, `webhook.ts` | **REUSE & GUARD** | Keep `functions/api/` compatible with `tests/integration/gates.test.ts` while enforcing `COMMERCE_FLAGS.STRIPE_LIVE_ENABLED = false` and `ENABLE_SUBSCRIPTIONS = false` in v0.5 until explicit human signoff (`SEC02`). |
| **Roblox Native Place (`apps/roblox/`)** | `apps/roblox/src/` | **IMPROVE** | Add `Foundation/` (`CL05`), `Quests/` (`CL06`), `Presentation/` (`CL07`), and `CommerceBoundary/` (`CL08`) modules and compile into `apps/roblox/dist/miraverse.rbxlx` via `rojo build`. |
| **Minecraft Bedrock Add-On (`apps/minecraft/`)** | `apps/minecraft/scripts/`, `bp/`, `rp/` | **IMPROVE** | Enhance `scripts/core/` (`CL09`), `scripts/challenges/` (`CL10`), `scripts/npc/` (`CL11`), and `tools/release/` (`CL12`) to package both `.mcaddon` and `.mcworld` template archive. |

---

## 5. Named Technical Risks & Mitigations

1. **Bundle Size Warning in `apps/web` (`5.4 MB` chunk with `@babylonjs/core`):**
   - *Mitigation (`CX02`, `CX14`):* Configure Vite `manualChunks` / dynamic route splits so `@babylonjs/core` and `@babylonjs/loaders` are split into a dedicated `babylon-vendor` chunk rather than bloating the initial marketing shell JS bundle.
2. **Conflict Between `3aeed35` Subscription Checkout Commit and v0.5 `SEC02` ("Live Stripe charges and subscriptions OFF unless explicit human approval"):**
   - *Mitigation (`CL04`, `CX07`):* Keep `functions/api/checkout.ts` passing its unit test in `tests/integration/gates.test.ts` when explicit test env vars are passed, while keeping `COMMERCE_FLAGS.STRIPE_LIVE_ENABLED = false` and `COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS = false` in `apps/api/src/catalog/index.ts` and `apps/api/src/payments/index.ts` so subscriptions and live charges are strictly OFF by default (`SEC02` PASS).
3. **Headless Linux `aarch64` Host Without Interactive Roblox Studio or Minecraft Bedrock GUI Client:**
   - *Mitigation (`CL05`–`CL12`, `DX13`–`DX14`):* Compile and statically/structurally verify `miraverse.rbxlx`, `miraverse.mcaddon`, and `miraverse.mcworld`, run automated Luau & Bedrock state-machine unit tests in Vitest, and honestly report live desktop Studio/Bedrock GUI execution as `BLOCKED (Host OS: Linux aarch64 headless — static build & state-machine tests PASS; requires Windows/macOS GUI client for interactive playtest)`.
4. **DGX Spark Memory & Thermal Contention:**
   - *Mitigation (`DX01`–`DX15`):* Queue all 15 DGX Spark tasks (`DX01`–`DX15`) sequentially (`max_concurrency = 1`) against the already loaded `qwen/qwen3-coder-next` model at `http://localhost:1234/v1`, recording exact prompt/completion tokens, latency, and GPU memory/temperature.
