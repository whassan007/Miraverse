# Egypt (`EG`) — GIS & Digital Elevation Model Report

- **Country Code:** `EG`
- **Locations Reconstructed (3):** `cairo` (Cairo (Nile Valley & Muqattam Escarpment)), `alexandria` (Alexandria (Eastern Harbor & Mediterranean Corniche)), `aswan` (Aswan (First Cataract Granite Islands & Nubian Nile))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32636`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `cairo` | Cairo (Nile Valley & Muqattam Escarpment) | `city` | `real_geography` | `[31.18, 30.0, 31.3, 30.09]` | 4.0 | 216.0 | 43.9 | 12.0 | 1.5x | Nile River & Gezira Island Channel |
| `alexandria` | Alexandria (Eastern Harbor & Mediterranean Corniche) | `region` | `real_geography` | `[29.86, 31.16, 29.97, 31.23]` | -78.0 | 57.0 | 2.4 | 12.0 | 1.6x | Mediterranean Sea (Eastern Harbor / Qaitbay Spit & Lake Mariout) |
| `aswan` | Aswan (First Cataract Granite Islands & Nubian Nile) | `region` | `real_geography` | `[32.85, 24.04, 32.94, 24.13]` | -386.0 | 237.0 | 135.5 | 12.0 | 1.45x | Nile River First Cataract & Elephantine Island |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `cairo` | Nile Corniche & Gezira | 30.0450 | 31.2240 | `[15, 28]` | **25.48 m** | `PASS` |
| `cairo` | Historic Islamic Cairo (Al-Muizz) | 30.0500 | 31.2610 | `[25, 60]` | **28.64 m** | `PASS` |
| `cairo` | Muqattam Hills Escarpment | 30.0250 | 31.2850 | `[110, 215]` | **181.44 m** | `PASS` |
| `alexandria` | Qaitbay / Pharos Headland | 31.2140 | 29.8856 | `[-3, 14]` | **1.52 m** | `PASS` |
| `alexandria` | Kom el-Dikka / Central Ridge | 31.1950 | 29.9050 | `[8, 32]` | **15.84 m** | `PASS` |
| `alexandria` | Lake Mariout Depression South | 31.1650 | 29.9100 | `[-6, 8]` | **-5.00 m** | `PASS` |
| `aswan` | Elephantine Island Nile Channel | 24.0850 | 32.8860 | `[85, 115]` | **97.52 m** | `PASS` |
| `aswan` | Qubbet el-Hawa Western Escarpment | 24.1020 | 32.8820 | `[130, 195]` | **132.80 m** | `PASS` |
| `aswan` | Eastern Granite Plateau | 24.0750 | 32.9150 | `[115, 175]` | **108.48 m** | `PASS` |

## Visual Verification Artifacts

- **`cairo`**:
  - Hillshade: `reports/terrain/hillshades/cairo_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/cairo_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/cairo_gis_overview.png`
- **`alexandria`**:
  - Hillshade: `reports/terrain/hillshades/alexandria_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/alexandria_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/alexandria_gis_overview.png`
- **`aswan`**:
  - Hillshade: `reports/terrain/hillshades/aswan_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/aswan_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/aswan_gis_overview.png`
