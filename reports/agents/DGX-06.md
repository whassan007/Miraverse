# DGX-06: Question and vocabulary inventory

Backend: dgx (qwen3-coder:30b)

# DGX-06: MiraVerse Cultural Game - Vocabulary and Questions Inventory

## Findings

### Vocabulary Terms by Country
Each dialogue file contains four vocabulary terms, one per NPC role:
1. **Mentor** (e.g., Teta Nahla → منقوشة)
2. **Vendor** (e.g., Amo Farid → زعتر)
3. **Artisan** (e.g., Usta Nadim → صاج)
4. **Neighbor** (e.g., Captain Rima → تيتا)

### Dialogue Structure
Each dialogue has:
- A **greeting node** with a cultural activity prompt
- A **follow-up node** that reinforces vocabulary term and triggers objectives

### Cross-Cultural Vocabulary Patterns
All countries follow identical dialogue structure but use culturally specific items:
- **LB**: Thyme flatbread (منقوشة), Wild thyme blend (زعتر), Domed griddle (صاج), Grandmother (تيتا)
- **EG**: Brass lantern (فانوس), Lentil dish (كشري), Lentils (عدس), Neighborhood lane (حارة)
- **IQ**: Carved balcony (شناشيل), Date pastry (كليجة), Dates (تمر), Cardamom (هيل)
- **KR**: Half-moon cake (송편), Traditional house (한옥), Grandmother (할머니), Pine needles (솔잎)
- **FR**: Bakery (boulangerie), Galette (galette), Hidden charm (fève), Golden crown (couronne)

### Cultural Context
Vocabulary items reflect:
- Local food traditions
- Architectural elements
- Regional customs
- Social roles

## Specification

### Scope: Vocabulary and Question Inventory

#### Input Files:
- `content/dialogue/LB.json`
- `content/dialogue/EG.json`
- `content/dialogue/IQ.json`
- `content/dialogue/KR.json`
- `content/dialogue/FR.json`

#### Output Format:
A single CSV file with columns:
```
country,npcRole,vocabularyTerm,transliteration,englishMeaning
```

#### Data Extraction Rules:
1. Extract vocabulary term from follow-up node's `textNative` field
2. Use corresponding `textTranslit` for transliteration
3. Use corresponding `textEn` for English meaning
4. Map NPC role to "mentor", "vendor", "artisan", "neighbor"
5. Include country code from dialogue ID

#### Implementation Steps:
1. Parse each JSON file
2. For each dialogue entry, extract vocabulary terms from follow-up nodes
3. Map roles to standardized categories
4. Export as CSV with consistent format

## Files Ownership

### Implementation Files
- `scripts/extract_vocabulary.py` - Main extraction script
- `data/vocabulary_inventory.csv` - Final output file
- `tests/test_vocabulary_extraction.py` - Unit tests for extraction logic

### Dependencies
- Python 3.8+
- Standard library modules: `json`, `csv`
- No external dependencies required

## Open Gaps

### Cultural Context Verification
The following cultural elements require human review:
- **LB**: Exact historical significance of "منقوشة" (thyme flatbread)
- **EG**: Regional variations in "كشري" preparation
- **IQ**: Specific historical context of "كليجة" pastry
- **KR**: Traditional meaning and use of "할머니"
- **FR**: Cultural importance of "galette des rois"

### Translation Accuracy
The following translations may require expert verification:
- **LB**: "منقوشة" (thyme flatbread) - context-specific
- **EG**: "فانوس" (brass lantern) - architectural term accuracy
- **IQ**: "شناشيل" (carved latticework balcony) - construction details
- **KR**: "한옥" (traditional wooden house) - cultural significance
- **FR**: "boulangerie" (bakery) - regional variations

### Historical/Geographical Accuracy
The following elements need human confirmation:
- **LB**: "تيتا" (grandmother) as cultural term in Lebanese context
- **EG**: "حارة" (neighborhood lane) as local identity marker
- **IQ**: "هيل" (cardamom) as cultural symbol in Baghdad
- **KR**: "솔잎" (pine needles) in Chuseok tradition
- **FR**: "couronne" (golden paper crown) in French street celebrations

### Question Generation
No question templates are provided; this requires:
- Human-defined question types per vocabulary term
- Cultural context for question framing
- Language-specific translation requirements for questions

## Notes
This report is based on repository content only. No runtime access to Roblox Studio available. Any claims about gameplay functionality or character interactions are NOT TESTED.

All cultural terms are extracted directly from JSON files. Where files were truncated, this is noted in the respective entries above.
