const DEFAULT_SUPABASE_URL = "https://example.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "demo-anon-key";
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "demo-service-role-key";

function normalizeSupabaseValue(value: string | undefined, fallback: string) {
  const candidate = value?.trim();
  if (!candidate) {
    return fallback;
  }

  return /^https?:\/\//i.test(candidate) ? candidate : fallback;
}

export function getSupabaseUrl() {
  return normalizeSupabaseValue(process.env.NEXT_PUBLIC_SUPABASE_URL, DEFAULT_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return normalizeSupabaseValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey() {
  return normalizeSupabaseValue(process.env.SUPABASE_SERVICE_ROLE_KEY, DEFAULT_SUPABASE_SERVICE_ROLE_KEY);
}
