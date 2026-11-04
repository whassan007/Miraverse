# Roblox Friends, Co-op, Collaborative Building & Community Safety (`CL13` Section 8A)

## 1. Friend Invitations (`SocialService`)
- Invitations use `SocialService:CanSendGameInviteAsync(player)` and `SocialService:PromptGameInvite(player, experienceInviteOptions)` only when triggered by explicit player input.
- If `CanSendGameInviteAsync` returns `false` (underage privacy setting, parental restriction, or platform policy), the invite button degrades cleanly with a neutral notice.
- Never scrape or persist the player's social graph.

## 2. Two-Player Byblos Co-op & Collaborative Building Safety
- Co-op quests validate each participant's proximity and objective contribution on the server and grant individual rewards idempotently.
- Collaborative building on a player's Byblos plot requires explicit owner permission (`grantCollaborator` / `revokeCollaborator`), enforces per-action rate limits (max 8 placements / 5s), and restricts placement to predefined modular architectural parts (no arbitrary text signs or custom meshes).

## 3. Official Roblox Community Policy
- Community participation is optional and never gates educational quest progression.
- Community creation, group fee expenditure, and public wall configuration require explicit human creator authorization.
