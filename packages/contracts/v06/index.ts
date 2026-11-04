/**
 * MiraVerse v0.7 (Option A) — Versioned Rendering-Independent Contracts (`CL02`)
 */
export type CountryIdV06 = 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
export type ChallengeTypeV06 = 'gather' | 'trade' | 'cook' | 'build' | 'word';
export type NativePlatformV06 = 'roblox' | 'minecraft_bedrock' | 'web_marketing';

export type AvatarItemStatusV06 =
  | 'experience_only'
  | 'marketplace_candidate'
  | 'submitted_for_moderation'
  | 'approved'
  | 'published'
  | 'rejected';

export interface QuestEventEnvelopeV06 {
  event_id: string;
  player_id: string;
  quest_id: string;
  objective_id: string;
  challenge_type: ChallengeTypeV06;
  country_id: CountryIdV06;
  object_or_item_ids: string[];
  server_timestamp: number;
  reward_status: 'PENDING' | 'GRANTED' | 'DUPLICATE_IGNORED' | 'REJECTED';
  mira_tokens_awarded: number;
}

export interface WorldReleaseAvailabilityV06 {
  country_id: CountryIdV06;
  release_wave: 'RC1_FLAGSHIP' | 'RC3_EXPANSION';
  roblox_status: 'AVAILABLE_IN_BUILD' | 'UPCOMING_RC3';
  bedrock_status: 'COMPANION_RC2' | 'UPCOMING_RC3';
  mentor_id: string;
  mentor_name: string;
  chapter_title: string;
  signature_dish: string;
}

export const V06_WORLD_AVAILABILITY: Record<CountryIdV06, WorldReleaseAvailabilityV06> = {
  LB: {
    country_id: 'LB',
    release_wave: 'RC1_FLAGSHIP',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'COMPANION_RC2',
    mentor_id: 'npc_teta_nahla',
    mentor_name: 'Teta Nahla',
    chapter_title: "Lebanon: Summer at Teta's",
    signature_dish: "Man'oushe Za'atar",
  },
  EG: {
    country_id: 'EG',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_layla_cairo',
    mentor_name: 'Auntie Layla',
    chapter_title: 'Egypt: Lanterns of the Courtyard',
    signature_dish: 'Koshari',
  },
  IQ: {
    country_id: 'IQ',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_noor_baghdad',
    mentor_name: 'Jiddo Noor',
    chapter_title: 'Iraq: Afternoon by the Tigris',
    signature_dish: 'Kleicha',
  },
  KR: {
    country_id: 'KR',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_jiwoo_jeonju',
    mentor_name: 'Halmeoni Ji-woo',
    chapter_title: 'South Korea: Autumn in Jeonju',
    signature_dish: 'Songpyeon',
  },
  FR: {
    country_id: 'FR',
    release_wave: 'RC3_EXPANSION',
    roblox_status: 'AVAILABLE_IN_BUILD',
    bedrock_status: 'UPCOMING_RC3',
    mentor_id: 'npc_camille_lyon',
    mentor_name: 'Chef Camille',
    chapter_title: 'France: Morning in Vieux Lyon',
    signature_dish: 'Galette & Brioche',
  },
};

export function validateQuestEventEnvelopeV06(env: QuestEventEnvelopeV06): { valid: boolean; reason?: string } {
  if (!env.event_id || typeof env.event_id !== 'string') return { valid: false, reason: 'INVALID_EVENT_ID' };
  if (!env.player_id || typeof env.player_id !== 'string') return { valid: false, reason: 'INVALID_PLAYER_ID' };
  if (!['LB', 'EG', 'IQ', 'KR', 'FR'].includes(env.country_id)) return { valid: false, reason: 'INVALID_COUNTRY_ID' };
  if (!['gather', 'trade', 'cook', 'build', 'word'].includes(env.challenge_type)) {
    return { valid: false, reason: 'INVALID_CHALLENGE_TYPE' };
  }
  if (!Number.isFinite(env.mira_tokens_awarded) || env.mira_tokens_awarded < 0 || env.mira_tokens_awarded > 250) {
    return { valid: false, reason: 'INVALID_TOKEN_AMOUNT' };
  }
  return { valid: true };
}
