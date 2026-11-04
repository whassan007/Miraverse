/**
 * Minecraft Bedrock Commerce & Reward Boundary (`apps/minecraft/scripts/core/commerce-boundary.ts`)
 * Owner: CL08
 * Enforces Section 8C:
 * - Add-on distribution is 100% free and self-contained.
 * - Rewards are Bedrock-local souvenirs only (never called Minecoins).
 * - Web Stripe transactions or web gift codes cannot unlock Bedrock content.
 */
export const BEDROCK_COMMERCE_POLICY = {
  addonDistribution: 'FREE_SELF_CONTAINED',
  localRewardsOnly: true,
  allowExternalWebEntitlementSync: false,
  allowWebGiftCodeRedemption: false,
  forbidMinecoinTerminology: true,
} as const;

export function assertBedrockLocalRewardOnly(rewardSource: string): boolean {
  if (rewardSource === 'WEB_STRIPE' || rewardSource === 'WEB_GIFT_CODE') {
    return false;
  }
  return true;
}
