# MiraVerse v1.2 — Dual-Layer Atlas & Cartographic Accuracy Report

- **No-Invented-Coordinates Guarantee:** `no_invented_coordinates_assertion = true`. Real-world pins and in-game quest markers are stored in strictly separated arrays and UI tabs (`AtlasDualMapV12.tsx`).

## Layer 1: Verified Real-World Cultural Geodata (WGS84)

| Place ID | Country | Name (EN) | Latitude | Longitude | Uncertainty | Coordinate Source | Status |
|---|---|---|---|---|---|---|---|
| `place-lb-byblos-harbor` | **LB** | Byblos (Jbeil) Ancient Port & Citadel | `34.1230` | `35.6435` | ±50m | UNESCO World Heritage List #295 (Byblos) & MiraVerse v1.1 Baseline | `verified_real_world_wgs84` |
| `place-lb-afqa-grotto` | **LB** | Afqa Spring & Nahr Ibrahim Headwaters | `34.0686` | `35.8906` | ±120m | Lebanese Ministry of Environment / Mount Lebanon Hydrological Survey | `verified_real_world_wgs84` |
| `place-iq-baghdad-mutanabbi` | **IQ** | Al-Mutanabbi Street & Historic Tigris Book Quarter, Baghdad | `33.3406` | `44.3879` | ±40m | Baghdad Rusafa Municipal Survey & MiraVerse v1.1 Baseline | `verified_real_world_wgs84` |
| `place-iq-baghdad-abbasid-core` | **IQ** | Historic Abbasid Baghdad Scholarly Quarter (Approximate District) | `33.3485` | `44.3660` | ±1500m | Historical Atlas of Abbasid Baghdad (Karkh/Rusafa district centroid; exact 9th-century building unexcavated) | `verified_approximate_district_centroid` |
| `place-eg-cairo-bab-zuweila-khayamiya` | **EG** | Bab Zuweila, Shari'a al-Khayamiya & Taht al-Rab' (Historic Cairo) | `30.0426` | `31.2578` | ±35m | UNESCO Historic Cairo #89 (Qasaba of Radwan Bey / Bab Zuweila) | `verified_real_world_wgs84` |
| `place-fr-lyon-cour-des-voraces` | **FR** | Cour des Voraces (9 Place Colbert, Croix-Rousse, Lyon) | `45.7726` | `4.8347` | ±20m | Patrimoine Grand Lyon / UNESCO Historic Site of Lyon #872 | `verified_real_world_wgs84` |
| `place-fr-lyon-vieux-lyon-bouchons` | **FR** | Vieux Lyon & Presqu'île Culinary Quarter (Rue Royale / Rue Saint-Jean) | `45.7622` | `4.8273` | ±45m | UNESCO Historic Site of Lyon #872 & MiraVerse v1.1 Baseline | `verified_real_world_wgs84` |
| `place-kr-jeonju-hanok-village` | **KR** | Jeonju Hanok Village & Traditional Bibimbap Quarter | `35.8147` | `127.1526` | ±40m | Korea Tourism Organization / Jeonju City Geoportal & MiraVerse v1.1 Baseline | `verified_real_world_wgs84` |

## Layer 2: In-Game Quest Map Nodes (Strictly Separated from WGS84)

All in-game quest maps carry the explicit badge **`in-game map / not to geographic scale`**.

| Marker ID | Country | World ID | Act ID | SVG (%) | Roblox 3D Studs | Bedrock Block Coords | Scale Disclaimer |
|---|---|---|---|---|---|---|---|
| `qm-lb-act1` | **LB** | `byblos_harbor_v12` | `lb-v12-act-1` | (22%, 64%) | `[120, 14, -85]` | `[40, 65, -28]` | `in-game map / not to geographic scale` |
| `qm-lb-act3` | **LB** | `byblos_harbor_v12` | `lb-v12-act-3` | (54%, 42%) | `[165, 18, -40]` | `[55, 67, -14]` | `in-game map / not to geographic scale` |
| `qm-iq-act1` | **IQ** | `baghdad_scholar_court_v12` | `iq-v12-act-1` | (50%, 52%) | `[0, 20, 0]` | `[0, 68, 0]` | `in-game map / not to geographic scale` |
| `qm-iq-act4` | **IQ** | `baghdad_scholar_court_v12` | `iq-v12-act-4` | (78%, 36%) | `[95, 16, 60]` | `[32, 65, 20]` | `in-game map / not to geographic scale` |
| `qm-eg-act1` | **EG** | `cairo_lantern_alley_v12` | `eg-v12-act-1` | (28%, 58%) | `[-60, 15, 45]` | `[-20, 65, 15]` | `in-game map / not to geographic scale` |
| `qm-eg-act4` | **EG** | `cairo_lantern_alley_v12` | `eg-v12-act-4` | (68%, 48%) | `[30, 15, 90]` | `[10, 65, 30]` | `in-game map / not to geographic scale` |
| `qm-fr-act1` | **FR** | `lyon_traboules_v12` | `fr-v12-act-1` | (34%, 44%) | `[-40, 42, -30]` | `[-14, 78, -10]` | `in-game map / not to geographic scale` |
| `qm-fr-act4` | **FR** | `lyon_traboules_v12` | `fr-v12-act-4` | (72%, 66%) | `[55, 16, 40]` | `[18, 65, 14]` | `in-game map / not to geographic scale` |
| `qm-kr-act1` | **KR** | `jeonju_hanok_v12` | `kr-v12-act-1` | (42%, 52%) | `[15, 18, -25]` | `[5, 66, -8]` | `in-game map / not to geographic scale` |
| `qm-kr-act3` | **KR** | `jeonju_hanok_v12` | `kr-v12-act-3` | (66%, 38%) | `[60, 18, 20]` | `[20, 66, 7]` | `in-game map / not to geographic scale` |
