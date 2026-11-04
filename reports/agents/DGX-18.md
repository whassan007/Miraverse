# DGX-18: China setting and chapter data

Backend: dgx (qwen3-coder:30b)

# MiraVerse China Chapter Data Report

## Findings

Based on the provided `catalog-data.mjs` file excerpt, no data for a China setting or chapter is present. The document defines 11 countries (LB, IQ, EG, FR, KR, DE, etc.) but does not include a "CN" entry for China.

The structure of country entries shows:
- `id: 'CN'` would be expected for China
- Standard fields like `name`, `nameNative`, `region`, `localLocale`, `theme`, `story`, `settings`, etc.
- Custom blocks, cast, learn words, age challenge modes, and chapters
- No mention of China-specific cultural elements, historical references, or geographic regions

## Specification for Implementation Scope

### Country Entry (Placeholder)
```
{
  id: 'CN',
  order: 7,
  name: 'China',
  nameNative: '中国 · 北京',
  region: 'Beijing / symbolic Han dynasty landscape',
  localLocale: 'zh-Hans-CN',
  theme: 'Cultural exchange, shared heritage and intergenerational storytelling',
  story: 'The Silk Road of Stories',
  settings: 'Traditional courtyard gardens, silk workshops, tea houses, market stalls, historical pathways and shared memory spaces.',
  capstoneArtifactId: 'cn_silk_road_story_book',
  capstoneArtifactName: 'Silk Road Story Book',
  passportStampId: 'cn_heritage_stamp',
  passportStampName: 'Heritage Stamp',
  culturalWarning: 'The Silk Road was a network of trade routes, not a single historical path. Avoid presenting any one culture as dominant or singular; emphasize intercultural exchange.',
  origin: { x: 1400, y: 64, z: 0 },
  paletteRgb: [128, 92, 58],
  accentRgb: [139, 172, 212],
  customBlocks: [
    'miraverse:cn_han_dynasty_stone',
    'miraverse:cn_silk_thread_block',
    'miraverse:cn_tea_house_roof_tile',
    'miraverse:cn_courtyard_gate_arch',
    'miraverse:cn_traditional_tea_set',
    'miraverse:cn_paper_cutter_block',
    'miraverse:cn_calligraphy_brush',
    'miraverse:cn_wooden_treasure_box',
  ],
  cast: [
    { id: 'cn_girl_ming', nameEn: 'Ming & Grandmother Li', nameNative: '明和李奶奶', role: 'mentor', greetingNative: '欢迎来到北京！我们来一起讲讲丝绸之路上的故事吧。' },
    { id: 'cn_silk_worker_zhao', nameEn: 'Silk Worker Zhao', nameNative: '织工赵', role: 'artisan', greetingNative: '丝绸的光泽来自丝线的精巧编织。' },
    { id: 'cn_tea_master_wang', nameEn: 'Tea Master Wang', nameNative: '茶师王', role: 'scholar', greetingNative: '一壶好茶，能讲出一个故事。' },
    { id: 'cn_market_seller_li', nameEn: 'Market Seller Li', nameNative: '市场摊主李', role: 'merchant', greetingNative: '新鲜的蔬菜和水果，都是从田间地头来的。' },
    { id: 'cn_storyteller_han', nameEn: 'Storyteller Han', nameNative: '说书人韩', role: 'storyteller', greetingNative: '丝绸之路的故事，每个地方都有不同的版本。' },
  ],
  learnWords: [
    { key: 'silk_road', native: '丝绸之路', translit: 'Sīlù Zhī Lù', en: 'Network of trade routes connecting East and West' },
    { key: 'tea_house', native: '茶馆', translit: 'Chá Guǎn', en: 'Traditional tea-serving establishment' },
    { key: 'han', native: '汉', translit: 'Hàn', en: 'Chinese dynasty, especially Han Dynasty' },
  ],
  ageChallengeModes: {
    '5-7': 'Follow colored silk threads and place items in matching patterns.',
    '8-10': 'Trade goods along a simplified route and solve basic pattern puzzles.',
    '11-13': 'Compare routes, evaluate cultural exchange benefits and design a safe path.',
    '14-17': 'Analyze sources of stories, coordinate an exhibit and explain interpretation.',
  },
  chapters: [
    { id: 'CN01', title: 'The Silk Road Begins', kind: 'navigation_and_restoration', scene: 'CN/silk_road_start', objective: 'Follow the path and gather materials for a silk thread', artifactId: 'cn_silk_thread', artifactName: 'Silk Thread', contentType: 'contemporary_tradition', sourceIds: ['SRC-CN-SILK-ROAD'] },
    { id: 'CN02', title: 'The Tea House', kind: 'cooking_and_trade', scene: 'CN/tea_house', objective: 'Prepare tea and exchange stories', artifactId: 'cn_tea_cup', artifactName: 'Tea Cup', contentType: 'contemporary_tradition', sourceIds: ['SRC-CN-TEA-CULTURE'] },
    { id: 'CN03', title: 'The Courtyard Garden', kind: 'architecture_restoration', scene: 'CN/courtyard_garden', objective: 'Restore a garden path and place decorative elements', artifactId: 'cn_garden_key', artifactName: 'Garden Key', contentType: 'contemporary_tradition', sourceIds: ['SRC-CN-HAN-GARDEN'] },
    { id: 'CN04', title: 'The Paper Cutter', kind: 'craft_and_assembly', scene: 'CN/paper_cutting_workshop', objective: 'Create paper cuttings using patterned voxel parts', artifactId: 'cn_paper_scissors', artifactName: 'Paper Scissors', contentType: 'contemporary_tradition', sourceIds: ['SRC-CN-PAPER-CUTTING'] },
    { id: 'CN05', title: 'The Storyteller’s Path', kind: 'oral_history_archive', scene: 'CN/storytelling_square', objective: 'Interview characters and curate a consent-safe exhibit', artifactId: 'cn_story_book', artifactName: 'Story Book', contentType: 'fictional_gameplay', sourceIds: ['SRC-CN-SILK-ROAD'] },
    { id: 'CN06', title: 'The Shared Heritage', kind: 'cooperative_restoration', scene: 'CN/heritage_pavilion', objective: 'Restore a pavilion, arrange a feast and tell a new story', artifactId: 'cn_heritage_stamp', artifactName: 'Heritage Stamp', contentType: 'contemporary_tradition', sourceIds: ['SRC-CN-SILK-ROAD'] },
  ],
}
```

