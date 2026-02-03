-- Usage/quota tracking for Virtual Preview Stylist

create table if not exists public.user_generation_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_start date not null,
  free_used integer not null default 0,
  paid_credits integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists user_generation_usage_period_idx on public.user_generation_usage(period_start);

create table if not exists public.generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('free','paid_credit','subscription_included','overage')),
  preset text,
  shade text,
  length text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists generation_events_user_created_idx on public.generation_events(user_id, created_at desc);
