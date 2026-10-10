'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import {
  Users,
  Calendar,
  Home,
  DollarSign,
  AlertCircle,
  BrainCircuit,
  Check,
  X,
  TrendingUp,
  Crown,
  Briefcase,
  Wrench,
  PieChart as PieIcon,
  RefreshCw,
  UserPlus,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { createClient } from '@/server/lib/supabaseClient';
import { AIAgentCard } from '@/features/ai-advisor/components/AIAgentCard';
import { AIAgentOutput } from '@/app/api/ai-agents/route';
import { RevenueChart } from './RevenueChart';
import { RecentActivityFeed } from './RecentActivityFeed';
import { QuickActionsModal, ActionType } from './QuickActionsModal';
import { StaffManagementSection } from './StaffManagementSection';
import { BillingSubscriptionCard } from './BillingSubscriptionCard';
import { ReportsAccessWidget } from './ReportsAccessWidget';

export function DashboardOverview() {
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [userRole, setUserRole] = useState<'BUSINESS_OWNER' | 'MANAGER' | 'STAFF'>('BUSINESS_OWNER');
  const [recommendations, setRecommendations] = useState<AIAgentOutput[]>([]);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Quick Action Modal State
  const [activeModal, setActiveModal] = useState<ActionType>(null);

  // Animated Stat Values
  const [customersCount, setCustomersCount] = useState(0);
  const [activeRentalsCount, setActiveRentalsCount] = useState(0);
  const [availableUnitsCount, setAvailableUnitsCount] = useState(0);
  const [revenueCount, setRevenueCount] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  // Fetch AI Agent Recommendations from API
  const fetchAIRecommendations = async () => {
    try {
      const res = await fetch('/api/ai-agents');
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to load AI agent telemetry', err);
    }
  };

  // Count-up animation logic on mount
  useEffect(() => {
    const supabase = createClient();
    setMounted(true);
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          setUserName(name);

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role) {
            setUserRole(profile.role as any);
          }
        } else {
          // No authenticated session — middleware prevents reaching here,
          // but if it happens leave defaults in place.
        }
      } catch (err) {
        console.error('Error fetching user info', err);
      }
    }

    loadUserData();
    fetchAIRecommendations();

    // Trigger Count-Up Intervals
    const duration = shouldReduceMotion ? 100 : 1200;
    const steps = 30;
    const intervalTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCustomersCount(Math.round(progress * 248));
      setActiveRentalsCount(Math.round(progress * 184));
      setAvailableUnitsCount(Math.round(progress * 32));
      setRevenueCount(Math.round(progress * 42850));
      setOccupancyRate(Math.round(progress * 85));
      setPendingPaymentsCount(Math.round(progress * 14));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  // Handle Toast Notification
  const triggerNotification = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  // Handle Recommendation Apply
  const handleApply = (id: string, title: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    triggerNotification(`Applied AI recommendation: "${title}" successfully.`);
  };

  // Handle Recommendation Dismiss
  const handleDismiss = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  // Donut Chart Data for Occupancy
  const occupancyChartData = [
    { name: 'Occupied', value: occupancyRate },
    { name: 'Available', value: 100 - occupancyRate },
  ];

  const donutColors = ['#16261E', '#E8E4D5'];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.4, ease: 'easeOut' },
    },
  };

  const getRoleHeaderInfo = () => {
    switch (userRole) {
      case 'BUSINESS_OWNER':
        return {
          badge: 'Business Owner Portal',
          icon: Crown,
          desc: 'Full operational control, financial telemetry, AI decision support & staff management.',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'MANAGER':
        return {
          badge: 'Manager Portal',
          icon: Briefcase,
          desc: 'Operational management across bookings, team seats, payments & reports.',
          badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'STAFF':
        return {
          badge: 'Staff Operational Panel',
          icon: Wrench,
          desc: 'Simplified operational view for quick booking entries and payment updates.',
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      default:
        return {
          badge: 'Business Panel',
          icon: Crown,
          desc: 'Operational overview.',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        };
    }
  };

  const headerInfo = getRoleHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="space-y-8 text-navy-900 font-sans antialiased pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${headerInfo.badgeColor}`}>
              <HeaderIcon className="h-3.5 w-3.5" />
              {headerInfo.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 font-serif">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {headerInfo.desc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-cream-50 text-xs font-semibold text-navy-900 hover:bg-cream-100 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS SHORTCUT BAR */}
      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4.5 w-4.5 text-amber-700" />
            <h2 className="text-sm font-bold text-navy-900 font-serif">Quick Actions Shortcuts</h2>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">1-Click Data Entry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveModal('CUSTOMER')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-navy-50 text-navy-800">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-navy-900">+ Add Customer</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-700" />
          </button>

          <button
            onClick={() => setActiveModal('UNIT')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-navy-900">+ Add Rental Unit</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-700" />
          </button>

          <button
            onClick={() => setActiveModal('BOOKING')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-navy-900">+ New Booking</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Applied Notification Toast */}
      <AnimatePresence>
        {appliedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{appliedNotification}</span>
            </div>
            <button onClick={() => setAppliedNotification(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: TOP ROW — ROLE-AWARE ANIMATED STAT CARDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5"
      >
        {/* Card 1: Total Customers */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Clients</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-navy-900 font-serif">{customersCount}</div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12 this month</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Active Rentals */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Active Rentals</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-navy-900 font-serif">{activeRentalsCount}</div>
            <div className="text-[11px] font-medium text-stone-500 mt-1">Leased units &amp; bays</div>
          </div>
        </motion.div>

        {/* Card 3: Available Units */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Available Units</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Home className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-navy-900 font-serif">{availableUnitsCount}</div>
            <div className="text-[11px] font-medium text-emerald-700 mt-1">Ready for lease</div>
          </div>
        </motion.div>

        {/* Card 4: Monthly Revenue */}
        {userRole !== 'STAFF' && (
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Monthly Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold text-navy-900 font-serif">
                ₹{revenueCount.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-1">+9.4% vs last month</div>
            </div>
          </motion.div>
        )}

        {/* Card 5: Occupancy Rate */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Occupancy Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <PieIcon className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              <div className="text-3xl font-bold text-navy-900 font-serif">{occupancyRate}%</div>
              <div className="text-[11px] font-medium text-stone-500">Portfolio average</div>
            </div>

            {/* Recharts Donut Ring */}
            <div className="h-14 w-14 relative flex-shrink-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={26}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      isAnimationActive={!shouldReduceMotion}
                    >
                      {occupancyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>

        {/* Card 6: Pending Payments */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Pending Payments</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-rose-900 font-serif">{pendingPaymentsCount}</div>
            <div className="text-[11px] font-bold text-rose-700 mt-1">14 Overdue &bull; Action Required</div>
          </div>
        </motion.div>
      </motion.div>

      {/* SECTION 2: AI RECOMMENDATIONS PANEL */}
      {userRole !== 'STAFF' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-amber-400">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-navy-900 font-serif">
                  AI Business Advisor Recommendations
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Autonomous decision insights powered by Customer Intelligence, Pricing, Occupancy, &amp; Risk agents.
              </p>
            </div>

            <Link
              href="/business/ai-recommendations"
              className="text-xs font-bold text-navy-900 bg-cream-200 hover:bg-amber-100 hover:text-amber-900 px-3.5 py-1.5 rounded-full transition"
            >
              View Full AI Advisor Feed &rarr;
            </Link>
          </div>

          {/* 3-4 Recommendation Cards Grid using AIAgentCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {recommendations.slice(0, 4).map((rec) => (
                <AIAgentCard
                  key={rec.id}
                  recommendation={rec}
                  onApply={handleApply}
                  onDismiss={handleDismiss}
                />
              ))}
            </AnimatePresence>

            {recommendations.length === 0 && (
              <div className="col-span-full rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 font-serif">All Recommendations Addressed!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Great job! Your business operations and unit pricing are fully optimized for this week.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: REVENUE FINANCIAL CHART */}
      <RevenueChart />

      {/* SECTION 4: RECENT ACTIVITY AUDIT FEED */}
      <RecentActivityFeed />

      {/* SECTION 5: STAFF & MANAGER MANAGEMENT */}
      {userRole === 'BUSINESS_OWNER' && (
        <StaffManagementSection onNotify={triggerNotification} />
      )}

      {/* SECTION 6: EXPORTABLE REPORTS ACCESS */}
      <ReportsAccessWidget onNotify={triggerNotification} />

      {/* SECTION 7: OWNER-ONLY BILLING & SUBSCRIPTION */}
      {userRole === 'BUSINESS_OWNER' && (
        <BillingSubscriptionCard onNotify={triggerNotification} />
      )}

      {/* QUICK ACTIONS MODAL DIALOG */}
      <QuickActionsModal
        actionType={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={triggerNotification}
      />
    </div>
  );
}
