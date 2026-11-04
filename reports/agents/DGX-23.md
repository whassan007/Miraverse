# DGX-23: Dynamic quest placement and world binding

Backend: dgx (qwen3-coder:30b)

# MiraVerse DGX-23 Dynamic Quest Placement & World Binding Report

## Findings

The current quest system defines a single chapter (ch1) for Lebanon (LB) with 5 objectives tied to Byblos harbor and Teta Nahla's saj bakery. The quest structure shows consistent patterns:
- All objectives require identical items: flour, za'atar, olive oil
- Each objective has unique challengeType but identical cultural context and vocab words
- Quests are bound to specific landmarks (landmark:LB:main) and NPCs (npc:LB:teta_nahla, npc:LB:amo_farid, npc:LB:nadim_builder)
- World building system uses MapBuilder.luau to generate country plazas with mentor spawns and travel portals

The `LB.json` file defines a complete quest chapter but does not include world binding data for quest placement or landmark positioning.

## Implementation Specification

### Quest Placement Logic
1. **Objective Positioning**: Each objective must spawn in designated station areas:
   - Gather: `station:LB:gather`
   - Trade: `station:LB:trade`  
   - Build: `station:LB:build`
   - Cook: `station:LB:cook`
   - Word: `station:LB:word`

2. **Landmark Integration**: Quests should bind to specific landmarks:
   - `landmark:LB:main` (Byblos Harbor)
   - `prop:LB:saj_dome` (domed saj)
   - `prop:LB:zaatar_bowl` (za'atar station)
   - `prop:LB:courtyard_bench` (courtyard)
   - `prop:LB:harbor_boat` (harbor)

3. **NPC Interaction Points**:
   - Mentor NPC at `npc:LB:teta_nahla`
   - Spice merchant at `npc:LB:amo_farid`
   - Builder at `npc:LB:nadim_builder`

### World Binding Configuration
World binding should establish:
- Quest origin points in country plazas
- Station locations (gather, trade, build, cook, word)
- Landmark positions relative to plaza centers
- NPC spawn locations

## Files Implementation Would Own

1. `apps/roblox/src/server/QuestPlacement.luau` - Dynamic quest placement logic
2. `apps/roblox/src/server/WorldBinder.luau` - World binding configuration and landmark positioning  
3. `content/quests/LB_meta.json` - Lebanon-specific world metadata
4. `content/worlds/LB_plaza_layout.json` - Country plaza layout specifications

## Dependencies

1. **MapBuilder**: Requires `MapBuilder.build()` to complete country plazas before quest placement
2. **NPCSystem**: Needs NPC data in `content/npcs/` for mentor and merchant positioning  
3. **ItemSystem**: Requires item definitions in `content/items/` for required items
4. **LandmarkSystem**: Depends on landmark definitions in `content/landmarks/`

## Open Gaps

1. **Cultural Context Validation**:
   - Lebanese Arabic vocabulary translations need human review
   - Cultural facts about saj baking and Teta Nahla traditions require cultural expert verification
   - Historical accuracy of Byblos harbor architecture not verified

2. **World Layout Data Missing**:
   - No `LB_plaza_layout.json` to define station placements within plazas
   - No landmark positioning data for quest spawning
   - Missing `LB_meta.json` for country-specific world metadata

3. **Runtime Dependencies Not Tested**:
   - `MapBuilder.getSpawn()` function requires runtime testing in Roblox Studio
   - NPC interaction points not confirmed in actual game world
   - Station areas (`station:LB:*`) require verification of spawn locations

4. **Quest Completion Rewards**:
   - Keepsake item definition missing from repository files
   - Bonus MiraToken reward system unimplemented

5. **Localization Gaps**:
   - Native language translations for all quest elements not fully validated
   - Cultural context words need additional linguistic review

## Note on Repository Content

The repository contains only the `LB.json` quest file and `MapBuilder.luau` but lacks:
- Station positioning data for quest placement
- NPC spawn point definitions  
- Landmark coordinate information
- Country-specific world layout files
- Item definitions for required resources
- Cultural context validation materials

This report is based solely on available files and cannot confirm actual runtime behavior in Roblox Studio.
