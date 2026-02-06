-- Idempotency store for Stripe webhooks (avoid double-credit on retries)
create table if not exists public.stripe_processed_events (
  id text primary key,
  created_at timestamptz not null default now()
);
