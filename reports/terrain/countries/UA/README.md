# Ukraine (`UA`) — Roblox Terrain & World Reconstruction

## 1. Geographic Identity & Three-Layer Separation

The `UA` world reconstruction strictly separates:
1. **Geographic Accuracy Layer:** Real Copernicus GLO-30 / Mapzen DEM elevation grids projected into metric UTM coordinates, preserving real mountain silhouettes, river valleys, coastlines, and basins.
2. **Gameplay Adaptation Layer:** Controlled central arrival terrace flattening (`clearRadiusStuds` / smooth deformation masks) so spawns, mentors, challenge stations, and travel portals remain 100% walkable and collision-safe.
3. **Artistic Presentation Layer:** Biome-authentic Roblox terrain materials (`Limestone`, `Sandstone`, `Slate`, `Rock`, `Grass`, `LeafyGrass`, `Sand`, `Water`), regional flora, and cultural landmark architecture.

## 2. Reconstructed Locations

### `kyiv_hills` — Kyiv Hills & Dnipro River Escarpment (Starokyivska, Shchekavytsia & Podil)
- **Detail Level:** Level 2 (`region`)
- **Geographic Classification:** `real_geography`
- **Hydrology:** Dnipro River & Trukhaniv Island Channel (`bluff_river_floodplain`, direction `north_to_south`)
- **Biome Palette:** `eastern_european_river_bluffs`
- **Base Game Elevation (`baseGameY`):** `18.0` studs (max relief `6.0` studs)
- **Literary / Folklore Provenance Notice:** Real Kyiv right-bank loess hills overlooking Podil and the Dnipro floodplain; Kyi, Shchek, Khoryv and Lybid are labeled as Primary Chronicle founding legends.

