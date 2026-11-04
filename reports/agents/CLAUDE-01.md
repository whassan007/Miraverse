# CLAUDE-01: Principal world architecture

Backend: claude (sonnet)

# CLAUDE-01 report: principal world architecture (Roblox)

Read-only wave. I made no edits and did not touch Studio. Everything marked NOT TESTED needs runtime proof. I wrote no cultural facts, translations or answers.

## 1. Findings

**F1. Two conflicting world layouts exist.**
- The code that runs today is `apps/roblox/src/server/MapBuilder.luau`. It builds a 68×68 `TravelLobby` at (0,10,0). It builds five `Plaza_<CC>` floors on a line at `x = index*160, z = 0`, at x = 160, 320, 480, 640, 800. Each is 96×96.
- `apps/roblox/src/server/Foundation/WorldBootstrap.luau` and `art/v06/roblox-worlds/*/*-world-spec.json` describe a different layout. It has world origins at LB (-220,8,0), EG (0,8,220), IQ (0,8,-220), KR (220,8,220) and FR (220,8,0).
- Nothing requires `WorldBootstrap`. I grepped `apps/roblox/src` and found no `require` of it.
- The art specs and the live builder disagree on positions. Neither is verified in Studio (NOT TESTED).

**F2. The hub specification is not implemented.**
- `art/v06/roblox-hub/hub-scene-spec.json` puts portals in an arc at z ≈ -24 to -30. The builder uses a ring of radius 24 instead.
- Its `lighting` block (clockTime 16.5, brightness 2.4, atmosphere) is not applied anywhere in `MapBuilder.luau`.
- Its `lowDeviceFallback` streaming radii (256/64) are not applied. `default.project.json` only sets `StreamingEnabled = true`.
- Its `status` field (LB `READY`, others `EXPANSION_READY`) is unused. All five portals are equally enabled.

**F3. The "worlds" are placeholder geometry.**
- Each plaza is a coloured slab, a spawn pad, a mentor block, a build-origin pad and a return portal.
- The landmarks in the art specs (for example `lb_harbor_quay`, `cairo_mashrabiya_courtyard`) are not built.
- A 16-part Byblos kit and plot bounds exist in `Building/ByblosModularBuilder.luau`, but no builder places a Byblos restoration plot.
- I did not read the Byblos quest or co-op files in detail.

**F4. Identity data is inconsistent.**
- `MapBuilder.luau` fallback mentors: Teta Salwa, Ammo Karim, Bibi Nadia, Halmeoni Sunja, Mamie Colette.
- Art specs use `mentorId` values: `npc_teta_nahla` (LB, plus other LB NPCs), `npc_layla_cairo`, `npc_noor_baghdad`, `npc_jiwoo_jeonju`, `npc_camille_lyon`.
- Neither set matches the other. The real source of truth is the generated `Packs.luau`, which is gitignored (`.gitignore:8`) and produced by `tools/compiler/roblox.ts`.
- `MapBuilder.loadContentPacks` looks for `Shared/ContentData` or `Shared/Content`, which do not exist. It silently falls back to hard-coded values, while `SessionManager` requires `Shared/Packs`. The two read different sources.
- `KnowledgeV12.luau`'s `countrySequence` is LB, IQ, EG, FR, KR. The client and `MapBuilder` use LB, EG, IQ, KR, FR.

**F5. The portal and arrival logic is thin and has gaps.**
- `MapBuilder.luau` portals teleport via `PivotTo` on the server, with no check on country, readiness or arrival state.
- `SessionManager.SelectCountry` looks up `Workspace:FindFirstChild("Spawn_"..cc, true)`. It also teleports, so there are two teleport paths.
- `WorldBootstrap.resolveArrivalZone` (saved country, then launch hint, then LB) is never called.
- `MapBuilder.build` can destroy and rebuild `MiraVerseMap` at runtime, via `getSpawn` and similar calls.
- The return portal teleports to a hard-coded `CFrame.new(0,14,0)`.

**F6. Safety constraints are already encoded and must be preserved.**
- Chat is disabled in `client/Main.client.luau`.
- Remotes are rate-limited in `SessionManager.luau`.
- `core/SecurityAndPersistence.luau` forbids external commerce and keeps monetisation off.
- `SessionManager` is session-only, with no DataStore.
- `ALLOWED_REMOTES` in `WorldBootstrap.luau` lists remotes that do not exist in `SessionManager.luau`.

**F7. Packaging and tests.**
- `apps/roblox/default.project.json` maps `src/shared` → `ReplicatedStorage.Shared`. This was fixed in commit 9380d1a.
- Tests in `tests/roblox/roblox-v04.test.ts` only assert the Rojo config and security flags. No test checks world layout or spec/builder parity.
- The release procedure is in `apps/roblox/tools/release/ROBLOX_RELEASE_CHECKLIST.md`. It says to keep the build unpublished and never invent Place or Universe IDs.

## 2. Implementation-ready specification (world architecture)

**S1. One layout, one source of truth.**
- Add `art/v06/roblox-worlds/world-layout.json` as the single source. It holds the hub origin and the five zone origins, using the art-spec origins unless the owner decides otherwise (gap G1).
- Generate or load a typed `Shared/WorldLayout.luau` from it, following the `compileRoblox` pattern in `tools/compiler/roblox.ts`.
- Make `WorldBootstrap.luau` and `MapBuilder.luau` both read only that module. Delete the duplicate coordinates.
- Keep zones at least 160 studs apart for streaming, with a hub exclusion radius.

