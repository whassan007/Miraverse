# Russia (`RU`) — GIS & Digital Elevation Model Report

- **Country Code:** `RU`
- **Locations Reconstructed (1):** `lake_svetloyar` (Lake Svetloyar (Nizhny Novgorod Oblast Forest Basin))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32638`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `lake_svetloyar` | Lake Svetloyar (Nizhny Novgorod Oblast Forest Basin) | `region` | `literary_inspired_real_geography` | `[45.05, 56.795, 45.135, 56.845]` | 101.0 | 147.0 | 120.3 | 10.0 | 1.8x | Lake Svetloyar Oval Basin & Lyunda Tributary |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `lake_svetloyar` | Lake Svetloyar Basin Center | 56.8192 | 45.0919 | `[104, 114]` | **108.04 m** | `PASS` |
| `lake_svetloyar` | Svetloyar Southern Forested RimHills | 56.8145 | 45.0930 | `[118, 142]` | **117.12 m** | `PASS` |
| `lake_svetloyar` | Vladimirskoye Village Terrace | 56.8270 | 45.0800 | `[112, 136]` | **126.68 m** | `PASS` |

## Visual Verification Artifacts

- **`lake_svetloyar`**:
  - Hillshade: `reports/terrain/hillshades/lake_svetloyar_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/lake_svetloyar_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/lake_svetloyar_gis_overview.png`
