import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set(
      'error',
      error === 'access_denied' ? 'access_denied' : 'auth_failed'
    );
    return NextResponse.redirect(redirectUrl);
  }

  let next = requestUrl.searchParams.get('next') ?? '/dashboard';
  // Avoid open redirect vulnerabilities: ensure next is relative
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard';
  }

  if (code) {
    let response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Verify role to ensure business/admin users don't access client portal through client login
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role && profile.role !== 'CLIENT') {
          // Account belongs to a business or admin
          await supabase.auth.signOut();
          const errRedirect = new URL('/login?error=business_account', requestUrl.origin);
          const errResponse = NextResponse.redirect(errRedirect);
          // Expire all session cookies on the error response
          response.cookies.getAll().forEach((c) => {
            errResponse.cookies.set(c.name, '', { maxAge: 0, path: '/' });
          });
          return errResponse;
        }

        // If no profile was found (e.g. database trigger didn't fire), attempt to create client profile
        if (!profile) {
          try {
            await supabase.from('profiles').insert({
              id: user.id,
              name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'Client',
              role: 'CLIENT',
            });
          } catch {
            // Ignored if handled by database trigger or RLS
          }
        }
      }

      return response;
    } else {
      console.error('Code exchange error:', exchangeError);
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
}
