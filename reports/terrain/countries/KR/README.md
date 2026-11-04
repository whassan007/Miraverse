# South Korea (`KR`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `KR` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `jeonju` — Jeonju (Hanok Village Basin, Jeonjucheon & Seungamsan)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Jeonjucheon Stream (`inland_valley_stream`, direction `south_east_to_north_west`)
- **Biome Palette:** `korean_inland_mountain_basin`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `6.61` studs)

### `seoul` — Seoul (Hangang River Basin, Namsan & Bugaksan Peaks)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Han River (Hangang) & Cheonggyecheon Basin (`major_river_mountain_basin`, direction `east_to_west`)
- **Biome Palette:** `granite_peaks_river_valley`
- **Base Game Elevation (`baseGameY`):** `22.0` studs (max relief `6.0` studs)

### `busan` — Busan (Korea Strait Harbor, Yeongdo & Coastal Hills)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Busan Harbor & Korea Strait (`mountainous_harbor_coast`, direction `south_east`)
- **Biome Palette:** `east_asian_coastal_harbor_hills`
- **Base Game Elevation (`baseGameY`):** `12.0` studs (max relief `8.55` studs)

