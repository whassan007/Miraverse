/**
 * Cloudflare Pages Function: POST /api/webhook
 *
 * Verifies Stripe webhook signatures (HMAC-SHA256 via Web Crypto API) and processes
 * `checkout.session.completed` events for miraverse.studio.
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

  const event = JSON.parse(rawBody) as {
    id: string;
    type: string;
    data?: {
      object?: {
        id?: string;
        payment_status?: string;
        metadata?: Record<string, string>;
      };
    };
  };

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object;
    if (session?.payment_status === 'paid') {
      return new Response(
        JSON.stringify({
          received: true,
          eventId: event.id,
          sessionId: session.id,
          status: 'fulfilled',
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    }
  }

  return new Response(JSON.stringify({ received: true, eventId: event.id }), {
    status: 200,
    headers: JSON_HEADERS,
  });
};
