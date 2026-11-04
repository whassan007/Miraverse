/**
 * Parental Consent Provenance & Revocation Service (`apps/api/src/consent/index.ts`)
 * Owner: CX04 (Stage V4-09)
 */
import crypto from 'node:crypto';
import type { ConsentRecord } from '../../../../packages/contracts/commerce/index';

export class ConsentService {
  private records = new Map<string, ConsentRecord>();

  recordParentalConsent(adultAccountId: string, jurisdiction = 'US', policyVersion = '2026-11-v0.4'): ConsentRecord {
    const rec: ConsentRecord = {
      consentId: `cns_${crypto.randomBytes(8).toString('hex')}`,
      adultAccountId,
      policyVersion,
      jurisdiction,
      grantedAt: new Date().toISOString(),
    };
    this.records.set(rec.consentId, rec);
    return rec;
  }

  revokeConsent(consentId: string, adultAccountId: string): boolean {
    const rec = this.records.get(consentId);
    if (!rec || rec.adultAccountId !== adultAccountId) return false;
    rec.revokedAt = new Date().toISOString();
    return true;
  }

  isConsentActive(consentId: string, adultAccountId: string): boolean {
    const rec = this.records.get(consentId);
    return Boolean(rec && rec.adultAccountId === adultAccountId && !rec.revokedAt);
  }
}
