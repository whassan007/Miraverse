# Iraq (`IQ`) — GIS & Digital Elevation Model Report

- **Country Code:** `IQ`
- **Locations Reconstructed (3):** `baghdad` (Baghdad (Tigris Meander & Mesopotamian Alluvial Plain)), `erbil` (Erbil (Ancient Citadel Tell & Zagros Foothills)), `basra` (Basra (Shatt al-Arab Estuary & Date-Palm Canals))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32638`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `baghdad` | Baghdad (Tigris Meander & Mesopotamian Alluvial Plain) | `city` | `real_geography` | `[44.34, 33.29, 44.45, 33.39]` | 25.0 | 59.0 | 38.6 | 12.0 | 1.8x | Tigris River (Dijlah) Meander |
| `erbil` | Erbil (Ancient Citadel Tell & Zagros Foothills) | `region` | `real_geography` | `[43.95, 36.15, 44.12, 36.26]` | 370.0 | 595.0 | 445.4 | 14.0 | 1.4x | Seasonal Chai Streams & Upland Pediment |
| `basra` | Basra (Shatt al-Arab Estuary & Date-Palm Canals) | `region` | `real_geography` | `[47.76, 30.46, 47.87, 30.55]` | -22.0 | 31.0 | 3.3 | 12.0 | 2.0x | Shatt al-Arab Waterway & Ashar Creek |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `baghdad` | Tigris River Channel at Al-Mutanabbi | 33.3405 | 44.3890 | `[28, 38]` | **44.85 m** | `PASS` |
| `baghdad` | Rusafa East Bank Levee | 33.3430 | 44.3960 | `[34, 46]` | **44.48 m** | `PASS` |
| `baghdad` | Karkh West Bank Plain | 33.3320 | 44.3750 | `[32, 44]` | **38.48 m** | `PASS` |
| `erbil` | Erbil Citadel Mound (Qalat Hewler) | 36.1911 | 44.0092 | `[415, 445]` | **426.84 m** | `PASS` |
| `erbil` | Lower Erbil Plain | 36.1750 | 43.9800 | `[380, 415]` | **389.24 m** | `PASS` |
| `erbil` | Northeast Foothill Ridge (Pirmam Direction) | 36.2500 | 44.1000 | `[480, 780]` | **539.36 m** | `PASS` |
| `basra` | Shatt al-Arab Main Channel | 30.5150 | 47.8400 | `[-3, 5]` | **7.32 m** | `PASS` |
| `basra` | Ashar Canal Quarter | 30.5080 | 47.8150 | `[1, 9]` | **1.56 m** | `PASS` |
| `basra` | Sinbad Island / Estuary Bank | 30.5250 | 47.8380 | `[0, 7]` | **5.08 m** | `PASS` |

## Visual Verification Artifacts

- **`baghdad`**:
  - Hillshade: `reports/terrain/hillshades/baghdad_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/baghdad_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/baghdad_gis_overview.png`
- **`erbil`**:
  - Hillshade: `reports/terrain/hillshades/erbil_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/erbil_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/erbil_gis_overview.png`
- **`basra`**:
  - Hillshade: `reports/terrain/hillshades/basra_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/basra_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/basra_gis_overview.png`
