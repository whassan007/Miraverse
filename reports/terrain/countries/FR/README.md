# France (`FR`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `FR` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `lyon` — Lyon (Rhône–Saône Confluence, Fourvière & Croix-Rousse)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Rhône and Saône River Confluence (Presqu'île) (`river_confluence`, direction `north_to_south`)
- **Biome Palette:** `rhone_saone_confluence_hills`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `6.0` studs)

### `paris` — Paris (Seine River Meander, Île de la Cité & Montmartre Butte)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Seine River & Île de la Cité (`lowland_basin_river`, direction `east_to_west`)
- **Biome Palette:** `paris_sedimentary_basin`
- **Base Game Elevation (`baseGameY`):** `14.0` studs (max relief `6.0` studs)

### `marseille` — Marseille (Vieux-Port, Notre-Dame de la Garde & Calanques Limestone Coast)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Mediterranean Sea (Gulf of Lion & Vieux-Port Inlet) (`limestone_calanque_coast`, direction `west`)
- **Biome Palette:** `provencal_limestone_coast`
- **Base Game Elevation (`baseGameY`):** `12.0` studs (max relief `6.0` studs)

