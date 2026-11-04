/**
 * Tyre: The Rock of Melqart — TypeScript Contracts (`packages/contracts/tyre/index.ts`)
 * High-precision type contracts for Tyre knowledge records, quest objectives,
 * geoarchaeological coordinates, numismatic assay models, and primary source citations.
 */
import type { ChallengeType, CountryCode } from '../index';
import type { EpistemicClassification } from '../v13/index';

export interface TyreKnowledgeRecordContract {
  id: string;
  country: 'LB';
  title: Record<string, string>;
  entity_type: 'place' | 'practice' | 'myth' | 'event' | 'artifact';
  summary: string;
  expanded_explanation: string;
  knowledge_class: 'historical_claim' | 'mythology' | 'folklore' | 'interpretation' | 'contested_history';
  claim_status: 'externally_corrobated' | 'source_asserted_unverified' | 'human_reviewed';
  confidence: 'low' | 'medium' | 'high';
  time_period: string;
  people: string[];
  places: string[];
  sources: {
    source_id: string;
    passage_locator: string;
    url: string | null;
    verified: boolean;
    external_citation?: string;
  }[];
  age_tier_explanations: Record<'5-7' | '8-10' | '11-13' | '14-17', string>;
  rights: { text: 'paraphrase_only' | 'original_authored' };
}

export interface TyreQuestObjectiveContract {
  objectiveId: string;
  challengeType: ChallengeType;
  title: string;
  description: string;
  targetNpcId: string;
  targetStationId: string;
  requiredItems: {
    itemId: string;
    quantity: number;
    labelEn: string;
    labelNative: string;
  }[];
  rewardItems: {
    itemId: string;
    quantity: number;
    labelEn: string;
  }[];
  miraTokenReward: number;
  culturalFact: string;
  vocabWords: {
    word: string;
    translit: string;
    en: string;
    objectId: string;
  }[];
}

export interface TyreGeographicFeatureContract {
  featureId: string;
  nameEn: string;
  nameNative: string;
  coordinates: [number, number]; // [lat, lng]
  uncertaintyMeters: number;
  status: 'verified_real_world_wgs84';
  epistemicClass: EpistemicClassification;
  citation: string;
}

export const TYRE_WGS84_COORDINATES = {
  CITADEL_ISLAND: [33.2709, 35.1963] as const,
  SIDONIAN_NORTH_HARBOR: [33.2736, 35.2014] as const,
  EGYPTIAN_SOUTH_HARBOR: [33.2681, 35.2045] as const,
  ALEXANDERS_MOLE_TOMBOLO: [33.27, 35.208] as const,
  MAINLAND_USHU_PALAETYRUS: [33.245, 35.215] as const,
  TEMPLE_OF_MELQART: [33.2715, 35.198] as const,
  MUREX_WORKSHOPS: [33.266, 35.203] as const,
} as const;

export const TYRE_HISTORICAL_CHRONOLOGY = [
  { era: 'c. 14th Century BCE', title: 'Amarna Letters of Abimilki', note: 'Pleas for access to mainland wood and water' },
  { era: 'c. 980–947 BCE', title: 'King Hiram I & Solomonic Alliance', note: 'Ships of Tarshish, First Temple cedar trade, Temple of Melqart' },
  { era: 'c. 814 BCE', title: 'Queen Elissa & Foundation of Carthage', note: 'Tyrian diaspora, Byrsa oxhide partition' },
  { era: '672 BCE', title: 'Vassal Treaty of Esarhaddon', note: 'Ba\'al I, shipwreck forfeiture, curse of Melqart & Eshmun' },
  { era: '586–573 BCE', title: '13-Year Babylonian Siege', note: 'Nebuchadnezzar II, Ezekiel 26-29, shoftim oligarchy' },
  { era: '480 BCE', title: 'Battle of Salamis', note: 'Phoenician fleet on Persian right wing' },
  { era: '332 BCE', title: 'Siege of Alexander the Great', note: '60m mole, fireship defense, 7-month breach, tombolo genesis' },
  { era: '126 BCE – 66 CE', title: 'Silver Shekels of Tyre', note: 'Melqart obverse, eagle reverse, Second Temple tax standard' },
] as const;
