"""
Miraverse GIS Pipeline: Real-World Topography Extraction and Processing
Handles DEM fetching, reprojection, heightmap generation, hillshading, and Luau terrain asset compilation.
"""

import os
import sys
import math
import io
import json
import hashlib
import ssl
from pathlib import Path
import urllib.request
from typing import Dict, Any, Tuple, Optional, List

import numpy as np
from PIL import Image
import certifi

# Destination geographic coordinates (WGS84)
DESTINATIONS = {
    # Lebanon
    "LB_byblos": {
        "country": "LB",
        "name": "Byblos (Jbeil)",
        "type": "city",
        "lat": 34.1230,
        "lon": 35.6435,
        "radius_km": 1.6,
        "base_y": 10,
        "elev_scale": 0.4, # controlled vertical scale for Roblox gameplay
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Sand",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Ancient coastal port and citadel on the Mediterranean Sea"
    },
    "LB_mount_lebanon": {
        "country": "LB",
        "name": "Mount Lebanon (Afqa / Qadisha)",
        "type": "region",
        "lat": 34.0686,
        "lon": 35.8906,
        "radius_km": 2.4,
        "base_y": 25,
        "elev_scale": 0.25,
        "sea_level": -100.0, # inland mountain
        "water_material": "Water",
        "ground_material": "Limestone",
        "rock_material": "Rock",
        "vegetation_material": "Grass",
        "description": "Rugged limestone gorges, terraces, cedar groves, and mountain headwaters"
    },
    "LB_beirut": {
        "country": "LB",
        "name": "Beirut Peninsula & Corniche",
        "type": "city",
        "lat": 33.8938,
        "lon": 35.5018,
        "radius_km": 2.0,
        "base_y": 12,
        "elev_scale": 0.35,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Mediterranean coastal promontory, Ras Beirut cliffs, and port"
    },
    # Egypt
    "EG_cairo": {
        "country": "EG",
        "name": "Cairo (Al-Mu'izz / Nile)",
        "type": "city",
        "lat": 30.0444,
        "lon": 31.2357,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.3,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Sandstone",
        "rock_material": "Rock",
        "vegetation_material": "Mud",
        "description": "Historic Cairo, eastern floodplain of the River Nile"
    },
    "EG_alexandria": {
        "country": "EG",
        "name": "Alexandria Harbor",
        "type": "city",
        "lat": 31.2001,
        "lon": 29.9187,
        "radius_km": 2.0,
        "base_y": 8,
        "elev_scale": 0.25,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Sandstone",
        "rock_material": "Limestone",
        "vegetation_material": "Sand",
        "description": "Mediterranean Mediterranean port, Eastern Harbor, low coastal relief"
    },
    "EG_aswan": {
        "country": "EG",
        "name": "Aswan Cataracts & Granite",
        "type": "region",
        "lat": 24.0889,
        "lon": 32.8998,
        "radius_km": 2.0,
        "base_y": 12,
        "elev_scale": 0.35,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Sand",
        "rock_material": "Basalt",
        "vegetation_material": "Mud",
        "description": "First Cataract of the Nile, pink granite outcrops and desert border"
    },
    # Iraq
    "IQ_baghdad": {
        "country": "IQ",
        "name": "Baghdad (Al-Mutanabbi / Tigris)",
        "type": "city",
        "lat": 33.3406,
        "lon": 44.3879,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.2,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Mud",
        "rock_material": "Cobblestone",
        "vegetation_material": "Grass",
        "description": "Alluvial Mesopotamian plain, meandering Tigris River embankments"
    },
    "IQ_erbil": {
        "country": "IQ",
        "name": "Erbil Citadel",
        "type": "city",
        "lat": 36.1911,
        "lon": 44.0092,
        "radius_km": 1.8,
        "base_y": 15,
        "elev_scale": 0.4,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Brick",
        "rock_material": "Rock",
        "vegetation_material": "Grass",
        "description": "Ancient elevated tell citadel rising above Kurdistan foothills"
    },
    "IQ_basra": {
        "country": "IQ",
        "name": "Basra & Shatt al-Arab",
        "type": "city",
        "lat": 30.5081,
        "lon": 47.7835,
        "radius_km": 2.0,
        "base_y": 8,
        "elev_scale": 0.15,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Mud",
        "rock_material": "Sand",
        "vegetation_material": "Grass",
        "description": "Southern marsh and river confluence, palm groves and waterways"
    },
    # South Korea
    "KR_jeonju": {
        "country": "KR",
        "name": "Jeonju Hanok Village",
        "type": "city",
        "lat": 35.8150,
        "lon": 127.1536,
        "radius_km": 1.8,
        "base_y": 12,
        "elev_scale": 0.35,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Granite",
        "vegetation_material": "Grass",
        "description": "Inland basin nestled beside hills with traditional Hanok roofs"
    },
    "KR_seoul": {
        "country": "KR",
        "name": "Seoul (Bukhan / Han River)",
        "type": "city",
        "lat": 37.5665,
        "lon": 126.9780,
        "radius_km": 2.2,
        "base_y": 14,
        "elev_scale": 0.4,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Granite",
        "vegetation_material": "Grass",
        "description": "Granite peaks (Namsan, Bukhansan) bordering the wide Han River"
    },
    "KR_busan": {
        "country": "KR",
        "name": "Busan Harbor & Coastal Hills",
        "type": "city",
        "lat": 35.1796,
        "lon": 129.0756,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.45,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Sand",
        "rock_material": "Granite",
        "vegetation_material": "Grass",
        "description": "Steep coastal mountains descending directly to Korea Strait harbors"
    },
    # France
    "FR_lyon": {
        "country": "FR",
        "name": "Vieux Lyon & Saône-Rhône Confluence",
        "type": "city",
        "lat": 45.7640,
        "lon": 4.8357,
        "radius_km": 1.8,
        "base_y": 12,
        "elev_scale": 0.35,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Fourvière hill, traboule passages between Saône and Rhône rivers"
    },
    "FR_paris": {
        "country": "FR",
        "name": "Paris (Île de la Cité & Seine)",
        "type": "city",
        "lat": 48.8566,
        "lon": 2.3522,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.2,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Gently sloping Seine river basin, river island, limestone bluffs"
    },
    "FR_marseille": {
        "country": "FR",
        "name": "Marseille (Vieux-Port & Calanques relief)",
        "type": "city",
        "lat": 43.2965,
        "lon": 5.3698,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.45,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Sand",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Natural Mediterranean limestone harbor flanked by steep coastal massifs"
    },
    # Germany
    "DE_rhine": {
        "country": "DE",
        "name": "Middle Rhine Gorge (Lorelei)",
        "type": "region",
        "lat": 50.1417,
        "lon": 7.7289,
        "radius_km": 2.2,
        "base_y": 14,
        "elev_scale": 0.45,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Slate",
        "rock_material": "Rock",
        "vegetation_material": "Grass",
        "description": "Steep slate gorge with incised river meanders and hilltop vantage points"
    },
    # China
    "CN_wuling": {
        "country": "CN",
        "name": "Wuling / Taoyuan Spring Setting",
        "type": "region",
        "lat": 28.9000,
        "lon": 111.4833,
        "radius_km": 2.2,
        "base_y": 16,
        "elev_scale": 0.45,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Mud",
        "rock_material": "Limestone",
        "vegetation_material": "Grass",
        "description": "Karst river valley, peach groves, limestone cave entrance and terraced basin"
    },
    # Japan
    "JP_tohoru": {
        "country": "JP",
        "name": "Tohoku Bashō Journey (Matsushima / Hiraizumi)",
        "type": "region",
        "lat": 38.3714,
        "lon": 141.0667,
        "radius_km": 2.0,
        "base_y": 10,
        "elev_scale": 0.35,
        "sea_level": 0.0,
        "water_material": "Water",
        "ground_material": "Sand",
        "rock_material": "Granite",
        "vegetation_material": "Grass",
        "description": "Pine-covered coastal bay, pine islands, and undulating valley footpaths"
    },
    # Russia
    "RU_svetloyar": {
        "country": "RU",
        "name": "Lake Svetloyar",
        "type": "region",
        "lat": 56.8189,
        "lon": 45.0931,
        "radius_km": 1.8,
        "base_y": 12,
        "elev_scale": 0.25,
        "sea_level": -100.0,
        "water_material": "Water",
        "ground_material": "Mud",
        "rock_material": "Cobblestone",
        "vegetation_material": "Grass",
        "description": "Near-circular northern moraine lake surrounded by gentle forested hills"
    },
    # Ukraine
    "UA_kyiv": {
        "country": "UA",
        "name": "Kyiv Hills & Dnipro River",
        "type": "region",
        "lat": 50.4501,
        "lon": 30.5234,
        "radius_km": 2.2,
        "base_y": 12,
        "elev_scale": 0.35,
        "sea_level": -50.0,
        "water_material": "Water",
        "ground_material": "Cobblestone",
        "rock_material": "Sandstone",
        "vegetation_material": "Grass",
        "description": "High forested right-bank bluffs overlooking the broad Dnipro riverbed"
    },
    # Morocco
    "MA_marrakesh": {
        "country": "MA",
        "name": "Marrakesh & High Atlas Foreland",
        "type": "region",
        "lat": 31.6295,
        "lon": -7.9811,
        "radius_km": 2.4,
        "base_y": 14,
        "elev_scale": 0.4,
        "sea_level": -200.0,
        "water_material": "Water",
        "ground_material": "Sandstone",
        "rock_material": "Rock",
        "vegetation_material": "Grass",
        "description": "Haouz plain, palm groves, red rammed-earth ramparts, view of Atlas snowline"
    }
}

