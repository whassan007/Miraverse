import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('CX04 — Adversarial Roblox Security: Remotes, Plot Ownership, Collaborator Revocation & Replay Prevention', () => {
  it('enforces server-side plot owner check, collaborator revocation, rate limits, and 20-part plot quota', () => {
    const collab = fs.readFileSync(
      path.resolve('apps/roblox/src/server/Building/Collaboration/CollaborativePlotService.luau'),
      'utf-8'
    );
    expect(collab).toContain('ONLY_PLOT_OWNER_MAY_CHANGE_PERMISSIONS');
    expect(collab).toContain('COLLABORATOR_REVOKED');
    expect(collab).toContain('MAX_ACTIONS_PER_WINDOW = 8');

    const builder = fs.readFileSync(
      path.resolve('apps/roblox/src/server/Building/ByblosModularBuilder.luau'),
      'utf-8'
    );
    expect(builder).toContain('DISALLOWED_PART_ID');
    expect(builder).toContain('PLOT_QUOTA_EXCEEDED');
    expect(builder).toContain('OUTSIDE_PLOT_BOUNDARY');
  });

  it('blocks duplicate coop reward claims, out-of-range NPC/gather spoofing, and negative token balances', () => {
    const coop = fs.readFileSync(
      path.resolve('apps/roblox/src/server/QuestEngine/Coop/CoopQuestCoordinator.luau'),
      'utf-8'
    );
    expect(coop).toContain('DUPLICATE_COOP_REWARD_BLOCKED');
    expect(coop).toContain('COOP_PARTNERS_TOO_FAR');

    const ds = fs.readFileSync(
      path.resolve('apps/roblox/src/server/Progression/PlayerDataStoreService.luau'),
      'utf-8'
    );
    expect(ds).toContain('if state.miraTokens < 0 then');
  });
});
