# Morocco (`MA`) — GIS & Digital Elevation Model Report

- **Country Code:** `MA`
- **Locations Reconstructed (1):** `marrakesh_atlas` (Marrakesh Haouz Plain & High Atlas Foothills)
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32629`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `marrakesh_atlas` | Marrakesh Haouz Plain & High Atlas Foothills | `region` | `real_geography` | `[-8.06, 31.26, -7.78, 31.66]` | 416.0 | 2177.0 | 767.1 | 25.0 | 1.35x | Oued Tensift / Ourika Piedmont & Khettara Oasis Channels |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `marrakesh_atlas` | Marrakesh Medina / Jemaa el-Fnaa Plain | 31.6258 | -7.9891 | `[440, 485]` | **469.12 m** | `PASS` |
| `marrakesh_atlas` | Ourika / High Atlas Foothill Transition | 31.4000 | -7.8600 | `[700, 1250]` | **767.16 m** | `PASS` |
| `marrakesh_atlas` | Southern High Atlas Slopes (Oukaimeden Approach) | 31.2850 | -7.8400 | `[1350, 2450]` | **1350.24 m** | `PASS` |

## Visual Verification Artifacts

- **`marrakesh_atlas`**:
  - Hillshade: `reports/terrain/hillshades/marrakesh_atlas_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/marrakesh_atlas_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/marrakesh_atlas_gis_overview.png`
