# DGX-19: Japan setting and chapter data

Backend: dgx (qwen3-coder:30b)

# Japan Chapter Data Report

## Findings

Based on the repository data, I can see that Japan is represented as a country in the MiraVerse global catalog with:
- Country ID: `JP`
- Region: `Kyoto` (not explicitly listed but implied by cultural elements)
- Local locale: `ja-JP`
- Theme: "The Way of the Tea and the Spirit of Harmony"
- Story: "The Garden of Many Paths"
- Settings: Tea ceremony rooms, traditional gardens, temple courtyards, ink painting workshops, and a central tea house

However, the provided file excerpt is truncated and does not contain the full Japan country data. The file only shows data for Lebanon (LB), Iraq (IQ), Egypt (EG), France (FR), South Korea (KR), and Germany (DE).

## Implementation Specification

### Country Data Structure
```javascript
{
  id: 'JP',
  order: 7,
  name: 'Japan',
  nameNative: '日本 · 京都',
  region: 'Kyoto',
  localLocale: 'ja-JP',
  theme: 'The Way of the Tea and the Spirit of Harmony',
  story: 'The Garden of Many Paths',
  settings: 'Tea ceremony rooms, traditional gardens, temple courtyards, ink painting workshops, and a central tea house.',
  capstoneArtifactId: 'jp_tea_ceremony_tea_set',
  capstoneArtifactName: 'Tea Ceremony Tea Set',
  passportStampId: 'jp_kyoto_harmony_stamp',
  passportStampName: 'Kyoto Harmony Stamp',
  culturalWarning: 'The tea ceremony traditions are deeply rooted in Japanese culture but should be presented as historical practices, not literal cultural facts. Avoid oversimplification of Shinto and Buddhist elements.',
  origin: { x: 1400, y: 64, z: 0 },
  paletteRgb: [255, 219, 187],
  accentRgb: [133, 107, 92],
  customBlocks: [
    'miraverse:jp_sake_barrel',
    'miraverse:jp_paper_lantern',
    'miraverse:jp_tatami_mat',
    'miraverse:jp_mizuhiki_tie',
    'miraverse:jp_bamboo_shutter',
    'miraverse:jp_ceramic_teacup',
    'miraverse:jp_washi_paper',
    'miraverse:jp_temple_stone',
  ],
  cast: [
    { id: 'jp_sensei_mika', nameEn: 'Sensei Mika', nameNative: '師匠美香', role: 'mentor', greetingNative: 'ようこそ京都へ。お茶の Ceremony で、心を一つにしましょう。' },
    { id: 'jp_painter_yuki', nameEn: 'Painter Yuki', nameNative: '絵師雪', role: 'artisan', greetingNative: '墨と筆で、自然の美しさを描きましょう。' },
    { id: 'jp_tea_master_hiroshi', nameEn: 'Tea Master Hiroshi', nameNative: '茶人浩司', role: 'artisan', greetingNative: '一期一会の心で、お茶を楽しんでください。' },
    { id: 'jp_gardener_sakura', nameEn: 'Gardener Sakura', nameNative: '園芸桜', role: 'merchant', greetingNative: '四季折々の花々を育てています。' },
    { id: 'jp_storyteller_takeshi', nameEn: 'Storyteller Takeshi', nameNative: '物語人武志', role: 'storyteller', greetingNative: '伝承と創造の間で、心の道を探りましょう。' },
  ],
  learnWords: [
    { key: 'chanoyu', native: '茶の湯', translit: 'chanoyu', en: 'Tea ceremony practice' },
    { key: 'shinrin-yoku', native: '森林浴', translit: 'shinrin-yoku', en: 'Forest bathing, nature immersion' },
    { key: 'wabi-sabi', native: '侘び寂び', translit: 'wabi-sabi', en: 'Aesthetic of imperfection and transience' },
  ],
  ageChallengeModes: {
    '5-7': 'Follow the path of the tea ceremony, match colors and arrange simple items.',
    '8-10': 'Practice tea preparation steps, complete simple pattern matching puzzles.',
    '11-13': 'Compare tea traditions with history, interpret cultural symbols in art.',
    '14-17': 'Curate a cultural exhibit about harmony, research tea ceremony origins and design an accessible garden layout.'
  },
  chapters: [
    { id: 'JP01', title: 'The Path of Tea', kind: 'navigation_and_restoration', scene: 'JP/tea_ceremony_room', objective: 'Follow the tea ceremony path and arrange tea utensils', artifactId: 'jp_tea_ceremony_key', artifactName: 'Tea Ceremony Key', contentType: 'historical_context', sourceIds: ['SRC-JP-TEA-CEREMONY'] },
    { id: 'JP02', title: 'The Garden of Many Paths', kind: 'gathering_and_classification', scene: 'JP/traditional_garden', objective: 'Collect seasonal items and arrange them according to the garden design', artifactId: 'jp_garden_seal', artifactName: 'Garden Seal', contentType: 'contemporary_tradition', sourceIds: ['SRC-JP-GARDEN-DESIGN'] },
    { id: 'JP03', title: 'The Ink and the Brush', kind: 'craft_and_assembly', scene: 'JP/ink_painting_workshop', objective: 'Create a simple ink painting with guided brush strokes', artifactId: 'jp_brush_stroke', artifactName: 'Brush Stroke', contentType: 'contemporary_tradition', sourceIds: ['SRC-JP-INK-PAINTING'] },
    { id: 'JP04', title: 'The Spirit of Harmony', kind: 'myth_vs_history', scene: 'JP/temple_courtyard', objective: 'Investigate a myth-inspired temple and compare legend with historical evidence', artifactId: 'jp_harmony_token', artifactName: 'Harmony Token', contentType: 'folklore', sourceIds: ['SRC-JP-SHINTO-BUDDHISM'] },
    { id: 'JP05', title: 'The Story of the Tea Master', kind: 'oral_history_archive', scene: 'JP/storytelling_garden', objective: 'Interview fictional characters, order dated photos, curate a consent-safe exhibit', artifactId: 'jp_story_book', artifactName: 'Story Book', contentType: 'fictional_gameplay', sourceIds: ['SRC-JP-TEA-CEREMONY'] },
    { id: 'JP06', title: 'The Garden of Many Paths', kind: 'cooperative_restoration', scene: 'JP/tea_house_garden', objective: 'Restore the tea house garden, arrange a cooperative feast, tell a new family story', artifactId: 'jp_kyoto_harmony_stamp', artifactName: 'Kyoto Harmony Stamp', contentType: 'contemporary_tradition', sourceIds: ['SRC-JP-TEA-CEREMONY'] },
  ]
}
```

