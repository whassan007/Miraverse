# CLAUDE-03: Geographic and cultural integrity: real, literary and legendary settings

Backend: claude (sonnet)

# CLAUDE-03 report: geographic and cultural integrity (read-only)

I made no edits, commits or deploys. Nothing was run in Roblox Studio, so every runtime behaviour below is **NOT TESTED**. I checked no cultural, historical or linguistic fact against an outside source. Where a claim needs that, I list it under human review.

## 1. Findings

### 1.1 The Roblox world does not use the verified geography
- **The world that actually loads is a placeholder.** `apps/roblox/src/server/Main.server.luau:5` calls `MapBuilder.build()`. That builds a flat lobby, and each country gets a 96×96 coloured plaza at `Vector3.new(index*160, 10, 0)` (`MapBuilder.luau:291`). There are no landmarks, no real or legendary settings and no signage. Each plaza has only a spawn, a mentor block, a build origin and a return portal.
- **Two competing coordinate systems.** `Foundation/WorldBootstrap.luau:14-45` (`WORLD_ZONES`) and `art/v06/roblox-worlds/*/…-world-spec.json` place worlds at LB(-220,8,0), EG(0,8,220), IQ(0,8,-220), KR(220,8,220) and FR(220,8,0). MapBuilder plazas sit on a line at x=160..800. Nothing in `apps/roblox` references `WORLD_ZONES`. I found no reference to it elsewhere in `apps/roblox` or the Roblox tests, apart from its own definition.
- **Quest markers match neither.** `content/v12/geo/atlas-v12-geodata.json` has `in_game_quest_markers[].roblox_pos`, for example LB act 1 at [120,14,-85]. The LB world origin is (-220,8,0), so those markers are about 340 studs away from it. The IQ act 1 marker is at [0,20,0], which is the hub. Nothing in `apps/roblox` consumes these markers.
- **Country order differs.** `KnowledgeV12.luau` uses LB, IQ, EG, FR, KR. MapBuilder uses LB, EG, IQ, KR, FR.
- **Only LB has landmark definitions.** `byblos-world-spec.json` lists 5 landmarks with positions, 4 NPCs and 3 soundscapes. The EG, FR, IQ and KR specs are about 290 bytes each. They list landmark ID strings only, with no names, positions or NPCs. The ID `lyon_traboule_courtyard` is not the real-place pin in the atlas (see 1.3).

### 1.2 Mentor and NPC names disagree across sources
| Country | MapBuilder fallback | World spec | Dialogue JSON / culture report |
|---|---|---|---|
| LB | Teta Salwa | `npc_teta_nahla` | Teta Nahla |
| EG | Ammo Karim | `npc_layla_cairo` | Teta Samira |
| IQ | Bibi Nadia | `npc_noor_baghdad` | Bibi Amal |
| KR | Halmeoni Sunja | `npc_jiwoo_jeonju` | Halmeoni |
| FR | Mamie Colette | `npc_camille_lyon` | Mamie Claire |

Sources: `MapBuilder.luau:20-61`, `art/v06/roblox-worlds/*`, `content/dialogue/*.json`, `reports/culture/*.md`.

- The `MapBuilder.luau` fallback is what a Roblox player would see today. It matches no other source.
- The EG mentor `Teta Samira` in `content/dialogue/EG.json` is Egyptian-Arabic "Teta". `Ammo Karim` is a male uncle. The sources do not agree on gender or role.
- `Marhaba` is used as the EG greeting and `Hala` as the IQ greeting (`MapBuilder.luau:35,43`). `content/v12/locales/ar-EG-IQ/ar-EG-IQ-localization.json` lists `Ahlan wa Sahlan / Izzayak` for EG. I have not confirmed that `Marhaba` or `Hala` are the right greetings, so they need review.

