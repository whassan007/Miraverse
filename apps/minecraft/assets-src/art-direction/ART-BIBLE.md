# MiraVerse Global v1.1 — Unified Voxel Art Direction & Hub Specification

## 1. Central Hub: *The Atlas Observatory* (`[0, 100, 0]`)
- **Footprint:** `96 × 32 × 96` blocks (`[-48..48, 96..128, -48..48]`).
- **11 Country Portals:** Arranged in a celestial ring around the central Atlas Lectern. Every portal displays its regional stone/timber frame, custom icon banner, and direct safe teleportation to the country's arrival plaza.
- **Core Hub Stations:**
  1. `hub_atlas_journal_pedestal` — View missing/restored Atlas pages, 66 chapters, and passport stamps.
  2. `hub_language_switcher_kiosk` — Switch live between all 14 supported locales (`en-US`, `fr-FR`, `fr-CA`, `de-DE`, `zh-Hans-CN`, `ja-JP`, `ru-RU`, `uk-UA`, `ko-KR`, `ar`, `ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`).
  3. `hub_age_profile_selector` — Switch between `5-7` Explorer, `8-10` Adventurer, `11-13` Investigator, and `14-17` Architect/Curator without losing progress.
  4. `hub_accessible_route_beacon` — Toggle high-contrast glow paths and audio-visual cue subtitles.
  5. `hub_circle_of_stories_altar` — Combine **any 3 or more** completed country keepsakes to launch *The Circle of Stories* exhibition.

## 2. Regional Architectural Silhouettes & Color Palettes (11 Destinations)
| Code | Destination | Origin | RGB Palette | Custom Block Count |
|---|---|---|---|---|
| `LB` | **Lebanon** — Byblos/Jbeil | `[200, 64, 0]` | Primary `rgb(218,194,152)` / Accent `rgb(30,122,104)` | 8 |
| `IQ` | **Iraq** — Baghdad | `[600, 64, 0]` | Primary `rgb(58,166,185)` / Accent `rgb(212,136,42)` | 8 |
| `EG` | **Egypt** — Cairo | `[400, 64, 0]` | Primary `rgb(218,165,68)` / Accent `rgb(43,76,126)` | 8 |
| `FR` | **France** — Vieux Lyon | `[1000, 64, 0]` | Primary `rgb(216,164,92)` / Accent `rgb(59,110,165)` | 8 |
| `KR` | **South Korea** — Jeonju | `[800, 64, 0]` | Primary `rgb(72,118,96)` / Accent `rgb(204,62,48)` | 8 |
| `DE` | **Germany** — Rhine / symbolic Grail landscape | `[1200, 64, 0]` | Primary `rgb(94,128,152)` / Accent `rgb(212,172,76)` | 8 |
| `CN` | **China** — Peach Blossom Spring, Wuling-inspired setting | `[1400, 64, 0]` | Primary `rgb(228,148,168)` / Accent `rgb(68,142,108)` | 8 |
| `JP` | **Japan** — Bashō’s journey, Tohoku-inspired route | `[1600, 64, 0]` | Primary `rgb(118,154,132)` / Accent `rgb(188,92,84)` | 8 |
| `RU` | **Russia** — Lake Svetloyar / Kitezh-inspired mythic landscape | `[1800, 64, 0]` | Primary `rgb(86,134,168)` / Accent `rgb(214,162,74)` | 8 |
| `UA` | **Ukraine** — Kyiv founding hills / community music square | `[2000, 64, 0]` | Primary `rgb(72,132,196)` / Accent `rgb(238,194,56)` | 8 |
| `MA` | **Morocco** — Marrakesh / Jemaa el-Fnaa-inspired square | `[2200, 64, 0]` | Primary `rgb(208,96,68)` / Accent `rgb(42,148,126)` | 8 |