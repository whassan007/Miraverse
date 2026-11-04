# CODEX-02: Terrain, navigation, spawn and travel integration

Backend: codex (default)

**CODEX-02 — Read-only scope report**

No files changed; no builds, publishing, or deployments performed. Roblox runtime behavior is **NOT TESTED**.

**Findings**

- The executable entry point builds a placeholder lobby and five country plazas, then initializes sessions. Geometry consists of Parts; it does not implement the landmark scenes described by the art specifications. Sources: [Main.server.luau](apps/roblox/src/server/Main.server.luau), [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau), [Byblos scene specification](art/v06/roblox-worlds/LB/byblos-world-spec.json).
- Coordinates conflict: generated LB plaza center is `(160,10,0)` with spawn `(160,10.5,28)`; foundation configuration places LB at `(-220,8,0)`. The building module’s LB bounds also use negative X. These definitions cannot serve as one coherent layout without reconciliation. Sources: [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau), [WorldBootstrap.luau](apps/roblox/src/server/Foundation/WorldBootstrap.luau), [ByblosModularBuilder.luau](apps/roblox/src/server/Building/ByblosModularBuilder.luau).
- Travel has inconsistent state semantics. Portal prompts directly pivot characters without updating sessions; `SelectCountry` resets challenge progress and reports success even when character or spawn is absent. Return portals only move characters. Sources: [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau), [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau).
- Saved-country/launch-hint resolution exists as a module function but is not invoked by the entry point. The progression module stores saves in a Lua table, so it does not establish durable persistence. Sources: [WorldBootstrap.luau](apps/roblox/src/server/Foundation/WorldBootstrap.luau), [Main.server.luau](apps/roblox/src/server/Main.server.luau), [PlayerDataStoreService.luau](apps/roblox/src/server/Progression/PlayerDataStoreService.luau).
- Streaming is enabled; the inspected travel handlers have no destination streaming wait, arrival verification, or recovery flow. Sources: [default.project.json](apps/roblox/default.project.json), [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau), [SessionManager.luau](apps/roblox/src/server/Core/SessionManager.luau).

**Proposed implementation specification**

These are proposed requirements, not existing behavior.

1. **Canonical layout:** Extend `WorldBootstrap` into the single zone registry: ID, origin, bounds, arrival CFrame, hub portal, return portal, safe checkpoint, and landmark anchors. Reconcile with the art coordinates and building bounds before replacing geometry. Generate all positions from this registry.
2. **Terrain and routes:** Build original geometry under `Workspace.MiraVerseMap`; preserve `Spawn_<CC>`, `Mentor_<CC>`, and `BuildOrigin_<CC>` lookup compatibility. Provide continuous, step-free routes from arrival to mentor, activities, and return portal; use an initial minimum route width of eight studs. Protect exposed edges and reserve routes against plot placement. Existing integration anchors: [MapBuilder.luau](apps/roblox/src/server/MapBuilder.luau).
3. **One travel service:** Add server-owned `TravelService.request(player, destinationId, source)`. Accept registry IDs only; derive destination coordinates server-side. Apply a per-player transition lock and cooldown, reject travel during active challenges, and validate proximity for portal requests. Route both prompts and `SelectCountry` through it.
4. **Transactional arrival:** Validate a living character and safe destination, perform a bounded streaming preparation step, recheck the character, pivot, clear velocity, then commit location state and notify the HUD. On failure, return a structured reason and preserve prior quest state. Travel must preserve per-country progress rather than resetting it.
5. **Spawn lifecycle:** Handle initial arrival and `CharacterAdded` through the same service. Initially preserve the existing resolver order—valid saved country, valid launch hint, LB fallback—pending product review. Respawn at the last safe checkpoint; recover falls to that checkpoint. Keep hub location separate from selected quest country.
6. **Navigation feedback:** Add text-and-symbol destination cues, a return-to-hub action, and loading/failure feedback. Integrate with the existing client HUD and controller preference contract: [Main.client.luau](apps/roblox/src/client/Main.client.luau), [NativeControllerAdapter.luau](apps/roblox/src/client/Controls/NativeControllerAdapter.luau).

**Later implementation ownership and dependencies**

- **Own:** `MapBuilder.luau`, `Foundation/WorldBootstrap.luau`; proposed `Foundation/TravelService.luau`, `Foundation/SpawnService.luau`, shared navigation contracts, and client navigation feedback.
- **Coordinate edits:** `Main.server.luau`, `Core/SessionManager.luau`, `Main.client.luau`, and streaming configuration.
- **Dependencies:** building owner for plot coordinates and route clearance; progression owner for save readiness; quest owner for travel locks and progress preservation; art/content owners for approved landmarks and original asset provenance. Relevant contracts reside in [building](apps/roblox/src/server/Building/ByblosModularBuilder.luau), [progression](apps/roblox/src/server/Progression/PlayerDataStoreService.luau), and [session](apps/roblox/src/server/Core/SessionManager.luau) modules.

**Open gaps and acceptance evidence**

- **NOT TESTED:** walkability, collision, spawn clearance, falls, death during travel, streaming timeout, simultaneous players, repeated requests, touch/gamepad navigation, and low-device performance. Require Studio evidence for every destination and return route.
- Human review must classify scene references as **real places, literature, legend, or fictional game settings**, and approve geographic/historical labels, translations, and question answers. The [Byblos specification](art/v06/roblox-worlds/LB/byblos-world-spec.json) supplies scene names, not verification.
- Require original geometry, textures, and audio with provenance; no third-party assets. Soundscape identifiers in that specification do not establish asset availability or authorship.