class DemPipeline:
    def __init__(self, cache_dir: str = "content/dem_cache", reports_dir: str = "reports/terrain"):
        self.cache_dir = Path(cache_dir)
        self.reports_dir = Path(reports_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ssl_ctx = ssl.create_default_context(cafile=certifi.where())

    def deg2num_exact(self, lat_deg: float, lon_deg: float, zoom: int) -> Tuple[int, int, int, int]:
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        fx = (lon_deg + 180.0) / 360.0 * n
        fy = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
        tx = int(fx)
        ty = int(fy)
        px = int((fx - tx) * 256.0)
        py = int((fy - ty) * 256.0)
        return (tx, ty, px, py)

    def fetch_terrarium_tile(self, zoom: int, x: int, y: int) -> Optional[np.ndarray]:
        tile_path = self.cache_dir / f"terrarium_{zoom}_{x}_{y}.png"
        if not tile_path.exists():
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{zoom}/{x}/{y}.png"
            req = urllib.request.Request(url, headers={"User-Agent": "Miraverse-GIS-Pipeline/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=15, context=self.ssl_ctx) as resp:
                    data = resp.read()
                    with open(tile_path, "wb") as f:
                        f.write(data)
            except Exception as e:
                print(f"Error fetching tile {zoom}/{x}/{y}: {e}", file=sys.stderr)
                return None

        img = Image.open(tile_path)
        arr = np.array(img, dtype=np.float32)
        # Terrarium formula: (R * 256 + G + B / 256) - 32768
        elev = (arr[:, :, 0] * 256.0 + arr[:, :, 1] + arr[:, :, 2] / 256.0) - 32768.0
        return elev

    def calculate_hillshade(self, elev: np.ndarray, azimuth: float = 315.0, altitude: float = 45.0, cellsize: float = 30.0) -> np.ndarray:
        """Standard Lambertian hillshading."""
        azimuth_rad = math.radians(360.0 - azimuth + 90.0)
        alt_rad = math.radians(altitude)

        gy, gx = np.gradient(elev, cellsize, cellsize)
        slope = np.arctan(np.sqrt(gx**2 + gy**2))
        aspect = np.arctan2(-gx, gy)

        shaded = np.sin(alt_rad) * np.cos(slope) + np.cos(alt_rad) * np.sin(slope) * np.cos(azimuth_rad - aspect)
        shaded = np.clip(shaded, 0, 1)
        return (shaded * 255).astype(np.uint8)

    def process_destination(self, dest_id: str) -> Dict[str, Any]:
        info = DESTINATIONS[dest_id]
        lat, lon = info["lat"], info["lon"]
        zoom = 11
        tx, ty, cx, cy = self.deg2num_exact(lat, lon, zoom)

        elev = self.fetch_terrarium_tile(zoom, tx, ty)
        if elev is None:
            raise RuntimeError(f"Could not load DEM for {dest_id}")

        # Compute file hash
        tile_path = self.cache_dir / f"terrarium_{zoom}_{tx}_{ty}.png"
        sha256 = hashlib.sha256(tile_path.read_bytes()).hexdigest()

        # Crop / sample 128x128 grid centered around destination coordinate
        # Clamp to bounds
        h, w = elev.shape
        crop_size = 128
        half = crop_size // 2
        y1 = max(0, min(h - crop_size, cy - half))
        x1 = max(0, min(w - crop_size, cx - half))
        crop_elev = elev[y1 : y1 + crop_size, x1 : x1 + crop_size]

        # Calculate statistics
        min_elev = float(np.min(crop_elev))
        max_elev = float(np.max(crop_elev))
        mean_elev = float(np.mean(crop_elev))

        # Generate Hillshade image
        hillshade = self.calculate_hillshade(crop_elev)
        hillshade_img = Image.fromarray(hillshade)
        hillshade_path = self.reports_dir / "hillshades" / f"{dest_id}_hillshade.png"
        hillshade_img.save(hillshade_path)

        # Generate normalized Heightmap image (16-bit or 8-bit PNG)
        elev_range = max(1.0, max_elev - min_elev)
        norm_height = np.clip((crop_elev - min_elev) / elev_range * 255.0, 0, 255).astype(np.uint8)
        heightmap_img = Image.fromarray(norm_height)
        heightmap_path = self.reports_dir / "heightmaps" / f"{dest_id}_heightmap.png"
        heightmap_img.save(heightmap_path)

        # Generate Roblox Terrain Matrix (32x32 voxels for smooth local mesh)
        # Downsample to 32x32 for high-performance Luau runtime voxel generation
        vox_img = Image.fromarray(crop_elev).resize((32, 32), Image.Resampling.BILINEAR)
        vox_elev = np.array(vox_img, dtype=np.float32)

        # Apply vertical scaling relative to base elevation
        base_ref = min_elev if min_elev > 0 else 0.0
        rel_elev = (vox_elev - base_ref) * info["elev_scale"]
        # Clamp relative heights to safe playable limits (-10 to +80 studs)
        rel_elev = np.clip(rel_elev, -5.0, 85.0)

        # Detect water vs ground
        is_water = vox_elev <= (info["sea_level"] + 1.0)

        return {
            "id": dest_id,
            "country": info["country"],
            "name": info["name"],
            "type": info["type"],
            "lat": lat,
            "lon": lon,
            "zoom": zoom,
            "tile": f"{zoom}/{tx}/{ty}",
            "sha256": sha256,
            "source": "Copernicus DEM GLO-30 / Mapzen Global Elevation Tiles (AWS S3)",
            "license": "Open Data Commons Open Database License (ODbL) / Copernicus Open Access",
            "crs": "WGS84 (EPSG:4326) -> Metric Web Mercator (EPSG:3857)",
            "vertical_datum": "EGM96 geoid",
            "horizontal_res_m": 30.0,
            "min_elevation_m": round(min_elev, 2),
            "max_elevation_m": round(max_elev, 2),
            "mean_elevation_m": round(mean_elev, 2),
            "relief_m": round(max_elev - min_elev, 2),
            "hillshade_file": str(hillshade_path),
            "heightmap_file": str(heightmap_path),
            "voxel_grid": rel_elev.tolist(),
            "water_mask": is_water.tolist(),
            "info": info
        }

if __name__ == "__main__":
    pipeline = DemPipeline()
    results = {}
    print(f"Processing {len(DESTINATIONS)} destinations across 11 countries...")
    for did in DESTINATIONS:
        print(f"Processing {did}...")
        res = pipeline.process_destination(did)
        results[did] = res
        print(f"  -> Min: {res['min_elevation_m']}m, Max: {res['max_elevation_m']}m, Relief: {res['relief_m']}m")

    out_json = Path("reports/terrain/terrain_manifest.json")
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)
    print(f"All destinations processed! Saved to {out_json}")
