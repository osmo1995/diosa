import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCreateCheckoutSession } from '../../server/billingHandler.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleCreateCheckoutSession(req as any, res as any);
}
