/**
 * MiraVerse v1.0 Minecraft Bedrock — Durable Save State, Migration & Backup Recovery
 * (`apps/minecraft/scripts/src/state/index.ts`)
 * Owner: CL04 (Wave W1–W3)
 */
import type { CountryId } from '../../../../../packages/content/schema.js';
import {
  COUNTRIES_V10,
  MC_V10_PLAYER_STATE_PREFIX,
  MC_V10_SCHEMA_VERSION,
  MC_V10_WORLD_STATE_KEY,
  type PlayerSaveStateV10,
  type WorldSaveStateV10,
} from '../contracts/index.js';
import { createInitialQuestRecord } from '../quests/index.js';

export interface DynamicPropertyStore {
  getDynamicProperty(key: string): string | number | boolean | undefined;
  setDynamicProperty(key: string, value: string | number | boolean | undefined): void;
}

export function createDefaultPlayerStateV10(playerId: string, playerName = 'Explorer'): PlayerSaveStateV10 {
  const quests = {} as PlayerSaveStateV10['quests'];
  for (const cc of COUNTRIES_V10) {
    quests[cc] = createInitialQuestRecord(cc);
  }
  return {
    schemaVersion: MC_V10_SCHEMA_VERSION,
    playerId,
    playerName,
    tutorialCompleted: false,
    activeCountry: 'HUB',
    visitedCountries: [],
    localMiraTokens: 0,
    inventoryLedger: {},
    quests,
  };
}

export function createDefaultWorldStateV10(): WorldSaveStateV10 {
  return {
    schemaVersion: MC_V10_SCHEMA_VERSION,
    hubConstructed: false,
    constructedRegions: [],
    restorationStagesByCountry: { LB: 0, EG: 0, IQ: 0, KR: 0, FR: 0 },
    plots: {},
    processedRewardKeys: [],
  };
}

export function loadPlayerStateV10(store: DynamicPropertyStore, playerId: string, playerName = 'Explorer'): PlayerSaveStateV10 {
  const key = `${MC_V10_PLAYER_STATE_PREFIX}${playerId}`;
  const raw = store.getDynamicProperty(key);
  const base = createDefaultPlayerStateV10(playerId, playerName);

  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged: PlayerSaveStateV10 = {
          ...base,
          ...parsed,
          schemaVersion: MC_V10_SCHEMA_VERSION,
          localMiraTokens: Math.max(0, Number(parsed.localMiraTokens) || 0),
          inventoryLedger: { ...(parsed.inventoryLedger || {}) },
          quests: { ...base.quests, ...(parsed.quests || {}) },
        };
        return merged;
      }
    } catch {
      // Quarantine corrupt player state backup and recover gracefully
      store.setDynamicProperty(`${key}:corrupt_bak`, raw);
    }
  }

  // Migrate legacy v0.1 / v0.4 mv:stamp:<CC> dynamic properties if present
  for (const cc of COUNTRIES_V10) {
    const legacyStamp = store.getDynamicProperty(`mv:stamp:${cc}`);
    if (typeof legacyStamp === 'string' && legacyStamp.startsWith('MV-')) {
      base.quests[cc].stampCode = legacyStamp;
      base.quests[cc].lifecycle = 'REWARDED';
      base.quests[cc].rewardGranted = true;
      base.quests[cc].completedChallenges = ['gather', 'trade', 'cook', 'build', 'word'];
      base.quests[cc].restorationStage = 2;
    }
  }

  savePlayerStateV10(store, base);
  return base;
}

export function savePlayerStateV10(store: DynamicPropertyStore, state: PlayerSaveStateV10): void {
  state.localMiraTokens = Math.max(0, state.localMiraTokens);
  const key = `${MC_V10_PLAYER_STATE_PREFIX}${state.playerId}`;
  store.setDynamicProperty(key, JSON.stringify(state));
}

export function loadWorldStateV10(store: DynamicPropertyStore): WorldSaveStateV10 {
  const raw = store.getDynamicProperty(MC_V10_WORLD_STATE_KEY);
  const base = createDefaultWorldStateV10();
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...base,
          ...parsed,
          schemaVersion: MC_V10_SCHEMA_VERSION,
          restorationStagesByCountry: { ...base.restorationStagesByCountry, ...(parsed.restorationStagesByCountry || {}) },
          plots: { ...(parsed.plots || {}) },
          processedRewardKeys: Array.isArray(parsed.processedRewardKeys) ? parsed.processedRewardKeys : [],
        };
      }
    } catch {
      store.setDynamicProperty(`${MC_V10_WORLD_STATE_KEY}:corrupt_bak`, raw);
    }
  }
  saveWorldStateV10(store, base);
  return base;
}

