import { createClient } from '@supabase/supabase-js';

// Client-side Supabase (SAFE): only uses anon key.
// NOTE: Vite exposes only vars prefixed with VITE_.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient = url && anon ? createClient(url, anon) : null;
