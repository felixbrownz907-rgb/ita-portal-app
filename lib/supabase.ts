import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;
// Hardcoded fallbacks for mobile user convenience
const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://ftilzhekqutqmdjiewbg.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lQdzEhuU_LlME7vXSWNskA_-Ga7D-fw';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        autoRefreshToken: true,
        persistSession: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase credentials missing. Supabase integration is disabled.');
}
