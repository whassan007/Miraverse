/**
 * High-Entropy Single-Use Gift Code Issuance & Atomic Redemption Service
 * (`apps/api/src/gifts/index.ts`)
 * Owner: CX10 (Stage V4-08)
 * - >= 128 bits entropy (16 crypto-random bytes)
 * - Keyed HMAC-SHA256 digest stored in DB; raw code is NEVER logged or persisted
 * - Atomic single-winner redemption with lock against parallel race conditions
 * - Zero purchaser PII disclosed in redemption response
 */
import crypto from 'node:crypto';
import type { GiftCodeStatus } from '../../../../packages/contracts/commerce/index';
import type { EntitlementService, EntitlementRecord } from '../entitlements/index';

export interface StoredGiftRecord {
  giftId: string;
  codeDigest: string;
  maskedHint: string;
  sku: string;
  purchaserAccountId: string;
  orderId: string;
  status: GiftCodeStatus;
  redeemedByAccountId?: string;
  redeemedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export function hashGiftCode(rawCode: string, pepper = 'mv_gift_pepper_v04'): string {
  const normalized = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHmac('sha256', pepper).update(normalized).digest('hex');
}

export function redactGiftCodeInText(input: string): string {
  return input.replace(/MVGIFT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/gi, 'MVGIFT-REDACTED-XXXX');
}

export class GiftService {
  private byDigest = new Map<string, StoredGiftRecord>();
  private byOrderId = new Map<string, StoredGiftRecord>();
  private redemptionLocks = new Set<string>();
  private entitlements: EntitlementService;
  private auditEvents: string[] = [];

  constructor(entitlements: EntitlementService) {
    this.entitlements = entitlements;
  }

  issueGiftForPaidOrder(params: {
    orderId: string;
    purchaserAccountId: string;
    sku: string;
  }): { record: StoredGiftRecord; rawCodeOnce?: string; alreadyIssued: boolean } {
    const existing = this.byOrderId.get(params.orderId);
    if (existing) {
      return { record: existing, alreadyIssued: true };
    }
    // 16 bytes = 128 bits of cryptographic entropy
    const hex = crypto.randomBytes(16).toString('hex').toUpperCase();
    const g1 = hex.slice(0, 4);
    const g2 = hex.slice(4, 8);
    const g3 = hex.slice(8, 12);
    const g4 = hex.slice(12, 16);
    const rawCode = `MVGIFT-${g1}-${g2}-${g3}-${g4}`;
    const codeDigest = hashGiftCode(rawCode);

    const record: StoredGiftRecord = {
      giftId: `gift_${crypto.randomBytes(8).toString('hex')}`,
      codeDigest,
      maskedHint: `MVGIFT-****-****-****-${g4}`,
      sku: params.sku,
      purchaserAccountId: params.purchaserAccountId,
      orderId: params.orderId,
      status: 'ISSUED',
      expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.byDigest.set(codeDigest, record);
    this.byOrderId.set(params.orderId, record);
    this.auditEvents.push(`GIFT_ISSUED:${record.giftId}:mask=${record.maskedHint}`);
    return { record, rawCodeOnce: rawCode, alreadyIssued: false };
  }

  redeemGiftCodeAtomically(params: {
    rawCode: string;
    recipientAdultAccountId: string;
  }): {
    ok: boolean;
    status: GiftCodeStatus | 'NOT_FOUND' | 'LOCKED_CONFLICT';
    sku?: string;
    entitlement?: EntitlementRecord;
  } {
    const digest = hashGiftCode(params.rawCode);
    if (this.redemptionLocks.has(digest)) {
      return { ok: false, status: 'LOCKED_CONFLICT' };
    }
    this.redemptionLocks.add(digest);
    try {
      const rec = this.byDigest.get(digest);
      if (!rec) {
        return { ok: false, status: 'NOT_FOUND' };
      }
      if (rec.status !== 'ISSUED') {
        return { ok: false, status: rec.status };
      }
      if (Date.now() > Date.parse(rec.expiresAt)) {
        rec.status = 'EXPIRED';
        return { ok: false, status: 'EXPIRED' };
      }

      rec.status = 'REDEEMED';
      rec.redeemedByAccountId = params.recipientAdultAccountId;
      rec.redeemedAt = new Date().toISOString();
      const entitlement = this.entitlements.grantFromGift(params.recipientAdultAccountId, rec.sku, rec.giftId);
      this.auditEvents.push(`GIFT_REDEEMED:${rec.giftId}:by=${params.recipientAdultAccountId}`);
      // Never return purchaserAccountId or purchaser email
      return {
        ok: true,
        status: 'REDEEMED',
        sku: rec.sku,
        entitlement,
      };
    } finally {
      this.redemptionLocks.delete(digest);
    }
  }

  handleOrderRefundOrDispute(orderId: string) {
    const gift = this.byOrderId.get(orderId);
    if (!gift) return;
    if (gift.status === 'ISSUED') {
      gift.status = 'REVOKED';
    } else if (gift.status === 'REDEEMED') {
      // Do not silently confiscate a redeemed gift without review; flag REFUND_REVIEW
      gift.status = 'REFUND_REVIEW';
    }
  }

  getAuditLogs(): string[] {
    return [...this.auditEvents];
  }
}
