import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase config is read from VITE_* env vars (inlined at build time by
 * Vite). See README for setup + the SQL schema. When unconfigured,
 * `supabase` is null and the multiplayer UI shows a friendly setup notice
 * instead of crashing — solo mode still works fully.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
