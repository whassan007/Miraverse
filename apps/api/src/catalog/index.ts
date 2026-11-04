/**
 * Server-Owned Product & Earned Cosmetic Catalog (`apps/api/src/catalog/index.ts`)
 * Owner: CX09 (Stage V4-07)
 */
import type { CatalogItemSpec } from '../../../../packages/contracts/commerce/index';

export const COMMERCE_FLAGS = {
  STRIPE_TEST_MODE_ONLY: true,
  STRIPE_LIVE_ENABLED: false,
  ENABLE_SUBSCRIPTIONS: false,
} as const;

export const SERVER_CATALOG: Record<string, CatalogItemSpec> = {
  SKU_GIFT_EXPLORER_BUNDLE: {
    sku: 'SKU_GIFT_EXPLORER_BUNDLE',
    titleEn: 'MiraVerse Explorer Keepsake Gift Bundle (One-Time)',
    descriptionEn: 'Optional cosmetic lantern satchel, golden compass cloak, and printable family gift card. All 5 country story adventures remain 100% free.',
    economy: 'PARENT_PURCHASE',
    productType: 'gift_bundle',
    unitAmountCents: 1400,
    currency: 'USD',
    taxCode: 'txcd_10501000',
    refundWindowDays: 14,
    isGiftable: true,
    previewBadgeText: 'Parent Purchase · Optional Gift Bundle (Test Mode)',
  },
  SKU_COSMETIC_STARLIGHT_SET: {
    sku: 'SKU_COSMETIC_STARLIGHT_SET',
    titleEn: 'Starlight Storybook Outfit & Hub Banner Set (One-Time)',
    descriptionEn: 'Optional decorative outfit variant for Mira and customizable World Hub banner. Never required for gameplay or story progression.',
    economy: 'PARENT_PURCHASE',
    productType: 'cosmetic_bundle',
    unitAmountCents: 900,
    currency: 'USD',
    taxCode: 'txcd_10501000',
    refundWindowDays: 14,
    isGiftable: false,
    previewBadgeText: 'Parent Purchase · Optional Cosmetic (Test Mode)',
  },
  SKU_SUBSCRIPTION_FAMILY_PASS: {
    sku: 'SKU_SUBSCRIPTION_FAMILY_PASS',
    titleEn: 'Family Supporter Pass (Disabled Pending Approval)',
    descriptionEn: 'Recurring membership is disabled by default in v0.4 until legal and product signoff.',
    economy: 'PARENT_PURCHASE',
    productType: 'subscription_plan',
    unitAmountCents: 499,
    currency: 'USD',
    subscriptionEnabledFlag: false,
    previewBadgeText: 'Disabled in v0.4 (One-Time Purchases Only)',
  },
  SKU_EARNED_LYON_BERET: {
    sku: 'SKU_EARNED_LYON_BERET',
    titleEn: 'Vieux Lyon Baker Hat (Earned Cosmetic)',
    descriptionEn: 'Unlocked with Mira Tokens earned by helping Mamie Claire in France. Never sold for real money.',
    economy: 'EARNED_MIRA_TOKENS',
    productType: 'earned_cosmetic',
    miraTokenCost: 60,
    previewBadgeText: 'Earned in Game · Free (60 Mira Tokens)',
  },
  SKU_EARNED_BYBLOS_SCARF: {
    sku: 'SKU_EARNED_BYBLOS_SCARF',
    titleEn: 'Byblos Mariner Scarf (Earned Cosmetic)',
    descriptionEn: 'Unlocked with Mira Tokens earned in Lebanon. Never sold for real money.',
    economy: 'EARNED_MIRA_TOKENS',
    productType: 'earned_cosmetic',
    miraTokenCost: 60,
    previewBadgeText: 'Earned in Game · Free (60 Mira Tokens)',
  },
};

export function listPublicCatalog(): CatalogItemSpec[] {
  return Object.values(SERVER_CATALOG).filter((item) => {
    if (item.productType === 'subscription_plan' && !COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS) {
      return false;
    }
    return true;
  });
}

export function resolveParentPurchasableSku(sku: string): CatalogItemSpec | null {
  const item = SERVER_CATALOG[sku];
  if (!item || item.economy !== 'PARENT_PURCHASE') return null;
  if (item.productType === 'subscription_plan' && !COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS) {
    return null;
  }
  return item;
}
