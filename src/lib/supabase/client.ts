import { createBrowserClient } from '@supabase/ssr';

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
 * Creates a browser-side Supabase client.
 * Returns a configured client or safe fallback client to ensure zero startup exceptions.
 */
export function createClient() {
  const url = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : 'https://demo-placeholder.supabase.co';
  const anonKey = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  return createBrowserClient(url, anonKey);
}
