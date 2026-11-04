# CLAUDE-07: Question pedagogy and content correctness

Backend: claude (sonnet)

# CLAUDE-07 report: question pedagogy and content correctness

I made no edits and ran no tests. Everything below is from reading files. Anything that needs runtime proof is marked **NOT TESTED**.

## 1. Findings

**F1. There is no question or quiz system in the Roblox build.**
- A search for "question", "quiz" and "distractor" under `apps/roblox` finds only incidental text in `KnowledgeV12.luau`.
- The only question-like mechanic is the `word` challenge (`apps/roblox/src/shared/Challenges/Word.luau`).
- Any quiz would be new work, and the spec in §2 is written that way.

**F2. The `word` challenge is pedagogically trivial.**
- `Word.start` lays the cards out in array order, left to right (lines 8–14).
- `Word:prompt` always asks for the next word in that same order (lines 20–26).
- The correct answer is therefore always the next card from the left, whether or not the child reads anything.
- There are no distractors, no shuffling, and no recall step.
- The English meaning is shown in the prompt, and the answer reveals "word = en" after a correct pick.
- A wrong pick only says "Not that one. Try again!", with no hint or progression.
- Each pack has exactly 3 words and one chapter (checked in `packages/content/packs/*.json`).
- Runtime behaviour is **NOT TESTED**.

**F3. The word glosses are written as dictionary entries, not for children.**
- Example: EG `كشري` has the gloss "Egyptian dish of rice, lentils, spiced tomato sauce, and crispy onions" (`packages/content/packs/EG.json`).
- These long glosses, shown as prompts, leak the answer and read as too long for ages 5–8.
- Transliteration style also differs between packs: LB uses diacritics (`tēta`, `manʾūshe`), while EG and IQ use plain Latin (`koshari`, `kleicha`).

**F4. Mentor names disagree across three sources.**

| Country | Pack JSON (`packages/content/packs/*.json`) | `MentorDialogueService.luau` | `npc-mentor-dialogues-v12.json` |
|---|---|---|---|
| LB | Teta Nahla | Teta Nahla | Teta Yasmine |
| EG | Teta Samira | Auntie Layla | Master Hassan |
| IQ | Bibi Amal | Jiddo Noor | Archivist Tariq |
| KR | Halmeoni | Halmeoni Ji-woo | Chef Seo-yeon |
| FR | Mamie Claire | Chef Camille | Grand-mère Colette |

- `content/dialogue/EG.json` uses Teta Samira.
- A child could meet a different guide in the challenge text than in the NPC dialogue.
- This needs a human decision on which names are canonical.

**F5. `KnowledgeV12.luau` is not consumed by any Roblox script.**
- A grep over `apps/roblox` finds no `require` of it.
- The 25 records carry `ageExplanations` for the 5–7, 8–10, 11–13 and 14–17 tiers, plus `claimStatus` and `knowledgeClass`.
- None of this reaches a child in-game.
- Whether the file loads at runtime is **NOT TESTED**.

**F6. Epistemic labels are in the data but not enforced for display.**
- `EPISTEMIC_POLICY.md` defines neutral UI labels such as "Mythology & Sacred Narrative" and "Contested Historical Anecdote".
- Of 25 records, 15 are `source_asserted_unverified`, 3 are `disputed` and 7 are corroborated (counted in `KnowledgeV12.luau`).
- Only 7 of 25 records are therefore safe to present as plain fact.
- `content/v12/qa/contested-flags/contested-verification-queue.json` lists 12 flags that still need human historian sign-off. Every question built on those records must wait for it.

**F7. There is a data typo.**
- The value `externally_corrobated` is misspelled. It appears in `KnowledgeV12.luau` and all four `content/v12/presentations/*/cards.json` files.
- Any code that matches the correctly spelled value will silently miss all 7 corroborated records.
- Fixing it must be done at the generator and source, not by editing `KnowledgeV12.luau`, which is generated.

