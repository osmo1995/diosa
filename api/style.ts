import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleStyle } from '../server/styleHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // VercelRequest/VercelResponse are compatible with IncomingMessage/ServerResponse
  // for the parts we use.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleStyle(req as any, res as any);
}
