# Security, Child Privacy & Social/Community Safety Review (`reports/v06/SECURITY_PRIVACY_REVIEW.md`)

- **Roblox Remote & Plot Security (`CX04`, `DX02`):** Verified in `tests/roblox/security/social-avatar/social-avatar-security.test.ts` and `tools/v06/luau-checks/check-luau.mjs`.
  - Server-side plot ownership and collaborator revocation enforced (`ONLY_PLOT_OWNER_MAY_CHANGE_PERMISSIONS`).
  - Rate limit (8 placements / 5s) and 20-part plot quota enforced.
  - Duplicate quest/co-op reward replay attacks blocked (`DUPLICATE_EVENT_IGNORED`, `DUPLICATE_COOP_REWARD_BLOCKED`).
  - Zero external payment URLs or Stripe links inside Roblox Luau or Minecraft Bedrock scripts.
- **Child Privacy & Social Boundaries (`CL13`):**
  - Zero child account creation on the website; zero third-party ad pixels or behavioral tracking.
  - Friend invitations use native `SocialService:CanSendGameInviteAsync` and degrade safely when restricted.
  - Zero custom open child chat or unmoderated user-to-user messaging.
