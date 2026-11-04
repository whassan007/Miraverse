/**
 * MiraVerse v1.0 Minecraft Bedrock — Idempotent Souvenir Passport & World-Local Rewards
 * (`apps/minecraft/scripts/src/passport/index.ts`)
 * Owner: CL04 (Wave W1–W3)
 * Sole authority for chapter completion stamp issuance and local token grants.
 * Strictly isolated from Robux, Minecoins, or Web Stripe entitlements.
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import { CHALLENGE_ORDER_V10, type PlayerSaveStateV10, type WorldSaveStateV10 } from '../contracts/index.js';
import { make, verify } from '../../core/stamp.js';

export function claimChapterPassportReward(
  worldState: WorldSaveStateV10,
  playerState: PlayerSaveStateV10,
  country: CountryId,
  deterministicNonce?: string
): {
  ok: boolean;
  deduplicated: boolean;
  reason: string;
  stampCode?: string;
  tokensAwarded: number;
  newTokenBalance: number;
} {
  const q = playerState.quests[country];
  if (!q) {
    return { ok: false, deduplicated: false, reason: 'QUEST_NOT_INITIALIZED', tokensAwarded: 0, newTokenBalance: playerState.localMiraTokens };
  }

  const allDone = CHALLENGE_ORDER_V10.every((c) => q.completedChallenges.includes(c));
  if (!allDone) {
    return { ok: false, deduplicated: false, reason: 'CHALLENGES_INCOMPLETE', tokensAwarded: 0, newTokenBalance: playerState.localMiraTokens };
  }

  const rewardKey = `reward:${playerState.playerId}:${country}:ch1`;
  if (q.rewardGranted || worldState.processedRewardKeys.includes(rewardKey)) {
    return {
      ok: true,
      deduplicated: true,
      reason: 'REWARD_ALREADY_CLAIMED',
      stampCode: q.stampCode || undefined,
      tokensAwarded: 0,
      newTokenBalance: playerState.localMiraTokens,
    };
  }

  const code = q.stampCode || make(country, 1, deterministicNonce);
  if (!verify(code)) {
    return { ok: false, deduplicated: false, reason: 'STAMP_GENERATION_FAILED', tokensAwarded: 0, newTokenBalance: playerState.localMiraTokens };
  }

  q.stampCode = code;
  q.rewardGranted = true;
  q.lifecycle = 'REWARDED';
  q.updatedAtIso = new Date().toISOString();

  const rewardTokens = 50;
  playerState.localMiraTokens += rewardTokens;
  worldState.processedRewardKeys.push(rewardKey);
  worldState.restorationStagesByCountry[country] = 2;

  return {
    ok: true,
    deduplicated: false,
    reason: 'CHAPTER_REWARD_GRANTED',
    stampCode: code,
    tokensAwarded: rewardTokens,
    newTokenBalance: playerState.localMiraTokens,
  };
}
