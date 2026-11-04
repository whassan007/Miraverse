# DGX-37: Egypt v1.2 act-to-quest ID reconciliation

Backend: dgx (qwen3-coder:30b)

# Egypt v1.2 Act-to-Quest ID Reconciliation Report  
**Worker:** DGX-37  
**Scope:** Egypt v1.2 act-to-quest ID reconciliation (READ-ONLY wave)  

---

## ✅ Findings

### 1. **Act ID Mapping to Quest IDs**
- The `act_id` in `content/v12/quest-enrichment/quest-acts-v12.json` does **not** directly map to the `questId` in `content/quests/EG.json`.
- For example:
  - `LB-A01`, `LB-A02`, and `LB-A03` are **Lebanon-related acts**, not Egypt.
  - The Egypt-related content is found under `questId`:  
    ```json
    "questId": "EG:ch1:lantern:main"
    ```
    This is a **single quest** with multiple objectives (`gather`, `trade`, `build`, `cook`, `word`), not mapped to acts directly.

### 2. **Legacy Quest ID Mapping**
- In the Lebanon act data, legacy IDs are:
  ```json
  "legacy_quest_id": "LB:ch1:harbor:main",
  "legacy_objective_id": "LB:ch1:harbor:gather"
  ```
- These do not match any Egypt quest IDs in `content/quests/EG.json`.

### 3. **Missing Reconciliation Data**
- No mapping exists from `act_id` → `questId` for Egypt-related content.
- The current data only includes:
  - `LB-A01`, `LB-A02`, `LB-A03`: Lebanon acts
  - `EG:ch1:lantern:main`: Egypt quest (but not split into acts)

---

## 📐 Specification

### ✅ Target Scope
Reconcile **Egypt v1.2** act IDs to existing or future quests, based on the data provided.

### ❌ No Direct Mapping Found
- The file `content/v12/quest-enrichment/quest-acts-v12.json` contains only Lebanon acts.
- Egypt content is in `content/quests/EG.json`.
- There is **no reconciliation** between `act_id`s and `questId`s for Egypt.

---

## 🗂️ Files That Would Own This Scope

### 1. **Future Implementation Ownership**
These files would be owned by a later implementation team:
```
content/v12/quest-enrichment/quest-acts-v12.json
content/quests/EG.json
```

### 2. **Reconciliation Data Source**
This file will need to be updated with Egypt act ↔ quest mappings:
```
content/v12/quest-enrichment/quest-acts-v12.json  (Egypt section)
```

---

## ⚠️ Dependencies

- **Human Review Required**: 
  - Mapping of Egypt acts to `questId`s (e.g., does `EG-A01` map to `EG:ch1:lantern:main`?)
  - Cultural and historical facts (e.g., koshari origins, fanous traditions) must be confirmed by experts.

---

## 🕳️ Open Gaps

| Gap | Description |
|-----|-------------|
| ❌ No Egypt acts in `quest-acts-v12.json` | The file only contains Lebanon acts (`LB-A01`, `LB-A02`, `LB-A03`). |
| ❌ No act-to-quest mapping for Egypt | No reconciliation between act IDs and `questId`s. |
| ❌ Missing Egypt-specific quest structure | No evidence of how `EG:ch1:lantern:main` would be split into acts. |
| ❓ Historical Context Required | Cultural facts about koshari, lanterns, Nile, etc., are not confirmed in the repo. |

---

## 🧾 Summary

- The **current data does not contain Egypt acts** (`EG-A01`, etc.) in `quest-acts-v12.json`.
- The **only Egypt-related content is found in `EG.json`**, which represents a single quest with multiple objectives.
- No reconciliation exists between act IDs and quest IDs for Egypt.
- A **reconciliation mapping** must be created by future implementation teams.

---

## 🔒 Final Note

> This report is based **only** on the provided file excerpts.  
> Any runtime behavior, visual design, or actual gameplay logic is **NOT TESTED** and must be validated later.
