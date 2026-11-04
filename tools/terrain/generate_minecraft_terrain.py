#!/usr/bin/env python3
"""
Miraverse GIS-to-Minecraft Pipeline (`tools/terrain/generate_minecraft_terrain.py`)
Replicates the 11-country, 21-location real-world DEM topography (Copernicus GLO-30 & Mapzen Terrarium),
landmarks, travel connections, and challenge anchors into:
1. `apps/minecraft/scripts/generated/geo-terrain.ts` (Authoritative TypeScript module for @minecraft/server runtime)
2. `apps/minecraft/world/terrain/minecraft-terrain-v17.json` (Complete 21-destination voxel & spatial manifest)
3. `apps/minecraft/world/terrain/server-commands.mcfunction` (Bedrock / Java server command batch to materialize all 21 destinations)
4. `tools/minecraft-server/deploy-mcp-world.mjs` (Direct Mineflayer / RCON / MCP builder for live server deployment)
"""

import json
import math
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE_REGISTRY = ROOT / "content/terrain/manifests/source-registry.json"
OUT_TS = ROOT / "apps/minecraft/scripts/generated/geo-terrain.ts"
OUT_TERRAIN_DIR = ROOT / "apps/minecraft/world/terrain"
OUT_MANIFEST = OUT_TERRAIN_DIR / "minecraft-terrain-v17.json"
OUT_MCFUNCTION = OUT_TERRAIN_DIR / "server-commands.mcfunction"

COUNTRY_ORDER = ["LB", "EG", "IQ", "KR", "FR", "DE", "CN", "JP", "RU", "UA", "MA"]

# Map Roblox terrain material names to Minecraft block IDs (compatible with both Bedrock and Java)
ROBLOX_TO_MC_BLOCK = {
    "Water": "minecraft:water",
    "Sand": "minecraft:sand",
    "Sandstone": "minecraft:sandstone",
    "Limestone": "minecraft:Smooth_sandstone".lower(),
    "Cobblestone": "minecraft:cobblestone",
    "Rock": "minecraft:stone",
    "Basalt": "minecraft:basalt",
    "Granite": "minecraft:granite",
    "Slate": "minecraft:deepslate",
    "Mud": "minecraft:mud",
    "Grass": "minecraft:grass_block",
    "LeafyGrass": "minecraft:moss_block",
    "Ground": "minecraft:coarse_dirt",
    "Snow": "minecraft:snow_block",
    "Glacier": "minecraft:packed_ice",
    "Brick": "minecraft:bricks",
}

