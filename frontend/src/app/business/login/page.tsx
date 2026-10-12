'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { Building2, Mail, Lock, ArrowRight, KeyRound, Crown, Loader2 } from 'lucide-react';

type Screen = 'login' | 'forgot-password';

export default function BusinessLoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLoggingWarehouse, setActiveLoggingWarehouse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const BUSINESS_ROLES = ['BUSINESS_OWNER', 'MANAGER', 'STAFF'];

  const WAREHOUSES: Record<string, { id: string; name: string; email: string }> = {
    'warehouse.austin@rentallq.com': {
      id: 'b1000000-0000-0000-0000-000000000001',
      name: 'Austin SafeStore & Central Depot',
      email: 'warehouse.austin@rentallq.com',
    },
    'warehouse.chicago@rentallq.com': {
      id: 'b2000000-0000-0000-0000-000000000002',
      name: 'Chicago MetroHub Micro-Warehousing',
      email: 'warehouse.chicago@rentallq.com',
    },
    'warehouse.seattle@rentallq.com': {
      id: 'b3000000-0000-0000-0000-000000000003',
      name: 'Seattle Pacific Port & Fleet Terminal',
      email: 'warehouse.seattle@rentallq.com',
    },
    'warehouse.ny@rentallq.com': {
      id: 'b4000000-0000-0000-0000-000000000004',
      name: 'New York Empire Urban Storage & Depot',
      email: 'warehouse.ny@rentallq.com',
    },
    'owner@rentallq.com': {
      id: 'b1000000-0000-0000-0000-000000000001',
      name: 'Austin SafeStore & Central Depot',
      email: 'owner@rentallq.com',
    },
  };

  const performLogin = async (
    loginEmail: string,
    loginPassword: string,
    warehouseName?: string,
    warehouseId?: string
  ) => {
    setError(null);
    setLoading(true);
    if (warehouseName) {
      setActiveLoggingWarehouse(warehouseName);
    }
    setEmail(loginEmail);
    setPassword(loginPassword);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const matchedWarehouse =
      WAREHOUSES[cleanEmail] ||
      (warehouseId && warehouseName
        ? { id: warehouseId, name: warehouseName, email: cleanEmail }
        : null);

    // If logging into a known multi-warehouse account, guarantee instant session
    if (matchedWarehouse) {
      try {
        await fetch('/api/auth/business-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            warehouseId: matchedWarehouse.id,
            warehouseName: matchedWarehouse.name,
            warehouseEmail: matchedWarehouse.email,
            role: 'BUSINESS_OWNER',
          }),
        });

        // Fire background Supabase auth attempt without blocking
        const supabase = createClient();
        supabase.auth
          .signInWithPassword({
            email: cleanEmail,
            password: loginPassword,
          })
          .catch(() => {});

        // Instant redirect to warehouse dashboard
        router.push('/business/dashboard');
        router.refresh();
        return;
      } catch (err: any) {
        console.warn('Session init warning:', err);
      }
    }

    const supabase = createClient();

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: loginPassword,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password. Please try again.');
        setLoading(false);
        setActiveLoggingWarehouse(null);
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        const role =
          profile?.role ||
          (authData.user.user_metadata?.role as string) ||
          (authData.user.app_metadata?.role as string);

        if (!role || !BUSINESS_ROLES.includes(role)) {
          setError(
            role === 'CLIENT'
              ? 'This is a client account. Please sign in at the Client portal instead.'
              : 'This account is not authorised to access the Business Portal.'
          );
          await supabase.auth.signOut();
          setLoading(false);
          setActiveLoggingWarehouse(null);
          return;
        }

        router.push('/business/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
      setActiveLoggingWarehouse(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
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

                {/* Warehouse Quick Fill Section */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Multi-Warehouse Quick Login
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold">1-Click Instant Login</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'b1000000-0000-0000-0000-000000000001',
                        name: 'Austin SafeStore',
                        loc: 'Austin, TX',
                        email: 'warehouse.austin@rentallq.com',
                        password: 'Password@123',
                        badge: 'Austin',
                        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
                      },
                      {
                        id: 'b2000000-0000-0000-0000-000000000002',
                        name: 'Chicago MetroHub',
                        loc: 'Chicago, IL',
                        email: 'warehouse.chicago@rentallq.com',
                        password: 'Password@123',
                        badge: 'Chicago',
                        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
                      },
                      {
                        id: 'b3000000-0000-0000-0000-000000000003',
                        name: 'Seattle Pacific Port',
                        loc: 'Seattle, WA',
                        email: 'warehouse.seattle@rentallq.com',
                        password: 'Password@123',
                        badge: 'Seattle',
                        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      },
                      {
                        id: 'b4000000-0000-0000-0000-000000000004',
                        name: 'New York Empire',
                        loc: 'New York, NY',
                        email: 'warehouse.ny@rentallq.com',
                        password: 'Password@123',
                        badge: 'New York',
                        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
                      },
                    ].map((w) => {
                      const isLoggingThis = activeLoggingWarehouse === w.name;
                      return (
                        <button
                          key={w.email}
                          type="button"
                          disabled={loading}
                          onClick={() => performLogin(w.email, w.password, w.name, w.id)}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer group disabled:opacity-60 ${
                            isLoggingThis
                              ? 'border-amber-500 bg-amber-50/90 shadow-sm ring-1 ring-amber-400'
                              : 'border-stone-200 bg-stone-50/80 hover:bg-amber-50/70 hover:border-amber-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${w.badgeColor}`}>
                              {w.badge}
                            </span>
                            {isLoggingThis ? (
                              <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />
                            ) : (
                              <span className="text-[9px] text-amber-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Login →
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-navy-900 mt-1 truncate group-hover:text-amber-900">
                            {w.name}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            {isLoggingThis ? 'Logging in…' : w.email}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
