import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';
import { allowMethods, readJsonBody, sendJson } from './apiUtils.js';

type ConciergeRequest = { query: string };

export async function handleConcierge(req: IncomingMessage, res: ServerResponse, apiKey?: string) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (!key) return sendJson(res, 500, { error: 'Missing GEMINI_API_KEY on server' });

    const body = await readJsonBody<ConciergeRequest>(req);
    if (!body?.query) return sendJson(res, 400, { error: 'query is required' });

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: body.query,
      config: {
        systemInstruction:
          "You are the luxury concierge for Diosa Studio Yorkville, a premium hair extension salon. You are elegant, helpful, and highly knowledgeable about tape-ins, keratin bonds, and hand-tied wefts. Keep your tone sophisticated and boutique.",
      },
    });

    return sendJson(res, 200, { text: response.text });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error' });
  }
}
