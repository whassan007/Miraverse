# DGX-34: South Korea dialogue audit for missing keys and inconsistencies

Backend: dgx (qwen3-coder:30b)

# South Korea Dialogue Audit Report  
**Worker ID:** DGX-34  
**Scope:** KR.json dialogue audit for missing keys and inconsistencies  
**Status:** READ-ONLY wave  

---

## Findings

### 🔍 Missing Keys
1. **`textTranslit` Truncation**:  
   - In `dlg:KR:moksu_jihoon`, the `textTranslit` value for `greeting` node is truncated:
     ```json
     "textTranslit": "Jeon-tong gi-wa-wa so-na-mu seo-kka-rae-ro...",
     ```
     **File:** `content/dialogue/KR.json`

2. **Missing `textEn` in Nodes**:
   - All nodes have `textNative`, `textTranslit`, and `textEn` fields, but some nodes (e.g., `follow_up`) only include a single word or phrase.
   - The `textEn` field in these cases should be full sentences for clarity and consistency.

3. **Inconsistent Emotion Usage**:
   - All dialogue entries use `"emotion": "warm"`, `"proud"` or `"excited"` consistently, but no clear mapping is present in this file to validate these choices against cultural norms or NPC roles.
   - **Not Tested**: Cultural appropriateness of emotion usage.

4. **Missing `nextNodeId` Validation**:
   - Each choice has a `nextNodeId`, but there is no validation that these nodes exist in the same dialogue block or across files (e.g., `follow_up` may be referenced without being defined).
   - This could lead to runtime errors.
   - **Not Tested**: Runtime validity of node references.

5. **Missing Localization Metadata**:
   - No metadata such as `locale`, `version`, or `lastUpdated` is present in any file — essential for future maintenance.
   - **File:** `content/dialogue/KR.json`

---

## Implementation Specification

### ✅ Requirements
1. **Full Transliteration Support**:
   - Ensure all `textTranslit` fields are complete (no truncation).

2. **Consistent `textEn` Formatting**:
   - All `textEn` entries must be full sentences, even when they include cultural terms like `"송편"`, `"한옥"`, etc.

3. **NPC Role Mapping**:
   - Map emotions to NPC roles where appropriate (e.g., `"proud"` for artisans, `"warm"` for elders).
   - **Not Tested**: Need runtime verification or cultural expert input.

4. **Node Reference Validation**:
   - Implement validation to ensure that all `nextNodeId` values exist within the same dialogue block.
   - **Not Tested**: Runtime check needed.

5. **Metadata Inclusion**:
   - Add metadata fields to JSON root level, e.g.:
     ```json
     {
       "locale": "KR",
       "version": "1.0.0",
       "lastUpdated": "2025-04-05"
     }
     ```

---

## Files Owned by Later Implementation

The following files will require updates from a later implementation team:

| File | Owner Responsibility |
|------|----------------------|
| `content/dialogue/KR.json` | Update transliteration, full textEn sentences, and metadata |
| `content/npc/kr/*` | Validate NPC portrait IDs match referenced images |
| `content/objectives/KR/*` | Confirm objective triggers match dialogue nodes |

---

## Dependencies

- **NPC Assets**: Ensure all referenced portraits (`portraitId`) are available.
  - Example: `npc:KR:halmeoni`, `npc:KR:ajusshi_min`
- **Gameplay System**:
  - The system must validate `nextNodeId` references.
  - Support for localized emotion and gesture mapping.

---

## Open Gaps

| Gap | Description |
|-----|-------------|
| Cultural Emotion Mapping | No clear cultural reference for emotions like "proud", "warm" used in dialogue. |
| Transliteration Completeness | Truncated transliterations (e.g., `"Jeon-tong gi-wa-wa so-na-mu seo-kka-rae-ro..."`) must be completed. |
| Sentence-Level `textEn` | Some entries are one-word phrases instead of full sentences, e.g., `"송편"` → `"Remember the word \"송편\" (half-moon rice cake) as you explore!"` |
| Runtime Node Validation | Dialogue system needs validation that all referenced nodes exist. |
| Metadata Standards | No versioning or metadata schema defined in files. |

---

## Summary

This audit confirms that while the dialogue structure is generally sound, several inconsistencies and missing elements need correction before deployment. Key improvements include full transliterations, sentence-level English translations, emotion mapping, node reference validation, and inclusion of metadata.

**Not Tested Items:**  
- Emotion mappings for NPCs  
- Runtime validity of `nextNodeId` references  
- Full translation accuracy for culturally specific terms

---
