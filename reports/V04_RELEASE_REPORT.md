# MiraVerse v0.4 Release Candidate Report

**Branch:** `integration/miraverse-v0.4` (`HEAD: e192794`)
**Date:** 2026-11-04T02:57:19.791Z

---

## 1. Executive Release Readiness Verdict

| Release Gate / Track | Verdict | Rationale & Evidence |
|---|---|---|
| **FREE GAME READY** | **PASS** | Full-bleed Web 3D Adventure (`/play`, `/play/FR`, `/play/LB`, `/play/EG`, `/play/IQ`, `/play/KR`), Cinematic 3D Homepage (`/`), 15-scene bilingual storybooks, Souvenir Passport (`mv.save.v4`), Roblox `.rbxlx` build, and Minecraft Bedrock `.mcaddon` + `.mcstructure` templates all build and pass automated verification. |
| **COMMERCE TEST MODE READY** | **PASS** | Adult-only Parent Portal (`/parents`, `/parents/shop`, `/parents/gifts/redeem`), Stripe test-mode Checkout (`POST /api/parents/checkout-session`), raw-body HMAC-verified webhook fulfillment (`POST /api/billing/stripe-webhook`), 128-bit single-use gift codes, and append-only Earned Mira Token ledger pass all 20 scenarios (`C01`–`C20`). |
| **LIVE COMMERCE** | **BLOCKED (By Design)** | `STRIPE_LIVE_ENABLED = false` and `ENABLE_SUBSCRIPTIONS = false` are enforced in code. Live customer charging remains disabled pending external operator legal counsel, privacy policy publication, merchant tax configuration, and live Stripe webhook secret provisioning. |
| **NATIVE ROBLOX & MINECRAFT LIVE GUI RUNTIME** | **PASS (Static/Package) / BLOCKED (Live GUI)** | Linux `aarch64` build host compiles and verifies `apps/roblox/dist/miraverse.rbxlx` and `apps/minecraft/dist/miraverse.mcaddon` (`Gate G4` & `Gate G5` PASS); interactive GUI playtesting in Roblox Studio and Minecraft Bedrock client requires a Windows/macOS desktop host. |

---

## 2. Deliverable Verification Summary

1. **Web 3D Adventure (`apps/web/src/game3d/`, `apps/web/src/pages/Play.tsx`):**
   - Powered by **Babylon.js (`@babylonjs/core@7.34.2`) + glTF 2.0 (`.glb`)**.
   - 3D World Hub (`/play`) with central Compass Fountain and 5 cultural portal arches.
   - Complete **France Vertical Slice (`/play/FR`)** in Vieux Lyon + complete chapters for **Lebanon (`LB`)**, **Egypt (`EG`)**, **Iraq (`IQ`)**, and **South Korea (`KR`)**.
   - 3-stage live 3D landmark restoration, typewriter NPC dialogue with RTL Arabic & Korean Hangul support, edge HUD, and mobile touch controls.
   - Visual Rubric Score (`reports/ART_QA.md`): **47.5 / 50** (threshold `>= 42/50`).
2. **Cinematic Public Homepage (`apps/web/src/landing/`):**
   - Full-bleed animated 3D diorama hero + immediate static SVG poster fallback (`art/branding/landing/hero-poster.svg`).
   - Prominent **Play Free Now** CTA, interactive 5-world preview switcher, reduced-motion pause toggle, and separate **For Parents & Guardians** pathway.
   - Homepage Rubric Score (`reports/ART_QA.md`): **34.0 / 35** (threshold `>= 30/35`).
3. **Parent-Only Commerce, Gifting & Earned Mira Tokens (`apps/api/`, `apps/web/src/storefront/`, `apps/web/src/parent/`):**
   - Strict separation between **Earned Mira Tokens** (`QUEST_EARN`, `COSMETIC_SPEND`, `ADMIN_CORRECTION`) and **Parent-Purchased Web Entitlements / Gift Codes**.
   - All 20 required scenarios `C01`–`C20` verified in `tests/e2e/commerce/commerce-c01-c20.test.ts`.
4. **Roblox & Minecraft Bedrock Parity (`apps/roblox/`, `apps/minecraft/`, `reports/PARITY_MATRIX.md`):**
   - Shared pack/quest/character/item/stamp contracts across Web, Roblox, and Minecraft Bedrock (`tests/cross-platform/parity.test.ts`).
