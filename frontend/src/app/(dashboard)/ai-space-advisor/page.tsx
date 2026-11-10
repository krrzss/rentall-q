'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BrainCircuit,
  Sparkles,
  Layers,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  Box,
  TrendingDown,
  Clock,
  ExternalLink,
  ChevronRight,
  Percent,
} from 'lucide-react';

interface StorableItem {
  id: string;
  name: string;
  category: string;
  sqFtPerItem: number;
  icon: string;
  qty: number;
}

const DEFAULT_ITEMS: StorableItem[] = [
  { id: 'bed', name: 'Queen / King Bed Set', category: 'Furniture', sqFtPerItem: 38, icon: '🛏️', qty: 1 },
  { id: 'sofa', name: '3-Seater Living Room Sofa', category: 'Furniture', sqFtPerItem: 32, icon: '🛋️', qty: 1 },
  { id: 'fridge', name: 'Refrigerator / Washer', category: 'Appliances', sqFtPerItem: 14, icon: '❄️', qty: 1 },
  { id: 'boxes', name: 'Medium Moving Boxes (3 cu ft)', category: 'Boxes', sqFtPerItem: 4, icon: '📦', qty: 12 },
  { id: 'desk', name: 'Study Desk & Swivel Chair', category: 'Office', sqFtPerItem: 18, icon: '🖥️', qty: 1 },
  { id: 'bike', name: 'Bicycle / Sports Gear', category: 'Sports', sqFtPerItem: 12, icon: '🚲', qty: 0 },
];

