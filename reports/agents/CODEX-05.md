# CODEX-05: Question engine and answer randomization

Backend: codex (default)

## CODEX-05 — Question engine and answer randomization

Read-only inspection completed. No files changed, commands that generate output files run, commits made, or deployments performed. Roblox runtime behavior: **NOT TESTED**.

### Findings

- **Answer positions reveal the sequence.** `Word.start` places words in source order; `prompt` asks for them in that order; `pick` accepts `i == self.step + 1`. Static inspection shows that selecting positions left to right satisfies the challenge without word matching. [Word.luau](apps/roblox/src/shared/Challenges/Word.luau)
- **The current contract supports word matching, without a general question model.** Words contain `word`, `translit`, and `en`; validation requires exactly three entries but does not check for duplicate answer labels or ambiguous English prompts within the challenge. [schema.ts](packages/content/schema.ts), [validate.ts](tools/validate.ts)
- **Server session scaffolding exists.** The runner checks the active player session and challenge ID, rejects concurrent actions, and guards completion. Its action envelope has no attempt ID, question revision, or explicit submission rate limit; `Word.onAction` accepts an integer index. [Challenges/init.luau](apps/roblox/src/shared/Challenges/init.luau), [Word.luau](apps/roblox/src/shared/Challenges/Word.luau)
- **Shared data is replicated.** Rojo maps `src/shared` into `ReplicatedStorage`; the compiler targets `shared/Packs.luau`. A future general question bank must separate public presentation from private answer keys. [default.project.json](apps/roblox/default.project.json), [roblox.ts](tools/compiler/roblox.ts)
- **The inspected Roblox test covers architecture and commerce boundaries, not answer permutations or grading.** [roblox-v04.test.ts](tests/roblox/roblox-v04.test.ts)

### Proposed implementation-ready specification

These are proposed changes, grounded in the existing word contract and session runner—not claims of existing behavior.

1. **Introduce stable identity.** Define versioned questions with `id`, `locale`, `prompt`, `options[{id,text}]`, `correctOptionId`, reviewed feedback, source references, content classification, and review metadata. Require unique IDs, distinct displayed options, and exactly one valid correct option.
2. **Preserve existing content during migration.** Adapt each approved word entry into one matching question. Use the other approved entries as options only after human review confirms they are unambiguous distractors. Do not generate translations, cultural facts, or answers.
3. **Randomize on the server.** Copy option IDs and apply Fisher–Yates using an injected RNG with inclusive integer draws from `1..i`. Keep authored arrays immutable. Shuffle separately for each presented question; retain the permutation during retries. Repeated permutations are valid.
4. **Grade by identity.** Store the correct option ID server-side. Return only prompt, ordered public options, attempt ID, and question revision. Submit `{attemptId, questionId, revision, optionId}`; never trust a submitted correctness flag or displayed index.
5. **Make submissions idempotent.** Validate ownership, active session, revision, option membership, and rate limit. Serialize handling. Reject stale submissions; return the cached result for duplicates. Advance once per correct response and complete the challenge once. Wrong answers retain the current question and option order.
6. **Separate delivery from grading.** Route both world clicks and HUD selections through the same server validator. Cancel and invalidate attempts through the existing session lifecycle. [Challenges/init.luau](apps/roblox/src/shared/Challenges/init.luau)
7. **Keep compilation deterministic.** Perform randomization at runtime, not during export; existing compiler normalization preserves ordered gameplay arrays. [web.ts](tools/compiler/web.ts)

### Files a later implementation would own

| Ownership | Files |
|---|---|
| Engine and randomization | New `apps/roblox/src/server/Questions/{QuestionEngine,AnswerRandomizer}.luau` |
| Existing integration | `apps/roblox/src/shared/Challenges/Word.luau`, `Challenges/init.luau`, `server/Core/SessionManager.luau` |
| Presentation | `apps/roblox/src/client/ChallengeHud.client.luau` |
| Contracts and export | `packages/content/schema.ts`, `tools/validate.ts`, `tools/compiler/roblox.ts` |
| Verification | New question-engine tests under `tests/roblox/`; extend `tests/content/validate.test.ts` and compiler tests |

Content-bank edits require the cultural and localization owners; generated packs should come through the compiler.

### Dependencies and open gaps

- **Human approval:** prompts, translations, transliterations, answers, distractors, and feedback require recorded review. Existing knowledge contracts provide provenance and reviewer metadata, but the word contract lacks those links. [knowledge-v12/index.ts](packages/knowledge-v12/index.ts), [schema.ts](packages/content/schema.ts)
- **Classification:** require separate labels for real places, literature, and legend; phrase literature/legend questions within their named narrative context. Do not promote repository claims into verified historical facts. The existing audit contains unverified and disputed records. [classification-audit.json](content/v12/qa/epistemic-classes/classification-audit.json)
- **Original work:** author original prompts, feedback, and interface elements; introduce no third-party assets.
- **Acceptance tests needed:** permutation completeness, unchanged source arrays, correct grading across all six three-option permutations, player isolation, stale/replayed submissions, cancellation, and single completion.
- **NOT TESTED:** Studio integration, multiplayer behavior, remote abuse resistance, touch/controller input, Arabic shaping/RTL, text fitting, and end-to-end progression. These require runtime proof before acceptance.