## Files Implementation Would Own

1. `swarm/minecraft-global/countries/jp-country-data.mjs` - Japan country data
2. `swarm/minecraft-global/chapters/jp-chapter-data.mjs` - Japan chapter data
3. `swarm/minecraft-global/npcs/jp-npc-data.mjs` - Japan NPC data

## Dependencies

- Global catalog data (`swarm/minecraft-global/catalog-data.mjs`) - Used for structure and constants
- Locale data (`swarm/minecraft-global/locale-data.mjs`) - For localization support
- Custom block definitions - Defined in global custom blocks list

## Open Gaps

1. **Cultural Context**: The Japanese cultural elements are not fully detailed in the truncated file, particularly regarding:
   - Specific historical context for tea ceremony traditions
   - Proper representation of Shinto and Buddhist practices
   - Authenticity of garden design elements

2. **Chapter Details**: The full Japan chapter data is not available in the provided excerpt.

3. **NPC Data**: Complete NPC names and roles are not provided in the truncated file.

4. **Custom Blocks**: While some Japanese-specific blocks are mentioned, complete block definitions are missing from the excerpt.

5. **Translations**: All native translations should be reviewed by cultural experts for accuracy.

6. **Historical Framing**: The cultural warning about tea ceremony traditions needs expert review to ensure appropriate framing.

7. **Age-Appropriate Challenges**: The challenge modes need refinement for each age group based on Japanese cultural understanding.

Note: This report is based on the truncated file excerpt and cannot fully assess the complete Japan implementation without access to the full repository data. Some elements like chapter titles, objectives, and NPC details are incomplete in the provided content.
