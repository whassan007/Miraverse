# CODEX-04: 25 act and 66 chapter orchestration

Backend: codex (default)

## CODEX-04 — Act and chapter orchestration

Read-only review completed. No files changed, commits made, publishing, or deployments performed. Roblox runtime behavior: **NOT TESTED**.

### Findings

- **Two distinct content structures exist:** 25 enriched acts across `LB/IQ/EG/FR/KR`, with four age variations each; and 66 chapters across eleven destinations, six chapters each. They must retain separate identities. Sources: [act data](content/v12/quest-enrichment/quest-acts-v12.json), [chapter registry](docs/minecraft-global/narrative/source-labels-registry.json).
- **The relationship is unresolved.** V12 uses identifiers such as `LB-A01`; V13 uses `LB-act-1` and legacy challenge aliases; the narrative uses `LB01`. These files do not establish an explicit act-to-chapter crosswalk. Sources: [V12 acts](content/v12/quest-enrichment/quest-acts-v12.json), [V13 contracts](packages/contracts/v13/index.ts), [chapter registry](docs/minecraft-global/narrative/source-labels-registry.json).
- **Current Roblox orchestration is narrower:** the entry point initializes `SessionManager`, which selects `pack.chapters[1]`, supports five countries, assumes five challenges, and issues chapter-1 stamps. Sources: [entry point](apps/roblox/src/server/Main.server.luau), [session manager](apps/roblox/src/server/Core/SessionManager.luau).
- **Generated content is not an orchestrator.** The compiler exports act variations but omits legacy aliases, linked knowledge IDs, and safety flags from its Roblox act payload. Source: [compiler](tools/v12/compiler/compile-v12.mjs).
- **Persistence and rewards need reconciliation.** The progression service stores saves in a Lua table; the separate quest state machine also keeps state in memory. Its reward schedule differs from V13’s 25-token act entries. Sources: [save service](apps/roblox/src/server/Progression/PlayerDataStoreService.luau), [quest state machine](apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau), [V13 contracts](packages/contracts/v13/index.ts).

### Proposed implementation-ready specification

The following is proposed work, not existing functionality.

| Component | Required contract |
|---|---|
| Versioned campaign manifest | Preserve all 25 act IDs and 66 chapter IDs. Store explicit aliases and reviewed `actIds` per chapter; an unresolved mapping blocks that chapter’s release. Never infer relationships from matching ordinal numbers. |
| Chapter definition | Require `chapterId`, country, source label, setting classification, prerequisite IDs, ordered objective IDs, artifact ID, optional capstone reward, review status, and platform readiness. |
| Act definition | Preserve legacy aliases, four age variants, knowledge references, safety flags, and earned reward IDs. Replace prose completion criteria with typed objective predicates and registered adapter IDs. |
| Progression | Use `locked → available → active → completed`; track rewards separately. Make each destination’s first chapter independently accessible, as specified by the [story bible](docs/minecraft-global/narrative/STORY-BIBLE.md). Encode later prerequisites explicitly; validate against cycles. |
| Server authority | Accept player intent; derive player identity and completion evidence on the server. Validate active objective, manifest version, inventory, location, and adapter result. Reject stale, duplicate, and out-of-order events. |
| Persistence | Save progress by chapter, act, and objective ID, plus revision and reward ledger. Atomically record completion and earned entitlement. Replay must not grant duplicate rewards. Preserve legacy progress through explicit migration aliases. |
| Client projection | Return available chapters, active objectives, reviewed source labels, hints, and earned rewards. Keep completion and reward decisions server-owned. |
| Release validation | Check counts, unique IDs, aliases, references, four age variants, prerequisite graph, adapter coverage, review status, and original-asset provenance. Keep unreviewed or unsupported chapters unavailable. |

### Files a later implementation would own

**Proposed new files:**

- `content/orchestration/campaign.json` — manifest and reviewed crosswalk.
- `packages/content/orchestration-schema.ts` — definitions and validation.
- `tools/orchestration/validate.mjs` — static release checks.
- `apps/roblox/src/server/QuestEngine/CampaignOrchestrator.luau` — transitions and objective dispatch.

**Existing integration files:**

[compiler](tools/v12/compiler/compile-v12.mjs), [SessionManager](apps/roblox/src/server/Core/SessionManager.luau), [save service](apps/roblox/src/server/Progression/PlayerDataStoreService.luau), [Stamp](apps/roblox/src/server/Core/Stamp.luau), [HUD](apps/roblox/src/client/Presentation/NativeQuestHud.luau), and [server entry point](apps/roblox/src/server/Main.server.luau). Regenerate [KnowledgeV12](apps/roblox/src/shared/KnowledgeV12.luau) through its compiler.

### Dependencies and open gaps

- **Editorial mapping:** approve the relationship between 25 acts and 66 chapters, reward amounts, replay rules, and legacy-save migration.
- **Gameplay coverage:** narrative mechanics require adapter coverage beyond the fixed five-step sequence. Sources: [story bible](docs/minecraft-global/narrative/STORY-BIBLE.md), [activity adapters](apps/roblox/src/server/Activities/ActivityAdapters.luau).
- **Cultural review:** preserve distinctions between real-place settings, literary reconstructions, and legend. The bible explicitly treats Peach Blossom Spring as literature and Kitezh as folklore. All historical claims, translations, question answers, and adaptation choices require human review; this report supplies none. Sources: [story bible](docs/minecraft-global/narrative/STORY-BIBLE.md), [knowledge review schema](packages/knowledge-v12/index.ts).
- **Original work:** require original text, art, music, and assets with provenance. Review the existing external animation reference before reuse: [NpcAnimator](apps/roblox/src/shared/npc/NpcAnimator.luau).
- **NOT TESTED:** Studio loading, objective completion, reconnect persistence, concurrent reward claims, cooperative eligibility, chapter navigation, touch controls, and RTL presentation. These require Roblox runtime proof.

