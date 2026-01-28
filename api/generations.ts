import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../server/supabaseAdmin.js';
import { allowMethods, getRequestId, sendJson } from '../server/apiUtils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!allowMethods(req as any, res as any, ['GET'])) return;

  const requestId = getRequestId(req as any);
  res.setHeader('x-request-id', requestId);

  try {
    const adminToken = process.env.ADMIN_TOKEN?.trim();
    if (adminToken) {
      const provided = req.headers['x-admin-token'];
      if (provided !== adminToken) {
        return sendJson(res as any, 401, { error: 'Unauthorized', requestId });
      }
    }

    const supabase = getSupabaseAdmin();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));

    const { data, error } = await supabase
      .from('style_generations')
      .select('id,created_at,request_id,preset,shade,length,output_mime_type,storage_bucket,storage_path,public_url')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      const msg = error.message ?? 'Unknown error';
      const schemaHint = msg.includes('schema cache') || msg.includes('Could not find the table');
      return sendJson(res as any, 500, {
        error: msg,
        hint: schemaHint ? 'Run supabase_schema.sql in Supabase SQL Editor to create public.style_generations.' : undefined,
        requestId,
      });
    }

    const bucketPublic = (process.env.SUPABASE_BUCKET_PUBLIC ?? 'false').trim().toLowerCase() === 'true';
    const ttl = Number((process.env.SUPABASE_SIGNED_URL_TTL_SECONDS ?? '3600').trim());

    const items = await Promise.all(
      (data ?? []).map(async (row) => {
        let url = row.public_url ?? null;
        if (!bucketPublic) {
          const { data: signed } = await supabase.storage
            .from(row.storage_bucket)
            .createSignedUrl(row.storage_path, ttl);
          url = signed?.signedUrl ?? null;
        }

        return {
          ...row,
          url,
        };
      })
    );

    return sendJson(res as any, 200, { items, requestId });
  } catch (e: any) {
    console.error('[api/generations]', { requestId, message: e?.message });
    return sendJson(res as any, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
