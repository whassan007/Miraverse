# Iraq (IQ) — Real-World Topography Implementation Report

## 1. Playable Geographic Scope & Destinations

### Baghdad (Al-Mutanabbi / Tigris) (IQ_baghdad)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `33.3406`, Longitude `44.3879`
- **Elevation Range**: Min `25.0 m`, Max `59.0 m`, Relief `34.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `5733256efcdbfc6379cc228719a935b73c0e0cfa7dd57f8150e3ab0a4d8a0582`
- **Materials**: Ground `Mud`, Rock `Cobblestone`, Water `Water`, Veg `Grass`
- **Description**: Alluvial Mesopotamian plain, meandering Tigris River embankments

### Erbil Citadel (IQ_erbil)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `36.1911`, Longitude `44.0092`
- **Elevation Range**: Min `378.0 m`, Max `479.0 m`, Relief `101.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `48d172e674ebbea80cfc790e2d3cecc4e2337adf902d65567c7bf2bbb7ecf927`
- **Materials**: Ground `Brick`, Rock `Rock`, Water `Water`, Veg `Grass`
- **Description**: Ancient elevated tell citadel rising above Kurdistan foothills

### Basra & Shatt al-Arab (IQ_basra)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `30.5081`, Longitude `47.7835`
- **Elevation Range**: Min `-32.0 m`, Max `30.0 m`, Relief `62.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `29ca5e5a8ec4b769846c759209220a0d1d8d64fb81b5554ea2d9c4d9f9985b3d`
- **Materials**: Ground `Mud`, Rock `Sand`, Water `Water`, Veg `Grass`
- **Description**: Southern marsh and river confluence, palm groves and waterways

## 2. Roblox World Integration & Gameplay Protection
- Authoritative Cell Offset: `IQ` assigned origin in `WorldRegistry.luau`.
- Central Plaza Protected Radius: 48 studs preserved at flat surface height for zero quest obstruction.
- Spawns, Mentor NPC, and travel routes verified.

## 3. Visual and Topographic Evidence
Comparison composites saved in `reports/terrain/screenshots/` and `reports/terrain/countries/IQ/`.
- DEM Hillshade: Azimuth 315°, Altitude 45°
- Normalized Heightmap: 8-bit / 16-bit PNG
- Hypsometric Topographic Composite: Blue (water) -> Green (plains) -> Tan (mid) -> White (peaks)

## 4. Acceptance Status
**STATUS: READY FOR REVIEW / PASS**
