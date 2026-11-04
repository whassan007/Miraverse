# DGX-26: Arabic dialect and RTL validation

Backend: dgx (qwen3-coder:30b)

# DGX-26 Report: Arabic Dialect and RTL Validation  
**Scope:** Arabic dialect (ar-LB) and RTL validation for MiraVerse children's cultural game program (Roblox first)  
**Status:** READ-ONLY wave  

---

## 🔍 Findings

### 1. **Locale Configuration**
- File: `content/v12/locales/ar-LB/lebanese-dialect-qa.json`
- The locale is correctly set to `ar-LB` with direction `rtl`.
- The dialect preservation note confirms that terms like "تيتا", "منقوشة"، "حوش"، and "مينا جبيل" are intentionally kept in Lebanese Arabic, not standardized Modern Standard Arabic (MSA).

### 2. **Dialect Terms Preservation**
- All dialect terms listed under `dialect_preserved_terms` are specific to Lebanese Arabic:
  - `"تيتا"` (grandmother)
  - `"منقوشة عالصاج"` (za’atar flatbread)
  - `"حوش الحجر"` (stone courtyard)
  - `"مينا جبيل"` (Byblos harbor)
  - `"أبجدية فينيقية"` (Phoenician alphabet)
  - `"أرشيف متنقل"` (portable archive)

These are accurately preserved and not translated into MSA or other dialects, aligning with the project's intent.

### 3. **Historical Language Note**
- The file includes a note explaining that historical figures like King Ahiram spoke ancient Phoenician, while in-game characters speak modern Lebanese Arabic.
- This distinction is important for cultural authenticity and not present in other locales.

---

## 🛠️ Implementation Specification

### ✅ Requirements
- All UI elements using `ar-LB` locale must render text in right-to-left (RTL) direction.
- Text strings must use native dialect terms from the `dialect_preserved_terms` list without substitution into MSA or common dialects.
- The term `"تيتا"` should **never** be replaced with `"جدة"` in dialogue.

### 🧩 Files Ownership
The following files are owned by implementation teams for future deployment:
- `content/v12/locales/ar-LB/lebanese-dialect-qa.json` (already reviewed)
- Game UI localization assets referencing dialect terms
- Dialogue scripting files that use dialect-specific vocabulary

### ⚙️ Dependencies
- Localization engine must support RTL rendering.
- Game UI components must be configured to dynamically switch layout direction based on `direction: "rtl"` in JSON locale config.

---

## 🕳️ Open Gaps

| Gap | Description |
|-----|-------------|
| **Cultural authenticity of terms** | Some dialect terms such as `"أبجدية فينيقية"` and `"أرشيف متنقل"` require human review for historical accuracy or cultural appropriateness. |
| **Translation consistency across age tiers** | No translations provided beyond what's listed in `dialect_preserved_terms`. Further linguistic validation needed for full dialogue consistency. |
| **Runtime RTL support verification** | Not tested — whether actual Roblox runtime handles RTL layout correctly for this locale remains unverified. |

---

## 📌 Notes

- File excerpts are truncated; full file contents cannot be verified.
- No third-party assets or cultural facts were introduced.
- All original content is based on repository data only.

--- 

**Final Note:** This report assumes all files in the given path are correctly structured and valid for use in a production pipeline. Any runtime behavior involving RTL rendering or dialect handling must be confirmed via Roblox Studio testing, which is out of scope here.
