import { supabaseClient } from './supabaseClient';

export async function startCheckout(priceId: string, mode: 'payment' | 'subscription', quantity?: number) {
  const session = supabaseClient ? await supabaseClient.auth.getSession() : null;
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mode, priceId, quantity }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Checkout failed (${res.status})`);
  }

  const json = await res.json();
  if (!json.url) throw new Error('Missing checkout url');
  window.location.href = json.url;
}
