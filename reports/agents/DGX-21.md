# DGX-21: Ukraine setting and chapter data

Backend: dgx (qwen3-coder:30b)

# MiraVerse Ukraine Chapter Data Report

## Findings

Based on the provided `catalog-data.mjs` file excerpt, no data for Ukraine (country ID `UA`) is present in the global catalog. The file defines 11 countries including Lebanon (LB), Iraq (IQ), Egypt (EG), France (FR), South Korea (KR), and Germany (DE), but Ukraine is not included in this list.

The Ukrainian cultural setting was explicitly requested for inclusion as part of the MiraVerse children's cultural game program. The absence of Ukraine in the global catalog means that no chapter data, artifacts, NPCs, or cultural content related to Ukraine has been defined in this READ-ONLY wave.

## Specification

### Scope: Ukraine Chapter Data
The following specification is implementation-ready but requires human review for accurate cultural representation and historical context.

#### Country Definition
```javascript
{
  id: 'UA',
  order: 7,
  name: 'Ukraine',
  nameNative: 'Україна · Київ',
  region: 'Kyiv',
  localLocale: 'uk-UA',
  theme: 'Resilience, shared heritage and the enduring strength of community',
  story: 'The Heart of Kyiv',
  settings: 'Kyiv cobblestone streets, traditional wooden houses, market square, church spires, seasonal festivals and a riverside garden.',
  capstoneArtifactId: 'ua_kyiv_heritage_book',
  capstoneArtifactName: 'Kyiv Heritage Book',
  passportStampId: 'ua_kyiv_memory_stamp',
  passportStampName: 'Kyiv Memory Stamp',
  culturalWarning: 'The historical events of Ukraine must be presented with care and respect for the diversity of experiences. Avoid romanticizing conflict or conflating historical events with modern political situations.',
  origin: { x: 1400, y: 64, z: 0 },
  paletteRgb: [105, 178, 192],
  accentRgb: [193, 124, 48],
  customBlocks: [
    'miraverse:ua_kyiv_cobblestone',
    'miraverse:ua_traditional_wooden_house',
    'miraverse:ua_market_square_tiled_floor',
    'miraverse:ua_church_spire_block',
    'miraverse:ua_festival_banner',
    'miraverse:ua_riverside_garden_path',
    'miraverse:ua_traditional_ceramic_tile',
    'miraverse:ua_seasonal_flower_basket',
  ],
  cast: [
    { id: 'ua_mother_sofia', nameEn: 'Mother Sofia', nameNative: 'Мати Софія', role: 'mentor', greetingNative: 'Ласкаво просимо до Києва! Давайте подивимось на наші традиції разом.' },
    { id: 'ua_market_vendor_oleg', nameEn: 'Market Vendor Oleg', nameNative: 'Продавець Олег', role: 'merchant', greetingNative: 'Якщо хочеш, я покажу тобі наші стародавні товари!' },
    { id: 'ua_craftsman_mykola', nameEn: 'Craftsman Mykola', nameNative: 'Майстер Микола', role: 'artisan', greetingNative: 'Наші руки створюють красу з деревини і каменю.' },
    { id: 'ua_festival_organizer_yaroslava', nameEn: 'Festival Organizer Yaroslava', nameNative: 'Організаторка Ярослава', role: 'cook', greetingNative: 'Всі разом збираємося на свято, щоб поділитися їжею!' },
    { id: 'ua_storyteller_andriy', nameEn: 'Storyteller Andriy', nameNative: 'Розповідач Андрій', role: 'storyteller', greetingNative: 'Наші історії відкривають нові світи.' },
  ],
  learnWords: [
    { key: 'koliada', native: 'колядка', translit: 'koliada', en: 'Traditional Ukrainian winter song' },
    { key: 'borsch', native: 'борщ', translit: 'borshch', en: 'Beet soup with cabbage and sour cream' },
    { key: 'vyshyvanka', native: 'вʼязанка', translit: 'vyshyvanka', en: 'Traditional embroidered shirt or blouse' },
  ],
  ageChallengeModes: {
    '5-7': 'Follow colored paths, match pictures of food and traditions.',
    '8-10': 'Trade ingredients, solve simple puzzles and collect items.',
    '11-13': 'Compare traditions, organize evidence and create a story map.',
    '14-17': 'Evaluate historical narratives, curate an exhibit and explain interpretations.',
  },
  chapters: [
    { id: 'UA01', title: 'The Kyiv Streets', kind: 'navigation_and_restoration', scene: 'UA/kyiv_streets', objective: 'Follow signs and repair a damaged cobblestone path', artifactId: 'ua_kyiv_path_marker', artifactName: 'Kyiv Path Marker', contentType: 'contemporary_tradition', sourceIds: ['SRC-UA-KYIV-TRADITIONS'] },
    { id: 'UA02', title: 'The Market Square', kind: 'trade_and_culture', scene: 'UA/market_square', objective: 'Trade goods, learn about Ukrainian traditions and prepare a simple dish', artifactId: 'ua_market_tradition_token', artifactName: 'Market Tradition Token', contentType: 'contemporary_tradition', sourceIds: ['SRC-UA-KYIV-MARKET'] },
    { id: 'UA03', title: 'The Traditional House', kind: 'architecture_restoration', scene: 'UA/traditional_house', objective: 'Restore a wooden house detail using traditional methods', artifactId: 'ua_traditional_house_key', artifactName: 'Traditional House Key', contentType: 'contemporary_tradition', sourceIds: ['SRC-UA-HOUSE-CONSTRUCTION'] },
    { id: 'UA04', title: 'The Festival Day', kind: 'cooking_and_culture', scene: 'UA/festival_day', objective: 'Cook borsch and participate in a traditional celebration', artifactId: 'ua_festival_bowl', artifactName: 'Festival Bowl', contentType: 'contemporary_tradition', sourceIds: ['SRC-UA-FESTIVAL-TRADITIONS'] },
    { id: 'UA05', title: 'The Story of the Past', kind: 'oral_history_archive', scene: 'UA/story_archive', objective: 'Listen to stories, order them chronologically and share a new one', artifactId: 'ua_story_book', artifactName: 'Story Book', contentType: 'folklore', sourceIds: ['SRC-UA-ORAL-STORIES'] },
    { id: 'UA06', title: 'The Heart of Kyiv', kind: 'cooperative_restoration', scene: 'UA/kyiv_garden', objective: 'Restore a garden and celebrate community traditions', artifactId: 'ua_kyiv_memory_stamp', artifactName: 'Kyiv Memory Stamp', contentType: 'contemporary_tradition', sourceIds: ['SRC-UA-KYIV-HERITAGE'] },
  ],
}
```

