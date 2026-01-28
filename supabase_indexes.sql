-- Optional performance indexes for style_generations

-- Fast recent listing
create index if not exists idx_style_generations_created_at on public.style_generations (created_at desc);

-- Fast filtering by preset/shade/length
create index if not exists idx_style_generations_variant on public.style_generations (preset, shade, length, created_at desc);

-- Lookup by storage path
create index if not exists idx_style_generations_storage_path on public.style_generations (storage_path);

-- Optional: enforce uniqueness of storage paths (uncomment if desired)
-- create unique index if not exists ux_style_generations_storage_path on public.style_generations (storage_path);
