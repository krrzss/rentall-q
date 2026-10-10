'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { Building2, Mail, Lock, ArrowRight, KeyRound, Crown } from 'lucide-react';

type Screen = 'login' | 'forgot-password';

export default function BusinessLoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const BUSINESS_ROLES = ['BUSINESS_OWNER', 'MANAGER', 'STAFF'];

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

        if (!profile || !BUSINESS_ROLES.includes(profile.role)) {
          setError(
            profile?.role === 'CLIENT'
              ? 'This is a client account. Please sign in at the Client portal instead.'
              : 'This account is not authorised to access the Business Portal.'
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.push('/business/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
        redirectTo: `${window.location.origin}/business/login`,
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
            <div>
              <span className="text-lg font-bold tracking-tight text-navy-900 font-serif block leading-tight">
                RentallQ
              </span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Business Portal</span>
            </div>
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
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              {screen === 'login' ? (
                <>
                  <h1 className="text-2xl font-bold text-navy-900 font-serif">Business Portal</h1>
                  <p className="text-sm text-stone-500">Sign in to manage your storage operations</p>
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

            {/* Login Form */}
            {screen === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="business-email" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Business email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="business-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@yourbusiness.com"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="business-password" className="block text-xs font-semibold text-navy-800">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setError(null); setSuccessMessage(null); setScreen('forgot-password'); }}
                      className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="business-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="business-login-submit"
                  disabled={loading}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Signing in…' : 'Sign In to Business Portal'}</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </button>

                <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-3">
                  Don&apos;t have a business account?{' '}
                  <Link
                    href="/business/register"
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {screen === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="business-reset-email" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Business email
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="business-reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@yourbusiness.com"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
            Are you a customer or tenant?{' '}
            <Link href="/login" className="font-semibold text-sky-700 hover:underline">
              Sign in to Client Portal →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
