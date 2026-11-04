# Morocco (MA) — Real-World Topography Implementation Report

## 1. Playable Geographic Scope & Destinations

### Marrakesh & High Atlas Foreland (MA_marrakesh)
- **Classification**: REGION
- **WGS84 Coordinates**: Latitude `31.6295`, Longitude `-7.9811`
- **Elevation Range**: Min `429.0 m`, Max `512.0 m`, Relief `83.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `0a8fd6d0de5362131800d3a006fdbbaed29b3ffcefcbd20bb93712d3a4ea466c`
- **Materials**: Ground `Sandstone`, Rock `Rock`, Water `Water`, Veg `Grass`
- **Description**: Haouz plain, palm groves, red rammed-earth ramparts, view of Atlas snowline

## 2. Roblox World Integration & Gameplay Protection
- Authoritative Cell Offset: `MA` assigned origin in `WorldRegistry.luau`.
- Central Plaza Protected Radius: 48 studs preserved at flat surface height for zero quest obstruction.
- Spawns, Mentor NPC, and travel routes verified.

## 3. Visual and Topographic Evidence
Comparison composites saved in `reports/terrain/screenshots/` and `reports/terrain/countries/MA/`.
- DEM Hillshade: Azimuth 315°, Altitude 45°
- Normalized Heightmap: 8-bit / 16-bit PNG
- Hypsometric Topographic Composite: Blue (water) -> Green (plains) -> Tan (mid) -> White (peaks)

## 4. Acceptance Status
**STATUS: READY FOR REVIEW / PASS**
