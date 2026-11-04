# MiraVerse v1.0 Minecraft Bedrock — Startup Audit & Truth Baseline (`reports/minecraft-v10/BASELINE.md`)

- **Audit Timestamp:** 2026-11-03T22:29:00-08:00
- **Orchestrator Host:** Linux `waelbot 7.0.0-1019-nvidia aarch64` (Ubuntu 24.04, NVIDIA GB10 128 GB Unified Memory)
- **Git Branch at Audit:** `integration/miraverse-v0.5` (`HEAD: 8115452`)
- **Windows Minecraft Bedrock Editor / Native Bedrock GUI Client Availability:** **UNAVAILABLE ON THIS LINUX `aarch64` HOST (`BLOCKED`)**
  - Minecraft Bedrock Editor and the desktop Minecraft: Bedrock Edition client require Windows 10/11 (`x64`).
  - Per Section 0 & Section 6: **We will NOT forge a renamed ZIP as `miraverse-adventure.mcworld` and we will NOT fabricate synthetic GUI screenshots claiming to be captured inside Minecraft Bedrock.** All client-GUI-dependent gates (`MC-B02`, `MC-B03`, `MC-B04`, `MC-V01`–`MC-V10` live client capture, `MC-Q01` live client capture, `MC-Q03` live controller/mobile test) will be truthfully tracked as `BLOCKED (Requires Windows Bedrock Client/Editor Host)` until executed on a Windows machine via the generated handoff package.

---

## 1. Honest Feature-to-Code & Artifact Audit of Existing `apps/minecraft/`

Every existing claim and file in `apps/minecraft/` was inspected directly on disk. Below is the exact classification (`REAL`, `PARTIAL`, `STUB`, `UNVERIFIED`, `MISSING`):

