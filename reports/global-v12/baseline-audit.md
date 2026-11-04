# Global expansion baseline — 2026-11-04

Baseline commit: `9403a60`. This is a source audit, not native gameplay certification.

The user supplied the 27-country canonical catalog inline. The exact named v1.2 roster and research attachment were not found in the repository or available attachment directory. The available attachment concerns a different project. Do not replace the missing roster with the existing v1.1 manifest: its ownership and agent assignments differ. Exact roster-dependent dispatch is blocked pending that input.

## Active integration findings

- `tools/compiler/index.ts` consumes `packages/content/packs`, currently containing LB, IQ, EG, FR and KR. The 11-country data is separately defined in `swarm/minecraft-global/catalog-data.mjs`; its existence does not prove active integration.
- Roblox Rojo loads the entire server tree. `Main.server.luau` runs `MapBuilder.build()` and `SessionManager.init()`. `MapBuilder` hardcodes five countries. `world/WorldBuilder.server.luau` is another executable startup script with five district configs. World ownership/startup order needs investigation before replacing either path.
- Bedrock builds `scripts/main.ts` into `bp/scripts/main.js`. `playChapter` chooses chapter 1 (or the first chapter) and slices its first five challenges. Exported v10 classes do not by themselves establish execution of six chapters.
- Bedrock dependencies are pinned to server 1.17.0 and server-ui 1.3.0. Compatibility with the intended client version is NOT_RUN; no upgrade inferred from the current date.
- Existing migration code in `packages/content/migrations/index.ts` converts first-chapter content; this is not evidence of player-save migration across all 11 countries.
- Existing artifact manifest explicitly marks the genuine `.mcworld` as blocked on Windows tooling. Its add-on verification claims must be checked against actual bytes and native import, not inherited.
- Host observed: Linux aarch64. `agy`, `claude`, `codex`, and `rojo` executables are present. Executable presence does not verify provider authentication, model availability, GPU capacity, or client availability. No provider jobs dispatched.
- Git origin is `https://github.com/whassan007/Miraverse.git`. Remote and deployed website state have not been verified.

## Preservation

Pre-existing untracked v14 web/art/contracts/tests/tools paths and two minecraft-global orchestration scripts were present. They remain untouched. No game IDs, saves, economy, live configuration, or public deployment were changed.

During the audit, another process changed the working tree: hub layout, Morocco country data, global registry and catalog-data became modified, and new wave scripts appeared. These changes were not made by this audit. Consequently the initial commit identifies the starting baseline only; the machine snapshot records its own current commit and dirty state. Runtime edits must wait for ownership coordination to avoid clobbering ongoing work.

## Checks executed

- `npm run validate:structural`: PASS.
- Targeted Vitest: domain quests/challenges, multiplayer plots, cross-platform parity: 3 files, 4 tests PASS. These are automated domain tests, not native-client executions.
- Native Studio and Bedrock walkthroughs: NOT_RUN. No native screenshots or videos captured in this audit.

`tools/global-v12/audit.mjs` inventories actual build files with SHA-256 hashes and source entry points; it emits conservative 54-cell country and 78-cell locale baseline observations. It never infers readiness from file presence and never overwrites release approvals.
