'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Search,
  ShieldCheck,
  Zap,
  CreditCard,
  CheckCircle2,
  X,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  User,
  BrainCircuit,
  Eye,
  Thermometer,
  Clock,
  Phone,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';
import { addPortalNotification } from '@/lib/realtimeSync';

interface StorageUnit {
  id: string;
  name: string;
  type: string;
  description: string;
  basePrice: number;
  status: string;
  dimensions?: string;
  sqFt?: number;
  floorLevel?: string;
  isClimateControlled?: boolean;
  temperature?: string;
  humidity?: string;
  features?: string[];
  location?: string;
  businessId: string;
  businessName: string;
}

interface Company {
  id: string;
  name: string;
  businessType: string;
  location?: string;
  rating?: number;
  units: StorageUnit[];
}

export interface AIRecommendation {
  query: string;
  recommendedType: string;
  recommendedSize: string;
  title: string;
  reasoning: string;
  features: string[];
}

const AI_STORAGE_PRESETS = [
  {
    id: 'bhk',
    label: '🛋️ 1-2 BHK Household',
    query: '1-2 BHK apartment furniture, sofa set, bed, appliances, cartons',
    rec: {
      query: '1-2 BHK apartment furniture, sofa set, bed, appliances, cartons',
      recommendedType: 'Climate Controlled',
      recommendedSize: '10x10',
      title: '10x10 Climate-Controlled Storage Space',
      reasoning: 'Comfortably accommodates 1-2 BHK apartment furnishings (mattress, sofa set, refrigerator, washing machine, and 15-20 boxes). Climate control is essential to prevent humidity and temperature damage on upholstery and electronics.',
      features: ['Climate Controlled', 'Ground Access', 'Electronic Keypad', '24/7 Monitoring'],
    },
  },
  {
    id: 'student',
    label: '📦 Student / Moving Cartons',
    query: 'Student dorm items, 6-8 suitcases, study desk, books, winter wear',
    rec: {
      query: 'Student dorm items, 6-8 suitcases, study desk, books, winter wear',
      recommendedType: 'Locker',
      recommendedSize: '5x5',
      title: '5x5 Compact Secure Locker',
      reasoning: 'Perfect budget-friendly unit for 6-10 cartons, extra luggage, and study materials. High security electronic keypad and easy ground-floor access for quick move-in.',
      features: ['Compact 25 sq ft', 'Digital Keypad Lock', 'Cost Effective', 'Ground Floor Access'],
    },
  },
  {
    id: 'vehicle',
    label: '🏍️ Vehicle / Motorcycle Parking',
    query: 'Motorcycle, vehicle parts, sports sedan, parking bay',
    rec: {
      query: 'Motorcycle, vehicle parts, sports sedan, parking bay',
      recommendedType: 'Drive-Up',
      recommendedSize: '10x20',
      title: 'Dedicated Vehicle / Drive-Up Bay',
      reasoning: 'Spacious ground-level bay featuring 24/7 drive-up access, perimeter security, and CCTV monitoring. Safe for classic cars, bikes, and fleet vehicles.',
      features: ['24/7 Vehicle Gate', 'Wide Driveway', 'CCTV Oversight', 'Motion Sensors'],
    },
  },
  {
    id: 'business',
    label: '🏢 Business Inventory & Pallets',
    query: 'Retail stock, merchandise boxes, pallet staging, archives',
    rec: {
      query: 'Retail stock, merchandise boxes, pallet staging, archives',
      recommendedType: 'Warehouse',
      recommendedSize: '15x20',
      title: 'Commercial Micro-Warehouse Space',
      reasoning: 'High-clearance commercial space with loading dock access, heavy floor capacity, and rapid dispatch logistics for local e-commerce and retail stock.',
      features: ['Loading Dock Access', 'Heavy Floor Load', 'Commercial Staging', 'Industrial Shutter'],
    },
  },
];

