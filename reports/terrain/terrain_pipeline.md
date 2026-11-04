# Reusable GIS-to-Roblox Topography Pipeline Architecture

```text
GIS Source Registry (Copernicus GLO-30 / Mapzen)
        │
        ▼
Tile Fetch & Cache (`content/dem_cache/`) with SHA-256 Checksums
        │
        ▼
Geographic Reprojection (WGS84 EPSG:4326 -> Metric Web Mercator EPSG:3857)
        │
        ▼
Sub-Tile Pixel Alignment & Regional Resampling (128x128 crop)
        │
        ▼
Analytical Hillshading (Azimuth 315°, Altitude 45°) & Heightmap Normalization
        │
        ▼
Lua Terrain Asset Compiler (`tools/terrain/compile_terrain_luau.py`)
        │
        ▼
Source-Controlled Runtime Module (`apps/roblox/src/shared/TerrainData.luau`)
        │
        ▼
Authoritative World Registry Integration (`apps/roblox/src/shared/WorldRegistry.luau`)
        │
        ▼
Roblox Terrain Voxel Engine (`apps/roblox/src/server/TerrainManager.luau`)
        │
        ▼
Studio Verification & Screenshot Evidence (`reports/terrain/studio-evidence/`)
```

### Key Technical Specifications
1. **Three-Level Terrain Architecture**:
   - Level 1: Country Overview (800x800 stud cell isolation per nation)
   - Level 2: Regional Terrain (Smooth DEM elevation variations across 512 studs)
   - Level 3: Playable Town / Plaza (Flat, walkable 48-stud radius with zero quest interference)
2. **Deterministic Voxel Generation**: Luau matrix compilation guarantees 100% reproducible terrain geometry across local and production builds.
3. **No Unapproved Third-Party Assets**: All terrain is native Roblox smooth terrain voxels generated from source-controlled mathematical arrays.