## Files Implementation Would Own

1. `swarm/minecraft-global/catalog-data.mjs` - Updated with China entry
2. `swarm/minecraft-global/locales/zh-Hans-CN.json` - Chinese translations for new content
3. `swarm/minecraft-global/chapters/CN01.mjs` through `CN06.mjs` - Chapter data files
4. `swarm/minecraft-global/npcs/cn_*.mjs` - NPC definitions
5. `swarm/minecraft-global/objects/custom_blocks.cn.mjs` - Custom blocks for China

## Dependencies

- `catalog-data.mjs` must be updated with the new country entry and all related chapter data
- Locale files for Simplified Chinese (`zh-Hans-CN`) must exist and contain translations for new terms
- All custom block definitions must be registered in the global block registry
- New scenes (`CN/*`) must be created in Roblox Studio with appropriate assets
- Story arc coordination with existing countries to maintain narrative consistency

## Open Gaps

### Cultural Content Gaps
- **Silk Road historical context**: Needs detailed research to avoid oversimplification or misrepresentation
- **Han dynasty symbolism**: Requires accurate cultural interpretation for children's content
- **Tea culture in China**: Specific traditions and practices need authentic presentation
- **Paper cutting art**: Must be culturally appropriate and not reduce to simple craft activity

### Translation Gaps
- Chinese term translations require verification with native speakers
- Cultural nuances of phrases like "丝绸之路" (Silk Road) and "茶馆" (Tea House) need careful handling

### Gameplay Design Gaps
- **Age-appropriate challenges**: The "14-17" age mode needs specific puzzle design that handles complex historical interpretation without overwhelming
- **Cultural sensitivity**: Must avoid presenting any one cultural element as the "correct" version of history
- **Narrative integration**: How China's story arc connects to other countries' narratives

### Technical Implementation Gaps
- **Scene assets**: All scenes need Roblox Studio implementation with proper lighting and block placement
- **Custom block textures**: Must be designed for visual clarity in child-friendly context
- **NPC behavior**: Requires scripting that maintains cultural authenticity while remaining engaging

NOT TESTED: Any runtime functionality requiring actual Roblox Studio access or asset deployment.
