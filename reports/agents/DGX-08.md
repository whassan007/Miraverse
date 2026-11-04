# DGX-08: Terrain generation engine spec

Backend: dgx (qwen3-coder:30b)

# MiraVerse Terrain Generation Engine Specification  
**Worker DGX-08 | Read-Only Wave**

---

## 🔍 Findings

### 1. **Map Structure Overview**
The `MapBuilder` module orchestrates the creation of a world map with:
- A central **Travel Lobby** (lobby area) where players can choose countries.
- Per-country **Plazas**, each containing:
  - Spawn point
  - Mentor NPC
  - Build origin
  - Return portal to lobby

### 2. **Country Data Resolution**
- Countries are defined by IDs (`LB`, `EG`, etc.)
- Fallback metadata is hardcoded in `FALLBACK_META`.
- Optional override via `ContentData` module in `ReplicatedStorage.Shared`.

### 3. **Map Building Process**
- Uses a procedural layout with:
  - `buildTravelLobby`: Places portals in a circle.
  - `buildCountryPlaza`: Builds each country's plaza using:
    - Positioning logic (`plazaCenter`, `radius`)
    - Color resolution via `hexToColor3`
    - Billboard labels for mentor/portal names

### 4. **Persistence & Reuse**
- If map exists and is valid, it reuses it.
- Otherwise rebuilds entire structure.

### 5. **Runtime Dependencies**
- Requires `Workspace` and `ReplicatedStorage`.
- Assumes presence of `Shared.ContentData` or `Content` module.

---

## 🧱 Implementation Specification

### Input Requirements
- A list of supported country codes: `{"LB", "EG", "IQ", "KR", "FR"}`
- Optional content pack override in `ReplicatedStorage.Shared.ContentData` or `Content`.

### Output Structure
The final map is structured as:
```
Workspace
└── MiraVerseMap (Folder)
    ├── TravelLobby (Folder)
    │   ├── LobbyPlatform (Part)
    │   ├── LobbyTrim (Part)
    │   ├── SpawnLocation (SpawnLocation)
    │   └── Portal_<CC> (Part) × 5
    └── Plaza_<CC> (Folder) × 5
        ├── PlazaFloor_<CC> (Part)
        ├── PlazaBorder_<CC> (Part)
        ├── Spawn_<CC> (Part)
        ├── Mentor_<CC> (Part)
        ├── BuildOrigin_<CC> (Part)
        ├── ReturnLobby_<CC> (Part)
        └── MentorBillboard (BillboardGui)
```

### Core Functions
- `MapBuilder.build()` — Creates full map.
- `MapBuilder.getSpawn(country)` — Returns spawn point for country.
- `MapBuilder.getMentorSpot(country)` — Returns mentor NPC position.
- `MapBuilder.getBuildOrigin(country)` — Returns build origin.

---

## 📁 Files Owned by Later Implementation

| Path | Ownership |
|------|-----------|
| `/apps/roblox/src/server/MapBuilder.luau` | This file is read-only; no changes allowed. |
| `ReplicatedStorage.Shared.ContentData` | Optional override module (to be authored by content team). |

---

## ⚙️ Dependencies

| Dependency | Source |
|----------|--------|
| `Workspace` | Roblox Engine |
| `ReplicatedStorage` | Roblox Engine |
| `Shared.ContentData` or `Content` ModuleScript | Content Pack Override |
| `Enum.Font.Gotham*` | Roblox Core Assets |
| `Color3.fromRGB`, `CFrame.lookAt` | Roblox API |

---

## ❓ Open Gaps

### 1. **Country-Specific Cultural Assets**
- No actual cultural artifacts or landmarks are generated.
- No terrain textures, buildings, or historical structures.
> Requires human input for real-world places and legends.

### 2. **Localization Support**
- Only English (`name_en`, `mentor.greeting_en`) is supported.
> Localization not implemented; needs language packs.

### 3. **Real Historical/Geographical Accuracy**
- No geolocation logic or historical accuracy built-in.
> Requires external review for real-world locations and legends.

### 4. **Terrain Generation**
- No terrain generation logic beyond simple platform placement.
> Not part of this scope; requires additional systems (e.g., heightmaps, biomes).

---

## 🛑 Runtime Verification Notes

| Feature | Status |
|--------|--------|
| `buildTravelLobby` with portals | NOT TESTED — Requires runtime to confirm `CFrame` and `ProximityPrompt` behavior |
| `buildCountryPlaza` with mentors | NOT TESTED — Requires character model and animation setup |
| BillboardGui rendering | NOT TESTED — Requires UI rendering in Roblox Studio |

--- 

**End of Report**
