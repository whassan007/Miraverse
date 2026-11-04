# Egypt (`EG`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `EG` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `cairo` — Cairo (Nile Valley & Muqattam Escarpment)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Nile River & Gezira Island Channel (`major_river`, direction `south_to_north`)
- **Biome Palette:** `nile_floodplain_limestone_escarpment`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `6.0` studs)

### `alexandria` — Alexandria (Eastern Harbor & Mediterranean Corniche)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Mediterranean Sea (Eastern Harbor / Qaitbay Spit & Lake Mariout) (`coastal_bay`, direction `north`)
- **Biome Palette:** `mediterranean_coastal_ridge`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `6.0` studs)

### `aswan` — Aswan (First Cataract Granite Islands & Nubian Nile)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Nile River First Cataract & Elephantine Island (`cataract_river`, direction `south_to_north`)
- **Biome Palette:** `nubian_sandstone_granite_nile`
- **Base Game Elevation (`baseGameY`):** `18.0` studs (max relief `6.0` studs)

