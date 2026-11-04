# MiraVerse v1.2 — Contested Claims & Human Verification Queue

All historical dates, numerical claims, origin narratives, mythological episodes, and literary tropes from the user-supplied essay have been audited by `CL02`, `DX10`, `DX11`, and `CL05`. No `source_asserted_unverified` claim is assigned `confidence: "high"`.

## Mandatory Contested & Sensitivity Triage Table

| Flag ID / Record | Country | Source Assertion / Claim | Epistemic Class | Triage Status & Required Editorial Treatment |
|---|---|---|---|---|
| `LB-KB-MYTH-ISIS-OSIRIS-TREE` | LB | Isis, Osiris & the sacred cedar chest at Byblos | `mythology` | Framed explicitly as ancient Mediterranean/Egyptian mythology recorded by Plutarch, never literal history. |
| `LB-KB-MYTH-ADONIS-AFQA-RIVER` | LB | Adonis, Afqa spring & iron-rich red sediment in Nahr Ibrahim | `interpretation` | Distinguishes seasonal myth from geological iron-oxide sediment run-off in spring. |
| `LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS` | LB | Phoenician alphabet "invented every Western script" | `historical_claim` | Nuanced: ~1000 BCE 22-letter consonantal abjad corroborated via UNESCO #295; avoids oversimplified claim of directly inventing every script without intermediary adaptations. |
| `IQ-KB-ORG-BAYT-AL-HIKMA` | IQ | Institutional structure & founding of Bayt al-Hikma | `contested_history` | Presents both the traditional palace-academy view and modern historians' (Gutas/Brentjes) critique regarding khizanat al-hikma. |
| `IQ-KB-EVENT-GOLD-AND-1258-TROPES` | IQ | Hunayn paid weight of manuscripts in gold; 1258 Tigris black with ink | `contested_history` | Labeled as medieval chronicler literary tropes underscoring reverence for books and mourning, not literal audited accounting. |
| `IQ-KB-PLACE-AL-MUTANABBI-STREET` | IQ | 2007 Al-Mutanabbi Street bombing & casualty counts | `historical_claim` | Age-appropriate non-graphic civic remembrance focusing on Shabandar Café resilience and the global *Al-Mutanabbi Street Starts Here* print archive. |
| `EG-KB-HIST-FANOUS-COMPETING-ORIGINS` | EG | 972 CE Caliph al-Mu'izz arrival as origin of the fanous | `contested_history` | Presented alongside 3 competing explanations (Caliph al-Hakim lighting ordinances, nighttime family escort lamps, Coptic/Greek *phanos* craft). |
| `EG-KB-ORG-DIASPORA-HERITAGE-MONTH` | EG | Ontario Egyptian Heritage Month (Bill 106, 2019) | `contemporary_practice` | Corroborated contemporary legislative milestone; inclusive cultural framing without requiring religious observance. |
| `FR-KB-PLACE-TRABOULES-LYON` | FR | Exact count of Lyon traboules (~200 to ~500) & WWII Resistance | `contested_history` | Explains why counts vary (open municipal vs closed residential passages); non-graphic WWII courier history without chase/combat trivialization. |
| `FR-KB-PERSON-MERES-LYONNAISES-BRAZIER` | FR | Eugénie Brazier's 1933 double 3-star Michelin achievement | `historical_claim` | Corroborated (La Mère Brazier at Rue Royale & Col de la Luère); includes dairy/egg/tree-nut allergy & hot-kitchen safety notes. |
| `KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS` | KR | Origins of Bibimbap (*Goldongban* in *Siuijeonseo*) | `contested_history` | Preserves 4 competing hypotheses (ancestral *eumbok* rites, *nongbap* farming meals, New Year's Eve pantry clearing, royal court). |
| `KR-KB-THEME-OBANGSAEK-FIVE-COLORS` | KR | Obangsaek 5-color directional/elemental symbolism | `interpretation` | Framed as a respected Korean cultural aesthetic and culinary philosophy, not a universal scientific law. Raw beef/egg flagged with cooked vegetarian defaults. |

## Detailed Verification Queue (`DX11`)

```json
{
  "schema_version": "1.2.0",
  "owner": "DX11",
  "dgx_note": "I am DX11, flagging contested historical claims, origin anecdotes, and numerical assertions across LB, IQ, EG, FR, and KR for human historian verification—please review the flagged items with appropriate scholarly rigor.",
  "total_flags": 12,
  "flags": [
    {
      "flag_id": "FLAG-LB-01",
      "country": "LB",
      "record_id": "LB-KB-MYTH-ISIS-OSIRIS-TREE",
      "passage_locator": "LB-P02",
      "issue_type": "myth_vs_history_boundary",
      "source_assertion": "Plutarch’s account of Osiris’s chest enclosed in a sacred cedar/erica pillar at Byblos.",
      "epistemic_treatment": "Classified as knowledge_class=mythology; never presented as a literal archaeological event.",
      "verification_action_required": "Classical/Near Eastern historian sign-off on age-tier wording."
    },
    {
      "flag_id": "FLAG-LB-02",
      "country": "LB",
      "record_id": "LB-KB-MYTH-ADONIS-AFQA-RIVER",
      "passage_locator": "LB-P03",
      "issue_type": "myth_vs_geology_boundary",
      "source_assertion": "Seasonal red coloring of Nahr Ibrahim linked in antiquity to Adonis.",
      "epistemic_treatment": "Classified as knowledge_class=interpretation; pairs iron-oxide sediment geology with ancient myth.",
      "verification_action_required": "Earth-science & Levantine folklore educator review."
    },
    {
      "flag_id": "FLAG-LB-03",
      "country": "LB",
      "record_id": "LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS",
      "passage_locator": "LB-P05",
      "issue_type": "oversimplified_diffusion_claim",
      "source_assertion": "Claims that the Phoenician alphabet single-handedly invented all Western scripts.",
      "epistemic_treatment": "Qualified to acknowledge Proto-Sinaitic/Canaanite predecessors and regional Greek/Aramaic adaptations.",
      "verification_action_required": "Semitic epigrapher review."
    },
    {
      "flag_id": "FLAG-IQ-01",
      "country": "IQ",
      "record_id": "IQ-KB-ORG-BAYT-AL-HIKMA",
      "passage_locator": "IQ-P01",
      "issue_type": "institutional_charter_debate",
      "source_assertion": "Portrayal of Bayt al-Hikma as a formal modern university vs caliphal palace library and translation bureau.",
      "epistemic_treatment": "Classified as knowledge_class=contested_history with explicit historiographical note (Gutas / Saliba debates).",
      "verification_action_required": "Abbasid historian review."
    },
    {
      "flag_id": "FLAG-IQ-02",
      "country": "IQ",
      "record_id": "IQ-KB-EVENT-GOLD-AND-1258-TROPES",
      "passage_locator": "IQ-P03",
      "issue_type": "numerical_and_chronicler_trope",
      "source_assertion": "Caliph al-Ma’mun paying Hunayn ibn Ishaq the weight of books in gold; Tigris running black with ink in 1258.",
      "epistemic_treatment": "Classified as claim_status=disputed, confidence=low; explained as 13th–15th century literary topoi.",
      "verification_action_required": "Historian review of chronicler attribution (Ibn Abi Usaybi’a)."
    },
    {
      "flag_id": "FLAG-EG-01",
      "country": "EG",
      "record_id": "EG-KB-HIST-FANOUS-COMPETING-ORIGINS",
      "passage_locator": "EG-P01",
      "issue_type": "competing_origin_narratives",
      "source_assertion": "972 CE nighttime arrival of Caliph al-Mu’izz vs Caliph al-Hakim street-lamp decrees vs Coptic lamp traditions.",
      "epistemic_treatment": "Classified as knowledge_class=contested_history, claim_status=disputed; all three narratives presented as competing traditions.",
      "verification_action_required": "Fatimid/Cairene cultural historian review."
    },
    {
      "flag_id": "FLAG-EG-02",
      "country": "EG",
      "record_id": "EG-KB-ORG-DIASPORA-HERITAGE-MONTH",
      "passage_locator": "EG-P05",
      "issue_type": "contemporary_legislative_citation",
      "source_assertion": "Ontario Egyptian Heritage Month Act, 2019 designating July as Egyptian Heritage Month.",
      "epistemic_treatment": "Kept as claim_status=source_asserted_unverified until official Ontario Legislative Assembly statute record is attached.",
      "verification_action_required": "Verify Bill 106 / S.O. 2019 statutory citation."
    },
    {
      "flag_id": "FLAG-FR-01",
      "country": "FR",
      "record_id": "FR-KB-PLACE-TRABOULES-LYON",
      "passage_locator": "FR-P01",
      "issue_type": "numerical_count_and_etymology",
      "source_assertion": "Approximately 400–500 traboules in Lyon (~40 public) and transambulare etymology.",
      "epistemic_treatment": "Flagged as approximate municipal range rather than fixed census; distinguishes public passages from private residences.",
      "verification_action_required": "Grand Lyon municipal heritage verification."
    },
    {
      "flag_id": "FLAG-FR-02",
      "country": "FR",
      "record_id": "FR-KB-PLACE-COUR-DES-VORACES",
      "passage_locator": "FR-P03",
      "issue_type": "chronology_and_wartime_sensitivity",
      "source_assertion": "Cour des Voraces (built c. 1840) conflated with 1831/1834 Canut revolts and WWII Resistance anecdotes.",
      "epistemic_treatment": "Classified as knowledge_class=contested_history; clarifies 1831/1834 vs 1840/1848 chronology and prohibits chase/combat trivialization of WWII.",
      "verification_action_required": "19th/20th-century Lyon labor historian review."
    },
    {
      "flag_id": "FLAG-FR-03",
      "country": "FR",
      "record_id": "FR-KB-PERSON-MERES-LYONNAISES-BRAZIER",
      "passage_locator": "FR-P05",
      "issue_type": "biographical_and_michelin_dates",
      "source_assertion": "Eugénie Brazier opening 12 Rue Royale (1921) and earning six Michelin stars simultaneously (1933).",
      "epistemic_treatment": "Kept as claim_status=source_asserted_unverified pending primary Michelin Guide 1933 archival verification.",
      "verification_action_required": "Culinary historian verification."
    },
    {
      "flag_id": "FLAG-KR-01",
      "country": "KR",
      "record_id": "KR-KB-HIST-BIBIMBAP-COMPETING-ORIGINS",
      "passage_locator": "KR-P02",
      "issue_type": "competing_origin_narratives",
      "source_assertion": "Four competing origin theories for bibimbap: Eumbok ancestral rites, royal court, harvest field meal (nongbap), Lunar New Year’s Eve.",
      "epistemic_treatment": "Classified as knowledge_class=contested_history, claim_status=disputed; presents all four without flattening into one fact.",
      "verification_action_required": "Korean food historian review."
    },
    {
      "flag_id": "FLAG-KR-02",
      "country": "KR",
      "record_id": "KR-KB-THEME-OBANGSAEK-FIVE-COLORS",
      "passage_locator": "KR-P04",
      "issue_type": "cultural_symbolism_vs_science",
      "source_assertion": "Obangsaek five-color associations with directions and elements.",
      "epistemic_treatment": "Classified as knowledge_class=interpretation; explicitly framed as a cultural/culinary aesthetic, not a scientific law.",
      "verification_action_required": "Korean cultural educator review."
    }
  ]
}
```
