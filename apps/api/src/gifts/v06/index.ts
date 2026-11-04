/**
 * MiraVerse v0.7 (Option A) — Web-Only Digital Gift Codes & Atomic Redemption (`CX11`)
 * Gift codes grant web-deliverable family storybook/activity entitlements only.
 * Never claims to grant Robux, Roblox GamePasses, or Minecoins.
 */
import crypto from 'node:crypto';

export interface WebGiftRecordV06 {
  giftId: string;
  codeHash: string;
  skuId: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'REFUNDED';
  expiresAtMs: number;
  redeemedByAdultId?: string;
}

export function hashGiftCodeV06(rawCode: string): string {
  return crypto.createHash('sha256').update(rawCode.trim().toUpperCase()).digest('hex');
}

export function generateOpaqueGiftCodeV06(): { rawCode: string; codeHash: string } {
  const rand = crypto.randomBytes(9).toString('hex').toUpperCase();
  const rawCode = `MVGIFT-${rand.slice(0, 6)}-${rand.slice(6, 12)}-${rand.slice(12, 18)}`;
  return { rawCode, codeHash: hashGiftCodeV06(rawCode) };
}
