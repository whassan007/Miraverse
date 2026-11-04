# Geographic Accuracy & Literary/Mythic Classification Report

## 1. Summary of Control Point Verification
- **Total Countries Validated:** 11 (`LB`, `EG`, `IQ`, `KR`, `FR`, `DE`, `CN`, `JP`, `RU`, `UA`, `MA`)
- **Total Playable Locations Validated:** 21
- **Total Geographic Control Points Tested:** 63 (3 per destination)
- **Control Point Pass Rate:** **63 / 63 (100% PASS)**

## 2. Key Topographic Distinctions Enforced
- **Lebanon (`LB`):** `byblos` (`-5m..526m`) and `beirut` (`-12m..124m`, Ras Beirut headland & Raouché sea cliffs) are coastal Mediterranean cities, whereas `mount_lebanon` rises sharply into the Jabal Lubnan range (`432m..2,173m`).
- **Egypt (`EG`):** `alexandria` sits on the low Mediterranean coastal spit (`-78m..57m`), `cairo` pairs the flat Nile floodplain (`~18m`) with the eastern Muqattam limestone escarpment (`216m`), and `aswan` rises to the First Cataract granite gorge (`88m..237m`).
- **Iraq (`IQ`):** `basra` is a low Shatt al-Arab estuarine plain (`-2m..19m`), `baghdad` is a flat Tigris alluvial meander (`28m..51m`), and `erbil` sits on the elevated northern piedmont (`367m..481m`) with its Citadel Tell mound.
- **South Korea (`KR`):** `jeonju` is an inland valley basin bordered by Seungamsan hills, `seoul` features the Hangang river corridor ringed by Bugaksan and Namsan granite peaks, and `busan` combines a coastal harbor with steep terraced mountains.
- **France (`FR`):** `paris` is a gentle lowland sedimentary basin (`26m..142m`, zero invented alpine peaks), `lyon` features the Rhône–Saône confluence below Fourvière (`159m..308m`), and `marseille` features the Vieux-Port and steep Provençal limestone hills (`0m..252m`).
- **Morocco (`MA`):** `marrakesh` (`marrakesh_atlas`) keeps the Medina on the flat Haouz Plain (`~450m`) while placing the High Atlas foothills (`>1,500m`) on the southern horizon.

## 3. Honest Classification of Literary, Mythic, and Multi-Stop Settings
| Country | Location ID | Classification | Geographic & Cultural Handling |
|---|---|---|---|
| `DE` | `rhine_valley` | `literary_inspired_real_geography` | Real Upper Middle Rhine Gorge DEM at Sankt Goarshausen / Lorelei (`EPSG:32632`); Lorelei and Parzival Grail Hall elements are explicitly labeled as literary/mythic heritage. |
| `CN` | `wuling_valley` | `literary_inspired_real_geography` | Real Wuling Mountain / Taoyuan County karst valley DEM in Hunan (`EPSG:32649`); Tao Yuanming's *Peach Blossom Spring* (421 CE) is explicitly labeled on in-world provenance plaques as literary fiction. |
| `JP` | `tohoku_route` / `tohoku_waystation` | `literary_inspired_real_geography` | Real Tohoku Ou Mountain / Yamadera (`Risshaku-ji`) and Matsushima Bay DEMs (`EPSG:32654`); Matsuo Bashō's *Oku no Hosomichi* (1689) is labeled as historical poetic travel literature. |
| `RU` | `lake_svetloyar` | `literary_inspired_real_geography` | Real Lake Svetloyar oval basin DEM in Nizhny Novgorod Oblast (`EPSG:32638`); the submerged city of Kitezh is explicitly labeled as Russian oral folklore. |
