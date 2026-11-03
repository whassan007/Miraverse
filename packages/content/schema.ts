export type Lang = 'ar-LB' | 'ar-EG' | 'ar-IQ' | 'ko' | 'fr' | 'en';
export type CountryId = 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
export const RTL: Lang[] = ['ar-LB', 'ar-EG', 'ar-IQ'];
export type Archetype = 'protagonist' | 'elder_mentor' | 'bridge_parent' | 'supportive_parent'
  | 'younger_sibling' | 'host_peer' | 'diaspora_peer';

export interface Scene { id: number; title: string; text: string; gloss_en?: string; image_prompt: string }
export interface Story {
  lang: Lang; country: CountryId; title: string; title_en: string;
  characters: { name: string; role: Archetype; note: string }[];
  scenes: Scene[];                       // exactly 15
  vocab: { word: string; translit: string; en: string }[];   // 10
}

export type ChallengeType = 'build' | 'cook' | 'gather' | 'trade' | 'word';
export interface Item { id: string; name_en: string; color: string }        // id: snake_case
export interface Challenge {
  id: string;                             // e.g. "EG-1-cook"
  type: ChallengeType; title_en: string; goal_en: string;
  needs?: { item: string; count: number }[];            // gather/trade/build
  recipe?: { inputs: string[]; output: string };        // cook: ordered steps
  words?: { word: string; translit: string; en: string }[];   // word
  blueprint?: string[];                                 // build: rows of item-id initials, e.g. ["BBB","B.B"]
}
export interface Pack {
  country: CountryId; name_en: string; lang: Lang;
  colors: { primary: string; secondary: string };       // hex
  regions: { id: string; name_en: string }[];           // 2-3 specific places
  mentor: { name: string; greeting_en: string; greeting: string };
  items: Item[];
  chapters: { id: number; title_en: string; challenges: Challenge[] }[];  // 1 chapter, 5 challenges (one per type)
}
