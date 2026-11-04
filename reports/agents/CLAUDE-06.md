# CLAUDE-06: Quest design and progression architecture

Backend: claude (sonnet)

# CLAUDE-06 report: Roblox quest design and progression architecture

Read-only wave. I made no edits, commits or deploys. Nothing here was run in Roblox Studio, so every runtime behaviour is **NOT TESTED**.

## 1. Findings

**F1. The live quest loop is `SessionManager`, and it is session-only.**
- `apps/roblox/src/server/Core/SessionManager.luau` is the only quest logic that `Main.server.luau` reaches (`MapBuilder.build()` then `SessionManager.init()`).
- It keeps `sessions[player]` in memory. The file header says "No DataStore".
- It runs `Challenges.run` on `Packs[cc].chapters[1].challenges` in array order. `CHALLENGES_PER_CHAPTER = 5` is hardcoded.
- It issues `Stamp.make(cc, 1)` once all five are done.
- `SelectCountry` resets `index` and `completed` but keeps `stamped`, so switching country mid-chapter loses progress.
- `s.stamped[cc]` is checked before `s.completed[s.index]`. After a stamp, replay is blocked only through `reason="complete"`.

**F2. Three modules look like the quest/save architecture but nothing in game code requires them.**
- `QuestEngine/ByblosQuestStateMachine.luau`, `QuestEngine/Coop/CoopQuestCoordinator.luau` and `Progression/PlayerDataStoreService.luau` have no `require` outside tests and report generators (grep over `apps/roblox/src`, `tests`, `tools`).
- `challenges/ChallengeService.luau` (lowercase dir) and `core/SecurityAndPersistence.luau` (lowercase `core`) are likewise unreferenced.
- `tests/roblox/roblox-v04.test.ts` reads `server/core/SecurityAndPersistence.luau`, a lowercase path. The tracked file is also under `server/Core/`. On a case-sensitive filesystem that test would fail, so both paths are worth verifying.
- The social-avatar tests only do string-level checks on these files.
- `tools/quality/v06/generate-reports-and-captures.mjs:290` reports "PASS (Unit) / BLOCKED (Studio)". I found no behavioural Luau test.

**F3. `PlayerDataStoreService` is not persistent.**
- It is a `memoryStore` table, not `DataStoreService`. A repo grep finds `DataStoreService` only inside the name `PlayerDataStoreService`.
- Its schema `mv.roblox.save.v6` has `completedQuests`, `passportStamps`, `processedEventIds`, `restoredStages` and `miraTokens`.
- The default save grants `lb_byblos_apron_vest`.

**F4. Challenge order is inconsistent across three sources.**

| Source | Order |
|---|---|
| `packages/content/packs/{LB,EG,IQ,KR,FR}.json`, which feeds the live loop | gather, cook, build, trade, word |
| `ByblosQuestStateMachine.STEP_ORDER` (also Minecraft `CHALLENGE_ORDER_V10` in `apps/minecraft/scripts/src/contracts/index.ts:15`) | gather, trade, cook, build, word |
| `content/quests/*.json` objectives (LB checked) | gather, trade, build, cook, word |

- The pack order is the only one consistent with the data. In the LB pack, trade `needs` a `manoushe`, which cook produces. Trade-before-cook would be unsatisfiable.
- The state machine therefore contradicts the playable content.
- Which order is the product intent is an open decision (gap G1).

**F5. The reward model differs by source.**
- `ByblosQuestStateMachine` gives 20 per step and 50 on completion. The comment says "total 150", and the code gives 5×20+50 = 150. This is consistent, but it does not match `content/quests/LB.json`'s per-objective `miraTokenReward` and `completionReward.miraTokensBonus`: 50. Whether the per-objective values sum to 100 was not checked.
- The state machine's stamp format `MV-%s1-V06-%d` does not match `packages/shared/stamp.md` (`MV-<CC><ch>-<NNNN>-<CCCC>`, which `Stamp.verify` enforces).
- The live loop's `Stamp.make` is the spec-compliant one. The Option A flagship code path is not.

