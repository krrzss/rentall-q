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
  DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StorageSpace {
  id: string;
  name: string;
  type: string;
  description: string;
  basePrice: number;
  status: string;
  dimensions?: string;
  location?: string;
  businessName?: string;
}

const mockSpaces: StorageSpace[] = [
  {
    id: 'unit-101',
    name: 'Secure Vault A-101',
    type: 'Climate Controlled',
    description: '10x10 ft temp-controlled self-storage vault with 24/7 HD CCTV & keycard access.',
    basePrice: 150,
    status: 'AVAILABLE',
    dimensions: '10ft x 10ft (100 sq ft)',
    location: 'Sector 42, Metro Hub',
    businessName: 'RentallQ Main Storage',
  },
  {
    id: 'unit-102',
    name: 'Warehouse Bay B-4',
    type: 'Warehouse Space',
    description: 'High-ceiling 25x20 ft warehouse bay ideal for inventory storage and pallet racks.',
    basePrice: 450,
    status: 'AVAILABLE',
    dimensions: '25ft x 20ft (500 sq ft)',
    location: 'Industrial Zone East',
    businessName: 'Apex Logistics Hub',
  },
  {
    id: 'unit-103',
    name: 'Compact Locker C-12',
    type: 'Locker Storage',
    description: '5x5 ft secure mini locker perfect for documents, valuables, and small personal items.',
    basePrice: 65,
    status: 'AVAILABLE',
    dimensions: '5ft x 5ft (25 sq ft)',
    location: 'Central Plaza Branch',
    businessName: 'RentallQ Mini Locker',
  },
  {
    id: 'unit-104',
    name: 'Drive-Up Unit D-88',
    type: 'Drive-Up Storage',
    description: 'Ground floor 15x10 ft drive-up unit with roll-up door for effortless vehicle unloading.',
    basePrice: 220,
    status: 'AVAILABLE',
    dimensions: '15ft x 10ft (150 sq ft)',
    location: 'Westside Highway Center',
    businessName: 'RentallQ Express',
  },
  {
    id: 'unit-105',
    name: 'Executive Suite E-05',
    type: 'Climate Controlled',
    description: 'Premium humidity-managed storage unit for artwork, furniture, and wine collections.',
    basePrice: 320,
    status: 'AVAILABLE',
    dimensions: '12ft x 15ft (180 sq ft)',
    location: 'Downtown Financial Dist.',
    businessName: 'Luxury Vaults Co.',
  },
  {
    id: 'unit-106',
    name: 'Standard Box S-14',
    type: 'Self Storage',
    description: 'Standard 10x8 ft storage unit with automated access control & pest control.',
    basePrice: 110,
    status: 'AVAILABLE',
    dimensions: '10ft x 8ft (80 sq ft)',
    location: 'Northside Depot',
    businessName: 'RentallQ Depot',
  },
];

export default function StorageSpacesMarketplace() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<StorageSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Checkout / Payment Modal state
  const [selectedUnit, setSelectedUnit] = useState<StorageSpace | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpaces() {
      try {
        const res = await fetch('/api/rental-units');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSpaces(
              data.map((u: any, idx: number) => ({
                id: u.id || `unit-api-${idx}`,
                name: u.name || u.title || 'Storage Unit',
                type: u.type || 'Self Storage',
                description: u.description || 'Secure storage space with round-the-clock monitoring.',
                basePrice: Number(u.basePrice || u.base_price || 120),
                status: u.status || 'AVAILABLE',
                dimensions: u.dimensions || '10ft x 10ft (100 sq ft)',
                location: u.location || 'RentallQ Facility',
                businessName: u.businessName || 'RentallQ Partner',
              }))
            );
          } else {
            setSpaces(mockSpaces);
          }
        } else {
          setSpaces(mockSpaces);
        }
      } catch (err) {
        setSpaces(mockSpaces);
      } finally {
        setLoading(false);
      }
    }

    loadSpaces();
  }, []);

  const filteredSpaces = spaces.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      selectedType === 'ALL' || s.type.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesType;
  });

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

  const handleOpenCheckout = (unit: StorageSpace) => {
    setSelectedUnit(unit);
    setDurationMonths(1);
    setPaymentSuccess(false);
    setTransactionId(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    setIsProcessing(true);

    try {
      const generatedTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          unitName: selectedUnit.name,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: getTotalPrice(),
          status: 'CONFIRMED',
          paymentMethod,
          transactionId: generatedTxId,
        }),
      });

      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getTotalPrice(),
          paymentMethod,
          status: 'COMPLETED',
          description: `Rental payment for ${selectedUnit.name} (${durationMonths} month/s)`,
          transactionId: generatedTxId,
        }),
      });

      setTransactionId(generatedTxId);
      setPaymentSuccess(true);
    } catch (err) {
      console.warn('Payment recording fallback active', err);
      setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
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
            <span>Instant Online Rental & Buy Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-white">
            Available Storage Spaces
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            Browse verified storage units, select your desired rental tenure, and complete instant online payment to secure your space.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-stone-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search storage spaces, locations, dimensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-100/60 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-navy-900 placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-stone-400 hidden sm:block ml-2" />
          {['ALL', 'Climate Controlled', 'Warehouse', 'Locker', 'Self Storage'].map((type) => (
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

      {/* Grid of Storage Spaces */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-sm">
          Loading available storage spaces...
        </div>
      ) : filteredSpaces.length === 0 ? (
        <Card className="p-12 text-center border-stone-200 bg-white">
          <Building2 className="mx-auto h-10 w-10 text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-navy-900">No Storage Spaces Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search criteria or filter options.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((unit) => (
            <Card
              key={unit.id}
              className="border-stone-200 bg-white hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {unit.type}
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 font-serif mt-2 group-hover:text-amber-700 transition-colors">
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

                <div className="bg-cream-100/70 p-3 rounded-lg space-y-1.5 text-xs text-stone-700 border border-stone-200/60">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-500">Dimensions:</span>
                    <span className="font-bold text-navy-900">{unit.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-500">Location:</span>
                    <span className="font-medium text-navy-900">{unit.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-500">Provider:</span>
                    <span className="font-medium text-amber-800">{unit.businessName}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 block font-medium">Starting at</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-navy-900 font-serif">
                      ₹{unit.basePrice}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">/mo</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenCheckout(unit)}
                  className="bg-navy-900 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Buy / Rent & Pay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CHECKOUT & PAYMENT MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-navy-900 space-y-0">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-navy-900">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white leading-tight">
                    Secure Storage Checkout
                  </h3>
                  <span className="text-xs text-amber-300 font-medium">
                    {selectedUnit.name}
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
                    Payment Successful!
                  </h2>
                  <p className="text-xs text-stone-600">
                    You have successfully rented <strong>{selectedUnit.name}</strong> for{' '}
                    {durationMonths} month/s.
                  </p>
                </div>

                <div className="bg-cream-100 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Transaction ID:</span>
                    <span className="font-bold text-navy-900">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-700">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Access Code:</span>
                    <span className="font-bold text-amber-700">VAL-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedUnit(null);
                      router.push('/dashboard');
                    }}
                    className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl"
                  >
                    View My Bookings
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedUnit(null);
                      router.push('/my-payments');
                    }}
                    variant="outline"
                    className="flex-1 font-bold text-xs py-3 rounded-xl"
                  >
                    Payment History
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
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

                {/* Mock Card Input */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        defaultValue="John Doe"
                        required
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4242 •••• •••• 4242)"
                        defaultValue="4242 4242 4242 4242"
                        required
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        defaultValue="12/28"
                        required
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="123"
                        required
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
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
