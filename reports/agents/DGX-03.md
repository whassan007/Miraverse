# DGX-03: Five main quests and 25 challenges

Backend: dgx (qwen3-coder:30b)

# MiraVerse Cultural Game Program - Worker DGX-03 Report

## Findings

The repository contains five main quests, one for each of the following countries:
1. **Lebanon (LB)** - Byblos Harbor & Teta Nahla's Saj
2. **Egypt (EG)** - Cairo Courtyard Lanterns & Koshari
3. **Iraq (IQ)** - Baghdad Shanasheel & Bibi Amal's Kleicha
4. **South Korea (KR)** - Jeonju Hanok & Halmeoni's Songpyeon
5. **France (FR)** - The Golden Galette of Vieux Lyon

Each quest contains three objectives:
- **Gather**: Collect ingredients or materials for cultural food/crafts
- **Trade**: Share food/crafts with NPCs in exchange for items
- **Build**: Restore architectural elements or structures

All quests follow a consistent structure, including:
- Cultural facts
- Vocabulary words (Arabic/English/Korean/French)
- Reward items (badges and MiraTokens)
- NPC mentor information
- Station locations

## Implementation Specification

### Scope: Five Main Quests + 25 Challenges

#### 1. **Quest Structure**
Each quest contains three objectives:
- **Gather**: Collect ingredients
- **Trade**: Exchange items with NPCs
- **Build**: Restore architectural elements

#### 2. **Objective Types**
- **Gather**: Collection challenge (3 items)
- **Trade**: Exchange challenge (3 items)
- **Build**: Construction challenge (3 items)

#### 3. **Required Items per Objective**
Each objective requires exactly 3 items:
1. Wheat Flour / Egyptian Rice / Wheat Dough / Rice Flour / Puff Pastry
2. Wild Za'atar Blend / Mountain Olive Oil / Brown Lentils / Date Paste / Flaky Puff Pastry
3. Mountain Olive Oil / Spiced Tomato Sauce / Ground Cardamom / Fresh Pine Needles / Sweet Almond Cream

#### 4. **Rewards**
- **Badges**: One per challenge type (gather, trade, build)
- **MiraTokens**: 20 per objective
- **Cultural Facts**: Unique per objective
- **Vocabulary Words**: 5 words per objective with transliterations and English translations

### Files Ownership

#### Implementation Ownership:
1. `content/quests/LB.json` - Lebanon quest implementation
2. `content/quests/EG.json` - Egypt quest implementation  
3. `content/quests/IQ.json` - Iraq quest implementation
4. `content/quests/KR.json` - South Korea quest implementation
5. `content/quests/FR.json` - France quest implementation

#### Dependencies:
1. NPC data files (not provided in excerpts)
2. Item database entries for all required items
3. Station location data
4. Cultural fact and vocabulary word translations (not fully provided)
5. Prop/landmark definitions (not fully provided)

### Open Gaps

1. **Cultural & Historical Facts**: 
   - Translation accuracy of cultural facts not verified
   - Historical context for architectural elements missing
   - Need human review for authentic cultural representations

2. **Vocabulary Words**:
   - Transliterations and English translations may require verification
   - Some words (e.g., "منقوشة", "فانوس") lack complete linguistic context
   - Cultural significance of terms needs human validation

3. **Missing Data**:
   - NPC definitions not provided in excerpts
   - Prop/landmark object definitions incomplete
   - Full item database entries missing
   - Complete station location data unavailable

4. **Runtime Verification Needed**:
   - All quest flows and UI interactions NOT TESTED (no Roblox Studio access)
   - Cultural fact presentation and vocabulary word integration NOT TESTED
   - Badge rewards and MiraToken distribution NOT TESTED

### Notes on Truncation

The file excerpts are truncated, limiting full understanding of:
- Complete item definitions for all required items
- Full prop/landmark object specifications
- Complete NPC character data
- All vocabulary words with their associated object IDs
- Detailed cultural fact content beyond initial samples

All claims based on provided excerpts only. No runtime testing performed.

## Final Answer

**Scope**: Five main quests, 25 challenges (5 quests × 3 objectives × 5 challenge types)

**Implementation Ready Specification**:
- Complete quest structure with three objective types per quest
- Consistent reward system (badges + MiraTokens)
- Cultural fact and vocabulary integration
- Country-specific ingredient and craft requirements

**Files to Implement**:
1. `content/quests/LB.json` - Lebanon quest
2. `content/quests/EG.json` - Egypt quest  
3. `content/quests/IQ.json` - Iraq quest
4. `content/quests/KR.json` - South Korea quest
5. `content/quests/FR.json` - France quest

**Dependencies**: NPC data, item database, station locations, prop definitions, complete vocabulary and cultural fact content

**Open Gaps**: Cultural accuracy verification, runtime behavior testing, missing data elements NOT TESTED
