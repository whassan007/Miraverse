"""
Compile real-world GIS DEM terrain manifest into source-controlled Luau module:
apps/roblox/src/shared/TerrainData.luau
"""

import json
from pathlib import Path

def compile_terrain_luau():
    manifest_path = Path("reports/terrain/terrain_manifest.json")
    if not manifest_path.exists():
        raise FileNotFoundError("terrain_manifest.json not found! Run gis_pipeline.py first.")

    with open(manifest_path, "r") as f:
        data = json.load(f)

    luau_lines = [
        "--!strict",
        "-- AUTOMATICALLY GENERATED FROM REAL-WORLD COPERNICUS DEM GLO-30 & MAPZEN ELEVATION TILES",
        "-- Single source of truth for real-world elevation matrices, relief, materials and coordinate bounds.",
        "local TerrainData = {}",
        "",
        "export type DestinationTerrain = {",
        "\tid: string,",
        "\tcountry: string,",
        "\tname: string,",
        "\tlocationType: string,",
        "\tlat: number,",
        "\tlon: number,",
        "\tminElevation: number,",
        "\tmaxElevation: number,",
        "\trelief: number,",
        "\tbaseY: number,",
        "\tgroundMaterial: string,",
        "\trockMaterial: string,",
        "\twaterMaterial: string,",
        "\tvegetationMaterial: string,",
        "\tgridSize: number,",
        "\theights: { { number } },",
        "\twaterMask: { { boolean } },",
        "}",
        "",
        "TerrainData.DESTINATIONS = {"
    ]

    for dest_id, dest in data.items():
        info = dest["info"]
        luau_lines.append(f'\t["{dest_id}"] = {{')
        luau_lines.append(f'\t\tid = "{dest_id}",')
        luau_lines.append(f'\t\tcountry = "{dest["country"]}",')
        luau_lines.append(f'\t\tname = "{dest["name"]}",')
        luau_lines.append(f'\t\tlocationType = "{dest["type"]}",')
        luau_lines.append(f'\t\tlat = {dest["lat"]},')
        luau_lines.append(f'\t\tlon = {dest["lon"]},')
        luau_lines.append(f'\t\tminElevation = {dest["min_elevation_m"]},')
        luau_lines.append(f'\t\tmaxElevation = {dest["max_elevation_m"]},')
        luau_lines.append(f'\t\trelief = {dest["relief_m"]},')
        luau_lines.append(f'\t\tbaseY = {info["base_y"]},')
        luau_lines.append(f'\t\tgroundMaterial = "{info["ground_material"]}",')
        luau_lines.append(f'\t\trockMaterial = "{info["rock_material"]}",')
        luau_lines.append(f'\t\twaterMaterial = "{info["water_material"]}",')
        luau_lines.append(f'\t\tvegetationMaterial = "{info["vegetation_material"]}",')
        luau_lines.append(f'\t\tgridSize = 32,')
        
        # Write height matrix
        luau_lines.append('\t\theights = {')
        for row in dest["voxel_grid"]:
            formatted_row = ", ".join(f"{round(v, 2)}" for v in row)
            luau_lines.append(f'\t\t\t{{ {formatted_row} }},')
        luau_lines.append('\t\t},')

        # Write water mask
        luau_lines.append('\t\twaterMask = {')
        for row in dest["water_mask"]:
            formatted_row = ", ".join("true" if v else "false" for v in row)
            luau_lines.append(f'\t\t\t{{ {formatted_row} }},')
        luau_lines.append('\t\t},')

        luau_lines.append('\t},')

    luau_lines.append("} :: { [string]: DestinationTerrain }")
    luau_lines.append("")
    luau_lines.append("function TerrainData.get(destId: string): DestinationTerrain?")
    luau_lines.append("\treturn TerrainData.DESTINATIONS[destId]")
    luau_lines.append("end")
    luau_lines.append("")
    luau_lines.append("return TerrainData")

    out_file = Path("apps/roblox/src/shared/TerrainData.luau")
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w") as f:
        f.write("\n".join(luau_lines) + "\n")
    print(f"Generated {out_file} ({len(data)} destinations)")

if __name__ == "__main__":
    compile_terrain_luau()
