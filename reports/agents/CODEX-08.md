# CODEX-08: Server authority and exploit prevention

Backend: codex (default)

## CODEX-08 — Server authority and exploit prevention

Read-only source review completed; no files changed or deployments run. All runtime behavior below is **NOT TESTED**.

### Findings

| Priority | Finding and repository evidence |
|---|---|
| P0 | **Country-switch race:** `SelectCountry` resets progression while a challenge can remain active. Completion checks country equality but no run generation; switching LB→EG→LB could let the old run credit the reset LB state. [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau#L99), lines 99–165. |
| P0 | **Challenge actions lack a common security boundary:** the Action handler checks active challenge, table type and busy state, but has no rate budget, bounded schema, proximity check or unique run identifier. Word, Cook and Build accept direct action inputs. [Challenges/init.luau](apps/roblox/src/shared/Challenges/init.luau#L43), [Word.luau](apps/roblox/src/shared/Challenges/Word.luau#L45), [Cook.luau](apps/roblox/src/shared/Challenges/Cook.luau#L48), [Build.luau](apps/roblox/src/shared/Challenges/Build.luau#L104). |
| P1 | **Interaction evidence is incomplete:** clicks check owner/busy state; gathering checks touched character ownership. Neither explicitly validates server-measured distance and living character state. Challenges spawn relative to the character, rather than an approved station. [Challenges/init.luau](apps/roblox/src/shared/Challenges/init.luau#L137), lines 137–148 and 206–219; [Gather.luau](apps/roblox/src/shared/Challenges/Gather.luau#L32). |
| P1 | **Persistence is memory-only:** the save service uses a Lua table and validates only negative token balances on save. Durable reward replay protection is therefore absent from this implementation. [PlayerDataStoreService.luau](apps/roblox/src/server/Progression/PlayerDataStoreService.luau#L21), lines 21–64. |
| P1 | **Newer safeguards are not integrated into the entry path:** startup invokes MapBuilder and SessionManager; the latter loads the shared challenge runner. The generic security validator and newer quest/save modules are separate from this path. [Main.server.luau](apps/roblox/src/server/Main.server.luau), [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau#L67), [SecurityAndPersistence.luau](apps/roblox/src/server/Core/SecurityAndPersistence.luau). |
| P1 | **Future integrations need stronger contracts:** modular placement lacks finite-number validation and checks raw coordinates before snapping; co-op accepts supplied distance and permits identical host/guest IDs at creation; invitations can report `PROMPTED` without a provider. These are module-level risks, not demonstrated remote exploits. [ByblosModularBuilder.luau](apps/roblox/src/server/Building/ByblosModularBuilder.luau#L46), [CoopQuestCoordinator.luau](apps/roblox/src/server/QuestEngine/Coop/CoopQuestCoordinator.luau#L20), [SocialInvitationService.luau](apps/roblox/src/server/Foundation/Social/SocialInvitationService.luau#L69). |

Existing foundations include server-selected challenge order, per-remote cooldowns, stamp deduplication and allowlisted social phrases. [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau#L118), lines 118–176.

### Implementation-ready specification — proposed

1. **Centralize remote validation.** Derive identity from the handler’s `Player`. Accept only explicit action schemas; reject unknown fields, nested payloads, nonfinite numbers and out-of-range integers. Cap identifiers at 64 bytes and trade lists at 16 entries. Apply a per-player aggregate token bucket of 20 actions/second, burst 30, plus action-specific limits.
2. **Bind every action to a run.** Generate an opaque server run ID and monotonically increasing generation. Capture country, challenge and index at start. Cancel and increment generation on country change, death, respawn, departure or timeout. Recheck the captured generation before every mutation and completion.
3. **Validate physical interaction.** Resolve targets from a server registry; require a living character in the approved country zone and within 24 studs of the target. Validate gather touches explicitly. Reject impossible movement pending reconciliation; do not automatically punish a single anomaly.
4. **Commit rewards once.** Serialize inventory, quest, token and cosmetic mutations per player. Derive reward IDs and amounts server-side. Persist completion and its reward in one versioned atomic update; use a deterministic reward key to prevent replay across reconnects. Failed loads must not overwrite existing saves with defaults.
5. **Secure cooperative building.** Derive actor, placement count, clock and distance server-side. Check current membership/permission on every operation. Validate finite snapped transforms and full part bounds; atomically enforce quotas. Require distinct co-op participants and verified objective contributions.
6. **Bound lifecycle and responses.** Expire inactive runs after five minutes; clean session resources and limiter state on departure. Return stable rejection codes and minimal snapshots. Record bounded rejection counters without raw payloads or free text.

These changes address the concrete entry points and state stores cited above; numeric limits are proposed defaults requiring playtesting.

### Later implementation ownership

- Existing: `Core/SessionManager.luau`, `Core/SecurityAndPersistence.luau`, `Main.server.luau`.
- Existing challenge runner/handlers under `src/shared/Challenges/`; move authoritative logic into `src/server/Challenges/`, retaining only presentation contracts in shared storage.
- Existing: `Progression/PlayerDataStoreService.luau`, `QuestEngine/ByblosQuestStateMachine.luau`, and the cited co-op, plot, avatar and invitation services.
- Proposed new: `Core/RemoteGuard.luau`, `Core/InteractionValidator.luau`, `Core/RewardTransactionService.luau`, plus security tests.

### Dependencies and open gaps

- **Build/content dependency:** SessionManager waits for `Shared.Packs`, while the project maps `src/shared`; a reproducible pack-generation/injection step needs confirmation. [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau#L68), [default.project.json](apps/roblox/default.project.json).
- **Integration dependency:** reconcile the active remote names with the separate proposed allowlist before wiring newer services. [WorldBootstrap.luau](apps/roblox/src/server/Foundation/WorldBootstrap.luau#L54).
- **Human content review:** approve facts, translations and answer mappings; preserve separate classifications for real places, literature and legend. The ontology already requires reviewer identity/timestamp for human-reviewed claims. [ONTOLOGY.md](packages/knowledge-v12/ONTOLOGY.md). No cultural claims or answers were validated here.
- **Original-work requirement:** provenance approval remains a dependency; this review establishes no third-party asset clearance.
- **NOT TESTED:** malicious payloads/floods, country-switch races, distant interactions, death/disconnect cleanup, concurrent rewards, reconnect replay, save failures and collaborator revocation. Require Studio multiplayer and persistence fault tests before acceptance.

