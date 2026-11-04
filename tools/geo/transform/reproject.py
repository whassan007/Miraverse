#!/usr/bin/env python3
"""
DGX-02: Coordinate Reference Transformation & Metric Projection (`tools/geo/transform/reproject.py`)
Validates WGS84 (EPSG:4326) to Regional Metric UTM CRS transformations and control-point offsets.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pipeline import load_catalog, compute_projected_metrics

def main():
    cat = load_catalog()
    out = {}
    for loc_id, loc in cat["locations"].items():
        proj = compute_projected_metrics(
            loc["bbox"], loc["centerLon"], loc["centerLat"],
            loc["targetCRS"], loc["controlPoints"], loc["horizontalExtentStuds"]
        )
        out[loc_id] = proj
        print(f"[TRANSFORM] {loc_id} -> {proj['targetCRS']} | {proj['realWorldWidthMeters']}m x {proj['realWorldDepthMeters']}m")
    return out

if __name__ == "__main__":
    main()
