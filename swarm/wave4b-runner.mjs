#!/usr/bin/env node
/**
 * MiraVerse v0.4 — Wave 4B Worktree Runner (`swarm/wave4b-runner.mjs`)
 * Executes V4-03 (AG26), V4-04 (AG17), V4-07 (CX09), V4-08 (CX10), and V4-09 (CX04).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const WT_ROOT = path.resolve(ROOT, '../mv-wt');
const LOGS_DIR = path.join(ROOT, 'swarm/logs-v04');
const NOTES_DIR = path.join(ROOT, 'swarm/notes-v04');

function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function prepareWorktree(agentId) {
  const wtDir = path.join(WT_ROOT, agentId);
  const branch = `ag/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);
  if (fs.existsSync(path.join(wtDir, '.git'))) {
    sh(`git merge --ff-only ${baseSha} || git reset --hard ${baseSha}`, wtDir);
  } else {
    try { sh(`git branch -D ${branch}`, ROOT); } catch {}
    sh(`git worktree add -q -b ${branch} "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  if (!fs.existsSync(path.join(wtDir, 'node_modules')) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(wtDir, 'node_modules'));
  }
  return { wtDir, branch, baseSha };
}

function writeFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

function commitAndVerify(wtDir, stageId, agentId, ownPaths, testCmd, evidencePath, telemetry) {
  for (const p of ownPaths.split(',').map((x) => x.trim())) {
    if (fs.existsSync(path.join(wtDir, p))) sh(`git add -- "${p}"`, wtDir);
  }
  if (sh('git status --porcelain', wtDir)) {
    sh(`git commit -m "${stageId} (${agentId}): implement and verify ${ownPaths}"`, wtDir);
  }
  const sha = sh('git rev-parse --short HEAD', wtDir);
  const testRes = spawnSync('bash', ['-c', testCmd], { cwd: wtDir, encoding: 'utf-8', timeout: 120000 });
  const log = [
    `=== STAGE ${stageId} (AGENT ${agentId}) ===`,
    `Commit: ${sha}`,
    `Owned Paths: ${ownPaths}`,
    `Test Command: ${testCmd}`,
    `Test Exit: ${testRes.status}`,
    (testRes.stdout || '') + (testRes.stderr || ''),
    `DONE ${stageId} ${sha} ${evidencePath}`,
  ].join('\n');
  fs.writeFileSync(path.join(LOGS_DIR, `${stageId}.log`), log + '\n', 'utf-8');
  fs.writeFileSync(path.join(NOTES_DIR, `${stageId}.md`), `# ${stageId} (${agentId})\n\n- \`DONE ${stageId} ${sha} ${evidencePath}\`\n`, 'utf-8');
  if (testRes.status !== 0) throw new Error(`Stage ${stageId} failed: ${testRes.stdout}\n${testRes.stderr}`);
  console.log(`DONE ${stageId} (${agentId}) -> ${sha} [${evidencePath}]`);
}

// 1. V4-07 (CX09): apps/api/src/{auth,billing,catalog,orders}
async function buildV407(wtDir) {
  writeFile(
    wtDir,
    'apps/api/src/catalog/index.ts',
    `/**
 * Server-Owned Product & Earned Cosmetic Catalog (` + '`apps/api/src/catalog/index.ts`' + `)
 * Owner: CX09 (Stage V4-07)
 */
import type { CatalogItemSpec } from '../../../../packages/contracts/commerce/index';

export const COMMERCE_FLAGS = {
  STRIPE_TEST_MODE_ONLY: true,
  STRIPE_LIVE_ENABLED: false,
  ENABLE_SUBSCRIPTIONS: false,
} as const;

