# Roblox Terrain Performance, Streaming & Mobile Budget Report

- **Spatial Cell Architecture:** Each of the 11 countries occupies an isolated `800 x 800` stud world cell (`X = index * 800`), with regional destinations separated along the Z axis (`Z = 0`, `Z = +260`, `Z = -260/-310`).
- **3D Bounding Box Isolation:** Automated pairwise intersection tests across all 21 `WorldRegistry.LOCATIONS` confirm **0 overlapping bounding boxes**.
- **Terrain Voxel & Macro-Cell Budget:**
  - `GeoTerrainBuilder.luau` snaps voxel fills to Roblox's native `4`-stud grid (`20 x 20` columns per location = 400 voxel calls per location).
  - `TerrainPipeline.luau` builds `8 x 8` outer topographic relief macro-cells outside the central `clearRadiusStuds` playable pad (< 64 parts per destination).
- **Streaming & Mobile Safety:** `SessionManager.luau` invokes `player:RequestStreamAroundAsync(target.Position, 5)` prior to `character:PivotTo(target)` on every country and regional transition.
