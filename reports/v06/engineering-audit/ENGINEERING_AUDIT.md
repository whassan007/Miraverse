# MiraVerse v0.7 — Engineering Audit & Source Reuse Map (`CX01`)

- **Audited Branch:** `integration/miraverse-v0.6-option-a`
- **Workspaces Verified:** `apps/web`, `apps/minecraft`, `apps/api`, `packages/contracts`, `packages/game-domain` (+ `apps/roblox` via Rojo 7.7.1).

## 1. Compile & Test Baseline
- `npm run validate`: PASS (0 structural or release policy errors)
- `npm run compile`: PASS (deterministic Luau, Bedrock TS, Web TS outputs)
- `npm run build:roblox`: PASS (`apps/roblox/dist/miraverse.rbxlx`)
- `npm -w apps/minecraft run build && npm run pack:mcaddon`: PASS (`apps/minecraft/dist/miraverse.mcaddon`)
- `npm -w apps/web run build && npm -w apps/api run build`: PASS
- `npx vitest run`: PASS (13 suites, 109 tests)

## 2. Risk Register & Priority Order
1. **R01 — Primary Website CTA Truthfulness:** Replace browser-game-first wording on `/` and `/play` with truthful **"Play free on Roblox"** launcher and explicit legacy browser preview opt-in (`/legacy-game`).
2. **R02 — Roblox Flagship Depth (Byblos Vertical Slice + Section 8A Social/Avatar):** Expand `apps/roblox/src/` with server-authoritative `Foundation/Social`, `QuestEngine/Coop`, `NPCs`, `Building/Collaboration`, `Activities`, `Progression/Avatar`, and client `Presentation/social-avatar` + `Controls`.
3. **R03 — Headless Linux ARM64 Host Constraints:** Native Roblox Studio GUI and Minecraft Bedrock GUI are unavailable on Linux `aarch64`. All static builds, AST/security suites, and state-machine simulations must pass 100%, while GUI runtime gates are truthfully recorded as `BLOCKED`.
