/**
 * MiraVerse v0.7 (Option A) — Adult-Only Stripe Test-Mode Checkout & Deliverable Gating (`CX10`)
 * Strictly enforces STRIPE_LIVE_ENABLED = false, ENABLE_SUBSCRIPTIONS = false,
 * and allows only genuine web-deliverable family digital packs.
 */
export const V06_PAYMENT_FLAGS = {
  STRIPE_LIVE_ENABLED: false,
  ENABLE_SUBSCRIPTIONS: false,
  ALLOW_NATIVE_GAME_UNLOCKS: false,
} as const;

export interface WebDeliverableSkuV06 {
  skuId: string;
  title: string;
  priceCentsUsd: number;
  deliverableType: 'PDF_STORYBOOK_BUNDLE' | 'PRINTABLE_FAMILY_ACTIVITY_KIT' | 'WEB_DIGITAL_GIFT_CARD';
  unlocksRobloxOrMinecraftItems: false;
}

export const V06_APPROVED_WEB_SKUS: Record<string, WebDeliverableSkuV06> = {
  sku_byblos_storybook_pack: {
    skuId: 'sku_byblos_storybook_pack',
    title: "Byblos Bilingual Family Storybook & Printable Recipe Cards (Web PDF Bundle)",
    priceCentsUsd: 900,
    deliverableType: 'PDF_STORYBOOK_BUNDLE',
    unlocksRobloxOrMinecraftItems: false,
  },
  sku_five_worlds_activity_kit: {
    skuId: 'sku_five_worlds_activity_kit',
    title: 'Five Cultural Worlds Printable Craft & Vocabulary Activity Pack (Web Download)',
    priceCentsUsd: 1400,
    deliverableType: 'PRINTABLE_FAMILY_ACTIVITY_KIT',
    unlocksRobloxOrMinecraftItems: false,
  },
};

export function resolveWebDeliverablePrice(skuId: string): WebDeliverableSkuV06 {
  const sku = V06_APPROVED_WEB_SKUS[skuId];
  if (!sku) {
    throw new Error('UNKNOWN_OR_UNAPPROVED_WEB_SKU');
  }
  return sku;
}
