# MiraVerse v0.4 — Host & Runtime Capabilities (`reports/CAPABILITIES.md`)

**Generated:** 2026-11-04T01:43:00Z  
**Host:** `waelbot` (Ubuntu 24.04 LTS, Linux `aarch64` / ARM64)  
**Target Integration Branch:** `integration/miraverse-v0.4` (branched from `main` @ `2e32eb03b19241aed2c8585c3869fad88825efda`)

---

## 1. Hardware & DGX Spark Unified Memory Specification

| Property | Measured Value | Notes |
|---|---|---|
| **GPU / SoC** | NVIDIA GB10 (DGX Spark) | Unified memory architecture (`128 GB` shared pool) |
| **GPU Temperature / Util** | `43°C`, `0%` baseline | Healthy thermal headroom |
| **Total Unified Memory** | `127,598,772 kB` (~121.7 GiB) | Shared between CPU OS and GPU inference |
| **Available Memory** | `44,309,360 kB` (~42.3 GiB) | Model server already resident in unified memory |
| **Local Model Endpoint** | `http://localhost:1234/v1` | OpenAI-compatible local inference server |
| **Verified Local Coding Model** | `qwen/qwen3-coder-next` | Loaded in unified memory; context window `8192` tokens |
| **Additional Local Models Listed** | `qwen2.5-7b-instruct`, `qwen/qwen3.8-27b`, `gemma-4-26b-a4b-it-qat`, `lfm3-1.7b`, `nvidia/nemotron-3-super`, `openai/gpt-oss-120b` | `qwen/qwen3-coder-next` selected for `DX01`–`DX08` |
| **DGX Probe Result** | `PASS` (`1110 ms` latency, `54` completion tokens, ~`48.6 tok/s`) | Deterministic JSON schema probe returned exact v4 structure with `0` errors |
| **DGX Concurrency Ceiling** | `1` (`MAX_DGX=1`) | Enforced via slot semaphore to prevent unified memory thrashing or swap pressure |

---

## 2. Agent CLI Providers & Verified Invocation Flags

| Lane | Agent IDs | Count | CLI Binary & Version | Verified Model(s) | Verified Headless Command | Concurrency Ceiling |
|---|---|---|---|---|---|---|
| **Antigravity** | `AG01`–`AG30` | 30 | `agy` `1.4.12` | `gemini-4-argon-high` (art bible, lookdev, QA), `gemini-4-argon-medium` (worlds, UI, culture) | `agy -p "<prompt>" --model <model> --mode accept-edits --settings '{"permissions":{"allow":["command(*)"]}}' --add-dir <wt_dir> --output-format json` | `6` |
| **Codex** | `CX01`–`CX10` | 10 | `codex` `0.166.0` | `gpt-6-astra` | `codex exec -m gpt-6-astra -s danger-full-access --ephemeral -C <wt_dir> "<prompt>" < /dev/null` | `3` |
| **Claude** | `CL01`–`CL10` | 10 | `claude` `2.1.318` | `claude-opus-5-5` (design, challenges, QA), `claude-sonnet-5-5` (platform modules) | `claude -p "<prompt>" --model <model> --permission-mode acceptEdits --allowedTools "Read Edit Write Bash" --no-session-persistence --output-format json` | `3` |
| **DGX Spark** | `DX01`–`DX08` | 8 | `node swarm/dgx-agent.mjs` | `qwen/qwen3-coder-next` (`http://localhost:1234/v1`) | Bounded JSON/TS/MD generation against `localhost:1234/v1/chat/completions` | `1` |

*Total Named Agents:* **58** (`30 AG + 10 CX + 10 CL + 8 DX`).  
*Total Stage Assignments:* **70** (`58` primary assignments + `12` v0.4 stage assignments `V4-01`–`V4-12` executed by existing named agents).

---

## 3. Web, 3D Asset, and Native Platform Toolchains