export function saveWorldStateV10(store: DynamicPropertyStore, worldState: WorldSaveStateV10): void {
  store.setDynamicProperty(MC_V10_WORLD_STATE_KEY, JSON.stringify(worldState));
}


// ============================================================================
// MiraVerse Global v1.1 — StateStore, RewardLedger, Circle of Stories Finale & Save Migration
// Owner: CX03 (Wave W2)
// ============================================================================
import {
  QuestDirector,
  type GlobalAgeTrack,
  type GlobalChapterProgress,
  type GlobalCountryCode,
} from '../quests/index.js';
import type { SupportedLocaleId } from '../locales/index.js';

export const MC_GLOBAL_V11_SCHEMA_VERSION = '1.1.0';
export const MC_GLOBAL_V11_PLAYER_KEY_PREFIX = 'mv:v11:player:';

export interface GlobalPlayerSaveStateV11 {
  schemaVersion: string;
  playerId: string;
  playerName: string;
  locale: SupportedLocaleId;
  ageTrack: GlobalAgeTrack;
  activeLocation: 'HUB' | GlobalCountryCode;
  storySparks: number;
  earnedArtifacts: string[];
  earnedKeepsakes: string[];
  earnedStamps: string[];
  processedRewardKeys: string[];
  circleOfStoriesCompleted: boolean;
  chapters: Record<string, GlobalChapterProgress>;
  migratedFromSchema: string | null;
}

export class RewardLedger {
  static grantChapterRewardsIdempotent(
    state: GlobalPlayerSaveStateV11,
    chapterId: string,
    artifactId: string,
    sparks: number,
    countryStampId: string | null = null,
    capstoneKeepsakeId: string | null = null
  ) {
    const key = `${state.playerId}:chapter:${chapterId}`;
    if (state.processedRewardKeys.includes(key)) {
      return {
        ok: true,
        deduplicated: true,
        sparksAdded: 0,
        artifactGranted: artifactId,
        stampGranted: countryStampId,
        keepsakeGranted: capstoneKeepsakeId,
      };
    }
    state.processedRewardKeys.push(key);
    state.storySparks += Math.max(0, sparks);
    if (!state.earnedArtifacts.includes(artifactId)) {
      state.earnedArtifacts.push(artifactId);
    }
    if (countryStampId && !state.earnedStamps.includes(countryStampId)) {
      state.earnedStamps.push(countryStampId);
    }
    if (capstoneKeepsakeId && !state.earnedKeepsakes.includes(capstoneKeepsakeId)) {
      state.earnedKeepsakes.push(capstoneKeepsakeId);
    }
    return {
      ok: true,
      deduplicated: false,
      sparksAdded: sparks,
      artifactGranted: artifactId,
      stampGranted: countryStampId,
      keepsakeGranted: capstoneKeepsakeId,
    };
  }

  static tryCompleteCircleOfStoriesFinale(state: GlobalPlayerSaveStateV11) {
    if (state.earnedKeepsakes.length < 3) {
      return {
        ok: false,
        reason: 'REQUIRES_AT_LEAST_3_COUNTRY_KEEPSAKES',
        currentKeepsakesCount: state.earnedKeepsakes.length,
        requiredMinimum: 3,
      };
    }
    const key = `${state.playerId}:finale:circle_of_stories`;
    const deduplicated = state.processedRewardKeys.includes(key);
    if (!deduplicated) {
      state.processedRewardKeys.push(key);
      state.storySparks += 100;
    }
    state.circleOfStoriesCompleted = true;
    if (!state.earnedStamps.includes('stamp_global_storykeeper')) {
      state.earnedStamps.push('stamp_global_storykeeper');
    }
    return {
      ok: true,
      deduplicated,
      reason: 'CIRCLE_OF_STORIES_COMPLETED',
      finaleStampId: 'stamp_global_storykeeper',
      keepsakesUsed: [...state.earnedKeepsakes],
    };
  }
}

