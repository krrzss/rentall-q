'use client';

import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  Building2,
  Package,
  Warehouse,
  BedDouble,
  Car,
  HardHat,
  CheckCircle2,
  ArrowRight,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const COMPANIES = [
  {
    slug: 'storesafe-holdings',
    name: 'StoreSafe Holdings',
    type: 'Self Storage',
    icon: Package,
    accent: 'amber',
    tagline: 'Multi-location storage management',
    units: '240 units',
  },
  {
    slug: 'metroware-logistics',
    name: 'MetroWare Logistics',
    type: 'Warehouse',
    icon: Warehouse,
    accent: 'sky',
    tagline: 'Commercial bay & zone allocations',
    units: '18 bays',
  },
  {
    slug: 'colive-spaces',
    name: 'CoLive Spaces',
    type: 'Hostel',
    icon: BedDouble,
    accent: 'violet',
    tagline: 'Co-living & bed booking platform',
    units: '80 beds',
  },
  {
    slug: 'parkease-networks',
    name: 'ParkEase Networks',
    type: 'Parking',
    icon: Car,
    accent: 'emerald',
    tagline: 'Reserved spot & permit renewals',
    units: '320 spots',
  },
  {
    slug: 'techrig-equipment',
    name: 'TechRig Equipment',
    type: 'Equipment',
    icon: HardHat,
    accent: 'rose',
    tagline: 'Tool & machinery rental tracking',
    units: '95 assets',
  },
  {
    slug: 'vaultbox-urban',
    name: 'VaultBox Urban',
    type: 'Self Storage',
    icon: Package,
    accent: 'amber',
    tagline: 'Urban micro-storage network',
    units: '180 units',
  },
];

const ACCENT_STYLES: Record<string, { pill: string; icon: string; glow: string }> = {
  amber: {
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    glow: 'group-hover:border-amber-300',
  },
  sky: {
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: 'bg-sky-100 text-sky-700',
    glow: 'group-hover:border-sky-300',
  },
  violet: {
    pill: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: 'bg-violet-100 text-violet-700',
    glow: 'group-hover:border-violet-300',
  },
  emerald: {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700',
    glow: 'group-hover:border-emerald-300',
  },
  rose: {
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: 'bg-rose-100 text-rose-700',
    glow: 'group-hover:border-rose-300',
  },
};

const TRUST_BADGES = [
  { icon: Globe, label: 'Multi-industry', sub: 'All rental verticals supported' },
  { icon: Shield, label: 'Secure & Isolated', sub: 'Full RLS data isolation per company' },
  { icon: Zap, label: 'Instant Onboarding', sub: 'Get running in under 5 minutes' },
];

export function CompaniesSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28, scale: shouldReduceMotion ? 1 : 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.45, ease: 'easeOut' },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="companies"
      className="py-20 sm:py-28 bg-white border-b border-stone-200/60 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5" />
            Companies Associated
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight font-serif leading-tight">
            Businesses Already Running<br className="hidden sm:block" /> on RentallQ
          </h2>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            From self-storage operators to equipment rental companies, RentallQ powers
            diverse rental businesses with one unified platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {COMPANIES.map((company) => {
            const Icon = company.icon;
            const accent = ACCENT_STYLES[company.accent] ?? ACCENT_STYLES.amber;
            return (
              <motion.div
                key={company.name}
                variants={cardVariants}
              >
                <Link
                  href={`/companies/${company.slug}`}
                  className={`group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer no-underline ${accent.glow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.icon} transition-colors`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${accent.pill}`}>
                      {company.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 font-serif group-hover:text-amber-700 transition-colors mb-1">
                    {company.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">{company.tagline}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-semibold text-emerald-600">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-0.5 rounded-full">
                        {company.units}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14"
        >
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                variants={cardVariants}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-cream-50 px-6 py-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">{badge.label}</p>
                  <p className="text-xs text-stone-500">{badge.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-10 text-center text-white shadow-xl"
        >
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative space-y-4 max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Join the Platform
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif leading-snug">
              Ready to Bring Your Business to RentallQ?
            </h3>
            <p className="text-sm text-navy-300 leading-relaxed">
              Register your company today and get your rental operations centralised,
              automated, and AI-advised from day one.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/business/register"
                className="inline-flex items-center gap-2 bg-amber-500 text-navy-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-md"
              >
                Register Your Company
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business/login"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
