# Miraverse Real-World Geographic Sources Manifest

| Source ID | Dataset | Provider / Source URL | License | CRS | Vertical Datum | Horizontal Resolution | Checksum Method |
|---|---|---|---|---|---|---|---|
| SRC-GLO-30 | Copernicus DEM GLO-30 | European Space Agency (ESA) / AWS Terrain Tiles | Copernicus Open Access / ODbL | WGS84 (EPSG:4326) | EGM96 Geoid | 30 meters | SHA-256 |
| SRC-MAPZEN | Mapzen Global Elevation | Mapzen / Nextzen AWS S3 (`elevation-tiles-prod`) | Open Database License (ODbL) | Web Mercator (EPSG:3857) | Metric ellipsoidal / orthometric | ~30m (zoom 11-12) | SHA-256 |
| SRC-OSM | OpenStreetMap Water & Coastlines | Geofabrik / OSM Foundation | ODbL 1.0 | WGS84 (EPSG:4326) | Sea level reference (0m) | Vector polygon | Git tree |
| SRC-HYDRO | HydroSHEDS / HydroRIVERS | WWF / USGS HydroSHEDS | Free for academic/educational | WGS84 | Geoid | 15 arc-sec | SHA-256 |

All elevation values are extracted directly from satellite radar topography. No synthetic random noise or arbitrary mountain generation is used as a substitute for real geography.
