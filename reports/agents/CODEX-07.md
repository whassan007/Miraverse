# CODEX-07: DataStore persistence and migrations

Backend: codex (default)

## CODEX-07 — DataStore persistence and migrations

Read-only inspection completed. No files changed, commits made, or deployments run. Roblox runtime behavior: **NOT TESTED**.

### Findings

- **Persistence is an in-memory stub.** `loadPlayerSave` reads a module-local table; `savePlayerState` rejects negative tokens, overwrites the schema label, and stores the supplied table reference. It performs no durable read, write, validation, or migration. [PlayerDataStoreService.luau:21](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L21)
- **The main entry point uses session-only progress.** It initializes `SessionManager`, which creates fresh sessions and deletes them on player removal. Challenge completion and stamps live in those sessions. [Main.server.luau:2](apps/roblox/src/server/Main.server.luau#L2), [SessionManager.luau:83](apps/roblox/src/server/Core/SessionManager.luau#L83), [SessionManager.luau:148](apps/roblox/src/server/Core/SessionManager.luau#L148), [SessionManager.luau:179](apps/roblox/src/server/Core/SessionManager.luau#L179)
- **Progression representations need reconciliation.** The save schema contains completed quests but no partial objective records. The separate Byblos state machine holds partial steps, reward deduplication, and earnings in another memory table. Its stamp format also differs from `Stamp.make`. [PlayerDataStoreService.luau:8](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L8), [ByblosQuestStateMachine.luau:10](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau#L10), [ByblosQuestStateMachine.luau:77](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau#L77), [Stamp.luau:47](apps/roblox/src/server/Core/Stamp.luau#L47)
- **Existing evidence does not prove durable persistence.** The security test checks source text for a negative-balance guard. A release report claims rejoin verification while marking Studio blocked; that claim is unsupported by the inspected persistence implementation. [social-avatar-security.test.ts:24](tests/roblox/security/social-avatar/social-avatar-security.test.ts#L24), [RELEASE_MATRIX.md:16](reports/v06/RELEASE_MATRIX.md#L16)

### Proposed implementation-ready specification

The following is proposed work, not existing behavior.

1. **Storage contract:** Introduce one server-owned profile per user, using a configured store name and key `player:<UserId>`. Keep store identity separate from schema version. Persist an envelope containing `schemaVersion`, `userId`, `revision`, timestamps, session lease, and profile data.
2. **Schema:** Preserve the current v6 fields. Add quest records keyed by stable quest ID with objective completion and reward receipts. Persist tokens, cosmetics, loadout, restoration stages, and stamps together. Exclude transient `busy`, cooldowns, and remote state. Existing fields and transient state are defined in [PlayerDataStoreService.luau:8](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L8) and [SessionManager.luau:16](apps/roblox/src/server/Core/SessionManager.luau#L16).
3. **Lifecycle:** Expose `Load`, `ApplyCommand`, `Flush`, and `Release` with explicit success/error results. Acquire and renew a lease through `UpdateAsync`; serialize writes per profile and reject stale owners. Load existing and joining players; flush dirty profiles on a proposed 60-second staggered interval, removal, and shutdown. Use bounded retries with jitter and budget checks.
4. **Failure handling:** Distinguish missing records from failed reads. Create defaults only for confirmed absence. Block progression mutations when loading fails or ownership is lost. Never overwrite an unreadable or newer-schema record with defaults.
5. **Atomic mutations:** Commit objective completion, token reward, stamp, cosmetic unlock, and reward receipt together. Use stable server-derived entitlement IDs to prevent repeat rewards across retries and rejoins. Purchases must atomically deduct tokens and grant ownership; current purchases mutate the supplied table directly. [AvatarLoadoutService.luau:20](apps/roblox/src/server/Progression/Avatar/AvatarLoadoutService.luau#L20)
6. **Migrations:** Implement pure sequential transforms from the explicit `mv.roblox.save.v6` label to the next schema. Validate finite nonnegative integer balances, user identity, field types, and approved identifiers before writing. Preserve legacy stamps and receipts; never award tokens during migration. Reject unknown versions and quarantine malformed records. Retain a recoverable pre-migration version and test repeat application.
7. **Acceptance:** Add behavioral tests using an injected storage adapter: missing versus failed reads, migration fixtures, future-version rejection, duplicate rewards, concurrent purchases, lease takeover, callback retries, and shutdown failures. Studio rejoin, cross-server contention, throttling, and shutdown durability remain **NOT TESTED**.

### Files a later implementation would own

- Replace persistence internals: `apps/roblox/src/server/Progression/PlayerDataStoreService.luau`.
- Add sibling `PlayerSaveSchema.luau`, `PlayerSaveMigrations.luau`, and `DataStoreAdapter.luau`.
- Coordinate lifecycle and authoritative mutations in `Main.server.luau`, `Core/SessionManager.luau`, `QuestEngine/ByblosQuestStateMachine.luau`, and `Progression/Avatar/AvatarLoadoutService.luau`.
- Add behavioral persistence tests under `tests/roblox/persistence/`. Reconcile the existing session source-text gate, which explicitly excludes `DataStoreService`. [gates.test.ts:208](tests/integration/gates.test.ts#L208)

### Dependencies and open gaps

- Confirm actual store names, scopes, historical records, environment separation, and recovery policy; the current schema label alone supplies none of these. [PlayerDataStoreService.luau:6](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L6)
- Agree canonical quest/objective IDs, stamp compatibility, and whether plot layouts need persistence; the current save schema has no plot-layout field. [PlayerDataStoreService.luau:8](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L8)
- Preserve earned-only Roblox currency and platform separation. [OPTION_A_ECONOMY_BOUNDARIES.md:6](docs/v06/commerce/OPTION_A_ECONOMY_BOUNDARIES.md#L6)
- Human review must approve cultural identifiers and distinguish real places, literature, and legend before content aliases are migrated. No facts, translations, or question answers were supplied or validated here. The content migration adapter generates fallback cultural text and transliterations, so it is not a factual authority. [migrations/index.ts](packages/content/migrations/index.ts)
- Proposed work is original persistence code and fixtures; no third-party assets are needed. Studio validation remains a release dependency. [ROBLOX_RELEASE_CHECKLIST.md:4](apps/roblox/tools/release/ROBLOX_RELEASE_CHECKLIST.md#L4)

