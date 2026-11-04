# DGX-11: Road, path, bridge and travel graph

Backend: dgx (qwen3-coder:30b)

# MiraVerse Map Builder Report

## Findings

The `MapBuilder` module (apps/roblox/src/server/MapBuilder.luau) constructs the core travel and country map structure for the MiraVerse children's cultural game program. It creates a central "Travel Lobby" with portals to five countries (LB, EG, IQ, KR, FR), each with its own "Country Plaza" containing mentor spots, spawn points, and build origins.

Key features include:
- Central Travel Lobby with 5 country portals arranged in a circle
- Individual Country Plazas positioned along the X-axis
- Each portal and plaza includes:
  - Color-coded parts using country-specific primary/secondary colors
  - Proximity prompts for travel and mentor interaction
  - Billboard labels for UI text
  - Spawn locations and mentor positions
- Content pack support via `ReplicatedStorage.Shared.ContentData` for country metadata customization
- Fallback metadata for each country in case content packs are missing

## Implementation Specification

### Map Structure
1. **Root Folder**: `Workspace.MiraVerseMap`
2. **Travel Lobby**:
   - Folder: `MiraVerseMap.TravelLobby`
   - Platform: `LobbyPlatform` (68x2x68)
   - Trim: `LobbyTrim` (70x1.2x70) around platform
   - SpawnLocation: `SpawnLocation` at center
   - 5 Portals (`Portal_LB`, `Portal_EG`, etc.) arranged in circle
3. **Country Plazas**:
   - Folder per country: `Plaza_LB`, `Plaza_EG`, etc.
   - PlazaFloor (96x2x96) with primary color
   - PlazaBorder (100x1.2x100) with secondary color
   - Spawn part (`Spawn_LB`) at center + Z=28
   - Mentor part (`Mentor_LB`) at center + X=-18, Z=-12
   - BuildOrigin part (`BuildOrigin_LB`) at center + X=12, Z=-12
   - Return portal (`ReturnLobby_LB`) at center + Z=42

### Required Files for Implementation
- `apps/roblox/src/server/MapBuilder.luau` (already provided)
- `ReplicatedStorage.Shared.ContentData` module script for optional country metadata customization
- `Workspace.MiraVerseMap` folder in Roblox Studio

### Dependencies
- Roblox Studio (for testing and deployment)
- `ReplicatedStorage.Shared` folder structure
- `Workspace` root folder
- `Player.Character` objects for travel mechanics
- `CFrame` positioning system for character movement

## Open Gaps

1. **Content Pack Integration**: 
   - Requires actual `ReplicatedStorage.Shared.ContentData` module script with proper format
   - No fallback mechanism tested without content packs (NOT TESTED)

2. **Map Building Verification**:
   - `build()` function creates map only if none exists or is incomplete
   - Runtime verification of all parts present required for production (NOT TESTED)

3. **Cross-Platform Travel Mechanics**:
   - `character:PivotTo()` requires runtime testing with actual character models
   - Travel behavior not fully tested in live environment (NOT TESTED)

4. **Cultural Accuracy**:
   - Country names, mentor names, and greetings are hardcoded for specific cultures
   - No translation or cultural verification provided (needs human review)
   - Specific historical/cultural references not verified (needs human review)

5. **Visual Customization**:
   - Billboard labels use fixed fonts and sizes
   - Color conversion from hex strings is implemented but not fully tested with edge cases (NOT TESTED)

6. **Localization Support**:
   - Only English text supported in prompts and UI
   - No language selection or localization system implemented

7. **Performance Testing**:
   - No information on rendering performance or part count optimization
   - Travel lobby size and portal arrangement not optimized for large player counts (NOT TESTED)

## Notes

- All country data is stored in `FALLBACK_META` table, which serves as the source of truth when content packs are unavailable
- The code uses a circular layout with 5 evenly spaced portals in the travel lobby
- Each country plaza is positioned 160 studs apart along the X-axis
- The module is designed to be run once per server session to build or update the map structure

Truncation in this report reflects the limited file view provided. Full implementation requires runtime testing and actual Roblox Studio environment access.
