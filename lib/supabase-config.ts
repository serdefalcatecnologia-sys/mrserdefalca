const DEFAULT_SUPABASE_URL = "https://example.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "demo-anon-key";
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "demo-service-role-key";

// Validador específico exclusivo para URLs (requiere http:// o https://)
function normalizeSupabaseUrl(value: string | undefined, fallback: string) {
  const candidate = value?.trim();
  if (!candidate) {
    return fallback;
  }
  return /^https?:\/\//i.test(candidate) ? candidate : fallback;
}

// Validador general para llaves (verifica que existan y no estén vacías, sin exigir https)
function normalizeSupabaseKey(value: string | undefined, fallback: string) {
  const candidate = value?.trim();
  return candidate ? candidate : fallback;
}

export function getSupabaseUrl() {
  return normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, DEFAULT_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return normalizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey() {
  return normalizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY, DEFAULT_SUPABASE_SERVICE_ROLE_KEY);
}