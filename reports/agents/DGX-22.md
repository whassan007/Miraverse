# DGX-22: Morocco setting and chapter data

Backend: dgx (qwen3-coder:30b)

# Morocco Chapter Data Report

## Findings

Based on the provided `catalog-data.mjs` file, there is no entry for Morocco (country code `MA`) in the global catalog data. The file defines 11 countries including Lebanon (LB), Iraq (IQ), Egypt (EG), France (FR), South Korea (KR), and Germany (DE), but Morocco is not included among them.

The file contains comprehensive data structures for each country, including:
- Country metadata (name, native name, region, locale)
- Cultural themes and stories
- Settings descriptions
- Capstone artifacts and passport stamps
- Custom blocks
- Cast of characters with names and roles
- Learn words with translations
- Age-specific challenge modes
- Chapter data with titles, objectives, artifacts, and source IDs

## Implementation Specification

**Scope:** Morocco setting and chapter data for MiraVerse children's cultural game program.

### Files to be Created by Later Implementation

1. **`swarm/minecraft-global/countries/MA.mjs`**
   - Country definition file for Morocco
   - Include all standard fields from other country entries (name, native name, region, locale, theme, story, settings, etc.)

2. **`swarm/minecraft-global/chapters/MA*.mjs`**
   - Chapter files for Morocco setting (6 chapters minimum)
   - Each chapter should include: title, kind, scene, objective, artifactId, artifactName, contentType, sourceIds

3. **`swarm/minecraft-global/npcs/ma-npcs.mjs`**
   - NPC definitions specific to Morocco
   - Include mentor, merchant, artisan, storyteller roles with native greetings

4. **`swarm/minecraft-global/words/ma-learn-words.mjs`**
   - Moroccan vocabulary list for children learning
   - Include key terms in Arabic and transliteration with English definitions

5. **`swarm/minecraft-global/blocks/ma-custom-blocks.mjs`**
   - Custom block definitions for Morocco setting
   - Based on Moroccan architectural and cultural motifs

### Dependencies

1. **Global Catalog Data Structure**: Implementation must follow the existing `COUNTRIES_GLOBAL` schema
2. **Locale Support**: Must support `ar-MA` (Moroccan Darija) in global locales
3. **Age Track Consistency**: All age challenge modes must align with 5-7, 8-10, 11-13, 14-17 year-old player needs
4. **Cultural Sensitivity Framework**: Implementation must reference the global cultural warning guidance structure

## Open Gaps

### Cultural Content Gaps (Needing Human Review)

1. **Historical Accuracy**
   - Specific historical events or figures to feature in Morocco setting
   - Authentic representation of Moroccan culture and history
   - Appropriate inclusion of Moroccan mythology, legends, and folklore

2. **Geographical Context**
   - Specific regions within Morocco to represent (e.g., Marrakech, Fez, Casablanca)
   - Authentic architectural styles and cultural motifs to include

3. **Language Support**
   - Native language representation beyond Arabic (Moroccan dialects, Berber languages)
   - Proper transliteration of Moroccan terms

4. **Cultural Practices**
   - Traditional crafts, foods, stories, celebrations appropriate for children
   - Cultural practices that can be safely represented in game context

### Technical Gaps

1. **Localization Support**
   - `ar-MA` locale integration with proper fallback chains
   - Translation of all cultural elements into native Arabic dialect

2. **Chapter Design**
   - Age-appropriate objectives for each chapter (5-7, 8-10, 11-13, 14-17)
   - Specific gameplay mechanics for Moroccan setting that align with existing patterns

3. **Custom Block Assets**
   - Concrete design specifications for Moroccan architectural elements
   - Integration with existing custom block naming conventions (`miraverse:ma_*`)

## Not Tested Items

The following items cannot be verified without Roblox Studio access:
- Custom block rendering and functionality in game environment
- NPC dialogue systems and character interactions
- Chapter progression mechanics
- Age-appropriate difficulty balancing
- Cultural sensitivity of narrative elements

## Repository Limitations

This analysis is limited by the truncated file excerpts provided. The full implementation would require access to:
1. Complete `catalog-data.mjs` file with all country entries
2. Existing Morocco-specific files in the repository (if any)
3. Roblox Studio environment for testing cultural content and gameplay mechanics

The current data only shows that Morocco is missing from the canonical list of countries but provides a clear template for how to structure the implementation once human review resolves the gaps above.
