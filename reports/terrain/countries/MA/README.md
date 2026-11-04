# Morocco (`MA`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `MA` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `marrakesh_atlas` — Marrakesh Haouz Plain & High Atlas Foothills
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Oued Tensift / Ourika Piedmont & Khettara Oasis Channels (`piedmont_wadi_oasis`, direction `south_to_north`)
- **Biome Palette:** `haouz_plain_high_atlas_piedmont`
- **Base Game Elevation (`baseGameY`):** `16.0` studs (max relief `16.88` studs)

