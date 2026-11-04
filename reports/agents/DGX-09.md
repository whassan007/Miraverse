# DGX-09: Reusable architecture generator spec

Backend: dgx (qwen3-coder:30b)

# MiraVerse Reusable Architecture Generator Report

## Findings

The current `MapBuilder` module in `apps/roblox/src/server/MapBuilder.luau` implements a dynamic map generation system for the MiraVerse children's cultural game. It creates a central "Travel Lobby" with portals to five countries (LB, EG, IQ, KR, FR), each with country-specific content.

Key architectural elements:
1. **Country Metadata Management**: Uses `FALLBACK_META` for default country data and supports override via `loadContentPacks()`
2. **Dynamic Map Building**: Generates map structure including lobby, country plazas, portals, spawns, and mentor spots
3. **Reusable Components**: Creates standardized parts with consistent naming patterns and attributes
4. **Configuration System**: Supports content pack overrides for localization, colors, and mentor data

## Specification

### Reusable Architecture Interface
```luau
-- MapBuilder.luau
export type CountryId = "LB" | "EG" | "IQ" | "KR" | "FR"

type CountryMeta = {
	country: CountryId,
	name_en: string,
	primary: string, -- hex color
	secondary: string, -- hex color
	mentorName: string,
	mentorGreeting: string,
}

-- Core functions for reusable architecture
function MapBuilder.build(): Folder
function MapBuilder.getSpawn(country: string): BasePart?
function MapBuilder.getMentorSpot(country: string): BasePart?
function MapBuilder.getBuildOrigin(country: string): BasePart?
```

### Generated Structure Schema
The system generates a hierarchical map structure:
```
MiraVerseMap/
├── TravelLobby/
│   ├── LobbyPlatform
│   ├── LobbyTrim
│   ├── SpawnLocation
│   ├── PortalPedestal_{CC}
│   ├── Portal_{CC}
│   │   └── TravelPrompt
│   └── BillboardGui (mentor info)
└── Plaza_{CC}/
    ├── PlazaFloor_{CC}
    ├── PlazaBorder_{CC}
    ├── Spawn_{CC}
    ├── Mentor_{CC}
    │   └── MentorPrompt
    ├── BuildOrigin_{CC}
    └── ReturnLobby_{CC}
        └── ReturnPrompt
```

## Implementation Ownership

### Files to be implemented:
1. `apps/roblox/src/server/MapBuilder.luau` - Core architecture (already exists)
2. `apps/roblox/src/shared/ContentData.lua` or equivalent - Country content packs (to be created)
3. `apps/roblox/src/server/MapBuilderService.lua` - Service wrapper (to be created)
4. `apps/roblox/src/client/MapClientHandler.luau` - Client-side map interaction (to be created)

### Dependencies:
1. `ReplicatedStorage.Shared.ContentData` - Content pack module
2. `Workspace.MiraVerseMap` - Generated map container
3. `Player.Character` - Runtime character for teleportation

## Open Gaps

1. **Content Pack Format Specification** - No defined schema for `ContentData` module structure
2. **Localization Support** - Only English name fallback exists, no language selection mechanism
3. **Dynamic Country Addition** - Hardcoded 5 countries, no extension mechanism
4. **Mentor Dialog System** - No implementation for mentor greeting or cultural story interaction
5. **Country Legend/Story Integration** - No system for embedding historical/cultural narratives
6. **Visual Customization** - No support for different map themes or visual styles
7. **Performance Monitoring** - No metrics for map generation timing or memory usage

## Not Tested Elements

- Mentor dialog and cultural story implementation
- Dynamic content pack loading behavior (due to lack of runtime proof)
- Cross-country teleportation mechanics
- Map scaling and performance on large maps
- Client-side rendering of dynamic elements

## Notes on Data Limitations

The current implementation is limited by:
- Hardcoded country list in `COUNTRIES`
- Fallback metadata for all 5 countries only
- No support for additional cultural content beyond name, colors, and mentor info
- Truncated file excerpts prevent full analysis of content pack structure

This architecture provides a foundation for dynamic map generation but requires additional implementation for full cultural storytelling capabilities.
