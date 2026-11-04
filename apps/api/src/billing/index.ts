/**
 * Stripe Test-Mode Checkout & Verified Webhook Fulfillment Engine
 * (`apps/api/src/billing/index.ts`)
 * Owner: CX09 (Stage V4-07)
 * - Resolves prices exclusively from SERVER_CATALOG (ignores client price tampering)
 * - Verifies raw-body HMAC-SHA256 webhook signatures
 * - Deduplicates BOTH event.id and order.fulfillmentKey
 * - Enforces STRIPE_LIVE_ENABLED === false
 */
import crypto from 'node:crypto';
import { COMMERCE_FLAGS, resolveParentPurchasableSku } from '../catalog/index';
import type { OrderRecord, OrderService } from '../orders/index';

export function signWebhookPayloadForTest(rawBody: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const signedPayload = `${timestamp}.${rawBody}`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

export function verifyStripeWebhookSignature(rawBody: string, header: string | undefined, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export class BillingService {
  private processedEventIds = new Set<string>();
  private fulfilledOrderKeys = new Set<string>();
  private webhookSecret: string;
  private orders: OrderService;
  private onFulfillCallback?: (order: OrderRecord) => void;
  private onRefundOrDisputeCallback?: (order: OrderRecord, reason: 'REFUNDED' | 'DISPUTED') => void;

  constructor(
    orders: OrderService,
    webhookSecret = 'whsec_test_miraverse_v04_secret',
    onFulfill?: (order: OrderRecord) => void,
    onRefundOrDispute?: (order: OrderRecord, reason: 'REFUNDED' | 'DISPUTED') => void
  ) {
    this.orders = orders;
    this.webhookSecret = webhookSecret;
    this.onFulfillCallback = onFulfill;
    this.onRefundOrDisputeCallback = onRefundOrDispute;
  }

  createTestCheckoutSession(params: {
    adultAccountId: string;
    sku: string;
    isGift?: boolean;
    clientTamperedPriceCents?: number; // Explicitly ignored!
  }): {
    order: OrderRecord;
    checkoutUrl: string;
    mode: 'test';
  } {
    if (COMMERCE_FLAGS.STRIPE_LIVE_ENABLED) {
      throw new Error('LIVE_COMMERCE_BLOCKED_WITHOUT_OPERATOR_APPROVAL');
    }
    const item = resolveParentPurchasableSku(params.sku);
    if (!item || typeof item.unitAmountCents !== 'number' || !item.currency) {
      throw new Error('SKU_NOT_PURCHASABLE');
    }
    const order = this.orders.createPendingCheckoutOrder({
      accountId: params.adultAccountId,
      sku: item.sku,
      unitAmountCents: item.unitAmountCents,
      currency: item.currency,
      isGift: Boolean(params.isGift ?? item.isGiftable),
    });
    return {
      order,
      checkoutUrl: `https://checkout.stripe.com/c/pay/${order.stripeCheckoutSessionId}#test_mode`,
      mode: 'test',
    };
  }

  handleWebhookRaw(rawBody: string, signatureHeader: string | undefined): {
    ok: boolean;
    status: string;
    deduplicated?: boolean;
    orderId?: string;
  } {
    if (!verifyStripeWebhookSignature(rawBody, signatureHeader, this.webhookSecret)) {
      return { ok: false, status: 'INVALID_SIGNATURE' };
    }
    const evt = JSON.parse(rawBody);
    const eventId = String(evt.id || '');
    if (!eventId) {
      return { ok: false, status: 'MISSING_EVENT_ID' };
    }
    if (this.processedEventIds.has(eventId)) {
      return { ok: true, status: 'DUPLICATE_EVENT_IGNORED', deduplicated: true };
    }

    const type = String(evt.type || '');
    const obj = evt.data?.object || {};

    if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
      const sessionId = String(obj.id || '');
      const order = this.orders.findByCheckoutSessionId(sessionId);
      if (!order) {
        return { ok: false, status: 'ORDER_NOT_FOUND' };
      }
      if (obj.payment_status !== 'paid' || obj.amount_total !== order.unitAmountCents || String(obj.currency || '').toUpperCase() !== order.currency) {
        return { ok: false, status: 'PAYMENT_MISMATCH_OR_UNPAID', orderId: order.orderId };
      }
      this.processedEventIds.add(eventId);

      // Deduplicate by fulfillmentKey as well (e.g., checkout.session.completed + payment_intent.succeeded for same order)
      if (this.fulfilledOrderKeys.has(order.fulfillmentKey)) {
        return { ok: true, status: 'ALREADY_FULFILLED', deduplicated: true, orderId: order.orderId };
      }
      this.orders.transitionOrder(order.orderId, 'PAID');
      this.orders.transitionOrder(order.orderId, 'FULFILLED');
      this.fulfilledOrderKeys.add(order.fulfillmentKey);
      if (this.onFulfillCallback) {
        this.onFulfillCallback(order);
      }
      return { ok: true, status: 'FULFILLED', orderId: order.orderId };
    }

    if (type === 'charge.refunded' || type === 'charge.dispute.created') {
      const orderId = String(obj.metadata?.orderId || '');
      const order = this.orders.getOrderInternal(orderId);
      if (!order) return { ok: false, status: 'ORDER_NOT_FOUND' };
      this.processedEventIds.add(eventId);
      const targetState = type === 'charge.refunded' ? 'REFUNDED' : 'DISPUTED';
      this.orders.transitionOrder(order.orderId, targetState);
      if (this.onRefundOrDisputeCallback) {
        this.onRefundOrDisputeCallback(order, targetState);
      }
      return { ok: true, status: targetState, orderId: order.orderId };
    }

    this.processedEventIds.add(eventId);
    return { ok: true, status: 'IGNORED_EVENT_TYPE' };
  }
}
