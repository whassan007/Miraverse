/**
 * MiraVerse v1.0 Minecraft Bedrock — Host-Authoritative Quest State Machine
 * (`apps/minecraft/scripts/src/quests/index.ts`)
 * Owner: CL02 (Wave W1–W2)
 * Implements DISCOVERED -> ACCEPTED -> ACTIVE -> COMPLETED -> REWARDED lifecycle
 * with deterministic objective order (Gather -> Trade -> Cook -> Build -> Word),
 * late-join/reload safety, and chapter replay support.
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
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


// ============================================================================
// MiraVerse Global v1.1 — 11-Country, 66-Chapter, 264-Age-Variant Quest Engine
// Owner: CX02 (Wave W2)
// ============================================================================
import registryData from '../../../../../packages/content/minecraft-global/registry.json';

export type GlobalCountryCode = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR' | 'DE' | 'CN' | 'JP' | 'RU' | 'UA' | 'MA';
export type GlobalAgeTrack = '5-7' | '8-10' | '11-13' | '14-17';
export type GlobalChapterLifecycle =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'STARTED'
  | 'OBJECTIVE_PROGRESS'
  | 'ACTIVITY_COMPLETE'
  | 'REWARD_GRANTED'
  | 'COMPLETED';

export interface GlobalChapterProgress {
  chapterId: string;
  countryCode: GlobalCountryCode;
  lifecycle: GlobalChapterLifecycle;
  ageTrackAtStart: GlobalAgeTrack;
  completedObjectiveNodes: string[];
  attempts: number;
  lastCheckpointNode: string | null;
  sourceInspected: boolean;
  artifactGranted: boolean;
  updatedAtIso: string;
}

export class AgeTrackResolver {
  static readonly SUPPORTED_TRACKS: GlobalAgeTrack[] = ['5-7', '8-10', '11-13', '14-17'];

  static normalizeTrack(track?: string | null): GlobalAgeTrack {
    if (track && (this.SUPPORTED_TRACKS as string[]).includes(track)) {
      return track as GlobalAgeTrack;
    }
    return '8-10';
  }

  static resolveChapterVariant(chapterId: string, ageTrack: GlobalAgeTrack) {
    const ch = (registryData.chapters as any[]).find((c) => c.id === chapterId);
    if (!ch) throw new Error(`Unknown chapterId: ${chapterId}`);
    const normalized = this.normalizeTrack(ageTrack);
    const variant = ch.ageVariants[normalized];
    if (!variant) throw new Error(`Missing age variant ${normalized} for chapter ${chapterId}`);
    return {
      chapterId: ch.id,
      countryCode: ch.countryCode as GlobalCountryCode,
      title: ch.title,
      sourceType: ch.sourceType,
      ageTrack: normalized,
      ...variant,
    };
  }
}

export class ObjectiveRegistry {
  static getAllChapters() {
    return registryData.chapters as any[];
  }

  static getCountryChapters(countryCode: GlobalCountryCode) {
    return (registryData.chapters as any[]).filter((c) => c.countryCode === countryCode);
  }

  static getChapterDefinition(chapterId: string) {
    const ch = (registryData.chapters as any[]).find((c) => c.id === chapterId);
    if (!ch) throw new Error(`Chapter not found: ${chapterId}`);
    return ch;
  }
}

export class QuestDirector {
  static initializeChapterMap(defaultTrack: GlobalAgeTrack = '8-10'): Record<string, GlobalChapterProgress> {
    const map: Record<string, GlobalChapterProgress> = {};
    for (const ch of ObjectiveRegistry.getAllChapters()) {
      map[ch.id] = {
        chapterId: ch.id,
        countryCode: ch.countryCode as GlobalCountryCode,
        lifecycle: ch.independentlyAvailableAtStart ? 'AVAILABLE' : 'LOCKED',
        ageTrackAtStart: defaultTrack,
        completedObjectiveNodes: [],
        attempts: 0,
        lastCheckpointNode: null,
        sourceInspected: false,
        artifactGranted: false,
        updatedAtIso: new Date().toISOString(),
      };
    }
    return map;
  }

  static startChapter(
    chaptersState: Record<string, GlobalChapterProgress>,
    chapterId: string,
    activeAgeTrack: GlobalAgeTrack
  ) {
    const def = ObjectiveRegistry.getChapterDefinition(chapterId);
    const rec = chaptersState[chapterId];
    if (!rec) throw new Error(`Missing state for chapter ${chapterId}`);
    if (rec.lifecycle === 'LOCKED') {
      return { ok: false, reason: 'PREREQUISITE_NOT_MET', variant: null, state: rec };
    }
    const variant = AgeTrackResolver.resolveChapterVariant(chapterId, activeAgeTrack);
    if (rec.lifecycle === 'AVAILABLE') {
      rec.lifecycle = 'STARTED';
    }
    rec.ageTrackAtStart = activeAgeTrack;
    rec.updatedAtIso = new Date().toISOString();
    return { ok: true, reason: 'CHAPTER_STARTED', variant, state: rec, definition: def };
  }

  static advanceObjectiveStep(
    chaptersState: Record<string, GlobalChapterProgress>,
    chapterId: string,
    activeAgeTrack: GlobalAgeTrack,
    stepNodeOrIndex?: string | number
  ) {
    const rec = chaptersState[chapterId];
    if (!rec) throw new Error(`Missing state for chapter ${chapterId}`);
    if (rec.lifecycle === 'LOCKED') {
      return { ok: false, reason: 'CHAPTER_LOCKED', state: rec };
    }
    if (rec.lifecycle === 'AVAILABLE') {
      rec.lifecycle = 'STARTED';
    }
    const variant = AgeTrackResolver.resolveChapterVariant(chapterId, activeAgeTrack);
    const nodes: string[] = variant.objectiveNodes;
    const nextNode =
      typeof stepNodeOrIndex === 'string'
        ? stepNodeOrIndex
        : typeof stepNodeOrIndex === 'number'
          ? nodes[stepNodeOrIndex]
          : nodes.find((n) => !rec.completedObjectiveNodes.includes(n)) || nodes[nodes.length - 1];

    if (nextNode && !rec.completedObjectiveNodes.includes(nextNode)) {
      rec.completedObjectiveNodes.push(nextNode);
      rec.lastCheckpointNode = nextNode;
    }
    rec.lifecycle =
      rec.completedObjectiveNodes.length >= nodes.length ? 'ACTIVITY_COMPLETE' : 'OBJECTIVE_PROGRESS';
    rec.updatedAtIso = new Date().toISOString();
    return {
      ok: true,
      reason: rec.lifecycle === 'ACTIVITY_COMPLETE' ? 'ALL_STEPS_COMPLETE' : 'STEP_CHECKPOINT_SAVED',
      completedSteps: rec.completedObjectiveNodes.length,
      requiredSteps: nodes.length,
      state: rec,
      variant,
    };
  }

  static recoverFromFailureOrRetry(
    chaptersState: Record<string, GlobalChapterProgress>,
    chapterId: string,
    activeAgeTrack: GlobalAgeTrack
  ) {
    const rec = chaptersState[chapterId];
    if (!rec) throw new Error(`Missing state for chapter ${chapterId}`);
    const variant = AgeTrackResolver.resolveChapterVariant(chapterId, activeAgeTrack);
    rec.attempts += 1;
    // Never lose resources or reset past last checkpoint
    rec.updatedAtIso = new Date().toISOString();
    return {
      ok: true,
      recoveryMode: variant.recoveryMode,
      timersEnabled: variant.timersEnabled,
      resourceLossPossible: variant.resourceLossPossible,
      resumedAtCheckpoint: rec.lastCheckpointNode,
      attempts: rec.attempts,
    };
  }

  static switchAgeTrackMidQuest(
    chaptersState: Record<string, GlobalChapterProgress>,
    chapterId: string,
    newAgeTrack: GlobalAgeTrack
  ) {
    const rec = chaptersState[chapterId];
    if (!rec) throw new Error(`Missing state for chapter ${chapterId}`);
    const newVariant = AgeTrackResolver.resolveChapterVariant(chapterId, newAgeTrack);
    const completedCount = rec.completedObjectiveNodes.length;
    rec.ageTrackAtStart = newAgeTrack;
    rec.completedObjectiveNodes = newVariant.objectiveNodes.slice(0, Math.min(completedCount, newVariant.objectiveNodes.length));
    rec.lastCheckpointNode = rec.completedObjectiveNodes[rec.completedObjectiveNodes.length - 1] || null;
    if (rec.lifecycle === 'OBJECTIVE_PROGRESS' && rec.completedObjectiveNodes.length >= newVariant.objectiveNodes.length) {
      rec.lifecycle = 'ACTIVITY_COMPLETE';
    }
    rec.updatedAtIso = new Date().toISOString();
    return { ok: true, newAgeTrack, variant: newVariant, state: rec };
  }

  static completeChapterAndUnlockNext(
    chaptersState: Record<string, GlobalChapterProgress>,
    chapterId: string
  ) {
    const def = ObjectiveRegistry.getChapterDefinition(chapterId);
    const rec = chaptersState[chapterId];
    if (!rec) throw new Error(`Missing state for chapter ${chapterId}`);
    rec.artifactGranted = true;
    rec.lifecycle = 'COMPLETED';
    rec.updatedAtIso = new Date().toISOString();

    // Unlock next sequential chapter in the same country if any
    const countryChapters = ObjectiveRegistry.getCountryChapters(def.countryCode as GlobalCountryCode);
    const nextChapter = countryChapters.find((c) => c.prerequisiteChapterId === chapterId);
    let unlockedNextChapterId: string | null = null;
    if (nextChapter && chaptersState[nextChapter.id]?.lifecycle === 'LOCKED') {
      chaptersState[nextChapter.id].lifecycle = 'AVAILABLE';
      chaptersState[nextChapter.id].updatedAtIso = new Date().toISOString();
      unlockedNextChapterId = nextChapter.id;
    }

    return {
      ok: true,
      completedChapterId: chapterId,
      unlockedNextChapterId,
      reward: def.reward,
    };
  }
}
