/**
 * MiraVerse v1.0 Minecraft Bedrock — Durable Save State, Migration & Backup Recovery
 * (`apps/minecraft/scripts/src/state/index.ts`)
 * Owner: CL04 (Wave W1–W3)
 */
import type { CountryId } from '../../../../../../packages/content/schema.js';
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
