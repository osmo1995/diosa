import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleBooking } from '../server/bookingHandler.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleBooking(req as any, res as any);
}
