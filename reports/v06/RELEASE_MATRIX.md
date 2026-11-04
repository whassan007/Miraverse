# Section 9 & 8A Hard Acceptance & Release Gate Matrix (`reports/v06/RELEASE_MATRIX.md`)

- **Tested Commit SHA:** `47b7d15`
- **Timestamp:** 2026-11-04T05:45:32.023Z

## 1. RC1 Gates: Roblox Flagship + Cinematic Website

| Gate | Status | Owner | Evidence & Command | Notes |
|---|---|---|---|---|
| `RBX01` | **PASS** | `CL03`/`DX02` | `npm run build:roblox` -> `apps/roblox/dist/miraverse.rbxlx` | Rojo 7.7.1 builds cleanly; `node tools/v06/luau-checks/check-luau.mjs` passes 28 Luau modules. |
| `RBX02` | **BLOCKED (GUI) / PASS (Code)** | `CL03`/`AG05` | `apps/roblox/src/server/Foundation/WorldBootstrap.luau` | Hub & Byblos arrival logic verified; live Roblox Studio GUI session blocked on headless Linux `aarch64`. |
| `RBX03` | **BLOCKED (GUI) / PASS (Code)** | `CX06`/`AG03` | `apps/roblox/src/client/Controls/NativeControllerAdapter.luau` | R15 animation manifest & controller adapter verified; live Studio viewport blocked on Linux `aarch64`. |
| `RBX04` | **BLOCKED (GUI) / PASS (Code)** | `CL05` | `apps/roblox/src/server/NPCs/MentorDialogueService.luau` | Teta Nahla & 4 mentors with 14-stud proximity check verified in unit tests. |
| `RBX05` | **BLOCKED (GUI) / PASS (Code)** | `CL04`/`CL07` | `npx vitest run tests/roblox/integration/` | All 5 challenge adapters & state machine verified; live Studio playtest requires Windows/macOS host. |
| `RBX06` | **BLOCKED (GUI) / PASS (Code)** | `CL06`/`AG08` | `apps/roblox/src/server/Building/ByblosModularBuilder.luau` | 16-part modular kit, 2-stud snap, plot bounds & quotas verified. |
| `RBX07` | **PASS (Unit) / BLOCKED (Studio)** | `CL08`/`CX03` | `apps/roblox/src/server/Progression/PlayerDataStoreService.luau` | Rejoin persistence and duplicate event replay prevention (`DUPLICATE_EVENT_IGNORED`) verified. |
| `RBX08` | **PASS** | `CX04` | `npx vitest run tests/roblox/security/` | Adversarial remote, plot ownership, collaborator revocation, rate limit, and replay tests pass. |
| `RBX09` | **BLOCKED (Studio Video)** | `AG03`/`AG20` | `art/v06/animations/avatar-packs/animation-manifest.json` | Web video captured in `reports/v06/video/`; live Roblox Studio 10–20s viewport recording blocked on Linux `aarch64`. |
| `RBX10` | **BLOCKED (Live Device)** | `DX06` | `node tools/v06/roblox-perf/check-budgets.mjs` | Budgets defined & audited with zero fabricated FPS claims. |
| `SITE01` | **PASS** | `AG14`/`AG16` | `reports/v06/screens/home-option-a-1440x900.png` | Original hero + immediate static poster fallback verified. |
| `SITE02` | **PASS** | `CX08` | `apps/web/src/launch/RobloxLaunchPage.tsx` | **"Play free on Roblox"** CTA resolves truthfully and reports unpublished staging status without invented Place IDs. |
| `SITE03` | **PASS** | `AG17` | `reports/v06/screens/explore-atlas-1440x900.png` | All 5 country pages distinguish **RC1 Flagship (LB)** from **RC3 Expansion**. |
| `SITE04` | **PASS** | `CX08` | `reports/v06/screens/minecraft-bedrock-companion-1440x900.png` | Neutral Roblox app/account & Minecraft Bedrock v1.21.50+ ownership requirements displayed. |
| `SITE05` | **PASS** | `CX08`/`CX13` | `npx vitest run tests/web/e2e/v06/option-a-routes.test.ts` | `syncsBrowserStateToRoblox: false` enforced and disclosed. |
| `SITE06` | **PASS** | `DX05`/`DX14` | `reports/v06/screens/home-rtl-ar-LB-1440x900.png` | All 6 locales (`en`, `fr`, `ar-LB`, `ar-EG`, `ar-IQ`, `ko`), RTL, and 5 viewports verified with 0 horizontal overflow. |
| `SITE07` | **PASS** | `CX10`/`CX11` | `npx vitest run tests/e2e/commerce/commerce-c01-c20.test.ts` | Adult-only Stripe test mode & web-deliverable SKUs verified. |
| `SITE08` | **PASS** | `AG18`/`CL14` | `reports/v06/screens/adult-shop-test-mode-1440x900.png` | Zero web offers claim Roblox or Minecraft unlocks; child gameplay has zero purchase prompts. |

