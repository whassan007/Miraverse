# MiraVerse v1.0 Minecraft Bedrock — Script API Compatibility Report (`API_COMPATIBILITY.md`)

- **Target Platform:** Minecraft: Bedrock Edition (`min_engine_version: [1, 20, 80]`).
- **Pinned Stable Script API Modules:**
  - `@minecraft/server`: `1.17.0` (Stable — zero `-beta` suffix)
  - `@minecraft/server-ui`: `1.3.0` (Stable — zero `-beta` suffix)
- **Prohibited Modules Confirmed Absent:** `@minecraft/server-net`, `@minecraft/server-admin`, `@minecraft/server-gametest`.
- **Validation Tool:** `node apps/minecraft/tools/checks/packs/validate-packs.mjs` (`DX13`) — **PASS**.
