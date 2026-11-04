/**
 * Consented Pseudonymous Child Profile Service (`apps/api/src/profiles/index.ts`)
 * Owner: CX04 (Stage V4-09)
 * Uses opaque profile IDs only, non-identifying nicknames, and provides parent data export & deletion.
 */
import crypto from 'node:crypto';
import type { PseudonymousChildProfile } from '../../../../packages/contracts/commerce/index';
import type { ConsentService } from '../consent/index';

export class ChildProfileService {
  private profiles = new Map<string, PseudonymousChildProfile>();
  private consent: ConsentService;

  constructor(consent: ConsentService) {
    this.consent = consent;
  }

  createPseudonymousProfile(params: {
    adultAccountId: string;
    consentId: string;
    nickname: string;
    avatarVariant?: string;
  }): PseudonymousChildProfile {
    if (!this.consent.isConsentActive(params.consentId, params.adultAccountId)) {
      throw new Error('PARENTAL_CONSENT_REQUIRED');
    }
    const cleanNick = params.nickname.trim().slice(0, 20).replace(/[@.]/g, '');
    if (!cleanNick) throw new Error('INVALID_NICKNAME');
    const profile: PseudonymousChildProfile = {
      profileId: `prof_${crypto.randomBytes(10).toString('hex')}`,
      adultAccountId: params.adultAccountId,
      consentId: params.consentId,
      nickname: cleanNick,
      avatarVariant: params.avatarVariant || 'mira_classic',
      paidCosmeticsEnabled: true,
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(profile.profileId, profile);
    return profile;
  }

  getProfileForAdult(profileId: string, adultAccountId: string): PseudonymousChildProfile | null {
    const p = this.profiles.get(profileId);
    if (!p || p.adultAccountId !== adultAccountId) return null;
    return p;
  }

  listProfilesForAdult(adultAccountId: string): PseudonymousChildProfile[] {
    return Array.from(this.profiles.values()).filter((p) => p.adultAccountId === adultAccountId);
  }

  deleteProfileForAdult(profileId: string, adultAccountId: string): boolean {
    const p = this.getProfileForAdult(profileId, adultAccountId);
    if (!p) return false;
    this.profiles.delete(profileId);
    return true;
  }
}
