# South Korea (`KR`) — GIS & Digital Elevation Model Report

- **Country Code:** `KR`
- **Locations Reconstructed (3):** `jeonju` (Jeonju (Hanok Village Basin, Jeonjucheon & Seungamsan)), `seoul` (Seoul (Hangang River Basin, Namsan & Bugaksan Peaks)), `busan` (Busan (Korea Strait Harbor, Yeongdo & Coastal Hills))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32652`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `jeonju` | Jeonju (Hanok Village Basin, Jeonjucheon & Seungamsan) | `city` | `real_geography` | `[127.12, 35.79, 127.19, 35.84]` | 22.0 | 307.0 | 86.8 | 10.0 | 1.35x | Jeonjucheon Stream |
| `seoul` | Seoul (Hangang River Basin, Namsan & Bugaksan Peaks) | `region` | `real_geography` | `[126.92, 37.51, 127.03, 37.61]` | -9.0 | 330.0 | 60.3 | 16.0 | 1.35x | Han River (Hangang) & Cheonggyecheon Basin |
| `busan` | Busan (Korea Strait Harbor, Yeongdo & Coastal Hills) | `region` | `real_geography` | `[128.99, 35.06, 129.09, 35.14]` | -93.0 | 511.6 | 73.8 | 14.0 | 1.3x | Busan Harbor & Korea Strait |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `jeonju` | Jeonju Hanok Village Courtyard Basin | 35.8147 | 127.1526 | `[35, 65]` | **47.20 m** | `PASS` |
| `jeonju` | Omokdae & Seungamsan Eastern Ridge | 35.8130 | 127.1750 | `[150, 320]` | **228.32 m** | `PASS` |
| `jeonju` | Jeonjucheon Stream Corridor | 35.8110 | 127.1480 | `[28, 48]` | **43.64 m** | `PASS` |
| `seoul` | Bugaksan Northern Granite Peak | 37.5950 | 126.9800 | `[170, 350]` | **188.20 m** | `PASS` |
| `seoul` | Namsan Central Mountain | 37.5512 | 126.9882 | `[150, 270]` | **241.44 m** | `PASS` |
| `seoul` | Hangang River Channel | 37.5250 | 126.9650 | `[5, 25]` | **17.84 m** | `PASS` |
| `busan` | Busan North Port & Jagalchi | 35.0965 | 129.0305 | `[-5, 18]` | **6.20 m** | `PASS` |
| `busan` | Gubongsan / Gamcheon Terraced Hills | 35.1050 | 129.0100 | `[120, 410]` | **136.40 m** | `PASS` |
| `busan` | Yeongdo Bongnaesan Island Peak | 35.0820 | 129.0620 | `[100, 395]` | **189.04 m** | `PASS` |

## Visual Verification Artifacts

- **`jeonju`**:
  - Hillshade: `reports/terrain/hillshades/jeonju_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/jeonju_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/jeonju_gis_overview.png`
- **`seoul`**:
  - Hillshade: `reports/terrain/hillshades/seoul_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/seoul_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/seoul_gis_overview.png`
- **`busan`**:
  - Hillshade: `reports/terrain/hillshades/busan_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/busan_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/busan_gis_overview.png`
