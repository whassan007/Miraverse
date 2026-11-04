# CLAUDE-04: Narrative review: Lebanon, Egypt, Iraq, France, South Korea

Backend: claude (sonnet)

# CLAUDE-04 narrative review: Lebanon, Egypt, Iraq, France, South Korea

Nothing was edited, committed or deployed. No runtime was available, so anything that depends on Studio is marked NOT TESTED. I wrote no cultural, historical or linguistic content. Every item that needs facts, translations or answers is listed under "Open gaps" for human review.

## 1. Findings

**F1. Each country's mentor has 3 to 4 different names across the repo (high severity).**

| Country | Roblox `MentorDialogueService.luau` | Roblox `MapBuilder.luau` fallback | Quest and pack (`content/quests`, `packages/content/packs`) | v12 acts and NPC enrichment |
|---|---|---|---|---|
| LB | Teta Nahla | Teta Salwa | Teta Nahla | Nahla in acts; Teta Yasmine in `npc-mentor-dialogues-v12.json` |
| EG | Auntie Layla | Ammo Karim | Teta Samira | Samira in acts; Master Hassan (enrichment) |
| IQ | Jiddo Noor | Bibi Nadia | Bibi Amal | Amal and Khalo Salam in acts; Archivist Tariq (enrichment) |
| KR | Halmeoni Ji-woo | Halmeoni Sunja | "Halmeoni" (unnamed) | Halmeoni in acts; Chef Seo-yeon (enrichment) |
| FR | Chef Camille | Mamie Colette | Mamie Claire | Claire in acts; Grand-mère Colette (enrichment) |

- A child would meet a different guide in each system.
- The mentor-name mismatch includes a gender and age swap: Iraq's "Jiddo Noor" (grandfather) in Roblox versus "Bibi Amal" (grandmother) in the quest.
- France also reuses the name "Camille" for the mason NPC in `content/quests/FR.json` (`npc:FR:camille_mason`). That clashes with the Roblox mentor "Chef Camille".
- Sources: `apps/roblox/src/server/NPCs/MentorDialogueService.luau:6-56`, `apps/roblox/src/server/MapBuilder.luau:20-63`, `content/quests/*.json`, `packages/content/packs/*.json`, `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`.

**F2. Roblox does not load the authored content, so the fallback names are what players see (high severity).**
- `MapBuilder.luau:84` looks for a `ContentData` or `Content` module under `Shared`. No such file exists (`git grep ContentData` only hits that line).
- `KnowledgeV12.luau` is referenced only by `tools/v12/*` and `tests/v12`, not by any Roblox runtime script.
- So the v12 knowledge cards, the 25 acts and the quest JSON are not surfaced in Roblox at all. This is by inspection only. NOT TESTED in Studio.

**F3. The quest JSON is templated and repeats itself in every country.**
- All five objectives in a chapter carry the same `culturalFact` string. The test showed 1 distinct value per country.
- That string is a greeting, not a cultural fact.
- All five objectives also carry the same three `requiredItems` and the same five `vocabWords`. A build or word step "requires" flour, za'atar and olive oil in Lebanon, and the same pattern holds in the other four countries.
- Every `labelNative` equals `labelEn` (3 of 3 in every objective, all five countries). The native labels were never translated.
- `packages/content/packs/*.json` has real per-challenge needs (for example FR `puff_pastry` x2, `almond_cream`, `porcelain_feve`). The `content/quests` item lists contradict it.
- Sources: `content/quests/{LB,EG,IQ,KR,FR}.json`, `packages/content/packs/FR.json`.

**F4. Dialogue is thin and the French vocabulary format is inconsistent.**
- Each dialogue file has 4 entries. LB's mentor has 2 nodes: a greeting, then a "remember the word" card (`content/dialogue/LB.json`).
- French vocab uses syllable-split pronunciations as the `translit` (`bou-lan-je-rie`) and shows a bare noun in the quest but "la galette" in the pack.
- The quest says `kou-ron` where the pack says `la koo-ron`. Whether either is the right pronunciation guide is for a French reviewer.

**F5. Several `greetingEn` fields are not English, and the dialect needs review.**
- KR and FR `greetingEn` strings in `MentorDialogueService.luau` open in Korean and French ("어서 오세요!", "Bienvenue à Vieux Lyon!").
- The Iraqi native greeting uses "جوة". I won't assert it is or isn't Iraqi. A native Iraqi reviewer should check it. `content/v12/locales/ar-LB/lebanese-dialect-qa.json` exists for Lebanon, but I found no equivalent for Iraq or Egypt in the file list.
- Four Arabic locale drafts exist (`content/locales/drafts/ar-{EG,IQ,LB}.json`, plus `ar-EG-IQ` in v12), but I did not verify their contents.

