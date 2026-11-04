import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('CX03 — Roblox Native Quest, Persistence, SocialService Invites, Co-op & Avatar Studio Integration', () => {
  it('verifies Byblos 5-step quest state machine, rejoin persistence, and cooperative quest individual rewards exist in Luau', () => {
    const questMachine = fs.readFileSync(
      path.resolve('apps/roblox/src/server/QuestEngine/ByblosQuestStateMachine.luau'),
      'utf-8'
    );
    expect(questMachine).toContain('STEP_ORDER = { "gather", "trade", "cook", "build", "word" }');
    expect(questMachine).toContain('DUPLICATE_EVENT_IGNORED');
    expect(questMachine).toContain('CHAPTER_COMPLETED');

    const coop = fs.readFileSync(
      path.resolve('apps/roblox/src/server/QuestEngine/Coop/CoopQuestCoordinator.luau'),
      'utf-8'
    );
    expect(coop).toContain('LB_COOP_HARBOR_FEAST');
    expect(coop).toContain('GRANTED_INDIVIDUAL_COOP_REWARD');
  });

  it('verifies SocialService friend invite eligibility adapter and Avatar Studio separation of experience_only vs marketplace_candidate', () => {
    const social = fs.readFileSync(
      path.resolve('apps/roblox/src/server/Foundation/Social/SocialInvitationService.luau'),
      'utf-8'
    );
    expect(social).toContain('CanSendGameInviteAsync');
    expect(social).toContain('INELIGIBLE_ACCOUNT_OR_POLICY');

    const contracts = fs.readFileSync(
      path.resolve('apps/roblox/src/shared/Systems/SocialAvatar/SocialAvatarContracts.luau'),
      'utf-8'
    );
    expect(contracts).toContain('"experience_only"');
    expect(contracts).toContain('"marketplace_candidate"');
    expect(contracts).toContain('verifiedMarketplaceAssetId = nil');
  });
});
