/**
 * MiraVerse v1.0 Minecraft Bedrock — Five Physical World Challenge Mechanics
 * (`apps/minecraft/scripts/src/challenges/index.ts`)
 * Owner: CL03 (Wave W1–W2)
 * Implements physical Gather, atomic Trade, 5-dish ordered Cook sequence,
 * 3-stage physical Block Restoration, and 3-object Word discovery.
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import type { PlayerSaveStateV10 } from '../contracts/index.js';
import { REGIONS_V10 } from '../regions/index.js';
import { createInitialQuestRecord, recordChallengeObjectiveCompleted } from '../quests/index.js';
import { consumeItem, executeAtomicTrade, getItemCount, grantItem } from '../inventory/index.js';

export function performGatherAnchor(
  state: PlayerSaveStateV10,
  country: CountryId,
  anchorId: string
): { ok: boolean; reason: string; itemGranted?: string; gatherObjectiveCompleted: boolean } {
  const region = REGIONS_V10[country];
  const q = state.quests[country] || createInitialQuestRecord(country);
  state.quests[country] = q;

  const anchor = region.anchors.find((a) => a.anchorId === anchorId);
  if (!anchor || (anchor.kind !== 'gather_node' && anchor.kind !== 'optional_collectible')) {
    return { ok: false, reason: 'INVALID_GATHER_ANCHOR', gatherObjectiveCompleted: false };
  }

  if (anchor.kind === 'optional_collectible') {
    if (q.optionalCollectiblesFound.includes(anchorId)) {
      return { ok: false, reason: 'ALREADY_COLLECTED_OPTIONAL', gatherObjectiveCompleted: q.completedChallenges.includes('gather') };
    }
    q.optionalCollectiblesFound.push(anchorId);
    if (anchor.linkedItemId) grantItem(state, anchor.linkedItemId, 1);
    return { ok: true, reason: 'OPTIONAL_COLLECTIBLE_FOUND', itemGranted: anchor.linkedItemId, gatherObjectiveCompleted: q.completedChallenges.includes('gather') };
  }

  // Prevent duplicate pickup from same node in current quest run unless item was lost
  const itemId = anchor.linkedItemId!;
  if (q.gatheredNodeIds.includes(anchorId) && getItemCount(state, itemId) > 0) {
    return { ok: false, reason: 'NODE_ON_COOLDOWN_ALREADY_GATHERED', gatherObjectiveCompleted: q.completedChallenges.includes('gather') };
  }

  if (!q.gatheredNodeIds.includes(anchorId)) {
    q.gatheredNodeIds.push(anchorId);
  }
  grantItem(state, itemId, 2);
  // Also grant restoration material so player has materials for trade & build
  const restoreMat = region.restorationRequiredItems[0]?.itemId;
  if (restoreMat && getItemCount(state, restoreMat) < 3) {
    grantItem(state, restoreMat, 2);
  }

  const gatherAnchors = region.anchors.filter((a) => a.kind === 'gather_node');
  const allGathered = gatherAnchors.every((a) => q.gatheredNodeIds.includes(a.anchorId));
  if (allGathered) {
    recordChallengeObjectiveCompleted(state, country, 'gather');
  }
  return { ok: true, reason: 'GATHERED', itemGranted: itemId, gatherObjectiveCompleted: allGathered };
}

export function performMarketTrade(
  state: PlayerSaveStateV10,
  country: CountryId
): { ok: boolean; reason: string; tradedItem?: string } {
  const region = REGIONS_V10[country];
  const step0Item = region.cookingSequence.orderedSteps[0].ingredientItemId;
  const tradeItem = region.cookingSequence.orderedSteps[1].ingredientItemId;

  const res = executeAtomicTrade(
    state,
    [{ itemId: step0Item, count: 1 }],
    [{ itemId: tradeItem, count: 1 }]
  );
  if (!res.ok) {
    return { ok: false, reason: res.reason };
  }
  recordChallengeObjectiveCompleted(state, country, 'trade');
  return { ok: true, reason: 'TRADE_COMPLETED', tradedItem: tradeItem };
}

export function performCookingStep(
  state: PlayerSaveStateV10,
  country: CountryId,
  ingredientItemId: string
): {
  ok: boolean;
  reason: string;
  currentStep: number;
  dishCompleted: boolean;
  dishItemId?: string;
  adultSupervisionNote?: string;
} {
  const region = REGIONS_V10[country];
  const q = state.quests[country] || createInitialQuestRecord(country);
  state.quests[country] = q;

  const seq = region.cookingSequence;
  const expectedStep = seq.orderedSteps[q.cookingStepProgress];
  if (!expectedStep) {
    return { ok: true, reason: 'ALREADY_COOKED', currentStep: seq.orderedSteps.length, dishCompleted: true, dishItemId: seq.dishItemId };
  }

  if ( expectedStep.ingredientItemId !== ingredientItemId ) {
    return { ok: false, reason: `WRONG_INGREDIENT_ORDER:expected_${expectedStep.ingredientItemId}`, currentStep: q.cookingStepProgress, dishCompleted: false };
  }

  if (!consumeItem(state, ingredientItemId, expectedStep.quantity)) {
    return { ok: false, reason: `MISSING_INGREDIENT:${ingredientItemId}`, currentStep: q.cookingStepProgress, dishCompleted: false };
  }

  q.cookingStepProgress += 1;
  const dishCompleted = q.cookingStepProgress >= seq.orderedSteps.length;
  if (dishCompleted) {
    grantItem(state, seq.dishItemId, 1);
    recordChallengeObjectiveCompleted(state, country, 'cook');
  }

  return {
    ok: true,
    reason: dishCompleted ? 'DISH_COOKED' : 'COOKING_STEP_ADVANCED',
    currentStep: q.cookingStepProgress,
    dishCompleted,
    dishItemId: dishCompleted ? seq.dishItemId : undefined,
    adultSupervisionNote: expectedStep.adultSupervisionNote,
  };
}

export function performRestorationStageStep(
  state: PlayerSaveStateV10,
  country: CountryId,
  materialItemId: string
): {
  ok: boolean;
  reason: string;
  previousStage: 0 | 1 | 2;
  newStage: 0 | 1 | 2;
  blockPlacementsToApply: Array<{ offset: { x: number; y: number; z: number }; blockId: string }>;
  restorationCompleted: boolean;
} {
  const region = REGIONS_V10[country];
  const q = state.quests[country] || createInitialQuestRecord(country);
  state.quests[country] = q;

  const requiredMat = region.restorationRequiredItems[0]?.itemId;
  if (materialItemId !== requiredMat) {
    return {
      ok: false,
      reason: `INVALID_RESTORATION_MATERIAL:expected_${requiredMat}`,
      previousStage: q.restorationStage,
      newStage: q.restorationStage,
      blockPlacementsToApply: [],
      restorationCompleted: q.restorationStage === 2,
    };
  }

  if (q.restorationStage >= 2) {
    return {
      ok: true,
      reason: 'ALREADY_FULLY_RESTORED',
      previousStage: 2,
      newStage: 2,
      blockPlacementsToApply: region.restorationStages[2].blockPlacements,
      restorationCompleted: true,
    };
  }

  if (!consumeItem(state, materialItemId, 1)) {
    return {
      ok: false,
      reason: `MISSING_RESTORATION_MATERIAL:${materialItemId}`,
      previousStage: q.restorationStage,
      newStage: q.restorationStage,
      blockPlacementsToApply: [],
      restorationCompleted: false,
    };
  }

  const prev = q.restorationStage;
  const next = (prev + 1) as 0 | 1 | 2;
  q.restorationStage = next;
  const stageSpec = region.restorationStages[next];
  const completed = next === 2;
  if (completed) {
    recordChallengeObjectiveCompleted(state, country, 'build');
  }

  return {
    ok: true,
    reason: completed ? 'LANDMARK_RESTORATION_COMPLETE' : 'LANDMARK_STAGE_1_COMPLETE',
    previousStage: prev,
    newStage: next,
    blockPlacementsToApply: stageSpec.blockPlacements,
    restorationCompleted: completed,
  };
}

export function performWordDiscovery(
  state: PlayerSaveStateV10,
  country: CountryId,
  anchorId: string
): {
  ok: boolean;
  reason: string;
  wordNative?: string;
  transliteration?: string;
  meaningEn?: string;
  discoveredCount: number;
  wordChallengeCompleted: boolean;
} {
  const region = REGIONS_V10[country];
  const q = state.quests[country] || createInitialQuestRecord(country);
  state.quests[country] = q;

  const anchor = region.anchors.find((a) => a.anchorId === anchorId && a.kind === 'word_object');
  if (!anchor) {
    return { ok: false, reason: 'INVALID_WORD_ANCHOR', discoveredCount: q.discoveredWords.length, wordChallengeCompleted: false };
  }

  if (!q.discoveredWords.includes(anchorId)) {
    q.discoveredWords.push(anchorId);
  }
  const completed = q.discoveredWords.length >= 3;
  if (completed) {
    recordChallengeObjectiveCompleted(state, country, 'word');
  }

  return {
    ok: true,
    reason: completed ? 'ALL_THREE_WORDS_DISCOVERED' : 'WORD_DISCOVERED',
    wordNative: anchor.labelNative,
    transliteration: anchor.transliteration,
    meaningEn: anchor.labelEn,
    discoveredCount: q.discoveredWords.length,
    wordChallengeCompleted: completed,
  };
}
