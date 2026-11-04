# Lebanon (`LB`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `LB` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `byblos` — Byblos (Jbeil)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Mediterranean Sea (Eastern Levantine Basin) (`coastal_sea`, direction `west_north`)
- **Biome Palette:** `mediterranean_coast`
- **Base Game Elevation (`baseGameY`):** `10.0` studs (max relief `31.95` studs)

### `mount_lebanon` — Mount Lebanon (Jabal Lubnan / Al-Jall & Cedar Ridge)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Afqa Spring & Nahr Ibrahim (Adonis River Gorge) (`mountain_spring_gorge`, direction `east_to_west`)
- **Biome Palette:** `levantine_highland_cedar`
- **Base Game Elevation (`baseGameY`):** `38.0` studs (max relief `21.76` studs)

### `beirut` — Beirut (Ras Beirut Headland & Corniche)
- **Detail Level:** Level 3 (`city`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Mediterranean Sea (Ras Beirut / Raouche Sea Cliffs & St. George Bay) (`coastal_headland`, direction `west_north`)
- **Biome Palette:** `mediterranean_promontory`
- **Base Game Elevation (`baseGameY`):** `14.0` studs (max relief `6.0` studs)

