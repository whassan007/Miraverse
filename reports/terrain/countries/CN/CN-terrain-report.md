# China (CN) — Real-World Topography Implementation Report

## 1. Playable Geographic Scope & Destinations

### Wuling / Taoyuan Spring Setting (CN_wuling)
- **Classification**: REGION
- **WGS84 Coordinates**: Latitude `28.9`, Longitude `111.4833`
- **Elevation Range**: Min `22.0 m`, Max `155.0 m`, Relief `133.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `a2a6bd97967466ac7dae6554ee66b2f5d55dc04644e41f6aa180013f7c913913`
- **Materials**: Ground `Mud`, Rock `Limestone`, Water `Water`, Veg `Grass`
- **Description**: Karst river valley, peach groves, limestone cave entrance and terraced basin

## 2. Roblox World Integration & Gameplay Protection
- Authoritative Cell Offset: `CN` assigned origin in `WorldRegistry.luau`.
- Central Plaza Protected Radius: 48 studs preserved at flat surface height for zero quest obstruction.
- Spawns, Mentor NPC, and travel routes verified.

## 3. Visual and Topographic Evidence
Comparison composites saved in `reports/terrain/screenshots/` and `reports/terrain/countries/CN/`.
- DEM Hillshade: Azimuth 315°, Altitude 45°
- Normalized Heightmap: 8-bit / 16-bit PNG
- Hypsometric Topographic Composite: Blue (water) -> Green (plains) -> Tan (mid) -> White (peaks)

## 4. Acceptance Status
**STATUS: READY FOR REVIEW / PASS**