### 1.3 Real-place data: sourcing and wording problems
- **The 8 verified pins in the atlas are not supported by their own metadata.**
  - **Source:** `atlas-v12-geodata.json` marks 7 pins `verified_real_world_wgs84` (the 8th is `verified_approximate_district_centroid`). The `coordinate_source` strings are generic, such as "UNESCO #295" and "MiraVerse v1.1 Baseline", with no URL or survey ID.
  - **Verification claim:** The file embeds an LLM output (`dgx_spark_metrics`, model `qwen/qwen3-coder-next`) that returns `true` for each place. All `review_timestamp` values are identical (`2026-11-04T06:00:00Z`), and the file records no human reviewer.
  - **Conclusion:** Treat all 8 pins as **unverified until a human checks them**. I did not check the coordinates or the UNESCO numbers (#295, #89, #872).
  - **Contradiction:** `reports/v12/ATLAS_ACCURACY.md` calls them "verified" and "No-Invented-Coordinates Guarantee".
- **Some source names look plausible but are unchecked.**
  - Examples: "Baghdad Rusafa Municipal Survey" and "Lebanese Ministry of Environment / Mount Lebanon Hydrological Survey".
  - They could be invented citations. Do not display any "verified" badge until a human confirms each source.
- **The Abbasid Baghdad pin is a good example of honest uncertainty.** It is labelled "approximate district", with ±1500 m and a note that the building is unexcavated. Roblox UI should show that wording rather than a precise pin.
- **The pin keys do not match the world-spec landmarks.** For example `place-fr-lyon-cour-des-voraces` has no link to `lyon_traboule_courtyard`. The spec IDs are invented game locations. Nothing records whether a landmark is real, legendary or fictional.
- **Mentor and NPC fiction is inconsistent.** The epistemic policy lists `Fictional Game Content` (`content/v12/epistemology/EPISTEMIC_POLICY.md`). The world spec still names the LB chapter "Summer at Teta's" and Byblos buildings that I could not trace to a real site.

### 1.4 Epistemic framework is solid on paper, absent from Roblox play
- **The data layer is good.** `EPISTEMIC_POLICY.md` defines 7 labels: Historical Record, Source-Asserted Claim, Mythology & Sacred Narrative, Cultural Folklore & Competing Origins, Contested Historical Anecdote, Contemporary Cultural Practice, Fictional Game Content. `contested-verification-queue.json` has 12 flags. `KnowledgeV12.luau` carries `knowledgeClass`, `claimStatus`, `confidence` and per-age text.
- **It does separate legend from history in the content.** Isis/Osiris at Byblos is `mythology`, and the Adonis/Afqa red river is `interpretation`. Fanous origins and bibimbap origins are `contested_history`. The IQ "weight in gold" and 1258 "river of ink" claims are `disputed` and `low` confidence.
- **I found no Luau code that shows these labels to a child.** Nothing in `apps/roblox/src/client` (checked by name only: `UI.luau`, `ChallengeHud`, `NativeQuestHud`) was read for it. A later pass should confirm.
- **All 12 contested flags are open.** Each needs a named human reviewer.
- **Sources cannot be edited out silently.** The only source (`SRC-V12-TRANSNATIONAL-001`) has `author: unknown`, `publisher: unknown` and `rights_reuse_status: review_required`. Every claim derived from it is therefore secondhand.
- **Typo in generated data.** `"externally_corrobated"` appears in `KnowledgeV12.luau`. Check whether the enum or a validator depends on that spelling before fixing it.
- **A UNESCO number sits in age-tier text.** The 14-17 text for Cairo says "(UNESCO #89)". If the number is wrong, the error is in player-facing copy.

### 1.5 Flag colours used as architecture
- `MapBuilder.luau:20-61` colours plazas and portals with flag hexes. LB is red/green (`#CE1126`/`#00A651`) rather than the Lebanese flag. IQ is blue/gold, which is not the Iraqi flag. KR uses `#0047A0`/`#CD2E3A`, the Taegeuk colours. FR is the tricolour.
- I make no claim about each. The risk is that plazas read as national-flag blocks, not places.
- Plaza colours should come from architecture and craft (`apps/minecraft/art-direction/v10/palettes.json` and the V06 art kit exist for this), not flags.

### 1.6 Sensitive content already flagged in policy
- `verification-policy.json` EPIST-05 forbids graphic depiction of the 2007 Al-Mutanabbi attack and WWII persecution, and forced religious observance. FLAG-FR-02 prohibits chase or combat framing of the WWII Resistance in Lyon's traboules.
- The Roblox quest design must respect these. Nothing I read violates them, but nothing enforces them in Roblox either.

## 2. Specification (implementation-ready)

### 2.1 One source of truth: `content/v12/geo/world-registry.json` (new)
Each location record:
```json
{
  "locationId": "lb_byblos_harbor",
  "country": "LB",
  "category": "real_place | literary_setting | legend_setting | fictional_game_place",
  "epistemicLabel": "<one of the 7 EPISTEMIC_POLICY labels>",
  "realPlaceRef": "place-lb-byblos-harbor",
  "roblox": { "worldId": "...", "pos": [x,y,z], "radiusStuds": 40 },
  "scaleLabel": "in-game map / not to geographic scale",
  "review": { "status": "pending|approved|changes_requested|rejected", "reviewer": null, "date": null },
  "ageTierText": { "5-7": "...", "8-10": "...", "11-13": "...", "14-17": "..." }
}
```
Rules:
1. `category: real_place` must carry `realPlaceRef` pointing at an atlas pin with `review.status: approved`.
2. `legend_setting` must carry the `Mythology & Sacred Narrative` or `Cultural Folklore & Competing Origins` label. It must never show a WGS84 pin.
3. `literary_setting` names the work in `sourceWorkRef` and uses the paraphrase-only rule from EPIST-04.
4. `fictional_game_place` must carry `Fictional Game Content`. All current world-spec landmarks default to this category until a human maps them to a real site.
5. The only inputs are existing files. No new coordinates may be invented.

### 2.2 Coordinates: pick one system
- Adopt `WORLD_ZONES` / world-spec origins as canonical (they are the only set with per-country separation).
- Re-derive `roblox_pos` markers relative to the country origin, or store them as offsets. Add a test that every marker lies within its country's radius.
- Make MapBuilder read origins from the registry so `Plaza_*` and `WORLD_ZONES` agree, and remove the `index*160` layout.
- Align country order everywhere, or document why the orders differ.

### 2.3 Mentor roster
- Keep one canonical roster file keyed by `npcId`. Source of truth should be `content/dialogue/*.json`, plus a human decision on which name is final.
- MapBuilder's `FALLBACK_META` should be generated from that roster, not hand-typed.
- Add a lint that fails if names differ across `MapBuilder`, world specs, dialogue and culture reports.

### 2.4 Player-facing integrity UI
- Show the epistemic label as an icon plus text on any knowledge card. Labels must be child-appropriate wording, to be approved by a human (the 7 policy labels are adult-facing).
- Show the `scaleLabel` on any in-game map.
- For `contested_history` and `mythology` cards, show the competing versions (as in `KnowledgeV12.luau` EG fanous, KR bibimbap), never a single "answer".
- Quests cannot ask for a single "correct" answer on a disputed or mythical fact. Quiz items on those must ask "which story says…" style comparisons. I have not written any question or answer.

### 2.5 Validation (offline, can run without Studio)
Extend `tests/v12/suite/v12-enrichment.test.ts` (test 7 currently only checks types and the scale label) with:
- every `real_place` has an `approved` review and a non-generic source (URL or document ID)
- no legend or fictional location has latitude or longitude
- every location's `roblox.pos` is within its country's radius
- mentor names are consistent across sources
- every contested flag in `contested-verification-queue.json` is linked to at least one registry entry

### 2.6 Content decisions I recommend
- Treat Egypt's greeting, Iraq's greeting and every `Teta`/`Bibi` naming choice as pending until a native-speaker reviewer signs off (the culture reports say `AI_PRELIMINARY_PASS_PENDING_NATIVE_CONSULTANT`).
- Do not use national flags as plaza palettes.
- Keep the Al-Mutanabbi attack and WWII Lyon content out of play, per EPIST-05.

## 3. Files a later implementation would own
- New: `content/v12/geo/world-registry.json`, plus its schema and test.
- `apps/roblox/src/server/MapBuilder.luau` (layout, mentor fallback, colours)
- `apps/roblox/src/server/Foundation/WorldBootstrap.luau` (`WORLD_ZONES`)
- `art/v06/roblox-worlds/{EG,FR,IQ,KR}/*.json` (flesh out to match LB)
- `content/v12/geo/atlas-v12-geodata.json` (marker positions, review fields, real sources)
- `tools/compiler/roblox.ts` and `tools/content-compiler/v06/index.ts` (the generators for Luau content; I did not read them, so confirm they are where `KnowledgeV12.luau` is produced)
- `tests/v12/suite/v12-enrichment.test.ts`
- Client UI for labels, which CLAUDE-0x UI workers presumably own. Coordinate with them.

Not mine to change: `KnowledgeV12.luau` is marked "GENERATED FILE … DO NOT EDIT". Change the generator, not the file.

## 4. Dependencies
- Human reviewers named in `verification-policy.json`: `historian_reviewer`, `native_dialect_reviewer`, `child_safety_reviewer`.
- Roblox Studio access for any layout or streaming proof.
- A decision from the program owner on the canonical mentor names.
- Coordination with whichever worker owns quest content (question wording) and UI.

## 5. Open gaps
**Needs human review (I did not check any of these):**
1. All 8 WGS84 pins and their sources, and the UNESCO numbers #295, #89 and #872.
2. Whether the Byblos buildings in the LB spec (harbour quay, saj bakery, souk, triple-arch house) correspond to real, documented sites or are fictional.
3. All 12 flags in `contested-verification-queue.json`.
4. Arabic, French and Korean strings in `content/dialogue/*.json` and `content/v12/locales/*`. This includes the greetings noted in 1.2 and the IQ/EG terms (`Shlonak`, `Izzayak`).
5. The 14-17 text containing the UNESCO number.
6. The only source, `SRC-V12-TRANSNATIONAL-001`: author unknown and rights unreviewed.
7. EG, FR, IQ, KR landmark names and positions: no content exists yet.

**NOT TESTED:**
- Any Roblox runtime behaviour: spawn positions, streaming, portal teleports, prompt text, label display.
- Whether `MapBuilder` really loads `ContentData`/`Content` packs (`MapBuilder.luau:79-97`). No such module appears in the file list I saw, so the fallback table is probably what runs.
- Whether the client currently displays epistemic labels anywhere.

**Not examined:** the `apps/web` atlas component (`AtlasDualMapV12.tsx`) and `apps/minecraft` content, beyond noting that the Minecraft matrix `apps/minecraft/content/minecraft-review/v10/CULTURAL_CONTINUITY_MATRIX.md` exists.

