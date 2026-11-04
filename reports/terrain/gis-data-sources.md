# Verified Geographic Data Sources & Provenance Manifest

## 1. Primary & Secondary Elevation Datasets

| Dataset | Identifier | Resolution | Vertical Datum | License | Access Mechanism |
|---|---|---|---|---|---|
| **Copernicus DEM GLO-30** | `COP-DEM_GLO-30-DGED / 2023.1` | ~30 m (1 arc-second) | EGM2008 Geoid | Copernicus DEM License (Free, Full & Open) | AWS Registry of Open Data (`s3://copernicus-dem-30m/`) |
| **Mapzen Terrain Tiles** | `Terrarium-v1 (SRTM + GMTED2010 + ETOPO1)` | ~20m–120m (Zoom 10–12) | WGS84 / EGM2008 | ODC-By / Public Domain USG (SRTM/USGS) | AWS Open Data (`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/`) |
| **OpenStreetMap Coastlines & Hydrography** | `OSM-ODbL-2026` | Vector reference | WGS84 (`EPSG:4326`) | ODbL 1.0 | Verified coastline, river meander, and landmark control points |
| **HydroSHEDS (HydroRIVERS / HydroLAKES)** | `HydroSHEDS-v1.1` | 15 arc-second | WGS84 | Free for scientific/educational/commercial use with attribution | River flow direction & lake basin validation |

## 2. Complete 21-Location Dataset & Checksum Registry

| Source ID | Country | Location | CRS Transformation | BBox (`minLon, minLat, maxLon, maxLat`) | Elev Min..Max (m) | Tile / DEM SHA-256 Checksum |
|---|---|---|---|---|---|---|
| `DEM-LB-BYBLOS` | `LB` | `byblos` | `EPSG:4326 -> EPSG:32636` | `[35.63, 34.105, 35.685, 34.142]` | `-5.0m .. 526.0m` | `638b046038276a45...` |
| `DEM-LB-MOUNT_LEBANON` | `LB` | `mount_lebanon` | `EPSG:4326 -> EPSG:32636` | `[35.78, 34.06, 35.94, 34.17]` | `432.0m .. 2173.0m` | `d4ccc41c364a10e2...` |
| `DEM-LB-BEIRUT` | `LB` | `beirut` | `EPSG:4326 -> EPSG:32636` | `[35.465, 33.878, 35.535, 33.912]` | `-12.0m .. 124.0m` | `b1b01cdaa9f8d53e...` |
| `DEM-EG-CAIRO` | `EG` | `cairo` | `EPSG:4326 -> EPSG:32636` | `[31.18, 30.0, 31.3, 30.09]` | `4.0m .. 216.0m` | `033f6a247f3fa0ed...` |
| `DEM-EG-ALEXANDRIA` | `EG` | `alexandria` | `EPSG:4326 -> EPSG:32635` | `[29.86, 31.16, 29.97, 31.23]` | `-78.0m .. 57.0m` | `382d47c5f8c34cad...` |
| `DEM-EG-ASWAN` | `EG` | `aswan` | `EPSG:4326 -> EPSG:32636` | `[32.85, 24.04, 32.94, 24.13]` | `-386.0m .. 237.0m` | `e635055519cf8dd6...` |
| `DEM-IQ-BAGHDAD` | `IQ` | `baghdad` | `EPSG:4326 -> EPSG:32638` | `[44.34, 33.29, 44.45, 33.39]` | `25.0m .. 59.0m` | `2830d16bf9b31ed7...` |
| `DEM-IQ-ERBIL` | `IQ` | `erbil` | `EPSG:4326 -> EPSG:32638` | `[43.95, 36.15, 44.12, 36.26]` | `370.0m .. 595.0m` | `c9965457be0bda95...` |
| `DEM-IQ-BASRA` | `IQ` | `basra` | `EPSG:4326 -> EPSG:32638` | `[47.76, 30.46, 47.87, 30.55]` | `-22.0m .. 31.0m` | `da420590583128d8...` |
| `DEM-KR-JEONJU` | `KR` | `jeonju` | `EPSG:4326 -> EPSG:32652` | `[127.12, 35.79, 127.19, 35.84]` | `22.0m .. 307.0m` | `08685e5a497704ea...` |
| `DEM-KR-SEOUL` | `KR` | `seoul` | `EPSG:4326 -> EPSG:32652` | `[126.92, 37.51, 127.03, 37.61]` | `-9.0m .. 330.0m` | `0db79e38035f3770...` |
| `DEM-KR-BUSAN` | `KR` | `busan` | `EPSG:4326 -> EPSG:32652` | `[128.99, 35.06, 129.09, 35.14]` | `-93.0m .. 511.6m` | `511aca75d0bd8b53...` |
| `DEM-FR-LYON` | `FR` | `lyon` | `EPSG:4326 -> EPSG:32631` | `[4.795, 45.725, 4.865, 45.785]` | `153.4m .. 317.3m` | `9eecce25c51b84c4...` |
| `DEM-FR-PARIS` | `FR` | `paris` | `EPSG:4326 -> EPSG:32631` | `[2.29, 48.83, 2.4, 48.895]` | `22.7m .. 132.2m` | `56780bed2487ff22...` |
| `DEM-FR-MARSEILLE` | `FR` | `marseille` | `EPSG:4326 -> EPSG:32631` | `[5.33, 43.26, 5.42, 43.32]` | `-2.2m .. 145.6m` | `eb7ccb93cf17b454...` |
| `DEM-DE-RHINE_VALLEY` | `DE` | `rhine_valley` | `EPSG:4326 -> EPSG:32632` | `[7.68, 50.11, 7.78, 50.175]` | `66.8m .. 426.0m` | `0452cc1d7acafe99...` |
| `DEM-CN-WULING_VALLEY` | `CN` | `wuling_valley` | `EPSG:4326 -> EPSG:32649` | `[111.4, 28.735, 111.51, 28.82]` | `30.3m .. 195.0m` | `0c8451be4d2021aa...` |
| `DEM-JP-TOHOKU_WAYSTATION` | `JP` | `tohoku_waystation` | `EPSG:4326 -> EPSG:32654` | `[140.39, 38.28, 140.485, 38.35]` | `116.0m .. 980.0m` | `3d50660383bd4573...` |
| `DEM-RU-LAKE_SVETLOYAR` | `RU` | `lake_svetloyar` | `EPSG:4326 -> EPSG:32638` | `[45.05, 56.795, 45.135, 56.845]` | `101.0m .. 147.0m` | `157314061356a7f3...` |
| `DEM-UA-KYIV_HILLS` | `UA` | `kyiv_hills` | `EPSG:4326 -> EPSG:32636` | `[30.48, 50.43, 30.575, 50.485]` | `88.0m .. 211.0m` | `ba206f040d56a509...` |
| `DEM-MA-MARRAKESH_ATLAS` | `MA` | `marrakesh_atlas` | `EPSG:4326 -> EPSG:32629` | `[-8.06, 31.26, -7.78, 31.66]` | `416.0m .. 2177.0m` | `d8c969ee69020535...` |
