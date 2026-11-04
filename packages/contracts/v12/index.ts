/**
 * MiraVerse v1.2 — Cross-Platform Content Contracts & Safety/Localization Constraints (`packages/contracts/v12/index.ts`)
 * Owner: CL04 (Wave W2)
 */
import type { CanonicalKnowledgeRecordV12, AgeTierV12, CountryCodeV12, SupportedLocaleV12 } from '../../knowledge-v12/index.js';

export interface QuestAgeVariationV12 {
  learning_objective: string;
  narrative_hook: string;
  npc_lines: {
    mentor_greeting_en: string;
    mentor_greeting_native: string;
  };
  player_actions: string[];
  hint_ladder: string[];
  completion_criteria: string;
  reward: {
    knowledge_unlock_id: string;
    stamp_id: string;
    free_earned: true;
  };
  historical_notes: string;
}

export interface EnrichedQuestActV12 {
  act_id: string;
  country: CountryCodeV12;
  act_number: 1 | 2 | 3 | 4 | 5;
  title: Record<SupportedLocaleV12, string>;
  legacy_quest_id: string;
  legacy_objective_id: string;
  mentor_id: string;
  mentor_name: string;
  supporting_npc_id: string;
  linked_knowledge_ids: string[];
  enrichment_hook: string;
  free_knowledge_unlock: string;
  paid_reward_required: false;
  safety_flags: string[];
  variations: Record<AgeTierV12, QuestAgeVariationV12>;
}

export interface RealWorldAtlasMarkerV12 {
  place_id: string;
  country: CountryCodeV12;
  name: Record<SupportedLocaleV12, string>;
  latitude: number;
  longitude: number;
  coordinate_source: string;
  source_url: string;
  uncertainty: 'verified_point' | 'approximate_area_100m' | 'approximate_linear_feature';
  status: 'verified_external' | 'candidate_pending_review';
  review_timestamp: string;
  linked_knowledge_ids: string[];
  linked_act_ids: string[];
}

export interface InGameQuestMarkerV12 {
  marker_id: string;
  world_id: string;
  country: CountryCodeV12;
  platform: 'roblox' | 'minecraft';
  in_game_coordinate_system: 'local_studs_xyz' | 'local_block_xyz';
  coordinates: { x: number; y: number; z: number };
  scale_disclaimer: 'in-game map / not to geographic scale';
  act_id: string;
  level: number;
  unlock_rule: string;
  asset_reference: string;
  npc_id: string;
}

export const SAFETY_AND_PRIVACY_CONTRACT_V12 = {
  collect_child_voice_or_pii: false,
  require_religious_observance: false,
  allow_graphic_violence_or_wartime_chase: false,
  require_adult_npc_for_heat_and_cooking: true,
  provide_vegetarian_and_allergen_alternatives: true,
  promise_automatic_cross_platform_sync: false,
  preserve_arabic_regional_dialects: ['ar-LB', 'ar-IQ', 'ar-EG'] as const,
} as const;
