# MiraVerse v1.0 Minecraft Bedrock — Two-Player Co-Op & Plot Ownership Report (`MULTIPLAYER.md`)

- **Architecture:** Host-authoritative session state in `apps/minecraft/scripts/src/multiplayer/index.ts` (`CL04`).
- **Protected Heritage Districts:** All street, facade, market, and landmark coordinates outside private plot bounds reject unapproved block edits with `PROTECTED_HERITAGE_AREA_OUTSIDE_PLOT`.
- **Private Building Plots:** Each country district provides an explorer plot (`radius = 8`, `quotaLimit = 64 blocks`).
- **Collaborator Permissions:** Host owners can grant (`grantPlotCollaborator`), revoke (`revokePlotCollaborator`), or cleanly revert (`revertPlotToCleanState`) guest friend builds at any time.
- **Verification:** `npx vitest run apps/minecraft/tests/multiplayer/coop-and-plots.test.ts` (`CX04`) — **PASS**.
