# CODEX-03: Quest state machine and challenge correctness

Backend: codex (default)

**CODEX-03 — Quest state machine and challenge correctness**

Read-only inspection completed; no files changed or builds run. All Roblox runtime behavior is **NOT TESTED**.

**Findings**

- **P0 — Compiler changes gameplay order.** `normalizePacks()` sorts challenges by ID; the Roblox compiler uses that result. Lebanon therefore becomes `build → cook → gather → trade → word`, although its source pack places gather before cooking. `SessionManager` executes array order. Sources: [web.ts](tools/compiler/web.ts), [roblox.ts](tools/compiler/roblox.ts), [LB pack](packages/content/packs/LB.json), [SessionManager](apps/roblox/src/server/Core/SessionManager.luau).
- **P1 — Two disconnected progression implementations.** The entry point initializes `SessionManager`, which uses shared challenge handlers. The separate state machine defines tokens, cosmetics and a different step order, but has no caller in the inspected Roblox source. Sources: [Main.server.luau](apps/roblox/src/server/Main.server.luau), [SessionManager](apps/roblox/src/server/Core/SessionManager.luau), [ByblosQuestStateMachine](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau).
- **P1 — Country selection can invalidate an active attempt.** Selection resets index/completions without checking `busy` or cancelling the challenge. Switching away and back defeats the completion callback’s country-only check; it then writes completion using the reset index. Source: [SessionManager](apps/roblox/src/server/Core/SessionManager.luau:99).
- **P1 — Correctness checks are incomplete.** Cook validates sequence without consuming ingredients; Word accepts predictable indices `1…N`; remote actions lack station-distance checks and rate limits. The alternate adapters permit arbitrary requested trade items and count duplicate/unrecognized sign IDs. Sources: [Cook](apps/roblox/src/shared/Challenges/Cook.luau), [Word](apps/roblox/src/shared/Challenges/Word.luau), [runner](apps/roblox/src/shared/Challenges/init.luau), [ActivityAdapters](apps/roblox/src/server/Activities/ActivityAdapters.luau).
- **P1 — Persistence and replay guarantees remain unproven.** The save service stores data in a Lua table; quest deduplication is also memory-only. Co-op session creation overwrites an existing ID, including reward flags. Relevant integration/security tests inspect source strings rather than execute these behaviors. Sources: [save service](apps/roblox/src/server/Progression/PlayerDataStoreService.luau), [state machine](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau), [co-op](apps/roblox/src/server/QuestEngine/Coop/CoopQuestCoordinator.luau), [integration tests](tests/roblox/integration/social-avatar/social-avatar-integration.test.ts), [security tests](tests/roblox/security/social-avatar/social-avatar-security.test.ts).

**Implementation-ready specification — proposed**

1. **Canonical definition:** Compile explicit ordered objective IDs and prerequisites without sorting gameplay arrays. Reject duplicate IDs, unknown references, invalid quantities, empty challenges and unreachable ingredient requirements. Resolve conflicting orders across [packs](packages/content/packs/LB.json), [quest content](content/quests/LB.json) and [vectors](tests/fixtures/quests/LB/byblos-quest-vectors.json).
2. **State transitions:** Use `READY → ACTIVE → COMMITTING → READY|COMPLETE`; retry/cancel returns to `READY` without completion rewards. Key records by player, quest and definition version. Capture objective ID, attempt ID and selection generation before starting; reject stale callbacks. Country selection must cancel and clean up the previous attempt before changing state. This replaces the mutable-index behavior in [SessionManager](apps/roblox/src/server/Core/SessionManager.luau).
3. **Authoritative validation:** Derive player identity and distance on the server. Validate bounded payloads, finite numbers, ownership, active attempt and cooldown before dispatch. Gather counts unique pickups; trade uses approved exchanges and atomic inventory changes; cook reserves/consumes configured ingredients; build requires every configured cell exactly once; word matching uses server-held prompt/answer mappings. These address the [current handlers](apps/roblox/src/shared/Challenges/init.luau) and [adapters](apps/roblox/src/server/Activities/ActivityAdapters.luau).
4. **Atomic completion:** Persist objective completion, inventory effects, reward receipt and chapter rewards together. Deduplicate by stable objective/version reward keys across reconnects; repeated requests return the recorded result. Treat the existing 20-per-step/50-bonus values as configuration pending economy approval, following the [current state machine](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau).
5. **Acceptance tests:** Execute reducers and handlers against wrong order, duplicates, stale attempts, country switching, insufficient inventory, forged distance, malformed numbers, cancellation and save failure. Add compiler-order and reconnect/reward-replay tests. Existing [source-string tests](tests/roblox/integration/social-avatar/social-avatar-integration.test.ts) are insufficient evidence.

**Later implementation ownership**

- Quest orchestration: `apps/roblox/src/server/Core/SessionManager.luau` and `QuestEngine/`.
- Challenge validation: `apps/roblox/src/shared/Challenges/`, server `Activities/` and `challenges/`.
- Save integration: `apps/roblox/src/server/Progression/PlayerDataStoreService.luau`.
- Compiler ordering and regression coverage: `tools/compiler/{web,roblox}.ts`, quest fixtures and `tests/roblox/`.

**Dependencies and open gaps**

- Content owners must reconcile IDs, order, quantities and narrative requirements: the Lebanon quest trade describes exchanging cooked food but declares raw ingredients. Sources: [quest](content/quests/LB.json), [pack](packages/content/packs/LB.json).
- Human reviewers must approve translations, answer mappings and cultural/historical claims. Keep real-place geography, literary interpretation and legend separately classified; repository policy explicitly flags mythology and unverified bibliography. Sources: [verification policy](content/v12/epistemology/verification-policy.json), [enrichment content](content/v12/quest-enrichment/quest-acts-v12.json). No answers or cultural claims were independently validated.
- Proposed scope requires no third-party assets; any new prompts or illustrations must be original.
- Multiplayer races, touch/proximity behavior, cleanup, reconnect persistence and reward delivery require Roblox Studio/runtime proof: **NOT TESTED**.

