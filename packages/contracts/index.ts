/**
 * MiraVerse v0.4 Shared Contracts (`packages/contracts/index.ts`)
 * Authoritative semantic ID scheme, 3D level manifests, quest/dialogue schemas,
 * asset metadata, compiler bundle headers, and versioned save schema (mv.save.v4).
 */
export const COUNTRIES = ['LB', 'EG', 'IQ', 'KR', 'FR'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const CHALLENGE_TYPES = ['gather', 'trade', 'build', 'cook', 'word'] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const STORY_LANGS = ['ar-LB', 'ar-EG', 'ar-IQ', 'ko', 'fr'] as const;
export type StoryLang = (typeof STORY_LANGS)[number];

export const UI_LANGS = ['en', ...STORY_LANGS] as const;
export type UiLang = (typeof UI_LANGS)[number];

export const COUNTRY_TO_LANG: Record<CountryCode, StoryLang> = {
  LB: 'ar-LB',
  EG: 'ar-EG',
  IQ: 'ar-IQ',
  KR: 'ko',
  FR: 'fr',
};

export const COUNTRY_META: Record<
  CountryCode,
  {
    code: CountryCode;
    nameEn: string;
    nameNative: string;
    regionName: string;
    mentorId: string;
    mentorName: string;
    signatureDish: string;
    landmarkName: string;
    storyLang: StoryLang;
    hubPortalPosition: [number, number, number];
    primaryColorHex: string;
    accentColorHex: string;
  }
> = {
  FR: {
    code: 'FR',
    nameEn: 'France',
    nameNative: 'France · Vieux Lyon',
    regionName: 'Vieux Lyon & Traboules',
    mentorId: 'npc:FR:mamie_claire',
    mentorName: 'Mamie Claire',
    signatureDish: 'Galette des Rois',
    landmarkName: 'Boulangerie du Soleil',
    storyLang: 'fr',
    hubPortalPosition: [0, 0, 14],
    primaryColorHex: '#3B6EA5',
    accentColorHex: '#E8A838',
  },
  LB: {
    code: 'LB',
    nameEn: 'Lebanon',
    nameNative: 'لبنان · جبيل',
    regionName: 'Byblos Harbor & Old Souk',
    mentorId: 'npc:LB:teta_nahla',
    mentorName: 'Teta Nahla',
    signatureDish: "Za'atar Man'oushe",
    landmarkName: 'Byblos Saj Bakery & Harbor Arch',
    storyLang: 'ar-LB',
    hubPortalPosition: [-13, 0, 5],
    primaryColorHex: '#1E7A68',
    accentColorHex: '#D97B38',
  },
  EG: {
    code: 'EG',
    nameEn: 'Egypt',
    nameNative: 'مصر · القاهرة',
    regionName: 'Cairo Lantern Courtyard',
    mentorId: 'npc:EG:teta_samira',
    mentorName: 'Teta Samira',
    signatureDish: 'Cairene Koshari',
    landmarkName: 'Khan Courtyard & Fanous Archway',
    storyLang: 'ar-EG',
    hubPortalPosition: [-8, 0, -12],
    primaryColorHex: '#2B4C7E',
    accentColorHex: '#F0B429',
  },
  IQ: {
    code: 'IQ',
    nameEn: 'Iraq',
    nameNative: 'العراق · بغداد',
    regionName: 'Baghdad Shanasheel & Tigris Bank',
    mentorId: 'npc:IQ:bibi_amal',
    mentorName: 'Bibi Amal',
    signatureDish: 'Cardamom Date Kleicha',
    landmarkName: 'Tigris Shanasheel Courtyard House',
    storyLang: 'ar-IQ',
    hubPortalPosition: [8, 0, -12],
    primaryColorHex: '#8C4A27',
    accentColorHex: '#3AA6B9',
  },
  KR: {
    code: 'KR',
    nameEn: 'South Korea',
    nameNative: '대한민국 · 전주 한옥마을',
    regionName: 'Jeonju Hanok Village',
    mentorId: 'npc:KR:halmeoni',
    mentorName: 'Halmeoni',
    signatureDish: 'Chuseok Pine-Steamed Songpyeon',
    landmarkName: 'Giwa Hanok Courtyard & Onggi Terrace',
    storyLang: 'ko',
    hubPortalPosition: [13, 0, 5],
    primaryColorHex: '#2E5A44',
    accentColorHex: '#D96B70',
  },
};

export interface ParsedSemanticId {
  country: CountryCode;
  chapter: string;
  quest: string;
  objective: string;
}

export function formatSemanticId(
  country: CountryCode,
  chapter: number | string,
  quest: string,
  objective: string
): string {
  const ch = typeof chapter === 'number' ? `ch${chapter}` : chapter;
  return `${country}:${ch}:${quest}:${objective}`;
}

export function parseSemanticId(id: string): ParsedSemanticId | null {
  const parts = id.split(':');
  if (parts.length !== 4) return null;
  const [country, chapter, quest, objective] = parts;
  if (!COUNTRIES.includes(country as CountryCode)) return null;
  if (!/^ch\d+$/.test(chapter)) return null;
  if (!quest || !objective) return null;
  return { country: country as CountryCode, chapter, quest, objective };
}

export function validateSemanticId(id: string): boolean {
  return parseSemanticId(id) !== null;
}

export interface QuestObjectiveSpec {
  objectiveId: string; // country:chapter:quest:objective
  challengeType: ChallengeType;
  title: string;
  description: string;
  targetNpcId: string;
  targetStationId: string;
  requiredItems: Array<{ itemId: string; quantity: number; labelEn: string; labelNative: string }>;
  rewardItems: Array<{ itemId: string; quantity: number; labelEn: string }>;
  miraTokenReward: number;
  culturalFact: string;
  vocabWords: Array<{ word: string; translit: string; en: string; objectId: string }>;
}

export interface QuestSemanticSpec {
  questId: string; // e.g. FR:ch1:bakery:main
  country: CountryCode;
  chapter: number;
  titleEn: string;
  titleNative: string;
  synopsis: string;
  mentorId: string;
  mentorName: string;
  landmarkId: string;
  objectives: QuestObjectiveSpec[];
  completionReward: {
    rewardId: string;
    keepsakeNameEn: string;
    keepsakeNameNative: string;
    miraTokensBonus: number;
    stampChapter: number;
  };
}

export interface DialogueNodeSpec {
  nodeId: string;
  speakerId: string;
  speakerName: string;
  portraitId: string;
  emotion: 'warm' | 'excited' | 'thoughtful' | 'proud' | 'celebrating';
  gestureClip: string;
  textNative: string;
  textTranslit: string;
  textEn: string;
  choices?: Array<{
    choiceId: string;
    labelEn: string;
    labelNative?: string;
    nextNodeId: string;
    triggersObjectiveId?: string;
  }>;
}

export interface DialogueTreeSpec {
  dialogueId: string;
  country: CountryCode;
  npcId: string;
  npcName: string;
  role: 'mentor' | 'vendor' | 'artisan' | 'neighbor' | 'musician';
  nodes: DialogueNodeSpec[];
}

export interface NpcSpawn3D {
  npcId: string;
  name: string;
  role: 'mentor' | 'vendor' | 'artisan' | 'neighbor' | 'musician';
  dialogueId: string;
  position: [number, number, number];
  rotationY: number;
  patrolWaypoints?: Array<[number, number, number]>;
  costumeVariant: string;
  primaryColorHex: string;
  accentColorHex: string;
}

export interface InteractableNode3D {
  interactableId: string;
  kind: 'npc' | 'gather_prop' | 'trade_stall' | 'build_site' | 'cook_station' | 'word_prop' | 'portal' | 'signpost';
  labelEn: string;
  labelNative: string;
  position: [number, number, number];
  interactionRadius: number;
  linkedObjectiveId?: string;
  itemId?: string;
  vocabEntry?: { word: string; translit: string; en: string };
}

export interface RestorationComponent3D {
  componentId: string;
  labelEn: string;
  labelNative: string;
  materialId: string;
  positionOffset: [number, number, number];
  scale: [number, number, number];
  damagedColorHex: string;
  restoredColorHex: string;
}

export interface LevelManifest3D {
  levelId: string;
  country: CountryCode;
  titleEn: string;
  titleNative: string;
  glbAssetPath: string;
  spawnPosition: [number, number, number];
  spawnRotationY: number;
  returnPortalPosition: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  npcs: NpcSpawn3D[];
  interactables: InteractableNode3D[];
  restorationLandmark: {
    landmarkId: string;
    nameEn: string;
    nameNative: string;
    position: [number, number, number];
    components: RestorationComponent3D[];
  };
  lookdevPresetId: string;
  ambientAudioCueId: string;
}

export interface AssetEntrySpec {
  assetId: string;
  country: CountryCode | 'HUB' | 'SHARED';
  category: 'character' | 'environment' | 'prop' | 'animation' | 'ui' | 'audio';
  glbPath?: string;
  sourcePath: string;
  license: 'CC0-1.0-Procedural-MiraVerse' | 'MIT-MiraVerse-Original';
  triangleCount: number;
  textureSize: [number, number];
  animationClips?: string[];
  byteSizeBudget: number;
}

export interface SaveStateV4 {
  version: 'mv.save.v4';
  updatedAt: string;
  activeCountry: CountryCode | 'HUB';
  playerPosition: Record<string, [number, number, number]>;
  questProgress: Record<
    string,
    {
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      completedObjectives: string[];
      updatedAt: string;
    }
  >;
  completedChallenges: Record<CountryCode, ChallengeType[]>;
  inventory: Record<string, number>;
  restoredBuildings: Record<CountryCode, number>;
  stamps: Partial<Record<CountryCode, string>>;
  guestMiraTokens: number;
  unlockedCosmetics: string[];
  settings: {
    muted: boolean;
    musicVolume: number;
    sfxVolume: number;
    qualityTier: 'auto' | 'low' | 'medium' | 'high';
    reducedMotion: boolean;
    textScale: number;
    uiLang: UiLang;
  };
}
