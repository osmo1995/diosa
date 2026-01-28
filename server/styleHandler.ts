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

    const body = await readJsonBody<StyleRequest>(req);
    if (!body?.imageBase64) return sendJson(res, 400, { error: 'imageBase64 is required', requestId });

    const { base64, mimeType } = extractBase64Payload(body.imageBase64);

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
    const bucket = process.env.SUPABASE_STYLE_BUCKET ?? 'generated-previews';

    try {
      const supabase = getSupabaseAdmin();

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
        const pub = supabase.storage.from(bucket).getPublicUrl(storagePath);
        publicUrl = pub.data.publicUrl;

        // Log metadata
        await supabase.from('style_generations').insert({
          request_id: requestId,
          preset: body.preset,
          shade: body.shade,
          length: body.length,
          input_mime_type: mimeType,
          output_mime_type: outputMimeType,
          storage_bucket: bucket,
          storage_path: storagePath,
          public_url: publicUrl,
        });
      } else {
        console.warn('[api/style] Supabase upload failed', { requestId, message: uploadError.message });
      }
    } catch (e: any) {
      // Non-fatal: still return the generated image
      console.warn('[api/style] Supabase persistence skipped/failed', { requestId, message: e?.message });
    }

    return sendJson(res, 200, {
      // Back-compat: return base64 only if requested.
      imageBase64: body.includeBase64 ? outputBase64 : undefined,
      mimeType: outputMimeType,
      publicUrl,
      storagePath,
      requestId,
    });
  } catch (e: any) {
    console.error('[api/style]', { requestId, message: e?.message });
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