# Authoritative 21-destination layout matching Roblox WorldRegistry.luau
# In Minecraft:
# - Each country cell is spaced by 200 blocks on X: cellCenterX(cc) = (idx + 1) * 200
# - Primary city/region is at Z = 0 (matching v1.0 & v1.1 district centers at X = 200..2200, Z = 0)
# - Secondary northern/mountain/inland destination is at Z = +160
# - Tertiary southern/coastal/port destination is at Z = -160
LOCATION_LAYOUT = {
    # 1. Lebanon (LB) -> X = 200
    "byblos": {
        "countryId": "LB",
        "offset": [0, 64, 0],
        "spawnOffset": [0, 65, -22],
        "travelConnections": ["LOBBY", "mount_lebanon", "beirut"],
        "landmarks": [
            {"id": "byblos_harbor_basin", "label": "Ancient Phoenician Harbor & Sea Wall", "dx": -18, "dy": -2, "dz": -18, "block": "minecraft:prismarine_bricks"},
            {"id": "byblos_crusader_citadel", "label": "Byblos Limestone Citadel Keep", "dx": 14, "dy": 4, "dz": -12, "block": "minecraft:stone_bricks"},
            {"id": "byblos_old_souk", "label": "Old Stone Souk & Arched Stalls", "dx": 12, "dy": 1, "dz": 0, "block": "minecraft:smooth_sandstone"},
            {"id": "byblos_saj_kitchen", "label": "Teta Nahla's Saj Bakery Courtyard", "dx": -8, "dy": 1, "dz": -8, "block": "minecraft:bricks"},
            {"id": "byblos_olive_terraces", "label": "Eastern Foothill Olive & Za'atar Terraces", "dx": -22, "dy": 3, "dz": 10, "block": "minecraft:moss_block"},
        ],
    },
    "mount_lebanon": {
        "countryId": "LB",
        "offset": [0, 82, 160],
        "spawnOffset": [0, 83, 142],
        "travelConnections": ["byblos", "beirut", "LOBBY"],
        "landmarks": [
            {"id": "ml_cedar_reserve", "label": "Chouf / Qadisha Sacred Cedar Grove", "dx": 0, "dy": 8, "dz": 12, "block": "minecraft:spruce_log"},
            {"id": "ml_valley_overlook", "label": "Qadisha Ravine Cliff Overlook", "dx": -14, "dy": 6, "dz": -10, "block": "minecraft:deepslate_bricks"},
            {"id": "ml_stone_terraces", "label": "Highland Dry-Stone Agricultural Terraces", "dx": 12, "dy": 4, "dz": 4, "block": "minecraft:cobblestone"},
        ],
    },
    "beirut": {
        "countryId": "LB",
        "offset": [0, 66, -160],
        "spawnOffset": [0, 67, -178],
        "travelConnections": ["byblos", "mount_lebanon", "LOBBY"],
        "landmarks": [
            {"id": "beirut_raouche_rocks", "label": "Raouche Sea Stacks (Pigeon Rocks)", "dx": -20, "dy": 2, "dz": -14, "block": "minecraft:sandstone"},
            {"id": "beirut_corniche", "label": "Mediterranean Corniche Promenade", "dx": -10, "dy": 1, "dz": 0, "block": "minecraft:smooth_stone"},
            {"id": "beirut_heritage_arcade", "label": "Levantine Triple-Arch Heritage Facade", "dx": 10, "dy": 3, "dz": 8, "block": "minecraft:cut_sandstone"},
        ],
    },

    # 2. Egypt (EG) -> X = 400
    "cairo": {
        "countryId": "EG",
        "offset": [0, 64, 0],
        "spawnOffset": [0, 65, -22],
        "travelConnections": ["LOBBY", "alexandria", "aswan"],
        "landmarks": [
            {"id": "cairo_nile_corniche", "label": "East Bank Nile Felucca Quay", "dx": -18, "dy": -1, "dz": 0, "block": "minecraft:chiseled_sandstone"},
            {"id": "cairo_khan_el_khalili", "label": "Khan el-Khalili Fanous Lantern Souk", "dx": 6, "dy": 2, "dz": -6, "block": "minecraft:Glowstone".lower()},
            {"id": "cairo_mokattam_ridge", "label": "Mokattam Limestone Escarpment", "dx": 22, "dy": 7, "dz": 12, "block": "minecraft:smooth_sandstone"},
        ],
    },
    "alexandria": {
        "countryId": "EG",
        "offset": [0, 64, -160],
        "spawnOffset": [0, 65, -178],
        "travelConnections": ["cairo", "aswan", "LOBBY"],
        "landmarks": [
            {"id": "alex_qaitbay_spit", "label": "Pharos / Qaitbay Harbor Promontory", "dx": -16, "dy": 3, "dz": -16, "block": "minecraft:cut_sandstone"},
            {"id": "alex_eastern_harbor", "label": "Crescent Mediterranean Bay", "dx": 0, "dy": -1, "dz": -10, "block": "minecraft:prismarine"},
            {"id": "alex_bibliotheca_plaza", "label": "Great Library Sun Disk Plaza", "dx": 12, "dy": 2, "dz": 8, "block": "minecraft:quartz_bricks"},
        ],
    },
    "aswan": {
        "countryId": "EG",
        "offset": [0, 70, 160],
        "spawnOffset": [0, 71, 142],
        "travelConnections": ["cairo", "alexandria", "LOBBY"],
        "landmarks": [
            {"id": "aswan_first_cataract", "label": "First Cataract Pink Granite Boulders", "dx": -8, "dy": 2, "dz": 0, "block": "minecraft:polished_granite"},
            {"id": "aswan_elephantine_island", "label": "Elephantine Nilometer Terrace", "dx": 0, "dy": 1, "dz": 8, "block": "minecraft:granite"},
            {"id": "aswan_west_bank_dunes", "label": "Nubian Golden Sandstone Bluff", "dx": -20, "dy": 6, "dz": 14, "block": "minecraft:red_sandstone"},
        ],
    },

    # 3. Iraq (IQ) -> X = 600
    "baghdad": {
        "countryId": "IQ",
        "offset": [0, 64, 0],
        "spawnOffset": [0, 65, -22],
        "travelConnections": ["LOBBY", "erbil", "basra"],
        "landmarks": [
            {"id": "baghdad_tigris_bend", "label": "Tigris River Meander & Book Wharf", "dx": -14, "dy": -1, "dz": 0, "block": "minecraft:mud_bricks"},
            {"id": "baghdad_mutanabbi_street", "label": "Al-Mutanabbi Booksellers Arcade", "dx": 8, "dy": 2, "dz": -8, "block": "minecraft:bookshelf"},
            {"id": "baghdad_house_of_wisdom", "label": "Bayt al-Hikma Turquoise Dome Courtyard", "dx": 14, "dy": 4, "dz": 10, "block": "minecraft:cyan_terracotta"},
        ],
    },
    "erbil": {
        "countryId": "IQ",
        "offset": [0, 78, 160],
        "spawnOffset": [0, 79, 142],
        "travelConnections": ["baghdad", "basra", "LOBBY"],
        "landmarks": [
            {"id": "erbil_tell_citadel", "label": "Erbil Raised Ovoid Tell Citadel Mound", "dx": 0, "dy": 6, "dz": 0, "block": "minecraft:bricks"},
            {"id": "erbil_grand_gate", "label": "Southern Ramp & Citadel Gatehouse", "dx": 0, "dy": 4, "dz": -14, "block": "minecraft:terracotta"},
            {"id": "erbil_zagros_horizon", "label": "Northern Zagros Foothill Ridge", "dx": 18, "dy": 8, "dz": 18, "block": "minecraft:stone"},
        ],
    },
    "basra": {
        "countryId": "IQ",
        "offset": [0, 63, -160],
        "spawnOffset": [0, 64, -178],
        "travelConnections": ["baghdad", "erbil", "LOBBY"],
        "landmarks": [
            {"id": "basra_shatt_al_arab", "label": "Shatt al-Arab Confluence Canal", "dx": 0, "dy": -1, "dz": 0, "block": "minecraft:packed_mud"},
            {"id": "basra_mudhif_reed_hall", "label": "Arching Qasab Reed Mudhif Guesthouse", "dx": 10, "dy": 3, "dz": 6, "block": "minecraft:hay_block"},
            {"id": "basra_date_palm_groves", "label": "Estuary Date Palm Canal Bridges", "dx": -12, "dy": 2, "dz": -8, "block": "minecraft:jungle_log"},
        ],
    },

    # 4. South Korea (KR) -> X = 800
    "jeonju": {
        "countryId": "KR",
        "offset": [0, 64, 0],
        "spawnOffset": [0, 65, -22],
        "travelConnections": ["LOBBY", "seoul", "busan"],
        "landmarks": [
            {"id": "jeonju_hanok_lanes", "label": "Jeonju Giwa-Roof Hanok Courtyard Lanes", "dx": 6, "dy": 2, "dz": 0, "block": "minecraft:dark_oak_planks"},
            {"id": "jeonju_stream_walk", "label": "Jeonjucheon Stream & Stepping Stones", "dx": -14, "dy": -1, "dz": 4, "block": "minecraft:cobblestone"},
            {"id": "jeonju_omokdae_hill", "label": "Omokdae Wooded Foothill Pavilion", "dx": 18, "dy": 5, "dz": 14, "block": "minecraft:spruce_planks"},
        ],
    },
    "seoul": {
        "countryId": "KR",
        "offset": [0, 72, 160],
        "spawnOffset": [0, 73, 142],
        "travelConnections": ["jeonju", "busan", "LOBBY"],
        "landmarks": [
            {"id": "seoul_bukhansan_peaks", "label": "Bugaksan & Inwangsan Granite Peaks", "dx": 0, "dy": 9, "dz": 18, "block": "minecraft:granite"},
            {"id": "seoul_gyeongbokgung_axis", "label": "Gwanghwamun Royal Courtyard Axis", "dx": 0, "dy": 2, "dz": 0, "block": "minecraft:Polished_andesite".lower()},
            {"id": "seoul_han_river_south", "label": "Hangang Broad River Basin", "dx": 0, "dy": -1, "dz": -18, "block": "minecraft:stone_bricks"},
        ],
    },
    "busan": {
        "countryId": "KR",
        "offset": [0, 66, -160],
        "spawnOffset": [0, 67, -178],
        "travelConnections": ["jeonju", "seoul", "LOBBY"],
        "landmarks": [
            {"id": "busan_gamcheon_terraces", "label": "Colorful Coastal Hillside Terraces", "dx": 12, "dy": 6, "dz": 10, "block": "minecraft:light_blue_terracotta"},
            {"id": "busan_harbor_strait", "label": "Korea Strait Deepwater Harbor", "dx": -14, "dy": -1, "dz": -14, "block": "minecraft:prismarine_bricks"},
            {"id": "busan_jagalchi_wharf", "label": "Coastal Market Quay", "dx": 0, "dy": 1, "dz": -8, "block": "minecraft:quartz_block"},
        ],
    },

    # 5. France (FR) -> X = 1000
    "lyon": {
        "countryId": "FR",
        "offset": [0, 64, 0],
        "spawnOffset": [0, 65, -22],
        "travelConnections": ["LOBBY", "paris", "marseille"],
        "landmarks": [
            {"id": "lyon_fourviere_hill", "label": "Fourviere Western Escarpment & Basilica", "dx": -18, "dy": 7, "dz": 6, "block": "minecraft:quartz_pillar"},
            {"id": "lyon_saone_rhone_confluence", "label": "Saone & Rhone Twin River Quays", "dx": 0, "dy": -1, "dz": 0, "block": "minecraft:stone_bricks"},
            {"id": "lyon_traboule_courtyard", "label": "Vieux Lyon Ochre Renaissance Traboule", "dx": -8, "dy": 2, "dz": -6, "block": "minecraft:orange_terracotta"},
        ],
    },
    "paris": {
        "countryId": "FR",
        "offset": [0, 68, 160],
        "spawnOffset": [0, 69, 142],
        "travelConnections": ["lyon", "marseille", "LOBBY"],
        "landmarks": [
            {"id": "paris_ile_de_la_cite", "label": "Seine River Meander & Ile de la Cite", "dx": 0, "dy": 1, "dz": 0, "block": "minecraft:smooth_stone"},
            {"id": "paris_montmartre_butte", "label": "Montmartre Northern Gypsum Butte", "dx": 4, "dy": 7, "dz": 18, "block": "minecraft:calcite"},
            {"id": "paris_haussmann_quay", "label": "Limestone River Bridges & Bookstalls", "dx": -10, "dy": 2, "dz": -6, "block": "minecraft:chiseled_stone_bricks"},
        ],
    },
    "marseille": {
        "countryId": "FR",
        "offset": [0, 66, -160],
        "spawnOffset": [0, 67, -178],
        "travelConnections": ["lyon", "paris", "LOBBY"],
        "landmarks": [
            {"id": "marseille_vieux_port", "label": "Vieux-Port Enclosed Limestone Basin", "dx": -6, "dy": -1, "dz": 0, "block": "minecraft:smooth_sandstone"},
            {"id": "marseille_garde_hill", "label": "Notre-Dame de la Garde Limestone Peak", "dx": 14, "dy": 8, "dz": -12, "block": "minecraft:calcite"},
            {"id": "marseille_calanques_cliffs", "label": "Southern White Calanques Sea Cliffs", "dx": 18, "dy": 5, "dz": -18, "block": "minecraft:diorite"},
        ],
    },

    # 6. Germany (DE) -> X = 1200
    "rhine_valley": {
        "countryId": "DE",
        "offset": [0, 68, 0],
        "spawnOffset": [0, 69, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "rhine_lorelei_rock", "label": "Lorelei 132m Slate Cliff Promontory", "dx": 16, "dy": 9, "dz": 6, "block": "minecraft:deepslate_tiles"},
            {"id": "rhine_gorge_bend", "label": "Upper Middle Rhine Gorge Channel", "dx": 0, "dy": -1, "dz": 0, "block": "minecraft:deepslate"},
            {"id": "rhine_vineyard_terraces", "label": "Steep terraced Riesling & Castle Slopes", "dx": -16, "dy": 6, "dz": -8, "block": "minecraft:oak_leaves"},
        ],
    },

    # 7. China (CN) -> X = 1400
    "wuling_valley": {
        "countryId": "CN",
        "offset": [0, 70, 0],
        "spawnOffset": [0, 71, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "wuling_karst_spires", "label": "Wulingyuan Quartz-Sandstone Pillars", "dx": 16, "dy": 10, "dz": 14, "block": "minecraft:sandstone"},
            {"id": "wuling_peach_gorge", "label": "Hidden Cave Threshold & Blossom Stream", "dx": -10, "dy": 1, "dz": -8, "block": "minecraft:cherry_leaves"},
            {"id": "wuling_terraced_basin", "label": "Secluded Terraced Valley Basin", "dx": 0, "dy": 2, "dz": 6, "block": "minecraft:moss_block"},
        ],
    },

    # 8. Japan (JP) -> X = 1600
    "tohoku_waystation": {
        "countryId": "JP",
        "aliasId": "tohoku_route",
        "offset": [0, 68, 0],
        "spawnOffset": [0, 69, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "jp_yamadera_steps", "label": "Risshaku-ji Cedar & Tuff Mountain Steps", "dx": -16, "dy": 8, "dz": 12, "block": "minecraft:tuff"},
            {"id": "jp_mogami_river", "label": "Mogami Swift Mountain River Crossing", "dx": 0, "dy": -1, "dz": 0, "block": "minecraft:cobblestone"},
            {"id": "jp_matsushima_islets", "label": "Matsushima Pine-Clad Bay Islets", "dx": 18, "dy": 1, "dz": -14, "block": "minecraft:spruce_leaves"},
        ],
    },

    # 9. Russia (RU) -> X = 1800
    "lake_svetloyar": {
        "countryId": "RU",
        "offset": [0, 65, 0],
        "spawnOffset": [0, 66, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "ru_svetloyar_caldera", "label": "Circular Glacial-Karst Lake Svetloyar Basin", "dx": 0, "dy": -2, "dz": 0, "block": "minecraft:water"},
            {"id": "ru_birch_procession_path", "label": "Lakeshore Birch & Pine Pilgrim Trail", "dx": 14, "dy": 2, "dz": 10, "block": "minecraft:birch_log"},
            {"id": "ru_wooden_belfry_hill", "label": "Eastern Kerzhenets Timber Chapel Hill", "dx": 18, "dy": 5, "dz": 0, "block": "minecraft:spruce_planks"},
        ],
    },

    # 10. Ukraine (UA) -> X = 2000
    "kyiv_hills": {
        "countryId": "UA",
        "offset": [0, 68, 0],
        "spawnOffset": [0, 69, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "ua_right_bank_bluffs", "label": "Starokyivska & Shchekavytsia Right-Bank Bluffs", "dx": -14, "dy": 7, "dz": 8, "block": "minecraft:moss_block"},
            {"id": "ua_dnipro_channel", "label": "Wide Dnipro River & Trukhaniv Island", "dx": 6, "dy": -1, "dz": 0, "block": "minecraft:sand"},
            {"id": "ua_podil_music_square", "label": "Podil Lower Riverfront & Kobzar Square", "dx": -6, "dy": 1, "dz": -10, "block": "minecraft:stone_bricks"},
        ],
    },

    # 11. Morocco (MA) -> X = 2200
    "marrakesh_atlas": {
        "countryId": "MA",
        "aliasId": "marrakesh",
        "offset": [0, 66, 0],
        "spawnOffset": [0, 67, -22],
        "travelConnections": ["LOBBY"],
        "landmarks": [
            {"id": "ma_jemaa_el_fnaa", "label": "Jemaa el-Fnaa Pise Rammed-Earth Story Square", "dx": 0, "dy": 1, "dz": -6, "block": "minecraft:terracotta"},
            {"id": "ma_koutoubia_minaret", "label": "Koutoubia Red Sandstone Minaret & Gardens", "dx": -12, "dy": 6, "dz": -4, "block": "minecraft:red_sandstone"},
            {"id": "ma_high_atlas_peaks", "label": "Southern Snow-Capped Toubkal / High Atlas Wall", "dx": 0, "dy": 12, "dz": 20, "block": "minecraft:snow_block"},
        ],
    },
}


