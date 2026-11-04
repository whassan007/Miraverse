/**
 * Cloudflare Pages Function: POST /api/webhook
 *
 * Verifies Stripe webhook signatures (HMAC-SHA256 via Web Crypto API) and processes
 * subscription lifecycle events for miraverse.studio:
 * - `checkout.session.completed` (initial subscription checkout fulfillment)
 * - `invoice.paid` (monthly subscription renewal)
 * - `customer.subscription.deleted` (subscription cancellation / access revocation)
 */

export interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const TOLERANCE_SECONDS = 300;

function parseStripeSignature(header: string): { timestamp: number; signatures: string[] } | null {
  let timestamp = -1;
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const [k, v] = part.trim().split('=');
    if (k === 't') timestamp = Number(v);
    if (k === 'v1' && v) signatures.push(v);
  }
  if (!Number.isFinite(timestamp) || timestamp <= 0 || signatures.length === 0) {
    return null;
  }
  return { timestamp, signatures };
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyStripeWebhookSignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
  nowEpochSeconds = Math.floor(Date.now() / 1000)
): Promise<boolean> {
  const parsed = parseStripeSignature(sigHeader);
  if (!parsed) return false;
  if (Math.abs(nowEpochSeconds - parsed.timestamp) > TOLERANCE_SECONDS) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const macBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const computedHex = Array.from(new Uint8Array(macBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return parsed.signatures.some((sig) => timingSafeHexEqual(computedHex, sig.toLowerCase()));
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Webhook secret not configured.' }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }

  const sigHeader = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  const valid = await verifyStripeWebhookSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid Stripe webhook signature.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  let event: {
    id: string;
    type: string;
    data?: {
      object?: {
        id?: string;
        customer?: string;
        subscription?: string;
        status?: string;
        payment_status?: string;
        metadata?: Record<string, string>;
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON webhook payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const obj = event.data?.object;

  if (event.type === 'checkout.session.completed') {
    if (obj?.payment_status === 'paid' || obj?.status === 'complete') {
      return new Response(
        JSON.stringify({
          received: true,
          eventId: event.id,
          type: event.type,
          sessionId: obj.id,
          subscriptionId: obj.subscription || null,
          customerId: obj.customer || null,
          tier: obj.metadata?.tier || 'standard',
          status: 'fulfilled',
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    }
  }

  if (event.type === 'invoice.paid') {
    return new Response(
      JSON.stringify({
        received: true,
        eventId: event.id,
        type: event.type,
        invoiceId: obj?.id || null,
        subscriptionId: obj?.subscription || null,
        customerId: obj?.customer || null,
        status: 'renewed',
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    return new Response(
      JSON.stringify({
        received: true,
        eventId: event.id,
        type: event.type,
        subscriptionId: obj?.id || null,
        customerId: obj?.customer || null,
        status: 'revoked',
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  }

  return new Response(JSON.stringify({ received: true, eventId: event.id, type: event.type }), {
    status: 200,
    headers: JSON_HEADERS,
  });
};
