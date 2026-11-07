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
2. Menu-based quests: PARTIAL (1 physical quest behind a staging flag; 36 chapters are still menu-based; shortcuts remain in released builds)
3. Silent NPCs: PARTIAL (Karim only, behind a staging flag; 55 global NPCs and 5 mentors are unchanged)
4. Missing textures: PARTIAL (88 of 88 load with 0 errors on a real server; rendering not seen on a client)
5. Localization: PARTIAL (the Byblos quest follows an in-game language choice; all other Minecraft menus are English)
6. Five-country parity: FAIL (30 chapters not offered in Minecraft, deliberately blocked until physical quests are proven)
7. Invalid identifier: PASS (repository-wide scan passes; the pack loads on a real server with 0 errors)

GAMEPLAY METRICS
Countries validated: 0 end to end
Cities structurally verified: 1 (Byblos: built on a real server; route tests use generated data)
Quests physically playable: 0 proven with a player on a real server; 1 passes against a simulated API
NPCs interactive: 0 proven in a real game; 1 passes against a simulated API
NPCs mobile: 1 observed moving on a real server (Karim, by the game's own AI); he doesn't yet reach the dock
Custom blocks rendering: 0 observed; custom blocks load and place without errors on a real server
Localized strings verified: 0 in a real game; automated checks cover all 13 non-English catalogs
Save migrations tested: 0

TESTING
Static validation: passing, including the identifier scan and texture references
Runtime tests: passing against simulated APIs
Bedrock server tests: add-on loads on 1.26.63.1 with 0 errors and 0 content-log warnings; Byblos builds with 0 failed fills
Bedrock client tests: NOT RUN
Quest completion tests: 1 quest against a simulated API; 0 with a player on a real server
Multiplayer tests: 1 simulated test that two players' saves stay separate; 0 in a real game
Visual tests: NOT RUN, marked unverified

BUILD
Minecraft version: targets 1.21.50 or newer, Script API 1.17.0; tested on server 1.26.63.1
Behavior pack: built, loaded by a real server
Resource pack: built; a server can't confirm rendering
Release package: miraverse.mcaddon and miraverse-global.mcaddon; slice in miraverse-physical-staging.mcaddon
Build errors: none

BLOCKERS
1. No Bedrock client has been available, so Level 4 visual acceptance can't start.
2. Under x86 emulation on the DGX, the server hangs at startup on about half of its starts.
   A restart-on-hang watchdog works around it. Cause not confirmed.

OPEN BUGS FOUND ON THE REAL SERVER
- Karim strolls but never reaches the dock, so his walk-to-marker behavior isn't working.
- Germany's district waits indefinitely on 1 unloaded chunk of 36, so the Atlas districts don't finish building.
- The existing lobby and plaza builder can mark the world built after failing on unloaded chunks. Not yet confirmed with a player online.

FIXED BECAUSE OF THE REAL SERVER
- 5 mentors had an invalid skin_list, and 5 recipes lacked required unlock data.
- A retry loop starved chunk loading, so Byblos often never built, with no error logged.

UNVERIFIED ITEMS
- Any player action on a real server: interaction, breaking, placing, quest completion.
- Texture rendering, Arabic rendering and menu layout on a real client.
- Whether Byblos reads as a distinctive place when seen.

FINAL STATUS
NOT COMPLETE. AC-11 is met and the new ID loads on a real server. No other acceptance criterion is
met. Byblos builds and Karim moves on a real server, but no player has played the quest on one, so
the brief's first vertical slice has not passed.
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
