# MiraVerse Global v1.1 — 66-Chapter × 4-Age-Track Interaction Specification

## 1. Pedagogical Contract Across Four Age Tracks (`264 Variants Total`)
Every single one of the **66 quest IDs** (`LB01..MA06`) implements **four distinct authored behavior variants** (`66 × 4 = 264 variants`). All four tracks lead to the same canonical completion state and grant the exact same chapter artifact and Story Sparks without gating or penalizing players.

| Age Track | Persona | Navigation & Literacy | Task Complexity | Failure & Feedback Handling |
|---|---|---|---|---|
| `5-7` | **Explorer** | Pictograms, glow path beacons, short text, caregiver assist toggle | 1–2 linked steps, shape/icon matching, safe placement, guided NPC choice | Unlimited retries, zero timers, zero resource loss, checkpoint on every step |
| `8-10` | **Adventurer** | Short instructions, local maps, clear word tooltips | 2–4 linked steps, gather/trade/craft, simple logic & cooperative assists | Hints on demand, recoverable failure, zero penalties for language mistakes |
| `11-13` | **Investigator** | Quest journal, environmental clues, source comparison | Multi-step recipes, map reasoning, competing clues, architectural material selection | Branching choices with reversible state, optional challenge badges |
| `14-17` | **Architect / Curator** | Primary/secondary-source labels, provenance notes, ethical reflection | Resource optimization, provenance comparison, system design & co-op coordination | Multiple justified endings, reflective feedback, accessible skip paths |

## 2. Privacy & Track Switching Guarantees
- Age track selection is stored strictly in world/player local state (`ageTrack: '5-7' | '8-10' | '11-13' | '14-17'`) with **zero birth-date collection**.
- Players or guardians can switch tracks at any time (even mid-quest) via the Hub or Atlas Journal without losing active quest progress, stamps, or keepsakes.

## 3. Sample Variant Matrix Across All 11 Countries
| Variant ID | Chapter | Track | Steps | Timers Enabled | Hint Mode | Reading Load |
|---|---|---|---|---|---|---|
| `LB01_5-7` | `LB01` (The Harbor Wakes) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB01_8-10` | `LB01` (The Harbor Wakes) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB01_11-13` | `LB01` (The Harbor Wakes) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB01_14-17` | `LB01` (The Harbor Wakes) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `LB02_5-7` | `LB02` (Letters in Stone) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB02_8-10` | `LB02` (Letters in Stone) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB02_11-13` | `LB02` (Letters in Stone) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB02_14-17` | `LB02` (Letters in Stone) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `LB03_5-7` | `LB03` (Teta’s Table) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB03_8-10` | `LB03` (Teta’s Table) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB03_11-13` | `LB03` (Teta’s Table) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB03_14-17` | `LB03` (Teta’s Table) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `LB04_5-7` | `LB04` (The Cedar Chest) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB04_8-10` | `LB04` (The Cedar Chest) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB04_11-13` | `LB04` (The Cedar Chest) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB04_14-17` | `LB04` (The Cedar Chest) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `LB05_5-7` | `LB05` (Photographs Across the Sea) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB05_8-10` | `LB05` (Photographs Across the Sea) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB05_11-13` | `LB05` (Photographs Across the Sea) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB05_14-17` | `LB05` (Photographs Across the Sea) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `LB06_5-7` | `LB06` (Festival of Return) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `LB06_8-10` | `LB06` (Festival of Return) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `LB06_11-13` | `LB06` (Festival of Return) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `LB06_14-17` | `LB06` (Festival of Return) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `IQ01_5-7` | `IQ01` (Street of Books) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `IQ01_8-10` | `IQ01` (Street of Books) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `IQ01_11-13` | `IQ01` (Street of Books) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `IQ01_14-17` | `IQ01` (Street of Books) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `IQ02_5-7` | `IQ02` (The House of Wisdom) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `IQ02_8-10` | `IQ02` (The House of Wisdom) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `IQ02_11-13` | `IQ02` (The House of Wisdom) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `IQ02_14-17` | `IQ02` (The House of Wisdom) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `IQ03_5-7` | `IQ03` (Words That Travel) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `IQ03_8-10` | `IQ03` (Words That Travel) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `IQ03_11-13` | `IQ03` (Words That Travel) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `IQ03_14-17` | `IQ03` (Words That Travel) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `IQ04_5-7` | `IQ04` (Dates and Kleicha) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `IQ04_8-10` | `IQ04` (Dates and Kleicha) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `IQ04_11-13` | `IQ04` (Dates and Kleicha) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `IQ04_14-17` | `IQ04` (Dates and Kleicha) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |
| `IQ05_5-7` | `IQ05` (The Courtyard of Questions) | `5-7` (Explorer) | 2 | `false` | `persistent_glow_and_icon` | `low_pictorial_with_caregiver_assist` |
| `IQ05_8-10` | `IQ05` (The Courtyard of Questions) | `8-10` (Adventurer) | 3 | `false` | `on_request_tooltip` | `short_instructions_and_word_tooltips` |
| `IQ05_11-13` | `IQ05` (The Courtyard of Questions) | `11-13` (Investigator) | 4 | `false` | `on_request_journal_clue` | `quest_journal_and_source_comparison` |
| `IQ05_14-17` | `IQ05` (The Courtyard of Questions) | `14-17` (Architect / Curator) | 5 | `false` | `optional_curator_notes` | `primary_secondary_source_labels_and_reflection` |

*(Full 264-variant machine-readable specification stored in `docs/minecraft-global/age-design/age-variants-spec.json`.)*