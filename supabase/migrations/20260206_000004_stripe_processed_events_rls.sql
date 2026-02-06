alter table public.stripe_processed_events enable row level security;

-- No client access; server uses service role
