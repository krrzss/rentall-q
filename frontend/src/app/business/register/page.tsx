'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function BusinessRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<
    'self_storage' | 'warehouse' | 'hostel' | 'parking' | 'equipment'
  >('self_storage');

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/businesses/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          businessName: businessName.trim(),
          businessType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.requiresEmailConfirmation) {
        setInfoMessage(
          `Account created for ${data.email}! Please check your email to confirm your address before signing in.`
        );
        setLoading(false);
        return;
      }

      // Session was created immediately (email confirmation disabled in Supabase)
      router.push('/business/login');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-xl shadow-stone-200/60 space-y-6">

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 font-serif">Create Business Account</h1>
              <p className="text-sm text-stone-500">Start managing your rental operations with RentallQ</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {infoMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {infoMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Owner"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@company.com"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-navy-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-bizname" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="reg-bizname"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Apex Self Storage"
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-biztype" className="block text-xs font-semibold text-navy-800 mb-1.5">
                    Business Type
                  </label>
                  <select
                    id="reg-biztype"
                    value={businessType}
                    onChange={(e: any) => setBusinessType(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="self_storage">Self Storage</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="hostel">Hostel / Co-living</option>
                    <option value="parking">Parking Lots</option>
                    <option value="equipment">Equipment Rental</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="business-register-submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
              >
                <span>{loading ? 'Creating account…' : 'Create Business Account'}</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            Already registered?{' '}
            <Link href="/business/login" className="font-semibold text-amber-700 hover:underline">
              Sign in to Business Portal →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
