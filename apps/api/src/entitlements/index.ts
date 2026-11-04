/**
 * Web-Only Adult & Linked-Profile Entitlement Service (`apps/api/src/entitlements/index.ts`)
 * Owner: CX10 (Stage V4-08)
 */
import crypto from 'node:crypto';

export interface EntitlementRecord {
  entitlementId: string;
  accountId: string;
  sku: string;
  sourceOrderId?: string;
  sourceGiftId?: string;
  platformScope: 'WEB_ONLY';
  status: 'ACTIVE' | 'REFUND_REVIEW' | 'REVOKED';
  grantedAt: string;
}

export class EntitlementService {
  private byId = new Map<string, EntitlementRecord>();
  private byOrder = new Map<string, EntitlementRecord>();

  grantFromOrder(accountId: string, sku: string, orderId: string): EntitlementRecord {
    const existing = this.byOrder.get(orderId);
    if (existing) return existing;
    const rec: EntitlementRecord = {
      entitlementId: `ent_${crypto.randomBytes(8).toString('hex')}`,
      accountId,
      sku,
      sourceOrderId: orderId,
      platformScope: 'WEB_ONLY',
      status: 'ACTIVE',
      grantedAt: new Date().toISOString(),
    };
    this.byId.set(rec.entitlementId, rec);
    this.byOrder.set(orderId, rec);
    return rec;
  }

  grantFromGift(recipientAccountId: string, sku: string, giftId: string): EntitlementRecord {
    const rec: EntitlementRecord = {
      entitlementId: `ent_${crypto.randomBytes(8).toString('hex')}`,
      accountId: recipientAccountId,
      sku,
      sourceGiftId: giftId,
      platformScope: 'WEB_ONLY',
      status: 'ACTIVE',
      grantedAt: new Date().toISOString(),
    };
    this.byId.set(rec.entitlementId, rec);
    return rec;
  }

  markOrderRefundReview(orderId: string, status: 'REFUND_REVIEW' | 'REVOKED' = 'REFUND_REVIEW') {
    const ent = this.byOrder.get(orderId);
    if (ent) {
      ent.status = status;
    }
  }

  listForAdult(accountId: string): EntitlementRecord[] {
    return Array.from(this.byId.values()).filter((e) => e.accountId === accountId);
  }
}