**F8. The age-tier lint is a model's own attestation, not a check.**
- `content/v12/qa/age-lint/age-tier-lint-report.json` says "DX13 confirms…" with `all_passed: true`.
- The only real metrics in it are word counts and booleans.
- It is not evidence of reading level or child suitability.
- A human age-appropriateness review is still open.

**F9. Some child-facing text asserts contested claims as fact.**
- The `14-17` tier of `EG-KB-HIST-FANOUS-COMPETING-ORIGINS` says Fatimid street-lighting ordinances, Coptic liturgical lamps and tin-working "converged" into the fanous tradition.
- That entry is itself classified `disputed`.
- Its `8-10` text is properly hedged ("Some stories tell…").
- The `14-17` wording and the 12 queued flags need review by a human who knows the subject. I did not check any of these claims myself.

**F10. Test 8 in `tests/v12/suite/v12-enrichment.test.ts` fails because two generated files are absent from this snapshot.**
- The missing files are `apps/minecraft/scripts/generated/knowledgeV12.ts` and `apps/web/src/generated/knowledgeV12.json`.
- That is outside my scope, but any question export would sit in the same generation chain.
- I did not run the test, so the cause is inferred from the missing files and the test's reads.

**F11. Two server directories differ only by letter case.**
- `apps/roblox/src/server/Core/` and `apps/roblox/src/server/core/` both exist in `git ls-files`.
- This breaks on case-insensitive filesystems such as macOS, which is relevant to Rojo sync (**NOT TESTED**).

## 2. Implementation-ready specification

### 2.1 Principles
- Questions are generated from structured content. They are never invented in code.
- Every question carries a source record ID, a `claimStatus`, and a `reviewStatus`.
- A question may ship to children only if `reviewStatus = HUMAN_APPROVED`.
- The default state is `AI_DRAFT_PENDING_HUMAN`, matching the existing status in `packages/content/STYLE.md` §7.
- Scored questions use only these `claimStatus` values: `externally_corroborated` and `contemporary_practice` knowledge classes.
  - The corrected spelling is used from F7. The old spelling is accepted by an alias map until the source data is fixed.
- Myth, folklore and contested records may appear only as reflective or "which story did you hear?" prompts, with no right or wrong score.
- Every prompt carries a visible label drawn from the `EPISTEMIC_POLICY.md` list. Real places, literature and legend must be shown as different things.
- No free text and no microphone input. The v12 guardrail already says scripted choices only.
- No timers and no failure state. A wrong answer gets a hint, then the answer, then a retry.

### 2.2 Question schema (new, in `packages/content/`)
```
Question {
  id: "EG-Q-001"
  country, chapter, challengeId
  kind: "word_match" | "image_pick" | "sort" | "story_choice"
  ageTier: "5-7" | "8-10" | "11-13" | "14-17"
  promptKey, optionIds[2..4], correctId | null (null for story_choice)
  hintKey, explanationKey
  sourceRecordId | wordRef
  claimStatus, knowledgeClass, epistemicLabel
  reviewStatus: "AI_DRAFT_PENDING_HUMAN" | "HUMAN_APPROVED"
  reviewer, reviewedAt
}
```
- Option counts by tier: 2 options for ages 5–7, 3 for 8–10, 4 for 11 and up.
- Prompt length follows the existing `max_words_budget` (65 words in the 8–10 cards).
- Text lives in locale files (§2.5), not in the question record.

### 2.3 Fixing the `word` challenge (F2, F3)
1. The server shuffles card order per attempt with a per-session seed. The client never receives the answer key.
2. The prompt asks about one word at a time in a randomised order.
3. Add distractors: a pack's 3 words plus 1–3 words from other packs, chosen to avoid confusingly similar scripts.
4. Add two modes per word: Arabic or native script to English (recognition), then English to script (recall).
5. Use short child glosses (3–6 words) in the prompt. Keep the long gloss for the post-answer reveal.
6. A wrong pick shows a hint first (for example the first sound), then reveals the answer after a second miss. Count attempts, and use no penalty.
7. Keep the existing server-authoritative `onAction` validation with its integer-index check (`Word.luau`, lines 46–49).

