import type { IncomingMessage, ServerResponse } from 'node:http';
import { allowMethods, getRequestId, sendJson } from './apiUtils.js';
import { getStripe } from './stripeClient.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function monthStartUtc(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export async function handleStripeWebhook(req: IncomingMessage, res: ServerResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  const requestId = getRequestId(req);
  res.setHeader('x-request-id', requestId);

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return sendJson(res, 500, { error: 'Missing STRIPE_WEBHOOK_SECRET', requestId });

  try {
    const sig = req.headers['stripe-signature'];
    const raw = await readRawBody(req);

    const event = stripe.webhooks.constructEvent(raw, sig as string, secret);

    const supabase = getSupabaseAdmin();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session?.metadata?.supabase_user_id;
      if (userId) {
        // Credit pack mapping via env: PRICE_ID -> credits
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
        const creditsMap = JSON.parse(process.env.STRIPE_CREDITS_MAP_JSON ?? '{}') as Record<string, number>;

        let creditsToAdd = 0;
        for (const li of lineItems.data) {
          const priceId = li.price?.id;
          if (!priceId) continue;
          const per = creditsMap[priceId] ?? 0;
          creditsToAdd += per * (li.quantity ?? 1);
        }

        if (creditsToAdd > 0) {
          const periodStart = monthStartUtc();
          const { data: row } = await supabase
            .from('user_generation_usage')
            .select('user_id,paid_credits')
            .eq('user_id', userId)
            .maybeSingle();

          const paidCredits = row?.paid_credits ?? 0;
          await supabase.from('user_generation_usage').upsert(
            {
              user_id: userId,
              period_start: periodStart,
              free_used: 0,
              paid_credits: paidCredits + creditsToAdd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        }
      }
    }

    return sendJson(res, 200, { received: true, requestId });
  } catch (e: any) {
    return sendJson(res, 400, { error: e?.message ?? 'Webhook error', requestId });
  }
}
