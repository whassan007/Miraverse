# DGX-36: Lebanon v1.2 act-to-quest ID reconciliation

Backend: dgx (qwen3-coder:30b)

# Lebanon v1.2 Act-to-Quest ID Reconciliation Report

## Findings

The current scope involves reconciling act IDs (`LB-A01`, `LB-A02`, `LB-A03`) from `quest-acts-v12.json` with legacy quest and objective IDs in `LB.json`.

### Key Observations:
1. **Legacy Quest Mapping:**
   - All three acts map to the same legacy quest ID: `"LB:ch1:harbor:main"`
2. **Legacy Objective Mapping:**
   - `LB-A01`: Maps to `"LB:ch1:harbor:gather"` (gather challenge)
   - `LB-A02`: Maps to `"LB:ch1:harbor:trade"` (trade challenge)
   - `LB-A03`: Maps to `"LB:ch1:harbor:cook"` (cook challenge)

### Inconsistencies:
- The legacy objectives (`LB:ch1:harbor:gather`, etc.) do not align with act numbers directly; they map by challenge type, not act number.
- `LB-A03` is mapped to the "cook" objective, which is consistent with its narrative hook ("Teta’s Saj Kitchen") but does not have a corresponding challenge in `LB.json` for "cook".
  - **Note**: The file `LB.json` contains an objective `"LB:ch1:harbor:cook"` (challengeType: cook), however it's not listed as one of the main objectives in the quest.
- There is no clear mapping for:
  - `LB-A01` → "build" or "word"
  - `LB-A02` → "build" or "word"
  - `LB-A03` → "build" or "word"

### Data Integrity Notes:
- All acts are marked with correct country code `LB`.
- Mentor IDs, NPC names, and supporting NPCs match across files.
- Knowledge IDs referenced in acts are consistent with expected knowledge base entries.

## Specification

### Implementation-ready Mapping Table

| Act ID    | Legacy Quest ID         | Legacy Objective ID       | Challenge Type |
|-----------|--------------------------|----------------------------|----------------|
| LB-A01    | LB:ch1:harbor:main       | LB:ch1:harbor:gather      | gather         |
| LB-A02    | LB:ch1:harbor:main       | LB:ch1:harbor:trade       | trade          |
| LB-A03    | LB:ch1:harbor:main       | LB:ch1:harbor:cook        | cook           |

### Assumptions
- `LB-A01` refers to the initial gathering challenge.
- `LB-A02` refers to the market trade challenge.
- `LB-A03` refers to the cooking challenge (even though it's not explicitly listed in `LB.json` as a top-level objective).
- The remaining objectives (`build`, `word`) are not directly mapped to any acts in this reconciliation wave.

## Files Ownership

### Owned by Future Implementation
- `content/v12/quest-enrichment/quest-acts-v12.json`: Already complete; needs no modification.
- `content/quests/LB.json`: May need updated with additional challenge types or corrected mappings.

## Dependencies

- **Knowledge Base**: Ensure `LB-KB-*` entries exist for:
  - `LB-KB-PLACE-BYBLOS-PORT`
  - `LB-KB-MYTH-ISIS-OSIRIS-TREE`
  - `LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS`
  - `LB-KB-MYTH-ADONIS-AFQA-RIVER`
  - `LB-KB-THEME-PORTABLE-ARCHIVE-DIASPORA`

## Open Gaps

### Cultural/Historical Context
- The myth of Isis/Osiris tree and Adonis river are not fully explained in these files. Human review required for accurate interpretation.
- No information on whether the "cook" objective in `LB.json` should be included as a separate act (e.g., `LB-A04`) or if it's already implicitly covered.

### Technical
- **Runtime Validation Needed**:
  - The mapping from `LB-A03` to `"LB:ch1:harbor:cook"` cannot be verified without runtime access — NOT TESTED.
  - Whether the "cook" objective exists in the game context not testable in this read-only environment.

### Language Support
- Translations for all languages (en, fr, ar-LB, ar-EG, ar-IQ, ko) are present and appear consistent across files.
- No evidence of missing language support detected.

---

**Final Note:** This reconciliation is valid based on available data. Further implementation must validate runtime behavior and ensure all mappings function correctly within the Roblox environment.
