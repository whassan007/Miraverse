/**
 * Server-side validation in front of QuestDirector for the Phoenicia quests.
 * QuestDirector accepts any objective node, so this layer enforces order,
 * location and choice before it advances. Mirrored by
 * apps/roblox/src/server/Phoenicia/Gate.luau; tests/phoenicia/vectors.json checks both.
 */
import compiled from '../../../../../packages/content/phoenicia/generated/world.compiled.json';
import { ObjectiveRegistry, QuestDirector, type GlobalChapterProgress } from '../quests/index.js';

export const PHOENICIA = compiled as any;
export const QUEST_ID = 'TYR-05';
export const SAVE_VERSION = 1;
const MAX_PROCESSED_EVENTS = 64;
const AGE_TRACK = '8-10' as const;

const quest = PHOENICIA.quests[QUEST_ID];
ObjectiveRegistry.registerExtensionChapter(quest);

export interface PhoeniciaState {
  schemaVersion: number;
  region: string;
  chapter: GlobalChapterProgress;
  processedEventIds: string[];
  storySparks: number;
  artifacts: string[];
  arrived: boolean;
  locale: string | null;
  eventSeq: number;
}

export interface GateEvent {
  eventId: string;
  nodeId: string;
  region: string;
  x: number;
  z: number;
  choiceId?: string;
}

export type GateCode =
  | 'OK'
  | 'QUEST_COMPLETED'
  | 'INVALID_EVENT'
  | 'DUPLICATE_EVENT'
  | 'ALREADY_COMPLETE'
  | 'UNKNOWN_NODE'
  | 'OUT_OF_ORDER'
  | 'WRONG_REGION'
  | 'OUT_OF_RANGE'
  | 'INVALID_CHOICE'
  | 'WRONG_CHOICE';

export function createState(): PhoeniciaState {
  return {
    schemaVersion: SAVE_VERSION,
    region: quest.hub,
    chapter: {
      chapterId: QUEST_ID,
      countryCode: quest.countryCode,
      lifecycle: 'AVAILABLE',
      ageTrackAtStart: AGE_TRACK,
      completedObjectiveNodes: [],
      attempts: 0,
      lastCheckpointNode: null,
      sourceInspected: false,
      artifactGranted: false,
      updatedAtIso: new Date().toISOString(),
    },
    processedEventIds: [],
    storySparks: 0,
    artifacts: [],
    arrived: false,
    locale: null,
    eventSeq: 0,
  };
}

/** Returns null for anything that is not a valid save of this version. */
export function parseState(raw: unknown): PhoeniciaState | null {
  if (typeof raw !== 'string') return null;
  try {
    const s = JSON.parse(raw);
    const valid =
      s?.schemaVersion === SAVE_VERSION &&
      typeof PHOENICIA.regions[s.region] === 'object' &&
      s.chapter?.chapterId === QUEST_ID &&
      Array.isArray(s.chapter.completedObjectiveNodes) &&
      s.chapter.completedObjectiveNodes.every((n: unknown) => quest.nodeOrder.includes(n)) &&
      Array.isArray(s.processedEventIds) &&
      Array.isArray(s.artifacts) &&
      typeof s.storySparks === 'number';
    return valid ? (s as PhoeniciaState) : null;
  } catch {
    return null;
  }
}

export function currentNode(state: PhoeniciaState): any | null {
  const id = quest.nodeOrder[state.chapter.completedObjectiveNodes.length];
  return id ? quest.nodes.find((n: any) => n.id === id) : null;
}

function remember(state: PhoeniciaState, eventId: string): void {
  state.processedEventIds.push(eventId);
  if (state.processedEventIds.length > MAX_PROCESSED_EVENTS) state.processedEventIds.shift();
}

export function applyEvent(state: PhoeniciaState, e: GateEvent): GateCode {
  if (
    typeof e?.eventId !== 'string' || e.eventId.length < 4 ||
    typeof e.nodeId !== 'string' || typeof e.region !== 'string' ||
    typeof e.x !== 'number' || typeof e.z !== 'number'
  ) {
    return 'INVALID_EVENT';
  }
  if (state.processedEventIds.includes(e.eventId)) return 'DUPLICATE_EVENT';
  if (state.chapter.lifecycle === 'COMPLETED') return 'ALREADY_COMPLETE';

  const node = quest.nodes.find((n: any) => n.id === e.nodeId);
  if (!node) return 'UNKNOWN_NODE';
  if (node.id !== currentNode(state)?.id) return 'OUT_OF_ORDER';

  const { anchor } = node;
  if (state.region !== anchor.region || e.region !== anchor.region) return 'WRONG_REGION';
  const dx = e.x - anchor.x;
  const dz = e.z - anchor.z;
  if (dx * dx + dz * dz > anchor.radius * anchor.radius) return 'OUT_OF_RANGE';

  const option = node.options.find((o: any) => o.id === e.choiceId);
  if (!option) return 'INVALID_CHOICE';

  const chapters = { [QUEST_ID]: state.chapter };
  if (!option.correct) {
    QuestDirector.recoverFromFailureOrRetry(chapters, QUEST_ID, AGE_TRACK);
    remember(state, e.eventId);
    return 'WRONG_CHOICE';
  }

  QuestDirector.startChapter(chapters, QUEST_ID, AGE_TRACK);
  QuestDirector.advanceObjectiveStep(chapters, QUEST_ID, AGE_TRACK, node.id);
  remember(state, e.eventId);
  if (node.arriveRegion) state.region = node.arriveRegion;

  if (state.chapter.lifecycle !== 'ACTIVITY_COMPLETE') return 'OK';

  const alreadyRewarded = state.chapter.artifactGranted;
  const { reward } = QuestDirector.completeChapterAndUnlockNext(chapters, QUEST_ID);
  if (!alreadyRewarded) {
    state.storySparks += reward.storySparks;
    state.artifacts.push(reward.artifactId);
  }
  return 'QUEST_COMPLETED';
}

/** Engine-neutral view of the state, compared against the shared test vectors. */
export function snapshot(state: PhoeniciaState) {
  return {
    lifecycle: state.chapter.lifecycle,
    completed: [...state.chapter.completedObjectiveNodes],
    region: state.region,
    storySparks: state.storySparks,
    artifacts: [...state.artifacts],
    attempts: state.chapter.attempts,
  };
}
