-- Map Stripe subscription IDs to Supabase users
create table if not exists public.stripe_subscriptions (
  subscription_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  price_id text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_subscriptions_user_idx on public.stripe_subscriptions(user_id);