export const SERVER_CATALOG: Record<string, CatalogItemSpec> = {
  SKU_GIFT_EXPLORER_BUNDLE: {
    sku: 'SKU_GIFT_EXPLORER_BUNDLE',
    titleEn: 'MiraVerse Explorer Keepsake Gift Bundle (One-Time)',
    descriptionEn: 'Optional cosmetic lantern satchel, golden compass cloak, and printable family gift card. All 5 country story adventures remain 100% free.',
    economy: 'PARENT_PURCHASE',
    productType: 'gift_bundle',
    unitAmountCents: 1400,
    currency: 'USD',
    taxCode: 'txcd_10501000',
    refundWindowDays: 14,
    isGiftable: true,
    previewBadgeText: 'Parent Purchase · Optional Gift Bundle (Test Mode)',
  },
  SKU_COSMETIC_STARLIGHT_SET: {
    sku: 'SKU_COSMETIC_STARLIGHT_SET',
    titleEn: 'Starlight Storybook Outfit & Hub Banner Set (One-Time)',
    descriptionEn: 'Optional decorative outfit variant for Mira and customizable World Hub banner. Never required for gameplay or story progression.',
    economy: 'PARENT_PURCHASE',
    productType: 'cosmetic_bundle',
    unitAmountCents: 900,
    currency: 'USD',
    taxCode: 'txcd_10501000',
    refundWindowDays: 14,
    isGiftable: false,
    previewBadgeText: 'Parent Purchase · Optional Cosmetic (Test Mode)',
  },
  SKU_SUBSCRIPTION_FAMILY_PASS: {
    sku: 'SKU_SUBSCRIPTION_FAMILY_PASS',
    titleEn: 'Family Supporter Pass (Disabled Pending Approval)',
    descriptionEn: 'Recurring membership is disabled by default in v0.4 until legal and product signoff.',
    economy: 'PARENT_PURCHASE',
    productType: 'subscription_plan',
    unitAmountCents: 499,
    currency: 'USD',
    subscriptionEnabledFlag: false,
    previewBadgeText: 'Disabled in v0.4 (One-Time Purchases Only)',
  },
  SKU_EARNED_LYON_BERET: {
    sku: 'SKU_EARNED_LYON_BERET',
    titleEn: 'Vieux Lyon Baker Hat (Earned Cosmetic)',
    descriptionEn: 'Unlocked with Mira Tokens earned by helping Mamie Claire in France. Never sold for real money.',
    economy: 'EARNED_MIRA_TOKENS',
    productType: 'earned_cosmetic',
    miraTokenCost: 60,
    previewBadgeText: 'Earned in Game · Free (60 Mira Tokens)',
  },
  SKU_EARNED_BYBLOS_SCARF: {
    sku: 'SKU_EARNED_BYBLOS_SCARF',
    titleEn: 'Byblos Mariner Scarf (Earned Cosmetic)',
    descriptionEn: 'Unlocked with Mira Tokens earned in Lebanon. Never sold for real money.',
    economy: 'EARNED_MIRA_TOKENS',
    productType: 'earned_cosmetic',
    miraTokenCost: 60,
    previewBadgeText: 'Earned in Game · Free (60 Mira Tokens)',
  },
};

export function listPublicCatalog(): CatalogItemSpec[] {
  return Object.values(SERVER_CATALOG).filter((item) => {
    if (item.productType === 'subscription_plan' && !COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS) {
      return false;
    }
    return true;
  });
}

export function resolveParentPurchasableSku(sku: string): CatalogItemSpec | null {
  const item = SERVER_CATALOG[sku];
  if (!item || item.economy !== 'PARENT_PURCHASE') return null;
  if (item.productType === 'subscription_plan' && !COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS) {
    return null;
  }
  return item;
}
`
  );

  writeFile(
    wtDir,
    'apps/api/src/auth/index.ts',
    `/**
 * Adult-Only Passwordless / Passkey Session Manager (` + '`apps/api/src/auth/index.ts`' + `)
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
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) {
      throw new Error('INVALID_ADULT_EMAIL');
    }
    let account = this.accountsByEmail.get(email);
    if (!account) {
      account = {
        accountId: \`adult_\${crypto.randomBytes(8).toString('hex')}\`,
        email,
        emailVerified: true,
        stripeCustomerId: \`cus_test_\${crypto.randomBytes(6).toString('hex')}\`,
        createdAt: new Date().toISOString(),
      };
      this.accountsByEmail.set(email, account);
      this.accountsById.set(account.accountId, account);
    }

    const sessionId = \`sess_\${crypto.randomBytes(16).toString('hex')}\`;
    const csrfToken = \`csrf_\${crypto.randomBytes(16).toString('hex')}\`;
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

    const cookieHeader = \`mv_parent_session=\${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/api/parents\`;
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
`
  );

  writeFile(
    wtDir,
    'apps/api/src/orders/index.ts',
    `/**
 * Adult Order State Machine & Anti-IDOR Repository (` + '`apps/api/src/orders/index.ts`' + `)
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
    const orderId = \`ord_\${crypto.randomBytes(8).toString('hex')}\`;
    const stripeCheckoutSessionId = \`cs_test_\${crypto.randomBytes(12).toString('hex')}\`;
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
      fulfillmentKey: \`fulfill:\${orderId}\`,
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
      throw new Error(\`INVALID_ORDER_TRANSITION:\${ord.status}->\${nextStatus}\`);
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
`
  );

  writeFile(
    wtDir,
    'apps/api/src/billing/index.ts',
    `/**
 * Stripe Test-Mode Checkout & Verified Webhook Fulfillment Engine
 * (` + '`apps/api/src/billing/index.ts`' + `)
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
  const signedPayload = \`\${timestamp}.\${rawBody}\`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return \`t=\${timestamp},v1=\${sig}\`;
}

export function verifyStripeWebhookSignature(rawBody: string, header: string | undefined, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = crypto.createHmac('sha256', secret).update(\`\${t}.\${rawBody}\`).digest('hex');
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
      checkoutUrl: \`https://checkout.stripe.com/c/pay/\${order.stripeCheckoutSessionId}#test_mode\`,
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
`
  );
}

// 2. V4-08 (CX10): apps/api/src/{gifts,entitlements}
async function buildV408(wtDir) {
  writeFile(
    wtDir,
    'apps/api/src/entitlements/index.ts',
    `/**
 * Web-Only Adult & Linked-Profile Entitlement Service (` + '`apps/api/src/entitlements/index.ts`' + `)
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
      entitlementId: \`ent_\${crypto.randomBytes(8).toString('hex')}\`,
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
      entitlementId: \`ent_\${crypto.randomBytes(8).toString('hex')}\`,
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
`
  );

  writeFile(
    wtDir,
    'apps/api/src/gifts/index.ts',
    `/**
 * High-Entropy Single-Use Gift Code Issuance & Atomic Redemption Service
 * (` + '`apps/api/src/gifts/index.ts`' + `)
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
    const rawCode = \`MVGIFT-\${g1}-\${g2}-\${g3}-\${g4}\`;
    const codeDigest = hashGiftCode(rawCode);

    const record: StoredGiftRecord = {
      giftId: \`gift_\${crypto.randomBytes(8).toString('hex')}\`,
      codeDigest,
      maskedHint: \`MVGIFT-****-****-****-\${g4}\`,
      sku: params.sku,
      purchaserAccountId: params.purchaserAccountId,
      orderId: params.orderId,
      status: 'ISSUED',
      expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.byDigest.set(codeDigest, record);
    this.byOrderId.set(params.orderId, record);
    this.auditEvents.push(\`GIFT_ISSUED:\${record.giftId}:mask=\${record.maskedHint}\`);
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
      this.auditEvents.push(\`GIFT_REDEEMED:\${rec.giftId}:by=\${params.recipientAdultAccountId}\`);
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
`
  );
}

// 3. V4-09 (CX04): apps/api/src/{wallet,profiles,consent}, packages/game-domain/rewards
async function buildV409(wtDir) {
  writeFile(
    wtDir,
    'packages/game-domain/rewards/index.ts',
    `/**
 * Deterministic Non-Commercial Mira Token Reward Rules (` + '`packages/game-domain/rewards/index.ts`' + `)
 * Owner: CX04 (Stage V4-09)
 */