## Files Implementation Would Own

1. `swarm/minecraft-global/catalog-data.mjs` - The main catalog file (not editable per constraints)
2. `swarm/minecraft-global/locales/uk-UA.json` - Ukrainian locale translations
3. `swarm/minecraft-global/data/ua-chapters.mjs` - Ukraine-specific chapter data module
4. `swarm/minecraft-global/assets/ua-custom-blocks.mjs` - Custom block definitions for Ukraine

## Dependencies

- Locale support in `GLOBAL_LOCALES` already includes Ukrainian (`uk-UA`)
- Roblox game engine must support:
  - Ukrainian language localization
  - Custom block rendering for new Ukraine-specific assets
  - Multi-language NPC dialogue system

## Open Gaps

### Cultural & Historical Facts
- No specific historical events to represent in the narrative (needs human review)
- Traditional Ukrainian customs and symbols require expert validation
- Seasonal festivals need cultural context verification

### Translation Needs
- All new content needs full translation into Ukrainian (`uk-UA`)
- Transliteration of terms must be accurate (e.g., `koliada`, `borsch`, `vyshyvanka`)

### Gameplay Design
- Age-appropriate challenges for 14-17 year-olds regarding historical interpretation require expert review
- The "myth vs history" element in the Ukrainian setting needs careful framing to avoid misinformation

### Content Validation
- The cultural warning statement and theme need confirmation from cultural experts
- Specific chapter objectives and artifacts must be reviewed for appropriateness
- Custom blocks should match authentic Ukrainian architectural elements (notably not generic Russian assets)

Note: The above specification is based on the structure of other countries in the global catalog. Actual implementation would require extensive human review and cultural consultation to ensure accuracy and sensitivity.

NOT TESTED: Any Roblox runtime behavior, localization rendering or custom block functionality without access to Studio.
