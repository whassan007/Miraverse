# MiraVerse Global v1.1 — World Quality & Spatial Audit Report (`WORLD-QUALITY.md`)

## 1. World Architecture Summary
- **Campaign:** *Echoes of Home: The Atlas of Belonging*
- **Central Hub:** *The Atlas Observatory* (`[0, 100, 0]`, `96×32×96` blocks, 11 country portals, Atlas Journal pedestal, Language Switcher kiosk, Age-Track selector, Accessibility beacon, Circle of Stories exhibition hall).
- **11 Isolated Cultural Districts (`96×32×96` blocks each, separated by `200` blocks on X-axis):**
  - Minimum targets vs. delivered counts across all 11 destinations:
    - **Differentiated Structures:** Required `>= 55` (`5 × 11`) | Delivered: **55 District Exteriors + 3 Hub Structures = 58**
    - **Furnished Enterable Interiors:** Required `>= 33` (`3 × 11`) | Delivered: **33 District Interiors + 2 Hub Interiors = 35**
    - **Functional Cast NPCs:** Required `>= 44` (`4 × 11`) | Delivered: **55 Cast NPCs (`5 × 11`)**
    - **Interactive Locations:** Required `>= 88` (`8 × 11`) | Delivered: **121 District Interactive Anchors (`11 × 11`) + 16 Hub Anchors = 137**
    - **Custom Regional Blocks:** **88 Custom Blocks (`8 × 11`)** with 16×16 pixel-art textures.

## 2. Per-Country District Verification Table
| Order | Code | Country & District | Origin | Exteriors | Interiors | NPCs | Interactive Spots | Voxel Prefab |
|---|---|---|---|---|---|---|---|---|
| 1 | `LB` | **Lebanon** — Byblos/Jbeil | `[200, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`lb_district_v11.mcstructure.json`) |
| 2 | `IQ` | **Iraq** — Baghdad | `[600, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`iq_district_v11.mcstructure.json`) |
| 3 | `EG` | **Egypt** — Cairo | `[400, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`eg_district_v11.mcstructure.json`) |
| 4 | `FR` | **France** — Vieux Lyon | `[1000, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`fr_district_v11.mcstructure.json`) |
| 5 | `KR` | **South Korea** — Jeonju | `[800, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`kr_district_v11.mcstructure.json`) |
| 6 | `DE` | **Germany** — Rhine / symbolic Grail landscape | `[1200, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`de_district_v11.mcstructure.json`) |
| 7 | `CN` | **China** — Peach Blossom Spring, Wuling-inspired setting | `[1400, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`cn_district_v11.mcstructure.json`) |
| 8 | `JP` | **Japan** — Bashō’s journey, Tohoku-inspired route | `[1600, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`jp_district_v11.mcstructure.json`) |
| 9 | `RU` | **Russia** — Lake Svetloyar / Kitezh-inspired mythic landscape | `[1800, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`ru_district_v11.mcstructure.json`) |
| 10 | `UA` | **Ukraine** — Kyiv founding hills / community music square | `[2000, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`ua_district_v11.mcstructure.json`) |
| 11 | `MA` | **Morocco** — Marrakesh / Jemaa el-Fnaa-inspired square | `[2200, 64, 0]` | 5 | 3 | 5 | 11 | `5641` voxels (`ma_district_v11.mcstructure.json`) |

## 3. Truthful Binary `.mcworld` & Live Screenshot Status
- **Source & Structure Prefabs:** `VERIFIED` (12 complete `.mcstructure.json` prefabs + `apps/minecraft/world/integration/world-spatial-integration.json`).
- **Windows LevelDB `.mcworld` Export:** `BLOCKED (native runtime missing on Linux aarch64 host)` — paired with `apps/minecraft/editor/export-windows-mcworld.ps1`.