**F6. The v12 epistemic framework is strong, but its sign-offs are machine-generated.**
- `content/v12/epistemology/EPISTEMIC_POLICY.md` defines neutral labels (Historical Record, Mythology, Competing Origins, Contested Anecdote, Fictional Game Content). `verification-policy.json` defines the reviewer states and roles: historian, native-dialect and child-safety reviewers.
- Of the 25 knowledge records, 7 are `externally_corrobated` (the key is misspelled in `KnowledgeV12.luau`, so any consumer must match that exact string). 15 are `source_asserted_unverified`, and 3 are `disputed`: the Egypt fanous origin, the Iraq gold and 1258 tropes, and the Korea bibimbap origins.
- `contested-verification-queue.json` lists 12 open flags. Every one needs a named human reviewer.
- The QA reports (`age-lint`, `entity-date-audit`, `media-rights-audit`) carry `dgx_note` fields and an LLM-output block. The media audit embeds a model response that says `verification_failed`, while the report says it is compliant. Treat these as machine heuristics, not review.
- "Corroborated" tags in the source data are the generator's claim, not a human check.

**F7. Gameplay and safety design are already reasonable.**
- `quest-acts-v12.json` has 5 acts per country, each with 4 age tiers. Acts have `safety_flags` such as `no_child_pii`, `myth_clearly_labeled_not_history`, `virtual_led_no_open_flame`, and no raw beef or egg for children in Korea.
- Roblox challenge kinds (`gather`, `cook`, `build`, `trade`, `word`) map 1:1 to the act's `legacy_objective_id`.
- `ChallengeService.validateAndComplete` records completion by country and challenge type only. It does not check chapter, act or knowledge unlock.
- Roblox stamp awarding is in `Stamp.luau` and `MapBuilder.luau`. I did not trace the full path.

**F8. Smaller observations.**
- Real places, a legend and a myth are mixed in one chapter: Byblos (real), Isis and Osiris at Byblos (myth), Adonis and Nahr Ibrahim (myth plus geology). The data already labels these separately via `knowledgeClass`. The Roblox UI must keep those labels.
- The country ordering differs: `KnowledgeV12.countrySequence` is LB, IQ, EG, FR, KR. Roblox zones use LB, EG, IQ, KR, FR. Decide one order.
- Zone titles are in `WorldBootstrap.luau`: Byblos, Cairo, Baghdad, Jeonju, and Vieux Lyon. They are consistent with the quests.

## 2. Implementation-ready specification

Goal: one canonical narrative source per country, wired into Roblox, with every unverified item gated.

**S1. Mentor registry (fixes F1 and F2).**
- Pick one mentor per country as canonical. The quest and pack names (Nahla, Samira, Amal, Halmeoni, Claire) are the most-used set, but this is a product decision; ask the owner.
- Create one table, `MentorRegistry`, keyed by country. Fields: `mentorId`, `nameEn`, `nameNative`, `role`, `dialectLocale`, `greetingEn`, `greetingNative`, `reviewState`.
- `MentorDialogueService.MENTORS` and `MapBuilder.FALLBACK_META` both read from it. Remove the duplicate hard-coded names.
- Resolve the Iraq "Jiddo" versus "Bibi" mismatch and the France "Camille" clash in that one place.
- Keep `npc-mentor-dialogues-v12.json` characters (Yasmine, Tariq, Hassan, Seo-yeon, Colette) as secondary NPCs only if the owner wants them. Give them distinct roles (archivist, artisan, scholar) rather than a second mentor.

**S2. Content module (fixes F2).**
- Add `src/shared/ContentData.luau`, generated from `packages/content/packs/*.json` and the v12 compile step. `MapBuilder.resolveCountryMeta` already reads `data.PACKS[cc]`.
- The generator should live next to `tools/v12/compiler/compile-v12.mjs`. Generated files should carry the "DO NOT EDIT" header like `KnowledgeV12.luau`.
- NOT TESTED: Rojo sync, require behaviour, and MapBuilder output.

**S3. Quest content per objective (fixes F3).**
- For each of the 25 objectives, supply a distinct `culturalFact`, `requiredItems` that match the pack's needs, and a real `labelNative`.
- Link each objective to one v12 act (`legacy_objective_id`) and to the act's `linked_knowledge_ids`.
- Add a validator in `tests/` that fails on duplicate `culturalFact`, on `labelNative == labelEn`, and on pack and quest item mismatch.

**S4. Dialogue (fixes F4).**
- Expand each mentor to a node graph per act: greeting, hint, completion, and one reflection line per age tier. Reuse the act's `npc_lines` and `hint_ladder`.
- Add at least two supporting NPCs per country from the act data (`supporting_npc_id`): LB `rima_sailor` and `amo_farid`; EG `amo_hassan`; IQ `khalo_salam`; FR `chef_luc`; KR `uncle_min`.
- Use one pronunciation-guide convention across all countries, decided by the language reviewers.

