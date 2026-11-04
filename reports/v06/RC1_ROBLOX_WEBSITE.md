# RC1 Deliverable Report — Roblox Flagship (Byblos) & Cinematic Website (`reports/v06/RC1_ROBLOX_WEBSITE.md`)

- **Tested Commit:** `47b7d15` on `integration/miraverse-v0.6-option-a`
- **Roblox Place Artifact:** `apps/roblox/dist/miraverse.rbxlx` (compiled via `rojo build apps/roblox -o apps/roblox/dist/miraverse.rbxlx`)
- **Roblox Studio MCP Plugin:** `apps/roblox/dist/MCPStudioPlugin.rbxm` + `~/.local/bin/rbx-studio-mcp`

## 1. Byblos Vertical Slice (*Lebanon: Summer at Teta's*) Implementation Summary
- **Server Foundation & Social (`CL03`):** `WorldBootstrap.luau` + `SocialInvitationService.luau` (`SocialService:CanSendGameInviteAsync` & `PromptGameInvite` with safe underage/privacy degradation and 2-player party state).
- **Authoritative Quest Engine & Co-op (`CL04`):** `ByblosQuestStateMachine.luau` (`gather -> trade -> cook -> build -> word`, idempotent 150 Mira Token chapter reward, passport stamp `MV-LB1-V06-*`) + `CoopQuestCoordinator.luau` (`LB_COOP_HARBOR_FEAST` with proximity check and individual rewards).
- **Mentor NPCs (`CL05`):** `MentorDialogueService.luau` (Teta Nahla in Byblos + 4 country mentors with 14-stud proximity check and bilingual Lebanese/Arabic/French/Korean greetings).
- **Modular Construction & Plot Collaboration (`CL06`):** `ByblosModularBuilder.luau` (16-part Lebanese stone house kit, 2-stud grid snap, 20-part quota) + `CollaborativePlotService.luau` (server-enforced owner permissions, collaborator grant/revoke, and 8-actions/5s rate limit).
- **Native Activities (`CL07`):** `ActivityAdapters.luau` (spatial gather, market trade, 4-step saj man'oushe cooking where Teta controls the hot oven, and 3-sign vocabulary discovery).
- **Progression & Avatar Studio (`CL08`, `CX05`, `AG06`):** `PlayerDataStoreService.luau` (`mv.roblox.save.v6`) + `AvatarLoadoutService.luau` + `SocialAvatarContracts.luau` + `AvatarStudioUI.luau` separating `experience_only` cosmetics from `marketplace_candidate` items.

## 2. Cinematic Website & Truthful Roblox Launcher Summary
- **Primary CTA:** **"▶ Play free on Roblox"** (`data-testid="cta-play-free"` -> `/play/LB`), plus **"Play in Minecraft Bedrock"** (`/minecraft`).
- **Truth-in-Advertising:** `/play` and `/play/:country` render `<RobloxLaunchBanner />` explaining free Roblox app/account requirements, showing verified build status (`STAGING_UNPUBLISHED_HUMAN_APPROVAL_REQUIRED`), and explicitly stating that browser cookies never fabricate Roblox `DataStoreService` state.
- **Screenshots & Video Evidence:** Captured in `reports/v06/screens/*` and `reports/v06/video/*`.
