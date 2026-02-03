alter table public.user_generation_usage enable row level security;
alter table public.generation_events enable row level security;

-- Users can read their own usage row
create policy "usage_read_own" on public.user_generation_usage
  for select
  using (auth.uid() = user_id);

-- Users cannot directly modify usage (server uses service role)

-- Users can read their own generation events
create policy "events_read_own" on public.generation_events
  for select
  using (auth.uid() = user_id);
