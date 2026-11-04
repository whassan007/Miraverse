# Germany (`DE`) — GIS & Digital Elevation Model Report

- **Country Code:** `DE`
- **Locations Reconstructed (1):** `rhine_valley` (Upper Middle Rhine Gorge (Sankt Goarshausen & Lorelei Bend))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32632`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `rhine_valley` | Upper Middle Rhine Gorge (Sankt Goarshausen & Lorelei Bend) | `region` | `literary_inspired_real_geography` | `[7.68, 50.11, 7.78, 50.175]` | 66.8 | 426.0 | 242.9 | 12.0 | 1.45x | Rhine River (Mittelrhein) Gorge Bend at Lorelei |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `rhine_valley` | Rhine River Channel at Lorelei Narrow | 50.1400 | 7.7240 | `[64, 82]` | **68.58 m** | `PASS` |
| `rhine_valley` | Lorelei Slate Cliff Plateau | 50.1415 | 7.7345 | `[150, 260]` | **193.48 m** | `PASS` |
| `rhine_valley` | Rhenish Massif Gorge Rim | 50.1500 | 7.7550 | `[220, 320]` | **282.16 m** | `PASS` |

## Visual Verification Artifacts

- **`rhine_valley`**:
  - Hillshade: `reports/terrain/hillshades/rhine_valley_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/rhine_valley_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/rhine_valley_gis_overview.png`
