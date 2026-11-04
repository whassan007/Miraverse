# CLAUDE-05: Narrative review: Germany, China, Japan, Russia, Ukraine, Morocco

Backend: claude (sonnet)

# CLAUDE-05: Narrative review for Germany, China, Japan, Russia, Ukraine, Morocco

Read-only wave. I edited, committed and deployed nothing. Nothing here was tested in Roblox Studio, so every runtime behaviour is NOT TESTED.

The plan-mode harness asked for a plan file and an `ExitPlanMode` call. I skipped both because your instructions forbid edits and ask for a final report. Everything is in this report.

## 1. Findings

**F1. Narrative exists only on the Minecraft side. Roblox has no code or content for these six countries.**
- The canonical narrative is in `docs/minecraft-global/narrative/STORY-BIBLE.md` (sections 2 and 3, lines 24–29 and 107–195). It is mirrored in `docs/minecraft-global/narrative/source-labels-registry.json`.
- It is also mirrored in `swarm/minecraft-global/catalog-data.mjs` (DE at line 311 onward), which adds cast greetings, learn words, `ageChallengeModes`, scenes and `sourceIds`.
- Roblox only knows LB, EG, IQ, KR and FR. Evidence:
  - `apps/roblox/src/server/MapBuilder.luau:7` and `:18` define `CountryId` and `COUNTRIES` as those five.
  - `apps/roblox/src/server/Foundation/WorldBootstrap.luau` has `WORLD_ZONES` with five entries.
  - `packages/content/schema.ts:2-4` has the same five-code `CountryId`.
- Only those five have `content/quests/<CC>.json`, `content/dialogue/<CC>.json`, `packages/content/packs/<CC>.json`, vocab and stories.

**F2. The Roblox content model is one quest per country; the story bible has six chapters per country.**
- `content/quests/KR.json` has `questId: "KR:ch1:…"`. That shape is one chapter built from gather, trade, cook, build and word steps (`ByblosQuestStateMachine.STEP_ORDER`).
- The bible's six chapters per country use many mechanics, such as `signal_prioritization`, `branching_oral_story` and `call_and_response_music`. None of these map to the five existing challenge types in `apps/roblox/src/shared/Challenges/`.
- This is a design decision for a human, not something the narrative can settle.

**F3. The source-label vocabularies differ between the bible and the v12 policy.**
- The bible (STORY-BIBLE.md lines 9–14) uses `folklore`, `literature`, `historical_context`, `contemporary_tradition` and `fictional_gameplay`.
- `content/v12/epistemology/EPISTEMIC_POLICY.md` uses seven different UI labels, including "Mythology & Sacred Narrative" and "Contested Historical Anecdote".
- No mapping exists in the files I read.

**F4. There is no provenance for the six countries.**
- The `SRC-*` IDs in `catalog-data.mjs` are, for example, `SRC-DE-PARZIVAL-WOLFRAM`, `SRC-MA-AL-HALQA-UNESCO` and `SRC-UA-KOBZAR-BANDURA`.
- A repo-wide search outside `swarm/` and the bible found none of them in `content/v12/source-registry`.
- The v12 staging records, contested-flag queue and age-lint reports cover only LB, IQ, EG, FR and KR. The contested queue lists 12 flags for those five (`content/v12/qa/contested-flags/contested-verification-queue.json`).

**F5. The guardrails are sound but not yet operationalised.** They are the `culturalWarning` lines, one per country. They need to become concrete content rules, which section 2 does.

**F6. Small inconsistencies to fix when implementing.**
- The Germany cast id `de_narrator_lorelei` (`catalog-data.mjs:339`) belongs to "Storyteller Marlene". The character has no Lorelei identity, and that id invites the figure to be treated as a person.
- The Morocco language `ar-MA` is `isNativeBedrock: false` with `nativePackLang: null` (`catalog-data.mjs:29`). The Roblox locale files for ar-LB, ar-IQ and ar-EG have no ar-MA equivalent.
- The Germany learn word `Frage` is glossed as "A caring question", which is a game gloss, not a dictionary definition. Human review is needed.
- The Germany learn word `Strom` means "river current", but in German it also means electricity. This is a language-review item.
- The Ukrainian chapter titles and learn words were authored in English and transliteration. Native review is needed.

