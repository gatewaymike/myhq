import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const PREVIEW = import.meta.env.VITE_PREVIEW === '1';

// Publishable (anon) key only. The secret / service_role key never enters this codebase.
// Without the two settings (or in a preview build) the app runs in guest mode only.
export const supabase: SupabaseClient | null =
  !PREVIEW && url && key
    ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
