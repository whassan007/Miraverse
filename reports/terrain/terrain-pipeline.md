# Reusable GIS-to-Roblox Topographic Pipeline Architecture

## 1. Pipeline Stages
1. **Source Selection & Caching (`tools/terrain/gis_pipeline.py` & `tools/geo/pipeline.py`):**
   - Fetches Copernicus GLO-30 COG windows (`s3://copernicus-dem-30m/`) and Mapzen Terrarium elevation tiles (`s3://elevation-tiles-prod/terrarium/`).
   - Verifies SHA-256 checksums and caches all raw tiles locally in `content/terrain/cache/` and `data/geography/cache/`.
2. **Metric Coordinate Reprojection (`tools/geo/transform/reproject.py`):**
   - Transforms WGS84 (`EPSG:4326`) bounding boxes and control points into each destination's regional UTM zone (`EPSG:32629` through `EPSG:32654`) via `pyproj`.
3. **Elevation & Slope Material Classification:**
   - Computes metric X/Y gradients, slope angles (degrees), and hillshade rasters.
   - Classifies cells into Roblox `Enum.Material` values (`Water`, `Sand`, `Sandstone`, `Limestone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`) based on elevation above local sea/river datum, slope steepness, and regional biome.
4. **Roblox Code Generation (`tools/terrain/generate_luau_terrain.py`):**
   - Emits `apps/roblox/src/shared/TerrainData.luau` and `apps/roblox/src/shared/GeoTerrainData/<CC>.luau`.
   - Consumed at runtime by `TerrainPipeline.luau`, `GeoTerrainBuilder.luau`, `RegionalTerrainBuilder.luau`, `ByblosWorld.luau`, `MountLebanonWorld.luau`, and `BeirutWorld.luau`.

## 2. Three Geographic Detail Levels
- **Level 1 (Country Overview):** Regional bounding boxes and national topographic context in `data/geography/processed/<locationId>.json` (`regionalOverview32`).
- **Level 2 (Regional Terrain):** 16 secondary/global destinations (`mount_lebanon`, `alexandria`, `aswan`, `erbil`, `basra`, `seoul`, `busan`, `paris`, `marseille`, `rhine_valley`, `wuling_valley`, `tohoku_route`, `lake_svetloyar`, `kyiv_hills`, `marrakesh`).
- **Level 3 (Playable Town/City):** 6 high-detail urban/harbor destinations (`byblos`, `beirut`, `cairo`, `baghdad`, `jeonju`, `lyon`).
