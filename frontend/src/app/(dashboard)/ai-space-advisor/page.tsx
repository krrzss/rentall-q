'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  MapPin,
  PhoneCall,
  Check,
  CreditCard,
  X,
  Lock,
} from 'lucide-react';
import {
  PLATFORM_COMPANIES,
  getAllPlatformUnits,
  StorageUnitSpec,
  PlatformCompany,
  getCompanyByIdOrAlias,
} from '@/lib/platformCompanies';
import { addPortalNotification } from '@/lib/realtimeSync';

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
  const router = useRouter();
  const [items, setItems] = useState<StorableItem[]>(DEFAULT_ITEMS);
  const [claimedDiscount, setClaimedDiscount] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  // Interactive Exploratory State
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [inspectingUnit, setInspectingUnit] = useState<StorageUnitSpec | null>(null);
  const [bookingUnit, setBookingUnit] = useState<StorageUnitSpec | null>(null);

  // Booking Modal State
  const [bookingDuration, setBookingDuration] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [isReserving, setIsReserving] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<any | null>(null);

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

  // Volumetric calculation
  const rawSqFt = items.reduce((acc, item) => acc + item.sqFtPerItem * item.qty, 0);
  const recommendedSqFt = Math.ceil(rawSqFt * 1.2);

  const getRecommendation = (sqFt: number) => {
    if (sqFt <= 35) {
      return {
        size: '5x5 Micro-Locker',
        sqFt: 25,
        type: 'Micro-Locker',
        dimensions: '5ft x 5ft (25 sq ft • 200 cu ft)',
        priceEst: '₹2,800 - ₹5,200 / mo',
        efficiency: '94% Pack Density',
        reason: 'Ideal for luggage, student study items, and 6-10 medium boxes. High security keypad PIN access.',
      };
    } else if (sqFt <= 110) {
      return {
        size: '10x10 Climate-Controlled Space',
        sqFt: 100,
        type: 'Climate-Controlled',
        dimensions: '10ft x 10ft (100 sq ft • 800 cu ft)',
        priceEst: '₹7,500 - ₹12,500 / mo',
        efficiency: '91% Optimal Packing',
        reason: 'Accommodates a standard 1-2 BHK apartment furniture set. Precision climate control prevents humidity mold and warping.',
      };
    } else if (sqFt <= 220) {
      return {
        size: '10x20 Drive-Up / Vehicle Bay',
        sqFt: 200,
        type: 'Drive-Up Storage',
        dimensions: '20ft x 10ft (200 sq ft • 1,600 cu ft)',
        priceEst: '₹14,500 - ₹18,500 / mo',
        efficiency: '88% Packing with Center Aisle',
        reason: 'Spacious ground-level access suitable for a full 3 BHK house, motorcycle, or compact car with garage-style roll-up shutter.',
      };
    } else {
      return {
        size: '15x20 Commercial Warehouse Bay',
        sqFt: 300,
        type: 'Heavy Warehouse Bay',
        dimensions: '25ft x 20ft (500 sq ft • 4,000 cu ft)',
        priceEst: '₹25,000 - ₹35,000 / mo',
        efficiency: '85% Staging Capacity',
        reason: 'High clearance space with loading dock access designed for commercial inventory pallets, office moves, and heavy equipment.',
      };
    }
  };

  const rec = getRecommendation(recommendedSqFt);

  // 🎯 FIND REAL MATCHING UNITS ACROSS BUSINESSES
  const matchingUnits = useMemo(() => {
    const allUnits = getAllPlatformUnits();

    return allUnits.filter((u) => {
      // Filter by city if selected
      if (selectedCityFilter !== 'ALL') {
        const company = PLATFORM_COMPANIES.find((c) => c.id === u.businessId);
        if (company && company.city.toLowerCase() !== selectedCityFilter.toLowerCase()) {
          return false;
        }
      }

      // Check volumetric compatibility: within reasonable range or matching category
      const targetSqFt = rec.sqFt;
      const isSqFtMatch = Math.abs(u.sqFt - targetSqFt) <= 60;
      const isTypeMatch =
        u.type.toLowerCase().includes(rec.type.toLowerCase()) ||
        rec.type.toLowerCase().includes(u.type.toLowerCase()) ||
        (rec.type === 'Climate-Controlled' && u.isClimateControlled);

      return isSqFtMatch || isTypeMatch;
    });
  }, [rec.sqFt, rec.type, selectedCityFilter]);

  // Handle Instant Unit Booking from AI Advisor
  const handleConfirmReservation = async () => {
    if (!bookingUnit) return;
    setIsReserving(true);

    const generatedTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const pin = `${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = bookingUnit.basePrice * bookingDuration;
    const clientName = 'Tanisha Sharma';

    const newBooking = {
      id: generatedTxId,
      unitId: bookingUnit.id,
      unitName: bookingUnit.name,
      unitType: bookingUnit.type,
      location: bookingUnit.location,
      dimensions: bookingUnit.dimensions,
      businessId: bookingUnit.businessId,
      businessName: bookingUnit.businessName,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + bookingDuration * 30 * 86400000).toISOString(),
      totalAmount,
      monthlyRate: bookingUnit.basePrice,
      durationMonths: bookingDuration,
      status: 'CONFIRMED',
      paymentMethod,
      transactionId: generatedTxId,
      gatePin: pin,
      bookedAt: new Date().toISOString(),
    };

    // 1. Save to tenant's personal bookings
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('rentallq_my_bookings') || '[]');
        existing.unshift(newBooking);
        localStorage.setItem('rentallq_my_bookings', JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('Booking save error', e);
    }

    // 2. Dispatch cross-portal event so Business Portal gets notified
    try {
      addPortalNotification({
        type: 'NEW_BOOKING',
        title: 'New Unit Booking Confirmed',
        message: `${clientName} booked ${bookingUnit.name} at ${bookingUnit.businessName} for ₹${bookingUnit.basePrice.toLocaleString('en-IN')}/mo.`,
        link: '/business/bookings',
        businessId: bookingUnit.businessId,
        businessName: bookingUnit.businessName,
        clientName,
        unitCode: bookingUnit.name.split('•')[0]?.replace('Unit', '').trim() || bookingUnit.id,
        amount: totalAmount,
      });
    } catch (e) {
      console.warn('Notification error', e);
    }

    setTimeout(() => {
      setIsReserving(false);
      setReservationSuccess({
        unit: bookingUnit,
        txId: generatedTxId,
        gatePin: pin,
      });
    }, 1200);
  };

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
                Live Multi-Facility Discovery Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Smart Storage Space Advisor
            </h1>
            <p className="text-sm text-stone-300 max-w-xl">
              Calculate your exact volumetric requirements, find the verified business facilities offering that unit, and explore or reserve in 1 click.
            </p>
          </div>

          <Link href="/storage-spaces">
            <Button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Browse All Marketplace Spaces &rarr;</span>
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
                  Pick items or choose an apartment preset to calculate volumetric sq ft.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: '1bhk', label: '1 BHK' },
                  { id: '2bhk', label: '2 BHK' },
                  { id: 'student', label: 'Student / Dorm' },
                  { id: 'office', label: 'Office Move' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedPreset === preset.id
                        ? 'bg-navy-900 text-amber-400 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-navy-900">{item.name}</div>
                      <div className="text-[11px] text-stone-400">
                        {item.sqFtPerItem} sq ft / unit &bull; {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={item.qty <= 0}
                      onClick={() => updateQty(item.id, -1)}
                      className="h-6 w-6 rounded bg-stone-200 hover:bg-stone-300 text-navy-900 flex items-center justify-center cursor-pointer disabled:opacity-40 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold font-mono text-navy-900">
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

        {/* Right 1 Col: AI Recommendation Summary Card */}
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
                ({rawSqFt} sq ft items + 20% aisle breathing space)
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
                <span className="text-stone-500">Est. Price Range:</span>
                <span className="font-bold text-amber-700">{rec.priceEst}</span>
              </div>
            </div>

            <Link href={`/storage-spaces?recommendedType=${encodeURIComponent(rec.type)}&recommendedSize=${encodeURIComponent(rec.size)}&sqft=${recommendedSqFt}`}>
              <Button className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-sm">
                <span>Filter Marketplace by {rec.size}</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* ── 2. 🎯 REAL AVAILABLE UNITS MATCHING AI CALCULATION ACROSS BUSINESSES ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>AI Live Facility Matcher</span>
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {matchingUnits.length} Available Units Found Across Verified Warehouses
              </span>
            </div>
            <h2 className="text-xl font-bold text-navy-900 font-serif mt-1">
              Real Available Units Matching Your {rec.size}
            </h2>
            <p className="text-xs text-stone-600">
              Below are actual certified warehouses from our platform that have this exact space available right now. Click any unit to inspect or instant-book.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCityFilter === city
                    ? 'bg-amber-500 text-navy-950 shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {city === 'ALL' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Matching Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingUnits.map((unit) => {
            const company = PLATFORM_COMPANIES.find((c) => c.id === unit.businessId);
            return (
              <Card
                key={unit.id}
                className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Facility Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {company?.city || 'Verified Facility'}
                      </span>
                      <h4 className="text-xs font-bold text-navy-900 mt-1 line-clamp-1">
                        {unit.businessName}
                      </h4>
                    </div>
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold shrink-0">
                      ✓ Ready to Rent
                    </Badge>
                  </div>

                  {/* Unit Title & Specs */}
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm font-serif">
                      {unit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="font-semibold text-navy-900">{unit.dimensions}</span>
                      <span>&bull;</span>
                      <span>{unit.sqFt} sq ft</span>
                      <span>&bull;</span>
                      <span className="text-amber-800 font-medium">{unit.type}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
                      {unit.description}
                    </p>
                  </div>

                  {/* Telemetry Sensor Pill */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Thermometer className="h-3.5 w-3.5 text-amber-600" />
                      <span>{unit.temperature}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Droplets className="h-3.5 w-3.5 text-sky-600" />
                      <span>{unit.humidity}</span>
                    </div>
                    <span className="text-emerald-700 font-semibold text-[10px]">
                      Sensors Active
                    </span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-500">Monthly Rent:</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-navy-900 font-serif">
                        ₹{unit.basePrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400"> / mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectingUnit(unit)}
                      className="text-xs font-semibold text-navy-900 border-stone-200 hover:bg-stone-50 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                      <span>Explore</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setBookingUnit(unit);
                        setReservationSuccess(null);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Reserve</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {matchingUnits.length === 0 && (
          <Card className="p-8 text-center bg-white border border-stone-200 rounded-2xl space-y-2">
            <Building2 className="h-8 w-8 text-stone-400 mx-auto" />
            <h4 className="font-bold text-navy-900 text-sm">No units in this specific city filter</h4>
            <p className="text-xs text-stone-500">
              Try clicking &quot;All Cities&quot; to see matching spaces across Mumbai, Bengaluru, and Pune.
            </p>
          </Card>
        )}
      </div>

      {/* ── 3. AI LEASE OPTIMIZATION & SAVINGS FORECASTER ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
              Unit #MUM-A104 &bull; Due Soon
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            AI lease analysis detects that Unit #MUM-A104 (Hindustan Cold Storage) expires on Nov 28. Switching from month-to-month to a <strong>3-month pre-paid contract locks in a 10% discount</strong> (₹13,050/mo vs ₹14,500/mo standard rate).
          </p>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-stone-500">Total Net Savings:</span>
              <div className="font-bold text-emerald-800 text-sm">₹4,350 / 3 months</div>
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
              <div className="text-[11px] text-stone-500">Unit #MUM-A101 (Mumbai)</div>
              <div className="text-sm font-bold text-navy-900 mt-0.5">21.4°C &bull; 44% RH</div>
              <span className="text-[10px] text-emerald-700 font-semibold">✓ Optimal Archival</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] text-stone-500">Unit #BLR-D88 (Bengaluru)</div>
              <div className="text-sm font-bold text-navy-900 mt-0.5">19.8°C &bull; 48% RH</div>
              <span className="text-[10px] text-emerald-700 font-semibold">✓ Safe Inventory</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── MODAL 1: UNIT & FACILITY EXPLORATION DRAWER ── */}
      {inspectingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden text-navy-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Facility Unit Inspection
                </span>
                <h3 className="text-lg font-bold font-serif text-white mt-1">
                  {inspectingUnit.name}
                </h3>
                <p className="text-xs text-stone-300">
                  {inspectingUnit.businessName} &bull; {inspectingUnit.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUnit(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Telemetry & Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Dimensions</span>
                  <strong className="text-navy-900 text-xs">{inspectingUnit.dimensions}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Total Space</span>
                  <strong className="text-navy-900 text-xs">{inspectingUnit.sqFt} sq ft</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Floor Access</span>
                  <strong className="text-navy-900 text-xs truncate block">{inspectingUnit.floorLevel}</strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800 block text-[10px]">Monthly Rent</span>
                  <strong className="text-amber-900 text-xs">₹{inspectingUnit.basePrice.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-navy-900 text-sm font-serif mb-1">
                  Space Capabilities
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  {inspectingUnit.description}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="font-bold text-navy-900 text-sm font-serif mb-2">
                  Included Amenities &amp; Protections
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {inspectingUnit.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg text-stone-700">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility & Contact Box */}
              <div className="p-4 bg-cream-50 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-navy-900 flex items-center justify-between">
                  <span>{inspectingUnit.businessName}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Certified Depot
                  </span>
                </div>
                <div className="text-stone-600 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>{inspectingUnit.location}</span>
                </div>
                <div className="text-stone-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>24/7 Gate Keypad Access with Digital Intercom</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingUnit(null)}
                className="text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Close Details
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const target = inspectingUnit;
                  setInspectingUnit(null);
                  setBookingUnit(target);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Reserve This Space &rarr;</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INSTANT RESERVATION CHECKOUT MODAL ── */}
      {bookingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden text-navy-900">
            {/* Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-navy-950 font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif">Instant Reserve Space</h3>
                  <p className="text-[11px] text-stone-300 truncate max-w-[240px]">
                    {bookingUnit.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingUnit(null);
                  setReservationSuccess(null);
                }}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reservationSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-navy-900 font-serif">
                    Space Successfully Reserved!
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Your unit at <strong>{reservationSuccess.unit.businessName}</strong> is now officially active.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs text-left border border-stone-200">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Transaction ID:</span>
                    <strong className="font-mono text-navy-900">{reservationSuccess.txId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Primary Gate PIN:</span>
                    <strong className="font-mono text-emerald-700 text-sm">#{reservationSuccess.gatePin}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Business Alert:</span>
                    <span className="text-emerald-700 font-semibold">Live Operational Notice Dispatched</span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/my-bookings')}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-2.5 cursor-pointer"
                >
                  Go to My Bookings Hub &rarr;
                </Button>
              </div>
            ) : (
              <div className="p-6 space-y-4 text-xs">
                {/* Space Summary */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex justify-between items-center">
                  <div>
                    <strong className="text-navy-900 block font-serif text-sm">
                      {bookingUnit.name}
                    </strong>
                    <span className="text-stone-500 text-[11px]">{bookingUnit.businessName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-navy-900 font-serif">
                      ₹{bookingUnit.basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 block">/ month</span>
                  </div>
                </div>

                {/* Lease Duration Selector */}
                <div>
                  <label className="block font-semibold text-navy-900 mb-1.5">
                    Select Lease Commitment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { months: 1, label: '1 Month', note: 'Standard' },
                      { months: 3, label: '3 Months', note: 'Save 10%' },
                      { months: 6, label: '6 Months', note: 'Save 15%' },
                    ].map((plan) => (
                      <button
                        key={plan.months}
                        type="button"
                        onClick={() => setBookingDuration(plan.months)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          bookingDuration === plan.months
                            ? 'border-navy-900 bg-navy-900 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-navy-900 hover:bg-stone-50'
                        }`}
                      >
                        <div className="font-bold text-xs">{plan.label}</div>
                        <div className={`text-[10px] ${bookingDuration === plan.months ? 'text-amber-400' : 'text-stone-400'}`}>
                          {plan.note}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-semibold text-navy-900 mb-1.5">
                    Settlement Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR' },
                      { id: 'card', label: 'Debit / Card' },
                      { id: 'netbanking', label: 'Netbanking' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2 rounded-xl border text-center font-semibold text-xs cursor-pointer transition ${
                          paymentMethod === pm.id
                            ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Cost Breakdown */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-200">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Duration:</span>
                    <span className="font-bold text-navy-900">{bookingDuration} Month(s)</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm">
                    <span className="font-bold text-navy-900">Total Payable:</span>
                    <strong className="text-emerald-700 text-base font-serif">
                      ₹{(bookingUnit.basePrice * bookingDuration).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <Button
                  disabled={isReserving}
                  onClick={handleConfirmReservation}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs py-3 cursor-pointer shadow-sm disabled:opacity-60"
                >
                  {isReserving
                    ? 'Confirming with Depot Ledger…'
                    : `Pay ₹${(bookingUnit.basePrice * bookingDuration).toLocaleString('en-IN')} & Secure Space`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
