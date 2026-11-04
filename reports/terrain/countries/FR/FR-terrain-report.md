# France (FR) — Real-World Topography Implementation Report

## 1. Playable Geographic Scope & Destinations

### Vieux Lyon & Saône-Rhône Confluence (FR_lyon)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `45.764`, Longitude `4.8357`
- **Elevation Range**: Min `154.5 m`, Max `318.36 m`, Relief `163.85 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `b65cb2f5a80618a086ef11e80efa7be99749a87d9510b0a58d69c365713944d0`
- **Materials**: Ground `Cobblestone`, Rock `Limestone`, Water `Water`, Veg `Grass`
- **Description**: Fourvière hill, traboule passages between Saône and Rhône rivers

### Paris (Île de la Cité & Seine) (FR_paris)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `48.8566`, Longitude `2.3522`
- **Elevation Range**: Min `22.65 m`, Max `119.89 m`, Relief `97.24 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `167967f9022e7400c635ec4f909d6800d760ed6cca99960020ff5f6bf5aa9402`
- **Materials**: Ground `Cobblestone`, Rock `Limestone`, Water `Water`, Veg `Grass`
- **Description**: Gently sloping Seine river basin, river island, limestone bluffs

### Marseille (Vieux-Port & Calanques relief) (FR_marseille)
- **Classification**: CITY
- **WGS84 Coordinates**: Latitude `43.2965`, Longitude `5.3698`
- **Elevation Range**: Min `-2.81 m`, Max `143.25 m`, Relief `146.06 m`
- **Source Dataset**: Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles
- **Tile Checksum (SHA-256)**: `5c4bf351dcf70008e618dfccbb32bea2659a1c64f90f869c00f02c68039dcb99`
- **Materials**: Ground `Sand`, Rock `Limestone`, Water `Water`, Veg `Grass`
- **Description**: Natural Mediterranean limestone harbor flanked by steep coastal massifs

## 2. Roblox World Integration & Gameplay Protection
- Authoritative Cell Offset: `FR` assigned origin in `WorldRegistry.luau`.
- Central Plaza Protected Radius: 48 studs preserved at flat surface height for zero quest obstruction.
- Spawns, Mentor NPC, and travel routes verified.

## 3. Visual and Topographic Evidence
Comparison composites saved in `reports/terrain/screenshots/` and `reports/terrain/countries/FR/`.
- DEM Hillshade: Azimuth 315°, Altitude 45°
- Normalized Heightmap: 8-bit / 16-bit PNG
- Hypsometric Topographic Composite: Blue (water) -> Green (plains) -> Tan (mid) -> White (peaks)

## 4. Acceptance Status
**STATUS: READY FOR REVIEW / PASS**
