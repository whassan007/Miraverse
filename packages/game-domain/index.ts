/**
 * Portable 3D Adventure Game Domain (`packages/game-domain/index.ts`)
 * Pure TypeScript state machine for quests, inventory, building restoration,
 * Souvenir Passport stamps, earned guest Mira Tokens, and transactional save migration
 * (`mv.save.v4` from `mv.stamps`, v1, v2, v3).
 * Zero Babylon.js, Phaser, or DOM dependencies.
 */
import {
  COUNTRIES,
  CHALLENGE_TYPES,
  type ChallengeType,
  type CountryCode,
  type SaveStateV4,
  type UiLang,
} from '../contracts/index';
import { encodeStamp, decodeStamp } from '../shared/stamp';

export const SAVE_KEY_V4 = 'mv.save.v4';
export const LEGACY_STAMPS_KEY = 'mv.stamps';
export const CORRUPT_BACKUP_KEY = 'mv.save.corrupt.bak';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type GameDomainEventType =
  | 'questChanged'
  | 'inventoryChanged'
  | 'sceneLoaded'
  | 'dialogueOpen'
  | 'tokensChanged'
  | 'stampEarned'
  | 'buildingRestored'
  | 'settingsChanged';

export interface GameDomainEvent {
  type: GameDomainEventType;
  country?: CountryCode | 'HUB';
  detail?: Record<string, unknown>;
  timestamp: string;
}

export type GameDomainListener = (event: GameDomainEvent) => void;

export function createDefaultSaveStateV4(): SaveStateV4 {
  return {
    version: 'mv.save.v4',
    updatedAt: new Date().toISOString(),
    activeCountry: 'HUB',
    playerPosition: {
      HUB: [0, 0, 0],
      FR: [0, 0, -8],
      LB: [0, 0, -8],
      EG: [0, 0, -8],
      IQ: [0, 0, -8],
      KR: [0, 0, -8],
    },
    questProgress: {},
    completedChallenges: {
      FR: [],
      LB: [],
      EG: [],
      IQ: [],
      KR: [],
    },
    inventory: {},
    restoredBuildings: {
      FR: 0,
      LB: 0,
      EG: 0,
      IQ: 0,
      KR: 0,
    },
    stamps: {},
    guestMiraTokens: 0,
    unlockedCosmetics: [],
    settings: {
      muted: false,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      qualityTier: 'auto',
      reducedMotion: false,
      textScale: 1.0,
      uiLang: 'en',
    },
  };
}

function resolveStorage(explicit?: StorageLike): StorageLike | null {
  if (explicit) return explicit;
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage as StorageLike;
    }
  } catch {
    // Storage restricted
  }
  return null;
}

export function loadAndMigrateSave(storage?: StorageLike): SaveStateV4 {
  const store = resolveStorage(storage);
  const base = createDefaultSaveStateV4();
  if (!store) return base;

  // 1. Inspect existing mv.save.v4
  const rawV4 = store.getItem(SAVE_KEY_V4);
  if (rawV4) {
    try {
      const parsed = JSON.parse(rawV4);
      if (parsed && parsed.version === 'mv.save.v4' && typeof parsed.completedChallenges === 'object') {
        const merged: SaveStateV4 = {
          ...base,
          ...parsed,
          completedChallenges: { ...base.completedChallenges, ...(parsed.completedChallenges || {}) },
          restoredBuildings: { ...base.restoredBuildings, ...(parsed.restoredBuildings || {}) },
          settings: { ...base.settings, ...(parsed.settings || {}) },
        };
        return syncLegacyStampsIntoState(merged, store);
      }
      // Malformed structure
      store.setItem(CORRUPT_BACKUP_KEY, rawV4);
    } catch {
      store.setItem(CORRUPT_BACKUP_KEY, rawV4);
    }
  }

  // 2. Check v3 / v2 / v1 keys if present
  for (const oldKey of ['mv.save.v3', 'mv.save.v2', 'mv.save.v1']) {
    const rawOld = store.getItem(oldKey);
    if (rawOld) {
      try {
        const parsedOld = JSON.parse(rawOld);
        if (parsedOld && typeof parsedOld === 'object') {
          if (parsedOld.inventory && typeof parsedOld.inventory === 'object') {
            base.inventory = { ...parsedOld.inventory };
          }
          if (parsedOld.stamps && typeof parsedOld.stamps === 'object') {
            base.stamps = { ...parsedOld.stamps };
          }
          if (typeof parsedOld.guestMiraTokens === 'number' && parsedOld.guestMiraTokens >= 0) {
            base.guestMiraTokens = parsedOld.guestMiraTokens;
          }
        }
      } catch {
        // Ignore corrupt legacy key
      }
    }
  }

  // 3. Migrate legacy mv.stamps (from v0.1)
  const migrated = syncLegacyStampsIntoState(base, store);
  saveStateAtomically(migrated, store);
  return migrated;
}