**F7. Child safety.** `docs/v06/safety/CHILD_PRIVACY_AND_PLATFORM_BOUNDARIES.md` rules out custom chat and user-generated text boards.
- MA04 ("co-create a short tale… preserve author attribution") and JP03 ("compose a short seasonal poem") must use preset prompt cards, not free text.
- The same applies to UA06 ("original new tune") and DE06 ("record what changed").

## 2. Implementation-ready specification

### 2.1 Cross-cutting rules for all six countries

1. **Labels.** Each chapter and inspect spot carries exactly one bible label. Add a documented mapping to the v12 UI labels (gap G2). Never show a `folklore` or `literature` item with factual wording. The UI chip text is a verbatim copy of the label.
2. **Real place vs literature vs legend.** Every chapter's intro card states which of the three each element is. Examples are the Rhine (real place), Lorelei (literary work) and Kitezh (legend). Use the "Real place / Story / Legend / Game" tags from the bible's `visual identity` and `source label` fields only.
3. **Challenge types.** Map each bible mechanic onto the five existing Roblox challenge modules (Gather, Trade, Cook, Build, Word) or flag it as needing a new module (gap G5).
4. **Text input.** Prompt-card selection only. No free text.
5. **No violence.** No combat, drowning, injury or disability as a power-up, in all six countries.
6. **Content is original.** All dialogue, songs, poems and puzzles are newly authored. Haiku, folk songs and verse are original or rights-cleared (bible line 26). No third-party assets, per `assets/LICENSES.json` practice.
7. **Questions and answers.** Quiz-style content is not drafted here. Every factual question and answer is a human-review gap (G1).

### 2.2 Per-country narrative and guardrails

| Country | Narrative frame (from bible) | Mandatory guardrails to implement |
|---|---|---|
| **DE** Rhine / Grail, `de-DE` | DE01 map the route (`historical_context`). DE02–DE05 literature and gameplay. DE06 garden (`contemporary_tradition`). | **Lorelei/DE02:** the sound-and-light puzzle is "spot distractions", with no victim and no drowning. Present at least two versions as variants of a literary tradition. **Parzival/DE04–05:** the "question" is "What ails you?" as an empathy act. Remove coercion, religious framing and trauma. Keep the Grail hall mythic and symbolic. **DE06:** keep the memory theme from becoming nostalgia; the bible theme says "without becoming trapped in nostalgia". Rename the `de_narrator_lorelei` id (F6). |
| **CN** Peach Blossom Spring, `zh-Hans-CN` | CN01, CN02 and CN04 are `literature`; CN03 and CN06 are `contemporary_tradition`; CN05 is `folklore`. | **CN01–02, 04:** state it is a literary tale, with a "Wuling-inspired", not Wuling-real, setting. **CN05:** present Chang'e as folklore with several versions; show at least two child-appropriate variants (need human text, G1). Mooncake cooking is simulated, with no heat. **CN06:** the theme is "build a new garden, don't copy a vanished past". |
| **JP** Bashō, Tohoku route, `ja-JP` | JP01, JP03 and JP05 are `literature`; JP02, JP04 and JP06 are `contemporary_tradition`. | Keep poetic reconstruction visibly separate from verified route facts. JP03 haiku is original, composed from preset seasonal word cards. No real Bashō verse unless rights-cleared (bible line 26). JP02 and JP04 are living travel-craft scenes. Do not assert specific route stops without human-verified sources (G1, `SRC-JP-TOHOKU-WAYSTATIONS`). |
| **RU** Svetloyar / Kitezh, `ru-RU` | RU01–03 and RU05 are `folklore`; RU04 and RU06 are `contemporary_tradition`. | State that Kitezh is a legend with several variants and not a factual submerged city. RU05 stores at least two variants. Do not frame any version as national or spiritual exclusivity. No political-violence reenactment. RU03 Sadko is a folkloric musician, with the `SRC-RU-SADKO-BYLINA` source needing review. RU04 ecology: gameplay rewards not damaging the habitat. |
| **UA** Kyiv hills / music square, `uk-UA` | UA01 is `folklore`; UA02, UA03, UA05 and UA06 are `contemporary_tradition`; UA04 is `historical_context`. | UA01: the Kyiv founders are chronicle legends. UA03: do not depict kobzars as uniformly blind and do not use disability as a power. UA04: separate oral memory (dumy) from documented events. No combat reenactment. UA02: the accessible footbridge is a build task, not a historic claim. UA06: composition uses a preset rhythm or note palette. Use Ukrainian, not Russian, for every UA text and word. |
| **MA** Marrakesh / Jemaa el-Fnaa, `ar-MA` | MA01 and MA03 are `contemporary_tradition`; MA02 is `folklore`; MA04 is `fictional_gameplay`; MA05 is `historical_context`; MA06 is `contemporary_tradition`. | Halqa is a living tradition and not a fixed text, so branching content is presented as "one telling". MA05: do not give any Seven Saints figure game powers, quests, dialogue or collectibles. Make the heritage map a respectful, non-interactive-character map, and hold it behind human review (G1). MA03 tea is non-heating. MA04 attribution uses preset names. Bible line 185 gives `ar-MA`; confirm RTL font support (G6). |

