# DGX-02: Cities, regions and settings registry

Backend: dgx (qwen3-coder:30b)

# MiraVerse Cultural Game Program - Cities, Regions and Settings Registry (READ-ONLY)

## Findings

This repository contains a curated set of cultural settings for the MiraVerse children's educational game program, specifically focused on cultural regions within Egypt (EG), France (FR), Iraq (IQ), South Korea (KR), and Lebanon (LB). Each country entry includes:

1. **Chapters** with challenges covering build, cook, gather, trade, and word-learning activities
2. **Items** relevant to each region's culture and traditions
3. **Mentors** providing cultural context and language learning
4. **Regional focus points** for each country
5. **Color palettes** and linguistic identifiers

### Country-Specific Insights

#### Egypt (EG)
- Cultural focus: Nile felucca, koshari, Cairo bazaar
- Items: Acacia wood planks, linen sails, koshari, fanous lanterns
- Regions: Cairo, Alexandria, Aswan
- Language: Arabic (Egyptian dialect)

#### France (FR)
- Cultural focus: Lyon bakery traditions, Galette des Rois
- Items: Puff pastry, almond cream, porcelain fève, paper crown
- Regions: Lyon, Paris, Marseille
- Language: French

#### Iraq (IQ)
- Cultural focus: Baghdadi courtyard houses, Eid kleicha
- Items: Mud bricks, palm wood, turquoise tiles, kleicha cookies
- Regions: Baghdad, Erbil, Basra
- Language: Arabic (Iraqi dialect)

#### South Korea (KR)
- Cultural focus: Hanok architecture, Chuseok harvest festival
- Items: Rice flour, sesame honey, pine needles, songpyeon cakes
- Regions: Seoul, Jeonju, Busan
- Language: Korean

#### Lebanon (LB)
- Cultural focus: Mountain stone houses, manoushe bread
- Items: Cedar beams, za'atar, olive oil, sumac jar
- Regions: Byblos, Mount Lebanon, Beirut
- Language: Arabic (Lebanese dialect)

## Implementation Specification

### Scope Coverage
This registry covers:
- Country-level cultural settings and traditions
- Regional city focus points
- Item categorization for gameplay mechanics
- Mentor character profiles with greetings and linguistic context
- Language identifiers for localization
- Color schemes for visual identity

### Files Ownership
The following files would be owned by future implementation teams:

1. `apps/roblox/src/shared/Packs.luau` - Main registry of country settings (current file)
2. `apps/roblox/src/shared/Items.luau` - Item database (not included but referenced)
3. `apps/roblox/src/shared/Regions.luau` - Regional mapping and geography
4. `apps/roblox/src/shared/Languages.luau` - Language localization data

### Dependencies
- **Item Database**: Items referenced in this registry require a matching database in `Items.luau`
- **Localization System**: Support for `en`, `ar-EG`, `fr`, `ar-IQ`, `ko`, `ar-LB` translations
- **Regional Mapping**: Integration with geographical region identifiers
- **Mentor Character System**: Integration with character dialogue and interaction systems

### Open Gaps

#### Cultural Accuracy
- **Cultural Practices**: Specific details about:
  - Koshari preparation methods (EG)
  - Galette des Rois baking traditions (FR)
  - Eid kleicha recipes (IQ)
  - Songpyeon steaming techniques (KR)
  - Manoushe preparation (LB)
- **Historical Context**: 
  - Historical accuracy of architectural elements
  - Timeline of cultural practices
- **Linguistic Authenticity**:
  - Transliterations and pronunciations for all Arabic dialects
  - Proper French terminology for culinary items
  - Korean phonetic transliterations

#### Technical Implementation
- **Item IDs**: Global ID references not yet implemented in the system (e.g., `globalId` fields)
- **Blueprint Systems**: Build challenge blueprints are defined but require implementation in game mechanics
- **Recipe Integration**: Cooking recipes need recipe system integration
- **Trade Mechanics**: Trade reward systems not yet connected
- **Language Learning**: Word challenge systems not implemented

#### Missing Data
- No data on:
  - Historical periods or cultural eras
  - Seasonal variations or temporal context
  - Social structures or community roles
  - Specific historical figures or cultural legends
  - Educational objectives beyond gameplay

## Notes on Truncation

The repository excerpts provided are incomplete, preventing full verification of:
- Complete item databases
- Full regional mapping data
- Language localization completeness
- All mentor character details
- Complete blueprint implementations

All findings are based on the available excerpt data only.

NOT TESTED: Any runtime behavior or visual implementation details.
