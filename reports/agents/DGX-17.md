# DGX-17: Germany setting and chapter data

Backend: dgx (qwen3-coder:30b)

# MiraVerse Germany Chapter Data Report

## Findings

### Country Overview
- **Germany (DE)** is the sixth country in the global campaign, positioned in the Rhine region with a theme of "Empathy over silent detachment; remembering without becoming trapped in nostalgia"
- The cultural story is "The Song and the Healing Question"
- Settings include Rhine river bend cliffs, riverside village, safe boat route, forest trail, mythic Grail hall, and renewing garden
- Cultural warning explicitly states that Lorelei and Parzival are literary/mythic tales and should not be presented as literal history

### Chapter Structure
- **6 chapters** defined for Germany (DE01-DE06)
- Each chapter has unique objectives, scenes, and artifacts
- Age challenge modes cover 5-7, 8-10, 11-13, and 14-17 age groups with increasing complexity

### Custom Blocks
- 8 custom blocks defined for Germany including:
  - `miraverse:de_rhine_slate_stone`
  - `miraverse:de_half_timber_oak_frame`
  - `miraverse:de_signal_beacon_lantern`
  - `miraverse:de_acoustic_echo_chime`
  - `miraverse:de_grail_hall_column`
  - `miraverse:de_stained_story_glass`
  - `miraverse:de_renewing_garden_trellis`
  - `miraverse:de_river_quay_bollard`

### Cast
- 5 NPCs defined with German names and roles:
  - Navigator Klara (mentor)
  - Historian Lukas (scholar)
  - Storyteller Lorelei (storyteller)
  - Village Elder Heinrich (mentor)
  - Forest Guide Anna (navigator)

### Learn Words
- 3 learn words defined for German chapter content:
  - `rhine` (Rhein) - Rhine river
  - `grail` (Grail) - Grail legend
  - `echo` (Echo) - Echo sound phenomenon

## Implementation Specification

### Chapter Data Structure
```
{
  id: 'DE',
  order: 6,
  name: 'Germany',
  nameNative: 'Deutschland · Mittelrhein',
  region: 'Rhine / symbolic Grail landscape',
  localLocale: 'de-DE',
  theme: 'Empathy over silent detachment; remembering without becoming trapped in nostalgia',
  story: 'The Song and the Healing Question',
  settings: 'Rhine river bend and cliffs, riverside village, safe boat route, forest trail, mythic Grail hall and renewing garden.',
  capstoneArtifactId: 'de_compass_of_compassion',
  capstoneArtifactName: 'Compass of Compassion',
  passportStampId: 'de_german_memory_stamp',
  passportStampName: 'German Memory Stamp',
  culturalWarning: 'Lorelei and Parzival are literary/mythic tales and should not be presented as literal history. Remove drowning, trauma and religious coercion from child-facing gameplay; provide respectful historical framing.',
  origin: { x: 1200, y: 64, z: 0 },
  paletteRgb: [94, 128, 152],
  accentRgb: [212, 172, 76],
  customBlocks: [
    'miraverse:de_rhine_slate_stone',
    'miraverse:de_half_timber_oak_frame',
    'miraverse:de_signal_beacon_lantern',
    'miraverse:de_acoustic_echo_chime',
    'miraverse:de_grail_hall_column',
    'miraverse:de_stained_story_glass',
    'miraverse:de_renewing_garden_trellis',
    'miraverse:de_river_quay_bollard',
  ],
  cast: [
    { id: 'de_navigator_klara', nameEn: 'River Navigator Klara', nameNative: 'Flusslotsin Klara', role: 'mentor', greetingNative: 'Willkommen am Rhein! Gemeinsam lesen wir die sicheren Signale auf dem Fluss.' },
    { id: 'de_historian_lukas', nameEn: 'Historian Lukas', nameNative: 'Historiker Lukas', role: 'scholar', greetingNative: 'Wir unterscheiden literarische Dichtungen wie die Lorelei von der echten Flussgeschichte.' },
    { id: 'de_narrator_lorelei', nameEn: 'Storyteller Lorelei', nameNative: 'Erzählerin Lorelei', role: 'storyteller', greetingNative: 'Die Stimme des Rheins erzählt Geschichten aus der Vergangenheit.' },
    { id: 'de_village_elder_heinrich', nameEn: 'Village Elder Heinrich', nameNative: 'Dorfbürger Heinrich', role: 'mentor', greetingNative: 'In der alten Zeit war das Wasser ein Weg für viele Reisende.' },
    { id: 'de_forest_guide_anna', nameEn: 'Forest Guide Anna', nameNative: 'Waldleiterin Anna', role: 'navigator', greetingNative: 'Die Bäume zeigen den richtigen Weg durch die Wälder.' },
  ],
  learnWords: [
    { key: 'rhine', native: 'Rhein', translit: 'Rhein', en: 'The Rhine river' },
    { key: 'grail', native: 'Grail', translit: 'Grail', en: 'The Grail legend' },
    { key: 'echo', native: 'Echo', translit: 'Echo', en: 'Echo sound phenomenon' },
  ],
  ageChallengeModes: {
    '5-7': 'Follow river landmarks, match pictures of boats and signs, assemble a small boat model.',
    '8-10': 'Navigate safe river routes, identify cultural symbols and complete simple puzzles.',
    '11-13': 'Compare historical accounts with myths, analyze sound patterns and distinguish evidence from legend.',
    '14-17': 'Research historical context, design a respectful educational exhibit and explain interpretation choices.',
  },
  chapters: [
    { id: 'DE01', title: 'The River’s Signal', kind: 'navigation_and_restoration', scene: 'DE/rhine_beacon_path', objective: 'Follow river markers and repair a signal lantern', artifactId: 'de_river_signal_token', artifactName: 'River Signal Token', contentType: 'contemporary_tradition', sourceIds: ['SRC-DE-RHINE-SIGNALS'] },
    { id: 'DE02', title: 'Echoes of the Past', kind: 'sound_and_myth', scene: 'DE/echo_cave', objective: 'Listen for echoes and identify mythic vs. historical stories', artifactId: 'de_echo_horn', artifactName: 'Echo Horn', contentType: 'folklore', sourceIds: ['SRC-DE-RHINE-ECHOES'] },
    { id: 'DE03', title: 'The Grail Hall', kind: 'mystery_and_restoration', scene: 'DE/grail_hall', objective: 'Restore a mythic hall using historical and artistic clues', artifactId: 'de_grail_chalice', artifactName: 'Grail Chalice', contentType: 'historical_context', sourceIds: ['SRC-DE-GRAIL-HALL'] },
    { id: 'DE04', title: 'The Healing Question', kind: 'cooking_and_trade', scene: 'DE/community_kitchen', objective: 'Collect ingredients and prepare a traditional healing soup', artifactId: 'de_healing_recipe', artifactName: 'Healing Recipe', contentType: 'contemporary_tradition', sourceIds: ['SRC-DE-COMMUNITY-HEALING'] },
    { id: 'DE05', title: 'The Forest Path', kind: 'exploration_and_discovery', scene: 'DE/forest_trail', objective: 'Follow forest markers and collect medicinal plants', artifactId: 'de_forest_path_map', artifactName: 'Forest Path Map', contentType: 'contemporary_tradition', sourceIds: ['SRC-DE-FORREST-PATHS'] },
    { id: 'DE06', title: 'The Song of Home', kind: 'cooperative_restoration', scene: 'DE/renewing_garden', objective: 'Restore a garden and compose a story about belonging', artifactId: 'de_german_memory_stamp', artifactName: 'German Memory Stamp', contentType: 'contemporary_tradition', sourceIds: ['SRC-DE-RHINE-SIGNALS'] },
  ]
}
```