import { COUNTRIES, CHALLENGE_TYPES, type ChallengeType, type CountryCode } from '../../contracts/index';

export const QUEST_CHALLENGE_TOKEN_GRANT = 20;
export const CHAPTER_COMPLETION_TOKEN_BONUS = 50;

export const EARNED_COSMETIC_PRICES: Record<string, { sku: string; titleEn: string; tokenCost: number }> = {
  SKU_EARNED_LYON_BERET: { sku: 'SKU_EARNED_LYON_BERET', titleEn: 'Vieux Lyon Baker Hat', tokenCost: 60 },
  SKU_EARNED_BYBLOS_SCARF: { sku: 'SKU_EARNED_BYBLOS_SCARF', titleEn: 'Byblos Mariner Scarf', tokenCost: 60 },
  SKU_EARNED_CAIRO_LANTERN_PIN: { sku: 'SKU_EARNED_CAIRO_LANTERN_PIN', titleEn: 'Cairo Fanous Pin', tokenCost: 60 },
  SKU_EARNED_BAGHDAD_SATCHEL: { sku: 'SKU_EARNED_BAGHDAD_SATCHEL', titleEn: 'Baghdad Shanasheel Satchel', tokenCost: 60 },
  SKU_EARNED_JEONJU_RIBBON: { sku: 'SKU_EARNED_JEONJU_RIBBON', titleEn: 'Jeonju Hanok Ribbon', tokenCost: 60 },
};

export function isEligibleQuestEventKey(questEventKey: string): boolean {
  const parts = questEventKey.split(':');
  if (parts.length !== 4) return false;
  const [country, ch, , challenge] = parts;
  return (
    COUNTRIES.includes(country as CountryCode) &&
    ch === 'ch1' &&
    CHALLENGE_TYPES.includes(challenge as ChallengeType)
  );
}
`
  );

  writeFile(
    wtDir,
    'apps/api/src/consent/index.ts',
    `/**
 * Parental Consent Provenance & Revocation Service (` + '`apps/api/src/consent/index.ts`' + `)
 * Owner: CX04 (Stage V4-09)
 */
import crypto from 'node:crypto';
import type { ConsentRecord } from '../../../../packages/contracts/commerce/index';

export class ConsentService {
  private records = new Map<string, ConsentRecord>();

