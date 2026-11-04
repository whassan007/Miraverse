# CODEX-01: World-generation framework and registries

Backend: codex (default)

**CODEX-01 — World-generation framework and registries**

Read-only inspection completed. No files changed, builds run, commits, publishing, or deployments performed.

**Findings**

- The active entrypoint calls `MapBuilder.build()` followed by `SessionManager.init()`. The builder creates a lobby and five generic country plazas with spawn, mentor, build-origin, and return markers. It does not consume the detailed world specifications. Sources: [Main.server.luau](apps/roblox/src/server/Main.server.luau), [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau).
- Coordinates conflict: the builder places LB at plaza center `(160,10,0)`; the bootstrap and Byblos art specification use `(-220,8,0)`; the modular building bounds also occupy negative X. These contracts need reconciliation before integration. Sources: [WorldBootstrap.luau](apps/roblox/src/server/Foundation/WorldBootstrap.luau), [Byblos specification](art/v06/roblox-worlds/LB/byblos-world-spec.json), [ByblosModularBuilder.luau](apps/roblox/src/server/Building/ByblosModularBuilder.luau).
- Content loading is inconsistent: the compiler emits `Shared/Packs.luau`, SessionManager requires `Packs`, but MapBuilder searches for `ContentData` or `Content` and otherwise uses embedded metadata. Sources: [Roblox compiler](tools/compiler/roblox.ts), [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau), [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau).
- Portal prompts move characters directly, while `SelectCountry` separately updates session state and moves characters. A shared arrival operation is needed to keep location and selected country consistent. Sources: [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau), [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau).
- Existing-map reuse checks marker names but does not validate their types, transforms, portal completeness, or generation version. Source: [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau).

**Implementation-ready specification — proposed**

The following contracts address those findings; they describe future implementation, not existing behavior.

| Component | Required contract |
|---|---|
| World registry | One versioned definition per canonical country ID from [content schema](packages/content/schema.ts): stable world ID, explicit ordering, origin, local bounds, spawn, portal, return, mentor and build anchors, generator ID, content references, review status, and budgets. Store geometric values in studs; keep geographic coordinates separate. |
| Landmark and asset registries | Unique IDs; world ownership; local transform; primitive recipe or first-party asset reference; collision role; provenance and rights record. Reject unknown references and third-party assets. Existing rights declarations are inputs to review, not independent proof: [LICENSES.json](assets/LICENSES.json). |
| Cultural references | Reference existing knowledge IDs and review metadata. Distinguish real-place representation, literary work, legend/folklore, and fictional game content using the ontology’s entity and knowledge classifications. Do not derive historical truth from a display name. Basis: [knowledge types](packages/knowledge-v12/index.ts). |
| Compilation | Validate IDs, finite transforms, positive dimensions, bounds containment, references, rights, and review gates before emitting deterministic `WorldRegistry.luau`. Load metadata through the existing `Packs` contract. Extend [compiler pipeline](tools/compiler/index.ts). |
| Generation lifecycle | `validate(definitions)` → `plan(worldId, seed)` → `build(plan)` → `validateGenerated(root)`. Build in an unparented staging folder; publish only after validation. On failure, destroy staging and retain the previous valid world. Match registry version and seed for reuse. |
| Consumer compatibility | Preserve `MiraVerseMap`, `Spawn_<CC>`, `Mentor_<CC>`, `BuildOrigin_<CC>`, and the existing getter API during migration. Validate marker classes and use scoped lookup. Basis: [MapBuilder API](apps/roblox/src/server/MapBuilder.luau). |
| Arrival | Route portal prompts and country selection through one server-owned operation: allowlist destination, confirm generated spawn, enforce request limits/proximity where applicable, then update session destination and move the character. Basis: current split in [SessionManager](apps/roblox/src/server/Core/SessionManager.luau). |
| Acceptance | Add deterministic-plan, invalid-reference, bounds, marker-contract, rebuild, and rollback checks. Studio acceptance must cover traversal, respawn, streaming, multiplayer arrivals, collision safety, and device performance. Streaming is configured in [Rojo project](apps/roblox/default.project.json). |

**Files a later implementation would own**

- Modify: `apps/roblox/src/server/MapBuilder.luau`, `apps/roblox/src/server/Foundation/WorldBootstrap.luau`.
- Add: `packages/world-generation/schema.ts`, `content/worlds/{hub,LB,EG,IQ,KR,FR}.json`, `tools/compiler/worlds.ts`.
- Add: `apps/roblox/src/server/WorldGeneration/{WorldGenerator,WorldValidator,PrimitiveRegistry}.luau`.
- Generate: `apps/roblox/src/shared/WorldRegistry.luau`.
- Add contract tests under `tests/roblox/world-generation/`.

These are proposed ownership boundaries extending the existing [compiler](tools/compiler/index.ts) and [server layout](apps/roblox/src/server/Main.server.luau).

**Dependencies and open gaps**

- Coordinate selection requires agreement with building/plot owners; arrival integration requires the session owner. Existing contracts: [plot bounds](apps/roblox/src/server/Building/ByblosModularBuilder.luau), [session handling](apps/roblox/src/server/Core/SessionManager.luau).
- Human review must reconcile mentor identities and cultural labels across fallback metadata, content packs, and art specifications. Translations, historical claims, literary/legend classifications, and question answers remain review gaps; none are supplied or validated here. Sources: [MapBuilder metadata](apps/roblox/src/server/MapBuilder.luau), [content packs](packages/content/packs/LB.json), [Byblos specification](art/v06/roblox-worlds/LB/byblos-world-spec.json).
- Numeric world budgets and spawn-clearance criteria need agreement and measurement. The hub art specification contains proposed device settings, not runtime evidence: [hub specification](art/v06/roblox-hub/hub-scene-spec.json).
- **NOT TESTED:** Roblox Studio execution, generated-world appearance, collision/navigation safety, streaming, multiplayer behavior, performance, and runtime integration. The inspected Roblox test checks configuration and source text; it does not establish world-generation behavior: [roblox-v04.test.ts](tests/roblox/roblox-v04.test.ts).

