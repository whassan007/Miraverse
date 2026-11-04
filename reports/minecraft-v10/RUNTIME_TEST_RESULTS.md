# MiraVerse v1.0 Minecraft Bedrock — Runtime & Automated Test Results (`RUNTIME_TEST_RESULTS.md`)

| Test Suite / Validator | Command | Result |
|---|---|---|
| **5-Country Domain, Cooking, Restoration & Passport Suite** | `npx vitest run apps/minecraft/tests/domain/quests-and-challenges.test.ts` | **PASS** (All 5 countries × 5 challenges = 25 activities, ordered cooking, 3-stage restoration, idempotent stamps, corrupt save quarantine) |
| **Two-Player Co-Op & Plot Protection Suite** | `npx vitest run apps/minecraft/tests/multiplayer/coop-and-plots.test.ts` | **PASS** (Claim, collaborator grant/revoke, heritage street protection, revert) |
| **Monorepo Release Gate G5 (Bedrock Add-On Integrity)** | `npx vitest run tests/integration/gates.test.ts` | **PASS** (Manifest UUIDs, `@minecraft/server@1.17.0`, `@minecraft/server-ui@1.3.0`, 16×16 item icons) |
| **District & Asset Validators (`DX03`–`DX10`, `DX13`, `DX16`–`DX20`)** | `node apps/minecraft/tools/checks/...` | **PASS** (All 6 regions, 40 blocks, 50 items, Blockbench rigs, sound definitions, SHA-256 reproducibility) |
| **Live Windows Bedrock GUI Runtime Import & Walkthrough** | Windows Bedrock Client | **BLOCKED** (Requires Windows 10/11 desktop host; runbook at `apps/minecraft/docs/operations/v10/WINDOWS_EDITOR_AND_CLIENT_RUNBOOK.md`) |
