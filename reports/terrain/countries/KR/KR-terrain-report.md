# South Korea (KR) — Real-World Topography Implementation Report

## 1. Playable Geographic Scope & Destinations

### Jeonju Hanok Village (KR_jeonju)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `35.815`, Longitude `127.1536`
- **Elevation Range**: Min `15.0 m`, Max `430.0 m`, Relief `415.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `da0f8a2bbeb77d09bc1a2ac4d9468bd88d9b8ea4f12f0ad3b47ed42b7c7e0e2e`
- **Materials**: Ground `Cobblestone`, Rock `Granite`, Water `Water`, Veg `Grass`
- **Description**: Inland basin nestled beside hills with traditional Hanok roofs

### Seoul (Bukhan / Han River) (KR_seoul)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `37.5665`, Longitude `126.978`
- **Elevation Range**: Min `0.0 m`, Max `282.0 m`, Relief `282.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `b2f0ec42ce5abefefe488f23123cd5a2068480dd505f560681e07b00fd7e5652`
- **Materials**: Ground `Cobblestone`, Rock `Granite`, Water `Water`, Veg `Grass`
- **Description**: Granite peaks (Namsan, Bukhansan) bordering the wide Han River

### Busan Harbor & Coastal Hills (KR_busan)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `35.1796`, Longitude `129.0756`
- **Elevation Range**: Min `-1.0 m`, Max `628.0 m`, Relief `629.0 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `d4d130fb6d44ebd8828966fae39531fec70c4e16fc512af007bd1bf12c964b5a`
- **Materials**: Ground `Sand`, Rock `Granite`, Water `Water`, Veg `Grass`
- **Description**: Steep coastal mountains descending directly to Korea Strait harbors

## 2. Roblox World Integration & Gameplay Protection
- Authoritative Cell Offset: `KR` assigned origin in `WorldRegistry.luau`.
- Central Plaza Protected Radius: 48 studs preserved at flat surface height for zero quest obstruction.
- Spawns, Mentor NPC, and travel routes verified.

## 3. Visual and Topographic Evidence
Comparison composites saved in `reports/terrain/screenshots/` and `reports/terrain/countries/KR/`.
- DEM Hillshade: Azimuth 315°, Altitude 45°
- Normalized Heightmap: 8-bit / 16-bit PNG
- Hypsometric Topographic Composite: Blue (water) -> Green (plains) -> Tan (mid) -> White (peaks)

## 4. Acceptance Status
**STATUS: READY FOR REVIEW / PASS**
