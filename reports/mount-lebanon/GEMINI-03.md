# GEMINI-03: Travel & Interaction Verification

- **Backend**: Gemini / Antigravity (`research` subagent `cc873565-8e09-47dd-879f-c74db3ef2244`)
- **Worktree**: `/home/wael/Code/mv-wt-ml/GEMINI-03`
- **Status**: COMPLETED

---

## 1. Audit of Current Travel & Persistence Flow

### `SessionManager.luau` (`apps/roblox/src/server/Core/SessionManager.luau`)
- **State Model**: Tracks `Session = { country: string?, index: number, busy: boolean, met: { [string]: boolean }, save: any }`. Currently lacks `location` in `Session` and `snapshot()`.
- **Travel Paths**:
  - `enterCountry(player, cc)`: Validates `cc`, sets `s.country = cc`, computes `s.index = firstIncomplete(s, cc)`, writes `s.save.lastCountry = cc`, teleports to `MapBuilder.getSpawn(cc)`, and fires `pushState(player, s)`.
  - `returnToLobby(player)`: Sets `s.country = nil`, teleports to `Registry.LOBBY + Vector3.new(0, 4, 0)`, and fires `pushState(player, s)`.

### `ProgressService.luau` (`apps/roblox/src/server/Progression/ProgressService.luau`)
- Defines `Save` type with `schemaVersion = 2`, `lastCountry: string?`, `lastLocation: string?`, `countries: { [string]: any }`, and `inventory: { [string]: number }?`.
- `ProgressService.countryOf(save, cc)` initializes `{ chapters = {}, acts = {}, questions = {}, locations = {} }`.

---

## 2. Requirements for the Full Travel Graph (Single Server-Authoritative Path in `SessionManager.luau`)

| # | Transition | Source State (`country`, `location`) | Target Argument | Target State (`country`, `location`, `displayName`) | Spawn Target |
|---|---|---|---|---|---|
| 1 | **Lobby -> Byblos** | `(nil, nil)` | `"LB"` or `"byblos"` | `("LB", "byblos", "Byblos")` | Byblos spawn (`Spawn_LB` / `Spawn_byblos`) |
| 2 | **Byblos -> Mount Lebanon** | `("LB", "byblos")` | `"mount_lebanon"` | `("LB", "mount_lebanon", "Mount Lebanon")` | Mount Lebanon spawn (`Spawn_mount_lebanon`) |
| 3 | **Mount Lebanon -> Byblos** | `("LB", "mount_lebanon")` | `"byblos"` | `("LB", "byblos", "Byblos")` | Byblos spawn (`Spawn_LB` / `Spawn_byblos`) |
| 4 | **Mount Lebanon -> Lobby** | `("LB", "mount_lebanon")` | `"LOBBY"` / `nil` | `(nil, nil, nil)` | `WorldRegistry.LOBBY + Vector3.new(0, 4, 0)` |
| 5 | **Byblos -> Lobby** | `("LB", "byblos")` | `"LOBBY"` / `nil` | `(nil, nil, nil)` | `WorldRegistry.LOBBY + Vector3.new(0, 4, 0)` |

### Exact Server-Authoritative Path Requirements:
1. **Unified Destination Resolution**:
   - Resolve country codes (`"LB"`, `"EG"`, `"IQ"`, `"KR"`, `"FR"`) via `WorldRegistry.defaultLocation(cc)`.
   - Resolve explicit location IDs (`"byblos"`, `"mount_lebanon"`) via `WorldRegistry.getLocation(locationId)`.
   - Enforce `WorldRegistry.canTravel(fromLocationId, targetLocationId)` so only valid transitions in `travelConnections` are allowed.
2. **Session & Persistence Updates on Travel**:
   - Set `s.country = loc.countryId`, `s.location = loc.locationId`.
   - Call `ProgressService.recordLocationVisit(s.save, loc.countryId, loc.locationId)` which sets `save.lastCountry`, `save.lastLocation`, `save.visitedLocations[locationId] = true`, and `countryOf(save, cc).locations[locationId] = true`.
3. **Server-Side Challenge Lockout in Mount Lebanon**:
   - In `runCurrent(player, requestedKind)`: verify that the current location supports challenges (`s.location == "byblos"` for `"LB"`). If in `"mount_lebanon"`, reject with `{ ok = false, reason = "wrong-location", state = snapshot(player, s) }`.

---

## 3. `Main.client.luau` HUD Requirements

1. **Display Current Location (`displayName`)**:
   - When in a regional destination without stations/challenges (`state.location == "mount_lebanon"`), display `state.locationName` (`"Mount Lebanon — Explore the cedar & olive terraces"`) in `hudText.Text` and keep `lobbyButton.Visible = true` while `playBtn.Visible = false`.
2. **Edge Cases Guarded**:
   - Duplicate travel requests (rate limiting + same-location check).
   - Travel while `s.busy` (active challenge in progress).
   - Invalid destination IDs.
   - Legacy save migration (`lastCountry` set without `lastLocation` defaults to `"byblos"` for `"LB"`).
