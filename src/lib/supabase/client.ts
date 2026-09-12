import { createBrowserClient } from '@supabase/ssr';

export function getSanitizedClientSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  url = url.trim();

  if (!url) {
    console.error(
      '[Supabase Client] CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined!'
    );
    return ''; // Client might gracefully fail or user can see errors
  }

  // Ensure it has https:// protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

/** Browser-side Supabase client (uses anon key only) */
export function createClient() {
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  return createBrowserClient(getSanitizedClientSupabaseUrl(), supabaseAnonKey);
}
