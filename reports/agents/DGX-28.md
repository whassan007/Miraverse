# DGX-28: European language and fallback validation

Backend: dgx (qwen3-coder:30b)

# MiraVerse - European Language & Fallback Validation Report  
**Worker DGX-28 – Cultural Game Program (Roblox First)**  

---

## 🔍 Findings

### ✅ Language Coverage
- The `fr.json` locale file contains translations for all UI elements in French.
- No evidence of additional language files (`en.json`, `es.json`, etc.) present in the provided snippet.

### ⚠️ Missing Translations or Inconsistencies
- Some keys are marked as **not translated yet** (e.g., "Passport" and related terms) — may require confirmation from human review.
- The term **"Mentor"** appears untranslated; no key like `home.card.mentor` in `fr.json`.
- The `play.challenge.word` key is present but has no fallback for other languages.

### 🧩 Fallback Validation
- No fallback logic visible in the codebase from this snippet.
- No indication of a default language (`en`) being used if translation keys are missing in current locale (e.g., `fr`).

---

## 🛠️ Specification: European Language Scope

### ✔ Implementation Requirements

1. **Locale File Support**
   - Ensure all supported languages have corresponding `.json` files.
     - Example: `en.json`, `es.json`, `de.json`, etc.
   - All keys must be present in each locale or fall back gracefully to a default language.

2. **Fallback Logic**
   - Implement a fallback mechanism:
     - If a key is missing from the current language file, use English (`en`) as the default.
     - If no translation exists even in `en`, return the original key (e.g., `"play.challenge.gather"`).

3. **Missing Keys Identification**
   - Identify untranslated keys using a linter or script that compares all locales against a reference (`en.json`).
   - Log missing keys for review.

4. **UI Consistency**
   - All UI elements must have consistent keys across languages.
   - Key names should be descriptive and non-ambiguous (e.g., avoid `home.card.mentor`, which seems to lack translation).

---

## 📁 Files Ownership

### 🔧 Implementation Owned By:
| Component | File / Folder |
|----------|---------------|
| i18n Core Logic | `/apps/web/src/i18n/` |
| Language Switching UI | `/apps/web/src/components/LanguageSwitcher.tsx` |
| Locale JSONs | `/apps/web/src/i18n/locales/` |

### 📦 Dependencies
- `i18next` or similar i18n library (not shown in snippet).
- No explicit usage of fallback libraries seen.

---

## ❗ Open Gaps

### 🧠 Cultural / Historical Content
- The following content requires human review:
  - **Countries listed**: LB, EG, IQ, KR, FR – no further cultural context provided.
  - **Story elements**, such as "familial stories", are not detailed.
  - **Challenge tasks** (gather, cook, build) need culturally accurate representations.

### 🗣️ Translation Gaps
- Keys like `home.card.mentor`, `story.vocab.word`, and others may be untranslated in French.
- No fallback key validation implemented in this snippet.
  
### 🔁 Runtime Validation
- Language switching logic not visible.
- No confirmation that UI elements dynamically update with new language settings.
  - NOT TESTED

---

## 🧾 Summary

| Category | Status |
|---------|--------|
| Translations Present | ✅ French (`fr.json`) available |
| Missing Translations | ⚠️ Identified, needs human review |
| Fallback Mechanism | ❌ Not implemented or visible |
| Language Switching UI | ❓ Not seen in snippet |
| Runtime Validation | NOT TESTED |

---

**Note**: This report is based on the provided file excerpts and does not reflect full repository content. Truncation may have affected visibility of some fields.
