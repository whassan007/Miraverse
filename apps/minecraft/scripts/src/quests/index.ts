/**
 * MiraVerse v1.0 Minecraft Bedrock — Host-Authoritative Quest State Machine
 * (`apps/minecraft/scripts/src/quests/index.ts`)
 * Owner: CL02 (Wave W1–W2)
 * Implements DISCOVERED -> ACCEPTED -> ACTIVE -> COMPLETED -> REWARDED lifecycle
 * with deterministic objective order (Gather -> Trade -> Cook -> Build -> Word),
 * late-join/reload safety, and chapter replay support.
 */
import type { CountryId } from '../../../../../../packages/content/schema.js';
import {
  CHALLENGE_ORDER_V10,
  type ChallengeKindV10,
  type PlayerQuestRecordV10,
  type PlayerSaveStateV10,
} from '../contracts/index.js';

export function createInitialQuestRecord(country: CountryId): PlayerQuestRecordV10 {
  return {
    country,
    lifecycle: 'DISCOVERED',
    completedChallenges: [],
    gatheredNodeIds: [],
    optionalCollectiblesFound: [],
    cookingStepProgress: 0,
    restorationStage: 0,
    discoveredWords: [],
    stampCode: null,
    rewardGranted: false,
    updatedAtIso: new Date().toISOString(),
  };
}

export function acceptCountryQuest(state: PlayerSaveStateV10, country: CountryId): PlayerQuestRecordV10 {
  const q = state.quests[country] || createInitialQuestRecord(country);
  if (q.lifecycle === 'DISCOVERED') {
    q.lifecycle = 'ACCEPTED';
    q.updatedAtIso = new Date().toISOString();
  }
  state.quests[country] = q;
  state.activeCountry = country;
  if (!state.visitedCountries.includes(country)) {
    state.visitedCountries.push(country);
  }
  return q;
}

export function recordChallengeObjectiveCompleted(
  state: PlayerSaveStateV10,
  country: CountryId,
  challenge: ChallengeKindV10
): { updated: PlayerQuestRecordV10; newlyCompleted: boolean; allFiveCompleted: boolean } {
  const q = state.quests[country] || createInitialQuestRecord(country);
  if (q.lifecycle === 'DISCOVERED' || q.lifecycle === 'ACCEPTED') {
    q.lifecycle = 'ACTIVE';
  }
  const newlyCompleted = !q.completedChallenges.includes(challenge);
  if (newlyCompleted) {
    q.completedChallenges.push(challenge);
  }
  const allFiveCompleted = CHALLENGE_ORDER_V10.every((c) => q.completedChallenges.includes(c));
  if (allFiveCompleted && q.lifecycle !== 'REWARDED') {
    q.lifecycle = 'COMPLETED';
  }
  q.updatedAtIso = new Date().toISOString();
  state.quests[country] = q;
  return { updated: q, newlyCompleted, allFiveCompleted };
}

export function resetOrReplayChapterQuest(state: PlayerSaveStateV10, country: CountryId): PlayerQuestRecordV10 {
  const existing = state.quests[country];
  const preservedStamp = existing?.stampCode || null;
  const preservedReward = existing?.rewardGranted || false;
  const reset: PlayerQuestRecordV10 = {
    ...createInitialQuestRecord(country),
    lifecycle: 'ACCEPTED',
    stampCode: preservedStamp,
    rewardGranted: preservedReward,
  };
  state.quests[country] = reset;
  return reset;
}
