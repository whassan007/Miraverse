# DGX-20: Russia setting and chapter data

Backend: dgx (qwen3-coder:30b)

# MiraVerse Russia Chapter Data Report

## Findings

Based on the repository excerpt, the Russia (RU) country entry is **missing** from the `COUNTRIES_GLOBAL` array. The file shows entries for 6 countries (LB, IQ, EG, FR, KR, DE) but does not include Russia.

The current list of countries includes:
1. Lebanon (LB)
2. Iraq (IQ)
3. Egypt (EG)
4. France (FR)
5. South Korea (KR)
6. Germany (DE)

No Russia entry is present in the global catalog data.

## Specification

**Scope**: Russia setting and chapter data for MiraVerse children's cultural game program

**Missing Data Requirements**:
1. Country definition with ID "RU"
2. 6 chapters (RU01-RU06) matching global structure
3. Capstone artifact and passport stamp
4. Cultural warning, origin coordinates, palette colors
5. Custom blocks, cast, learn words, age challenge modes
6. Chapter-specific data including scenes, objectives, artifacts

## Files Implementation Would Own

- `swarm/minecraft-global/catalog-data.mjs` - Main catalog data file (READ-ONLY, not editable per scope)
- `swarm/minecraft-global/countries/RU/` - Russia country directory with:
  - `ru-chapters.mjs` - Chapter definitions
  - `ru-cast.mjs` - NPC data
  - `ru-custom-blocks.mjs` - Custom block definitions
  - `ru-learn-words.mjs` - Vocabulary words
- `swarm/minecraft-global/countries/RU/locales/ru-RU.json` - Russian locale translations

## Dependencies

1. Global locale system (`GLOBAL_LOCALES`) - Russia uses `ru-RU`
2. Age track behavior variants (already defined)
3. Chapter artifact and passport stamp systems
4. NPC and custom block systems
5. Scene management infrastructure

## Open Gaps

### Cultural & Historical Content
- **Real Places**: Need to identify authentic Russian cultural locations that are safe for children
- **Literature and Legend**: Must distinguish between real folk traditions and mythological tales
- **Historical Context**: Need to determine how to present Russian history without trauma or political bias
- **Translation Accuracy**: Russian language content requires expert translation review

### Technical Implementation
- **Chapter Structure**: No specific chapter definitions provided for Russia
- **Custom Blocks**: No Russian-specific custom blocks defined
- **NPC Cast**: No Russian characters identified in the global catalog
- **Learn Words**: No vocabulary words provided for Russian cultural context

### Content Validation Needs
- **Cultural Sensitivity Review**: All content must be reviewed by Russian cultural experts
- **Historical Accuracy**: Historical events must be presented appropriately for children
- **Tradition vs. Fiction**: Clear distinction between verified traditions and fictional elements
- **Age Appropriateness**: Challenges must match the 5-7, 8-10, 11-13, 14-17 age tracks

### Implementation Note
The repository excerpt is truncated after the `de_narrator_lorelei` NPC entry. Complete Russia implementation would require full data structure definition as shown in other country entries.

> **NOT TESTED**: Any runtime functionality requiring actual Roblox Studio access or deployment testing.
