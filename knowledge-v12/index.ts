/**
 * MiraVerse v1.2 — Canonical Cultural Knowledge Ontology & Reversible Merge Policy (`CL01`)
 * Defines the canonical knowledge record schema (Section B), age-tier adaptation contract (Section D),
 * and non-destructive additive merge rules preserving all existing v0.8/v1.1 IDs.
 */

export type CountryCodeV12 = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
export const COUNTRY_SEQUENCE_V12: CountryCodeV12[] = ['LB', 'IQ', 'EG', 'FR', 'KR'];

export type SupportedLocaleV12 = 'en' | 'fr' | 'ar-LB' | 'ar-EG' | 'ar-IQ' | 'ko';
export const SUPPORTED_LOCALES_V12: SupportedLocaleV12[] = ['en', 'fr', 'ar-LB', 'ar-EG', 'ar-IQ', 'ko'];

export type AgeTierV12 = '5-7' | '8-10' | '11-13' | '14-17';
export const AGE_TIERS_V12: AgeTierV12[] = ['5-7', '8-10', '11-13', '14-17'];

export type EntityTypeV12 =
  | 'person'
  | 'place'
  | 'event'
  | 'artifact'
  | 'practice'
  | 'food'
  | 'myth'
  | 'work'
  | 'organization'
  | 'theme';

export type KnowledgeClassV12 =
  | 'historical_claim'
  | 'mythology'
  | 'folklore'
  | 'interpretation'
  | 'contested_history'
  | 'contemporary_practice'
  | 'fictional_game_content';

export type ClaimStatusV12 =
  | 'source_asserted_unverified'
  | 'externally_corrobated'
  | 'disputed'
  | 'human_reviewed'
  | 'rejected';

export type ConfidenceLevelV12 = 'not_assessed' | 'low' | 'medium' | 'high';

export type CulturalReviewStatusV12 = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export interface KnowledgeSourceRefV12 {
  source_id: string;
  passage_locator: string;
  url: string | null;
  verified: boolean;
  external_citation?: string;
}

export interface KnowledgeRelationshipV12 {
  target_id: string;
  relation: 'located_in' | 'created_by' | 'associated_with' | 'contrasts_with' | 'inspires_quest' | 'variant_of';
  note?: string;
}

export interface KnowledgeRightsV12 {
  text: 'paraphrase_only' | 'public_domain' | 'original_authored';
  media: 'separate_clearance_required' | 'original_procedural_miraverse';
}

export interface CanonicalKnowledgeRecordV12 {
  id: string;
  country: CountryCodeV12;
  title: Partial<Record<SupportedLocaleV12, string>> & { en: string };
  entity_type: EntityTypeV12;
  summary: string;
  expanded_explanation: string;
  knowledge_class: KnowledgeClassV12;
  claim_status: ClaimStatusV12;
  confidence: ConfidenceLevelV12;
  time_period: string;
  people: string[];
  places: string[];
  relationships: KnowledgeRelationshipV12[];
  sources: KnowledgeSourceRefV12[];
  sensitivity_notes: string[];
  cultural_review: CulturalReviewStatusV12;
  reviewer_metadata?: {
    reviewer_id: string | null;
    reviewed_at: string | null;
  };
  age_tier_explanations: Record<AgeTierV12, string>;
  localization_status: Partial<Record<SupportedLocaleV12, 'draft_ai_pending_native_review' | 'native_reviewed' | 'verified'>>;
  quest_links: string[];
  atlas_links: string[];
  platform_exports: Array<'roblox' | 'minecraft' | 'web'>;
  rights: KnowledgeRightsV12;
  legacy_links?: {
    pack_item_ids?: string[];
    quest_objective_ids?: string[];
    story_scene_ids?: number[];
  };
}

export interface ReversibleMergePolicyV12 {
  policy_id: string;
  allow_destructive_overwrite: false;
  require_evidence_for_merge: true;
  preserve_legacy_ids: true;
  staging_directory: string;
  rollback_command: string;
}

export const REVERSIBLE_MERGE_POLICY_V12: ReversibleMergePolicyV12 = {
  policy_id: 'MERGE-POLICY-V12-NON-DESTRUCTIVE',
  allow_destructive_overwrite: false,
  require_evidence_for_merge: true,
  preserve_legacy_ids: true,
  staging_directory: 'content/v12/staging/',
  rollback_command: 'node tools/v12/migration/rollback.mjs',
};

export function validateKnowledgeRecordV12(rec: CanonicalKnowledgeRecordV12): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!rec.id || !/^(LB|IQ|EG|FR|KR)-KB-[A-Z0-9_-]+$/.test(rec.id)) {
    errors.push(`Invalid country-scoped ID: ${rec.id}`);
  }
  if (!COUNTRY_SEQUENCE_V12.includes(rec.country)) {
    errors.push(`Invalid country: ${rec.country}`);
  }
  if (!rec.title?.en || rec.title.en.trim().length === 0) {
    errors.push(`Missing English title on ${rec.id}`);
  }
  if (!rec.summary || rec.summary.length > 360) {
    errors.push(`Summary missing or exceeds 360 chars on ${rec.id}`);
  }
  if (!rec.sources || rec.sources.length === 0) {
    errors.push(`Record ${rec.id} must have at least one source reference`);
  }
  // Epistemic guardrail: externally_corrobated requires verified=true and non-null url or external_citation
  if (rec.claim_status === 'externally_corrobated') {
    const hasExternal = rec.sources.some((s) => s.verified && (s.url !== null || Boolean(s.external_citation)));
    if (!hasExternal) {
      errors.push(`Record ${rec.id} marked externally_corrobated without verified external source citation`);
    }
  }
  // Epistemic guardrail: human_reviewed requires recorded reviewer_id and reviewed_at
  if (rec.claim_status === 'human_reviewed') {
    if (!rec.reviewer_metadata?.reviewer_id || !rec.reviewer_metadata?.reviewed_at) {
      errors.push(`Record ${rec.id} marked human_reviewed without recorded reviewer_id and reviewed_at`);
    }
  }
  // Epistemic guardrail: unverified source assertions cannot have confidence=high
  if (rec.claim_status === 'source_asserted_unverified' && rec.confidence === 'high') {
    errors.push(`Record ${rec.id} cannot have confidence=high while claim_status=source_asserted_unverified`);
  }
  for (const tier of AGE_TIERS_V12) {
    if (!rec.age_tier_explanations?.[tier] || rec.age_tier_explanations[tier].trim().length < 20) {
      errors.push(`Missing or too-short age_tier_explanations[${tier}] on ${rec.id}`);
    }
  }
  if (rec.rights?.text !== 'paraphrase_only' && rec.rights?.text !== 'original_authored') {
    errors.push(`Invalid text rights policy on ${rec.id}`);
  }
  return { valid: errors.length === 0, errors };
}
