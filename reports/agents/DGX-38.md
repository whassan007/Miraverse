# DGX-38: Iraq v1.2 act-to-quest ID reconciliation

Backend: dgx (qwen3-coder:30b)

# MiraVerse Iraq v1.2 Act-to-Quest ID Reconciliation Report  
**Worker:** DGX-38  
**Scope:** Iraq v1.2 act-to-quest ID reconciliation (READ-ONLY)  

---

## ✅ Findings

The Iraq v1.2 content defines a single quest (`IQ:ch1:shanasheel:main`) with five distinct objectives, each mapped to a specific challenge type (`gather`, `trade`, `build`, `cook`, `word`). No act-level structure is defined for Iraq in the provided files — only the base quest and its objectives.

There is no evidence of:
- Any act identifiers (e.g., `IQ-A01`) in the repository.
- Mapping between legacy IDs (`IQ:ch1:shanasheel:main`) and new act IDs.
- Legacy quest or objective IDs for Iraq being used in `quest-acts-v12.json`.

The structure in `quest-acts-v12.json` is defined for Lebanon only, with no corresponding Iraq acts.

---

## 📌 Implementation-ready Specification

### Reconciliation Scope:
- **Target:** Map legacy Iraq quest and objective IDs to new act structure if needed.
- **Assumption:** Iraq does not yet have an act structure in v1.2; all content is mapped directly to objectives under `IQ:ch1:shanasheel:main`.

### Required Mapping (if implemented):
| Legacy ID                         | New Act ID (Proposed) | Notes |
|----------------------------------|------------------------|-------|
| `IQ:ch1:shanasheel:main`         | `IQ-A01`               | Base quest → act |
| `IQ:ch1:shanasheel:gather`       | `IQ-A01-O01`           | Gather objective |
| `IQ:ch1:shanasheel:trade`        | `IQ-A01-O02`           | Trade objective |
| `IQ:ch1:shanasheel:build`        | `IQ-A01-O03`           | Build objective |
| `IQ:ch1:shanasheel:cook`         | `IQ-A01-O04`           | Cook objective |
| `IQ:ch1:shanasheel:word`         | `IQ-A01-O05`           | Word objective |

---

## 📁 Files to Own (Later Implementation)

- **New act definitions** for Iraq in:
  - `content/v12/quest-enrichment/quest-acts-v12.json`
- **Legacy ID mapping** in:
  - `content/v12/quest-enrichment/legacy-mapping.json` *(if exists)*
- **Translation and localization files** for new Iraq acts.

---

## ⚠️ Dependencies

- **Localization files** for act and objective titles (e.g., `en`, `ar-IQ`, etc.) must exist in:
  - `content/v12/translations/quest-acts-iq.json`
- **NPC, landmark, and item references** must be defined in:
  - `content/npcs.json`
  - `content/landmarks.json`
  - `content/items.json`

---

## ❓ Open Gaps

### Cultural or Historical Facts
- No historical or cultural facts are included for Iraq content beyond the basic Kleicha and Shanasheel context.
- No information on:
  - **Tigris River significance**
  - **Historical use of shanasheel architecture**
  - **Bibi Amal as a real historical figure**
  - **Eid kleicha traditions in Baghdad**

> These need human review and are marked as **GAP**.

### Language & Vocabulary
- No translations provided for:
  - `شناشيل`
  - `كليجة`
  - `دجلة`
  - `هيل`

> These must be verified or added by cultural consultants.

### Runtime Validation Needed
- **NPC behavior and dialogue**
  - Not testable in this environment.
  - Marked as **NOT TESTED**.

---

## 📌 Summary

This is a **READ-ONLY** reconciliation wave. No files were edited, committed, or deployed.

- Iraq v1.2 content currently exists only at the quest/objective level; no act structure is defined.
- The scope of reconciliation is to propose mapping legacy IDs to new act format if required.
- All claims are based on repository data and file excerpts provided.
- Cultural facts, translations, and runtime behavior require human or Studio validation.

--- 

**End of Report**
