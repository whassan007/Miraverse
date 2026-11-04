# DGX-16: France location data

Backend: dgx (qwen3-coder:30b)

# France Location Data Report – DGX-16

## Findings

### Cultural & Historical Context
- The quest revolves around **galette des rois**, a traditional French pastry eaten during Epiphany (January 6th).
- **Vieux Lyon** is the historic old town of Lyon, known for its Renaissance architecture and *traboules*—covered passageways.
- The **Boulangerie du Soleil** is an in-game bakery named after the sun, referencing Lyon’s cultural identity.

### Key Locations & Props
- **Vieux Lyon**: Historic district with limestone facades, mansard roofs, and traboules.
- **Traboule**: Covered passageways unique to Lyon architecture.
- **Boulangerie du Soleil**: A bakery with a historical facade to be restored using slate tiles, oak shutters, and limestone.
- **Galette des Rois**: The centerpiece of the cultural activity, involving ingredients like puff pastry, almond cream, and a porcelain fève.

### NPCs & Dialogue
- **Mamie Claire** (mentor): Guides the player in gathering materials and teaches vocabulary.
- **Monsieur Henri** (vendor): Provides resources for baking and teaches “galette”.
- **Artisan Camille** (artisan): Assists in building and teaches “fève”.
- **Lucas le Musicien** (musician): Teases the celebration and teaches “couronne”.

### Items
- **Flaky Puff Pastry**
- **Sweet Almond Cream**
- **Porcelain Fève Charm**
- **Galette des Rois Tokens** (for each challenge type)

## Implementation Specification

### Objective Summary
1. **Gather**: Collect items from Les Halles market.
2. **Trade**: Exchange items with Monsieur Henri.
3. **Build**: Restore bakery facade with slate, limestone, and oak shutters.
4. **Cook**: Bake the galette des rois.
5. **Word**: Learn vocabulary from NPCs.

### Game Flow
- Player begins with **Mamie Claire** in Vieux Lyon.
- Each objective leads to a new NPC (Henri, Camille, Lucas).
- Vocabulary words are taught through dialogue nodes and linked to props (e.g., *galette_table*).
- Final reward is the golden galette des rois with associated tokens.

### Required Files
The following files are referenced in the scope:
1. `content/quests/FR.json` – Quests, objectives, items, rewards.
2. `content/dialogue/FR.json` – NPC dialogues and vocabulary teaching.
3. `art/source/countries/FR/FR_KIT.md` – 3D kit for architecture and props.

### Dependencies
- **NPC Dialogue System**: Must support multiple dialogue nodes with vocabulary linking.
- **Item Management System**: Must handle item stacking, inventory logic, and rewards.
- **Prop Interaction System**: Must support prop-based vocabulary teaching (e.g., *galette_table*).
- **Quest Progression Logic**: Must track objective completion across challenge types.

### Open Gaps
1. **Cultural Accuracy**:
   - The cultural fact about galette des rois is not fully detailed in the repository.
   - Historical context for *traboules* and their role in Lyon’s culture needs human verification.
2. **Vocabulary & Translation**:
   - Translations and transliterations are provided but may need validation by a native speaker.
   - Prop linking to vocabulary words is not fully explored (e.g., how *galette_table* teaches “galette”).
3. **Gameplay Mechanics**:
   - The build objective requires a UI or interaction system for facade restoration (NOT TESTED).
   - Dialogue nodes are not tied to in-game triggers (NOT TESTED).
4. **Art Assets**:
   - The 3D kit defines assets but does not include actual models or texture references.
   - No indication of how *traboules* and other architecture will be rendered in game (NOT TESTED).

## Conclusion
This scope provides a solid foundation for implementing the France location data within the MiraVerse children's cultural game program. However, further work is needed to:
- Validate cultural facts and translations.
- Implement dialogue and vocabulary systems.
- Connect prop interactions with learning mechanics.
- Ensure proper asset integration from `FR_KIT.md`.

---

> **Note**: This report was generated using only the provided excerpts and files. No runtime access or deployment capability exists for verification.