**F6. The `Packs` module is generated and gitignored.**
- `apps/roblox/src/shared/Packs.luau` is produced by `tools/compiler/roblox.ts` and listed in `.gitignore`.
- `SessionManager` does `WaitForChild("Packs")`. Without a compile step that hangs the server init.
- `MapBuilder.loadContentPacks` looks for a different module (`ContentData` or `Content`), and Rojo does not map either. That could silently fall back to `FALLBACK_META`. NOT TESTED.
- `KnowledgeV12.luau` is also generated (header "GENERATED FILE").

**F7. The v1.2 five-act and age-tier design exists only as content.**
- `content/v12/quest-enrichment/quest-acts-v12.json` holds 25 acts (5 countries × 5) × 4 age tiers (5-7, 8-10, 11-13, 14-17), 100 variations. Each act has `linked_knowledge_ids`, `hint_ladder`, `completion_criteria`, `reward {knowledge_unlock_id, stamp_id "stamp:LB:A01", free_earned}`, `paid_reward_required: false` and `safety_flags`.
- `reports/v12/AGE_TIER_QUEST_MATRIX.md` documents it, and `tests/v12/vectors/quest-age-tier-vectors.json` has the 100 vectors.
- No Luau reads any of this. A grep for `age`/`tier` in the Roblox quest code finds nothing relevant.
- Acts A01–A05 map onto the five challenge types, but the mapping is implicit. The act names suggest A01 gather/route, A02 trade, A03 cook, A04 build, A05 word. That is a reading of the titles, not a stated field. Only `legacy_objective_id` on A01 is confirmed, and the others weren't checked.

**F8. Anti-exploit coverage is partial.**
- Good: server-owned `index`, a 0.25 s per-remote cooldown, the `busy` flag, and `Challenges.run` rejecting a second concurrent run.
- Gaps:
  - Challenge handlers use `ClickDetector` with `MaxActivationDistance = 40`, while `ChallengeService` and `SecurityAndPersistence` specify 24 studs.
  - Co-op distance is passed in by the caller (`distanceBetweenPlayersStuds`), which would be client-trusted if wired naively.
  - `Challenges` falls back to a local ledger when no inventory provider is installed.

**F9. HUD and mentor dialogue are thin.**
- `ChallengeHud.client.luau` shows goal, progress and notify.
- `NativeQuestHud.formatObjectiveBanner` is an English-only string (`"[%s] Active Quest Step: %s"`), with RTL detected only for ar-LB/EG/IQ.
- `MentorDialogueService.MENTORS` holds one greeting per country.
- The mentor IDs there (`npc_layla_cairo`, "Auntie Layla"; `npc_noor_baghdad`, "Jiddo Noor") differ from the quest/act IDs (`npc:LB:teta_nahla`; IQ act text says "Bibi Amal", EG "Teta Samira"). The EG/IQ mentor identity is inconsistent between sources.

## 2. Implementation-ready specification

### 2.1 Architecture
Make one authoritative pipeline and retire the parallel ones.
```
Packs.luau (generated) ─┐
QuestActs (generated, new) ┤→ QuestCatalog (shared, pure)
                          ↓
Server: QuestService (single owner)
   ├─ ProgressStore (profile, versioned; wraps DataStore, pcall + retry)
   ├─ ChallengeRunner (existing Challenges.run)
   ├─ RewardService (idempotent grants)
   └─ Remotes (typed, rate-limited)
Client: QuestHud (reads snapshots only)
```
- `SessionManager` becomes a thin remote layer over `QuestService`.
- `ByblosQuestStateMachine`, `ChallengeService` and `SecurityAndPersistence` are absorbed or deleted once `QuestService` has tests.
- Co-op stays an optional Option A extension (see 2.7).

