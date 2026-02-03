import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');

  return new Stripe(key, {
    // Keep in sync with stripe package types
    apiVersion: '2025-02-24.acacia',
  });
}
