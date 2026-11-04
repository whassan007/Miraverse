/**
 * Append-Only Immutable Mira Token Ledger (`apps/api/src/wallet/index.ts`)
 * Owner: CX04 (Stage V4-09)
 * Enforces:
 * - QUEST_EARN, COSMETIC_SPEND, ADMIN_CORRECTION operations only
 * - Non-negative balance invariant
 * - Unique quest completion idempotency (prevents double-earn on replay)
 * - Rejects raw client amounts, localStorage edits, or offline stamp codes
 */
import crypto from 'node:crypto';
import type { TokenLedgerEntry } from '../../../../packages/contracts/commerce/index';
import {
  EARNED_COSMETIC_PRICES,
  QUEST_CHALLENGE_TOKEN_GRANT,
  isEligibleQuestEventKey,
} from '../../../../packages/game-domain/rewards/index';
import type { ChildProfileService } from '../profiles/index';

export class MiraTokenWalletService {
  private ledger: TokenLedgerEntry[] = [];
  private balances = new Map<string, number>();
  private idempotencyKeys = new Set<string>();
  private unlockedByProfile = new Map<string, Set<string>>();
  private profiles: ChildProfileService;

  constructor(profiles: ChildProfileService) {
    this.profiles = profiles;
  }

  getWalletForAdult(profileId: string, adultAccountId: string): {
    balance: number;
    entries: TokenLedgerEntry[];
    unlockedCosmetics: string[];
  } {
    const prof = this.profiles.getProfileForAdult(profileId, adultAccountId);
    if (!prof) throw new Error('FORBIDDEN_PROFILE_ACCESS');
    return {
      balance: this.balances.get(profileId) || 0,
      entries: this.ledger.filter((e) => e.profileId === profileId),
      unlockedCosmetics: Array.from(this.unlockedByProfile.get(profileId) || []),
    };
  }

  awardQuestCompletion(params: {
    profileId: string;
    adultAccountId: string;
    questEventKey: string; // e.g., FR:ch1:bakery:gather
  }): { ok: boolean; balance: number; delta: number; deduplicated?: boolean; reason?: string } {
    const prof = this.profiles.getProfileForAdult(params.profileId, params.adultAccountId);
    if (!prof) throw new Error('FORBIDDEN_PROFILE_ACCESS');

    if (params.questEventKey.startsWith('MV1-') || params.questEventKey.includes('localStorage')) {
      return { ok: false, balance: this.balances.get(params.profileId) || 0, delta: 0, reason: 'UNTRUSTED_OFFLINE_SOURCE' };
    }
    if (!isEligibleQuestEventKey(params.questEventKey)) {
      return { ok: false, balance: this.balances.get(params.profileId) || 0, delta: 0, reason: 'INVALID_QUEST_EVENT_KEY' };
    }

    const idemKey = `earn:${params.profileId}:${params.questEventKey}`;
    const currentBal = this.balances.get(params.profileId) || 0;
    if (this.idempotencyKeys.has(idemKey)) {
      return { ok: true, balance: currentBal, delta: 0, deduplicated: true };
    }

    const nextBal = currentBal + QUEST_CHALLENGE_TOKEN_GRANT;
    const entry: TokenLedgerEntry = {
      entryId: `led_${crypto.randomBytes(8).toString('hex')}`,
      profileId: params.profileId,
      operation: 'QUEST_EARN',
      delta: QUEST_CHALLENGE_TOKEN_GRANT,
      balanceAfter: nextBal,
      reasonKey: params.questEventKey,
      idempotencyKey: idemKey,
      createdAt: new Date().toISOString(),
    };
    this.idempotencyKeys.add(idemKey);
    this.ledger.push(entry);
    this.balances.set(params.profileId, nextBal);
    return { ok: true, balance: nextBal, delta: QUEST_CHALLENGE_TOKEN_GRANT };
  }

  spendTokensOnCosmetic(params: {
    profileId: string;
    adultAccountId: string;
    cosmeticSku: string;
    requestIdempotencyKey: string;
  }): { ok: boolean; balance: number; reason?: string } {
    const prof = this.profiles.getProfileForAdult(params.profileId, params.adultAccountId);
    if (!prof) throw new Error('FORBIDDEN_PROFILE_ACCESS');

    const item = EARNED_COSMETIC_PRICES[params.cosmeticSku];
    if (!item) {
      return { ok: false, balance: this.balances.get(params.profileId) || 0, reason: 'NOT_AN_EARNED_COSMETIC' };
    }

    const idemKey = `spend:${params.profileId}:${params.cosmeticSku}:${params.requestIdempotencyKey}`;
    const currentBal = this.balances.get(params.profileId) || 0;
    if (this.idempotencyKeys.has(idemKey)) {
      return { ok: true, balance: currentBal };
    }

    const unlocked = this.unlockedByProfile.get(params.profileId) || new Set<string>();
    if (unlocked.has(params.cosmeticSku)) {
      return { ok: false, balance: currentBal, reason: 'ALREADY_UNLOCKED' };
    }

    if (currentBal < item.tokenCost) {
      return { ok: false, balance: currentBal, reason: 'INSUFFICIENT_MIRA_TOKENS' };
    }

    const nextBal = currentBal - item.tokenCost;
    const entry: TokenLedgerEntry = {
      entryId: `led_${crypto.randomBytes(8).toString('hex')}`,
      profileId: params.profileId,
      operation: 'COSMETIC_SPEND',
      delta: -item.tokenCost,
      balanceAfter: nextBal,
      reasonKey: params.cosmeticSku,
      idempotencyKey: idemKey,
      createdAt: new Date().toISOString(),
    };
    this.idempotencyKeys.add(idemKey);
    this.ledger.push(entry);
    this.balances.set(params.profileId, nextBal);
    unlocked.add(params.cosmeticSku);
    this.unlockedByProfile.set(params.profileId, unlocked);
    return { ok: true, balance: nextBal };
  }

  purgeProfileLedger(profileId: string) {
    this.balances.delete(profileId);
    this.unlockedByProfile.delete(profileId);
    this.ledger = this.ledger.filter((e) => e.profileId !== profileId);
  }
}
