# CLAUDE-01: Architecture and acceptance review

- **Backend**: claude (sonnet)
- **Worktree**: `/home/wael/Code/mv-wt-ml/CLAUDE-01`
- **Start**: 2026-11-04T18:34:40.254Z
- **End**: 2026-11-04T18:35:52.903Z
- **Status**: COMPLETED

---

# CLAUDE-01 review: Mount Lebanon playable world

I read only the five assigned files and edited nothing. `MapBuilder`, the portal and prompt code, `Challenges` and the art specs were out of scope, so some conclusions are marked "not verifiable here".

**Verdict: not ready to accept.** The location layer doesn't exist yet. Registry, travel and saves are all keyed by country.

## 1. Data-driven location architecture: fails

- **`WorldRegistry.luau` has no location model.**
  - Everything is keyed by country: `origin(cc)` returns `index * 800`, and `STATIONS` has only an `LB` entry.
  - There is no `locationId`, `countryId`, `locationType`, `displayName`, `spawn`, `spatialBounds` or `travelConnections`, and no Mount Lebanon.
- **Byblos and Mount Lebanon would collide.** Both would resolve to the same LB origin and the same 800-stud cell.
  - `ByblosWorld.build` fills terrain at fixed extents around `center`: a 204×180 land block, hills, and water out to about z-188.
  - Without per-location origins and `spatialBounds`, a second LB scene would overlap it.
  - `build(parent, center)` already takes a center, so it can be reused once a location origin exists.
- **`packages/content/packs/LB.json` has only region stubs.** `regions` lists `byblos`, `mount_lebanon` and `beirut` as `{id, name_en}`. There is no type, source reference or landmark list, so `city` and `region` can't be expressed or validated.
- **Station gating is per country, not per location.** `runCurrent` and `snapshot` use `Registry.STATIONS[cc]`. A second LB location would inherit Byblos's stations and mentor gate.
- **The country list is duplicated.** `VALID` in `SessionManager.luau:17` repeats `COUNTRY_ORDER`. Derive it from the registry.
- **The existing countries are safe if you add a layer rather than rewrite.** EG, IQ, KR and FR have no stations, so `nearStation` returns `true, nil`.
  - Keep `origin(cc)` and `getSpawn(cc)` working by synthesizing a default location `cc` for every country.
  - Add `LB/byblos`, `LB/mount_lebanon` and later `LB/beirut` as additional entries.
  - Reserve a place for Beirut now.
- **Placement has two sources of truth.** Station offsets in `WorldRegistry` and building geometry in `ByblosWorld` are separate, and they don't visibly line up. The "single source of truth" comment is not accurate for placement.

  | Item | Station offset (`WorldRegistry`) | Geometry (`ByblosWorld`) |
  |---|---|---|
  | build | (22,-14), facing z=-40 | plot at (22,-36) |
  | cook | (-14,-14) | bakery at (-30,-28) |
  | trade | (26,0) | stalls at x=44 |
  | gather | (-66,14) | terraces at (-74,-12) and (-60,-6) |

  With a reach of 16, some of these may be marginal. Move the stations into the location record and build the geometry from them, or add a test that checks the two agree.

## 2. Single-authority travel and security: partly good

**Good:**
- `enterCountry` and `moveTo` are the only teleport path, and I found no second teleport service in the reviewed files.
- Destinations are checked against the `VALID` whitelist.
- `RunChallenge` never takes a client challenge ID. It takes the kind from the server session.
- `runCurrent` checks `busy`, the mentor gate and station distance on the server.

**Gaps:**
1. **Client-chosen travel with no checks.**
   - `SelectCountry` lets any client jump to any valid country from anywhere. It doesn't check proximity to a portal, `busy`, or a connection between the two places.
   - `enterCountry` itself never checks `busy`, so a player can be teleported mid-challenge. Only `GoToLobby` checks it.
   - `runCurrent` detects this afterwards with its `"changed"` result, but the challenge has already run against the old origin.
   - Fix: add `travel(player, locationId)` as the single entry point. It should check `busy`, that the target is in the current location's `travelConnections`, and that the player is within reach of the portal.
   - Drop `SelectCountry`, or restrict it to the lobby.
2. **No per-player travel lock.** `moveTo` yields in `RequestStreamAroundAsync`, and `s.country` is set before the move completes. Two concurrent travels interleave.
3. **The `MapBuilder` handlers have no rate limit.** The `travel`, `mentor` and `station` handlers go through `limited` only on the remotes. They also have no busy or distance check of their own. This depends on the prompt code, which I didn't review.
4. **`talkToMentor` and the `station` handler** both call `enterCountry` implicitly, with no busy check and no distance check on the mentor.
5. **`nearStation` uses `Registry.origin(cc)`.** That must become the location's origin. The distance is also flat, so there is no vertical bound. The `x, z` offsets are relative to the country, not the location.
6. **Session creation can race.** `sessionOf` yields inside `ProgressService.load`, so concurrent first calls (for example `GetState` and `SelectCountry` on join) can each load. The later one overwrites `sessions[player]`.

