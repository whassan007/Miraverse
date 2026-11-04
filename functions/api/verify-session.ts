/**
 * Cloudflare Pages Function: GET /api/verify-session?session_id=cs_...
 *
 * Confirms with Stripe that a Checkout Session is paid before unlocking
 * the MiraVerse Family & Educator downloads (.mcaddon & .rbxlx).
 */

export interface Env {
  STRIPE_SECRET_KEY?: string;
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = (url.searchParams.get('session_id') || '').trim();

  if (!/^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(sessionId)) {
    return new Response(JSON.stringify({ paid: false, error: 'Invalid Stripe session_id.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ paid: false, error: 'Stripe secret key not configured.' }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }

  const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    },
  });

  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ paid: false, error: 'Could not verify Checkout session.' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const session = (await stripeRes.json()) as {
    id?: string;
    payment_status?: string;
  };

  if (session.payment_status !== 'paid') {
    return new Response(JSON.stringify({ paid: false, status: session.payment_status }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }

  return new Response(
    JSON.stringify({
      paid: true,
      sessionId: session.id,
      downloads: {
        mcaddon: '/downloads/miraverse.mcaddon',
        rbxlx: '/downloads/miraverse.rbxlx',
      },
    }),
    { status: 200, headers: JSON_HEADERS }
  );
};
