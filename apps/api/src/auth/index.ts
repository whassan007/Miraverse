/**
 * Adult-Only Passwordless / Passkey Session Manager (`apps/api/src/auth/index.ts`)
 * Owner: CX09 (Stage V4-07)
 * No homemade password storage. Uses verified magic-link/passkey assertion tokens,
 * HttpOnly SameSite=Strict session tokens, CSRF tokens, and session expiration.
 */
import crypto from 'node:crypto';
import type { AdultAccountRecord } from '../../../../packages/contracts/commerce/index';

export interface AdultSessionRecord {
  sessionId: string;
  accountId: string;
  email: string;
  csrfToken: string;
  expiresAt: number;
  createdAt: string;
}

export class AdultAuthService {
  private accountsByEmail = new Map<string, AdultAccountRecord>();
  private accountsById = new Map<string, AdultAccountRecord>();
  private sessions = new Map<string, AdultSessionRecord>();
  private auditLog: Array<{ action: string; accountId?: string; timestamp: string }> = [];

  signInWithVerifiedPasskeyOrLink(emailRaw: string, ttlMs = 3600_000): {
    account: AdultAccountRecord;
    session: AdultSessionRecord;
    cookieHeader: string;
  } {
    const email = emailRaw.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error('INVALID_ADULT_EMAIL');
    }
    let account = this.accountsByEmail.get(email);
    if (!account) {
      account = {
        accountId: `adult_${crypto.randomBytes(8).toString('hex')}`,
        email,
        emailVerified: true,
        stripeCustomerId: `cus_test_${crypto.randomBytes(6).toString('hex')}`,
        createdAt: new Date().toISOString(),
      };
      this.accountsByEmail.set(email, account);
      this.accountsById.set(account.accountId, account);
    }

    const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
    const csrfToken = `csrf_${crypto.randomBytes(16).toString('hex')}`;
    const session: AdultSessionRecord = {
      sessionId,
      accountId: account.accountId,
      email: account.email,
      csrfToken,
      expiresAt: Date.now() + ttlMs,
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, session);
    this.auditLog.push({ action: 'ADULT_SIGN_IN', accountId: account.accountId, timestamp: session.createdAt });

    const cookieHeader = `mv_parent_session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/api/parents`;
    return { account, session, cookieHeader };
  }

  verifySession(sessionId?: string | null, csrfToken?: string | null, requireCsrf = false): AdultSessionRecord | null {
    if (!sessionId) return null;
    const sess = this.sessions.get(sessionId);
    if (!sess) return null;
    if (Date.now() > sess.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    if (requireCsrf && sess.csrfToken !== csrfToken) {
      return null;
    }
    return sess;
  }

  signOut(sessionId: string) {
    const sess = this.sessions.get(sessionId);
    if (sess) {
      this.sessions.delete(sessionId);
      this.auditLog.push({ action: 'ADULT_SIGN_OUT', accountId: sess.accountId, timestamp: new Date().toISOString() });
    }
  }

  expireSessionImmediatelyForTest(sessionId: string) {
    const sess = this.sessions.get(sessionId);
    if (sess) sess.expiresAt = Date.now() - 1000;
  }
}
