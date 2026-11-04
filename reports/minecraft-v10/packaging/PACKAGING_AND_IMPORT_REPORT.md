# MiraVerse v1.0 Minecraft Bedrock — Packaging & Import Report
**Owner:** `CX05` (Wave W4)

## Artifact Inventory
1. `apps/minecraft/dist/miraverse.mcaddon` — **READY & VERIFIED** (contains `MiraVerse BP` and `MiraVerse RP`, pinned to `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0`).
2. `apps/minecraft/dist/miraverse-sources.zip` — **READY & VERIFIED** (contains all authored `.mcstructure.json` prefabs, Blockbench `.bbmodel` rigs, 40 custom blocks, 50 items, and modular TypeScript Script API sources).
3. `apps/minecraft/dist/miraverse-adventure.mcworld` — **BLOCKED ON LINUX AARCH64 HOST** (requires Windows Minecraft Bedrock Editor/Client to export a genuine LevelDB world archive; handoff script provided at `apps/minecraft/tools/release/export-windows-mcworld.ps1`).
