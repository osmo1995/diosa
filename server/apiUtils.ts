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

export function getRequestId(req: IncomingMessage): string {
  // Prefer inbound request ID if present (Vercel may add one)
  const hdr = req.headers['x-request-id'];
  if (typeof hdr === 'string' && hdr.trim()) return hdr.trim();
  // Simple unique id
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Best-effort, per-instance rate limiter (serverless-safe, not global guarantee).
const rateState = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: IncomingMessage, res: ServerResponse, opts: { windowMs: number; max: number }) {
  const now = Date.now();
  const ip =
    (typeof req.headers['x-forwarded-for'] === 'string' && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    (typeof req.socket?.remoteAddress === 'string' ? req.socket.remoteAddress : 'unknown');

  const key = `${ip}`;
  const curr = rateState.get(key);
  if (!curr || curr.resetAt <= now) {
    rateState.set(key, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  if (curr.count >= opts.max) {
    const retryAfter = Math.max(1, Math.ceil((curr.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    sendJson(res, 429, { error: 'Rate limit exceeded. Please try again shortly.' });
    return false;
  }

  curr.count += 1;
  rateState.set(key, curr);
  return true;
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
