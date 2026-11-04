/**
 * Adult Order State Machine & Anti-IDOR Repository (`apps/api/src/orders/index.ts`)
 * Owner: CX09 (Stage V4-07)
 */
import crypto from 'node:crypto';
import {
  canTransitionOrder,
  type OrderStatus,
} from '../../../../packages/contracts/commerce/index';

export interface OrderRecord {
  orderId: string;
  accountId: string;
  sku: string;
  unitAmountCents: number;
  currency: 'USD';
  isGift: boolean;
  status: OrderStatus;
  stripeCheckoutSessionId: string;
  fulfillmentKey: string;
  createdAt: string;
  updatedAt: string;
}

export class OrderService {
  private orders = new Map<string, OrderRecord>();
  private bySessionId = new Map<string, string>();

  createPendingCheckoutOrder(params: {
    accountId: string;
    sku: string;
    unitAmountCents: number;
    currency: 'USD';
    isGift: boolean;
  }): OrderRecord {
    const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
    const stripeCheckoutSessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();
    const record: OrderRecord = {
      orderId,
      accountId: params.accountId,
      sku: params.sku,
      unitAmountCents: params.unitAmountCents,
      currency: params.currency,
      isGift: params.isGift,
      status: 'CHECKOUT_PENDING',
      stripeCheckoutSessionId,
      fulfillmentKey: `fulfill:${orderId}`,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(orderId, record);
    this.bySessionId.set(stripeCheckoutSessionId, orderId);
    return record;
  }

  transitionOrder(orderId: string, nextStatus: OrderStatus): OrderRecord {
    const ord = this.orders.get(orderId);
    if (!ord) throw new Error('ORDER_NOT_FOUND');
    if (ord.status === nextStatus) return ord;
    if (!canTransitionOrder(ord.status, nextStatus)) {
      throw new Error(`INVALID_ORDER_TRANSITION:${ord.status}->${nextStatus}`);
    }
    ord.status = nextStatus;
    ord.updatedAt = new Date().toISOString();
    return ord;
  }

  getOrderByIdForAdult(orderId: string, adultAccountId: string): OrderRecord | null {
    const ord = this.orders.get(orderId);
    if (!ord || ord.accountId !== adultAccountId) return null;
    return ord;
  }

  listOrdersForAdult(adultAccountId: string): OrderRecord[] {
    return Array.from(this.orders.values()).filter((o) => o.accountId === adultAccountId);
  }

  findByCheckoutSessionId(sessionId: string): OrderRecord | null {
    const id = this.bySessionId.get(sessionId);
    return id ? this.orders.get(id) || null : null;
  }

  getOrderInternal(orderId: string): OrderRecord | null {
    return this.orders.get(orderId) || null;
  }
}
