# DGX-15: South Korea location data

Backend: dgx (qwen3-coder:30b)

# South Korea Scope Report: Jeonju Hanok & Chuseok Traditions

## Findings

- **Cultural Context**: The quest focuses on Jeonju's hanok (traditional Korean wooden houses) and Chuseok (Korean Thanksgiving) traditions, specifically songpyeon (half-moon rice cakes) preparation.
- **Narrative Structure**: Quest is driven by Halmeoni (grandmother), who guides the player through gathering ingredients, trading, building, cooking, and learning vocabulary.
- **Items & Materials**:
  - Required items: Rice flour, sesame-honey filling, pine needles.
  - Reward tokens: GATHER, TRADE, BUILD, COOK, WORD.
- **Vocabulary Words**:
  - 송편 (songpyeon) – half-moon rice cake
  - 한옥 (hanok) – traditional wooden house
  - 할머니 (halmeoni) – grandmother
  - 솔잎 (sol-ip) – pine needles
  - 옹기 (onggi) – earthenware fermentation jars
- **Art & Architecture**:
  - Unique 3D assets for Jeonju hanok village.
  - Assets include: curved giwa roof tiles, pine maru porch, onggi earthenware jars, hanji lattice doors.

## Specification

### Quest Structure
- **Quest ID**: `KR:ch1:hanok:main`
- **Chapter**: 1
- **Mentor NPC**: `npc:KR:halmeoni` (Halmeoni)
- **Landmark**: `landmark:KR:main` (Jeonju Hanok Village)

### Objectives
| Objective ID | Type     | Title                         | Description                                                                 |
|--------------|----------|-------------------------------|-----------------------------------------------------------------------------|
| KR:ch1:hanok:gather | gather   | Chuseok Basket in Jeonju      | Collect rice flour, sesame-honey filling, and pine needles.                |
| KR:ch1:hanok:trade  | trade    | Share Chuseok Songpyeon       | Trade ingredients for a celadon tea cup.                                   |
| KR:ch1:hanok:build  | build    | Restore the Hanok Courtyard Pavilion | Arrange roof tiles and doors.                                              |
| KR:ch1:hanok:cook   | cook     | Steam Half-Moon Songpyeon     | Prepare songpyeon with pine needles.                                       |
| KR:ch1:hanok:word   | word     | Jeonju Harvest Words          | Learn Korean words for Chuseok traditions.                                 |

### NPCs
- `npc:KR:halmeoni` – Mentor (greeting node triggers `KR:ch1:hanok:gather`)
- `npc:KR:ajusshi_min` – Vendor (triggers `KR:ch1:hanok:trade`)
- `npc:KR:moksu_jihoon` – Artisan (triggers `KR:ch1:hanok:build`)
- `npc:KR:soomin_musician` – Musician (triggers `KR:ch1:hanok:word`)

### Vocabulary Words
- 송편 (songpyeon) – half-moon rice cake
- 한옥 (hanok) – traditional wooden house
- 할머니 (halmeoni) – grandmother
- 솔잎 (sol-ip) – pine needles
- 옹기 (onggi) – earthenware fermentation jars

## Files for Implementation

### Data Files
- `content/quests/KR.json` – Quest structure and objectives.
- `content/dialogue/KR.json` – NPC dialogue nodes.

### Art Assets
- `art/source/countries/KR/KR_KIT.md` – 3D architecture and prop kit details.

## Dependencies

- **NPCs**: `npc:KR:halmeoni`, `npc:KR:ajusshi_min`, `npc:KR:moksu_jihoon`, `npc:KR:soomin_musician`
- **Items**: `item:KR:rice_flour`, `item:KR:sesame_honey`, `item:KR:pine_needles`
- **Props**:
  - `prop:KR:songpyeon_steamer`
  - `prop:KR:hanok_roof`
  - `prop:KR:maru_porch`
  - `prop:KR:pine_basket`
  - `prop:KR:onggi_terrace`

## Open Gaps

- **Cultural Accuracy**: No source confirms exact historical or cultural details for songpyeon preparation or hanok restoration techniques.
- **Dialogue Translation**: The transliterations and English translations are provided, but full cultural context is not available in the files.
- **Runtime Testing**: Implementation of dialogue flow, item exchange, and building mechanics require runtime proof (NOT TESTED).
- **NPC Interactions**: The exact behavior of NPCs during quest progression is defined by dialogue nodes; actual behavior must be tested in runtime (NOT TESTED).

--- 

*Note: This report is based on the provided files and does not include third-party assets or runtime functionality testing.*
