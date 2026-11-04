# Lebanon (`LB`) — GIS & Digital Elevation Model Report

- **Country Code:** `LB`
- **Locations Reconstructed (3):** `byblos` (Byblos (Jbeil)), `mount_lebanon` (Mount Lebanon (Jabal Lubnan / Al-Jall & Cedar Ridge)), `beirut` (Beirut (Ras Beirut Headland & Corniche))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32636`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `byblos` | Byblos (Jbeil) | `city` | `real_geography` | `[35.63, 34.105, 35.685, 34.142]` | -5.0 | 526.0 | 140.8 | 4.0 | 1.35x | Mediterranean Sea (Eastern Levantine Basin) |
| `mount_lebanon` | Mount Lebanon (Jabal Lubnan / Al-Jall & Cedar Ridge) | `region` | `real_geography` | `[35.78, 34.06, 35.94, 34.17]` | 432.0 | 2173.0 | 1482.8 | 18.0 | 1.25x | Afqa Spring & Nahr Ibrahim (Adonis River Gorge) |
| `beirut` | Beirut (Ras Beirut Headland & Corniche) | `city` | `real_geography` | `[35.465, 33.878, 35.535, 33.912]` | -12.0 | 124.0 | 33.3 | 8.0 | 1.4x | Mediterranean Sea (Ras Beirut / Raouche Sea Cliffs & St. George Bay) |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `byblos` | Byblos Ancient Harbor | 34.1236 | 35.6445 | `[-2, 15]` | **23.76 m** | `PASS` |
| `byblos` | Byblos Citadel Mound | 34.1219 | 35.6468 | `[15, 45]` | **29.72 m** | `PASS` |
| `byblos` | Foothills East of Jbeil | 34.1240 | 35.6750 | `[120, 480]` | **287.40 m** | `PASS` |
| `mount_lebanon` | Afqa Grotto & Nahr Ibrahim Headwaters | 34.0683 | 35.8911 | `[1100, 1550]` | **1147.88 m** | `PASS` |
| `mount_lebanon` | Mount Lebanon Cedar Plateau | 34.1450 | 35.9100 | `[1700, 2500]` | **2008.84 m** | `PASS` |
| `mount_lebanon` | Middle Limestone Agricultural Terraces (Al-Jall) | 34.1100 | 35.8100 | `[850, 1450]` | **1466.00 m** | `PASS` |
| `beirut` | Raouche / Pigeon Rocks Coast | 33.8897 | 35.4701 | `[-5, 35]` | **6.86 m** | `PASS` |
| `beirut` | Achrafieh / Ras Beirut Hill | 33.8886 | 35.5150 | `[40, 105]` | **82.88 m** | `PASS` |
| `beirut` | Beirut Port Waterfront | 33.9015 | 35.5180 | `[-2, 20]` | **1.76 m** | `PASS` |

## Visual Verification Artifacts

- **`byblos`**:
  - Hillshade: `reports/terrain/hillshades/byblos_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/byblos_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/byblos_gis_overview.png`
- **`mount_lebanon`**:
  - Hillshade: `reports/terrain/hillshades/mount_lebanon_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/mount_lebanon_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/mount_lebanon_gis_overview.png`
- **`beirut`**:
  - Hillshade: `reports/terrain/hillshades/beirut_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/beirut_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/beirut_gis_overview.png`
