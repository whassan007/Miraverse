# GEMINI-02: Mount Lebanon Visual, Geographic & Cultural Verification

- **Backend**: Gemini / Antigravity (`research` subagent `9ecfcec1-f433-4999-ad35-a81d9896ce2c`)
- **Worktree**: `/home/wael/Code/mv-wt-ml/GEMINI-02`
- **Status**: COMPLETED

---

## 1. Visual & Geographic Criteria for `MountLebanonWorld.luau`

To establish an authentic, immediately recognizable Levantine highland identity that honors `records.json` sensitivity guidelines (*"Present Beirut and Mount Lebanon as distinct geographic areas, not walkable extensions of a single block street"*), `MountLebanonWorld.luau` must implement:

### A. Topography & Elevation
- **Elevated Highland Landscape:** Positioned noticeably higher in elevation (`Y = 38` to `54+`) and inland (`Z = 250`, bounds `[165, 390]`) relative to coastal `ByblosWorld.luau`, evoking the limestone slopes rising toward Mount Sannine (`جبل صنّين`, referenced in `ar-LB.json` Scene 9).
- **Walkable Mountain Slopes:** Graded terrain and stepped stone stairs/ramps (`8` studs wide) allowing players to comfortably ascend from the arrival terrace (`Y = 38`) through the middle agricultural terrace (`Y = 46`) to the upper cedar ridge and scenic overlook (`Y = 54`).
- **Stepped Dry-Stone Limestone Terraces (`jall` / `الجلّ`):** Directly grounded in `ar-LB.json` Scene 4 (*"أخدت تيتا ميرا عالجلّ... كان في زيتون، ودوالي عنب، وبزاوية محمية من الهوا، شتول زعتر"*). Constructed as multi-tiered retaining walls using pale and weathered limestone (`#E6DEC8` / `#BEAA84`).

### B. Endemic Flora & Agricultural Planting
- **Lebanon Cedar (`Cedrus libani` / أرز لبنان):** Tall, monumental evergreens featuring stout `CEDAR` (`#7B4B2A`) trunks and characteristic horizontal, layered flat-topped canopy tiers in deep cedar green (`#1E5631`, the LB primary color in `LB.json`).
- **Mountain Olive Planting (`زيتون`):** Gnarled, medium-height trees with silvery-green foliage (`OLIVE_LEAF` `rgb(120, 140, 92)`) planted along the middle `jall` terraces (Scene 4; `LB.json` `olive_oil`).
- **Wild Za'atar Beds (`شتول زعتر`):** Low-lying, aromatic herb patches in sheltered corners of the stone terraces, rendered in greyish-olive green (`#556B2F` from `LB.json` `zaatar`).
- **Crimson Sumac Bushes (`سمّاق`):** Shrubs along terrace borders bearing clusters of deep tangy crimson-burgundy drupes (`#8B2635` from `LB.json` `sumac_jar`).

### C. Highland Architecture, Circulation & Wayfinding
- **Rustic Cedar Pergola / Mountain Shelter:** Open-air timber-and-limestone agricultural shelter (`CEDAR` beams `#7B4B2A` with pale `limestone_block` `#E6DEC8` piers, shaded for drying herbs as in Scene 5).
- **Stone Paths:** Winding stepped cobble and flagstone trails linking the travel station, terrace tiers, cedar shelter, and overlook.
- **Vantage Point Overlooking Byblos & the Mediterranean Sea:** A prominent stone-bordered belvedere/lookout offering an unobstructed sightline down toward the Byblos coast and blue sea.
- **Regional Travel Station & Clear Direction Signs:** Dedicated arrival/departure portals connecting Mount Lebanon with Byblos and the Travel Lobby, paired with legible `BillboardGui` directional signage.

---

## 2. Visual Differentiation from `ByblosWorld.luau`

| Feature Category | `ByblosWorld.luau` (Coastal Port & Old Town) | `MountLebanonWorld.luau` (Highland Terraces & Cedar Slope) |
| :--- | :--- | :--- |
| **Waterfront / Maritime** | Has `lb_harbor_quay`, stone breakwaters, wooden bollards, and `Enum.Material.Water` sea basin. | **NO harbor quay, breakwaters, or coastal water basin.** |
| **Vessels** | Has 4 `lb_mediterranean_fishing_boat` models. | **NO fishing boats or maritime props.** |
| **Commercial Architecture** | Has `lb_souk_market` row of 6 covered stalls and `SoukGate`. | **NO urban souk stall row or commercial market street.** |
| **Residential Density** | Has `ByblosOldTown` dense row of 8 coastal townhouses + `TetaHouse` + `lb_saj_bakery` + `lb_restoration_plot`. | **NO dense coastal townhouse row, saj bakery, or arch restoration plot.** Uses only a rustic cedar pergola/shelter, spring alcove, and dry-stone `jall` walls. |

---

## 3. Content Provenance Classification

- **Directly Supported by Repository Sources:**
  - Region ID `mount_lebanon` (`packages/content/packs/LB.json`).
  - Geographic separation mandate (`content/v12/staging/countries/LB/records.json` line 64).
  - Stepped terraces (`jall`), olive trees, grapevines, wild za'atar, sumac, and dry-stone walls (`packages/content/stories/ar-LB.json` Scene 4).
  - Mount Sannine (`جبل صنّين`) peak reference (`packages/content/stories/ar-LB.json` Scene 9).
  - Afqa Spring & Nahr Ibrahim geological iron-oxide sediment vs seasonal myth (`content/v12/staging/countries/LB/records.json` `LB-KB-MYTH-ADONIS-AFQA-RIVER`).
  - Mount Lebanon Cedar & Olive Terraces (`packages/contracts/v13/index.ts` `geo:LB:cedars`).
- **Artistic Interpretation:**
  - Exact Roblox stud dimensions, 3-tier terrace heights (`Y = 38, 46, 54`), horizontal-tiered procedural `Cedrus libani` geometry, and rustic cedar pergola shelter.
- **Content Gaps:**
  - No separate Mount Lebanon 5-challenge loop or quest exists in `LB.json` or `content/quests/LB.json`. Therefore, the 5 challenges must remain in Byblos, and Mount Lebanon is implemented as an explorable regional destination without fabricated quests.
