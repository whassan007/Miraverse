# DGX-35: France dialogue audit for missing keys and inconsistencies

Backend: dgx (qwen3-coder:30b)

# France Dialogue Audit Report – DGX-35

## Findings

### Missing Keys

1. **`textNative` for `greeting` node of `dlg:FR:lucas_musician`**:
   - The `textNative` field is truncated (`"Traversez la traboule secrète, la fête commence bientôt !"`), but the actual content may be cut off or incomplete. See [content/dialogue/FR.json#L56](file:///content/dialogue/FR.json#L56).

2. **`textTranslit` for `follow_up` node of `dlg:FR:camille_mason`**:
   - The transliteration is truncated (`"fev"`), which does not match the French word `"fève"`.

3. **`choices` missing `labelNative` in all entries**:
   - All choices (e.g., `accept_help`) lack a `labelNative` field, which is required for localization support.

4. **Missing `textTranslit` for all dialogue nodes**:
   - While the `textTranslit` field exists, it is missing or incomplete for many entries, particularly in the `follow_up` nodes.

### Inconsistencies

1. **Inconsistent Emotion Tags**:
   - `greeting` nodes have consistent emotions (e.g., `warm`, `excited`) but `follow_up` nodes consistently use `proud`.

2. **Inconsistent Naming of NPCs in Dialogue vs. Metadata**:
   - For example, `npcName` is `"Lucas le Musicien"` but the `speakerName` uses a full title (`"Lucas le Musicien"`). This isn't an error per se, but could be inconsistent if the same NPC name should be reused elsewhere.

3. **Inconsistent Word Choices in `follow_up` Nodes**:
   - The `textEn` fields in `follow_up` nodes use different terms for memorization cues: `"boulangerie"`, `"galette"`, `"fève"`, and `"couronne"` — but there is no explicit definition of these terms in the dialogue itself.

4. **Missing `triggersObjectiveId` Usage Verification**:
   - While `triggersObjectiveId` fields are present, their implementation or linkage to objectives isn't checked here (e.g., `FR:ch1:bakery:gather`, `FR:ch1:bakery:trade`, etc.). These are not tested but need confirmation in runtime.

5. **Missing Cultural/Geographical Contextual Fidelity**:
   - Several terms like `"traboule"`, `"galette des rois"`, and `"fève"` are culturally specific but lack in-game explanation or glossary entries.
   - Notably, `"couronne"` (crown) is not contextually explained for a child audience.

## Specification

### Implementation-ready Scope

- Audit all `textNative` fields for completeness and truncation.
- Ensure `textTranslit` is fully accurate and matches the native text.
- Add missing `labelNative` to all choices.
- Validate that each `triggersObjectiveId` maps to an actual objective in the game.
- Confirm cultural fidelity of terms like `"fève"`, `"galette des rois"`, `"traboule"` through human review or reference material.

### Files Ownership

The following files will need updates by the implementation team:

1. [content/dialogue/FR.json](file:///content/dialogue/FR.json) – Core dialogue content.
2. Any corresponding objective definition files, e.g., `content/objectives/FR/ch1_bakery.json` (not provided).
3. Glossary or contextual explanation files for cultural terms (e.g., `glossary/fr.json`).

### Dependencies

- A complete list of objectives (`triggersObjectiveId`) must be available in the repository.
- A glossary or definition file for French cultural terms is needed for accurate localization.
- Runtime proof required for objective trigger behavior.

## Open Gaps

| Gap | Description |
|-----|-------------|
| `textNative` truncation | Incomplete content, especially for `lucas_musician`. |
| `textTranslit` accuracy | Especially for `camille_mason`'s `follow_up` node. |
| Missing `labelNative` | Required for all choices in `choices` array. |
| Cultural context | Terms like `"fève"` and `"traboule"` need definition or explanation. |
| Objective linkage | No runtime validation of `triggersObjectiveId`. |
| Transliteration consistency | Not all fields have proper transliterations. |

## Final Notes

- The current files are read-only; no edits were made.
- Runtime behavior (e.g., objective triggering, UI display) is **NOT TESTED**.
- All cultural and historical references should be validated with human review.

---
