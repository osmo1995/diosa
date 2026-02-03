import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';
import { allowMethods, extractBase64Payload, getRequestId, rateLimit, readJsonBody, sendJson } from './apiUtils.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import crypto from 'node:crypto';

type StyleRequest = {
  imageBase64: string; // can be data URL or raw base64
  preset: string;
  shade: string;
  length: string;
  // Optional: if true, API returns base64 alongside URL.
  includeBase64?: boolean;
};

export async function handleStyle(req: IncomingMessage, res: ServerResponse, apiKey?: string) {
  if (!allowMethods(req, res, ['POST'])) return;
  // Image generation is more expensive; keep a tighter rate limit.
  if (!rateLimit(req, res, { windowMs: 60_000, max: 10 })) return;

  const requestId = getRequestId(req);
  res.setHeader('x-request-id', requestId);

  try {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (!key) return sendJson(res, 500, { error: 'Missing GEMINI_API_KEY on server', requestId });

    // Require auth so we can enforce per-user quotas.
    const authHeader = req.headers['authorization'];
    const authValue = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.toString() ?? '';
    const m = authValue.match(/^Bearer\s+(.+)$/i);
    const token = m ? m[1] : null;
    if (!token) return sendJson(res, 401, { error: 'Authentication required', requestId });

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return sendJson(res, 401, { error: 'Unauthorized', requestId });

    const userId = userData.user.id;

    const body = await readJsonBody<StyleRequest>(req);
    if (!body?.imageBase64) return sendJson(res, 400, { error: 'imageBase64 is required', requestId });

    const { base64, mimeType } = extractBase64Payload(body.imageBase64);

    // Enforce monthly free quota (15) + paid credits.
    const freeLimit = 15;
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodStartIso = periodStart.toISOString().slice(0, 10); // date

    const { data: usageRow, error: usageErr } = await supabase
      .from('user_generation_usage')
      .select('user_id,period_start,free_used,paid_credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (usageErr) {
      return sendJson(res, 500, { error: `Usage lookup failed: ${usageErr.message}`, requestId });
    }

    const rowPeriod = usageRow?.period_start ? new Date(usageRow.period_start).toISOString().slice(0, 10) : null;
    const isSamePeriod = rowPeriod === periodStartIso;
    const freeUsed = isSamePeriod ? usageRow?.free_used ?? 0 : 0;
    const paidCredits = usageRow?.paid_credits ?? 0;

    const hasFree = freeUsed < freeLimit;
    const hasPaid = paidCredits > 0;

    if (!hasFree && !hasPaid) {
      return sendJson(res, 402, {
        error: 'Free quota exhausted',
        requestId,
        quota: {
          periodStart: periodStartIso,
          freeLimit,
          freeUsed,
          freeRemaining: 0,
          paidCredits,
        },
      });
    }

    // Update usage before generating (fail-closed; keep it atomic enough via upsert).
    const nextFreeUsed = hasFree ? freeUsed + 1 : freeUsed;
    const nextPaidCredits = !hasFree && hasPaid ? paidCredits - 1 : paidCredits;

    const { error: upsertErr } = await supabase.from('user_generation_usage').upsert(
      {
        user_id: userId,
        period_start: periodStartIso,
        free_used: nextFreeUsed,
        paid_credits: nextPaidCredits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (upsertErr) {
      return sendJson(res, 500, { error: `Usage update failed: ${upsertErr.message}`, requestId });
    }

    // Log event best-effort
    try {
      await supabase.from('generation_events').insert({
        user_id: userId,
        kind: hasFree ? 'free' : 'paid_credit',
        preset: body.preset,
        shade: body.shade,
        length: body.length,
        request_id: requestId,
      });
    } catch {}

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `You are a luxury hair extension editor for Diosa Studio Yorkville.
Edit the provided portrait photo to apply premium hair extensions.
Preset: ${body.preset}
Shade: ${body.shade}
Length: ${body.length}
Requirements:
- seamless blend at root
- natural density and believable texture
- keep face identity and skin tone consistent
- professional salon lighting, daylight-proof
Return ONLY the edited image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return sendJson(res, 502, { error: 'No image returned from model', requestId });
    }

    const outputBase64: string = imagePart.inlineData.data;
    const outputMimeType: string = imagePart.inlineData.mimeType ?? 'image/png';

    // Persist to Supabase if configured
    let publicUrl: string | null = null;
    let storagePath: string | null = null;
    const bucket = (process.env.SUPABASE_STYLE_BUCKET ?? 'generated-previews').trim();

    try {
      const supabase = getSupabaseAdmin();

      // Ensure bucket exists (best-effort). Some projects start with no buckets.
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = (buckets ?? []).some((b) => b.name === bucket);
        if (!exists) {
          const bucketPublic = (process.env.SUPABASE_BUCKET_PUBLIC ?? 'false').trim().toLowerCase() === 'true';
          const { error: createErr } = await supabase.storage.createBucket(bucket, {
            public: bucketPublic,
          });
          if (createErr) {
            console.warn('[api/style] Failed to create bucket', { requestId, bucket, message: createErr.message });
          }
        }
      } catch (e: any) {
        console.warn('[api/style] Bucket ensure failed', { requestId, message: e?.message });
      }

      const ext = outputMimeType.includes('png') ? 'png' : outputMimeType.includes('webp') ? 'webp' : 'jpg';
      const safePreset = body.preset.replace(/[^a-z0-9-]/gi, '_');
      const safeShade = body.shade.replace(/[^a-z0-9-]/gi, '_');
      const safeLen = body.length.replace(/[^a-z0-9-]/gi, '_');

      const rand = crypto.randomBytes(6).toString('hex');
      storagePath = `style/${safePreset}/${safeShade}/${safeLen}/${Date.now()}-${rand}.${ext}`;

      const buffer = Buffer.from(outputBase64, 'base64');
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: outputMimeType,
          upsert: false,
        });

      if (!uploadError) {
        const bucketPublic = (process.env.SUPABASE_BUCKET_PUBLIC ?? 'false').trim().toLowerCase() === 'true';
        const ttl = Number((process.env.SUPABASE_SIGNED_URL_TTL_SECONDS ?? '3600').trim());

        if (bucketPublic) {
          const pub = supabase.storage.from(bucket).getPublicUrl(storagePath);
          publicUrl = pub.data.publicUrl;
        } else {
          const { data: signed, error: signError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(storagePath, ttl);
          if (!signError) {
            // reuse publicUrl variable to store signed URL for response
            publicUrl = signed?.signedUrl ?? null;
          }
        }

        // Log metadata
        const { error: insertError } = await supabase.from('style_generations').insert({
          request_id: requestId,
          preset: body.preset,
          shade: body.shade,
          length: body.length,
          input_mime_type: mimeType,
          output_mime_type: outputMimeType,
          storage_bucket: bucket,
          storage_path: storagePath,
          public_url: bucketPublic ? publicUrl : null,
        });

        if (insertError) {
          console.warn('[api/style] DB insert failed', { requestId, message: insertError.message });
        }
      } else {
        console.warn('[api/style] Supabase upload failed', { requestId, message: uploadError.message });
      }
    } catch (e: any) {
      // Non-fatal: still return the generated image
      console.warn('[api/style] Supabase persistence skipped/failed', { requestId, message: e?.message });
    }

    const bucketPublic = (process.env.SUPABASE_BUCKET_PUBLIC ?? 'false').trim().toLowerCase() === 'true';

    return sendJson(res, 200, {
      // Back-compat: return base64 only if requested.
      imageBase64: body.includeBase64 ? outputBase64 : undefined,
      mimeType: outputMimeType,
      publicUrl: bucketPublic ? publicUrl : null,
      signedUrl: bucketPublic ? null : publicUrl,
      storagePath,
      requestId,
      persistence: {
        attempted: true,
        bucket,
        bucketPublic,
        savedToStorage: Boolean(storagePath) && Boolean(publicUrl),
        savedToDb: null,
      },
    });
  } catch (e: any) {
    console.error('[api/style]', { requestId, message: e?.message });
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
