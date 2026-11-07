# Minecraft root-cause audit

Target: Minecraft Bedrock, `min_engine_version` 1.21.50, stable `@minecraft/server` 1.17.0 and `@minecraft/server-ui` 1.3.0.

Evidence below comes from reading and measuring the repository. **No finding comes from a running game**, because no Bedrock client or server has been available so far.

## Shared causes

The seven defects have fewer than seven causes.

1. **No world-event layer.** No script subscribes to `playerInteractWithEntity`, `playerInteractWithBlock`, `playerPlaceBlock` or `playerBreakBlock`. Without those events, quests can only run through menus and NPCs can't respond. This one gap drives Defects 2 and 3, and part of 6.
2. **Validation checked files, not behavior.** Earlier gates passed on schemas and counts, so identical cities and untextured blocks passed.
3. **Content is generated from one template.** One layout generator produced every city, and my chapter generator reuses five activity patterns. This drives Defects 1 and 2.

## Defects

### 1. Cities are identical

- **Symptom:** cities differ only in color.
- **Root cause:** measured, all 11 `*_district_v11.mcstructure.json` files have the same voxel position set (`57ce1e01c2`, 5,641 voxels). There is 1 distinct layout across 11 cities.
- **Files:** `apps/minecraft/world/*/structures/`, `swarm/minecraft-global/run-wave*.mjs`, `tools/minecraft/compile-atlas.mjs`.
- **Repair:** a data-driven settlement generator with distinct terrain, water and street graphs per city.
- **Owners:** AGY-01 to AGY-13.
- **Failing test now:** `city layouts are distinct` in `tests/minecraft/recovery-baseline.test.ts`.
- **Proof needed:** structural signature comparison, path reachability checks, and in-game screenshots.
- **Save risk: high.** Built districts are marked by `mv:atlas_built_v1:<code>`. A rebuild needs a new version key and must clear the old volume. Worlds must be backed up first.

### 2. Quests run through menus

- **Symptom:** "Gather" buttons and "Place all blocks for me".
- **Root cause:** `challenges/gather.ts` adds items from a button press, and `challenges/build.ts` places blocks for the player. The shared cause above leaves no other option.
- **Repair:** objectives driven by world events and verified against real blocks, positions and inventory.
- **Owners:** CX-01, CX-02, CL-01 to CL-06.
- **Failing test now:** `quests have no menu shortcuts`.
- **Proof needed:** a scripted player completing a quest on a real Bedrock server.
- **Save risk: medium.** Existing Atlas progress is `mv:atlas_progress_v1`. Keep completed chapters, and restart in-progress ones from their last checkpoint.

### 3. NPCs are static and silent

- **Symptom:** NPCs stand still and nothing happens when you talk to them.
- **Root cause:** mentors have `minecraft:movement` set to 0 and no navigation or stroll behavior. The global NPCs have navigation but no AI goals. No script handles interaction, and `npc/index.ts` `talk()` is never connected to one.
- **Files:** `apps/minecraft/bp/entities/`, `apps/minecraft/scripts/npc/index.ts`.
- **Repair:** three behavior profiles, an interaction handler, and dialogue that branches on player state.
- **Owners:** CX-03, CX-04, AGY-15.
- **Failing test now:** `NPCs can move and respond`.
- **Proof needed:** real server test of spawn, interaction, pathing and save and reload.
- **Save risk: low to medium.** Existing entities keep their identifiers, and changed behaviors apply on load.

### 4. Custom blocks had no textures: fixed in source, unproven in game

- **Root cause:** no `material_instances` on any block, and no `rp/textures/terrain_texture.json` or `rp/blocks.json`.
- **Repair done:** `tools/minecraft/gen-block-textures.mjs` generates original textures for all 88 blocks and connects them.
- **Owner:** CX-05, AGY-14.
- **Passing test:** `tests/minecraft/identifiers-and-textures.test.ts`.
- **Still unproven:** rendering and content-log cleanliness need a real client. Districts keep using standard blocks until then.
- **Save risk: low.**

### 5. Menus are English-only

- **Symptom:** menus are always English.
- **Root cause:** the packs do contain translated `.lang` files (`miraverse.*` keys), but every menu in `challenges/`, `core/passport.ts` and `atlas/` passes hard-coded English. No live code path calls `LocaleService`.
- **Repair:** pass translation keys as `RawMessage` so the client resolves them natively, generated from the one shared catalog. Arabic is not a native Bedrock language, so it needs an in-game selector, and shaping must be tested on a real client before Arabic script is relied on.
- **Owners:** CX-06, AGY-17, CL-09.
- **Failing test now:** `menus use translation keys`.
- **Proof needed:** selecting French in a real client and seeing it.
- **Save risk: none.**

### 6. Original five countries lack the extra chapters

- **Root cause:** `atlas/index.ts` compiles only six countries (`CODES` in `tools/minecraft/compile-atlas.mjs`), so the 30 chapters Roblox gives Lebanon, Iraq, Egypt, France and South Korea aren't offered.
- **Repair:** port them after the physical quest system exists. Porting today would only add more menu quests, which the brief prohibits.
- **Owners:** CL-08, CX-07.
- **Failing test now:** `original five countries have their chapters`.
- **Proof needed:** `reports/minecraft/quest-parity.json`, built from real test results.
- **Save risk: low.** New progress keys sit alongside the classic ones.

### 7. Invalid Morocco identifier: fixed

- **Root cause:** `ma_marrakesh_terracotta_pisé` came from the shared catalog. The district data already used a plain `pise` ID, so that block never matched its definition.
- **Repair done:** renamed everywhere in source, keeping "Pisé" as the display name. The same scan found and fixed `minecraft:Barrel`, `SANDSTONE`, `Brick_block`, `AZALEA_LEAVES` and `Jungle_planks`.
- **Owner:** CX-08.
- **Passing test:** the repository-wide scan in `tests/minecraft/identifiers-and-textures.test.ts`.
- **Save risk: very low.** Earlier builds never placed the accented block, because districts use standard blocks.

## Blockers

| Blocker | Why it matters |
|---|---|
| No Bedrock runtime | The brief's Level 3 tests can't run without it. A dedicated server on the DGX could cover loading, content logs and scripted players, but not rendering. |
| Family characters undefined | Liam, Kassem and Sharazad appear nowhere in the repository, and the only Layla is an Egyptian guide. |
| Brief truncated | The text ends at Phase 11, Level 3, "Switch". |

## Status

No part of the 40-agent plan has been dispatched, because the brief requires the Lebanon slice to work first. Defects 4 and 7 are repaired in source. Defects 1, 2, 3, 5 and 6 are open.
