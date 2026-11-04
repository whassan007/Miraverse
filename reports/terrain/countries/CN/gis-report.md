# China (`CN`) — GIS & Digital Elevation Model Report

- **Country Code:** `CN`
- **Locations Reconstructed (1):** `wuling_valley` (Wuling / Taoyuan Karst Valley (Peach Blossom Spring Inspiration))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32649`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `wuling_valley` | Wuling / Taoyuan Karst Valley (Peach Blossom Spring Inspiration) | `region` | `literary_inspired_real_geography` | `[111.4, 28.735, 111.51, 28.82]` | 30.3 | 195.0 | 76.5 | 14.0 | 1.4x | Yuan River Tributary & Taohua Stream |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `wuling_valley` | Yuan / Taohua Stream Basin | 28.7500 | 111.4450 | `[40, 75]` | **55.80 m** | `PASS` |
| `wuling_valley` | Taohuayuan Wooded Ridge | 28.7850 | 111.4600 | `[95, 185]` | **115.12 m** | `PASS` |
| `wuling_valley` | Wuling Foothill Pass | 28.7650 | 111.4200 | `[50, 125]` | **65.08 m** | `PASS` |

## Visual Verification Artifacts

- **`wuling_valley`**:
  - Hillshade: `reports/terrain/hillshades/wuling_valley_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/wuling_valley_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/wuling_valley_gis_overview.png`
