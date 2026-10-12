'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { Building2, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';

type Screen = 'login' | 'forgot-password';

function ClientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Surface any errors returned from the OAuth callback
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'business_account') {
      setError('This account belongs to a business. Please sign in at the Business Portal instead.');
    } else if (urlError === 'auth_failed') {
      setError('Failed to sign in with Google. Please try again.');
    } else if (urlError === 'access_denied') {
      setError('Google sign-in was cancelled.');
    } else if (urlError) {
      setError('An error occurred during authentication. Please try again.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    const supabase = createClient();

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profile?.role !== 'CLIENT') {
          setError(
            profile?.role === 'BUSINESS_OWNER' || profile?.role === 'MANAGER' || profile?.role === 'STAFF'
              ? 'This account belongs to a business. Please sign in at the Business Portal instead.'
              : 'This account is not authorised to access the Client portal.'
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const cleanEmail = email.trim().toLowerCase();

    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      setSuccessMessage('Password reset instructions sent! Check your inbox.');
    } catch {
      setSuccessMessage('If that email exists, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      {/* Top Bar */}
      <header className="w-full border-b border-stone-200/70 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="h-4.5 w-4.5 text-amber-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-navy-900 font-serif">
              RentallQ
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-navy-900 transition-colors"
          >
            ← Back to Website
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-xl shadow-stone-200/60 space-y-6">

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100">
                <Lock className="h-5 w-5 text-sky-600" />
              </div>
              {screen === 'login' ? (
                <>
                  <h1 className="text-2xl font-bold text-navy-900 font-serif">Welcome back</h1>
                  <p className="text-sm text-stone-500">Sign in to manage your rentals and bookings</p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-navy-900 font-serif">Reset Password</h1>
                  <p className="text-sm text-stone-500">Enter your email to receive reset instructions</p>
                </>
              )}
            </div>

            {/* Status messages */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {/* Login Screen with Google OAuth and Email */}
            {screen === 'login' && (
              <div className="space-y-5">
                {/* Sign in with Google Button */}
                <button
                  type="button"
                  id="client-google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white py-2.5 px-4 text-sm font-semibold text-navy-900 shadow-xs hover:bg-stone-50 hover:border-stone-400 active:scale-[0.99] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {googleLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-navy-900" />
                  ) : (
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{googleLoading ? 'Signing in with Google…' : 'Sign in with Google'}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-stone-200" />
                  <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Or continue with email
                  </span>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="client-email" className="block text-xs font-semibold text-navy-800 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        id="client-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="client-password" className="block text-xs font-semibold text-navy-800">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setError(null); setSuccessMessage(null); setScreen('forgot-password'); }}
                        className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        id="client-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="client-login-submit"
                    disabled={loading || googleLoading}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                    <ArrowRight className="h-4 w-4 text-amber-400" />
                  </button>
                </form>
              </div>
            )}

            {/* Forgot Password Form */}
            {screen === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-800 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Sending…' : 'Send Reset Link'}</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </button>

                <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-3">
                  Remembered it?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMessage(null); setScreen('login'); }}
                    className="font-bold text-navy-900 hover:underline cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer hint */}
          <p className="mt-6 text-center text-xs text-stone-500">
            Are you a business owner?{' '}
            <Link href="/business/login" className="font-semibold text-amber-700 hover:underline">
              Sign in to the Business Portal →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-900" />
        </div>
      }
    >
      <ClientLoginContent />
    </Suspense>
  );
}
