/**
 * Deterministic Non-Commercial Mira Token Reward Rules (`packages/game-domain/rewards/index.ts`)
 * Owner: CX04 (Stage V4-09)
 */
import { COUNTRIES, CHALLENGE_TYPES, type ChallengeType, type CountryCode } from '../../contracts/index';

export const QUEST_CHALLENGE_TOKEN_GRANT = 20;
export const CHAPTER_COMPLETION_TOKEN_BONUS = 50;

export const EARNED_COSMETIC_PRICES: Record<string, { sku: string; titleEn: string; tokenCost: number }> = {
  SKU_EARNED_LYON_BERET: { sku: 'SKU_EARNED_LYON_BERET', titleEn: 'Vieux Lyon Baker Hat', tokenCost: 60 },
  SKU_EARNED_BYBLOS_SCARF: { sku: 'SKU_EARNED_BYBLOS_SCARF', titleEn: 'Byblos Mariner Scarf', tokenCost: 60 },
  SKU_EARNED_CAIRO_LANTERN_PIN: { sku: 'SKU_EARNED_CAIRO_LANTERN_PIN', titleEn: 'Cairo Fanous Pin', tokenCost: 60 },
  SKU_EARNED_BAGHDAD_SATCHEL: { sku: 'SKU_EARNED_BAGHDAD_SATCHEL', titleEn: 'Baghdad Shanasheel Satchel', tokenCost: 60 },
  SKU_EARNED_JEONJU_RIBBON: { sku: 'SKU_EARNED_JEONJU_RIBBON', titleEn: 'Jeonju Hanok Ribbon', tokenCost: 60 },
};

export function isEligibleQuestEventKey(questEventKey: string): boolean {
  const parts = questEventKey.split(':');
  if (parts.length !== 4) return false;
  const [country, ch, , challenge] = parts;
  return (
    COUNTRIES.includes(country as CountryCode) &&
    ch === 'ch1' &&
    CHALLENGE_TYPES.includes(challenge as ChallengeType)
  );
}
