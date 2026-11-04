# Iraq (`IQ`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `IQ` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `baghdad` — Baghdad (Tigris Meander & Mesopotamian Alluvial Plain)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Tigris River (Dijlah) Meander (`alluvial_river`, direction `north_west_to_south_east`)
- **Biome Palette:** `mesopotamian_alluvial_plain`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `6.0` studs)

### `erbil` — Erbil (Ancient Citadel Tell & Zagros Foothills)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Seasonal Chai Streams & Upland Pediment (`upland_piedmont`, direction `north_east_to_south_west`)
- **Biome Palette:** `zagros_piedmont_steppe_tell`
- **Base Game Elevation (`baseGameY`):** `30.0` studs (max relief `6.0` studs)

### `basra` — Basra (Shatt al-Arab Estuary & Date-Palm Canals)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Shatt al-Arab Waterway & Ashar Creek (`estuary_canals`, direction `north_west_to_south_east`)
- **Biome Palette:** `estuarine_date_palm_wetland`
- **Base Game Elevation (`baseGameY`):** `8.0` studs (max relief `6.0` studs)

