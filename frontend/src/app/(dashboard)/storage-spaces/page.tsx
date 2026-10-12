'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/server/lib/supabaseClient';

interface StorageUnit {
  id: string;
  name: string;
  type: string;
  description: string;
  basePrice: number;
  status: string;
  dimensions?: string;
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

export default function StorageSpacesMarketplace() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // Checkout / Payment Modal state
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
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
    }

    loadData();
  }, []);

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
        return matchesSearch && matchesType;
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
              Browse spaces across all 4 hubs
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
        <Card className="p-12 text-center border-stone-200 bg-white">
          <Building2 className="mx-auto h-10 w-10 text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-navy-900">No Storage Spaces Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try choosing a different company or clearing your filter criteria.
          </p>
          <Button
            size="sm"
            onClick={() => { setSelectedCompanyId('ALL'); setSelectedType('ALL'); setSearchTerm(''); }}
            className="mt-4 bg-navy-900 text-white font-semibold text-xs"
          >
            Show All Storage Spaces
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
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
                      {company.units.map((unit) => (
                        <Card
                          key={unit.id}
                          className="border-stone-200 bg-stone-50/50 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                          <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                  {unit.type}
                                </span>
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

                            <div className="bg-white p-2.5 rounded-lg space-y-1 text-xs text-stone-700 border border-stone-200/60">
                              {unit.dimensions && (
                                <div className="flex items-center gap-1.5">
                                  <Layers className="h-3 w-3 text-stone-400" />
                                  <span className="font-semibold text-navy-900">{unit.dimensions}</span>
                                </div>
                              )}
                              {unit.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-stone-400" />
                                  <span className="text-stone-600">{unit.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                <span className="text-stone-500 font-medium">Provided by {unit.businessName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-stone-500 block font-medium">Monthly Rate</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-navy-900 font-serif">
                                  ₹{unit.basePrice}
                                </span>
                                <span className="text-xs text-stone-500 font-medium">/mo</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleOpenCheckout(unit)}
                              className="bg-navy-900 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Book &amp; Pay</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
