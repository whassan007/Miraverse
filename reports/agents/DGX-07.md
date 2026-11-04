# DGX-07: Localization and provenance

Backend: dgx (qwen3-coder:30b)

# DGX-07 Localization and Provenance Report

## Findings

The repository contains a bilingual localization dataset for cultural terms related to Lyon (France) and Jeonju (Korea). The data includes:

- **French terms**:
  - *Traboule*, *Canut*, *Mères Lyonnaises*
  - Historical and etymological notes
  - Cultural heritage references like *Cour des Voraces* and *Bistanclaque-pan*

- **Korean terms**:
  - *Jeonju Bibimbap*, *Obangsaek*, *Siuijeonseo*
  - Regional traditions, food history, and architectural elements (*Hanok Maeul*, *Ondol*, *Jangdokdae*)

- **Localized titles** for records in both locales, indicating structured content for cultural storytelling or educational use.

### Key Observations

- The dataset is derived from a single source (`DX16`), indicating a curated or generated set.
- Cultural terms are defined with etymological and historical context but lack references to external sources (e.g., academic papers, museums).
- There's no mention of how these terms should be rendered in-game or localized for end-users beyond their textual definitions.

## Implementation Specification

### Scope: Localization and Provenance

The scope of this task is to prepare localization assets for inclusion in a children’s cultural game program, specifically:
1. **Cultural Term Definitions** in French and Korean.
2. **Localized Titles** for content records.
3. **Provenance Tracking**: Document origin of terms and their localization.

### Files a Later Implementation Would Own

The following files are needed for full implementation:
- `locales/fr-FR/cultural_terms.json` – French cultural terms with definitions and etymologies.
- `locales/ko-KR/cultural_terms.json` – Korean cultural terms with definitions, romanizations, and notes.
- `content/record_titles.json` – Mapping of record IDs to localized titles.
- `metadata/provenance_log.json` – Tracking of term origin (e.g., DX16-generated).

### Dependencies

- **Translation Tools**: The Korean terms include *revised_romanization* — requires validation by a linguistic expert.
- **Cultural Accuracy Review**:
  - *Traboule*, *Canut*, *Mères Lyonnaises* require verification with historical or museum sources (not in this dataset).
  - *Obangsaek*, *Siuijeonseo*, *Jangdokdae* require cultural context review.

### Open Gaps

| Gap | Description |
|-----|-------------|
| **Cultural Fact Verification** | No references to primary historical or anthropological sources for terms. |
| **Korean Translation Accuracy** | Romanization and hangul terms need expert linguistic validation (e.g., *Siuijeonseo*). |
| **Game Integration Plan** | Not specified; how these terms will be presented in-game is unclear. |
| **Runtime Localization Logic** | No data on how localization keys map to UI elements or game assets (NOT TESTED). |

---

### Notes

- This dataset includes only excerpts; full files are not available.
- The `fr-FR` and `ko-KR` locales are clearly marked, but no further locale support is evident.
- All content is original and must be treated as data for localization purposes only.

--- 

**End of Report**
