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

    // Idempotency: skip if we've already processed this Stripe event id.
    try {
      const { error: procErr } = await supabase.from('stripe_processed_events').insert({ id: event.id });
      if (procErr) {
        // likely duplicate
        return sendJson(res, 200, { received: true, requestId, duplicate: true });
      }
    } catch {
      // if idempotency store fails, continue (Stripe will retry anyway)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session?.metadata?.supabase_user_id;

      // If this was a subscription checkout, store mapping subscription -> user.
      if (userId && session?.mode === 'subscription' && session?.subscription) {
        try {
          await supabase.from('stripe_subscriptions').upsert(
            {
              subscription_id: String(session.subscription),
              user_id: userId,
              status: 'active',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'subscription_id' }
          );
        } catch {}
      }

      // Credit pack purchase
      if (userId) {
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

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;
      const subscriptionId = invoice?.subscription ? String(invoice.subscription) : null;
      if (subscriptionId) {
        const { data: subRow } = await supabase
          .from('stripe_subscriptions')
          .select('subscription_id,user_id')
          .eq('subscription_id', subscriptionId)
          .maybeSingle();

        const userId = subRow?.user_id;
        if (userId) {
          // Map subscription priceId -> monthly included credits
          const subCreditsMap = JSON.parse(process.env.STRIPE_SUBSCRIPTION_CREDITS_MAP_JSON ?? '{}') as Record<
            string,
            number
          >;

          const line = invoice?.lines?.data?.[0];
          const priceId = line?.price?.id;
          const credits = priceId ? subCreditsMap[priceId] ?? 0 : 0;

          if (credits > 0) {
            const periodStart = monthStartUtc(new Date(invoice?.created ? invoice.created * 1000 : Date.now()));
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
                paid_credits: paidCredits + credits,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          }
        }
      }
    }

    return sendJson(res, 200, { received: true, requestId });
  } catch (e: any) {
    return sendJson(res, 400, { error: e?.message ?? 'Webhook error', requestId });
  }
}