**S5. Knowledge gating (F6 and F8).**
- In the Roblox UI, show a knowledge card only when its `reviewState` is `approved`. Otherwise show a neutral "story in the game" label or hide it.
- Show the label from `EPISTEMIC_POLICY.md` on every card. Never present `mythology`, `contested_history` or `disputed` as plain fact.
- The 12 queued flags are a release gate for those specific cards.

**S6. Completion and rewards.**
- Extend challenge completion to carry `{country, chapter, act, objective}` and award the act's stamp (`stamp:LB:A01` pattern) and knowledge unlock once.
- Reuse `Stamp.make`. Keep stamps decorative. NOT TESTED: persistence in `PlayerDataStoreService`.

**S7. Country chapter outlines (structure only; facts need review).**
- **Lebanon.** Byblos harbor, saj kitchen, stone courtyard. Acts LB-A01 to A05. Keep the myth cards labelled as myth.
- **Egypt.** Cairo lantern courtyard, koshari kitchen, felucca build. Acts EG-A01 to A05. Present the lantern origin as competing stories.
- **Iraq.** Tigris and Baghdad, kleicha kitchen, shanasheel courtyard, Al-Mutanabbi booksellers. Acts IQ-A01 to A05. Keep the 2007 event non-graphic per EPIST-05.
- **France.** Vieux Lyon traboules, galette kitchen, bakery facade. Acts FR-A01 to A05. Respect public versus private passages (act flag).
- **South Korea.** Jeonju hanok, songpyeon kitchen, hanok care. Acts KR-A01 to A05. Frame obangsaek as tradition, not science (act flag).

## 3. Files a later implementation would own

- `apps/roblox/src/server/NPCs/MentorDialogueService.luau`
- `apps/roblox/src/server/MapBuilder.luau`
- `apps/roblox/src/server/Foundation/WorldBootstrap.luau` (zone titles only, if renamed)
- `apps/roblox/src/shared/ContentData.luau` (new, generated) and `MentorRegistry.luau` (new)
- `apps/roblox/src/shared/KnowledgeV12.luau` (generated; change the generator, not the file)
- `apps/roblox/src/server/challenges/ChallengeService.luau` and `src/client/UI.luau`
- `content/quests/*.json`, `content/dialogue/*.json`, `packages/content/packs/*.json`, `packages/content/stories/*.json`
- `content/v12/npc-enrichment/npc-mentor-dialogues-v12.json`, `content/v12/quest-enrichment/quest-acts-v12.json`
- `tools/v12/compiler/compile-v12.mjs`, `tests/v12/suite/v12-enrichment.test.ts`

## 4. Dependencies

- Owner decision on canonical mentors (S1) before any text work.
- Human reviewers for the 12 open flags in `contested-verification-queue.json`: classical and Near Eastern historian, Abbasid historian, Fatimid and Cairene historian, Lyon labor and culinary historians, Korean food historian and cultural educator, and a Semitic epigrapher.
- Native dialect reviewers for ar-LB, ar-EG, ar-IQ, French and Korean. Only Lebanon has a dialect QA file today.
- Child-safety reviewer for the allergen, heat and raw-ingredient flags.
- A Roblox Studio test pass before anything is called working. It should cover content load, NPC proximity (`maxInteractionStuds = 14`), challenge flow and stamp awarding.
- Art and audio are out of scope here. Any new assets must be original. The v12 art audit lists original SVGs only.

## 5. Open gaps (need human review; not filled in by me)

1. Canonical mentor names, ages and roles per country (F1).
2. All native-language labels for the 15 quest items per country, currently copies of English (F3).
3. A distinct, verified `culturalFact` for each of the 25 objectives (F3).
4. Dialect and spelling review of the native greetings and vocab, especially Iraqi "جوة" and the French and Korean pronunciation guides (F4, F5).
5. Verification of every `source_asserted_unverified` and `disputed` knowledge record. That means 18 of 25, each needing a reviewer before display.
6. The Egyptian diaspora month legislative citation, the Lyon traboule counts and etymology, Hunayn's gold payment, the 1258 river-of-ink trope, the 972 CE fanous story, and the bibimbap origins. All are flagged in the queue, and I verified none.
7. Quiz questions and answers. I found none to review in this scope, and I wrote none.
8. Whether the DGX-generated QA reports were ever checked by a person.
9. Everything runtime: content load, dialogue UI, stamps, persistence and mobile behaviour. NOT TESTED.

Evidence is by file inspection only. The scripted counts in F3 and F6 came from read-only Python over the JSON and `KnowledgeV12.luau`.

