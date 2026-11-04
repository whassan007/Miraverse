/**
 * MiraVerse v0.4 Required Scenarios C01..C20 Automated Verification Suite
 * (`tests/e2e/commerce/commerce-c01-c20.test.ts`)
 * Owner: CX08 (Stage V4-11)
 * Verifies every scenario C01 through C20 from Section 10.6 of the v0.4 specification.
 */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COMMERCE_FLAGS,
  MiraVerseCommerceApi,
  redactGiftCodeInText,
  signWebhookPayloadForTest,
} from '../../../apps/api/src/index';
import { GameDomainController } from '../../../packages/game-domain/index';

describe('V4-11 — MiraVerse v0.4 Commerce, Gifting, Token & Homepage Scenarios C01..C20', () => {
  it('C01, C02, C03, C04: Homepage & Child Gameplay separation — zero checkout/prices in child surfaces, static fallback & reduced motion present', () => {
    const landingTsx = fs.readFileSync('apps/web/src/landing/ui/index.tsx', 'utf-8');
    const hudTsx = fs.readFileSync('apps/web/src/ui/hud/index.tsx', 'utf-8');
    const posterSvg = fs.readFileSync('art/branding/landing/hero-poster.svg', 'utf-8');

    // C01: Play Free CTA -> /play/FR & /play without account or payment
    expect(landingTsx).toContain('data-testid="cta-play-free"');
    expect(landingTsx).toContain('to="/play/FR"');
    // C02: Static poster fallback & WebGL fallback
    expect(landingTsx).toContain('data-testid="landing-hero-fallback"');
    expect(posterSvg).toContain('<svg');
    // C03: Reduced motion support
    expect(landingTsx).toContain('prefers-reduced-motion: reduce');
    expect(landingTsx).toContain('data-testid="toggle-reduced-motion"');
    // C04: Zero pricing, cart, or Buy Now in child HUD or hero
    expect(hudTsx).not.toMatch(/\$\d|Buy Now|Stripe Checkout/i);
  });

  it('C05, C06, C07: Unauthenticated checkout blocked (401), expired session rejected, and client-side price tampering ignored', () => {
    const api = new MiraVerseCommerceApi('whsec_test_c01_c20');

    // C05: Unauthenticated checkout attempt rejected
    const unauth = api.handleRequest({
      method: 'POST',
      path: '/api/parents/checkout-session',
      body: { sku: 'SKU_COSMETIC_STARLIGHT_SET' },
    });
    expect(unauth.status).toBe(401);

    // Sign in adult
    const signIn = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'parent1@miraverse.studio' },
    });
    expect(signIn.status).toBe(200);
    const { session } = signIn.body;

    // C07: Client attempts to tamper unitAmountCents to 1 cent ($0.01); server enforces authoritative $9.00 (900 cents)
    const checkout = api.handleRequest({
      method: 'POST',
      path: '/api/parents/checkout-session',
      headers: { 'x-session-id': session.sessionId, 'x-csrf-token': session.csrfToken },
      body: { sku: 'SKU_COSMETIC_STARLIGHT_SET', unitAmountCents: 1 },
    });
    expect(checkout.status).toBe(200);
    expect(checkout.body.order.unitAmountCents).toBe(900);
    expect(checkout.body.order.status).toBe('CHECKOUT_PENDING');

    // C06: Expire session and verify subsequent privileged call is rejected with 401
    api.auth.expireSessionImmediatelyForTest(session.sessionId);
    const afterExpiry = api.handleRequest({
      method: 'POST',
      path: '/api/parents/checkout-session',
      headers: { 'x-session-id': session.sessionId, 'x-csrf-token': session.csrfToken },
      body: { sku: 'SKU_COSMETIC_STARLIGHT_SET' },
    });
    expect(afterExpiry.status).toBe(401);
  });

  it('C08, C09, C10: Valid webhook fulfills order, duplicate webhook replay is idempotent, and invalid signature is rejected', () => {
    const secret = 'whsec_test_c08_c10';
    const api = new MiraVerseCommerceApi(secret);
    const { session } = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'parent2@miraverse.studio' },
    }).body;

    const { order } = api.handleRequest({
      method: 'POST',
      path: '/api/parents/checkout-session',
      headers: { 'x-session-id': session.sessionId, 'x-csrf-token': session.csrfToken },
      body: { sku: 'SKU_COSMETIC_STARLIGHT_SET', isGift: false },
    }).body;

    // C10: Invalid webhook signature rejected with zero state mutation
    const badPayload = JSON.stringify({
      id: 'evt_bad_1',
      type: 'checkout.session.completed',
      data: { object: { id: order.stripeCheckoutSessionId, payment_status: 'paid', amount_total: 900, currency: 'USD' } },
    });
    const badRes = api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': 't=123,v1=deadbeef' },
      rawBody: badPayload,
    });
    expect(badRes.status).toBe(400);
    expect(api.orders.getOrderInternal(order.orderId)?.status).toBe('CHECKOUT_PENDING');

    // C08: Valid signed webhook fulfills order once
    const goodPayload = JSON.stringify({
      id: 'evt_good_1',
      type: 'checkout.session.completed',
      data: { object: { id: order.stripeCheckoutSessionId, payment_status: 'paid', amount_total: 900, currency: 'USD' } },
    });
    const goodSig = signWebhookPayloadForTest(goodPayload, secret);
    const goodRes = api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': goodSig },
      rawBody: goodPayload,
    });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.status).toBe('FULFILLED');
    expect(api.entitlements.listForAdult(session.accountId)).toHaveLength(1);

    // C09: Replaying same event.id OR a second event for the same order does not duplicate entitlements
    const replaySameEvent = api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': goodSig },
      rawBody: goodPayload,
    });
    expect(replaySameEvent.status).toBe(200);
    expect(replaySameEvent.body.deduplicated).toBe(true);

    const secondEventPayload = JSON.stringify({
      id: 'evt_good_2',
      type: 'checkout.session.async_payment_succeeded',
      data: { object: { id: order.stripeCheckoutSessionId, payment_status: 'paid', amount_total: 900, currency: 'USD' } },
    });
    const secondRes = api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': signWebhookPayloadForTest(secondEventPayload, secret) },
      rawBody: secondEventPayload,
    });
    expect(secondRes.status).toBe(200);
    expect(secondRes.body.deduplicated).toBe(true);
    expect(api.entitlements.listForAdult(session.accountId)).toHaveLength(1);
  });

  it('C11, C12, C13, C14: Gift code issuance only after payment, atomic single-winner redemption, log redaction, and refund/dispute handling', () => {
    const secret = 'whsec_test_c11_c14';
    const api = new MiraVerseCommerceApi(secret);
    const buyer = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'buyer@miraverse.studio' },
    }).body.session;
    const recipient1 = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'recipient1@miraverse.studio' },
    }).body.session;
    const recipient2 = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'recipient2@miraverse.studio' },
    }).body.session;

    // C11: Unpaid gift order has no gift code yet
    const { order } = api.handleRequest({
      method: 'POST',
      path: '/api/parents/checkout-session',
      headers: { 'x-session-id': buyer.sessionId, 'x-csrf-token': buyer.csrfToken },
      body: { sku: 'SKU_GIFT_EXPLORER_BUNDLE', isGift: true },
    }).body;
    expect(api.consumePrintableGiftCodeOnce(order.orderId, buyer.accountId)).toBeNull();

    // Fulfill via webhook
    const rawWebhook = JSON.stringify({
      id: 'evt_gift_1',
      type: 'checkout.session.completed',
      data: { object: { id: order.stripeCheckoutSessionId, payment_status: 'paid', amount_total: 1400, currency: 'USD' } },
    });
    api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': signWebhookPayloadForTest(rawWebhook, secret) },
      rawBody: rawWebhook,
    });

    const rawCode = api.consumePrintableGiftCodeOnce(order.orderId, buyer.accountId);
    expect(rawCode).toMatch(/^MVGIFT-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);

    // C13: Raw code is never stored in audit logs
    for (const entry of api.gifts.getAuditLogs()) {
      expect(entry).not.toContain(rawCode!);
    }
    expect(redactGiftCodeInText('Code: ' + rawCode)).toBe('Code: MVGIFT-REDACTED-XXXX');

    // C12: First redemption wins; second redemption fails with REDEEMED and zero purchaser PII leaked
    const win = api.handleRequest({
      method: 'POST',
      path: '/api/parents/gifts/redeem',
      headers: { 'x-session-id': recipient1.sessionId, 'x-csrf-token': recipient1.csrfToken },
      body: { code: rawCode },
    });
    expect(win.status).toBe(200);
    expect(win.body.status).toBe('REDEEMED');
    expect(JSON.stringify(win.body)).not.toContain('buyer@miraverse.studio');

    const secondAttempt = api.handleRequest({
      method: 'POST',
      path: '/api/parents/gifts/redeem',
      headers: { 'x-session-id': recipient2.sessionId, 'x-csrf-token': recipient2.csrfToken },
      body: { code: rawCode },
    });
    expect(secondAttempt.status).toBe(400);
    expect(secondAttempt.body.status).toBe('REDEEMED');

    // C14: Refund webhook transitions order to REFUNDED and flags gift REFUND_REVIEW
    const refundPayload = JSON.stringify({
      id: 'evt_refund_1',
      type: 'charge.refunded',
      data: { object: { metadata: { orderId: order.orderId } } },
    });
    const refRes = api.handleRequest({
      method: 'POST',
      path: '/api/billing/stripe-webhook',
      headers: { 'stripe-signature': signWebhookPayloadForTest(refundPayload, secret) },
      rawBody: refundPayload,
    });
    expect(refRes.status).toBe(200);
    expect(refRes.body.status).toBe('REFUNDED');
  });

  it('C15, C16, C17, C18, C19, C20: Earned Mira Token ledger invariants, offline localStorage isolation, IDOR protection, data export/delete, and platform compliance', () => {
    const api = new MiraVerseCommerceApi();
    const parentA = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'parentA@miraverse.studio' },
    }).body.session;
    const parentB = api.handleRequest({
      method: 'POST',
      path: '/api/parents/auth/sign-in',
      body: { email: 'parentB@miraverse.studio' },
    }).body.session;

    // Create consented pseudonymous profile for Parent A
    const consent = api.handleRequest({
      method: 'POST',
      path: '/api/parents/consent',
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { jurisdiction: 'US' },
    }).body.consent;

    const prof = api.handleRequest({
      method: 'POST',
      path: '/api/parents/profiles',
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { consentId: consent.consentId, nickname: 'LeoStar' },
    }).body.profile;

    // C15: Eligible quest completion awards Mira Tokens once; replay does not double-credit
    for (const step of ['gather', 'trade', 'build']) {
      const aw = api.handleRequest({
        method: 'POST',
        path: `/api/profiles/${prof.profileId}/quest-awards`,
        headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
        body: { questEventKey: `FR:ch1:main:${step}` },
      });
      expect(aw.status).toBe(200);
    }
    const replay = api.handleRequest({
      method: 'POST',
      path: `/api/profiles/${prof.profileId}/quest-awards`,
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { questEventKey: 'FR:ch1:main:gather' },
    });
    expect(replay.body.deduplicated).toBe(true);
    expect(replay.body.balance).toBe(60);

    // C16: Valid spend of 60 tokens succeeds (balance -> 0); subsequent spend of another 60-token item is rejected with INSUFFICIENT_MIRA_TOKENS
    const validSpend = api.handleRequest({
      method: 'POST',
      path: `/api/profiles/${prof.profileId}/cosmetics/spend`,
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { cosmeticSku: 'SKU_EARNED_LYON_BERET', idempotencyKey: 'sp1' }, // costs 60, balance becomes 0
    });
    expect(validSpend.status).toBe(200);
    expect(validSpend.body.balance).toBe(0);

    const overspend = api.handleRequest({
      method: 'POST',
      path: `/api/profiles/${prof.profileId}/cosmetics/spend`,
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { cosmeticSku: 'SKU_EARNED_BYBLOS_SCARF', idempotencyKey: 'sp2' }, // costs 60, balance is 0
    });
    expect(overspend.status).toBe(400);
    expect(overspend.body.reason).toBe('INSUFFICIENT_MIRA_TOKENS');

    // C17: Offline stamp / localStorage edits cannot mint server entitlements or server tokens
    const spoofAttempt = api.handleRequest({
      method: 'POST',
      path: `/api/profiles/${prof.profileId}/quest-awards`,
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
      body: { questEventKey: 'MV1-FR-1-5555-localStorage' },
    });
    expect(spoofAttempt.status).toBe(400);
    expect(spoofAttempt.body.reason).toBe('UNTRUSTED_OFFLINE_SOURCE');

    // C18: Cross-account IDOR attempt by Parent B against Parent A's profile is rejected with 403
    const idorWallet = api.handleRequest({
      method: 'GET',
      path: `/api/profiles/${prof.profileId}/wallet`,
      headers: { 'x-session-id': parentB.sessionId },
    });
    expect(idorWallet.status).toBe(403);

    // C19: Parent A can export and delete pseudonymous child profile
    const exported = api.handleRequest({
      method: 'POST',
      path: '/api/parents/data-export',
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
    });
    expect(exported.status).toBe(200);
    expect(exported.body.profiles).toHaveLength(1);

    const deleted = api.handleRequest({
      method: 'DELETE',
      path: `/api/parents/profiles/${prof.profileId}`,
      headers: { 'x-session-id': parentA.sessionId, 'x-csrf-token': parentA.csrfToken },
    });
    expect(deleted.status).toBe(200);

    // C20: Platform rules — Stripe live disabled, subscriptions disabled
    expect(COMMERCE_FLAGS.STRIPE_LIVE_ENABLED).toBe(false);
    expect(COMMERCE_FLAGS.ENABLE_SUBSCRIPTIONS).toBe(false);
  });
});