function syncLegacyStampsIntoState(state: SaveStateV4, store: StorageLike): SaveStateV4 {
  const rawStamps = store.getItem(LEGACY_STAMPS_KEY);
  if (!rawStamps) return state;
  try {
    const parsed = JSON.parse(rawStamps);
    // Support both array of stamp strings and Record<CountryCode, string>
    const codes: string[] = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : parsed && typeof parsed === 'object'
        ? Object.values(parsed).filter((x): x is string => typeof x === 'string')
        : [];

    for (const code of codes) {
      const dec = decodeStamp(code);
      if (dec.valid && dec.country && COUNTRIES.includes(dec.country as CountryCode)) {
        const cc = dec.country as CountryCode;
        state.stamps[cc] = code;
        if ((state.completedChallenges[cc] || []).length < 5) {
          state.completedChallenges[cc] = [...CHALLENGE_TYPES];
          state.restoredBuildings[cc] = 3;
        }
      }
    }
  } catch {
    // Ignore corrupt mv.stamps
  }
  return state;
}

export function saveStateAtomically(state: SaveStateV4, storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  state.updatedAt = new Date().toISOString();
  const serialized = JSON.stringify(state);
  store.setItem(SAVE_KEY_V4, serialized);
  // Keep mv.stamps synchronized for backward compatibility with Passport stamp reader
  store.setItem(LEGACY_STAMPS_KEY, JSON.stringify(state.stamps));
}

export class GameDomainController {
  private state: SaveStateV4;
  private storage: StorageLike | null;
  private listeners = new Set<GameDomainListener>();

  constructor(storage?: StorageLike) {
    this.storage = resolveStorage(storage);
    this.state = loadAndMigrateSave(this.storage || undefined);
  }

  getState(): SaveStateV4 {
    return this.state;
  }

  subscribe(listener: GameDomainListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: GameDomainEventType, country?: CountryCode | 'HUB', detail?: Record<string, unknown>) {
    const evt: GameDomainEvent = {
      type,
      country,
      detail,
      timestamp: new Date().toISOString(),
    };
    for (const l of this.listeners) {
      l(evt);
    }
  }

  private persist() {
    if (this.storage) {
      saveStateAtomically(this.state, this.storage);
    }
  }

  setActiveCountry(country: CountryCode | 'HUB', spawnPos?: [number, number, number]) {
    this.state.activeCountry = country;
    if (spawnPos) {
      this.state.playerPosition[country] = spawnPos;
    }
    this.persist();
    this.emit('sceneLoaded', country, { position: this.state.playerPosition[country] });
  }

  updatePlayerPosition(country: CountryCode | 'HUB', pos: [number, number, number]) {
    this.state.playerPosition[country] = pos;
    this.persist();
  }

  addItem(itemId: string, quantity = 1) {
    if (quantity <= 0) return;
    this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + quantity;
    this.persist();
    this.emit('inventoryChanged', this.state.activeCountry, { itemId, count: this.state.inventory[itemId] });
  }

