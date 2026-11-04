# Ukraine (`UA`) — GIS & Digital Elevation Model Report

- **Country Code:** `UA`
- **Locations Reconstructed (1):** `kyiv_hills` (Kyiv Hills & Dnipro River Escarpment (Starokyivska, Shchekavytsia & Podil))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32636`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `kyiv_hills` | Kyiv Hills & Dnipro River Escarpment (Starokyivska, Shchekavytsia & Podil) | `region` | `real_geography` | `[30.48, 50.43, 30.575, 50.485]` | 88.0 | 211.0 | 127.1 | 12.0 | 1.55x | Dnipro River & Trukhaniv Island Channel |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `kyiv_hills` | Dnipro River & Trukhaniv Channel | 50.4600 | 30.5380 | `[88, 102]` | **97.28 m** | `PASS` |
| `kyiv_hills` | Starokyivska & Volodymyrska Right-Bank Hills | 50.4565 | 30.5200 | `[155, 198]` | **187.96 m** | `PASS` |
| `kyiv_hills` | Podil River Terrace | 50.4650 | 30.5180 | `[95, 118]` | **104.16 m** | `PASS` |

## Visual Verification Artifacts

- **`kyiv_hills`**:
  - Hillshade: `reports/terrain/hillshades/kyiv_hills_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/kyiv_hills_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/kyiv_hills_gis_overview.png`