### 2.2 Quest model
- A chapter is `{ country, chapter=1, steps[] }`.
- Each step is `{ stepId, kind, actId, requires[] }`, where `requires` lists prior `stepId`s.
- The step graph comes from content rather than a Luau constant. Add an explicit `order` array to the pack compiler output, so the data defines order (resolves F4).
- Default recommendation: use the pack order (gather → cook → build → trade → word) because it is dependency-consistent. It needs a human decision before it ships (G1).
- Lifecycle per country, aligned with the Minecraft `QuestLifecycleState` for parity: `DISCOVERED → ACCEPTED → ACTIVE → COMPLETED → REWARDED`.

### 2.3 Persistence (versioned profile)
Extend the `RobloxPlayerSave` shape from `PlayerDataStoreService` (do not invent a second schema):
```
schemaVersion "mv.roblox.save.v7"
quests[cc] = { lifecycle, completedSteps{stepId=true}, stampCode?, ageTier? , replayCount }
processedEventIds  (bounded ring, e.g. last 200, to cap save size)
stamps { [cc.."1"] = code }   -- decorative only, per stamp.md §4
miraTokens (earned only), knowledgeUnlocked{id=true}
```
- Use a migration function `v6→v7`, with unknown-version fallback to a safe default.
- Use `UpdateAsync` keyed by `UserId`, plus a session lock or at minimum a write-on-leave and autosave interval. Don't write on every step. The exact interval and budget need Studio verification.
- Persist only after the server validates the step.
- Memory and DataStore contracts must expose the same interface, so the existing unit-style tests stay runnable.

### 2.4 Step completion and rewards (idempotent)
1. The client sends only `RunChallenge` (no payload). The server derives the step from the profile.
2. On success, build a deterministic `eventId = userId..":"..stepId..":"..replayCount`. If it is in `processedEventIds`, return a duplicate result and grant nothing.
3. Mark the step done, grant the step reward, then if all steps are done set `COMPLETED`, grant the completion bonus and issue the stamp once.
4. Rewards: take step and completion values from content (`miraTokenReward`, `completionReward` in `content/quests/*.json`). Do not hardcode 20/50. Reconcile with the 150-total claim (G2).
5. Replay: allow a replay that grants no tokens and no new stamp, only the "replayed" counter. Matches the existing `complete` guard.
6. Stamp: use `Stamp.make` (the spec-compliant one) only. Delete the `MV-..-V06-..` format.

### 2.5 Age tiers (v1.2)
- Choose the tier server-side from a parent- or player-set preference (an existing setting, if any, was not found). Never infer age from behaviour or collect birth date in-game. The mechanism needs a policy decision (G3).
- Tier selects a variation from the generated acts table: `learning_objective`, `hint_ladder`, `completion_criteria`.
- Tier changes difficulty, wording and hint speed. It must never gate free knowledge cards or stamps (`paid_reward_required: false`).
- The five challenge handlers need a tier parameter (hint timing, number of items, blueprint size). Today they take no tier.

### 2.6 Remotes and anti-exploit
- Keep the `GetState`, `SelectCountry`, `RunChallenge` RemoteFunctions (existing names) and add a `QuestChanged` RemoteEvent so the HUD stops polling.
- Preserve the cooldown wrapper, and apply server-side distance checks from `Character` position, not from client numbers.
- Align ClickDetector distance (40) with the single constant (24) in one shared config, and decide which is correct (G4).
- Make selecting a country mid-challenge cancel via `Challenges.cancel` first (the existing code only sets `busy`).
- Drop `SecurityAndPersistence`'s `payload.country`/`action` validator unless it is wired. If it stays, keep the external commerce denials (`EXTERNAL_CHECKOUT`, `WEB_GIFT_REDEEM`).

