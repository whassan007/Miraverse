# GEMINI-01: Roblox Studio Visual & Spatial Architecture Inspection

- **Backend**: Gemini / Antigravity (`research` subagent `adc8522b-4c58-4495-96c6-0072060d8220`)
- **Worktree**: `/home/wael/Code/mv-wt-ml/GEMINI-01`
- **Status**: COMPLETED

---

## 1. Current Byblos Visual Boundaries, Part Positions, Terrain Extents, Spawn & Camera Orientation

### World Cell & Origin (`WorldRegistry.luau`)
- **Cell Allocation:** `CELL_SIZE = 800`, `GROUND_Y = 10`, `LOBBY = Vector3.new(0, 10, 0)`.
- **Lebanon (`LB`) Origin:** Index `1` -> `c = Vector3.new(800, 10, 0)`.

### Terrain Extents (`ByblosWorld.luau`)
All terrain coordinates are relative to `c = (800, 10, 0)` with `groundTop = c.Y - 3 = 7` and `sea = c.Z - 48 = -48`:
- **Land Block (Ground):** Centered at `(c.X, -3, c.Z + 42)` with size `(204, 20, 180)`.
  - **X Range:** `c.X - 102` to `c.X + 102` (`698` to `902`)
  - **Y Range:** `-13` to `7`
  - **Z Range:** `c.Z - 48` to `c.Z + 132` (`-48` to `+132`)
- **Background Hills (Grass Balls):** 4 spheres at `X` offsets `{-80, -30, 30, 80}`, centered at `(c.X + offset, -3, c.Z + 118)` with radii `34` (`i=2,4`) and `42` (`i=1,3`).
  - **Max Z Extent:** Up to `c.Z + 160` (`+160`), rising to `Y = 39` (`c.Y + 29`).
- **Sea Floor & Water (North of Quay):** Centered at `(c.X, groundTop - 15, c.Z - 118)` (Sand, size `204x8x140`) and `(c.X, groundTop - 7.5, c.Z - 118)` (Water, size `204x7x140`).
  - **Z Range:** `c.Z - 188` to `c.Z - 48` (`-188` to `-48`).

### Core Plaza & Landmark Part Positions (Relative to `LB` Origin `c = (800, 10, 0)`)
- **Town & Plaza Base:**
  - `TownGround`: Position `(0, -2.1, +34)`, Size `(204, 4, 164)` -> spans `X: [-102, +102]`, `Z: [-48, +116]`.
  - `PlazaFloor_LB`: Position `(0, -1, 0)`, Size `(96, 2, 96)` -> spans `X: [-48, +48]`, `Z: [-48, +48]`, Cobblestone.
  - `PlazaBorder_LB`: Position `(0, -1.2, 0)`, Size `(100, 1.2, 100)` -> spans `X: [-50, +50]`, `Z: [-50, +50]`, Limestone.
- **Spawn & Arrival Orientation:**
  - `Spawn_LB`: Position `(0, 0.5, +28)` (`World: (800, 10.5, 28)`), Size `(8, 1, 8)`, unrotated identity `CFrame` (facing `-Z`, toward the plaza center and harbor).
  - **Player Arrival Pivot (`SessionManager.luau`):** `enterCountry` calls `moveTo(player, spawn.CFrame + Vector3.new(0, 4, 0))`, placing the character at `(800, 14.5, 28)` facing `-Z` (north/harbor-ward).
  - **Arrival Camera Orientation:** Because `Spawn_LB` has identity rotation (`LookVector = (0, 0, -1)`), the player and default follow camera arrive looking toward **`-Z`** (across the central plaza `Z = 0` toward the harbor at `Z = -56`). Anything at `Z > 28` is behind the player's back and behind the camera frustum on arrival.
- **5 Challenge Stations (`WorldRegistry.STATIONS.LB`):**
  - `build` ("Stone House to Restore"): `(+22, 0.2, -14)`, faces `(+22, -40)`.
  - `cook` ("Saj Kitchen"): `(-14, 0.2, -14)`, faces `(-14, -30)`.
  - `gather` ("Terrace Harvest"): `(-66, 0.2, +14)`, faces `(-66, 0)`.
  - `trade` ("Old Stone Souk"): `(+26, 0.2, 0)`, faces `(+40, 0)`.
  - `word` ("Teta's Courtyard"): `(-12, 0.2, +2)`, faces `(-30, +2)`.

---

## 2. Current Lack of Mount Lebanon Geometry, Spawn, and Travel Prompts

Across all five inspected files, **Mount Lebanon does not exist**:
1. **`WorldRegistry.luau`:** Defines only flat country cells (`COUNTRY_ORDER = { "LB", "EG", "IQ", "KR", "FR" }`) and `STATIONS.LB` for the 5 Byblos chapter 1 stations.
2. **`ByblosWorld.luau`:** Only generates the coastal town of Byblos (`X: [-102, +102]`, `Z: [-188, +160]`).
3. **`MapBuilder.luau`:** Only creates `Spawn_LB`, `Mentor_LB`, `BuildOrigin_LB`, and `ReturnLobby_LB` inside `Plaza_LB`.
4. **`SessionManager.luau` & `Main.client.luau`:** Only support top-level country codes and teleport exclusively to `MapBuilder.getSpawn(cc)`.

---

## 3. Arrival UX: Why Travel Prompts Must Be Positioned at `Z <= 28`

When a player travels to Byblos or Mount Lebanon:
1. **Spawn Position & Facing:** The character arrives at `Z = +28` relative to the location origin, facing **`-Z`**.
2. **Camera Frustum on Arrival:** The default Roblox camera sits behind the character at `Z > 28` looking forward toward `-Z`.
3. **Requirement for `Z <= 28`:** Positioning regional travel prompts north, west, or east of the arrival point (`Z <= 28` relative to origin, e.g., `(42, 0, 18)` in Byblos and `(-22, 0, 12)` / `(22, 0, 12)` in Mount Lebanon) places the portal and its `BillboardGui` / `ProximityPrompt` **in front of the arrival camera frustum**, ensuring immediate visual discoverability upon arrival.

---

## 4. Status of Live Roblox Studio MCP Bridge (`localhost:44755`)

- **Host Environment:** Headless Linux host (`dgx-spark`).
- **Bridge Status:** `localhost:44755` has **no connected Roblox Studio plugin client**.
