# RC2 Deliverable Report — Minecraft Bedrock Companion (`reports/v06/RC2_MINECRAFT.md`)

- **Tested Commit:** `47b7d15`
- **Add-On Artifact:** `apps/minecraft/dist/miraverse.mcaddon` (Behavior Pack + Resource Pack + 6 authored `.mcstructure.json` templates)
- **Installed MCP Tooling:** `~/.local/bin/minecraft-mcp-server` (`v2.0.4`, 22 Mineflayer tools configured in Antigravity, Claude Code, and Cursor)

## 1. Byblos Block-Building Companion Architecture
- **Stable Script API Bootstrap (`CL10`):** `apps/minecraft/scripts/core/v06-bootstrap.ts` pinned to stable `@minecraft/server@1.17.0` and `@minecraft/server-ui@1.3.0` with zero `-beta` flags.
- **Byblos Block Restoration Adapter (`CL11`, `AG19`):** `apps/minecraft/scripts/challenges/v06-byblos-challenges.ts` and `art/v06/minecraft/bedrock-byblos-kit.json` validate sandstone/cedar/lantern block placements inside the designated Byblos build plot (`[-200, 64, 0]`) and award Bedrock-local Mira Tokens.
- **Manifest & Package Validator (`DX13`, `CL12`, `CX12`):** `node tools/v06/bedrock-validators/validate-bedrock.mjs` and `npx vitest run tests/minecraft/integration/` pass 100%.
- **Truthful Runtime Status:** Marked `BUILD VERIFIED / RUNTIME BLOCKED` on headless Linux `aarch64` host because native Minecraft Bedrock GUI client import and binary LevelDB `.mcworld` export require a Windows/mobile/console Bedrock client.
