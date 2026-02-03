import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleStripeWebhook } from '../../server/webhookHandler.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleStripeWebhook(req as any, res as any);
}
