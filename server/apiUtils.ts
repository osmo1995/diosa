import type { IncomingMessage, ServerResponse } from 'node:http';

export async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) throw new Error('Missing request body');
  return JSON.parse(raw) as T;
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(json);
}

export function allowMethods(req: IncomingMessage, res: ServerResponse, methods: string[]) {
  if (!req.method || !methods.includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', methods.join(', '));
    res.end('Method Not Allowed');
    return false;
  }
  return true;
}

export function extractBase64Payload(dataUrlOrBase64: string): { base64: string; mimeType: string } {
  // Accept data URLs or raw base64.
  const m = dataUrlOrBase64.match(/^data:([^;]+);base64,(.*)$/);
  if (m) return { mimeType: m[1], base64: m[2] };
  // Best-effort default.
  return { mimeType: 'image/jpeg', base64: dataUrlOrBase64 };
}