def main():
    with open(SOURCE_REGISTRY, "r", encoding="utf-8") as f:
        registry = json.load(f)

    OUT_TERRAIN_DIR.mkdir(parents=True, exist_ok=True)
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)

    destinations = []
    mcfunction_lines = [
        "# ============================================================================",
        "# MiraVerse v1.7.0 — 11-Country, 21-Destination Real-World DEM Terrain",
        "# Generated from content/terrain/manifests/source-registry.json (Copernicus GLO-30)",
        "# Compatible with Minecraft Bedrock & Java Servers",
        "# ============================================================================",
        "",
        "# 0. Central Travel Lobby / The Atlas Observatory at (0, 100, 0)",
        "fill -12 99 -12 12 99 12 quartz_block",
        "fill -12 100 -12 12 100 -12 stone_brick_slab",
        "fill -12 100 12 12 100 12 stone_brick_slab",
        "setblock 0 100 0 sea_lantern",
        "",
    ]

    for src in registry["sources"]:
        loc_id = src["locationId"]
        cc = src["countryId"]
        country_idx = COUNTRY_ORDER.index(cc)
        cell_x = (country_idx + 1) * 200

        layout = LOCATION_LAYOUT[loc_id]
        canonical_id = layout.get("aliasId", loc_id)
        origin_x = cell_x + layout["offset"][0]
        origin_y = layout["offset"][1]
        origin_z = layout["offset"][2]

        spawn_x = cell_x + layout["spawnOffset"][0]
        spawn_y = layout["spawnOffset"][1]
        spawn_z = layout["spawnOffset"][2]

        grid_elev = src["grid16ElevationMeters"]
        grid_studs_y = src["grid16GameStudsY"]
        grid_mats = src["grid16Materials"]

        # Convert 16x16 DEM grid into Minecraft block Y heights relative to origin_y
        # Each cell in the 16x16 grid spans 3x3 blocks (48x48 block terrain patch centered on origin_x, origin_z)
        mc_heights = []
        mc_blocks = []
        voxels_sample = []

        base_stud_y = src["gameMapping"]["baseGameY"]
        mcfunction_lines.append(f"# === [{cc}] {src['displayName']} ({canonical_id}) at ({origin_x}, {origin_y}, {origin_z}) ===")
        mcfunction_lines.append(f"# Source: {src['dataset']} | CRS: {src['coordinateReferenceSystem']} | Checksum: {src['checksum'][:16]}...")

        for r in range(16):
            row_h = []
            row_b = []
            for c in range(16):
                rel_y = round((grid_studs_y[r][c] - base_stud_y) * 0.55)
                # Flatten central 4x4 cells (rows 6..9, cols 6..9) slightly for walkable plaza/courtyard
                dist_center = math.hypot(r - 7.5, c - 7.5)
                if dist_center < 2.2:
                    rel_y = 0
                elif dist_center < 4.0:
                    rel_y = round(rel_y * ((dist_center - 2.2) / 1.8))

                block_y = origin_y + rel_y
                mat_name = grid_mats[r][c]
                mc_block = ROBLOX_TO_MC_BLOCK.get(mat_name, "minecraft:stone")
                if mat_name == "Water" and dist_center >= 2.2:
                    block_y = origin_y - 1

                row_h.append(block_y)
                row_b.append(mc_block)

                # Emit 3x3 fill command for this DEM cell
                x0 = origin_x - 24 + c * 3
                z0 = origin_z - 24 + r * 3
                x1 = x0 + 2
                z1 = z0 + 2
                short_block = mc_block.replace("minecraft:", "")
                y_bottom = min(origin_y - 2, block_y - 1)
                mcfunction_lines.append(f"fill {x0} {y_bottom} {z0} {x1} {block_y} {z1} {short_block}")
                voxels_sample.append({
                    "gridRow": r,
                    "gridCol": c,
                    "x": x0 + 1,
                    "y": block_y,
                    "z": z0 + 1,
                    "elevationMeters": grid_elev[r][c],
                    "blockId": mc_block,
                })
            mc_heights.append(row_h)
            mc_blocks.append(row_b)

        # Spawn pad, return portal, and inter-city portals
        mcfunction_lines.append(f"setblock {spawn_x} {spawn_y - 1} {spawn_z} quartz_block")
        mcfunction_lines.append(f"setblock {origin_x} {origin_y + 1} {origin_z - 22} sea_lantern")

        # Landmarks
        landmarks_resolved = []
        for lm in layout["landmarks"]:
            lx = origin_x + lm["dx"]
            ly = origin_y + max(0, lm["dy"])
            lz = origin_z + lm["dz"]
            lb = lm["block"].replace("minecraft:", "")
            mcfunction_lines.append(f"fill {lx - 1} {origin_y} {lz - 1} {lx + 1} {ly} {lz + 1} {lb}")
            landmarks_resolved.append({
                "id": lm["id"],
                "label": lm["label"],
                "pos": [lx, ly, lz],
                "blockId": lm["block"],
            })

        mcfunction_lines.append("")

        dest_record = {
            "locationId": canonical_id,
            "sourceLocationId": loc_id,
            "countryId": cc,
            "countryName": src["countryName"],
            "displayName": src["displayName"],
            "locationType": src["locationType"],
            "geographicSetting": src["geographicSetting"],
            "detailLevel": src["detailLevel"],
            "dataset": src["dataset"],
            "coordinateReferenceSystem": src["coordinateReferenceSystem"],
            "verticalDatum": src["verticalDatum"],
            "checksum": src["checksum"],
            "boundingBox": src["boundingBox"],
            "elevationStatsMeters": src["elevationStatsMeters"],
            "waterFeature": src["gameMapping"]["waterFeature"],
            "waterType": src["gameMapping"]["waterType"],
            "biome": src["gameMapping"]["biome"],
            "origin": {"x": origin_x, "y": origin_y, "z": origin_z},
            "spawn": {"x": spawn_x, "y": spawn_y, "z": spawn_z},
            "spatialBounds": {
                "min": [origin_x - 32, origin_y - 12, origin_z - 32],
                "max": [origin_x + 32, origin_y + 36, origin_z + 32],
            },
            "travelConnections": layout["travelConnections"],
            "landmarks": landmarks_resolved,
            "controlPoints": src["controlPoints"],
            "gridSize": 16,
            "cellSpanBlocks": 3,
            "grid16ElevationMeters": grid_elev,
            "grid16BlockY": mc_heights,
            "grid16BlockIds": mc_blocks,
        }
        destinations.append(dest_record)

    manifest_payload = {
        "schemaVersion": "1.7.0",
        "title": "MiraVerse GIS-to-Minecraft 11-Country, 21-Destination Topography Manifest",
        "totalCountries": 11,
        "totalDestinations": len(destinations),
        "countryOrder": COUNTRY_ORDER,
        "destinations": destinations,
    }

    with open(OUT_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest_payload, f, indent=2)

    with open(OUT_MCFUNCTION, "w", encoding="utf-8") as f:
        f.write("\n".join(mcfunction_lines) + "\n")

    # Emit TypeScript module for apps/minecraft/scripts/generated/geo-terrain.ts
    ts_lines = [
        "// GENERATED BY tools/terrain/generate_minecraft_terrain.py — DO NOT EDIT MANUALLY",
        "// Replicates Roblox v1.7.0 11-Country, 21-Destination Real-World DEM Topography in Minecraft",
        "",
        "export interface MinecraftDestinationLandmark {",
        "  id: string;",
        "  label: string;",
        "  pos: [number, number, number] | number[];",
        "  blockId: string;",
        "}",
        "",
        "export interface MinecraftControlPoint {",
        "  name: string;",
        "  lat: number;",
        "  lon: number;",
        "  expectedElevRange: [number, number] | number[];",
        "  measuredElevationMeters: number;",
        "  pass: boolean;",
        "}",
        "",
        "export interface MinecraftGeoDestination {",
        "  locationId: string;",
        "  sourceLocationId: string;",
        "  countryId: string;",
        "  countryName: string;",
        "  displayName: string;",
        "  locationType: 'city' | 'region' | string;",
        "  geographicSetting: string;",
        "  detailLevel: number;",
        "  dataset: string;",
        "  coordinateReferenceSystem: string;",
        "  verticalDatum: string;",
        "  checksum: string;",
        "  boundingBox: { minLon: number; minLat: number; maxLon: number; maxLat: number };",
        "  elevationStatsMeters: { min: number; max: number; mean: number; seaOrBaseLevel: number };",
        "  waterFeature: string;",
        "  waterType: string;",
        "  biome: string;",
        "  origin: { x: number; y: number; z: number };",
        "  spawn: { x: number; y: number; z: number };",
        "  spatialBounds: { min: [number, number, number] | number[]; max: [number, number, number] | number[] };",
        "  travelConnections: string[];",
        "  landmarks: MinecraftDestinationLandmark[];",
        "  controlPoints: MinecraftControlPoint[];",
        "  gridSize: number;",
        "  cellSpanBlocks: number;",
        "  grid16ElevationMeters: number[][];",
        "  grid16BlockY: number[][];",
        "  grid16BlockIds: string[][];",
        "}",
        "",
        f"export const MINECRAFT_ALL_COUNTRIES = {json.dumps(COUNTRY_ORDER)} as const;",
        "",
        "export const MINECRAFT_COUNTRY_DESTINATIONS: Record<string, string[]> = {",
        "  LB: ['byblos', 'mount_lebanon', 'beirut'],",
        "  EG: ['cairo', 'alexandria', 'aswan'],",
        "  IQ: ['baghdad', 'erbil', 'basra'],",
        "  KR: ['jeonju', 'seoul', 'busan'],",
        "  FR: ['lyon', 'paris', 'marseille'],",
        "  DE: ['rhine_valley'],",
        "  CN: ['wuling_valley'],",
        "  JP: ['tohoku_route'],",
        "  RU: ['lake_svetloyar'],",
        "  UA: ['kyiv_hills'],",
        "  MA: ['marrakesh'],",
        "};",
        "",
        f"export const MINECRAFT_GEO_DESTINATIONS: Record<string, MinecraftGeoDestination> = {json.dumps({d['locationId']: d for d in destinations}, indent=2)};",
        "",
        "const ALIASES: Record<string, string> = {",
        "  tohoku_waystation: 'tohoku_route',",
        "  svetloyar: 'lake_svetloyar',",
        "  kyiv: 'kyiv_hills',",
        "  marrakesh_atlas: 'marrakesh',",
        "};",
        "",
        "export function getMinecraftGeoDestination(locationId: string): MinecraftGeoDestination | undefined {",
        "  const lower = (locationId || '').toLowerCase();",
        "  const key = ALIASES[lower] || lower;",
        "  return MINECRAFT_GEO_DESTINATIONS[key];",
        "}",
        "",
        "export function canTravelMinecraft(fromLocationId: string | null | undefined, toDestinationId: string): boolean {",
        "  if (toDestinationId === 'LOBBY') return Boolean(fromLocationId);",
        "  const target = getMinecraftGeoDestination(toDestinationId);",
        "  if (!target) return false;",
        "  if (!fromLocationId || fromLocationId === 'LOBBY') {",
        "    return target.travelConnections.includes('LOBBY');",
        "  }",
        "  const source = getMinecraftGeoDestination(fromLocationId);",
        "  if (!source) return false;",
        "  return source.travelConnections.includes(target.locationId);",
        "}",
        "",
        "export interface GeoBlockOp {",
        "  pos: { x: number; y: number; z: number };",
        "  blockId: string;",
        "}",
        "",
        "export function buildDestinationTerrainOps(locationId: string): GeoBlockOp[] {",
        "  const dest = getMinecraftGeoDestination(locationId);",
        "  if (!dest) return [];",
        "  const ops: GeoBlockOp[] = [];",
        "  const { origin, spawn, grid16BlockY, grid16BlockIds, landmarks } = dest;",
        "  for (let r = 0; r < dest.gridSize; r++) {",
        "    for (let c = 0; c < dest.gridSize; c++) {",
        "      const y = grid16BlockY[r][c];",
        "      const blockId = grid16BlockIds[r][c];",
        "      const x = origin.x - 24 + c * 3 + 1;",
        "      const z = origin.z - 24 + r * 3 + 1;",
        "      ops.push({ pos: { x, y, z }, blockId });",
        "    }",
        "  }",
        "  ops.push({ pos: { x: spawn.x, y: spawn.y - 1, z: spawn.z }, blockId: 'minecraft:quartz_block' });",
        "  ops.push({ pos: { x: origin.x, y: origin.y + 1, z: origin.z - 22 }, blockId: 'minecraft:sea_lantern' });",
        "  for (const lm of landmarks) {",
        "    ops.push({ pos: { x: lm.pos[0], y: lm.pos[1], z: lm.pos[2] }, blockId: lm.blockId });",
        "  }",
        "  return ops;",
        "}",
        "",
        "export function buildAll21DestinationsTerrainOps(): Array<{ locationId: string; countryId: string; ops: GeoBlockOp[] }> {",
        "  return Object.values(MINECRAFT_GEO_DESTINATIONS).map((d) => ({",
        "    locationId: d.locationId,",
        "    countryId: d.countryId,",
        "    ops: buildDestinationTerrainOps(d.locationId),",
        "  }));",
        "}",
        "",
    ]

    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_lines))

    print(f"Generated {OUT_TS}, {OUT_MANIFEST}, and {OUT_MCFUNCTION} for {len(destinations)} destinations across 11 countries.")


if __name__ == "__main__":
    main()
