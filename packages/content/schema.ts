export type Lang = 'ar-LB' | 'ar-EG' | 'ar-IQ' | 'ko' | 'fr' | 'en';
export type CountryId = 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
export const RTL: Lang[] = ['ar-LB', 'ar-EG', 'ar-IQ'];
export const COUNTRIES: CountryId[] = ['LB', 'EG', 'IQ', 'KR', 'FR'];
export const STORY_LANGS: Lang[] = ['ar-LB', 'ar-EG', 'ar-IQ', 'ko', 'fr'];
export const UI_LANGS: Lang[] = ['en', 'fr', 'ar-LB', 'ar-EG', 'ar-IQ', 'ko'];

export const COUNTRY_LANG_MAP: Record<CountryId, Lang> = {
  LB: 'ar-LB',
  EG: 'ar-EG',
  IQ: 'ar-IQ',
  KR: 'ko',
  FR: 'fr',
};

/**
 * Verified WGS84 geographic coordinates (latitude, longitude in degrees)
 * for each canonical country pin on the web globe.
 */
export const COUNTRY_WGS84: Record<CountryId, { lat: number; lon: number; capital_en: string }> = {
  LB: { lat: 34.123, lon: 35.651, capital_en: 'Byblos / Beirut' },
  EG: { lat: 30.0444, lon: 31.2357, capital_en: 'Cairo' },
  IQ: { lat: 33.3152, lon: 44.3661, capital_en: 'Baghdad' },
  KR: { lat: 35.8242, lon: 127.148, capital_en: 'Jeonju / Seoul' },
  FR: { lat: 45.764, lon: 4.8357, capital_en: 'Lyon / Paris' },
};

export type Archetype =
  | 'protagonist'
  | 'elder_mentor'
  | 'bridge_parent'
  | 'supportive_parent'
  | 'younger_sibling'
  | 'host_peer'
  | 'diaspora_peer';

export type ChallengeType = 'build' | 'cook' | 'gather' | 'trade' | 'word';

export interface Scene {
  id: number;
  title: string;
  text: string;
  gloss_en?: string;
  image_prompt: string;
}

export interface Story {
  lang: Lang;
  country: CountryId;
  title: string;
  title_en: string;
  characters: { name: string; role: Archetype; note: string }[];
  scenes: Scene[];
  vocab: { word: string; translit: string; en: string }[];
}

export interface Item {
  id: string;
  name_en: string;
  color: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title_en: string;
  goal_en: string;
  needs?: { item: string; count: number }[];
  recipe?: { inputs: string[]; output: string };
  words?: { word: string; translit: string; en: string }[];
  blueprint?: string[];
  // Explicit map from a single-character tile symbol (excluding '.') to a pack item ID.
  blueprintLegend?: Record<string, string>;
  // Concrete item award for completing a trade (or challenge).
  reward?: { item: string; count: number };
}

export interface Pack {
  country: CountryId;
  name_en: string;
  lang: Lang;
  colors: { primary: string; secondary: string };
  regions: { id: string; name_en: string }[];
  mentor: { name: string; greeting_en: string; greeting: string };
  items: Item[];
  chapters: { id: number; title_en: string; challenges: Challenge[] }[];
}
