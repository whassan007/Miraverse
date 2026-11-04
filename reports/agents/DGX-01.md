# DGX-01: Full 11-country content inventory

Backend: dgx (qwen3-coder:30b)

# MiraVerse Cultural Game Program – READ-ONLY Report

## Findings

This report outlines the full scope of the 11-country content inventory for the MiraVerse children's cultural game program, based on `swarm/minecraft-global/catalog-data.mjs`. The data defines canonical country structures, chapters, artifacts, NPCs, blocks, and locale profiles. No files are to be edited or deployed.

### Content Overview

- **Countries**: 11 countries with distinct cultural themes, settings, and learning words.
- **Chapters**: 66 total chapters (6 per country).
- **Age Tracks**: 4 age-appropriate challenge modes: `5-7`, `8-10`, `11-13`, `14-17`.
- **Artifacts**: 66 chapter artifacts + 11 capstone cultural artifacts.
- **NPCs**: 55 total characters across countries.
- **Custom Blocks**: 88 unique block types.
- **Locales**: 14 locale profiles including RTL and CJK scripts.
- **Source Provenance**: 20+ citations (truncated).

---

## Specification

### Scope

This is a fully defined, ready-to-implement cultural game world for children with age-appropriate challenges, multi-lingual support, and culturally sensitive narrative structures.

### Implementation Ready

The following are ready for development implementation based on repository data:

| Component | Path |
|----------|------|
| Global catalog definitions | `swarm/minecraft-global/catalog-data.mjs` |
| Country data (11) | `COUNTRIES_GLOBAL` |
| Chapter structure per country | `chapters[]` |
| Age challenge modes | `ageChallengeModes` |
| Custom blocks | `customBlocks[]` |
| NPCs | `cast[]` |
| Learn words | `learnWords[]` |
| Locale profiles | `GLOBAL_LOCALES` |
| Passport stamps & capstone artifacts | `passportStampId`, `capstoneArtifactId` |

### Files a Later Implementation Would Own

| Purpose | File |
|--------|------|
| Country-specific scenes | `LB/harbor_docks.mjs`, `IQ/scholars_hall.mjs`, etc. |
| Chapter-specific gameplay logic | `LB01-06.mjs`, `IQ01-06.mjs`, etc. |
| Locale translation bundles | `locales/en-US.json`, `fr-FR.json`, etc. |
| Artifact definition files | `artifacts/lb_harbor_compass.mjs` |
| NPC behavior logic | `npcs/lb_teta_nahla.mjs` |

### Dependencies

- **Locale support**: Requires locale-aware UI and text handling in Roblox.
- **Custom block assets**: Must be available via `miraverse:` namespace.
- **Scene assets**: Scene files like `LB/harbor_docks` must exist or be created.
- **Age-appropriate gameplay logic**: Challenges must be implemented for each age track.

### Open Gaps

| Category | Description |
|---------|-------------|
| Cultural facts | All historical and mythological claims require human review for accuracy. Example: The Isis/Osiris journey to Byblos is mythology, not history. |
| Translations | Transliterations and native names are provided but not fully tested; no runtime proof available. |
| Source citations | Full source IDs like `SRC-LB-BYBLOS-MARITIME` require human research or integration with external databases. |
| Gameplay logic | Age-tracked challenges (`ageChallengeModes`) must be implemented in-game (not testable here). |
| Locale support | RTL languages like Arabic are defined but not validated for runtime rendering or UI behavior. |
| Asset availability | No actual asset files provided; all `miraverse:*` block references are placeholders for future asset creation. |

---

## Final Notes

- This is a READ-ONLY data view.
- All content is defined in `swarm/minecraft-global/catalog-data.mjs`.
- No file edits, commits or deployments allowed.
- Runtime validation of UI, gameplay and locale behavior is NOT TESTED.

---
