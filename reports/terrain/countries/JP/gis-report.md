# Japan (`JP`) — GIS & Digital Elevation Model Report

- **Country Code:** `JP`
- **Locations Reconstructed (1):** `tohoku_waystation` (Tohoku / Yamadera–Matsushima Waystation (Bashō Journey Reference))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32654`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `tohoku_waystation` | Tohoku / Yamadera–Matsushima Waystation (Bashō Journey Reference) | `region` | `literary_inspired_real_geography` | `[140.39, 38.28, 140.485, 38.35]` | 116.0 | 980.0 | 422.4 | 14.0 | 1.35x | Tachiya River Mountain Crossing |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `tohoku_waystation` | Tachiya River Valley Crossing | 38.3110 | 140.4340 | `[160, 240]` | **236.32 m** | `PASS` |
| `tohoku_waystation` | Yamadera (Risshaku-ji) Tuff Cliff Slope | 38.3160 | 140.4385 | `[260, 480]` | **422.48 m** | `PASS` |
| `tohoku_waystation` | Eastern Ou Mountain Ridge | 38.3250 | 140.4750 | `[400, 880]` | **466.16 m** | `PASS` |

## Visual Verification Artifacts

- **`tohoku_waystation`**:
  - Hillshade: `reports/terrain/hillshades/tohoku_waystation_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/tohoku_waystation_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/tohoku_waystation_gis_overview.png`
