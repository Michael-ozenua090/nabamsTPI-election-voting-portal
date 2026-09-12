import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function getSanitizedSupabaseUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  url = url.trim();

  if (!url) {
    console.error(
      '[Supabase Server] CRITICAL ERROR: Neither NEXT_PUBLIC_SUPABASE_URL nor SUPABASE_URL is defined in .env.local!'
    );
    throw new Error('Missing Supabase URL. Please check your .env.local file.');
  }

  // Ensure it has https:// protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export function getServiceRoleKey(): string {
  let key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  // 1. Strip whitespace and rogue quotes that copy/pasting might introduce
  key = key.trim().replace(/^["']|["']$/g, '');

  if (!key) {
    console.error(
      '[Supabase Server] CRITICAL ERROR: Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is defined in .env.local!'
    );
    throw new Error('Missing Supabase Key. Please check your .env.local file.');
  }

  // 2. Validate prefix and log
  const prefix = key.substring(0, 15);
  console.log(`[Supabase Auth] Using key prefix: ${prefix}...`);

  if (!key.startsWith('eyJ') && !key.startsWith('sb_')) {
    console.warn(
      "[Supabase Auth] WARNING: Your SUPABASE_SERVICE_ROLE_KEY does not appear to be a valid Supabase JWT key (it should start with 'eyJ'). Check your .env.local file."
    );
  }

  return key;
}

/**
 * Server-side Supabase client using the anon key + cookies.
 * Use this in Server Components and Route Handlers where you
 * want to respect RLS policies.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSanitizedSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client.
 * Bypasses ALL RLS policies.
 * ONLY use inside Server Actions and Route Handlers — NEVER in Client Components.
 */
export function createAdminSupabaseClient() {
  return createSupabaseClient(
    getSanitizedSupabaseUrl(),
    getServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
