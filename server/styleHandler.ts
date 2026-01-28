import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';
import { allowMethods, extractBase64Payload, readJsonBody, sendJson } from './apiUtils.js';

type StyleRequest = {
  imageBase64: string; // can be data URL or raw base64
  preset: string;
  shade: string;
  length: string;
};

export async function handleStyle(req: IncomingMessage, res: ServerResponse, apiKey?: string) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (!key) return sendJson(res, 500, { error: 'Missing GEMINI_API_KEY on server' });

    const body = await readJsonBody<StyleRequest>(req);
    if (!body?.imageBase64) return sendJson(res, 400, { error: 'imageBase64 is required' });

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
      return sendJson(res, 502, { error: 'No image returned from model' });
    }

    return sendJson(res, 200, {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error' });
  }
}
