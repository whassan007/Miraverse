# DGX-25: NPC and mentor dialogue pipeline

Backend: dgx (qwen3-coder:30b)

# DGX-25: NPC and Mentor Dialogue Pipeline Report

## Findings

The repository contains a structured JSON file defining mentor NPCs for the MiraVerse children's cultural game program. The data is versioned at `v1.2.0` and includes:

- **Five distinct mentors**, each with:
  - Unique `npc_id`
  - Country of origin (`LB`, `IQ`, `EG`, `FR`, `KR`)
  - Name, role, dialect locale
  - Portrait URL (pointing to `/art/v08/portraits/`)
  - Epistemic framing lines covering mythology, historical claims, contested history, civic remembrance, inclusive hospitality, craft safety, allergy and kitchen safety, cultural interpretation, and food/allergen safety

The document ensures **non-destructive extension** of existing mentors (v0.8/v1.1), maintains strict privacy by using **scripted choices only**, and includes no free-text personal data input.

### Key Observations
- Mentors are grouped into distinct roles: Archivist, Master, Chef, Grand-mère.
- All epistemic framing lines are **contextualized with cultural or historical nuance** to support educational storytelling.
- No mention of runtime behavior, dialogue flow logic, or integration points with Roblox systems (e.g., Quests, Dialogue UI).
- No schema for dialogue trees, branching logic, or interaction mechanics is provided.

---

## Specification

### Scope: NPC and Mentor Dialogue Pipeline
The system must:
1. **Load mentor data** from `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`
2. **Support scripted oral-history exchanges**, respecting privacy guardrails.
3. **Render mentor portraits** from paths defined in `portrait_url`.
4. **Provide epistemic framing lines** as part of dialogue scaffolding, not direct user prompts.

### Input
- JSON file: `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`
- Art assets: `/art/v08/portraits/*.svg`

### Output
- Mentor data object for each NPC:
  ```json
  {
    "npc_id": "npc-lb-teta-yasmine",
    "country": "LB",
    "name": "Teta Yasmine",
    "role": "Byblos Coastal Archivist & Cedar Storykeeper",
    "dialect_locale": "ar-LB",
    "portrait_url": "/art/v08/portraits/LB-mentor.svg",
    "epistemic_framing_lines": {
      "mythology": "...",
      "historical_claim": "...",
      "privacy_safe_oral_history": "..."
    }
  }
  ```

### Interface
- A JSON loader that returns an array of mentor objects.
- Support for `npc_id` lookups.
- No outputting dialogue trees or runtime logic; only data structure.

---

## Files Implementation Would Own

1. **Data loader script** (e.g., `mentor-data-loader.ts`)
2. **NPC dialog pipeline module** (`npc-dialogue-pipeline.ts`)
3. **Mentor UI component** (`mentor-ui-component.tsx`) – NOT TESTED due to no Roblox access
4. **Dialogue choice handler** – NOT TESTED

---

## Dependencies

- `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`
- `/art/v08/portraits/*.svg` (for mentor portraits)
- No external libraries or runtime dependencies assumed.

---

## Open Gaps

### Not Specified in Repository
- Dialogue branching logic
- UI integration (e.g., Roblox `Dialog` or `TextButton` behavior)
- How epistemic framing lines are used in actual conversation flow
- Integration with Quests or game mechanics
- Localization of dialogue content beyond dialect locale (`dialect_locale`)
- How privacy-safe choices are implemented in-game

### Cultural / Historical Claims Requiring Human Review
- Mythology (e.g., Isis and Adonis)
- Historical claims about Ahiram sarcophagus, Hunayn ibn Ishaq, Al-Mutanabbi Street, Cairo lanterns, Lyon traboules, bibimbap origins
- Traditions around khayamiya geometry, Bouchon kitchens, fermented Korean cuisine

### Not Testable Without Runtime Access
- Mentor portrait rendering
- Dialogue UI behavior
- Interaction flow with mentor NPCs
- Choice-based oral history exchange functionality

--- 

**Final Note**: This report is based solely on the provided JSON excerpt. Truncation may have affected full enumeration of fields or structure.
