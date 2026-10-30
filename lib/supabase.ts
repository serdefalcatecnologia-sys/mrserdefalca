import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from './supabase-config';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (supabaseUrl === 'https://example.supabase.co' || supabaseAnonKey === 'demo-anon-key') {
  console.warn('Supabase no está configurado; usando valores de ejemplo para compilar la app.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});