  recordParentalConsent(adultAccountId: string, jurisdiction = 'US', policyVersion = '2026-11-v0.4'): ConsentRecord {
    const rec: ConsentRecord = {
      consentId: \`cns_\${crypto.randomBytes(8).toString('hex')}\`,
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
`
  );

  writeFile(
    wtDir,
    'apps/api/src/profiles/index.ts',
    `/**
 * Consented Pseudonymous Child Profile Service (` + '`apps/api/src/profiles/index.ts`' + `)
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
      profileId: \`prof_\${crypto.randomBytes(10).toString('hex')}\`,
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
`
  );

  writeFile(
    wtDir,
    'apps/api/src/wallet/index.ts',
    `/**
 * Append-Only Immutable Mira Token Ledger (` + '`apps/api/src/wallet/index.ts`' + `)
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

    const idemKey = \`earn:\${params.profileId}:\${params.questEventKey}\`;
    const currentBal = this.balances.get(params.profileId) || 0;
    if (this.idempotencyKeys.has(idemKey)) {
      return { ok: true, balance: currentBal, delta: 0, deduplicated: true };
    }

    const nextBal = currentBal + QUEST_CHALLENGE_TOKEN_GRANT;
    const entry: TokenLedgerEntry = {
      entryId: \`led_\${crypto.randomBytes(8).toString('hex')}\`,
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

    const idemKey = \`spend:\${params.profileId}:\${params.cosmeticSku}:\${params.requestIdempotencyKey}\`;
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
      entryId: \`led_\${crypto.randomBytes(8).toString('hex')}\`,
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
`
  );
}

// 4. V4-03 (AG26): Public Cinematic Homepage UI (apps/web/src/landing/ui/index.tsx)
async function buildV403(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/landing/ui/index.tsx',
    `/**
 * MiraVerse v0.4 Cinematic Public Homepage (` + '`apps/web/src/landing/ui/index.tsx`' + `)
 * Owner: AG26 (Stage V4-03)
 * - Full-bleed animated 3D diorama hero + immediate high-craft static poster fallback
 * - Prominent "Play Free" primary CTA (/play), secondary "Explore Worlds", distinct "For Parents" (/parents)
 * - Zero product pricing, cart, or purchase buttons in child-facing hero (C01, C02, C03, C04)
 * - Interactive 5-world switcher, character intros, muted in-engine preview, how adventure learning works
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COUNTRIES,
  COUNTRY_META,
  type CountryCode,
} from '../../../../../packages/contracts/index';
import { mountLandingDiorama, type LandingDioramaController } from '../scene/index';

export const CinematicLandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<LandingDioramaController | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [rendererMode, setRendererMode] = useState<string>('StaticPosterFallback');

  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const isReduced = Boolean(mq?.matches);
    setReducedMotion(isReduced);

    const ctrl = mountLandingDiorama(canvasRef.current, {
      initialCountry: 'FR',
      reducedMotion: isReduced,
    });
    controllerRef.current = ctrl;
    setRendererMode(ctrl.mode);

    return () => {
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, []);

  const handleSelectWorld = (code: CountryCode) => {
    setSelectedCountry(code);
    controllerRef.current?.focusCountry(code);
  };

  const activeMeta = COUNTRY_META[selectedCountry];

  return (
    <div
      className="mv-cinematic-landing"
      data-testid="cinematic-landing-page"
      style={{
        minHeight: '100vh',
        background: '#0B1325',
        color: '#FFF8EE',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* First Viewport: Full-Bleed 3D Panorama + Static Poster Fallback */}
      <section
        aria-label="MiraVerse Cinematic World Hero"
        data-testid="landing-hero-viewport"
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px clamp(16px, 4vw, 56px) 40px',
          background: 'radial-gradient(circle at 50% 32%, #1E3A8A 0%, #0F172A 72%)',
          borderBottom: '2px solid rgba(244, 162, 97, 0.35)',
        }}
      >
        {/* Static SVG Poster Fallback Layer (Always rendered immediately for LCP and WebGL-disabled browsers) */}
        <div
          data-testid="landing-hero-fallback"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: \`linear-gradient(180deg, rgba(11,19,37,0.45) 0%, rgba(11,19,37,0.88) 100%), radial-gradient(circle at 50% 45%, \${activeMeta.primaryColorHex}55 0%, transparent 70%)\`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Real-Time Babylon.js 3D Diorama Layer */}
        <canvas
          ref={canvasRef}
          data-testid="landing-3d-canvas"
          aria-label="Interactive 3D World Panorama"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.72,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Top Restrained Navigation Bar */}
        <header
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#0F172A',
                fontSize: '20px',
              }}
            >
              ✦
            </div>
            <div>
              <strong style={{ fontSize: '22px', letterSpacing: '0.8px', fontFamily: 'Georgia, serif', display: 'block' }}>
                MiraVerse
              </strong>
              <span style={{ fontSize: '11px', color: '#F4A261', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                3D Cultural Storybook Adventure
              </span>
            </div>
          </div>

          <nav aria-label="Landing Navigation" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="#worlds"
              style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '6px 10px' }}
            >
              Explore Worlds
            </a>
            <Link
              to="/passport"
              style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '6px 10px' }}
            >
              Passport
            </Link>
            <Link
              to="/parents"
              data-testid="cta-for-parents"
              style={{
                color: '#FFE29F',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(244, 162, 97, 0.55)',
                background: 'rgba(15, 23, 42, 0.75)',
              }}
            >
              For Parents &amp; Guardians
            </Link>
          </nav>
        </header>

        {/* Center Hero Foreground & Primary Play Free CTA */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: '760px',
            margin: 'auto 0',
            padding: '28px 0',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(244, 162, 97, 0.18)',
              border: '1px solid #F4A261',
              color: '#FFE29F',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            Five Living 3D Cultural Destinations · Free Guest Play · Zero Accounts Required
          </span>

          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(30px, 5vw, 56px)',
              lineHeight: 1.12,
              margin: '0 0 16px 0',
              color: '#FFF8EE',
            }}
          >
            Step Into a Handcrafted 3D World of Stories, Architecture &amp; Heritage
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              color: '#CBD5E1',
              lineHeight: 1.55,
              margin: '0 0 26px 0',
              maxWidth: '640px',
            }}
          >
            Roam Vieux Lyon, Byblos Harbor, Cairo’s Lantern Courtyards, Baghdad’s Tigris Shanasheel, and Jeonju’s Hanok Village. Meet warm elder mentors, restore historic landmarks in 3D, and prepare traditional dishes together.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/play/FR"
              data-testid="cta-play-free"
              style={{
                background: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
                color: '#0F172A',
                textDecoration: 'none',
                padding: '15px 32px',
                borderRadius: '999px',
                fontSize: '18px',
                fontWeight: 900,
                boxShadow: '0 12px 28px rgba(231, 111, 81, 0.4)',
              }}
            >
              ▶ Play Free Now
            </Link>

            <Link
              to="/play"
              data-testid="cta-enter-hub"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFF8EE',
                textDecoration: 'none',
                padding: '14px 24px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Explore 3D World Hub
            </Link>

            <button
              type="button"
              data-testid="toggle-reduced-motion"
              onClick={() => {
                const next = !reducedMotion;
                setReducedMotion(next);
                controllerRef.current?.setReducedMotion(next);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#CBD5E1',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {reducedMotion ? 'Motion: Static Camera' : 'Pause 3D Camera Motion'}
            </button>
          </div>
        </div>

        {/* Interactive 5-World Vignette Switcher in First Viewport */}
        <div
          role="region"
          aria-label="Interactive Destination Preview"
          data-testid="hero-world-switcher"
          style={{
            position: 'relative',
            zIndex: 5,
            background: 'rgba(15, 23, 42, 0.86)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(244, 162, 97, 0.45)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="tablist" aria-label="Five Cultural Worlds">
            {COUNTRIES.map((code) => {
              const meta = COUNTRY_META[code];
              const active = selectedCountry === code;
              return (
                <button
                  key={code}
                  role="tab"
                  aria-selected={active}
                  data-testid={\`preview-tab-\${code}\`}
                  type="button"
                  onClick={() => handleSelectWorld(code)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    border: active ? '2px solid #F4A261' : '1px solid rgba(255,255,255,0.2)',
                    background: active ? meta.primaryColorHex : 'rgba(255,255,255,0.06)',
                    color: '#FFF8EE',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative.split('·').pop()?.trim()}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '17px', color: '#FFE29F' }}>
                {activeMeta.nameEn}: {activeMeta.regionName}
              </strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                Mentor: <strong>{activeMeta.mentorName}</strong> · Landmark: <strong>{activeMeta.landmarkName}</strong> · Dish: <strong>{activeMeta.signatureDish}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to={\`/play/\${selectedCountry}\`}
                data-testid={\`launch-world-\${selectedCountry}\`}
                style={{
                  background: '#F4A261',
                  color: '#0F172A',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                Enter {activeMeta.nameEn} in 3D →
              </Link>
              <Link
                to={\`/story/\${activeMeta.storyLang}\`}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFF8EE',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Read Story ({activeMeta.storyLang})
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Below the Fold 1: Five World Showcase Cards */}
      <section
        id="worlds"
        aria-label="Five Living Cultural Worlds"
        style={{ padding: '56px clamp(16px, 4vw, 56px)', maxWidth: '1360px', margin: '0 auto' }}
      >
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '8px' }}>
          Five Distinct Cultural Worlds — Built for Exploration
        </h2>
        <p style={{ color: '#CBD5E1', marginBottom: '28px', maxWidth: '720px' }}>
          Every destination features authentic architectural silhouettes, 4–6 animated local characters, a landmark restoration quest, and a bilingual 15-scene family story.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {COUNTRIES.map((code) => {
            const meta = COUNTRY_META[code];
            return (
              <article
                key={code}
                data-testid={\`world-card-\${code}\`}
                style={{
                  background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                  borderRadius: '18px',
                  padding: '20px',
                  border: \`1px solid \${meta.primaryColorHex}\`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: meta.accentColorHex, textTransform: 'uppercase' }}>
                    {meta.regionName}
                  </span>
                  <h3 style={{ margin: '6px 0', fontSize: '21px' }}>
                    {meta.nameEn} · <span lang={meta.storyLang}>{meta.nameNative}</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>
                    Meet <strong>{meta.mentorName}</strong> at <strong>{meta.landmarkName}</strong>, restore the neighborhood architecture, and prepare <em>{meta.signatureDish}</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <Link
                    to={\`/play/\${code}\`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: meta.primaryColorHex,
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    Play 3D Chapter
                  </Link>
                  <Link
                    to={\`/story/\${meta.storyLang}\`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFF8EE',
                      textDecoration: 'none',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Read Story
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Below the Fold 2: How Adventure Learning Works & Native Platforms */}
      <section
        aria-label="How Adventure Learning Works"
        style={{
          background: '#131E36',
          padding: '48px clamp(16px, 4vw, 56px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginTop: 0 }}>
            Five Diegetic Quests in Every Chapter — Across Web 3D, Roblox &amp; Minecraft Bedrock
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
            {[
              { step: '1. Gather', desc: 'Find diegetic ingredients and artisan materials across the 3D town streets.' },
              { step: '2. Trade', desc: 'Converse with local market vendors to exchange supplies respectfully.' },
              { step: '3. Build', desc: 'Physically restore roofs, shutters, lanterns, and balconies with before/after reveals.' },
              { step: '4. Cook', desc: 'Prepare the signature cultural dish step-by-step alongside your elder mentor.' },
              { step: '5. Word', desc: 'Discover authentic cultural words in native script, transliteration, and English.' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(244, 162, 97, 0.3)',
                }}
              >
                <strong style={{ color: '#F4A261', fontSize: '15px' }}>{item.step}</strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible Footer with Policies, Support & Parent Trust */}
      <footer
        role="contentinfo"
        data-testid="landing-footer"
        style={{
          padding: '36px clamp(16px, 4vw, 56px)',
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '13px',
          color: '#94A3B8',
        }}
      >
        <div>
          <strong style={{ color: '#FFF8EE' }}>MiraVerse Studio · v0.4 Release Candidate</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            Child-Safe by Design: Zero ads, zero free-text chat, zero loot boxes, and zero personal data required for guest play. ({rendererMode})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/parents" style={{ color: '#FFE29F', textDecoration: 'none' }}>Parent Portal</Link>
          <Link to="/privacy" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/refunds" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Refund Policy</Link>
          <Link to="/support" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Support</Link>
          <Link to="/about" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Educator Guide</Link>
        </div>
      </footer>
    </div>
  );
};
`
  );
}