export default function AISpaceAdvisorPage() {
  const [items, setItems] = useState<StorableItem[]>(DEFAULT_ITEMS);
  const [claimedDiscount, setClaimedDiscount] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const applyPreset = (presetType: '1bhk' | '2bhk' | 'student' | 'office') => {
    setSelectedPreset(presetType);
    if (presetType === '1bhk') {
      setItems([
        { id: 'bed', name: 'Queen / King Bed Set', category: 'Furniture', sqFtPerItem: 38, icon: '🛏️', qty: 1 },
        { id: 'sofa', name: '3-Seater Living Room Sofa', category: 'Furniture', sqFtPerItem: 32, icon: '🛋️', qty: 1 },
        { id: 'fridge', name: 'Refrigerator / Washer', category: 'Appliances', sqFtPerItem: 14, icon: '❄️', qty: 1 },
        { id: 'boxes', name: 'Medium Moving Boxes (3 cu ft)', category: 'Boxes', sqFtPerItem: 4, icon: '📦', qty: 10 },
        { id: 'desk', name: 'Study Desk & Swivel Chair', category: 'Office', sqFtPerItem: 18, icon: '🖥️', qty: 1 },
        { id: 'bike', name: 'Bicycle / Sports Gear', category: 'Sports', sqFtPerItem: 12, icon: '🚲', qty: 0 },
      ]);
    } else if (presetType === '2bhk') {
      setItems([
        { id: 'bed', name: 'Queen / King Bed Set', category: 'Furniture', sqFtPerItem: 38, icon: '🛏️', qty: 2 },
        { id: 'sofa', name: '3-Seater Living Room Sofa', category: 'Furniture', sqFtPerItem: 32, icon: '🛋️', qty: 2 },
        { id: 'fridge', name: 'Refrigerator / Washer', category: 'Appliances', sqFtPerItem: 14, icon: '❄️', qty: 2 },
        { id: 'boxes', name: 'Medium Moving Boxes (3 cu ft)', category: 'Boxes', sqFtPerItem: 4, icon: '📦', qty: 24 },
        { id: 'desk', name: 'Study Desk & Swivel Chair', category: 'Office', sqFtPerItem: 18, icon: '🖥️', qty: 2 },
        { id: 'bike', name: 'Bicycle / Sports Gear', category: 'Sports', sqFtPerItem: 12, icon: '🚲', qty: 1 },
      ]);
    } else if (presetType === 'student') {
      setItems([
        { id: 'bed', name: 'Queen / King Bed Set', category: 'Furniture', sqFtPerItem: 38, icon: '🛏️', qty: 0 },
        { id: 'sofa', name: '3-Seater Living Room Sofa', category: 'Furniture', sqFtPerItem: 32, icon: '🛋️', qty: 0 },
        { id: 'fridge', name: 'Refrigerator / Washer', category: 'Appliances', sqFtPerItem: 14, icon: '❄️', qty: 0 },
        { id: 'boxes', name: 'Medium Moving Boxes (3 cu ft)', category: 'Boxes', sqFtPerItem: 4, icon: '📦', qty: 6 },
        { id: 'desk', name: 'Study Desk & Swivel Chair', category: 'Office', sqFtPerItem: 18, icon: '🖥️', qty: 1 },
        { id: 'bike', name: 'Bicycle / Sports Gear', category: 'Sports', sqFtPerItem: 12, icon: '🚲', qty: 1 },
      ]);
    } else if (presetType === 'office') {
      setItems([
        { id: 'bed', name: 'Queen / King Bed Set', category: 'Furniture', sqFtPerItem: 38, icon: '🛏️', qty: 0 },
        { id: 'sofa', name: '3-Seater Living Room Sofa', category: 'Furniture', sqFtPerItem: 32, icon: '🛋️', qty: 1 },
        { id: 'fridge', name: 'Refrigerator / Washer', category: 'Appliances', sqFtPerItem: 14, icon: '❄️', qty: 1 },
        { id: 'boxes', name: 'Medium Moving Boxes (3 cu ft)', category: 'Boxes', sqFtPerItem: 4, icon: '📦', qty: 35 },
        { id: 'desk', name: 'Study Desk & Swivel Chair', category: 'Office', sqFtPerItem: 18, icon: '🖥️', qty: 4 },
        { id: 'bike', name: 'Bicycle / Sports Gear', category: 'Sports', sqFtPerItem: 12, icon: '🚲', qty: 0 },
      ]);
    }
  };

  // Volumetric math
  const rawSqFt = items.reduce((acc, item) => acc + item.sqFtPerItem * item.qty, 0);
  // Add 20% aisle/breathing room for realistic packing
  const recommendedSqFt = Math.ceil(rawSqFt * 1.2);

  const getRecommendation = (sqFt: number) => {
    if (sqFt <= 30) {
      return {
        size: '5x5 Locker / Small Space',
        sqFt: 25,
        type: 'Compact Climate Locker',
        dimensions: '5ft x 5ft (25 sq ft • 200 cu ft)',
        priceEst: '$45 - $65 / mo',
        efficiency: '94% Pack Density',
        reason: 'Ideal for luggage, student study items, and 6-10 medium boxes. High security keypad access.',
      };
    } else if (sqFt <= 110) {
      return {
        size: '10x10 Climate-Controlled Space',
        sqFt: 100,
        type: 'Medium Climate Bay',
        dimensions: '10ft x 10ft (100 sq ft • 800 cu ft)',
        priceEst: '$130 - $160 / mo',
        efficiency: '91% Optimal Packing',
        reason: 'Accommodates a standard 1-2 BHK apartment furniture set. Climate control prevents humidity mold and wood warping.',
      };
    } else if (sqFt <= 220) {
      return {
        size: '10x20 Drive-Up / Vehicle Bay',
        sqFt: 200,
        type: 'Large Drive-Up Bay',
        dimensions: '10ft x 20ft (200 sq ft • 1,600 cu ft)',
        priceEst: '$200 - $240 / mo',
        efficiency: '88% Packing with Center Aisle',
        reason: 'Spacious ground-level access suitable for a full 3 BHK house, motorcycle, or compact car with garage-style roll-up shutter.',
      };
    } else {
      return {
        size: '15x20 Commercial Warehouse Bay',
        sqFt: 300,
        type: 'Commercial Micro-Warehouse',
        dimensions: '15ft x 20ft (300 sq ft • 2,700 cu ft)',
        priceEst: '$310 - $360 / mo',
        efficiency: '85% Staging Capacity',
        reason: 'High clearance space with loading dock access designed for commercial inventory pallets, office moves, and heavy equipment.',
      };
    }
  };

  const rec = getRecommendation(recommendedSqFt);

  return (
    <div className="space-y-6">
      {/* ── TOP HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6 sm:p-8 text-white shadow-md border border-stone-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>RentAll-Q AI Space Advisor</span>
              </span>
              <span className="text-xs text-stone-300">
                Machine Learning Volumetric Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Smart Storage Space Advisor
            </h1>
            <p className="text-sm text-stone-300 max-w-xl">
              Calculate your exact volumetric requirements, prevent overpaying for empty space, and get proactive lease renewal insights.
            </p>
          </div>

          <Link href="/storage-spaces">
            <Button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Browse Matching Spaces &rarr;</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 1. INTERACTIVE AI VOLUMETRIC SPACE CALCULATOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Storable Items Selector */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif flex items-center gap-2">
                  <Box className="h-5 w-5 text-amber-600" />
                  <span>Step 1: Select What You Are Storing</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Pick items or choose a quick apartment preset to calculate volumetric sq ft.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('1bhk')}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedPreset === '1bhk'
                      ? 'bg-navy-900 text-amber-400 border-navy-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  1 BHK
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('2bhk')}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedPreset === '2bhk'
                      ? 'bg-navy-900 text-amber-400 border-navy-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  2 BHK
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('student')}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedPreset === 'student'
                      ? 'bg-navy-900 text-amber-400 border-navy-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('office')}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedPreset === 'office'
                      ? 'bg-navy-900 text-amber-400 border-navy-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Office
                </button>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-navy-900 text-xs">{item.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        {item.sqFtPerItem} sq ft / unit &bull; {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-300 p-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="h-6 w-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-navy-900">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="h-6 w-6 rounded bg-navy-900 hover:bg-navy-800 text-white flex items-center justify-center cursor-pointer transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: AI Recommendation Card */}
        <div className="space-y-4">
          <Card className="p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>AI Recommendation</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {rec.efficiency}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 font-medium">Estimated Volume Needed</span>
              <div className="text-3xl font-bold font-serif text-navy-900 mt-0.5">
                ~{recommendedSqFt} sq ft
              </div>
              <p className="text-[11px] text-stone-400">
                ({rawSqFt} sq ft items + 20% access aisle space)
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Optimal Unit Match
              </div>
              <h3 className="font-bold text-navy-900 text-base font-serif">
                {rec.size}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {rec.reason}
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Est. Price:</span>
                <span className="font-bold text-amber-700">{rec.priceEst}</span>
              </div>
            </div>

            <Link href="/storage-spaces">
              <Button className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-sm">
                <span>View {rec.size} in Marketplace</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* ── 2. AI LEASE OPTIMIZATION & SAVINGS FORECASTER ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight 1: Lease Pre-Pay Savings */}
        <Card className="p-5 rounded-2xl border border-amber-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Percent className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm font-serif">
                Lease Pre-Pay Savings Insight
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Unit #CHI-208 &bull; Due Soon
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            AI lease analysis detects that Unit #CHI-208 (Chicago MetroHub) expires on Nov 28. Switching from month-to-month to a <strong>3-month pre-paid contract locks in a 10% discount</strong> ($288/mo vs $320/mo standard rate).
          </p>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-stone-500">Total Net Savings:</span>
              <div className="font-bold text-emerald-800 text-sm">$96.00 / 3 months</div>
            </div>
            <button
              type="button"
              disabled={claimedDiscount}
              onClick={() => setClaimedDiscount(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs transition disabled:opacity-60"
            >
              {claimedDiscount ? '✓ 10% Applied to Next Invoice' : 'Apply 10% Discount'}
            </button>
          </div>
        </Card>

        {/* Insight 2: Archival IoT Climate Telemetry */}
        <Card className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm font-serif">
                Climate Protection Diagnostic
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Sensors 100% Online
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Continuous IoT sensors monitor temperature and relative humidity inside your rented climate spaces to protect sensitive furniture and electronics.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] text-stone-500">Unit #ATX-104 (Austin)</div>
              <div className="text-sm font-bold text-navy-900 mt-0.5">21.4°C &bull; 44% RH</div>
              <span className="text-[10px] text-emerald-700 font-semibold">✓ Optimal Archival</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] text-stone-500">Unit #CHI-208 (Chicago)</div>
              <div className="text-sm font-bold text-navy-900 mt-0.5">19.8°C &bull; 48% RH</div>
              <span className="text-[10px] text-emerald-700 font-semibold">✓ Safe Inventory</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

