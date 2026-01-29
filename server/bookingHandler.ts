import type { IncomingMessage, ServerResponse } from 'node:http';
import { allowMethods, getRequestId, rateLimit, readJsonBody, sendJson } from './apiUtils.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { sendResendEmail } from './resendClient.js';

type BookingRequest = {
  service: string;
  length: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function handleBooking(req: IncomingMessage, res: ServerResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!rateLimit(req, res, { windowMs: 60_000, max: 15 })) return;

  const requestId = getRequestId(req);
  res.setHeader('x-request-id', requestId);

  try {
    const body = await readJsonBody<BookingRequest>(req);

    const errors: Record<string, string> = {};
    if (!body.service) errors.service = 'Service is required';
    if (!body.length) errors.length = 'Length is required';
    if (!body.date) errors.date = 'Date is required';
    if (!body.name?.trim()) errors.name = 'Name is required';
    if (!body.email?.trim() || !isEmail(body.email.trim())) errors.email = 'Valid email is required';
    if (!body.phone?.trim()) errors.phone = 'Phone is required';

    if (Object.keys(errors).length > 0) {
      return sendJson(res, 400, { error: 'Validation failed', errors, requestId });
    }

    const supabase = getSupabaseAdmin();

    // Insert booking (requires you to run supabase_bookings_schema.sql)
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        service: body.service,
        length: body.length,
        preferred_date: body.date,
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message ?? null,
      })
      .select('id')
      .single();

    if (error) {
      return sendJson(res, 500, {
        error: error.message,
        hint: 'Run supabase_bookings_schema.sql in Supabase SQL Editor to create public.bookings.',
        requestId,
      });
    }

    const bookingId = data?.id;

    // Optional emails (placeholders if env not configured)
    const from = process.env.RESEND_FROM?.trim() || 'Diosa Studio <no-reply@diosa.vercel.app>';
    const salonInbox = process.env.SALON_INBOX?.trim() || 'bookings@example.com';

    const subjectClient = 'Your Diosa Studio consultation request';
    const subjectSalon = `New booking request: ${body.name}`;

    const summaryHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Diosa Studio Yorkville</h2>
        <p><strong>Service:</strong> ${body.service}</p>
        <p><strong>Length:</strong> ${body.length}</p>
        <p><strong>Date:</strong> ${body.date}</p>
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phone}</p>
        ${body.message ? `<p><strong>Notes:</strong> ${body.message}</p>` : ''}
        <hr/>
        <p style="color:#666">Request ID: ${requestId}</p>
      </div>
    `;

    try {
      // Client confirmation
      await sendResendEmail({ from, to: body.email, subject: subjectClient, html: summaryHtml });
      // Salon notification
      await sendResendEmail({ from, to: salonInbox, subject: subjectSalon, html: summaryHtml });
    } catch (e: any) {
      // Non-fatal: booking is stored
      console.warn('[api/booking] email failed', { requestId, message: e?.message });
    }

    return sendJson(res, 200, { ok: true, bookingId, requestId });
  } catch (e: any) {
    console.error('[api/booking]', { message: e?.message });
    return sendJson(res, 500, { error: e?.message ?? 'Unknown error', requestId });
  }
}
