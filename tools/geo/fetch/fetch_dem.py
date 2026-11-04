#!/usr/bin/env python3
"""
DGX-01: Geographic Source Fetch & Cache Utility (`tools/geo/fetch/fetch_dem.py`)
Audits and caches Copernicus GLO-30 DEM and Mapzen Terrarium fallback tiles for Miraverse locations.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pipeline import load_catalog, fetch_copernicus_window

def main():
    cat = load_catalog()
    for loc_id, loc in cat["locations"].items():
        arr, meta = fetch_copernicus_window(loc["copernicusTile"], loc["bbox"], f"{loc_id}_level3")
        print(f"[FETCH] {loc_id}: {meta['dataset']} shape={arr.shape} range=[{meta['minElevationM']}m, {meta['maxElevationM']}m]")

if __name__ == "__main__":
    main()
