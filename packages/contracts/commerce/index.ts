/**
 * MiraVerse v0.4 Parent Commerce, Gifting & Earned Token Contracts
 * (`packages/contracts/commerce/index.ts`)
 * Owner: CX01 (Stage V4-06)
 * Enforces strict separation between:
 * 1) EARNED_MIRA_TOKENS (earned only in game, non-purchasable, cosmetic only)
 * 2) PARENT_PURCHASE (adult portal only, Stripe test-mode Checkout, never unlocks mandatory story content)
 */
export type EconomyKind = 'EARNED_MIRA_TOKENS' | 'PARENT_PURCHASE';

export type OrderStatus =
  | 'CREATED'
  | 'CHECKOUT_PENDING'
  | 'PAID'
  | 'FULFILLED'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'REQUIRES_REVIEW';

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['CHECKOUT_PENDING', 'CANCELED', 'FAILED'],
  CHECKOUT_PENDING: ['PAID', 'FAILED', 'CANCELED', 'REQUIRES_REVIEW'],
  PAID: ['FULFILLED', 'REFUNDED', 'DISPUTED', 'REQUIRES_REVIEW'],
  FULFILLED: ['REFUNDED', 'DISPUTED', 'REQUIRES_REVIEW'],
  FAILED: [],
  CANCELED: [],
  REFUNDED: [],
  DISPUTED: ['REFUNDED', 'FULFILLED', 'REQUIRES_REVIEW'],
  REQUIRES_REVIEW: ['FULFILLED', 'REFUNDED', 'CANCELED'],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return (ALLOWED_ORDER_TRANSITIONS[from] || []).includes(to);
}

export type GiftCodeStatus = 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'REVOKED' | 'REFUND_REVIEW';

export type LedgerOperation = 'QUEST_EARN' | 'COSMETIC_SPEND' | 'ADMIN_CORRECTION';

export interface CatalogItemSpec {
  sku: string;
  titleEn: string;
  descriptionEn: string;
  economy: EconomyKind;
  productType: 'cosmetic_bundle' | 'gift_bundle' | 'earned_cosmetic' | 'subscription_plan';
  // Real-currency fields (only when economy === 'PARENT_PURCHASE')
  unitAmountCents?: number;
  currency?: 'USD';
  taxCode?: string;
  refundWindowDays?: number;
  isGiftable?: boolean;
  subscriptionEnabledFlag?: boolean;
  // Earned token fields (only when economy === 'EARNED_MIRA_TOKENS')
  miraTokenCost?: number;
  previewBadgeText: string;
}

export interface AdultAccountRecord {
  accountId: string;
  email: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface ConsentRecord {
  consentId: string;
  adultAccountId: string;
  policyVersion: string;
  jurisdiction: string;
  grantedAt: string;
  revokedAt?: string;
}

export interface PseudonymousChildProfile {
  profileId: string; // opaque UUID/ULID, never email or real name
  adultAccountId: string;
  consentId: string;
  nickname: string;
  avatarVariant: string;
  paidCosmeticsEnabled: boolean;
  createdAt: string;
}

export interface TokenLedgerEntry {
  entryId: string;
  profileId: string;
  operation: LedgerOperation;
  delta: number;
  balanceAfter: number;
  reasonKey: string;
  idempotencyKey: string;
  createdAt: string;
}
