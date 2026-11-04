# DGX-14: Iraq location data

Backend: dgx (qwen3-coder:30b)

# DGX-14: Iraq Location Data Report

## Findings

This is a READ-ONLY wave for the MiraVerse children's cultural game program (Roblox first). The scope is limited to Iraq and its cultural elements as defined in `content/quests/IQ.json` and `content/dialogue/IQ.json`.

### Key Cultural Elements Identified
1. **Shanasheel**:
   - Carved latticework balcony (prop:IQ:shanasheel_balcony)
   - Mentioned in dialogue as a cultural symbol of Baghdad
   - Described in the quest title and objectives

2. **Kleicha**:
   - Spiced date-filled pastry (item:IQ:kliche_tray)
   - Cultural significance tied to Eid celebrations
   - Referenced in multiple dialogue nodes and quest objectives

3. **Tigris River**:
   - Known as "Dijla" in Arabic (prop:IQ:tigris_terrace)
   - Central to Baghdad's identity and geography
   - Featured in the quest synopsis and dialogue

4. **Cardamom & Dates**:
   - Used in baking kleicha (item:IQ:cardamom, item:IQ:date_paste)
   - Both are culturally significant ingredients in Iraqi cuisine
   - Mentioned in dialogue as part of the spice trade and local gathering culture

5. **Local Characters**:
   - Bibi Amal (mentor NPC) - related to baking and cultural education
   - Abu Zaid (vendor NPC) - related to trade and market culture
   - Najjar Sinan (artisan NPC) - related to construction and craftsmanship
   - Mariam (neighbor NPC) - related to poetry, storytelling, and social gatherings

### Vocabulary Words:
- **كليجة** (kleicha) - spiced date-filled pastry
- **شناشيل** (shanasheel) - carved latticework balcony
- **تمر** (tamr) - dates
- **هيل** (heil) - cardamom
- **دجلة** (Dijla) - Tigris River

## Implementation Specification

### Quest Overview
A single quest line (`IQ:ch1:shanasheel:main`) that teaches children about Iraqi culture through:
1. Gathering ingredients for kleicha baking
2. Trading items with local NPCs
3. Building a shanasheel balcony
4. Cooking and baking kleicha
5. Learning vocabulary words from dialogue

### Required Items (from quest objectives)
- `item:IQ:wheat_dough`
- `item:IQ:date_paste`
- `item:IQ:cardamom`

### NPC Interactions
1. **Bibi Amal** (`npc:IQ:bibi_amal`) - Mentor, for gathering and cooking
2. **Abu Zaid** (`npc:IQ:abu_zaid`) - Vendor, for trading
3. **Najjar Sinan** (`npc:IQ:sinan_carpenter`) - Artisan, for building
4. **Mariam** (`npc:IQ:mariam_poet`) - Neighbor, for vocabulary learning

### Stations
1. `station:IQ:gather` - For gathering ingredients
2. `station:IQ:trade` - For trading with Abu Zaid
3. `station:IQ:build` - For building the shanasheel balcony
4. `station:IQ:cook` - For baking kleicha
5. `station:IQ:word` - For vocabulary learning

## Files for Implementation

### Core Files Owned by Implementation Team:
1. `/content/quests/IQ.json` - Quest structure and objectives (READ-ONLY)
2. `/content/dialogue/IQ.json` - Dialogue trees and NPC interactions (READ-ONLY)
3. `/art/source/countries/IQ/IQ_KIT.md` - 3D architecture and prop kit specifications (READ-ONLY)
4. `/content/props/IQ/` - Prop assets for `shanasheel_balcony`, `kleicha_tray`, etc.
5. `/content/items/IQ/` - Item assets for `wheat_dough`, `date_paste`, `cardamom`
6. `/content/npcs/IQ/` - NPC assets and behaviors for `bibi_amal`, `abu_zaid`, `sinan_carpenter`, `mariam_poet`
7. `/content/stations/IQ/` - Station assets for gathering, trading, building, cooking, and word learning

### Dependencies
- MiraVerse cultural game engine (Roblox Studio required)
- IQ-specific 3D architecture kit (`IQ_KIT.md`)
- Localization support for Arabic transliterations and native text
- Cultural fact integration in dialogue nodes
- Vocabulary word tracking and display system

## Open Gaps

### Human Review Required:
1. **Historical Accuracy**: 
   - Confirm historical existence of specific shanasheel balcony styles in Baghdad
   - Verify authenticity of kleicha recipes and their regional variations

2. **Cultural Facts**:
   - Validate that cardamom tea is a common gathering beverage in Iraqi culture
   - Confirm the role of Eid celebrations involving kleicha in Baghdad

3. **Geographical Accuracy**:
   - Validate specific locations of Tigris riverfront terraces in Baghdad
   - Confirm historical significance of the Dijla river name

4. **Vocabulary Words**:
   - Verify that all listed vocabulary words are authentic Iraqi Arabic terms used in Eid gatherings
   - Confirm correct transliterations and pronunciations

### Runtime Proof Required (NOT TESTED):
1. **NPC Behaviors**: 
   - Dialogue flow between NPC interactions not fully visible from these excerpts
2. **Prop Functionality**:
   - Actual interaction with `shanasheel_balcony`, `kleicha_tray`, etc. not shown
3. **Station Interactions**:
   - Specific mechanics of gathering, trading, building, cooking, and word learning stations not demonstrated

### Truncation Limitations:
- The file excerpts are truncated at several points, particularly in vocabulary lists and dialogue nodes
- Full dialogue trees and item definitions may contain additional information not visible in these excerpts

This report is based on the available data and should be validated by cultural experts before final implementation.
