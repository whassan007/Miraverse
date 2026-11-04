# France (`FR`) — GIS & Digital Elevation Model Report

- **Country Code:** `FR`
- **Locations Reconstructed (3):** `lyon` (Lyon (Rhône–Saône Confluence, Fourvière & Croix-Rousse)), `paris` (Paris (Seine River Meander, Île de la Cité & Montmartre Butte)), `marseille` (Marseille (Vieux-Port, Notre-Dame de la Garde & Calanques Limestone Coast))
- **Primary Elevation Sources:** Copernicus DEM GLO-30 (`COP-DEM_GLO-30`) & Mapzen Terrain Tiles (`Terrarium-v1`)
- **Target Metric CRS:** `EPSG:4326 -> EPSG:32631`
- **Vertical Datum:** `EGM2008 / WGS84 Orthometric Geoid`

## Location Topographic Summary

| Location ID | Display Name | Type | Setting Class | BBox (WGS84) | Elev Min (m) | Elev Max (m) | Mean (m) | Scale (m/stud) | Exaggeration | Water Feature |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| `lyon` | Lyon (Rhône–Saône Confluence, Fourvière & Croix-Rousse) | `city` | `real_geography` | `[4.795, 45.725, 4.865, 45.785]` | 153.4 | 317.3 | 199.6 | 10.0 | 1.5x | Rhône and Saône River Confluence (Presqu'île) |
| `paris` | Paris (Seine River Meander, Île de la Cité & Montmartre Butte) | `region` | `real_geography` | `[2.29, 48.83, 2.4, 48.895]` | 22.7 | 132.2 | 53.8 | 12.0 | 1.65x | Seine River & Île de la Cité |
| `marseille` | Marseille (Vieux-Port, Notre-Dame de la Garde & Calanques Limestone Coast) | `region` | `real_geography` | `[5.33, 43.26, 5.42, 43.32]` | -2.2 | 145.6 | 26.6 | 12.0 | 1.45x | Mediterranean Sea (Gulf of Lion & Vieux-Port Inlet) |

## Verified Geographic Control Points

| Location | Control Point | Lat | Lon | Expected Range (m) | Measured DEM (m) | Status |
|---|---|---:|---:|---|---:|---|
| `lyon` | Presqu'île & Rhône–Saône Confluence | 45.7330 | 4.8180 | `[158, 175]` | **167.85 m** | `PASS` |
| `lyon` | Fourvière Western Hill above Vieux Lyon | 45.7622 | 4.8225 | `[230, 310]` | **294.41 m** | `PASS` |
| `lyon` | La Croix-Rousse Northern Silk Hill | 45.7750 | 4.8320 | `[210, 260]` | **253.96 m** | `PASS` |
| `paris` | Seine River & Île de la Cité | 48.8550 | 2.3480 | `[26, 42]` | **44.22 m** | `PASS` |
| `paris` | Butte Montmartre Gypsum Hill (No Alpine Peaks!) | 48.8867 | 2.3431 | `[95, 135]` | **128.25 m** | `PASS` |
| `paris` | Montagne Sainte-Geneviève Left Bank | 48.8462 | 2.3464 | `[48, 68]` | **66.46 m** | `PASS` |
| `marseille` | Vieux-Port Harbor Inlet | 43.2951 | 5.3740 | `[-4, 15]` | **4.05 m** | `PASS` |
| `marseille` | Notre-Dame de la Garde Limestone Hill | 43.2841 | 5.3713 | `[95, 162]` | **134.91 m** | `PASS` |
| `marseille` | Eastern Marseille Hills | 43.2900 | 5.4100 | `[35, 145]` | **43.84 m** | `PASS` |

## Visual Verification Artifacts

- **`lyon`**:
  - Hillshade: `reports/terrain/hillshades/lyon_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/lyon_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/lyon_gis_overview.png`
- **`paris`**:
  - Hillshade: `reports/terrain/hillshades/paris_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/paris_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/paris_gis_overview.png`
- **`marseille`**:
  - Hillshade: `reports/terrain/hillshades/marseille_hillshade.png`
  - Heightmap: `reports/terrain/heightmaps/marseille_heightmap.png`
  - 4-Panel GIS Comparison Overview: `reports/terrain/screenshots/marseille_gis_overview.png`
