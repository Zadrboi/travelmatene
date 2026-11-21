import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('placeholder') &&
    anonKey !== 'placeholder' &&
    anonKey.length > 10
  );

  const isDemoMode =
    process.env.DEMO_MODE === 'true' ||
    !isSupabaseConfigured ||
    request.cookies.get('travelmate_demo')?.value === 'true';

  let supabaseResponse = NextResponse.next({
    request,
  });

  let user = null;

  // Refresh auth cookies if Supabase is properly configured
  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(
        url!,
        anonKey!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch (err) {
      console.warn('[TravelMateNE Middleware] Session refresh notice:', err);
    }
  }

  // Protect /dashboard/:path*
  if (pathname.startsWith('/dashboard')) {
    // If not in demo mode and user is unauthenticated, redirect to login
    if (!isDemoMode && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - PWA assets: manifest.json, sw.js, offline.html, icons
     * - Static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
