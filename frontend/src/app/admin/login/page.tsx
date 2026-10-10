'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profile?.role !== 'ADMIN') {
          setError('Access restricted to Platform Administrators only.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4 font-sans text-navy-900">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-amber-400 shadow-sm">
              <Shield className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              Platform Admin
            </h1>
            <p className="text-xs text-stone-500">
              System management &amp; multi-tenant administration
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Admin email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rentallq.com"
                  className="w-full rounded-xl border border-stone-300 bg-cream-50/60 pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-300 bg-cream-50/60 pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating…' : 'Sign In to Admin Console'}</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
          </form>

          <p className="text-center text-[11px] text-stone-500">
            Admin accounts are provisioned internally. Contact the platform team if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
