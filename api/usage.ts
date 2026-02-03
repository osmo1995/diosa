import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getRequestId, sendJson } from '../server/apiUtils.js';
import { getSupabaseAdmin } from '../server/supabaseAdmin.js';

function getBearer(req: VercelRequest) {
  const raw = req.headers['authorization'];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  const m = v.toString().match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function monthStartUtc(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!allowMethods(req as any, res as any, ['GET'])) return;

  const requestId = getRequestId(req as any);
  res.setHeader('x-request-id', requestId);

  try {
    const token = getBearer(req);
    if (!token) return sendJson(res as any, 401, { error: 'Missing Authorization bearer token', requestId });

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return sendJson(res as any, 401, { error: 'Unauthorized', requestId });

    const userId = userData.user.id;
    const periodStart = monthStartUtc();

    const { data: row, error } = await supabase
      .from('user_generation_usage')
      .select('user_id,period_start,free_used,paid_credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return sendJson(res as any, 500, { error: error.message, requestId });

    const freeLimit = 15;
    const freeUsed = row?.period_start && new Date(row.period_start).getTime() === periodStart.getTime() ? row.free_used : 0;
    const paidCredits = row?.paid_credits ?? 0;

    return sendJson(res as any, 200, {
      userId,
      periodStart: periodStart.toISOString(),
      freeLimit,
      freeUsed,
      freeRemaining: Math.max(0, freeLimit - freeUsed),
      paidCredits,
      requestId,
    });
  } catch (e: any) {
    return sendJson(res as any, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
