#!/usr/bin/env python3
"""
DGX-03: Roblox Heightmap, Voxel & Material Classifier (`tools/geo/terrain/generate_roblox_terrain.py`)
Runs the full 11-country GIS-to-Roblox terrain pipeline and writes Luau modules + manifests.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pipeline import main

if __name__ == "__main__":
    main()
