import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './supabase-config';

const supabaseUrl = getSupabaseUrl();
const supabaseServiceKey = getSupabaseServiceRoleKey();

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});