**S2. Zone contract (per country).** Each zone is a `Model` named `Zone_<CC>`, with these children and attributes:
- `Spawn`, `Mentor`, `BuildOrigin` and `ReturnPortal`.
- A `Landmarks` folder, one anchor per landmark id taken from the art spec.
- Attributes `Country`, `Status` (`READY` or `EXPANSION_READY`) and `LayoutVersion`.
- Names stay compatible with the current `Spawn_<CC>`, `Mentor_<CC>` and `BuildOrigin_<CC>`, because `SessionManager` and `MapBuilder.getSpawn` look them up by name.

**S3. Hub.** Implement the hub from `hub-scene-spec.json`: portal positions and labels, plus a lighting block applied once at server start. Portals for `EXPANSION_READY` zones should show a "coming soon" state. The exact behaviour is a design gap (G3).

**S4. Single server-authoritative travel path.**
- Add a `TravelService`. Remote `RequestWorldArrival` (already in `ALLOWED_REMOTES`) carries a country id.
- It validates the id against the layout allowlist, then applies the cooldown, a readiness check and distance-to-portal against `MAX_INTERACT_DISTANCE_STUDS`.
- It teleports once, from the server, to the layout spawn.
- Replace the direct `Triggered` teleports in `MapBuilder.luau` and the teleport in `SelectCountry` with calls into `TravelService`.
- `resolveArrivalZone` is used for first spawn only. Its saved-country input needs persistence, which is session-only today (G5).

**S5. Build and streaming.**
- Build the map once at startup. Remove the destroy-and-rebuild-on-lookup fallback in `getSpawn`, `getMentorSpot` and `getBuildOrigin`.
- Mark each zone model `ModelStreamingMode = Persistent` for spawns and `Atomic` for landmark models.
- Apply the `lowDeviceFallback` radii from the hub spec through `Workspace.StreamingTargetRadius` and `StreamingMinRadius`.
- Add per-zone budgets to the existing `tools/v06/roblox-perf/check-budgets.mjs`. Its output is static only and must not claim FPS.

**S6. Landmark build order.** Do LB first (flagship), using the five `lb_*` landmarks and the 16-part kit, then the other four zones. Use original primitive, procedural or kit parts only, with no third-party assets.

**S7. Identity and content binding.**
- Build mentor and landmark labels from `Packs.luau` and the art specs, not from hard-coded fallback strings. Cut the fallback strings once G2 is settled.
- If a content field is missing, show a neutral placeholder, not an invented name.

**S8. Child safety invariants (do not regress).** No free-text chat, no external links or QR codes, and no monetisation. Server-validated remotes with rate limits. No personal data in labels.

**S9. Tests to add (all offline).**
- Layout JSON schema check.
- Every art-spec landmark id exists in the layout.
- `WorldBootstrap` and `MapBuilder` coordinates equal the layout.
- All five countries have a zone.
- Static check that no `.luau` file contains a hard-coded teleport coordinate.
- Existing `check-luau.mjs` stays green.

**Runtime verification (all NOT TESTED).** Rojo build, spawn and teleport behaviour, streaming, lighting, and mobile and low-end performance all need Studio.

## 3. Files a later implementation would own
- New: `art/v06/roblox-worlds/world-layout.json`, `apps/roblox/src/shared/WorldLayout.luau`, `apps/roblox/src/server/World/TravelService.luau`.
- Rewrite: `apps/roblox/src/server/MapBuilder.luau`, `apps/roblox/src/server/Foundation/WorldBootstrap.luau`.
- Edit: `apps/roblox/src/server/Main.server.luau`, `apps/roblox/src/server/Core/SessionManager.luau` (travel call only), `apps/roblox/default.project.json` (streaming properties).
- Edit: `tools/compiler/roblox.ts` (or a new compiler) and `tools/v06/roblox-perf/check-budgets.mjs`.
- Edit: `tests/roblox/`.
- Spec updates: `art/v06/roblox-hub/hub-scene-spec.json` and the five `*-world-spec.json` files.
- Not owned (other workers): the Byblos quest, co-op, challenge, avatar and social modules.

## 4. Dependencies
- The `Packs.luau` generator and the content schema in `packages/content/schema.ts` (mentor name and greeting fields).
- The Rojo 7.7.1 build in `package.json`.
- Quest and NPC data in `content/quests/*.json` and `content/v12/npc-enrichment`. I did not review these.
- Human review of mentor identities and cultural landmark content before any visible labels ship.

## 5. Open gaps (human decision or review needed)
- **G1.** Which layout is authoritative: the line at x = index*160, or the art-spec origins?
- **G2.** Which mentor names and ids are canonical? The fallback names and the art-spec NPC ids conflict. All names, greetings and translations need human review.
- **G3.** What should an `EXPANSION_READY` portal do for a child: hide, lock, or allow entry?
- **G4.** Whether each landmark is a real place, literature or legend is not recorded in the art specs. Content owners must classify and approve them, as `KnowledgeV12.luau` does with `claimStatus`. It includes entries marked `disputed` and `source_asserted_unverified`. Any in-world text drawn from it needs review.
- **G5.** There is no persistence, so "saved country" never exists. Persistence is out of scope here.
- **G6.** `ALLOWED_REMOTES` names remotes that are not implemented, and `SessionManager`'s remotes are not in that list. The two need reconciling.
- **G7.** The Place and Universe IDs and the publish step are human-gated per the release checklist.
- **G8.** I did not read the Byblos quest, co-op, plot and challenge modules in detail, so the Byblos restoration-plot placement is only an assumption.

