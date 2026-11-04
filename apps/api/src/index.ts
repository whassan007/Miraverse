/**
 * MiraVerse v0.4 Parent-Only Identity, Commerce, Gift & Token Ledger API
 * (`apps/api/src/index.ts`)
 */
import { AdultAuthService, type AdultSessionRecord } from './auth/index';
import { BillingService, signWebhookPayloadForTest, verifyStripeWebhookSignature } from './billing/index';
import { COMMERCE_FLAGS, SERVER_CATALOG, listPublicCatalog, resolveParentPurchasableSku } from './catalog/index';
import { ConsentService } from './consent/index';
import { EntitlementService, type EntitlementRecord } from './entitlements/index';
import { GiftService, hashGiftCode, redactGiftCodeInText, type StoredGiftRecord } from './gifts/index';
import { OrderService, type OrderRecord } from './orders/index';
import { ChildProfileService } from './profiles/index';
import { MiraTokenWalletService } from './wallet/index';

export {
  AdultAuthService,
  BillingService,
  COMMERCE_FLAGS,
  ConsentService,
  EntitlementService,
  GiftService,
  ChildProfileService,
  MiraTokenWalletService,
  OrderService,
  SERVER_CATALOG,
  listPublicCatalog,
  hashGiftCode,
  redactGiftCodeInText,
  resolveParentPurchasableSku,
  signWebhookPayloadForTest,
  verifyStripeWebhookSignature,
};

export interface ApiRequest {
  method: string;
  path: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
  rawBody?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

export class MiraVerseCommerceApi {
  readonly auth = new AdultAuthService();
  readonly orders = new OrderService();
  readonly entitlements = new EntitlementService();
  readonly gifts = new GiftService(this.entitlements);
  readonly consent = new ConsentService();
  readonly profiles = new ChildProfileService(this.consent);
  readonly wallet = new MiraTokenWalletService(this.profiles);
  readonly billing: BillingService;
  private issuedGiftCodeOnceByOrder = new Map<string, string>();

  constructor(webhookSecret = 'whsec_test_miraverse_v04_secret') {
    this.billing = new BillingService(
      this.orders,
      webhookSecret,
      (fulfilledOrder: OrderRecord) => {
        if (fulfilledOrder.isGift) {
          const res = this.gifts.issueGiftForPaidOrder({
            orderId: fulfilledOrder.orderId,
            purchaserAccountId: fulfilledOrder.accountId,
            sku: fulfilledOrder.sku,
          });
          if (res.rawCodeOnce) {
            this.issuedGiftCodeOnceByOrder.set(fulfilledOrder.orderId, res.rawCodeOnce);
          }
        } else {
          this.entitlements.grantFromOrder(fulfilledOrder.accountId, fulfilledOrder.sku, fulfilledOrder.orderId);
        }
      },
      (refundedOrder: OrderRecord, reason: 'REFUNDED' | 'DISPUTED') => {
        this.entitlements.markOrderRefundReview(refundedOrder.orderId, reason === 'REFUNDED' ? 'REFUND_REVIEW' : 'REFUND_REVIEW');
        this.gifts.handleOrderRefundOrDispute(refundedOrder.orderId);
      }
    );
  }

  consumePrintableGiftCodeOnce(orderId: string, adultAccountId: string): string | null {
    const ord = this.orders.getOrderByIdForAdult(orderId, adultAccountId);
    if (!ord) return null;
    const raw = this.issuedGiftCodeOnceByOrder.get(orderId) || null;
    if (raw) this.issuedGiftCodeOnceByOrder.delete(orderId);
    return raw;
  }

  private authenticate(req: ApiRequest, requireCsrf = false): AdultSessionRecord | null {
    const h = req.headers || {};
    const sessionId = h['x-session-id'] || h['X-Session-Id'] || null;
    const csrfToken = h['x-csrf-token'] || h['X-Csrf-Token'] || null;
    return this.auth.verifySession(sessionId, csrfToken, requireCsrf);
  }

  handleRequest(req: ApiRequest): ApiResponse {
    const method = req.method.toUpperCase();
    const path = req.path;
    const payload = (req.body || {}) as Record<string, any>;

    // 1. Public Catalog
    if (method === 'GET' && path === '/api/catalog') {
      return {
        status: 200,
        body: {
          catalog: listPublicCatalog(),
          flags: COMMERCE_FLAGS,
        },
      };
    }

    // 2. Adult Sign-In
    if (method === 'POST' && path === '/api/parents/auth/sign-in') {
      try {
        const res = this.auth.signInWithVerifiedPasskeyOrLink(String(payload.email || ''));
        return {
          status: 200,
          headers: { 'Set-Cookie': res.cookieHeader },
          body: { account: res.account, session: res.session },
        };
      } catch (err: any) {
        return { status: 400, body: { error: err?.message || 'SIGN_IN_FAILED' } };
      }
    }

    // 3. Stripe Raw Webhook
    if (method === 'POST' && path === '/api/billing/stripe-webhook') {
      const sig = req.headers?.['stripe-signature'] || req.headers?.['Stripe-Signature'];
      const raw = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body || {});
      const res = this.billing.handleWebhookRaw(raw, sig);
      return { status: res.ok ? 200 : 400, body: res };
    }

    // All remaining routes require an authenticated adult session
    const requireCsrf = method !== 'GET';
    const sess = this.authenticate(req, requireCsrf);
    if (!sess) {
      return { status: 401, body: { error: 'UNAUTHORIZED_ADULT_SESSION_OR_CSRF' } };
    }