## Files Implementation Would Own

### Required Files:
1. `swarm/minecraft-global/countries/DE.mjs` - Germany country data
2. `swarm/minecraft-global/chapters/DE01.mjs` - Chapter 1 data
3. `swarm/minecraft-global/chapters/DE02.mjs` - Chapter 2 data
4. `swarm/minecraft-global/chapters/DE03.mjs` - Chapter 3 data
5. `swarm/minecraft-global/chapters/DE04.mjs` - Chapter 4 data
6. `swarm/minecraft-global/chapters/DE05.mjs` - Chapter 5 data
7. `swarm/minecraft-global/chapters/DE06.mjs` - Chapter 6 data
8. `swarm/minecraft-global/npcs/DE.mjs` - Germany NPCs data
9. `swarm/minecraft-global/learn-words/DE.mjs` - Germany learn words data

## Dependencies

### External Dependencies:
1. **Global catalog data**: Requires import from `swarm/minecraft-global/catalog-data.mjs`
2. **Locale support**: Depends on global locale definitions in `GLOBAL_LOCALES`
3. **Age track behavior variants**: Depends on 264 defined behavior variants
4. **Chapter artifact system**: Depends on 66 chapter artifacts
5. **Passport stamp system**: Depends on 11 passport stamps

### Runtime Dependencies:
- Roblox Studio environment with MiraVerse game framework
- Localization system for German language support (`de-DE`)
- Cultural sensitivity review process for mythic content handling

## Open Gaps

### Missing Information:
1. **Complete NPC data** - Only partial cast data shown in file excerpt (missing roles and full dialogue)
2. **Chapter scene details** - Scene paths not fully defined (e.g., `DE/rhine_beacon_path`)
3. **Detailed artifact descriptions** - Missing full artifact content types and provenance citations
4. **Source provenance details** - Source IDs not fully expanded (e.g., `SRC-DE-RHINE-SIGNALS`)
5. **Full age challenge modes** - Only partial data shown for age tracks beyond 11-13

### Runtime Verification Needed:
- **Custom block placement and behavior** - NOT TESTED
- **NPC dialogue implementations** - NOT TESTED
- **Chapter scene navigation and objectives** - NOT TESTED
- **Age-appropriate challenge complexity** - NOT TESTED
- **Cultural sensitivity in mythic content** - NOT TESTED

### Cultural/Translation Issues:
1. **German cultural context** - Historical framing of Rhine lore requires expert review
2. **Mythic storytelling boundaries** - Distinguishing literary from historical content needs human validation
3. **Language translation accuracy** - German native terms need linguistic expertise verification
4. **Historical period specificity** - Time