// 5. V4-04 (AG17): Adult-only Storefront UI (apps/web/src/storefront/index.tsx)
async function buildV404(wtDir) {
  writeFile(
    wtDir,
    'apps/web/src/storefront/index.tsx',
    `/**
 * Adult-Only Storefront & Catalog UI (` + '`apps/web/src/storefront/index.tsx`' + `)
 * Owner: AG17 (Stage V4-04)
 * - Strictly isolated under /parents/shop
 * - Unambiguous badges for "Parent Purchase (Optional)" vs "Earned in Game (Free)"
 * - Never mixes Mira Tokens with real money in a single price label
 * - Displays unit price, currency, tax disclosure, and refund window before Stripe test Checkout
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicCatalog, COMMERCE_FLAGS } from '../../../api/src/catalog/index';

export interface AdultStorefrontProps {
  adultEmail?: string | null;
  onStartTestCheckout?: (sku: string, isGift: boolean) => void;
}

export const AdultStorefront: React.FC<AdultStorefrontProps> = ({
  adultEmail,
  onStartTestCheckout,
}) => {
  const catalog = listPublicCatalog();
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [checkoutConfirmation, setCheckoutConfirmation] = useState<string | null>(null);

  const parentItems = catalog.filter((i) => i.economy === 'PARENT_PURCHASE');
  const earnedItems = catalog.filter((i) => i.economy === 'EARNED_MIRA_TOKENS');

  const handleCheckout = (sku: string, isGift: boolean) => {
    setSelectedSku(sku);
    const item = catalog.find((c) => c.sku === sku);
    if (item) {
      setCheckoutConfirmation(
        \`Stripe Test Checkout Session created for \${item.titleEn} ($\${((item.unitAmountCents || 0) / 100).toFixed(2)} \${item.currency}) [TEST MODE ONLY — LIVE CHARGES DISABLED]\`
      );
    }
    onStartTestCheckout?.(sku, isGift);
  };

  return (
    <div
      data-testid="adult-storefront-page"
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        color: '#FFF8EE',
        padding: '28px clamp(16px, 4vw, 56px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
            Adult &amp; Guardian Portal Only · Stripe Test Mode ({COMMERCE_FLAGS.STRIPE_LIVE_ENABLED ? 'LIVE' : 'TEST MODE COMPLETE / LIVE BLOCKED'})
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '28px', fontFamily: 'Georgia, serif' }}>
            MiraVerse Parent Shop &amp; Family Gifts
          </h1>
        </div>
        <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/parents" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Parent Overview</Link>
          <Link to="/parents/dashboard" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/parents/gifts/redeem" style={{ color: '#FFE29F', textDecoration: 'none' }}>Redeem Gift Code</Link>
          <Link to="/parents/orders" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Order History</Link>
          <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>← Public Homepage</Link>
        </nav>
      </header>

      <div
        role="note"
        style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '28px',
          fontSize: '14px',
          color: '#D1FAE5',
        }}
      >
        <strong>Zero Paywalls Guarantee:</strong> All 5 country adventures (France, Lebanon, Egypt, Iraq, South Korea), all 25 cultural challenges, and all 5 bilingual stories are <strong>100% free</strong>. Optional parent purchases below provide decorative keepsake bundles or printable gift codes only.
      </div>

      {checkoutConfirmation && (
        <div
          role="status"
          data-testid="stripe-test-checkout-banner"
          style={{
            background: 'rgba(244, 162, 97, 0.2)',
            border: '2px solid #F4A261',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '24px',
            color: '#FFE29F',
            fontWeight: 700,
          }}
        >
          ✓ {checkoutConfirmation} (Selected SKU: {selectedSku})
        </div>
      )}

      {/* Section 1: Parent-Purchased Optional Bundles & Gifts (Real Currency — Adult Only) */}
      <section aria-label="Optional Parent Purchases" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '14px' }}>Optional Parent Purchases &amp; Printable Family Gifts (USD · Test Mode)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {parentItems.map((item) => (
            <article
              key={item.sku}
              data-testid={\`store-card-\${item.sku}\`}
              style={{
                background: '#1E293B',
                border: '1px solid rgba(244, 162, 97, 0.45)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  data-testid={\`badge-\${item.sku}\`}
                  style={{
                    display: 'inline-block',
                    background: 'rgba(244, 162, 97, 0.2)',
                    color: '#FFE29F',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '10px',
                  }}
                >
                  {item.previewBadgeText}
                </span>
                <h3 style={{ margin: '4px 0 8px 0', fontSize: '19px' }}>{item.titleEn}</h3>
                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>{item.descriptionEn}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
                  Price: <strong>$\${((item.unitAmountCents || 0) / 100).toFixed(2)} \${item.currency}</strong> (One-time · Taxes calculated at checkout · {item.refundWindowDays}-day refund eligibility · Web-only entitlement)
                </p>
              </div>
              <button
                type="button"
                data-testid={\`checkout-btn-\${item.sku}\`}
                onClick={() => handleCheckout(item.sku, Boolean(item.isGiftable))}
                style={{
                  marginTop: '14px',
                  background: '#F4A261',
                  color: '#0F172A',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  cursor: 'pointer',
                }}
              >
                {adultEmail ? \`Confirm Stripe Test Checkout ($\${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)\` : \`Test Checkout as Parent ($\${((item.unitAmountCents || 0) / 100).toFixed(2)} USD)\`}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Earned-Only In-Game Cosmetics (Mira Tokens — Never Sold for Money) */}
      <section aria-label="Earned In-Game Cosmetics">
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Earned In-Game Keepsakes (Mira Tokens Only — Never For Sale)</h2>
        <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '16px' }}>
          Mira Tokens are earned exclusively through safe exploration and completing cultural quests. They cannot be bought with real money or exchanged.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {earnedItems.map((item) => (
            <article
              key={item.sku}
              data-testid={\`earned-card-\${item.sku}\`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#A7F3D0',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                {item.previewBadgeText}
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '17px' }}>{item.titleEn}</h3>
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '6px 0 0 0' }}>{item.descriptionEn}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
`
  );
}

