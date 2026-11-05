# Phoenicia: Tyre status

Track completion by verified gameplay, not by files. Nothing here has been played in a real game client yet.

## Status ledger

States: `QUEUED → RUNNING → VALIDATING → READY_TO_MERGE → MERGED → VERIFIED`, plus `BLOCKED`.

| Phase | Work | State | Evidence or blocker |
|---|---|---|---|
| 1 | Discovery and contracts | READY_TO_MERGE | Content model, coordinate system and quest contract are in place |
| 2 | Vertical slice: quest logic | READY_TO_MERGE | `npm run test:phoenicia` |
| 2 | Vertical slice: Roblox simulated boot | READY_TO_MERGE | `npm run test:roblox` runs the built place against a simulated engine |
| 2 | Vertical slice: Roblox playtest | BLOCKED | Needs Roblox Studio |
| 2 | Vertical slice: Minecraft playtest | BLOCKED | Needs a Bedrock client |
| 3–7 | Full city, world, 24 quests, epochs, release | QUEUED | Waits for the slice to pass in both games |

## Agent runtimes

| Runtime | State | Blocker |
|---|---|---|
| Claude | Available | |
| Codex | Available | Not yet dispatched; the slice was integrated directly |
| Gemini | Available via `agy` | `agy -p` is signed in and lists Gemini models; the `gemini` command itself has no auth configured |
| DGX Spark | Reachable | SSH works and LM Studio and Ollama list models; no inference test or throughput measurement yet |

## Playtest the slice

Build: `npm run phoenicia:compile`, then the platform command below.

**Roblox:** `npm run build:phoenicia:roblox`, then open `apps/roblox/dist/miraverse-phoenicia-staging.rbxlx` in Studio. Turn on Game Settings > Security > Enable Studio Access to API Services, or progress won't save.

**Minecraft:** `npm run build:phoenicia:minecraft`, then import `apps/minecraft/dist/miraverse-phoenicia-staging.mcaddon` into a new world. Stand at an objective and sneak to interact.

Acceptance journey for both:

1. Pick a language and arrive at Tyre's north dock.
2. Walk south through the wall gate to Hanno in the market and accept the quest.
3. Return to the dock, board and choose "coast on your right".
4. At Byblos, go to Arishat at the cedar yard and choose the pale, dried trunks.
5. Leave the game, rejoin, and confirm you resume at Byblos with progress kept.
6. Sail back with "coast on your left" and commission the ship from Hanno.
7. Rejoin and confirm the quest stays complete, then open the Codex at Hanno.

Also check: terrain and water look right, NPCs walk, the ship moves (Roblox), the UI fits on a phone, and Arabic renders correctly. Bedrock may not shape Arabic properly, which is why 3arabizi is offered.

## Roblox Atlas (11 countries, 66 chapters, 14 languages)

Separate from Tyre, and on by default. `npm run compile` generates it from the shared registry and locale catalogs. `npm run test:roblox` plays every chapter in the simulator. Translations are machine-made through `tools/locale/translate.mjs` and flagged for human review. Chapter challenges are generated from each chapter's type, so they repeat patterns.

## Known limits of the slice

- TYR-05 starts directly because TYR-01 to TYR-04 don't exist yet.
- All age tracks share the same steps and hints.
- Minecraft regions float at y=104 with invisible walls, so the view past the edge is empty sky.
- Arabic, French and 3arabizi text needs human review.

## Add content

1. Edit `packages/content/phoenicia/` (`world.json`, `quests/`, `locales.json`, `sources.json`).
2. Run `npm run phoenicia:compile`.
3. Add scenarios to `tests/phoenicia/vectors.json`, then run `npm run test:phoenicia`.

Cite only sources marked `read` or `partly_read`, and label content `historical_evidence`, `historical_tradition` or `game_fiction`.