| Subsystem / Claim | Existing Path(s) | Audit Status | Exact Findings & Deficits |
|---|---|---|---|
| **Behavior Pack Manifest & Pinned Script API** | `apps/minecraft/bp/manifest.json` | **REAL** | Valid Bedrock manifest (`format_version: 2`), unique UUIDs, pinned to stable `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0` with zero experimental flags. |
| **Resource Pack Manifest & Item Textures** | `apps/minecraft/rp/manifest.json`, `rp/textures/items/*.png` | **REAL** | Valid RP manifest and 70+ 16×16 PNG item icons with valid PNG headers and `item_texture.json` mappings. |
| **Custom Block Definitions & Terrain Atlas** | `apps/minecraft/bp/blocks/`, `rp/textures/blocks/`, `rp/blocks.json` | **MISSING** | Zero custom architectural/restoration block definitions exist in `bp/blocks/` or `rp/textures/blocks/`. Only vanilla block IDs were referenced in scripts. |
| **Mentor Entity Definitions & Animation Controllers** | `bp/entities/mentor_*.json`, `rp/entity/mentor_*.entity.json`, `rp/animations/mentor.animation.json`, `rp/animation_controllers/mentor.animation_controllers.json` | **PARTIAL** | Entity JSONs, 5 PNG skins (`mentor_{lb,eg,iq,kr,fr}.png`), and basic `idle`/`wave` animations exist, but custom Blockbench `.bbmodel` source files (`assets-src/mentors/`), custom `rp/models/entity/*.geo.json`, custom `rp/render_controllers/`, and full `idle`/`walk`/`greeting`/`pointing`/`celebrate`/`working` states are **MISSING**. |
| **World Hub & 5 Country Districts (`world/index.ts`)** | `apps/minecraft/scripts/world/index.ts` | **STUB** | `buildLobbyOps()` and `buildCountryPlazaOps()` only generate flat 17×17 / 21×21 square platforms (`buildPlatformOps`) with 3 single-block markers (`spawn`, `mentor`, `build`) and 3-block gate arches. Does **NOT** build 5 distinct building exteriors, 3 furnished interiors, kitchens, market stalls, or landscapes. |
| **District Structure Files (`structures/*.mcstructure.json`)** | `apps/minecraft/structures/{hub,LB,EG,IQ,KR,FR}.mcstructure.json` | **STUB** | Each file is a 22-line JSON metadata stub listing `size`, `world_origin`, and a 4-item `palette` array, with zero actual 3D block-placement grids, interiors, roofs, or furniture. |
| **Playable Exported `.mcworld` Archive** | `apps/minecraft/dist/miraverse-adventure.mcworld` | **MISSING / BLOCKED** | Correctly documented in `apps/minecraft/world/WORLD_EXPORT_STATUS.md` as `BLOCKED` on Linux `aarch64` because binary LevelDB world export requires the native Windows Bedrock client/Editor. |
| **Modular `scripts/src/` Architecture** | `apps/minecraft/scripts/src/` | **MISSING** | Current scripts live flat in `scripts/{core,challenges,npc,world}/`. The modular v1.0 architecture (`contracts`, `quests`, `npc`, `regions`, `inventory`, `challenges`, `state`, `passport`, `multiplayer`, `bootstrap`, `structures`, `ui`) is not yet implemented. |
| **Challenge Mechanics (`gather`, `trade`, `cook`, `build`, `word`)** | `apps/minecraft/scripts/challenges/*.ts` | **PARTIAL** | Basic form/block-check challenges and `v06-byblos-challenges.ts` exist, but lack full 5-dish step-by-step kitchen station state machines, 3-stage before/after voxel building restoration, physical word-object discovery anchors, and optional discovery collectibles. |
| **Two-Player Co-Op & Plot Ownership Permissions** | `apps/minecraft/scripts/src/multiplayer/` | **MISSING** | No plot ownership registry, collaborator grant/revoke system, unauthorized block-edit rejection, or mid-quest disconnect safety exists yet. |
| **Deterministic Stamp Checksum (`stamp.ts`)** | `apps/minecraft/scripts/core/stamp.ts` | **REAL** | Matches all 5 golden vectors (`MV-<CC><chapter>-<NNNN>-<CCCC>`) across Web, Roblox, and Minecraft (`tests/integration/gates.test.ts` Gate G5 PASS). |
| **Packaged `.mcaddon` Archive** | `apps/minecraft/dist/miraverse.mcaddon` | **PARTIAL (Static PASS / Runtime UNVERIFIED)** | Compiles and unzips cleanly into `bp/` and `rp/` (Gate G5 PASS), but lacks the v1.0 full district structures, custom blocks, entity geometries, multiplayer plot system, and live Windows Bedrock client import verification. |

---

## 2. Existing Screenshot Inventory & Provenance Check

- **Web & Commerce Screenshots (`reports/screens/v0.4/`, `reports/screens/commerce/`, `dist/screenshots/`):** 33 real Playwright Chromium captures of the Web 3D & Parent Portal app.
- **Real Minecraft Bedrock Client Screenshots (`reports/minecraft-v10/screens/`):** **0 real Bedrock client captures exist on disk.**
  - *Policy Enforcement:* We will **never** copy WebGL screenshots or generate fake AI/2D mockups into `reports/minecraft-v10/screens/` claiming they are Bedrock client captures. `DX14` and `AG20` will enforce this boundary strictly.

---

## 3. Preservation & Remapping Contract for v1.0

1. **Preserve 100% of Existing Cross-Platform Contracts & Tests:**
   - `packages/content/packs/*.json`, `packages/content/stories/*.json`, `packages/content/vocab/*.json`, `tools/compiler/minecraft.ts`, `apps/minecraft/scripts/generated/packs.ts`, `apps/minecraft/scripts/core/stamp.ts`, and `tests/integration/gates.test.ts` (Gates G1–G6) must remain 100% green.
2. **Implement Complete v1.0 Architecture in `apps/minecraft/`:**
   - Build all 20 Antigravity (`AG01`–`AG20`), 20 DGX Spark (`DX01`–`DX20`), 5 Claude (`CL01`–`CL05`), and 5 Codex (`CX01`–`CX05`) deliverables in isolated worktrees on branches `minecraft-v10/<ID>`, committing each agent's work immediately upon completion and merging into `integration/miraverse-v0.5` -> `main`.