### 2.3 Per-chapter content template (one record per chapter, 36 total)

Each of the 36 chapters (6 countries × 6) uses the same fields. Fields marked ⟂ are human-supplied and must not be invented.
```
chapterId, countryId, titleEn, titleNative⟂,
sourceLabel (bible), v12Label (mapped, G2),
realityTags: {place, literature, legend, game},
mechanic (bible), robloxChallengeModule (G5),
objectiveEn, artifactId/artifactName (bible),
dialogueNodes: en (original) + native⟂,
ageTierText: {5-7, 8-10, 11-13, 14-17} (from ageChallengeModes),
sourceIds (SRC-*), reviewStatus: "pending-human" | "approved"
```
Authoring status of everything in the human-supplied fields stays `pending-human`.

### 2.4 Files a later implementation would own

- `content/quests/{DE,CN,JP,RU,UA,MA}.json`, `content/dialogue/{…}.json`, `packages/content/packs/{…}.json`, `packages/content/vocab/*` and `stories/*` for de, zh-Hans, ja, ru, uk and ar-MA.
- `packages/content/schema.ts` (widen `CountryId` and `COUNTRIES`) and the related `COUNTRY_LANG_MAP` and `COUNTRY_WGS84` tables.
- `apps/roblox/src/server/Foundation/WorldBootstrap.luau`, `MapBuilder.luau`, `NPCs/MentorDialogueService.luau` and `Progression/PlayerDataStoreService.luau` (country list defaults).
- `content/v12/source-registry/*`, `content/v12/qa/*` (contested flags, age lint, epistemic classes) for the six countries.
- A new narrative mapping doc under `docs/` (G2).

### 2.5 Dependencies

- A decision on quest structure (F2, G5) before any content file is written.
- The Minecraft story bible and registry stay the canonical text. Roblox content derives from them.
- Native-language reviewers for de, zh-Hans, ja, ru, uk and ar-MA.
- Rights-cleared sources for any real poem, song or translation.
- Roblox Studio for every runtime verification, which is NOT TESTED here.

## 3. Open gaps (human review needed; none are invented here)

- **G1. Facts needing review.** All native-language text and transliterations; Chang'e variants; the Lorelei, Parzival, Kitezh, Sadko, Kyiv founders, kobzar and dumy facts; the Seven Saints content; the Bashō route facts; and every quiz question and answer.
- **G2. Label mapping.** Bible labels to v12 UI labels is undefined.
- **G3. Provenance.** `SRC-*` records for the six countries are not in the source registry (F4). Contested-flag and age-lint passes are missing.
- **G4. Cultural sign-off.** No named reviewer or approval record exists for any of the six.
- **G5. Mechanic-to-module mapping.** Which bible mechanics map onto the five existing challenge modules and which need new modules is undecided.
- **G6. Fonts and locales.** CJK, Cyrillic and Arabic-script rendering in Roblox UI is untested. The ar-MA locale has no Roblox file.
- **G7. Roblox safety review.** Whether DE, UA and MA gameplay fits Roblox's rules for children, particularly the "no custom text" constraint in F7.
- **G8. Quest structure.** Six chapters per country versus the one-quest-per-country Roblox model (F2).

