import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getRequestId, sendJson } from '../../server/apiUtils.js';
import { getBillingConfig } from '../../server/billingConfig.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!allowMethods(req as any, res as any, ['GET'])) return;

  const requestId = getRequestId(req as any);
  res.setHeader('x-request-id', requestId);

  const cfg = getBillingConfig();
  return sendJson(res as any, 200, { ...cfg, requestId });
}
