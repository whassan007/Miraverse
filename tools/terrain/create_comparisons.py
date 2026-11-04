"""
Generate side-by-side geographic comparison composites:
Source DEM Hillshade vs Generated Heightmap vs Topographic Profile
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_composite(dest_id: str, title: str, output_path: Path):
    hillshade_path = Path(f"reports/terrain/hillshades/{dest_id}_hillshade.png")
    heightmap_path = Path(f"reports/terrain/heightmaps/{dest_id}_heightmap.png")
    if not hillshade_path.exists() or not heightmap_path.exists():
        print(f"Skipping {dest_id}: missing hillshade or heightmap")
        return

    hs = Image.open(hillshade_path).convert("RGB")
    hm = Image.open(heightmap_path).convert("RGB")

    # Resize to 256x256 each
    hs = hs.resize((256, 256), Image.Resampling.LANCZOS)
    hm = hm.resize((256, 256), Image.Resampling.LANCZOS)

    # Colorize heightmap for enhanced visual topographic inspection
    hm_arr = np.array(hm)[:, :, 0]
    colored = np.zeros((256, 256, 3), dtype=np.uint8)
    # Hypsometric tinting: Blue (water) -> Green (lowlands) -> Tan/Yellow (mid) -> Brown (high) -> White (peaks)
    colored[:, :, 0] = np.clip(hm_arr * 1.2, 0, 255).astype(np.uint8)
    colored[:, :, 1] = np.clip(180 - np.abs(hm_arr - 128) * 0.8, 0, 255).astype(np.uint8)
    colored[:, :, 2] = np.clip(255 - hm_arr * 1.5, 0, 255).astype(np.uint8)
    topo = Image.fromarray(colored)

    # Create 3-panel composite: 800 x 300
    comp = Image.new("RGB", (800, 310), color=(20, 24, 34))
    comp.paste(hs, (10, 44))
    comp.paste(hm, (276, 44))
    comp.paste(topo, (542, 44))

    draw = ImageDraw.Draw(comp)
    draw.text((15, 12), f"{title} — Real-World Topography Comparison", fill=(255, 255, 255))
    draw.text((15, 28), "Copernicus DEM Hillshade", fill=(180, 200, 230))
    draw.text((281, 28), "Normalized Heightmap", fill=(180, 200, 230))
    draw.text((547, 28), "Hypsometric Topo Tint", fill=(180, 200, 230))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    comp.save(output_path)
    print(f"Created comparison composite: {output_path}")

if __name__ == "__main__":
    targets = [
        ("LB_byblos", "Lebanon: Byblos (Jbeil) Ancient Harbor"),
        ("LB_mount_lebanon", "Lebanon: Mount Lebanon Regional Gorges"),
        ("LB_beirut", "Lebanon: Beirut Mediterranean Promontory"),
        ("EG_cairo", "Egypt: Cairo & Nile Floodplain"),
        ("IQ_baghdad", "Iraq: Baghdad & Tigris Plain"),
        ("KR_jeonju", "South Korea: Jeonju Inland Basin"),
        ("FR_lyon", "France: Vieux Lyon & Saône-Rhône Confluence"),
        ("DE_rhine", "Germany: Middle Rhine Gorge"),
        ("CN_wuling", "China: Wuling Peach Blossom Valley"),
        ("JP_tohoru", "Japan: Tohoku Bashō Journey"),
        ("RU_svetloyar", "Russia: Lake Svetloyar Moraine Depression"),
        ("UA_kyiv", "Ukraine: Kyiv Hills & Dnipro River"),
        ("MA_marrakesh", "Morocco: Marrakesh Haouz Plain & High Atlas"),
    ]
    for tid, name in targets:
        country = tid.split("_")[0]
        out_p = Path(f"reports/terrain/countries/{country}/{tid}_comparison.png")
        create_composite(tid, name, out_p)
        # Also copy to reports/terrain/screenshots/
        create_composite(tid, name, Path(f"reports/terrain/screenshots/{tid}_comparison.png"))