export class StateStore {
  static createDefaultGlobalPlayerState(
    playerId: string,
    playerName = 'Storykeeper',
    locale: SupportedLocaleId = 'en-US',
    ageTrack: GlobalAgeTrack = '8-10'
  ): GlobalPlayerSaveStateV11 {
    return {
      schemaVersion: MC_GLOBAL_V11_SCHEMA_VERSION,
      playerId,
      playerName,
      locale,
      ageTrack,
      activeLocation: 'HUB',
      storySparks: 0,
      earnedArtifacts: [],
      earnedKeepsakes: [],
      earnedStamps: [],
      processedRewardKeys: [],
      circleOfStoriesCompleted: false,
      chapters: QuestDirector.initializeChapterMap(ageTrack),
      migratedFromSchema: null,
    };
  }

  static migrateFromV10PlayerState(v10: PlayerSaveStateV10): GlobalPlayerSaveStateV11 {
    const v11 = this.createDefaultGlobalPlayerState(v10.playerId, v10.playerName, 'en-US', '8-10');
    v11.migratedFromSchema = v10.schemaVersion || '10.0.0';
    v11.storySparks = Math.max(0, v10.localMiraTokens || 0);

    const legacyMap: Record<CountryId, { ch1: string; ch2: string; stamp: string; keepsake: string }> = {
      LB: { ch1: 'LB01', ch2: 'LB02', stamp: 'lb_harbor_home_stamp', keepsake: 'lb_cedar_sea_memory_chest' },
      IQ: { ch1: 'IQ01', ch2: 'IQ02', stamp: 'iq_baghdad_wisdom_stamp', keepsake: 'iq_house_of_wisdom_lantern' },
      EG: { ch1: 'EG01', ch2: 'EG02', stamp: 'eg_nile_voyager_stamp', keepsake: 'eg_carved_solar_barque_model' },
      FR: { ch1: 'FR01', ch2: 'FR02', stamp: 'fr_atelier_lumiere_stamp', keepsake: 'fr_clockwork_stage_lantern' },
      KR: { ch1: 'KR01', ch2: 'KR02', stamp: 'kr_harmony_courtyard_stamp', keepsake: 'kr_celadon_moon_jar_lantern' },
    };

    for (const cc of COUNTRIES_V10) {
      const q = v10.quests?.[cc];
      const mapping = legacyMap[cc];
      if (q && (q.lifecycle === 'COMPLETED' || q.lifecycle === 'REWARDED' || q.stampCode)) {
        v11.chapters[mapping.ch1].lifecycle = 'COMPLETED';
        v11.chapters[mapping.ch1].artifactGranted = true;
        v11.chapters[mapping.ch2].lifecycle = 'AVAILABLE';
        if (q.stampCode && !v11.earnedStamps.includes(q.stampCode)) {
          v11.earnedStamps.push(q.stampCode);
        }
        if (!v11.earnedStamps.includes(mapping.stamp)) {
          v11.earnedStamps.push(mapping.stamp);
        }
      }
    }
    return v11;
  }

  static saveGlobalPlayerState(store: DynamicPropertyStore, state: GlobalPlayerSaveStateV11): void {
    store.setDynamicProperty(`${MC_GLOBAL_V11_PLAYER_KEY_PREFIX}${state.playerId}`, JSON.stringify(state));
  }

  static loadGlobalPlayerState(
    store: DynamicPropertyStore,
    playerId: string,
    playerName = 'Storykeeper'
  ): GlobalPlayerSaveStateV11 {
    const key = `${MC_GLOBAL_V11_PLAYER_KEY_PREFIX}${playerId}`;
    const raw = store.getDynamicProperty(key);
    if (typeof raw === 'string' && raw.length > 0) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.schemaVersion === MC_GLOBAL_V11_SCHEMA_VERSION) {
          return parsed as GlobalPlayerSaveStateV11;
        }
      } catch {
        store.setDynamicProperty(`${key}:corrupt_bak`, raw);
      }
    }
    // Check if v1.0 state exists and migrate automatically
    const v10Raw = store.getDynamicProperty(`${MC_V10_PLAYER_STATE_PREFIX}${playerId}`);
    if (typeof v10Raw === 'string' && v10Raw.length > 0) {
      const v10State = loadPlayerStateV10(store, playerId, playerName);
      const migrated = this.migrateFromV10PlayerState(v10State);
      this.saveGlobalPlayerState(store, migrated);
      return migrated;
    }
    const fresh = this.createDefaultGlobalPlayerState(playerId, playerName);
    this.saveGlobalPlayerState(store, fresh);
    return fresh;
  }
}
