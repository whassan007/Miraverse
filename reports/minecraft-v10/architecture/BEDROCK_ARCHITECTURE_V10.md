# MiraVerse v1.0 — Minecraft Bedrock Architecture & Subsystem Contract (`reports/minecraft-v10/architecture/BEDROCK_ARCHITECTURE_V10.md`)

- **Owner:** `CL01` (Wave W0)
- **Target API:** `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0` (Stable Only — Zero Experimental Flags)

## 1. Subsystem Ownership & Authority Rules

1. **`CL01` (`scripts/src/contracts/`):** Freezes all data structures for regions, buildings, interiors, NPCs, quest lifecycle (`DISCOVERED -> ACCEPTED -> ACTIVE -> COMPLETED -> REWARDED`), 5 challenge mechanics, plot ownership, and persistence.
2. **`CL02` (`scripts/src/quests/`, `npc/`, `regions/`):** Host-authoritative quest state transitions, mentor/NPC dialogue dispatch, and 5-region spatial anchor registries (`LB`, `EG`, `IQ`, `KR`, `FR`).
3. **`CL03` (`scripts/src/inventory/`, `challenges/`):** Executes physical Gather (with cooldowns and anti-duplication), atomic Trade (with rollback on insufficient items), 5 step-by-step Cook sequences (with adult NPC oven supervision), 3-stage in-world Block Restoration, and 3-object Word discovery per country.
4. **`CL04` (`scripts/src/state/`, `passport/`, `multiplayer/`):** Sole writer of persisted `PlayerSaveStateV10` and `WorldSaveStateV10`, idempotent Passport stamp issuance, and host-authoritative 2-player co-op & plot collaborator permissions.
5. **`CX03` (`scripts/src/bootstrap/`, `structures/`, `ui/`):** Wires Bedrock world/player events, chunk-safe multi-tick structure placement, skippable tutorial, and native `@minecraft/server-ui` forms.

## 2. Preservation of Existing Web & Roblox Outputs

- `packages/content/packs/*.json` and `tools/compiler/index.ts` remain backward-compatible so Web and Roblox builds continue passing Gate G2 and Gate G4 without modification.
