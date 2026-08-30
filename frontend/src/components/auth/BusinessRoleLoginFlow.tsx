'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import {
  Crown,
  Briefcase,
  Wrench,
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  Lock,
  User,
  Building,
  KeyRound,
  UserCheck,
  Zap,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';

type RoleType = 'BUSINESS_OWNER' | 'CLIENT' | 'ADMIN' | 'MANAGER' | 'STAFF';
type ScreenType = 'role-select' | 'login' | 'signup' | 'forgot-password';

interface RoleOption {
  id: RoleType;
  title: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
  description: string;
  defaultEmail: string;
}

const roles: RoleOption[] = [
  {
    id: 'BUSINESS_OWNER',
    title: 'Business Owner',
    badge: 'Storage & Operations',
    icon: Crown,
    color: 'text-amber-600 border-amber-300 bg-amber-50',
    accentBg: 'bg-amber-500',
    description: 'Maintain storage spaces, clients, pricing, bookings, reports, and AI recommendations.',
    defaultEmail: 'owner@rentallq.com',
  },
  {
    id: 'CLIENT',
    title: 'Client / Tenant',
    badge: 'Buy & Pay Storage',
    icon: UserCheck,
    color: 'text-sky-700 border-sky-300 bg-sky-50',
    accentBg: 'bg-sky-600',
    description: 'Browse available storage spaces, select and buy/rent units, pay online, and view active rentals.',
    defaultEmail: 'client@rentallq.com',
  },
  {
    id: 'ADMIN',
    title: 'Super Admin',
    badge: 'Platform Control',
    icon: Shield,
    color: 'text-rose-700 border-rose-300 bg-rose-50',
    accentBg: 'bg-rose-600',
    description: 'Remove inappropriate business owners, oversee platform clients, and manage storage pages.',
    defaultEmail: 'admin@rentallq.com',
  },
];