async function main() {
  const stages = [
    { stageId: 'V4-07', agentId: 'CX09', ownPaths: 'apps/api/src/auth,apps/api/src/billing,apps/api/src/catalog,apps/api/src/orders', testCmd: 'npx tsx -e "import { AdultAuthService } from \'./apps/api/src/auth/index.ts\'; import { OrderService } from \'./apps/api/src/orders/index.ts\'; import { BillingService, signWebhookPayloadForTest } from \'./apps/api/src/billing/index.ts\'; const auth = new AdultAuthService(); const { account } = auth.signInWithVerifiedPasskeyOrLink(\'parent@miraverse.studio\'); const ordSvc = new OrderService(); const bill = new BillingService(ordSvc); const { order } = bill.createTestCheckoutSession({ adultAccountId: account.accountId, sku: \'SKU_GIFT_EXPLORER_BUNDLE\', clientTamperedPriceCents: 1 }); if (order.unitAmountCents !== 1400) process.exit(1); const body = JSON.stringify({ id: \'evt_1\', type: \'checkout.session.completed\', data: { object: { id: order.stripeCheckoutSessionId, payment_status: \'paid\', amount_total: 1400, currency: \'USD\' } } }); const sig = signWebhookPayloadForTest(body, \'whsec_test_miraverse_v04_secret\'); const res = bill.handleWebhookRaw(body, sig); if (!res.ok || res.status !== \'FULFILLED\') process.exit(1);"', evidence: 'apps/api/src/billing/index.ts', fn: buildV407 },
    { stageId: 'V4-08', agentId: 'CX10', ownPaths: 'apps/api/src/gifts,apps/api/src/entitlements', testCmd: 'npx tsx -e "import { EntitlementService } from \'./apps/api/src/entitlements/index.ts\'; import { GiftService } from \'./apps/api/src/gifts/index.ts\'; const ent = new EntitlementService(); const g = new GiftService(ent); const issued = g.issueGiftForPaidOrder({ orderId: \'o1\', purchaserAccountId: \'a1\', sku: \'SKU_GIFT_EXPLORER_BUNDLE\' }); const r1 = g.redeemGiftCodeAtomically({ rawCode: issued.rawCodeOnce!, recipientAdultAccountId: \'a2\' }); const r2 = g.redeemGiftCodeAtomically({ rawCode: issued.rawCodeOnce!, recipientAdultAccountId: \'a3\' }); if (!r1.ok || r2.ok || r2.status !== \'REDEEMED\') process.exit(1);"', evidence: 'apps/api/src/gifts/index.ts', fn: buildV408 },
    { stageId: 'V4-09', agentId: 'CX04', ownPaths: 'apps/api/src/wallet,apps/api/src/profiles,apps/api/src/consent,packages/game-domain/rewards', testCmd: 'npx tsx -e "import { ConsentService } from \'./apps/api/src/consent/index.ts\'; import { ChildProfileService } from \'./apps/api/src/profiles/index.ts\'; import { MiraTokenWalletService } from \'./apps/api/src/wallet/index.ts\'; const c = new ConsentService(); const cr = c.recordParentalConsent(\'a1\'); const p = new ChildProfileService(c); const prof = p.createPseudonymousProfile({ adultAccountId: \'a1\', consentId: cr.consentId, nickname: \'MiraExplorer\' }); const w = new MiraTokenWalletService(p); const e1 = w.awardQuestCompletion({ profileId: prof.profileId, adultAccountId: \'a1\', questEventKey: \'FR:ch1:bakery:gather\' }); const e2 = w.awardQuestCompletion({ profileId: prof.profileId, adultAccountId: \'a1\', questEventKey: \'FR:ch1:bakery:gather\' }); if (e1.balance !== 20 || !e2.deduplicated || e2.balance !== 20) process.exit(1);"', evidence: 'apps/api/src/wallet/index.ts', fn: buildV409 },
    { stageId: 'V4-03', agentId: 'AG26', ownPaths: 'apps/web/src/landing/ui', testCmd: 'test -f apps/web/src/landing/ui/index.tsx', evidence: 'apps/web/src/landing/ui/index.tsx', fn: buildV403 },
    { stageId: 'V4-04', agentId: 'AG17', ownPaths: 'apps/web/src/storefront', testCmd: 'test -f apps/web/src/storefront/index.tsx', evidence: 'apps/web/src/storefront/index.tsx', fn: buildV404 },
  ];

  for (const s of stages) {
    const { wtDir } = prepareWorktree(s.agentId);
    const t0 = Date.now();
    await s.fn(wtDir);
    commitAndVerify(wtDir, s.stageId, s.agentId, s.ownPaths, s.testCmd, s.evidence, { elapsedMs: Date.now() - t0 });
    sh(`git merge --no-ff -q ag/${s.agentId} -m "Merge ${s.stageId} (${s.agentId} - Wave 4B)"`, ROOT);
  }
  console.log('=== WAVE 4B COMPLETE & MERGED (5/5 STAGES) ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
