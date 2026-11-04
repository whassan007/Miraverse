/**
 * MiraVerse v1.0 Minecraft Bedrock — Authoritative Subsystem Contracts
 * (`apps/minecraft/scripts/src/contracts/index.ts`)
 * Owner: CL01 (Wave W0)
 * Defines shared types and invariants for Quests, Regions, Structures, NPCs,
 * Gather/Trade/Cook/Build/Word Challenges, Plot Ownership, Multiplayer Co-Op, and Persistence.
 */
import type { CountryId } from '../../../../../packages/content/schema.js';

export const MC_V10_SCHEMA_VERSION = 'mv.mc.v10';
export const MC_V10_WORLD_STATE_KEY = 'mv:v10:world_state';
export const MC_V10_PLAYER_STATE_PREFIX = 'mv:v10:player:';

export const COUNTRIES_V10: readonly CountryId[] = ['LB', 'EG', 'IQ', 'KR', 'FR'] as const;
export const CHALLENGE_ORDER_V10 = ['gather', 'trade', 'cook', 'build', 'word'] as const;
export type ChallengeKindV10 = (typeof CHALLENGE_ORDER_V10)[number];

export type QuestLifecycleState = 'DISCOVERED' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REWARDED';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BuildingExteriorSpec {
  buildingId: string;
  nameEn: string;
  nameNative: string;
  origin: Vec3;
  size: Vec3;
  wallBlock: string;
  roofBlock: string;
  trimBlock: string;
  hasInterior: boolean;
  interiorId?: string;
}

export interface FurnishedInteriorSpec {
  interiorId: string;
  buildingId: string;
  nameEn: string;
  entryPos: Vec3;
  furnishings: Array<{ propId: string; blockId: string; offset: Vec3; labelEn: string }>;
}

export interface NpcPlacementSpec {
  npcId: string;
  entityTypeId: string;
  country: CountryId | 'HUB';
  nameEn: string;
  nameNative: string;
  role: 'mentor' | 'merchant' | 'artisan' | 'cousin';
  spawnPos: Vec3;
  defaultAnimation: 'idle' | 'walk' | 'greeting' | 'pointing' | 'celebrate' | 'working';
  dialogueGreetingEn: string;
  dialogueGreetingNative: string;
  humanReviewRequired: boolean;
}

export interface InteractiveAnchorSpec {
  anchorId: string;
  country: CountryId | 'HUB';
  kind: 'portal' | 'gather_node' | 'trade_stall' | 'cooking_station' | 'restoration_site' | 'word_object' | 'plot_stone' | 'wayfinding_sign' | 'optional_collectible';
  pos: Vec3;
  blockId: string;
  labelEn: string;
  labelNative?: string;
  transliteration?: string;
  linkedItemId?: string;
}

export interface RestorationStageSpec {
  stage: 0 | 1 | 2; // 0 = before (damaged), 1 = mid restoration, 2 = after (fully restored)
  descriptionEn: string;
  blockPlacements: Array<{ offset: Vec3; blockId: string }>;
}

export interface CookingSequenceSpec {
  country: CountryId;
  dishItemId: string;
  dishNameEn: string;
  dishNameNative: string;
  stationBlockId: string;
  orderedSteps: Array<{
    stepIndex: number;
    ingredientItemId: string;
    quantity: number;
    actionVerb: string;
    adultSupervisionNote?: string;
  }>;
}

export interface RegionDistrictContract {
  country: CountryId;
  titleEn: string;
  titleNative: string;
  origin: Vec3;
  footprint: { width: number; height: number; depth: number };
  spawnPos: Vec3;
  returnPortalPos: Vec3;
  privatePlotOrigin: Vec3;
  privatePlotRadius: number;
  exteriors: BuildingExteriorSpec[];
  interiors: FurnishedInteriorSpec[];
  npcs: NpcPlacementSpec[];
  anchors: InteractiveAnchorSpec[];
  restorationOrigin: Vec3;
  restorationRequiredItems: Array<{ itemId: string; count: number }>;
  restorationStages: RestorationStageSpec[];
  cookingSequence: CookingSequenceSpec;
}

export interface PlayerQuestRecordV10 {
  country: CountryId;
  lifecycle: QuestLifecycleState;
  completedChallenges: ChallengeKindV10[];
  gatheredNodeIds: string[];
  optionalCollectiblesFound: string[];
  cookingStepProgress: number;
  restorationStage: 0 | 1 | 2;
  discoveredWords: string[];
  stampCode: string | null;
  rewardGranted: boolean;
  updatedAtIso: string;
}

export interface PlayerSaveStateV10 {
  schemaVersion: typeof MC_V10_SCHEMA_VERSION;
  playerId: string;
  playerName: string;
  tutorialCompleted: boolean;
  activeCountry: CountryId | 'HUB';
  visitedCountries: CountryId[];
  localMiraTokens: number;
  inventoryLedger: Record<string, number>;
  quests: Record<CountryId, PlayerQuestRecordV10>;
}

export interface PlotOwnershipRecordV10 {
  plotId: string;
  country: CountryId;
  origin: Vec3;
  radius: number;
  ownerPlayerId: string;
  collaboratorPlayerIds: string[];
  placedBlocks: Array<{ pos: Vec3; blockId: string; placedBy: string }>;
  quotaLimit: number;
}

export interface WorldSaveStateV10 {
  schemaVersion: typeof MC_V10_SCHEMA_VERSION;
  hubConstructed: boolean;
  constructedRegions: CountryId[];
  restorationStagesByCountry: Record<CountryId, 0 | 1 | 2>;
  plots: Record<string, PlotOwnershipRecordV10>;
  processedRewardKeys: string[];
}