## 2. Section 8A Gates: Avatar Studio, Marketplace Candidates, Friends, Co-op & Community

| Gate | Status | Owner | Evidence |
|---|---|---|---|
| **Avatar Studio & Loadouts** | **PASS (Code) / BLOCKED (Studio GUI)** | `AG06`/`CL08` | `AvatarStudioUI.luau` + `AvatarLoadoutService.luau` equip/save/restore verified in unit tests; live Studio GUI blocked on Linux `aarch64`. |
| **Marketplace Candidate Validation** | **PASS** | `AG02`/`DX04`/`CL09` | `node tools/v06/asset-audit/audit-assets.mjs` passes 6 original items; zero false publication claims. |
| **Human Approval Gate** | **PASS** | `CL09`/`DX15` | `humanApprovalRequiredToPublish: true` on all items; zero automated Robux spending. |
| **Native Friend Invitations (`SocialService`)** | **PASS** | `CL03`/`CX03` | `SocialInvitationService.luau` checks `CanSendGameInviteAsync` and degrades safely. |
| **Two-Player Byblos Co-op** | **PASS (Logic) / BLOCKED (Studio GUI)** | `CL04`/`CX03` | `CoopQuestCoordinator.luau` verifies proximity, dual contribution, and individual reward idempotency. |
| **Collaborative Plot Ownership & Security** | **PASS** | `CL06`/`CX04` | `CollaborativePlotService.luau` enforces owner-only permission changes, revocation, and rate limits. |
| **Official Community Plan & Runbook** | **PASS** | `CL09`/`CL13`/`DX15` | `docs/v06/operations/social-marketplace/COMMUNITY_AND_MARKETPLACE_RUNBOOK.md` ready; no unverified live group URL claimed. |

## 3. RC2, RC3, Security, Commerce & Quality Gates

| Gate | Status | Owner | Evidence & Command |
|---|---|---|---|
| `MC01`–`MC05` | **PASS (Build/Tests) / BLOCKED (Bedrock GUI)** | `CL10`–`CL12`/`DX13` | `npm run pack:mcaddon`, `node tools/v06/bedrock-validators/validate-bedrock.mjs`, `npx vitest run tests/minecraft/integration/`. |
| `MC06` | **BLOCKED** | `AG19`/`CX12` | Headless Linux `aarch64` host has no native Minecraft Bedrock GUI client for live chapter video capture. |
| `PARITY01`–`PARITY04` | **PASS** | `CL02`/`CX02`/`DX03` | `npx vitest run tests/cross-platform/parity.test.ts` — 5 countries, 5 challenge types, separate economies verified. |
| `PARITY05` | **BLOCKED (Human Sign-Off)** | `DX05`/`CL15` | Draft localization keys & stories complete across 6 locales; human native-speaker cultural review explicitly tracked as pre-launch gate. |
| `SEC01`, `SEC02` | **PASS** | `CX04`/`CL13` | Zero secrets in git/logs; zero open child chat; all adversarial security tests pass. |
| `PAY01`, `GIFT01`, `CHILD01` | **PASS** | `CX09`–`CX11` | `npx vitest run tests/e2e/commerce/commerce-c01-c20.test.ts` (C01..C20 all PASS). |
| `Q01`–`Q05` | **PASS** | `CX14`/`DX15` | `npx tsx tools/quality/v06/verify-option-a.ts` passes; no protected branches modified; manual publish gates enforced. |
