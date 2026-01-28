-- Diosa Studio: store metadata about AI style generations

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.style_generations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  request_id text,
  preset text not null,
  shade text not null,
  length text not null,

  input_mime_type text,
  output_mime_type text,

  storage_bucket text not null,
  storage_path text not null,
  public_url text
);

alter table public.style_generations enable row level security;

-- By default: no public access. Service role bypasses RLS.
-- If you want a public gallery later, add a read-only policy.

-- Example public read policy (disabled by default):
-- create policy "public read" on public.style_generations
--   for select
--   using (true);
