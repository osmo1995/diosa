import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleConcierge } from '../server/conciergeHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleConcierge(req as any, res as any);
}
