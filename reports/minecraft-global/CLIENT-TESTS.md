# MiraVerse Global v1.1 — Client Runtime & Automated Verification Report (`CLIENT-TESTS.md`)

## 1. Automated Verification Executed on Linux `aarch64` Host (`VERIFIED`)
- `node apps/minecraft/tools/content-compiler/compile-global.mjs` — **PASSED** (11 countries, 66 chapters, 264 age variants, 14 locales, 55 NPCs, 89 rewards).
- `node apps/minecraft/tools/rtl/verify-rtl-locales.mjs` — **PASSED** (14 locales, 0 missing keys, distinct Arabic dialects `ar`, `ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`).
- `node apps/minecraft/tools/optimize/profile-budget.mjs` — **PASSED** (all PNG, Blockbench, and structure budgets within limits).
- `node apps/minecraft/tools/distribution/verify-reproducibility.mjs` — **PASSED** (bit-identical SHA-256 across successive builds of `miraverse-global.mcaddon`).
- `npx vitest run` — **PASSED** (including `global-264-variants.test.ts`, `global-release-deliverables.test.ts`, and all legacy G1–G6 gates).

## 2. Windows Minecraft Bedrock GUI Client & Editor Status (`BLOCKED`)
- **Status:** `BLOCKED (native runtime missing on Linux aarch64 host)`.
- **Reason:** Minecraft Bedrock Editor and the Windows Bedrock UWP/GDK client are Windows PC binaries and cannot execute natively on this headless Linux `aarch64` server.
- **Handoff Provided:** `apps/minecraft/editor/export-windows-mcworld.ps1` and `apps/minecraft/editor/editor-project.json`.
