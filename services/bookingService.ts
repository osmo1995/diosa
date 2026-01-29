export type BookingPayload = {
  service: string;
  length: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
};

export type BookingResponse = {
  ok: boolean;
  bookingId?: string;
  requestId?: string;
  error?: string;
  errors?: Record<string, string>;
};

export async function submitBooking(payload: BookingPayload): Promise<BookingResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => ({}))) as BookingResponse;
    if (!res.ok) return { ok: false, ...json };
    return { ok: true, ...json };
  } catch (e: any) {
    return { ok: false, error: e?.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Request failed.' };
  } finally {
    window.clearTimeout(timeout);
  }
}
