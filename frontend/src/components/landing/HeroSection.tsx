'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion, Variants } from 'framer-motion';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeroSectionProps {
  onOpenTrialModal: () => void;
}

export function HeroSection({ onOpenTrialModal }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Slow parallax on the hero dashboard preview (disabled if prefers-reduced-motion)
  const yParallaxTransform = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yParallax = shouldReduceMotion ? 0 : yParallaxTransform;

  // Dynamic parallax and scale for the background image
  const bgScaleTransform = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const bgYTransform = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const bgScale = shouldReduceMotion ? 1 : bgScaleTransform;
  const bgY = shouldReduceMotion ? 0 : bgYTransform;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-cream-100 pt-12 sm:pt-16 lg:pt-24 pb-20 sm:pb-24 lg:pb-32 border-b border-stone-200/60"
    >
      {/* Dynamic Realistic Background Image Layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ y: bgY, scale: bgScale }}
      >
        <img
          src="/storage-bg.jpg"
          alt="RentallQ Self Storage Operations Facility"
          className="w-full h-full object-cover object-center select-none filter brightness-[0.80] contrast-[1.14] saturate-[1.05]"
        />
        {/* Subtle Dark Ambient Tint to make the image slightly darker and clearer */}
        <div className="absolute inset-0 bg-navy-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-100/60 via-transparent to-black/25" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-start">
          
          {/* Left Column — Staggered Fade-Up Text with Frosted Glass Backdrop for crisp readability */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 text-left bg-cream-50 p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md"
          >
            <motion.p variants={itemVariants} className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
              SMART RENTAL OPERATIONS &amp; DECISION INTELLIGENCE
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-navy-900 leading-[1.1] font-serif"
            >
              Your entire rental business, decided for you.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal"
            >
              RentallQ unifies bookings, inventory, invoicing, and tenant records for <strong className="font-semibold text-navy-900">self-storage, warehouses, hostels, parking providers, and equipment rental businesses</strong> — with weekly AI decision recommendations.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                onClick={onOpenTrialModal}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 text-base shadow-md font-semibold bg-amber-500 text-navy-900 hover:bg-amber-400 border-amber-500 cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 border-t border-stone-200/80">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Built for Self-Storage • Warehouses • Hostels • Parking Providers • Equipment Rental
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column — Dashboard Preview with Slow Parallax */}
          <motion.div style={{ y: yParallax }} className="relative">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md">
              {/* Screenshot Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 bg-cream-50 -mx-5 -mt-5 p-4 rounded-t-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 font-mono">
                  [DASHBOARD SCREENSHOT PLACEHOLDER]
                </span>
                <span className="text-[10px] font-bold bg-navy-900 text-white px-2.5 py-1 rounded-full">
                  RentallQ v1.0
                </span>
              </div>

              {/* Realistic Dashboard Overview Content */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-stone-200 bg-cream-50/70 p-3.5">
                    <div className="text-[10px] font-semibold text-stone-500 uppercase">Monthly Revenue</div>
                    <div className="text-xl font-bold text-navy-900 mt-0.5">₹3,48,500.00</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">85% collected</div>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-cream-50/70 p-3.5">
                    <div className="text-[10px] font-semibold text-stone-500 uppercase">Occupancy Rate</div>
                    <div className="text-xl font-bold text-navy-900 mt-0.5">94.2%</div>
                    <div className="text-[10px] text-stone-500 font-medium mt-0.5">48 / 51 units occupied</div>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="bg-navy-900 text-white px-3.5 py-2 text-[11px] font-semibold flex justify-between">
                    <span>Recent Bookings</span>
                    <span onClick={onOpenTrialModal} className="text-amber-400 cursor-pointer">Manage All &rarr;</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs text-navy-900">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                      <span className="font-semibold">Storage Locker 102</span>
                      <span className="text-stone-500 text-[11px]">Sarah Lin</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Warehouse Bay 4B</span>
                      <span className="text-stone-500 text-[11px]">Apex Logistics</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">CONFIRMED</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 flex items-start gap-2.5 text-xs">
                  <BrainCircuit className="h-4.5 w-4.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-950 leading-tight">
                    <strong className="font-semibold">Weekly AI Recommendation:</strong> Consider repricing 3 unleased warehouse bays before peak demand next month.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
