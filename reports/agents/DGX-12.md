# DGX-12: Lebanon location data

Backend: dgx (qwen3-coder:30b)

# Lebanon Scope Report: Byblos Harbor Quest

## Findings

The repository contains a single chapter quest (`LB:ch1:harbor:main`) set in the Lebanese coastal city of Byblos, centered on cultural elements including:

- **Cultural Context**: The quest revolves around Teta Nahla (grandmother), za'atar man'oushe, and the saj griddle.
- **Key Locations**: Byblos harbor, courtyard with domed saj, mountain stone house, and souk market.
- **Items Required**: 
  - Wheat flour
  - Wild za'atar blend
  - Mountain olive oil
- **NPCs Involved**:
  - Teta Nahla (mentor)
  - Amo Farid (spice merchant)
  - Usta Nadim (builder)
  - Captain Rima (sailor)
- **Vocabulary Learned**: 
  - منقوشة (man'oushe)
  - زعتر (za'atar)
  - صاج (saj)
  - تيتا (teta)
  - ميناء (mina')
- **Cultural Facts**: 
  - The saj is warming for fresh manoushe.
  - The harbor bakery archway will be restored with limestone and cedar.

## Implementation Specification

### Quest Structure
- **Chapter**: 1
- **Quest ID**: `LB:ch1:harbor:main`
- **Title (Native)**: لبنان · ميناء جبيل وصاج تيتا نهلة
- **Title (English)**: Lebanon: Byblos Harbor & Teta Nahla's Saj
- **Synopsis**: Restore the limestone harbor arch and bake za'atar man'oushe on the domed saj.

### Objectives
1. **Gather**
   - **Challenge Type**: Gather
   - **Title**: Pantry & Terrace Harvest
   - **Items Required**:
     - 1x Wheat Flour (`item:LB:flour`)
     - 1x Wild Za'atar Blend (`item:LB:zaatar`)
     - 1x Mountain Olive Oil (`item:LB:olive_oil`)
2. **Trade**
   - **Challenge Type**: Trade
   - **Title**: Share with the Souk Spice Merchant
   - **Items Required**:
     - 1x Wheat Flour (`item:LB:flour`)
     - 1x Wild Za'atar Blend (`item:LB:zaatar`)
     - 1x Mountain Olive Oil (`item:LB:olive_oil`)
3. **Build**
   - **Challenge Type**: Build
   - **Title**: Restore the Mountain Stone House
   - **Items Required**:
     - 1x Wheat Flour (`item:LB:flour`)
     - 1x Wild Za'atar Blend (`item:LB:zaatar`)
     - 1x Mountain Olive Oil (`item:LB:olive_oil`)
4. **Cook**
   - **Challenge Type**: Cook
   - **Title**: Bake Saj Manoushe
   - **Items Required**:
     - 1x Wheat Flour (`item:LB:flour`)
     - 1x Wild Za'atar Blend (`item:LB:zaatar`)
     - 1x Mountain Olive Oil (`item:LB:olive_oil`)
5. **Word**
   - **Challenge Type**: Word
   - **Title**: Words from Teta's Kitchen
   - **Items Required**:
     - 1x Wheat Flour (`item:LB:flour`)
     - 1x Wild Za'atar Blend (`item:LB:zaatar`)
     - 1x Mountain Olive Oil (`item:LB:olive_oil`)

### Rewards
- Each objective grants:
  - 20 Mira Tokens
  - A badge (gather, trade, build, cook, word)
- All objectives share the same cultural fact and vocabulary words.

### Dialogue Nodes
- **Teta Nahla**: Mentor NPC, provides initial quest introduction and vocabulary.
- **Amo Farid**: Spice vendor, introduces za'atar.
- **Usta Nadim**: Builder, introduces saj.
- **Captain Rima**: Sailor, introduces teta.

### Vocabulary
- منقوشة (man'oushe) - thyme flatbread
- زعتر (za'atar) - wild thyme & sesame blend
- صاج (saj) - domed iron griddle
- تيتا (teta) - grandmother
- ميناء (mina') - harbor

### 3D Assets
Based on `art/source/countries/LB/LB_KIT.md`:
- `lb_byblos_limestone_arch`
- `lb_domed_saj_griddle`
- `lb_cedar_market_awning`
- `lb_mediterranean_fishing_boat`

## Files Owned by Later Implementation

- `content/quests/LB.json` (contains quest structure and objectives)
- `content/dialogue/LB.json` (contains dialogue nodes for NPCs)
- `art/source/countries/LB/LB_KIT.md` (contains 3D asset information)

## Dependencies

- **NPCs**: 
  - `npc:LB:teta_nahla`
  - `npc:LB:amo_farid`
  - `npc:LB:nadim_builder`
  - `npc:LB:rima_sailor`
- **Items**:
  - `item:LB:flour`
  - `item:LB:zaatar`
  - `item:LB:olive_oil`
  - `item:LB:gather_badge`
  - `item:LB:trade_badge`
  - `item:LB:build_badge`
  - `item:LB:cook_badge`
  - `item:LB:word_badge`
- **Stations**:
  - `station:LB:gather`
  - `station:LB:trade`
  - `station:LB:build`
  - `station:LB:cook`
  - `station:LB:word`

## Open Gaps

### Cultural & Historical Accuracy
- No information on the actual history of Byblos harbor or its architecture.
- The specific cultural significance of za'atar man'oushe and saj is not detailed beyond the game context.
- No historical or archaeological references to verify authenticity.

### Translation & Linguistics
- No translation for "منقوشة", "زعتر", "صاج", "تيتا", "ميناء" provided in English context outside of vocabulary lists.
- Cultural phrases are not translated into full sentences.

### 3D Asset Availability
- The file `LB_KIT.md` does not specify where assets are located, nor their exact format or dependencies.
- No details on asset names or usage within the game engine are provided.

### Runtime Validation
- All implementations require Roblox Studio runtime proof NOT TESTED.  
  - Dialogue interactions (e.g., `greeting`, `follow_up`) may not function without proper NPC setup.
  - Quest triggers (`triggersObjectiveId`) may not activate properly without correct quest system integration.
  - Asset placement in-game requires visual confirmation.

### Missing Data
- No references to real-world landmarks like the ancient ruins of Byblos or the Qasr Al-Halabi.
- No mention of historical figures associated with Byblos or Lebanese cuisine.

## Truncation Notes

This report is based on excerpts from:
- `content/quests/LB.json` (truncated)
- `content/dialogue/LB.json` (truncated)
- `art/source/countries/LB/LB_KIT.md`

Some data fields like full dialogue node details, item descriptions, and full asset paths were not included due to truncation.
