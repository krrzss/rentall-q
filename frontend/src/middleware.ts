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
  const demoCookie = request.cookies.get('rentallq_demo_session')?.value;
  const isAuthenticated = Boolean(user || demoCookie);

  // Check public routes that do NOT require auth protection
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/business/login') ||
    pathname.startsWith('/business/register') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/companies') ||
    pathname.startsWith('/api/');

  // Protected route definitions
  const isBusinessRoute = pathname.startsWith('/business') && !isPublicRoute;
  const isAdminRoute = pathname.startsWith('/admin/dashboard');
  const isClientRoute =
    (pathname.startsWith('/dashboard') || pathname.startsWith('/my-payments') || pathname.startsWith('/request')) &&
    !isPublicRoute;

  // Unauthenticated user protection
  if (!isAuthenticated && (isBusinessRoute || isAdminRoute || isClientRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = isBusinessRoute ? '/business/login' : '/login';
    return NextResponse.redirect(url);
  }

  // Role-based protection for authenticated/demo users
  if (isAuthenticated) {
    let role = 'BUSINESS_OWNER';

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      role = profile?.role || 'BUSINESS_OWNER';
    } else if (demoCookie) {
      role = demoCookie;
    }

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
