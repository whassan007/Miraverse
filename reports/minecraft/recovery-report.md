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
4. Missing textures: PARTIAL (88 of 88 connected in files; rendering not seen in a game)
5. Localization: PARTIAL (the Byblos quest follows an in-game language choice; all other Minecraft menus are English)
6. Five-country parity: FAIL (30 chapters not offered in Minecraft, deliberately blocked until physical quests are proven)
7. Invalid identifier: PASS in source (repository-wide scan passes; not yet loaded by a real game)

GAMEPLAY METRICS
Countries validated: 0 in a real game
Cities structurally verified: 1 (Byblos, by route and terrain tests against generated data)
Quests physically playable: 0 proven in a real game; 1 passes against a simulated API
NPCs interactive: 0 proven in a real game; 1 passes against a simulated API
NPCs mobile: 0 proven; 1 has pathfinding components that have never run
Custom blocks rendering: 0 observed
Localized strings verified: 0 in a real game; automated checks cover all 13 non-English catalogs
Save migrations tested: 0

TESTING
Static validation: passing, including the identifier scan and texture references
Runtime tests: passing against simulated APIs, not a real game
Bedrock client tests: NOT RUN
Quest completion tests: 1 quest against a simulated API; 0 in a real game
Multiplayer tests: 1 simulated test that two players' saves stay separate; 0 in a real game
Visual tests: NOT RUN, marked unverified

BUILD
Minecraft version: targets 1.21.50 or newer, Script API 1.17.0; current server release is 1.26.63.1 (never loaded)
Behavior pack: built
Resource pack: built
Release package: miraverse.mcaddon and miraverse-global.mcaddon; slice in miraverse-physical-staging.mcaddon
Build errors: none

BLOCKERS
1. Bedrock Dedicated Server can't be downloaded. Mojang's API lists only www.minecraft.net,
   which returned NXDOMAIN from 1.1.1.1, 8.8.8.8 and 9.9.9.9 on 2026-11-06. Docker on the DGX is
   ready, with the image pulled and untested under ARM emulation.
2. No Bedrock client has been available, so Level 4 visual acceptance can't start.

UNVERIFIED ITEMS
- Whether any pack, block, entity or script loads in Bedrock.
- Whether the server image runs under emulation on the DGX.
- Karim's pathfinding, and every interaction event, on a real server.
- Texture rendering, Arabic rendering and menu layout on a real client.
- Whether Byblos reads as a distinctive place when seen.

FINAL STATUS
NOT COMPLETE. AC-11 is met in source. No other acceptance criterion is met. The Byblos slice
has passed only simulated tests, so the brief's first vertical slice has not passed.
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
