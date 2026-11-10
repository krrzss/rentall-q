import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check public routes that do NOT require auth protection
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/storage-spaces') ||
    pathname.startsWith('/business/login') ||
    pathname.startsWith('/business/register') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/auth/business-session') ||
    pathname === '/api/businesses/register';

  // Protected route definitions
  const isBusinessRoute = pathname.startsWith('/business') && !isPublicRoute;
  const isAdminRoute = pathname.startsWith('/admin/dashboard');
  const isClientRoute =
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/my-bookings') ||
      pathname.startsWith('/ai-space-advisor') ||
      pathname.startsWith('/storage-spaces') ||
      pathname.startsWith('/my-payments') ||
      pathname.startsWith('/request')) &&
    !isPublicRoute;

  // Check for business session cookies
  const demoCookie = request.cookies.get('rentallq_demo_session')?.value;
  const warehouseCookie = request.cookies.get('rentallq_active_warehouse')?.value;
  const hasBusinessSession = Boolean(
    warehouseCookie || (demoCookie && ['BUSINESS_OWNER', 'MANAGER', 'STAFF'].includes(demoCookie))
  );

  // 1. BUSINESS PORTAL ISOLATION:
  // Business routes (/business/*) must NEVER redirect to the client portal (/dashboard).
  if (isBusinessRoute) {
    // A. Active multi-warehouse business session cookie -> allow immediately
    if (hasBusinessSession) {
      return supabaseResponse;
    }

    // B. Check if Supabase authenticated user has a business role
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role ?? null;
      if (role && ['BUSINESS_OWNER', 'MANAGER', 'STAFF'].includes(role)) {
        // Staff role restrictions (No reports, settings, billing)
        if (role === 'STAFF') {
          if (
            pathname.startsWith('/business/reports') ||
            pathname.startsWith('/business/settings') ||
            pathname.startsWith('/business/billing')
          ) {
            const url = request.nextUrl.clone();
            url.pathname = '/business/dashboard';
            return NextResponse.redirect(url);
          }
        }

        // Manager role restrictions (No billing / subscription settings)
        if (role === 'MANAGER') {
          if (
            pathname.startsWith('/business/settings') ||
            pathname.startsWith('/business/billing')
          ) {
            const url = request.nextUrl.clone();
            url.pathname = '/business/dashboard';
            return NextResponse.redirect(url);
          }
        }

        return supabaseResponse;
      }
    }

    // C. Not authenticated for business -> redirect to /business/login (NEVER /dashboard!)
    const url = request.nextUrl.clone();
    url.pathname = '/business/login';
    return NextResponse.redirect(url);
  }

  // 2. ADMIN PORTAL ISOLATION:
  // Admin dashboard routes (/admin/dashboard/*) must only be accessible to Admins
  if (isAdminRoute) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role ?? null;
      const isAdminUser =
        role === 'ADMIN' ||
        user.email?.toLowerCase().includes('admin') ||
        user.user_metadata?.role === 'ADMIN';

      if (isAdminUser) {
        return supabaseResponse;
      }
    }

    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // 3. CLIENT PORTAL ISOLATION:
  // Client routes require an authenticated user or active tenant demo session
  const hasClientSession = Boolean(user || demoCookie === 'CLIENT');
  if (isClientRoute) {
    if (!hasClientSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 4. API Route protection
  if (!user && !hasBusinessSession && pathname.startsWith('/api/') && !isPublicRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