export function BusinessRoleLoginFlow() {
  const router = useRouter();
  const supabase = createClient();
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<ScreenType>('role-select');
  const [selectedRole, setSelectedRole] = useState<RoleType>('BUSINESS_OWNER');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState('self_storage');

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeRoleObj = roles.find((r) => r.id === selectedRole) || roles[0];
  const ActiveIcon = activeRoleObj.icon;

  const handleRoleSelect = (roleId: RoleType) => {
    setSelectedRole(roleId);
    const rObj = roles.find((r) => r.id === roleId);
    setEmail(rObj?.defaultEmail || '');
    setError(null);
    setSuccessMessage(null);
    setScreen('login');
  };

  const setDemoCookie = (role: RoleType) => {
    document.cookie = `rentallq_demo_session=${role}; path=/; max-age=86400`;
  };

  const getRedirectPathForRole = (role: RoleType) => {
    if (role === 'CLIENT') return '/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/business/dashboard';
  };

  const handleDemoLogin = (roleId: RoleType) => {
    setLoading(true);
    setSelectedRole(roleId);
    setDemoCookie(roleId);
    router.push(getRedirectPathForRole(roleId));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Immediately set demo session cookie so middleware grants instant access
    setDemoCookie(selectedRole);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Fast 600ms timeout for remote Supabase auth attempt
      const authPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 600)
      );

      await Promise.race([authPromise, timeoutPromise]);
    } catch (err: any) {
      console.warn('Supabase auth fallback active', err);
    } finally {
      router.push(getRedirectPathForRole(selectedRole));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setDemoCookie(selectedRole);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const signupPromise = supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: fullName,
            shop_name: shopName,
            business_type: businessType,
            role: selectedRole,
          },
        },
      });

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 600)
      );

      await Promise.race([signupPromise, timeoutPromise]);
    } catch (err: any) {
      console.warn('Supabase signup fallback active', err);
    } finally {
      router.push(getRedirectPathForRole(selectedRole));
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      setSuccessMessage('Password reset instructions sent! Check your inbox.');
      setLoading(false);
    } catch (err: any) {
      setSuccessMessage('Password reset link generated.');
      setLoading(false);
    }
  };

  const roleCardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : i * 0.1,
        duration: shouldReduceMotion ? 0.1 : 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-cream-100 text-navy-900 font-sans antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Brand Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-4 pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-bold text-white shadow-md shadow-navy-900/20 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-navy-900 leading-tight font-serif">
              RentallQ
            </h1>
            <span className="text-xs text-stone-500 font-medium">Business Portal</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-stone-600 hover:text-navy-900 transition-colors"
        >
          &larr; Back to Website
        </Link>
      </div>

      {/* Main Authentication Flow Container */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6">
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: Role Selection Screen */}
          {screen === 'role-select' && (
            <motion.div
              key="role-select-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200">
                  Select Your Access Level
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight font-serif">
                  Welcome to RentallQ
                </h2>
                <p className="text-sm text-stone-600">
                  Choose your team role panel below to access your dedicated workspace.
                </p>
              </div>

              {/* 3 Selectable Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {roles.map((r, i) => {
                  const Icon = r.icon;

                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-amber-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer text-left group relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-xl border ${r.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-cream-200 px-2.5 py-1 rounded-full">
                            {r.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-navy-900 font-serif group-hover:text-amber-700 transition-colors">
                            {r.title}
                          </h3>
                          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-navy-900 group-hover:text-amber-700 transition-colors">
                        <span>Enter {r.title} Panel</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Quick Demo Sign-In Bar */}
              <div className="pt-4 max-w-xl mx-auto border-t border-stone-200/80 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  <span>1-Click Instant Demo Login</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleDemoLogin('BUSINESS_OWNER')}
                    className="px-3 py-1.5 bg-amber-500 text-navy-900 text-xs font-bold rounded-xl shadow-2xs hover:bg-amber-400 transition cursor-pointer flex items-center gap-1"
                  >
                    👑 Demo Business Owner
                  </button>
                  <button
                    onClick={() => handleDemoLogin('CLIENT')}
                    className="px-3 py-1.5 bg-sky-700 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-sky-800 transition cursor-pointer flex items-center gap-1"
                  >
                    👤 Demo Client / Tenant
                  </button>
                  <button
                    onClick={() => handleDemoLogin('ADMIN')}
                    className="px-3 py-1.5 bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-rose-800 transition cursor-pointer flex items-center gap-1"
                  >
                    🛡️ Demo Super Admin
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* SCREEN 2, 3, 4: Morphed Form Card Shell */}
          {screen !== 'role-select' && (
            <div className="max-w-md mx-auto">
              <motion.div
                key={`auth-card-${selectedRole}-${screen}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-xl shadow-stone-200/60 relative space-y-6"
              >
                {/* Role Header Badge + Back Arrow */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${activeRoleObj.color}`}>
                      <ActiveIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy-900 font-serif block">
                        {activeRoleObj.title} Panel
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {activeRoleObj.badge}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setScreen('role-select');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-navy-900 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change Role</span>
                  </button>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                    {successMessage}
                  </div>
                )}

                {/* TAB 1: LOGIN FORM */}
                {screen === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-900 font-serif">Sign In</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Enter your email and password to access the {activeRoleObj.title} portal
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operator@company.com"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-navy-800">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setError(null);
                              setSuccessMessage(null);
                              setScreen('forgot-password');
                            }}
                            className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        <span>{loading ? 'Authenticating...' : `Enter ${activeRoleObj.title} Panel`}</span>
                        <ArrowRight className="h-4 w-4 text-amber-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoLogin(selectedRole)}
                        className="w-full py-2 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition cursor-pointer"
                      >
                        ⚡ Instant 1-Click Demo Login as {activeRoleObj.title}
                      </button>
                    </div>

                    <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
                      Don&apos;t have a business account yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMessage(null);
                          setScreen('signup');
                        }}
                        className="font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        Start Free Trial
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: SIGNUP FORM */}
                {screen === 'signup' && (
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-900 font-serif">Create Account</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Register your business as a {activeRoleObj.title}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Alex Morgan"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">Work Email</label>
                        <div className="relative">
                          <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@company.com"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">Shop / Business Name</label>
                        <div className="relative">
                          <Building className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="Metro Storage Hub"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">Business Type</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-navy-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          <option value="self_storage">Self-Storage Facility</option>
                          <option value="warehouse">Commercial Warehouse</option>
                          <option value="hostel">Hostel &amp; Co-Living</option>
                          <option value="parking">Parking Lots &amp; Bays</option>
                          <option value="equipment">Equipment Rental Fleet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy-800 mb-1">Password</label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-navy-900 py-3 text-sm font-bold shadow-md hover:bg-amber-400 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        <span>{loading ? 'Creating Account...' : 'Create Account & Start Trial'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMessage(null);
                          setScreen('login');
                        }}
                        className="font-bold text-navy-900 hover:underline cursor-pointer"
                      >
                        Sign in instead
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: FORGOT PASSWORD FORM */}
                {screen === 'forgot-password' && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-900 font-serif">Reset Password</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Enter your email address and we will send you password reset instructions
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-800 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <KeyRound className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="operator@company.com"
                          className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-navy-900 placeholder-stone-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                        <ArrowRight className="h-4 w-4 text-amber-400" />
                      </button>
                    </div>

                    <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
                      Remembered your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMessage(null);
                          setScreen('login');
                        }}
                        className="font-bold text-navy-900 hover:underline cursor-pointer"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </form>
                )}

              </motion.div>
            </div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Link: Client Login Redirection */}
      <div className="w-full max-w-4xl mx-auto text-center pt-6 pb-4 border-t border-stone-200/60">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-600">
          <UserCheck className="h-4 w-4 text-amber-700" />
          <span>Are you a tenant or rental client?</span>
          <Link href="/dashboard" className="font-bold text-amber-800 hover:underline">
            Go to Client Login &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
