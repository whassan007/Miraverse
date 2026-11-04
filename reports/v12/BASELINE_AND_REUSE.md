# MiraVerse v1.2 — Baseline Inventory & Non-Destructive Reuse Report

- **Generated At:** 2026-11-04T07:48:05.775Z
- **Country Sequence:** `LB -> IQ -> EG -> FR -> KR`
- **Non-Destructive Guarantee:** All 21 canonical v0.8/v1.1 packs, quest definitions, NPC dialogues, and bilingual stories are preserved byte-for-byte (verified via SHA-256 checksums in `tools/v12/migration/verify-non-destructive.mjs`).

## 1. Preserved Preexisting Files & SHA-256 Checksums

| File Path | SHA-256 Checksum | Status |
|---|---|---|
| `packages/content/schema.ts` | `d675683c9914fb3f…` | Preserved (Unmodified) |
| `packages/content/packs/LB.json` | `8b4d5426171efa4f…` | Preserved (Unmodified) |
| `packages/content/packs/IQ.json` | `7b4ce989e66ebab5…` | Preserved (Unmodified) |
| `packages/content/packs/EG.json` | `6357ee245aed0099…` | Preserved (Unmodified) |
| `packages/content/packs/FR.json` | `839ebf9b4428b5ce…` | Preserved (Unmodified) |
| `packages/content/packs/KR.json` | `a56ddd4529e3acfe…` | Preserved (Unmodified) |
| `content/quests/LB.json` | `44bd3bda88f48fbc…` | Preserved (Unmodified) |
| `content/quests/IQ.json` | `f1b8c7adee11454e…` | Preserved (Unmodified) |
| `content/quests/EG.json` | `9b016c48e992e06d…` | Preserved (Unmodified) |
| `content/quests/FR.json` | `46fe8c8cae3d4d79…` | Preserved (Unmodified) |
| `content/quests/KR.json` | `ae088a32ddd95521…` | Preserved (Unmodified) |
| `content/dialogue/LB.json` | `9ca119e9be87b1e0…` | Preserved (Unmodified) |
| `content/dialogue/IQ.json` | `27e1a8fa108daf6e…` | Preserved (Unmodified) |
| `content/dialogue/EG.json` | `c0c930f78a50a3dc…` | Preserved (Unmodified) |
| `content/dialogue/FR.json` | `bfeff2f5d9deef11…` | Preserved (Unmodified) |
| `content/dialogue/KR.json` | `6407fd4b5bbd24dc…` | Preserved (Unmodified) |
| `packages/content/stories/ar-LB.json` | `807dc064fe5dcb5c…` | Preserved (Unmodified) |
| `packages/content/stories/ar-IQ.json` | `c65035936279900d…` | Preserved (Unmodified) |
| `packages/content/stories/ar-EG.json` | `1917b8d6912e02d2…` | Preserved (Unmodified) |
| `packages/content/stories/fr.json` | `e82cb6f40da7a396…` | Preserved (Unmodified) |
| `packages/content/stories/ko.json` | `4398b99d710f08d9…` | Preserved (Unmodified) |

## 2. Reversible Staging & Rollback Architecture

- **Staging Directory:** `content/v12/staging/` holds segmented claims, entity links, provenance JSONL, and country records prior to compilation.
- **Additive Compiler:** `tools/v12/compiler/compile-v12.mjs` emits `apps/roblox/src/shared/KnowledgeV12.luau`, `apps/minecraft/scripts/generated/knowledgeV12.ts`, and `apps/web/src/generated/knowledgeV12.json` without mutating existing v0.8/v1.1 runtime files.
- **Rollback Utility:** `node tools/v12/migration/rollback.mjs --verify` validates instant reversibility.