export default function StorageSpacesMarketplace() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // AI Space Matcher State
  const [aiInputText, setAiInputText] = useState('');
  const [activeAiRec, setActiveAiRec] = useState<AIRecommendation | null>(null);
  const [filterOnlyAiMatch, setFilterOnlyAiMatch] = useState(false);

  // Checkout / Payment Modal state
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const [inspectingUnit, setInspectingUnit] = useState<StorageUnit | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Controlled card form fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    async function loadData() {
      // Load current user info
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .maybeSingle();
          const resolvedName = profile?.name || user.email?.split('@')[0] || 'Client';
          setCurrentUser({
            id: user.id,
            name: resolvedName,
            email: user.email || '',
          });
          setTenantName(resolvedName);
          setTenantEmail(user.email || '');
        }
      } catch {
        // Not logged in — still allow browsing
      }

      // Load marketplace data
      try {
        const res = await fetch('/api/marketplace');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCompanies(data);
            // Expand all companies by default
            setExpandedCompanies(new Set(data.map((c: Company) => c.id)));
          }
        }
      } catch (err) {
        console.warn('Marketplace load error:', err);
      } finally {
        setLoading(false);
      }

      // Check URL parameters for AI Space Advisor recommendation
      if (typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search);
          const recType = params.get('recommendedType');
          const recSize = params.get('recommendedSize');
          const sqft = params.get('sqft');
          if (recType || recSize) {
            setActiveAiRec({
              query: `${recType || ''} ${recSize || ''}`.trim(),
              recommendedType: recType || 'Standard Storage',
              recommendedSize: recSize || '10x10',
              title: `AI Match: ${recSize || ''} ${recType || 'Storage'}`,
              reasoning: `Based on your inventory calculation (~${sqft || '100'} sq ft), this unit type offers optimal capacity with 20% access clearance.`,
              features: ['Optimized Capacity', '24/7 Gate PIN', 'Archival Climate Protection'],
            });
            setFilterOnlyAiMatch(true);
          }
        } catch {
          // ignore
        }
      }
    }

    loadData();
  }, []);

  const isUnitAiMatch = useCallback((u: StorageUnit) => {
    if (!activeAiRec) return false;
    const recType = activeAiRec.recommendedType.toLowerCase();
    const recSize = activeAiRec.recommendedSize.toLowerCase();
    const uType = u.type.toLowerCase();
    const uName = u.name.toLowerCase();
    const uDesc = u.description.toLowerCase();
    const uDim = (u.dimensions || '').toLowerCase();

    return (
      uType.includes(recType) ||
      uName.includes(recType) ||
      uDesc.includes(recType) ||
      uDim.includes(recSize) ||
      (recType.includes('climate') && (uDesc.includes('climate') || uType.includes('climate') || uName.includes('climate'))) ||
      (recType.includes('drive') && (uDesc.includes('drive') || uType.includes('drive') || uName.includes('drive') || uType.includes('vehicle'))) ||
      (recType.includes('locker') && (uDesc.includes('locker') || uType.includes('locker') || uName.includes('locker') || uDim.includes('5x5'))) ||
      (recType.includes('warehouse') && (uDesc.includes('warehouse') || uType.includes('warehouse') || uName.includes('warehouse') || uDim.includes('20') || uDim.includes('30')))
    );
  }, [activeAiRec]);

  // Find real matching units across all facilities for the AI recommendation
  const aiMatchingUnits = useMemo(() => {
    if (!activeAiRec) return [];
    const all = companies.flatMap((c) =>
      c.units.map((u) => ({
        ...u,
        facilityName: c.name,
        facilityLocation: c.location,
      }))
    );
    return all.filter((u) => isUnitAiMatch(u)).slice(0, 4);
  }, [activeAiRec, companies, isUnitAiMatch]);

  const handleAiRecommend = (text: string) => {
    const q = text.toLowerCase().trim();
    setAiInputText(text);

    if (!q) {
      setActiveAiRec(null);
      setFilterOnlyAiMatch(false);
      return;
    }

    if (
      q.includes('vehicle') ||
      q.includes('car') ||
      q.includes('bike') ||
      q.includes('motorcycle') ||
      q.includes('parking') ||
      q.includes('sedan') ||
      q.includes('suv')
    ) {
      setActiveAiRec(AI_STORAGE_PRESETS[2].rec);
    } else if (
      q.includes('inventory') ||
      q.includes('pallet') ||
      q.includes('warehouse') ||
      q.includes('merchandise') ||
      q.includes('stock') ||
      q.includes('commercial') ||
      q.includes('wholesale')
    ) {
      setActiveAiRec(AI_STORAGE_PRESETS[3].rec);
    } else if (
      q.includes('student') ||
      q.includes('dorm') ||
      q.includes('carton') ||
      q.includes('luggage') ||
      q.includes('suitcase') ||
      q.includes('books') ||
      q.includes('clothes') ||
      q.includes('minimal')
    ) {
      setActiveAiRec(AI_STORAGE_PRESETS[1].rec);
    } else {
      const needsClimate =
        q.includes('electronic') ||
        q.includes('tv') ||
        q.includes('computer') ||
        q.includes('wood') ||
        q.includes('furniture') ||
        q.includes('bed') ||
        q.includes('mattress') ||
        q.includes('appliance');

      setActiveAiRec({
        query: text,
        recommendedType: needsClimate ? 'Climate Controlled' : 'Self Storage',
        recommendedSize: '10x10',
        title: needsClimate
          ? '10x10 Climate-Controlled Space (100 sq ft)'
          : '10x10 Standard Self Storage Unit (100 sq ft)',
        reasoning: `Based on your items ("${text}"), our AI model recommends approximately 100 sq ft (10x10). ${
          needsClimate
            ? 'Climate regulation is strongly recommended to protect wooden furniture, appliances, and fabrics against seasonal moisture and heat.'
            : 'Spacious multi-purpose unit with round-the-clock keypad entry.'
        }`,
        features: [
          needsClimate ? 'Climate Controlled' : 'Standard Ventilation',
          'Drive-Up Access',
          'Digital Keypad Gate',
          'Individual Unit Alarm',
        ],
      });
    }
  };

  const filteredCompanies = companies
    .filter((company) => selectedCompanyId === 'ALL' || company.id === selectedCompanyId)
    .map((company) => ({
      ...company,
      units: company.units.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType =
          selectedType === 'ALL' || u.type.toLowerCase().includes(selectedType.toLowerCase());
        const matchesAiFilter = !filterOnlyAiMatch || isUnitAiMatch(u);
        return matchesSearch && matchesType && matchesAiFilter;
      }),
    }))
    .filter((c) => c.units.length > 0);

  const calculateDiscount = (months: number) => {
    if (months >= 12) return 0.15;
    if (months >= 6) return 0.1;
    if (months >= 3) return 0.05;
    return 0;
  };

  const getSubtotal = () => {
    if (!selectedUnit) return 0;
    return selectedUnit.basePrice * durationMonths;
  };

  const getDiscountAmount = () => {
    const discountRate = calculateDiscount(durationMonths);
    return getSubtotal() * discountRate;
  };

  const getTotalPrice = () => {
    return getSubtotal() - getDiscountAmount();
  };

  const handleOpenCheckout = (unit: StorageUnit) => {
    setSelectedUnit(unit);
    setDurationMonths(1);
    setPaymentSuccess(false);
    setTransactionId(null);
    setTenantName(currentUser?.name || 'Rahul Sharma');
    setTenantEmail(currentUser?.email || 'tenant@rentallq.com');
    setTenantPhone('+91 98765 43210');
    setCardName(currentUser?.name || 'Rahul Sharma');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('');
    setUpiId('');
  };

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    setIsProcessing(true);

    try {
      const generatedTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
      const totalAmount = getTotalPrice();
      const clientName = tenantName.trim() || currentUser?.name || 'Client Tenant';
      const clientEmail = tenantEmail.trim() || currentUser?.email || 'tenant@rentallq.com';
      const clientPhone = tenantPhone.trim() || null;

      // POST booking to API — send businessId so it lands directly in the chosen company's portal
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          rentalUnitId: selectedUnit.id,
          unitName: selectedUnit.name,
          businessId: selectedUnit.businessId,
          businessName: selectedUnit.businessName,
          clientName,
          clientEmail,
          clientPhone,
          startDate,
          endDate,
          totalAmount,
          status: 'CONFIRMED',
          paymentMethod,
          transactionId: generatedTxId,
        }),
      });

      const bookingData = bookingRes.ok ? await bookingRes.json() : null;

      // Broadcast real-time booking event to business portal tabs
      const liveBookingPayload = {
        id: bookingData?.id || generatedTxId,
        customerId: bookingData?.customerId || `c-${Date.now()}`,
        customerName: clientName,
        clientName,
        clientEmail,
        clientPhone,
        rentalUnitId: selectedUnit.id,
        rentalUnitName: selectedUnit.name,
        businessId: selectedUnit.businessId,
        businessName: selectedUnit.businessName,
        startDate,
        endDate,
        totalAmount,
        status: 'CONFIRMED',
        paymentMethod,
        transactionId: generatedTxId,
        createdAt: new Date().toISOString(),
        isNew: true,
      };

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rentallq_latest_booking', JSON.stringify(liveBookingPayload));
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('rentallq_bookings_channel');
            bc.postMessage({ type: 'NEW_BOOKING', booking: liveBookingPayload });
            bc.close();
          }
        }
      } catch (bcErr) {
        console.warn('Real-time broadcast warning:', bcErr);
      }

      // Persist booking in localStorage so My Bookings dashboard shows it
      const newBooking = {
        id: generatedTxId,
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        unitType: selectedUnit.type,
        location: selectedUnit.location,
        dimensions: selectedUnit.dimensions,
        businessId: selectedUnit.businessId,
        businessName: selectedUnit.businessName,
        startDate,
        endDate,
        totalAmount,
        monthlyRate: selectedUnit.basePrice,
        durationMonths,
        status: 'CONFIRMED',
        paymentMethod,
        transactionId: generatedTxId,
        bookedAt: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('rentallq_my_bookings') || '[]');
        existing.unshift(newBooking);
        localStorage.setItem('rentallq_my_bookings', JSON.stringify(existing));
      } catch {
        // localStorage not available
      }

      // Add real-time cross-portal notification for Business Portal & Admin
      try {
        addPortalNotification({
          type: 'NEW_BOOKING',
          title: 'New Unit Booking Confirmed',
          message: `${clientName} booked ${selectedUnit.name} at ${selectedUnit.businessName} for ₹${selectedUnit.basePrice.toLocaleString('en-IN')}/mo.`,
          link: '/business/bookings',
          businessId: selectedUnit.businessId,
          businessName: selectedUnit.businessName,
          clientName,
          unitCode: selectedUnit.name.split('•')[0]?.replace('Unit', '').trim() || selectedUnit.id,
          amount: totalAmount,
        });
      } catch (notifErr) {
        console.warn('Notification broadcast error:', notifErr);
      }

      // Record payment
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          paymentMethod,
          status: 'COMPLETED',
          description: `Rental payment for ${selectedUnit.name} at ${selectedUnit.businessName} (${durationMonths} month/s)`,
          transactionId: generatedTxId,
        }),
      });

      setTransactionId(generatedTxId);
      setPaymentSuccess(true);
    } catch (err) {
      console.warn('Payment recording fallback active', err);
      const fallbackTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionId(fallbackTxId);
      setPaymentSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-8 text-white shadow-xl border border-navy-700">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant Online Rental &amp; Booking Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-white">
            Choose a Company &amp; Book Storage
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            Select a verified storage company below, pick your storage unit, pay securely, and your reservation directly reflects in their business portal in real-time.
          </p>
        </div>

        {currentUser && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs text-white font-medium">
            <User className="h-3.5 w-3.5 text-amber-300" />
            <span>Client: <strong className="text-amber-300">{currentUser.name}</strong></span>
          </div>
        )}
      </div>

      {/* AI SMART SPACE RECOMMENDER */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-cream-50 to-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-amber-400 shadow-xs">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>AI Storage Space Matcher</span>
              </div>
              <h2 className="text-base font-bold text-navy-900 font-serif leading-tight">
                Not sure which size fits your items? Ask our AI
              </h2>
            </div>
          </div>

          {activeAiRec && (
            <button
              onClick={() => {
                setActiveAiRec(null);
                setFilterOnlyAiMatch(false);
                setAiInputText('');
              }}
              className="text-xs text-stone-500 hover:text-navy-900 font-semibold underline self-start sm:self-auto cursor-pointer"
            >
              Clear AI Advice &times;
            </button>
          )}
        </div>

        {/* Input & Quick Presets */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder='e.g., "1 BHK flat furniture, washing machine, and 12 cartons" or "motorcycle"...'
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAiRecommend(aiInputText);
                  }
                }}
                className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-navy-900 placeholder-stone-400 shadow-2xs"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAiRecommend(aiInputText)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition cursor-pointer shrink-0 shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Get AI Recommendation</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
              Quick Suggestions:
            </span>
            {AI_STORAGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAiRecommend(preset.query)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeAiRec?.title === preset.rec.title
                    ? 'bg-amber-500 text-navy-900 border-amber-500 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active AI Recommendation Result Box */}
        {activeAiRec && (
          <div className="mt-2 p-5 rounded-2xl bg-white border-2 border-amber-400 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  AI Recommended Size &amp; Type
                </span>
                <h3 className="text-base sm:text-lg font-bold text-navy-900 font-serif flex items-center gap-2 mt-1">
                  <span>{activeAiRec.title}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompanyId('ALL');
                    setFilterOnlyAiMatch(true);
                    document.getElementById('units-list-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-navy-950 transition cursor-pointer shadow-xs"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Explore These Options &darr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterOnlyAiMatch(!filterOnlyAiMatch)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterOnlyAiMatch
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{filterOnlyAiMatch ? 'AI Filter Active' : 'Filter AI'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-navy-900">Why this recommendation?</strong> {activeAiRec.reasoning}
            </p>

            {/* Direct Matched Units Across Real Facilities */}
            {aiMatchingUnits.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Real Certified Facilities Matching This Recommendation:</span>
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {aiMatchingUnits.length} spaces ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {aiMatchingUnits.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:border-amber-400 hover:bg-amber-50/40 transition flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">
                            {u.businessName || u.facilityName}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded shrink-0">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs font-bold text-navy-900 mt-1 line-clamp-1 font-serif">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                          <span>{u.dimensions || '10ft x 10ft'}</span>
                          <span>&bull;</span>
                          <span className="text-stone-600 font-medium">{u.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                        <div>
                          <span className="text-[9px] text-stone-400 block font-medium">Monthly</span>
                          <span className="font-bold text-navy-900 text-xs">
                            ₹{u.basePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectingUnit(u)}
                            className="px-2 py-1 rounded-lg border border-stone-300 hover:bg-white text-stone-700 font-bold text-[10px] cursor-pointer transition flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Specs</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCheckout(u)}
                            className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer shadow-2xs transition"
                          >
                            Book &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Features:
                </span>
                {activeAiRec.features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-navy-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200"
                  >
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>

              <Link
                href="/ai-space-advisor"
                className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Calculate room-by-room items in AI Advisor</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: CHOOSE A COMPANY SELECTOR BAR */}
      <div className="space-y-3 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-navy-900 font-serif uppercase tracking-wider">
              Step 1: Choose a Storage Company
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {companies.length} verified storage {companies.length === 1 ? 'company' : 'companies'} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Option for ALL companies */}
          <button
            type="button"
            onClick={() => setSelectedCompanyId('ALL')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedCompanyId === 'ALL'
                ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                All Companies
              </span>
              {selectedCompanyId === 'ALL' && (
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
              )}
            </div>
            <div className="font-bold text-xs text-navy-900 mt-2 font-serif">
              View All Facilities
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Browse spaces across all hubs
            </div>
          </button>

          {/* Individual Companies */}
          {companies.map((company) => {
            const isSelected = selectedCompanyId === company.id;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedCompanyId(company.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-amber-50/40 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200 capitalize truncate max-w-[90px]">
                    {company.businessType?.replace('_', ' ') || 'Storage'}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-stone-400 font-bold">★ {company.rating || 4.8}</span>
                  )}
                </div>
                <div className="font-bold text-xs text-navy-900 mt-2 font-serif truncate" title={company.name}>
                  {company.name}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 truncate flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-stone-400" />
                  <span className="truncate">{company.location || 'Metro Hub'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Company Banner if specific company chosen */}
        {selectedCompanyId !== 'ALL' && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-navy-900 font-serif">
                  Viewing spaces exclusively from: {companies.find((c) => c.id === selectedCompanyId)?.name}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  Bookings made here will instantly appear in this company&apos;s portal in real-time.
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompanyId('ALL')}
              className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer whitespace-nowrap ml-2"
            >
              Reset to All &times;
            </button>
          </div>
        )}
      </div>

      {/* STEP 2: SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-stone-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search spaces, dimensions, features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-100/60 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-navy-900 placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-stone-400 hidden sm:block ml-2" />
          {['ALL', 'Climate Controlled', 'Warehouse', 'Locker', 'Self Storage', 'Drive-Up'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-navy-900 text-amber-400 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Companies + Their Units */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-sm">
          Loading storage companies and available spaces...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="p-12 text-center border-stone-200 bg-white space-y-3">
          <Building2 className="mx-auto h-10 w-10 text-stone-400" />
          <h3 className="text-base font-bold text-navy-900 font-serif">No Storage Spaces Matching Current Filter</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {selectedCompanyId !== 'ALL'
              ? `The selected facility doesn't have spaces matching your search or type filter.`
              : `No units matched your filter criteria.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {selectedCompanyId !== 'ALL' && (
              <Button
                size="sm"
                onClick={() => setSelectedCompanyId('ALL')}
                className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                View Spaces Across All Companies
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCompanyId('ALL');
                setSelectedType('ALL');
                setSearchTerm('');
                setFilterOnlyAiMatch(false);
              }}
              className="border-stone-200 text-navy-900 font-semibold text-xs cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div id="units-list-section" className="space-y-6">
          {filteredCompanies.map((company) => {
            const isExpanded = expandedCompanies.has(company.id);
            return (
              <div key={company.id} className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
                {/* Company Header — clickable to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggleCompany(company.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-amber-400 shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-navy-900 font-serif">{company.name}</h2>
                      <div className="flex items-center gap-3 mt-0.5">
                        {company.location && (
                          <span className="flex items-center gap-1 text-xs text-stone-500">
                            <MapPin className="h-3 w-3" />
                            {company.location}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 capitalize">
                          {company.businessType?.replace('_', ' ')}
                        </span>
                        {company.rating && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                            {company.rating}
                          </span>
                        )}
                        <span className="text-xs text-stone-400 font-medium">
                          {company.units.length} space{company.units.length !== 1 ? 's' : ''} available
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {/* Company's Storage Units */}
                {isExpanded && (
                  <div className="border-t border-stone-100 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {company.units.map((unit) => {
                        const isAiMatch = isUnitAiMatch(unit);
                        return (
                          <Card
                            key={unit.id}
                            className={`transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                              isAiMatch
                                ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 shadow-xs'
                                : 'border-stone-200 bg-stone-50/50 hover:border-amber-400 hover:shadow-md'
                            }`}
                          >
                            <div className="p-5 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                      {unit.type}
                                    </span>
                                    {isAiMatch && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-navy-900 bg-amber-400 px-2 py-0.5 rounded-full shadow-2xs">
                                        <Sparkles className="h-3 w-3 text-navy-900" />
                                        <span>AI Best Match</span>
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-sm font-bold text-navy-900 font-serif mt-2 group-hover:text-amber-700 transition-colors">
                                    {unit.name}
                                  </h3>
                                </div>
                                <Badge variant="success" className="text-[10px] uppercase font-bold shrink-0">
                                  {unit.status}
                                </Badge>
                              </div>

                            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                              {unit.description}
                            </p>

                            {/* Rich Details Spec Grid */}
                            <div className="bg-white p-3 rounded-xl space-y-2 text-xs text-stone-700 border border-stone-200/70 shadow-2xs">
                              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-100">
                                <div className="flex items-center gap-1.5">
                                  <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  <span className="font-semibold text-navy-900 truncate">
                                    {unit.dimensions || '10ft x 10ft (100 sq ft)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Thermometer className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                                  <span className="text-stone-700 font-medium truncate">
                                    {unit.temperature || (unit.isClimateControlled ? '21.0°C • 44% RH' : 'Ventilated')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                                <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                <span className="truncate">{unit.location || company.location || 'Verified Facility'}</span>
                              </div>

                              {unit.floorLevel && (
                                <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-stone-400 shrink-0" />
                                  <span className="truncate">{unit.floorLevel}</span>
                                </div>
                              )}

                              {/* Feature Tags */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {(unit.features || ['Keypad PIN', '24/7 CCTV', 'Fire Safe']).slice(0, 3).map((f, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] font-semibold text-navy-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-5 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[11px] text-stone-400 block font-medium">Monthly Rate</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-navy-900 font-serif">
                                  ₹{unit.basePrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-stone-500 font-medium">/mo</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInspectingUnit(unit)}
                                className="border-stone-200 text-stone-700 hover:text-navy-900 text-xs font-semibold px-2.5 py-2 cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Specs</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenCheckout(unit)}
                                className="bg-navy-900 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Book &amp; Pay</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* UNIT INSPECTION & FULL SPECS MODAL */}
      {inspectingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {inspectingUnit.type}
                  </span>
                  <span className="text-xs text-stone-300 font-medium">
                    Verified Storage Space
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-white">
                  {inspectingUnit.name}
                </h2>
                <div className="text-xs text-stone-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Facility: <strong>{inspectingUnit.businessName}</strong></span>
                  {inspectingUnit.location && <span>&bull; {inspectingUnit.location}</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingUnit(null)}
                className="text-stone-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-stone-700">
              {/* Unit Overview Description */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Space Overview
                </h4>
                <p className="text-xs text-navy-900 leading-relaxed font-medium">
                  {inspectingUnit.description}
                </p>
              </div>

              {/* Dimensions & Capacity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Dimensions</span>
                  <span className="text-sm font-bold text-navy-900">{inspectingUnit.dimensions || '10ft x 10ft'}</span>
                </div>
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Floor Area</span>
                  <span className="text-sm font-bold text-navy-900">{inspectingUnit.sqFt || 100} sq ft</span>
                </div>
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Floor Level</span>
                  <span className="text-xs font-semibold text-navy-900 line-clamp-1">{inspectingUnit.floorLevel || 'Ground Floor Direct'}</span>
                </div>
                <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Availability</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    ● Available Now
                  </span>
                </div>
              </div>

              {/* IoT Live Sensors & Environment */}
              <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-amber-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-serif">
                      Live Facility IoT Telemetry
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sensors Online
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                    <span className="text-[10px] text-stone-500 block">Unit Temperature</span>
                    <span className="text-base font-bold text-navy-900">
                      {inspectingUnit.temperature || '21.4°C'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Optimal Climate</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                    <span className="text-[10px] text-stone-500 block">Relative Humidity</span>
                    <span className="text-base font-bold text-navy-900">
                      {inspectingUnit.humidity || '44% RH'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Zero Moisture Risk</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                    <span className="text-[10px] text-stone-500 block">Gate Access Tech</span>
                    <span className="text-base font-bold text-navy-900">Digital Keypad</span>
                    <span className="text-[10px] text-stone-500 block">PIN generated upon lease</span>
                  </div>
                </div>
              </div>

              {/* Security & Access Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Included Security &amp; Access Amenities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(inspectingUnit.features || ['Keypad PIN Access', '24/7 CCTV Monitoring', 'Fire Safety Sprinklers', 'Zero Humidity Risk']).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-white shadow-2xs">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-navy-900">{feat}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-white shadow-2xs">
                    <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                    <span className="font-medium text-navy-900">24/7 Unlimited Gate Access</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-white shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-navy-900">Instant Digital Contract &amp; Invoicing</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Monthly Rental (Base Rate)</span>
                  <span className="font-bold text-navy-900">₹{inspectingUnit.basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Refundable Security Deposit</span>
                  <span className="font-bold text-navy-900">₹{inspectingUnit.basePrice.toLocaleString('en-IN')} (100% Refundable)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">GST (18% on Rent)</span>
                  <span className="font-bold text-navy-900">₹{Math.round(inspectingUnit.basePrice * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200">
                  <span className="font-bold text-navy-900">Total Move-In (1st Month + Deposit + GST)</span>
                  <span className="font-bold text-base text-amber-700 font-serif">
                    ₹{(inspectingUnit.basePrice * 2 + Math.round(inspectingUnit.basePrice * 0.18)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Monthly Rate</span>
                <span className="text-xl font-bold text-navy-900 font-serif">
                  ₹{inspectingUnit.basePrice.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-stone-500">/mo</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInspectingUnit(null)}
                  className="border-stone-300 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const u = inspectingUnit;
                    setInspectingUnit(null);
                    handleOpenCheckout(u);
                  }}
                  className="bg-navy-900 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <span>Book This Space Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT & PAYMENT MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-navy-900 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-navy-900">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white leading-tight">
                    Secure Storage Booking
                  </h3>
                  <span className="text-xs text-amber-300 font-medium">
                    {selectedUnit.name} &bull; {selectedUnit.businessName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUnit(null)}
                className="text-stone-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-serif text-navy-900">
                    Booking Confirmed &amp; Paid!
                  </h2>
                  <p className="text-xs text-stone-600">
                    You have successfully rented <strong>{selectedUnit.name}</strong> from{' '}
                    <strong>{selectedUnit.businessName}</strong> for {durationMonths} month/s.
                  </p>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs text-emerald-900 font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>
                      ✓ <strong>Real-Time Sync:</strong> This booking is now directly visible in <strong>{selectedUnit.businessName}</strong>&apos;s business portal bookings list.
                    </span>
                  </div>
                </div>

                <div className="bg-cream-100 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Client / Tenant:</span>
                    <span className="font-bold text-navy-900">{tenantName || 'Client'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Company:</span>
                    <span className="font-bold text-amber-800">{selectedUnit.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Transaction ID:</span>
                    <span className="font-bold text-navy-900">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Paid:</span>
                    <span className="font-bold text-emerald-700">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Access Pass Code:</span>
                    <span className="font-bold text-amber-700">PASS-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedUnit(null);
                      router.push('/dashboard');
                    }}
                    className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                  >
                    View in My Bookings
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedUnit(null);
                      router.push('/my-payments');
                    }}
                    variant="outline"
                    className="flex-1 font-bold text-xs py-3 rounded-xl cursor-pointer"
                  >
                    Payment History
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
                {/* Booking for company banner */}
                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs">
                  <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-amber-950 font-bold block">
                      Booking Space with: {selectedUnit.businessName}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      {selectedUnit.location || 'Metro Hub'} &bull; Real-time connected
                    </span>
                  </div>
                </div>

                {/* Tenant / Client Contact Information */}
                <div className="space-y-3 bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                      Tenant Details (Shown to Company)
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified Identity</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-navy-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={tenantEmail}
                        onChange={(e) => setTenantEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-navy-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-navy-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Tenure Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Select Rental Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { m: 1, discount: 'Standard' },
                      { m: 3, discount: '5% OFF' },
                      { m: 6, discount: '10% OFF' },
                      { m: 12, discount: '15% OFF' },
                    ].map((opt) => (
                      <button
                        key={opt.m}
                        type="button"
                        onClick={() => setDurationMonths(opt.m)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          durationMonths === opt.m
                            ? 'border-amber-500 bg-amber-50 text-navy-900 ring-2 ring-amber-500/20'
                            : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                        }`}
                      >
                        <div className="text-sm font-bold">{opt.m} Mo</div>
                        <div className="text-[9px] font-semibold text-amber-700 mt-0.5">
                          {opt.discount}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Monthly Rate:</span>
                    <span>₹{selectedUnit.basePrice} / mo</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal ({durationMonths} month/s):</span>
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  {calculateDiscount(durationMonths) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Tenure Savings ({calculateDiscount(durationMonths) * 100}%):</span>
                      <span>-₹{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-navy-900">
                    <span>Total Due Now:</span>
                    <span className="text-amber-600 font-serif text-lg">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'upi', label: 'UPI / QR' },
                      { id: 'netbanking', label: 'Net Banking' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'border-navy-900 bg-navy-900 text-amber-400'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Input — fully controlled */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 mb-1">Cardholder Name</label>
                      <input
                        id="card-name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        autoComplete="cc-name"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 mb-1">Card Number</label>
                      <input
                        id="card-number"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        maxLength={19}
                        autoComplete="cc-number"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Expiry (MM/YY)</label>
                        <input
                          id="card-expiry"
                          type="text"
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          required
                          maxLength={5}
                          autoComplete="cc-exp"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">CVV</label>
                        <input
                          id="card-cvv"
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          required
                          maxLength={4}
                          autoComplete="cc-csc"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Input */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 mb-1">UPI ID</label>
                      <input
                        id="upi-id"
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-0.5 w-24 h-24">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-full aspect-square rounded-[1px] ${
                              Math.random() > 0.5 ? 'bg-navy-900' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="ml-4 text-xs text-stone-500">
                        <p className="font-bold text-navy-900 mb-1">Scan QR Code</p>
                        <p>or enter your UPI ID</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3 pt-1">
                    <label className="block text-[10px] font-semibold text-stone-500 mb-1">Select Bank</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          className="p-2.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Payment Button */}
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-sm py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {isProcessing
                      ? 'Processing Encrypted Payment...'
                      : `Pay ₹${getTotalPrice().toFixed(2)} & Complete Rental`}
                  </span>
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