### 2.4 Content generation
- Put a new build step in the same chain that produces `Packs.luau` and `KnowledgeV12.luau`. Output is a generated `Questions.luau`.
- Validation fails the build on any of these:
  - a missing `sourceRecordId`;
  - a scored question on a non-corroborated record;
  - duplicate option text;
  - a correct answer that is not among the options;
  - a prompt over the word budget for its tier;
  - an unknown `claimStatus`;
  - a `reviewStatus` other than `HUMAN_APPROVED` in a release build.
- Keep one canonical mentor-name table (F4) and make `MentorDialogueService.luau` read from it.
- `ChallengeService.luau` currently accepts a completion with no answer check, only a distance check. Hook the question result into it before it records a completion.

### 2.5 Localisation
- Each question key needs `en`, `fr`, `ar-EG`, `ar-IQ`, `ar-LB` and `ko`. Use the existing `content/locales/drafts/` and the dialect QA files under `content/v12/locales/`.
- Every non-English string stays `AI_REVIEWED_PENDING_HUMAN` until a native reviewer signs off.
- Arabic must be in the named dialect, not Modern Standard Arabic (`STYLE.md` §3).

### 2.6 Review workflow
- Add a spreadsheet-style review queue, one row per question, with columns for reviewer, decision and notes.
- Seed it from `contested-verification-queue.json` for the 12 flagged records.
- The child-safety rules in `STYLE.md` §4 apply: no war, politics, religious argument, or dangerous cooking instructions. Adults operate heat and knives.

## 3. Files a later implementation would own

- **New:** `packages/content/questions/*.json`, a question schema in `packages/content/schema.ts`, a generator under `tools/`, and a generated `apps/roblox/src/shared/Questions.luau` (gitignored, like `Packs.luau`).
- **Changed:** `apps/roblox/src/shared/Challenges/Word.luau` and `apps/roblox/src/shared/Challenges/init.luau`.
- **Changed:** `apps/roblox/src/server/challenges/ChallengeService.luau`.
- **Changed:** `apps/roblox/src/client/ChallengeHud.client.luau`.
- **Changed:** `apps/roblox/src/server/NPCs/MentorDialogueService.luau`, once the mentor names are decided.
- **Changed:** `packages/content/packs/*.json` for shorter child glosses.
- **Tests:** new content-validation tests under `tests/content/` and a Roblox-side test next to `tests/roblox/roblox-v04.test.ts`.

## 4. Dependencies

- The generation chain that produces `Packs.luau` and `KnowledgeV12.luau`. The spelling fix in F7 belongs there.
- The mentor-name decision (F4), from the product owner.
- Human historian sign-off on the 12 flagged records.
- Native-speaker review for Arabic (Cairene, Baghdadi, Lebanese), French and Korean.
- The case-collision cleanup in F11, before any new server file is added.
- The failing tests listed in the session context are separate work. I looked at v12 test 8 only (F10).

## 5. Open gaps (need human review; I have supplied no answers or translations)

- All word meanings and transliterations in the packs (§F2) are unverified by a native speaker. They include `شكو ماكو` (IQ), `صحتين` (LB), and the FR and KR terms.
- Whether `la fève` and `la galette` are correct as written for the exact tradition shown.
- Which records may carry scored questions, pending the historian review in F6 and F9.
- The correct reading level per tier, since the existing lint is not a real check (F8).
- Which mentor names are canonical (F4).
- Whether the five-country sequence should be fixed or player-chosen. I found only `countrySequence` in `KnowledgeV12.luau`.
- Whether children's answers should be stored at all. The v12 guardrail points to no personal data, so I suggest session-only scoring unless the privacy owner says otherwise.
- Runtime behaviour of everything above is **NOT TESTED**, because I had no Studio access.
- The UnGroup incident is unrelated to question content. I found nothing in my scope that documents it.

