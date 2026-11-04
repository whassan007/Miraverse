# DGX-40: France v1.2 act-to-quest ID reconciliation

Backend: dgx (qwen3-coder:30b)

# France v1.2 Act-to-Quest ID Reconciliation Report  
**Worker DGX-40 | MiraVerse Children's Cultural Game Program (Roblox First)**  
**Scope**: France v1.2 act-to-quest ID reconciliation  
**Status**: READ-ONLY wave  

---

## ✅ Findings

### 1. **France Quests and Acts Mapping**
The `FR.json` file defines the legacy quest structure for France, which includes:
- `questId`: `FR:ch1:bakery:main`
- 5 objectives (gather, trade, build, cook, word) each with a unique ID
- Each objective is mapped to a challenge type (`gather`, `trade`, etc.)

### 2. **Missing Act-Level IDs**
There are no act-level identifiers in the `FR.json` file.
- No `act_id`, `act_number`, or `legacy_quest_id` fields exist for France in this file.
- This makes reconciliation impossible without additional source files from the `content/v12/quest-enrichment/` path.

### 3. **No Matching Act Structure**
The structure of `FR.json` does not match that of `LB.json` (Lebanon), which defines full acts with variations, legacy IDs, and mentor information.

---

## 📋 Implementation-Ready Specification

### Reconciliation Goal:
Map France's legacy quest system (`FR:ch1:bakery:main`) to the new act-based system in v1.2 where each `act_id` corresponds to one or more objectives.

### Assumptions:
- Each objective (gather, trade, build, cook, word) will map to a separate act.
- The `legacy_quest_id` and `legacy_objective_id` fields from `FR.json` are used as references in the new structure.
- France is treated as an independent country in v1.2.

### Proposed Mapping:
| Legacy Objective ID             | Proposed Act ID   | Challenge Type |
|----------------------------------|-------------------|----------------|
| FR:ch1:bakery:gather            | FR-A01            | gather         |
| FR:ch1:bakery:trade             | FR-A02            | trade          |
| FR:ch1:bakery:build             | FR-A03            | build          |
| FR:ch1:bakery:cook              | FR-A04            | cook           |
| FR:ch1:bakery:word              | FR-A05            | word           |

> Note: These are speculative `act_id`s based on the existing pattern (e.g., LB-A01, LB-A02), and actual IDs should be assigned during implementation.

---

## 📁 Files a Later Implementation Would Own

### Required Files:
1. **New Act Definition File**  
   - Path: `content/v12/quest-enrichment/act-definitions/FR-A01.json`  
   - Content: Define act structure with title, mentor, variations, safety flags, etc., mirroring LB files.

2. **Act-to-Quest Mapping Registry (if needed)**  
   - Path: `content/v12/quest-enrichment/act-mapping/fr-legacy-map.json`  
   - Purpose: Link `FR-A01` → `FR:ch1:bakery:gather`, etc.

3. **Country-Specific Metadata File**  
   - Path: `content/v12/country/fr-metadata.json`  
   - Purpose: Define country-wide metadata (e.g., cultural facts, landmarks).

---

## ⚙️ Dependencies

- `content/v12/quest-enrichment/quest-acts-v12.json`: Must reference the new act IDs.
- `content/quests/FR.json`: Used for legacy objective mapping; must be reconciled with new system.
- `content/v12/knowledge/` and `content/v12/npc/`: Likely need updates to match new NPC roles or knowledge unlock IDs.

---

## ❓ Open Gaps

| Gap | Description |
|-----|-------------|
| Missing `act_id`s in FR.json | Cannot perform direct reconciliation without act-level data. |
| No French-specific act variations defined | Need to define age-based learning objectives, narrative hooks, etc., similar to Lebanon. |
| Cultural Facts & Legend Clarification Needed | Need human review for historical accuracy of galette des rois, Lyon architecture, and traboule traditions. |
| Legacy Objective Mapping Not Explicitly Defined | Unclear how each objective maps to act-level variation logic (e.g., 5-7 vs 8-10 age groups). |

---

## 🧠 Notes

- This is a **READ-ONLY** report. No changes can be made.
- Files provided are truncated; full content not available.
- All claims based strictly on repository excerpts.
- Any runtime behavior (e.g., NPC interactions, UI elements) marked as **NOT TESTED**.

--- 

**End of Report**