| Toolchain / Runtime | Status | Version / Path | Capability & Constraints |
|---|---|---|---|
| **Node.js & npm** | `AVAILABLE` | Node `v22.22.3`, npm `10.9.7` | Full ES2022 / TypeScript `5.6.3` / Vite `5.4.11` / Vitest `2.1.5` |
| **Babylon.js 3D Engine** | `AVAILABLE` | `@babylonjs/core@7.34.2`, `@babylonjs/loaders@7.34.2` | Pinned in `apps/web/package.json`; supports WebGL2, NullEngine deterministic testing, and glTF 2.0 / `.glb` loading |
| **Playwright Headless Chromium** | `AVAILABLE` | `@playwright/test@1.49.0`, Chromium `156.0.8078.4` | Captures real multi-viewport screenshots (`360×800`, `390×844`, `768×1024`, `1440×900`, `1920×1080`) and runs WebGL / canvas E2E tests |
| **Blender / External DCC CLI** | `NOT_INSTALLED` | N/A on Linux `aarch64` host | Headless Blender is not installed on host; `tools/assets/` (`CX06`) and `tools/procedural-props/` (`DX04`) generate deterministic binary glTF 2.0 (`.glb`) meshes, skeletons, animation keyframes, and procedural PBR textures directly via Node.js typed buffer builders, validated by `DX05` and `@babylonjs/loaders` |
| **Rojo (Roblox Builder)** | `AVAILABLE` | `rojo 7.7.1` (`/home/wael/.local/bin/rojo`) | Builds `apps/roblox/dist/miraverse.rbxlx` deterministically from `apps/roblox/default.project.json` |
| **Roblox Studio GUI** | `BLOCKED` | Unsupported on Linux `aarch64` | Static Luau AST/security checks and `.rbxlx` build run in CI; live Studio interactive playtest is honestly marked `BLOCKED` |
| **Minecraft Bedrock Build** | `AVAILABLE` | `@minecraft/server@1.17.0`, `@minecraft/server-ui@1.3.0`, `esbuild@0.24.0` | Compiles Script API TypeScript, generates `.mcstructure` NBT templates and packages `dist/miraverse.mcaddon` + `dist/miraverse-adventure.mcworld` |
| **Minecraft Bedrock GUI Runtime** | `BLOCKED` | Unsupported on Linux `aarch64` | Package/UUID/manifest/recipe/structure/script checks run in CI; live Bedrock client import playtest is honestly marked `BLOCKED` / `NOT_RUN` |
| **SQLite3 / Relational Store** | `AVAILABLE` | `/home/wael/miniconda3/bin/sqlite3` + PostgreSQL DDL migrations in `apps/api/db/` | Supports full transactional relational schema, unique indexes, idempotency keys, and append-only token ledger |

---

## 4. Policy & Reference Verification Log (Execution Day Check)

All external reference specifications required by Section 8D were reviewed and recorded on **2026-11-04**:
1. **Stripe Checkout & Fulfillment (`https://docs.stripe.com/payments/checkout`, `https://docs.stripe.com/checkout/fulfillment`):** Checkout Sessions must resolve prices server-side (`POST /api/parents/checkout-session`), never trust client price parameters or browser success-page redirects alone, and fulfill orders idempotently upon verified webhook receipt.
2. **Stripe Webhook Signature & Deduplication (`https://docs.stripe.com/events/manage-webhook-endpoints`):** `POST /api/billing/stripe-webhook` must verify raw request body HMAC signatures (`Stripe-Signature`) and deduplicate both `event.id` and `order_fulfillment_key`.
3. **FTC COPPA Rule & 2025 Amendments (`https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions`):** Free child-facing gameplay (`/`, `/play`, `/story`, `/passport`) collects zero personal information, requires no account or email, and loads zero third-party analytics/ad SDKs. Optional pseudonymous child profiles require adult authentication, explicit notice, consent provenance (`consent_records`), and parent export/delete controls.
4. **Roblox Creator Monetization Rules (`https://create.roblox.com/docs/production/monetization/developer-products`):** Roblox client/server code contains zero external payment links, Stripe references, QR codes, or web gift code redemptions; optional Roblox-native `MarketplaceService` support is isolated behind a disabled-by-default feature flag.
5. **Minecraft Commercial Usage Guidelines (`https://www.minecraft.net/en-us/usage-guidelines`):** `.mcaddon` and `.mcworld` distributions are 100% free and self-contained with Bedrock-local rewards only (never named Minecoins, never unlocked via external web Stripe payments).
