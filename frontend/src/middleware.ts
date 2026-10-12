import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    pathname.startsWith('/business/login') ||
    pathname.startsWith('/business/register') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/auth/business-session') ||
    // business register API is called from the public register page
    pathname === '/api/businesses/register';

  // Protected route definitions
  const isBusinessRoute = pathname.startsWith('/business') && !isPublicRoute;
  const isAdminRoute = pathname.startsWith('/admin/dashboard');
  const isClientRoute =
    (pathname.startsWith('/dashboard') ||
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

  // Unauthenticated user protection — no session = redirect to login or 401 for API
  if (!user && !hasBusinessSession && isBusinessRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/business/login';
    return NextResponse.redirect(url);
  }

  if (!user && (isAdminRoute || isClientRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminRoute ? '/admin/login' : '/login';
    return NextResponse.redirect(url);
  }

  if (!user && !hasBusinessSession && pathname.startsWith('/api/') && !isPublicRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role-based protection for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role ?? null;

    // 1. Admin route protection
    if (isAdminRoute && role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'CLIENT' ? '/dashboard' : '/business/dashboard';
      return NextResponse.redirect(url);
    }

    // 2. Client role attempting to access business portal
    if (isBusinessRoute && role === 'CLIENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 3. Staff role restrictions (No reports, settings, billing)
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

    // 4. Manager role restrictions (No billing / subscription settings)
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
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
