/**
 * Cloudflare Pages Function: POST /api/checkout
 *
 * Creates a hosted Stripe Checkout Session for parents & educators purchasing
 * the MiraVerse Family & Educator Bundle (Minecraft .mcaddon + Roblox .rbxlx).
 * Kept strictly behind the adult gate on /#/about; zero Stripe scripts or cookies
 * are loaded inside the child-facing web app.
 */

export interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID?: string;
  PUBLIC_SITE_URL?: string;
}

interface CheckoutRequestBody {
  parentGateConfirmed?: boolean;
  bundle?: 'family_educator_v0_1';
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  if (body.parentGateConfirmed !== true) {
    return new Response(
      JSON.stringify({ error: 'Adult/parent confirmation is required before starting checkout.' }),
      { status: 403, headers: JSON_HEADERS }
    );
  }

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return new Response(
      JSON.stringify({
        error: 'Stripe is not configured on this environment yet (missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID).',
      }),
      { status: 503, headers: JSON_HEADERS }
    );
  }

  const siteUrl = (env.PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('line_items[0][price]', env.STRIPE_PRICE_ID);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', `${siteUrl}/#/about?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${siteUrl}/#/about?checkout=cancelled`);
  params.set('metadata[product]', 'miraverse_family_educator_v0_1');
  params.set('metadata[domain]', 'miraverse.studio');

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const stripeData = (await stripeRes.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!stripeRes.ok || !stripeData.url) {
    return new Response(
      JSON.stringify({
        error: stripeData.error?.message || 'Unable to create Stripe Checkout session.',
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }

  return new Response(
    JSON.stringify({
      id: stripeData.id,
      url: stripeData.url,
    }),
    { status: 200, headers: JSON_HEADERS }
  );
};
