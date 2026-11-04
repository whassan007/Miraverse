# Unresolved Defects & Environment Blockers

## 1. Live Roblox Studio MCP Session (`BLOCKED — External GUI Process Absent`)
- **Status:** No live Roblox Studio GUI process or Studio MCP server is running on this Linux host (`ps aux` verified).
- **Mitigation & Truthful Evidence:**
  - `apps/roblox/dist/miraverse.rbxlx` builds cleanly via `rojo build`.
  - All 21 destinations have deterministic 4-panel GIS-to-Roblox visual verification composites (`reports/terrain/screenshots/<locationId>_gis_overview.png` and `reports/terrain/comparisons/<locationId>_comparison.png`), raw hillshades (`reports/terrain/hillshades/`), and heightmaps (`reports/terrain/heightmaps/`).
  - All 43 Roblox & Gate Vitest assertions pass.

## 2. Code / GIS / Gameplay Defects
- **None (0 open defects).** All 63 geographic control points, 21 DEM manifests, 11 country Luau modules, and travel graph transitions pass automated verification.
