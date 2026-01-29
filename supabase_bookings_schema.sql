-- Diosa Studio: store booking/consultation requests

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  service text not null,
  length text not null,
  preferred_date text not null,

  name text not null,
  email text not null,
  phone text not null,
  message text
);

alter table public.bookings enable row level security;

-- No public access by default. Service role bypasses RLS.
-- Add select policies later if you build an admin UI.