## 3. Progress and legacy migration: preserved today, at risk from the next bump

**Preserved:**
- Chapter keys (`"1"`), challenge IDs (`LB-1-*`), stamps and the `metMentor` flag are unchanged, and `merge` only adds keys.
- `repairInventory` restores trade inputs for older saves.
- `ProgressService.luau` already reserves `lastLocation` and `countries[cc].locations`, so location progress can go there without touching chapter keys.

**Risks:**
1. **`migrate` treats any non-v2 version as legacy and rebuilds from `lastCountryId` and `passportStamps` only.**
   - It copies nothing else, including `countries`, `completed` and `inventory`.
   - It does this for any version that isn't exactly 2, including a future v3.
   - A rolled-back or older server calling `UpdateAsync` would rebuild the stored v3 data from the legacy shape and overwrite it.
   - The same applies if the store holds a v1 save that has `countries`.
   - Fix: only run the legacy path when the legacy keys are present. Keep unknown fields. Treat `schemaVersion > SCHEMA_VERSION` as read-only or pass it through.
2. **A v2 save is returned as-is.** `migrate` doesn't normalize it, so `countryOf` fills in a missing country but not a missing `locations` or `chapters` on an existing one.
3. **The "only ever adds progress" comment is wrong.** In `merge`, the in-memory value wins over the stored one for scalars and numbers.
   - A stale or parallel server can overwrite `lastCountry` and inventory counts with older values.
   - `false` also overwrites `true`.
   - For inventory, add-only isn't achievable with a union, so say so in the comment or use per-item high-water marks.
   - `completed` and `stamp` are safe.
4. **`saveNow` clears `dirty` after the yielding `UpdateAsync`.** A change made during the save is not flagged and waits for the next `markDirty`. Clear the flag before the call and restore it on failure.
5. **Aliasing.** `merge(nil, tbl)` returns the live in-memory table, so the merged payload shares sub-tables with `saves[userId]`.
6. **`ProgressService.load` can leak `saves[userId]`** if the player leaves while it is yielding.

## 4. World representation and arrival UX: not verifiable, with risk

- **No Mount Lebanon builder in the reviewed files.** `ByblosWorld.luau` is the only scene, and it is explicitly Byblos: harbor, quay, boats, souk and old town.
  - It already contains generic cedar trees, rock terrace slabs and green hills, so a quick reuse for Mount Lebanon would produce a copy of Byblos, which is the failure you want to avoid.
  - A separate `MountLebanonWorld` should use terraced slopes, a cedar grove and stone village houses, with no harbor and no souk. It should be driven by `spatialBounds` and a source list in the location record.
- **Content already points at the mountain, but all stations are in Byblos.** `LB.json` items and goals mention a "Mountain Stone House", "Mountain Olive Oil", cedar and terraces, while every challenge station is in the Byblos scene.
- **`LB.json` has no source-backing.** Nothing ties `mount_lebanon` to a source, and the Byblos scene cites `art/v06/.../byblos-world-spec.json`, which I didn't open. Add a `sources` field per region so "not fabricated" can be checked.
- **Arrival UX isn't in the registry.**
  - `enterCountry` teleports with `spawn.CFrame + (0,4,0)`, so facing depends on the spawn part's orientation. `PivotTo` doesn't turn the camera.
  - The registry has no arrival facing, camera target or prompt anchor.
  - Add `spawn = {offset, facing}` per location, and place the travel and mentor prompts in front of that facing. For the camera, set it explicitly or place the prompts within the forward arc.
  - `ByblosWorld` mentions keeping "the return portal clear" but builds none, so portal placement can't be checked from these files.

## Priority fixes

1. Add the location layer to `WorldRegistry` (default location per country, plus `LB/byblos` and `LB/mount_lebanon`), with origin, spawn and facing, stations, bounds and connections.
2. Replace `SelectCountry` and `enterCountry` with a single `travel(player, locationId)`. It should check `busy`, connections, portal proximity and a per-player lock, and be rate limited.
3. Make `migrate` safe for unknown and future versions and for v1 saves that have `countries`, then add `locations` and `lastLocation` as a v3 migration. Fix the `saveNow` dirty race and correct the `merge` comment.
4. Build a distinct Mount Lebanon scene and add per-region source references to `LB.json`.
5. Add tests that:
   - check station and geometry alignment;
   - round-trip a legacy save, including inventory and stamps, through `UpdateAsync`;
   - check that EG, IQ, KR and FR still enter and spawn.

