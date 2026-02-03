import type { IncomingMessage, ServerResponse } from 'node:http';
import { allowMethods, getRequestId, readJsonBody, sendJson } from './apiUtils.js';
import { getStripe } from './stripeClient.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';

function getBearer(req: IncomingMessage) {
  const raw = req.headers['authorization'];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  const m = v.toString().match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

type CreateCheckoutBody =
  | { mode: 'payment'; priceId: string; quantity?: number }
  | { mode: 'subscription'; priceId: string };

export async function handleCreateCheckoutSession(req: IncomingMessage, res: ServerResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  const requestId = getRequestId(req);
  res.setHeader('x-request-id', requestId);

  try {
    const token = getBearer(req);
    if (!token) return sendJson(res, 401, { error: 'Authentication required', requestId });

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return sendJson(res, 401, { error: 'Unauthorized', requestId });

    const body = await readJsonBody<CreateCheckoutBody>(req);
    const stripe = getStripe();

    const origin = (process.env.PUBLIC_SITE_ORIGIN ?? '').trim() || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: body.mode,
      customer_email: userData.user.email ?? undefined,
      line_items: [
        {
          price: body.priceId,
          quantity: body.mode === 'payment' ? Math.max(1, Math.min(99, Number(body.quantity ?? 1))) : 1,
        },
      ],
      success_url: `${origin}/#/style-generator?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/style-generator?billing=cancel`,
      metadata: {
        supabase_user_id: userData.user.id,
      },
    });

    return sendJson(res, 200, { url: session.url, id: session.id, requestId });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