### 2.7 Co-op (optional, behind a flag)
- Keep `LB_COOP_HARBOR_FEAST` from `CoopQuestCoordinator`, but compute distance on the server from both characters (the current signature trusts the caller).
- Rewards are individual and once only (it already has `rewardedPlayers`). Its 40-token value needs a content source (G2).
- No chat or voice dependence. Any social features must follow `docs/v06/safety/roblox-social/ROBLOX_SOCIAL_AND_COMMUNITY_SAFETY.md`; I did not review that document in this wave.

### 2.8 HUD
- `QuestHud` renders the snapshot: country, step n of N, goal, and a hint-ladder line.
- Localise through string tables, not `string.format` English. Support ar (RTL), fr, ko, en. All translations come from content. Do not machine-translate (G5).
- Replace `NativeQuestHud.formatObjectiveBanner`, or feed it keys instead of English.

### 2.9 Tests (to be added later)
- Pure-Luau quest logic (order, dedupe, replay, migration) runs under a Luau test runner if one is adopted. None exists in the repo, so this is a decision (G6).
- Content invariants in Vitest: every pack has the same step set, all `requires` resolve, every `linked_knowledge_ids` entry exists in `KnowledgeV12`, and all 100 age vectors resolve.
- Studio checks (**NOT TESTED**): the full chapter loop per country, rejoin persistence, DataStore failure, two-player co-op, mobile touch, and RTL layout.

## 3. Files a later implementation would own
New:
- `apps/roblox/src/server/Quest/QuestService.luau`
- `apps/roblox/src/server/Quest/ProgressStore.luau`
- `apps/roblox/src/server/Quest/RewardService.luau`
- `apps/roblox/src/shared/Quest/QuestCatalog.luau`
- `apps/roblox/src/client/Presentation/QuestHud.luau`
- a generated acts module

Changed:
- `SessionManager.luau` (to thin remotes)
- `PlayerDataStoreService.luau` (real DataStore and migration)
- `ByblosQuestStateMachine.luau`, `ChallengeService.luau`, `SecurityAndPersistence.luau` (fold in or retire)
- `CoopQuestCoordinator.luau`
- `NativeQuestHud.luau`
- `tools/compiler/roblox.ts` (emit the step order and acts)
- `.gitignore` or Rojo mapping for generated modules
- `apps/roblox/default.project.json` only if new roots are needed

Content (not mine to rewrite):
- `packages/content/packs/*.json`
- `content/quests/*.json`
- `content/v12/quest-enrichment/quest-acts-v12.json`

## 4. Dependencies
- Content owners (step order, rewards, tier text).
- The knowledge and cultural review owner for `KnowledgeV12`.
- The localisation owner.
- Safety and privacy review for age-tier selection and any persistence of minors' data.
- The Rojo build and compile step, which has to run before Studio sync.
- Cross-platform parity with the Minecraft `QuestLifecycleState` in `apps/minecraft/scripts/src/quests/index.ts`.

## 5. Open gaps (need a human)
- **G1.** Canonical challenge order. Pack, state machine and quest JSON disagree (F4).
- **G2.** Reward economy. Per-step, completion and co-op values, and what Mira Tokens can buy. The repo says "earned-only" but I saw no sink definition.
- **G3.** Age-tier source of truth, and whether the tier is parent-set.
- **G4.** Interaction distance (24 vs 40 studs).
- **G5.** All localised text, and cultural and historical content in the acts. Several act texts state specific facts (dates, UNESCO numbers, publication years, literary names). The acts themselves flag some (e.g. "pending statutory citations (Ontario 2019)", "tagged for archival verification"). I did not verify any of them. Myth vs history labelling is only as good as the source `knowledgeClass`/`claimStatus` fields, and needs reviewer sign-off before a child sees it.
- **G6.** No Luau test harness exists. Persistence and quest tests are string checks at most.
- **G7.** EG and IQ mentor names disagree across sources (F9).
- **G8.** Whether `PlayerDataStoreService` should hold the profile or a new profile library is adopted. This is a build-or-buy choice I'd leave to the lead.
- **G9.** Studio-only items listed in 2.9: all **NOT TESTED**.

