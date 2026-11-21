import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Checks whether Supabase environment variables are properly configured.
 * Guarantees that TravelMateNE never crashes with an unhandled exception in local demo mode.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('placeholder') &&
    anonKey !== 'placeholder' &&
    anonKey.length > 10
  );
}

/**
 * Creates a server-side Supabase client using cookie store from next/headers.
 * In local demo mode with missing credentials, returns a resilient fallback client.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : 'https://demo-placeholder.supabase.co';
  const anonKey = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Can be safely ignored when middleware handles session refresh.
        }
      },
    },
  });
}