  tradeItems(giveItemId: string, giveQty: number, receiveItemId: string, receiveQty: number): { ok: boolean; reason?: string } {
    const current = this.state.inventory[giveItemId] || 0;
    if (current < giveQty) {
      return { ok: false, reason: 'INSUFFICIENT_ITEMS' };
    }
    this.state.inventory[giveItemId] = current - giveQty;
    if (this.state.inventory[giveItemId] === 0) {
      delete this.state.inventory[giveItemId];
    }
    this.state.inventory[receiveItemId] = (this.state.inventory[receiveItemId] || 0) + receiveQty;
    this.persist();
    this.emit('inventoryChanged', this.state.activeCountry, { traded: giveItemId, received: receiveItemId });
    return { ok: true };
  }

  completeChallenge(country: CountryCode, challenge: ChallengeType, questId = `${country}:ch1:main`): {
    alreadyCompleted: boolean;
    tokensAwarded: number;
    chapterCompleted: boolean;
    stampCode?: string;
  } {
    const list = this.state.completedChallenges[country] || [];
    const alreadyCompleted = list.includes(challenge);
    let tokensAwarded = 0;

    if (!alreadyCompleted) {
      list.push(challenge);
      this.state.completedChallenges[country] = list;
      tokensAwarded = 20;
      this.state.guestMiraTokens += tokensAwarded;
    }

    if (challenge === 'build') {
      this.state.restoredBuildings[country] = 3;
      this.emit('buildingRestored', country, { stage: 3 });
    }

    const qEntry = this.state.questProgress[questId] || {
      status: 'IN_PROGRESS',
      completedObjectives: [],
      updatedAt: new Date().toISOString(),
    };
    const objId = `${questId}:${challenge}`;
    if (!qEntry.completedObjectives.includes(objId)) {
      qEntry.completedObjectives.push(objId);
    }

    const chapterCompleted = CHALLENGE_TYPES.every((k) => this.state.completedChallenges[country].includes(k));
    let stampCode = this.state.stamps[country];

    if (chapterCompleted) {
      qEntry.status = 'COMPLETED';
      if (!stampCode) {
        stampCode = encodeStamp(country, 1, 5555);
        this.state.stamps[country] = stampCode;
        tokensAwarded += 50;
        this.state.guestMiraTokens += 50;
        this.emit('stampEarned', country, { stampCode });
      }
    }
    qEntry.updatedAt = new Date().toISOString();
    this.state.questProgress[questId] = qEntry;

    this.persist();
    this.emit('questChanged', country, {
      challenge,
      completedChallenges: this.state.completedChallenges[country],
      chapterCompleted,
    });
    if (tokensAwarded > 0) {
      this.emit('tokensChanged', country, { guestMiraTokens: this.state.guestMiraTokens, delta: tokensAwarded });
    }
    return { alreadyCompleted, tokensAwarded, chapterCompleted, stampCode };
  }

  redeemOfflineStamp(code: string): { ok: boolean; country?: CountryCode; reason?: string } {
    const dec = decodeStamp(code.trim());
    if (!dec.valid || !dec.country || !COUNTRIES.includes(dec.country as CountryCode)) {
      return { ok: false, reason: 'INVALID_STAMP' };
    }
    const cc = dec.country as CountryCode;
    if (this.state.stamps[cc]) {
      return { ok: false, country: cc, reason: 'DUPLICATE_STAMP' };
    }
    this.state.stamps[cc] = code.trim().toUpperCase();
    this.state.completedChallenges[cc] = [...CHALLENGE_TYPES];
    this.state.restoredBuildings[cc] = 3;
    this.persist();
    this.emit('stampEarned', cc, { stampCode: this.state.stamps[cc], source: 'offline_redeem' });
    return { ok: true, country: cc };
  }

  updateSettings(patch: Partial<SaveStateV4['settings']>) {
    this.state.settings = { ...this.state.settings, ...patch };
    this.persist();
    this.emit('settingsChanged', this.state.activeCountry, { settings: this.state.settings });
  }

  exportSaveJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  resetSave(): SaveStateV4 {
    this.state = createDefaultSaveStateV4();
    if (this.storage) {
      this.storage.removeItem(SAVE_KEY_V4);
      this.storage.removeItem(LEGACY_STAMPS_KEY);
      saveStateAtomically(this.state, this.storage);
    }
    this.emit('questChanged', 'HUB', { reset: true });
    return this.state;
  }
}
