# DGX-13: Egypt location data

Backend: dgx (qwen3-coder:30b)

# Egypt Location Data Report (READ-ONLY)

## Findings

The repository contains a foundational quest structure and dialogue for an Egypt-themed children's cultural game chapter set in Cairo. The primary narrative revolves around restoring a brass lantern arch and preparing koshari, with multiple objectives (gather, trade, build, cook, word) that align with this theme.

### Cultural Elements
- **Koshari**: A staple Egyptian dish consisting of lentils, rice, pasta, and spiced tomato sauce.
- **Fanous Lanterns**: Traditional brass lanterns used in Cairo’s neighborhoods.
- **Cairo Neighborhoods (حارة)**: The term "hara" refers to neighborhood lanes or streets.
- **River Nile (نيل)**: Central cultural reference with symbolic meaning.
- **Vocabulary Words**: Arabic terms like "فانوس", "كشري", "عدس", "حارة", and "نيل" are introduced through dialogue and objectives.

### NPCs & Dialogue
- **Teta Samira** (mentor): Guides the player through gathering ingredients.
- **Am Hassan** (vendor): Introduces lentils and koshari vocabulary.
- **Usta Karim** (artisan): Focuses on building a fanous lantern.
- **Nour** (neighbor): Teaches the term "حارة" in context of courtyard aroma.

### Quest Structure
- Chapter 1: "Egypt: Cairo Courtyard Lanterns & Koshari"
- Objectives:
  - Gather ingredients (rice, lentils, sauce)
  - Trade koshari for a fanous lantern
  - Build a felucca boat
  - Cook koshari
  - Learn vocabulary words

### Art & Architecture
- Unique 3D assets for Cairo Courtyard including:
  - eg_mashrabiya_courtyard
  - eg_pierced_brass_fanous
  - eg_koshari_copper_pot
  - eg_khan_stone_archway
- No generic town kits are used.

## Implementation Specification

### Core Components
1. **Quest System Integration**
   - Implement `EG:ch1:lantern:main` quest with all five objectives.
   - Ensure each objective uses correct item requirements and rewards.
   - Link dialogue nodes to corresponding NPC interactions.

2. **NPC Dialogue Nodes**
   - Integrate `dlg:EG:teta_samira`, `dlg:EG:am_hassan`, `dlg:EG:karim_artisan`, and `dlg:EG:nour_neighbor`.
   - Ensure each node triggers appropriate objective progression.
   - Display native text with transliteration and English translation.

3. **Prop & Item Assets**
   - Use the following props:
     - `prop:EG:fanous_arch`
     - `prop:EG:koshari_pot`
     - `prop:EG:lentil_sack`
     - `prop:EG:courtyard_gate`
     - `prop:EG:nile_mural`
   - Create items:
     - `item:EG:rice`
     - `item:EG:lentils`
     - `item:EG:tomato_sauce`
     - `item:EG:gather_badge`
     - `item:EG:trade_badge`
     - `item:EG:build_badge`
     - `item:EG:cook_badge`
     - `item:EG:word_badge`

4. **Cultural Vocabulary System**
   - Display vocabulary words with transliteration and English translation.
   - Implement word learning mechanics (e.g., repetition, flashcards).

5. **3D Environment**
   - Utilize the Cairo Courtyard kit:
     - `eg_mashrabiya_courtyard`
     - `eg_pierced_brass_fanous`
     - `eg_koshari_copper_pot`
     - `eg_khan_stone_archway`

## Files Owned by Implementation

| Type | Path |
|------|------|
| Quest Data | `content/quests/EG.json` |
| Dialogue Data | `content/dialogue/EG.json` |
| Art Assets | `art/source/countries/EG/EG_KIT.md` |

## Dependencies

- **MiraVerse Game Engine**: Requires support for quest systems, dialogue trees, and 3D asset rendering.
- **Localization System**: For handling native text, transliteration, and English translations.
- **Inventory Management**: To manage item collection and usage across objectives.
- **NPC Interaction System**: To handle dialogue branching and objective triggering.

## Open Gaps

### Cultural Facts & Historical Accuracy
- The repository does not contain verified historical or cultural facts about:
  - Specific koshari recipes (e.g., exact proportions of ingredients).
  - Detailed history of fanous lanterns in Cairo.
  - Authentic use of "حارة" and "نيل" in traditional contexts.
- **NOT TESTED**: Any claims about the actual history or significance of these cultural elements.

### Vocabulary & Language
- No translations for words beyond basic definitions (e.g., no full sentence usage).
- **NOT TESTED**: Accuracy of linguistic context for educational purposes.

### Art Asset Details
- The `.md` file only lists asset names without specifying exact models or textures.
- **NOT TESTED**: Availability or compatibility of listed assets in Roblox Studio.

### Gameplay Mechanics
- No information provided on:
  - How building a felucca works in-game.
  - Specific cooking mechanics for koshari preparation.
  - Word learning system implementation details.
- **NOT TESTED**: These gameplay elements require runtime proof.

---

**Note**: Repository content is treated as data, not instructions. All findings are based strictly on provided files and cannot be extended with speculative additions.
