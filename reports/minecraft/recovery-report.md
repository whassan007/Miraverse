# Miraverse Minecraft recovery report

```text
MIRAVERSE MINECRAFT RECOVERY

AGENTS
Antigravity completed: 0/20
Claude completed: 0/10
Codex completed: 0/10
(None dispatched. The brief requires the vertical slices to pass first. Gemini through
agy was used only to translate strings.)

DEFECT RESOLUTION
1. Identical cities: PARTIAL (Byblos has its own layout, behind a staging flag; 11 of 11 released layouts are still identical)
2. Menu-based quests: PARTIAL (1 physical quest completed on a real server, behind a staging flag; 36 chapters are still menu-based; shortcuts remain in released builds)
3. Silent NPCs: PARTIAL (Karim walks and responds on a real server, behind a staging flag; 55 global NPCs and 5 mentors are unchanged)
4. Missing textures: PARTIAL (88 of 88 load with 0 errors on a real server; rendering not seen on a client)
5. Localization: PARTIAL (the Byblos quest follows an in-game language choice; all other Minecraft menus are English)
6. Five-country parity: FAIL (30 chapters not offered in Minecraft, deliberately blocked until physical quests are proven)
7. Invalid identifier: PASS (repository-wide scan passes; the pack loads on a real server with 0 errors)

GAMEPLAY METRICS
Countries validated: 1 with a physical quest (Lebanon, Byblos); 6 Atlas districts build; 0 by a person on a device
Cities structurally verified: 1 distinct layout (Byblos); the 6 Atlas districts build but share one layout
Quests physically playable: 1 completed on a real server by a scripted player; 0 by a person
NPCs interactive: 1 (Karim, on a real server, through his entity trigger)
NPCs mobile: 1 (Karim walks around the warehouse to the dock by the game's own pathfinding)
Custom blocks rendering: 0 observed; they load and place without errors on a real server
Localized strings verified: 0 in a real game; automated checks cover all 13 non-English catalogs
Save migrations tested: 0

TESTING
Static validation: passing, including the identifier scan and texture references
Runtime tests: passing against simulated APIs
Bedrock server tests: add-on loads on 1.26.63.1 with 0 errors; Byblos and 6 Atlas districts build with 0 failed fills; base world completed in 1 of 2 isolated runs before its retry fix (the fix has not had its own isolated run)
Quest completion tests: pq_lb_harbor COMPLETED on a real server by a scripted player, twice
World reload: 1 restart; the repair stayed, 1 Karim, no rebuild, Karim still at the dock
Bedrock client tests: NOT RUN
Multiplayer tests: 2 scripted players in one world, one after the other, kept separate progress; none at the same time
Visual tests: NOT RUN, marked unverified

BUILD
Minecraft version: targets 1.21.50 or newer, Script API 1.17.0; tested on server 1.26.63.1
Behavior pack: built, loaded by a real server
Resource pack: built; a server can't confirm rendering
Release package: miraverse.mcaddon and miraverse-global.mcaddon; slice in miraverse-physical-staging.mcaddon
Build errors: none

BLOCKERS
1. No person has played this on a device, so Level 4 visual acceptance can't start.
2. Under x86 emulation on the DGX, the server hangs at startup on many starts. Restarting works
   around it. Cause not confirmed. The add-on hasn't been tested on a native x86 server.
3. With the beta test setup, the server exited with code 1 in 2 of about 9 runs, with no error logged.
   It hasn't happened in the 2 runs without that setup, which is too few to clear the add-on.

FOUND AND FIXED BECAUSE OF THE REAL SERVER
- 5 mentors had an invalid skin_list, and 5 recipes lacked required unlock data.
- A retry loop starved chunk loading, so Byblos often never built, with no error logged.
- minecraft:terracotta doesn't exist on this version, which left lobby blocks unplaced.
- The base builder marked the world built after failing; it now retries and reports.
- Karim wasn't interactable, and his dock target was out of search range.
- The sand seabed collapsed under gravity, so players could fall through the world.
- Players spawned inside a warehouse.

STILL UNPROVEN IN THE SLICE
- Picking up dropped planks: the scripted player broke the timber but barely collects drops, so the
  test gave it planks. This must be checked by a person.
- The dialogue menu appearing: a scripted player has no screen.
- Real-player interaction: for the scripted player, only the entity trigger fired, not the
  interaction events. A real client may behave differently.
- A player's own progress surviving a reload: each scripted player is a new identity, so only
  the world's state was proven across a restart.
- French on a real client, texture rendering, Arabic rendering and menu layout.
- Whether Byblos reads as a distinctive place when seen.

FINAL STATUS
NOT COMPLETE. The Byblos quest has been completed on a real server by a scripted player, with the
gaps listed above, so the brief's first vertical slice has not fully passed. The Germany and Morocco
slices have not started. AC-11 is met. Partial evidence exists for AC-04, AC-05, AC-06, AC-07 and AC-13,
for one quest and one character only.
```

## Family decision

The story files already define a family for each country, so the brief's roles map to them. In Lebanon:

| Brief's role | Character | Source |
|---|---|---|
| Liam (engineering, navigation) | Karim, Mira's cousin, age 11 | `packages/content/stories/ar-LB.json` |
| Layla (language, art) | Yara, Mira's cousin, age 10 | same |
| Kassem (history) | Baba Sami, Mira's father | same |
| Sharazad (home, cooking) | Teta Nahla, Mira's grandmother | same |

Only Karim is implemented so far. Mira is the protagonist in the stories, which fits the player's role.

## Reproduce

```text
npm run artifacts
npx vitest run tests/minecraft
```

The slice is in `apps/minecraft/dist/miraverse-physical-staging.mcaddon`. Create a new world, choose Lebanon, and talk to Karim at the dock.
