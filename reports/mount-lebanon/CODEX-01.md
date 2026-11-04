# CODEX-01: Integration and persistence specification

- **Backend**: codex (codex-cli 0.166.0)
- **Worktree**: `/home/wael/Code/mv-wt-ml/CODEX-01`
- **Start**: 2026-11-04T18:34:40.254Z
- **End**: 2026-11-04T18:35:52.903Z
- **Status**: COMPLETED

---

Inspected only the five specified files; no files modified.

1. **Registry and map integration**

   `WorldRegistry` currently has no `LOCATIONS`, `getLocation`, `defaultLocation`, `defaultLocationId`, or `canTravel`; these are prerequisite additions. Define their contract explicitly:
   - `LOCATIONS[id]`: canonical ID, country, world origin, spawn offset, scene identifier, and challenge/station ownership.
   - `getLocation(id)` → record or `nil`; unknown IDs must never silently resolve to a default.
   - `defaultLocation(cc)` → record or `nil`; `defaultLocationId(cc)` → ID or `nil`, with `"LB"` → `"byblos"`.
   - `canTravel(fromId, toId)` → boolean using registry-defined transitions; explicitly define `nil` as the lobby and its allowed destinations.

   `MapBuilder.build()` should enumerate locations, dispatch scene construction by registry metadata, and build uniquely identified location spawns. Add `getLocationSpawn(id)`; retain `getSpawn(cc)` as a wrapper resolving the country’s default location. Update existing-map completeness checks to require all registered location spawns, including `mount_lebanon`. Country portals resolve defaults; location portals pass canonical destination IDs. Mentor/station callbacks must carry their owning location ID. Preserve existing country accessor compatibility.

2. **One authoritative travel path**

   Add `location: string?` to `Session`. Make `enterCountry(player, cc)` resolve `defaultLocation(cc)` and delegate to `enterLocation(player, id)`.

   Both ultimately use one travel implementation that:
   - Validates argument type, destination existence, `not s.busy`, and `Registry.canTravel(s.location, destinationId)`.
   - Resolves the destination spawn and character before changing state; rejects unavailable destinations.
   - Locks travel before `RequestStreamAroundAsync`, which yields. Rechecks session/character validity afterward; prevents concurrent travel or challenge execution.
   - On successful movement, assigns `s.country` from the registry and `s.location`, recomputes challenge index, updates persistence, marks dirty, and publishes state. Releases the lock on every exit.

   Return structured failures (`invalid`, `busy`, `travel-not-allowed`, `unavailable`). `SelectCountry` currently ignores `enterCountry`’s result and always reports success; propagate the actual result. Any `SelectLocation` remote must use the same path and shared travel cooldown.

   Route lobby travel through the same locking/policy checks. Currently the physical lobby prompt bypasses the remote’s busy guard. Clear both session identifiers on return; retain saved last destination for future resume.

3. **Block Byblos challenges in Mount Lebanon**

   At the start of `runCurrent`, require the current location to own the selected challenge set. Existing LB challenges belong to `byblos`; return `wrong-location` in `mount_lebanon` **before inventory repair or challenge execution**, regardless of distance or mentor status.

   Mentor/station handlers must reject mismatched location ownership instead of implicitly calling `enterCountry`; otherwise callbacks can bypass intended travel behavior. Calculate station proximity from the owning location’s origin. After a yielding challenge, validate both country **and location** before recording completion.

   Include `location`, `busy`, and `canRunChallenge` in snapshots; derive station availability from location ownership. In `Main.client.luau`, gate Play on `canRunChallenge`, rather than `not hasStations`, and avoid displaying Byblos objectives/stamps as Mount Lebanon objectives. Server checks remain mandatory.

4. **Persistence and migration**

   Prefer schema **3**, retaining datastore `"MiraVerseProgress"` and existing user keys:
   ```luau
   lastCountry: string?,
   lastLocation: string?,
   visitedLocations: { [string]: boolean },
   countries[cc].locations[locationId] = true
   ```

   On successful travel, write both last-destination fields and set both visit indexes to `true`.

   Replace the current migration version shortcut/fallback: simply bumping the version would discard existing v2 countries and inventory. Normalize v1/v2/v3 saves while preserving countries, chapters, completed challenges, stamps, mentor flags, acts, questions, and inventory. Ensure `countryOf` fills missing sub-tables on existing country records.

   Preserve valid `lastLocation`; derive its country from the registry. When missing or invalid, resolve `defaultLocationId(lastCountry)`. Thus legacy `{ lastCountry = "LB" }` becomes `lastLocation = "byblos"`. Retain `lastCountryId`/`passportStamps` legacy import without overwriting existing chapter stamps. Mark the resolved last location visited in both indexes; reconcile existing true visit entries. Migration must be idempotent.

   In `UpdateAsync`, union visit sets so `true` cannot be overwritten by `false`; write last country/location as a consistent pair. Normalize the stored record before merging. Mark successfully loaded, migrated records dirty so migration persists without additional gameplay.

   Acceptance checks: v1/v2 LB saves retain stamps/completions/inventory and acquire Byblos location; repeated migration is unchanged; invalid, disallowed, busy, and missing-spawn travel leaves state untouched; Mount Lebanon rejects direct `RunChallenge` and Byblos station callbacks; concurrent travel during streaming cannot interleave.

