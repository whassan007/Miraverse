# DGX-24: Question distribution and answer validation

Backend: dgx (qwen3-coder:30b)

# DGX-24 Report: Question Distribution and Answer Validation Scope

## Findings

The current dialogue data from `content/dialogue/LB.json` contains four distinct NPCs in Lebanon, each with a greeting node and a follow-up node. The follow-up nodes introduce specific cultural terms:

1. **Teta Nahla (mentor)**:
   - Introduces "منقوشة" (thyme flatbread)
   - Cultural reference: za'atar man'oushe

2. **Amo Farid (vendor)**:
   - Introduces "زعتر" (wild thyme & sesame blend)
   - Cultural reference: wild mountain thyme, sumac, olive oil

3. **Usta Nadim (artisan)**:
   - Introduces "صاج" (domed iron griddle)
   - Cultural reference: limestone harbor arch, cedar beams

4. **Captain Rima (neighbor)**:
   - Introduces "تيتا" (grandmother)
   - Cultural reference: fishing boats, harbor

## Implementation Specification

### Question Distribution
- **Source**: Each NPC's follow-up node contains a culturally significant word to remember.
- **Format**: Multiple-choice questions with options based on the introduced term.
- **Trigger**: Questions are presented upon completing the associated objective (e.g., `LB:ch1:harbor:gather`).

### Answer Validation
- **Correct Answer**: The exact term introduced by the NPC in the follow-up node.
- **Validation Logic**:
  - Match user input against the culturally significant word from the NPC's follow-up text.
  - Accept case-insensitive matches.

## Files for Implementation

1. `content/questions/LB.json` - To store question sets per NPC and cultural term.
2. `src/gameplay/quest_system.js` - To trigger questions upon objective completion.
3. `src/gameplay/answer_validation.js` - To validate user input against correct answers.

## Dependencies

- **NPC Dialogue System**: Requires existing dialogue engine to support node-based triggers.
- **Objective Tracking**: Needs implementation of objective system for `triggersObjectiveId`.
- **Localization Engine**: To handle translations (`textEn`, `textTranslit`, `textNative`).

## Open Gaps

### Cultural & Historical Facts
- No information provided on:
  - Exact historical context of the limestone harbor arch.
  - Specific usage of "منقوشة" (thyme flatbread) in local cuisine.
  - Regional significance of "زعتر" blends.
  - Traditional use of "صاج" griddles.

### Translations & Terminology
- Missing translations for:
  - "منقوشة" (flatbread recipe)
  - "زعتر" (herb blend)
  - "صاج" (griddle type)
  - "تيتا" (grandmother term)

### Question Answers
- No predefined correct answers in the current data.
- Need human review to validate:
  - Cultural accuracy of terms.
  - Correctness of answer choices for each question.

### Runtime Proofs
- Any integration with Roblox game mechanics NOT TESTED due to lack of Studio access.
- Objective completion triggers and dialogue flow NOT TESTED.

## Notes

- The file `content/dialogue/LB.json` is truncated; full content may contain additional NPCs or nodes.
- All cultural references must be verified by human experts for accuracy.
- Original content only; no third-party assets are used.