    // 4. Create Test Checkout Session
    if (method === 'POST' && path === '/api/parents/checkout-session') {
      try {
        const res = this.billing.createTestCheckoutSession({
          adultAccountId: sess.accountId,
          sku: String(payload.sku || ''),
          isGift: payload.isGift,
          clientTamperedPriceCents: payload.unitAmountCents,
        });
        return { status: 200, body: res };
      } catch (err: any) {
        return { status: 400, body: { error: err?.message || 'CHECKOUT_BLOCKED' } };
      }
    }

    // 5. List Adult Orders
    if (method === 'GET' && path === '/api/parents/orders') {
      return {
        status: 200,
        body: { orders: this.orders.listOrdersForAdult(sess.accountId) },
      };
    }

    // 6. Get Specific Adult Order (IDOR-safe)
    if (method === 'GET' && path.startsWith('/api/parents/orders/')) {
      const orderId = path.replace('/api/parents/orders/', '');
      const ord = this.orders.getOrderByIdForAdult(orderId, sess.accountId);
      if (!ord) return { status: 403, body: { error: 'FORBIDDEN_ORDER_ACCESS' } };
      return { status: 200, body: { order: ord } };
    }

    // 7. Redeem Gift Code Atomically
    if (method === 'POST' && path === '/api/parents/gifts/redeem') {
      const res = this.gifts.redeemGiftCodeAtomically({
        rawCode: String(payload.code || ''),
        recipientAdultAccountId: sess.accountId,
      });
      return { status: res.ok ? 200 : 400, body: res };
    }

    // 8. Parent Dashboard Summary
    if (method === 'GET' && path === '/api/parents/dashboard') {
      const profiles = this.profiles.listProfilesForAdult(sess.accountId);
      return {
        status: 200,
        body: {
          accountId: sess.accountId,
          email: sess.email,
          orders: this.orders.listOrdersForAdult(sess.accountId),
          entitlements: this.entitlements.listForAdult(sess.accountId),
          profiles,
        },
      };
    }

    // 9. Record Parental Consent & Create Pseudonymous Child Profile
    if (method === 'POST' && path === '/api/parents/consent') {
      const cns = this.consent.recordParentalConsent(sess.accountId, payload.jurisdiction || 'US');
      return { status: 200, body: { consent: cns } };
    }

    if (method === 'POST' && path === '/api/parents/profiles') {
      try {
        const prof = this.profiles.createPseudonymousProfile({
          adultAccountId: sess.accountId,
          consentId: String(payload.consentId || ''),
          nickname: String(payload.nickname || ''),
          avatarVariant: payload.avatarVariant,
        });
        return { status: 200, body: { profile: prof } };
      } catch (err: any) {
        return { status: 400, body: { error: err?.message || 'PROFILE_CREATE_FAILED' } };
      }
    }

    // 10. Profile Wallet Read / Quest Award / Cosmetic Spend
    const walletMatch = path.match(/^\/api\/profiles\/([^/]+)\/wallet$/);
    if (method === 'GET' && walletMatch) {
      try {
        const w = this.wallet.getWalletForAdult(walletMatch[1], sess.accountId);
        return { status: 200, body: w };
      } catch {
        return { status: 403, body: { error: 'FORBIDDEN_PROFILE_ACCESS' } };
      }
    }

    const awardMatch = path.match(/^\/api\/profiles\/([^/]+)\/quest-awards$/);
    if (method === 'POST' && awardMatch) {
      try {
        const res = this.wallet.awardQuestCompletion({
          profileId: awardMatch[1],
          adultAccountId: sess.accountId,
          questEventKey: String(payload.questEventKey || ''),
        });
        return { status: res.ok ? 200 : 400, body: res };
      } catch {
        return { status: 403, body: { error: 'FORBIDDEN_PROFILE_ACCESS' } };
      }
    }

    const spendMatch = path.match(/^\/api\/profiles\/([^/]+)\/cosmetics\/spend$/);
    if (method === 'POST' && spendMatch) {
      try {
        const res = this.wallet.spendTokensOnCosmetic({
          profileId: spendMatch[1],
          adultAccountId: sess.accountId,
          cosmeticSku: String(payload.cosmeticSku || ''),
          requestIdempotencyKey: String(payload.idempotencyKey || 'default'),
        });
        return { status: res.ok ? 200 : 400, body: res };
      } catch {
        return { status: 403, body: { error: 'FORBIDDEN_PROFILE_ACCESS' } };
      }
    }

    // 11. Parent Data Export & Profile Deletion
    if (method === 'POST' && path === '/api/parents/data-export') {
      const profiles = this.profiles.listProfilesForAdult(sess.accountId);
      const wallets = profiles.map((p) => ({
        profileId: p.profileId,
        wallet: this.wallet.getWalletForAdult(p.profileId, sess.accountId),
      }));
      return {
        status: 200,
        body: {
          exportedAt: new Date().toISOString(),
          accountId: sess.accountId,
          email: sess.email,
          orders: this.orders.listOrdersForAdult(sess.accountId),
          entitlements: this.entitlements.listForAdult(sess.accountId),
          profiles,
          wallets,
        },
      };
    }

    const delMatch = path.match(/^\/api\/parents\/profiles\/([^/]+)$/);
    if (method === 'DELETE' && delMatch) {
      const profId = delMatch[1];
      const deleted = this.profiles.deleteProfileForAdult(profId, sess.accountId);
      if (!deleted) return { status: 403, body: { error: 'FORBIDDEN_OR_MISSING_PROFILE' } };
      this.wallet.purgeProfileLedger(profId);
      return { status: 200, body: { ok: true, deletedProfileId: profId } };
    }

    return { status: 404, body: { error: 'ROUTE_NOT_FOUND' } };
  }
}
