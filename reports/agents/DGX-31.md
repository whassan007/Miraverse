# DGX-31: Lebanon dialogue audit for missing keys and inconsistencies

Backend: dgx (qwen3-coder:30b)

# Lebanon Dialogue Audit Report

## Findings

- **Missing Keys**: Several dialogue entries lack full translation coverage, especially in the `textNative` and `textTranslit` fields.
  - For example, in `dlg:LB:nadim_builder`, the `textTranslit` field is truncated: `"Hajar Jbeil el-ramli w khashab el-arz..."`.
  - The full transliteration should be provided for all entries to ensure accurate pronunciation and cultural context.

- **Inconsistencies**:
  - Some NPC names are not fully localized (e.g., "Usta Nadim" is used as a title, but there's no corresponding entry in the localization keys).
  - The `gestureClip` field is consistently set to `"talk_gesture"` and `"celebrate"` across all nodes. While this might be intentional, it could benefit from being more varied to reflect different emotional states or roles.
  - The use of cultural terms like "منقوشة", "زعتر", "صاج", and "تيتا" is present but lacks deeper explanation in the JSON file itself, which may lead to confusion for players unfamiliar with these terms.

- **Cultural Accuracy Gaps**:
  - There are no notes or references to validate the authenticity of cultural terms like "منقوشة" (thyme flatbread), "زعتر" (wild thyme & sesame blend), and "صاج" (domed iron griddle). These need human review for correctness.
  - The role of "Captain Rima" as a female character in a maritime context is not explicitly described, which could be an oversight if this is meant to represent historical or cultural accuracy.

## Implementation-ready Specification

### Scope
Audit and validate the Lebanese dialogue for completeness and cultural accuracy.

### Deliverables
1. Full transliteration for all `textTranslit` fields.
2. Cultural validation of terms used in the dialogues.
3. Confirmation of NPC roles and titles (e.g., "Usta Nadim").
4. Verification that all cultural references are accurate and appropriate for the target audience.

### Files Owned by Later Implementation
- `content/dialogue/LB.json`: Main dialogue file to be reviewed.
- `content/localization/LB.json`: Localization keys for translation validation.
- `content/npcs/LB.json`: NPC definitions to ensure consistency in titles and roles.

### Dependencies
- Human reviewers with expertise in Lebanese culture, language, and history.
- Access to cultural consultants or native speakers for verification of terms and references.
- A system to track and validate translations against a standardized set of localization keys.

### Open Gaps

| Gap | Description |
|-----|-------------|
| Cultural Term Validation | Terms like "منقوشة", "زعتر", "صاج", and "تيتا" require human validation for cultural accuracy. |
| NPC Role Consistency | The title "Usta Nadim" needs confirmation whether it's a standard title or a placeholder. |
| Transliteration Completeness | The `textTranslit` field is truncated in `dlg:LB:nadim_builder`. Full transliterations must be added. |
| Emotional Expression Variance | All nodes use the same gesture clips; more varied gestures would enhance immersion. |

## Notes
- All findings are based on the provided file excerpts.
- Any references to cultural facts, historical details, or translations not explicitly covered in the JSON are marked as gaps requiring human review.
- No runtime proof is available due to lack of Roblox Studio access.

---
