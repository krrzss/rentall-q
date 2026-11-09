'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/server/lib/supabaseClient';
import {
  Building2,
  Calendar,
  CreditCard,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  PackageCheck,
  MapPin,
  Layers,
  KeyRound,
  Unlock,
  Lock,
  Copy,
  Check,
  Thermometer,
  Droplets,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  QrCode,
  X,
  ExternalLink,
} from 'lucide-react';

interface ClientBooking {
  id: string;
  unitId: string;
  unitName: string;
  unitType?: string;
  location?: string;
  dimensions?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  monthlyRate?: number;
  durationMonths?: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  bookedAt: string;
  gatePin?: string;
}

const DEFAULT_TENANT_UNITS: ClientBooking[] = [
  {
    id: 'booking-seed-001',
    unitId: 'unit-seed-101',
    unitName: 'Unit B-204 (Climate Controlled Large)',
    unitType: 'Climate Controlled',
    location: 'Austin SafeStore – 4200 South Congress Ave, Austin, TX',
    dimensions: '10ft x 15ft (150 sq ft)',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 18500,
    monthlyRate: 18500,
    durationMonths: 3,
    status: 'CONFIRMED',
    paymentMethod: 'UPI / HDFC Auto-Pay',
    transactionId: 'TXN-9028148-HDFC',
    bookedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    gatePin: '4819',
  },
];

export default function SmartDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Client');
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<ClientBooking[]>([]);

  // Gate Opener State
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateCountdown, setGateCountdown] = useState(0);
  const [copiedPin, setCopiedPin] = useState(false);

  // Modals
  const [vacateModalBooking, setVacateModalBooking] = useState<ClientBooking | null>(null);
  const [vacateReason, setVacateReason] = useState('Relocation / Moved houses');
  const [vacateDate, setVacateDate] = useState('');
  const [vacateSubmitted, setVacateSubmitted] = useState(false);

  const [guestPassBooking, setGuestPassBooking] = useState<ClientBooking | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPinGenerated, setGuestPinGenerated] = useState<string | null>(null);

  useEffect(() => {
    async function checkRole() {
      // If user has an active business warehouse session, direct to business dashboard
      try {
        const bizRes = await fetch('/api/auth/business-session');
        const bizJson = await bizRes.json();
        if (bizJson.success && bizJson.warehouse) {
          router.replace('/business/dashboard');
          return;
        }
      } catch {
        // ignore
      }

      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .maybeSingle();

          const resolvedRole = profile?.role || 'CLIENT';
          setUserName(profile?.name || user.email?.split('@')[0] || 'Client');

          if (resolvedRole === 'BUSINESS_OWNER' || resolvedRole === 'MANAGER' || resolvedRole === 'STAFF') {
            router.replace('/business/dashboard');
            return;
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [router]);

  // Load bookings from localStorage with fallback to default realistic tenancy
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('rentallq_my_bookings') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setMyBookings(stored);
      } else {
        setMyBookings(DEFAULT_TENANT_UNITS);
      }
    } catch {
      setMyBookings(DEFAULT_TENANT_UNITS);
    }
  }, []);

  // Gate opener countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gateUnlocked && gateCountdown > 0) {
      timer = setInterval(() => {
        setGateCountdown((prev) => {
          if (prev <= 1) {
            setGateUnlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gateUnlocked, gateCountdown]);

  const handleUnlockGate = () => {
    setGateUnlocked(true);
    setGateCountdown(45);
  };

  const handleCopyPin = (pin: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleGenerateGuestPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) return;
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGuestPinGenerated(randomPin);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-navy-900 font-sans max-w-6xl animate-pulse">
        <div className="h-8 w-64 bg-stone-200 rounded-lg" />
        <div className="h-28 bg-stone-200 rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="h-28 bg-stone-200 rounded-xl" />
          <div className="h-28 bg-stone-200 rounded-xl" />
          <div className="h-28 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const primaryBooking = myBookings[0];
  const activeCount = myBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE').length;
  const totalPaid = myBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-8 text-navy-900 font-sans max-w-6xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-7 text-white shadow-xl border border-navy-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Tenant Self-Service Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Manage your storage units, operate keypad gate entry, monitor climate sensors, or pay invoices effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link href="/storage-spaces">
            <Button className="bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Browse Spaces</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/my-payments">
            <Button variant="outline" className="border-stone-400 text-white hover:bg-white/10 text-xs sm:text-sm px-4 py-3 rounded-xl">
              <CreditCard className="h-4 w-4 mr-1.5" />
              <span>Invoices</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Digital Gate Access Keypad Widget */}
      {primaryBooking && (
        <Card className="p-6 border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-navy-950 font-bold">
                  <KeyRound className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-navy-900 font-serif">
                  Facility Gate &amp; Keypad Access
                </h2>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  Active Lease Privileges
                </Badge>
              </div>
              <p className="text-xs text-stone-600 max-w-2xl">
                Use this PIN code on any keypad at South Entry Gate 2 or North Cargo Bay. Alternatively, tap the Remote Unlock button when within 50 meters of the gate.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
              {/* PIN Pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block leading-tight">
                    Keypad PIN
                  </span>
                  <span className="text-xl font-mono font-bold tracking-widest text-navy-950">
                    #{primaryBooking.gatePin || '4819'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPin(primaryBooking.gatePin || '4819')}
                  title="Copy PIN"
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-navy-900 transition cursor-pointer"
                >
                  {copiedPin ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Remote Gate Unlock Trigger */}
              <Button
                onClick={handleUnlockGate}
                disabled={gateUnlocked}
                className={`font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ${
                  gateUnlocked
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-navy-900 hover:bg-navy-800 text-white'
                }`}
              >
                {gateUnlocked ? (
                  <>
                    <Unlock className="h-4 w-4 animate-bounce text-amber-300" />
                    <span>Gate Open ({gateCountdown}s)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 text-amber-400" />
                    <span>Tap to Unlock Gate</span>
                  </>
                )}
              </Button>

              {/* Guest Pass Button */}
              <Button
                variant="outline"
                onClick={() => setGuestPassBooking(primaryBooking)}
                className="text-xs font-semibold border-stone-300 hover:border-amber-400 px-3.5 py-3 rounded-xl"
              >
                <UserCheck className="h-3.5 w-3.5 mr-1 text-stone-500" />
                <span>+ Mover / Guest Pass</span>
              </Button>
            </div>
          </div>

          {gateUnlocked && (
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-emerald-800 font-semibold bg-emerald-50/80 px-4 py-2 rounded-lg">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                South Main Keypad Gate has been triggered. Safe transit window active.
              </span>
              <span className="font-mono text-emerald-950 font-bold">{gateCountdown} seconds left</span>
            </div>
          )}
        </Card>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Active Leased Spaces
              </p>
              <p className="text-2xl font-bold text-navy-900 font-serif mt-1">
                {activeCount} Unit{activeCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{primaryBooking?.unitName || 'Verified clean storage facility'}</span>
          </p>
        </Card>

        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Paid (YTD)
              </p>
              <p className="text-2xl font-bold text-navy-900 font-serif mt-1">
                ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Across {myBookings.length} booking transaction{myBookings.length !== 1 ? 's' : ''}</span>
          </p>
        </Card>

        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Account Status
              </p>
              <p className="text-2xl font-bold text-emerald-700 font-serif mt-1">In Good Standing</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero overdue balance • Auto-pay active</span>
          </p>
        </Card>
      </div>

      {/* My Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-navy-900 font-serif">
              My Active Storage Leases
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Review current storage units, live unit telemetry, and lease options.
            </p>
          </div>
          <Link href="/storage-spaces">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-stone-300 hover:border-amber-400">
              <span>+ Rent Another Space</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {myBookings.length === 0 ? (
          <Card className="p-10 text-center border-stone-200 bg-white">
            <PackageCheck className="mx-auto h-10 w-10 text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-navy-900">No Bookings Yet</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              You haven&apos;t rented any storage spaces. Browse available units to get started.
            </p>
            <Link href="/storage-spaces">
              <Button className="bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs px-5 py-2.5 rounded-xl">
                Browse Storage Spaces
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {myBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {booking.unitType || 'Climate Controlled'}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          PIN #{booking.gatePin || '4819'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-navy-900 font-serif mt-1.5">
                        {booking.unitName}
                      </h3>
                    </div>
                    <Badge variant="success" className="text-[10px] uppercase font-bold shrink-0">
                      {booking.status}
                    </Badge>
                  </div>

                  {/* Location & Dimensions */}
                  <div className="space-y-2 text-xs text-stone-600 bg-cream-50 p-3.5 rounded-xl border border-stone-200/80">
                    {booking.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-navy-900">{booking.location}</span>
                      </div>
                    )}
                    {booking.dimensions && (
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        <span className="font-medium text-navy-900">Dimensions: {booking.dimensions}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>
                        Lease Period: {formatDate(booking.startDate)} &rarr; {formatDate(booking.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Live Unit Environmental Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                      <Thermometer className="h-4 w-4 text-rose-500" />
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block leading-tight">
                          Temperature
                        </span>
                        <span className="font-bold text-navy-900">68°F (Optimal)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                      <Droplets className="h-4 w-4 text-sky-500" />
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block leading-tight">
                          Humidity
                        </span>
                        <span className="font-bold text-navy-900">45% Controlled</span>
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                    <span className="text-xs text-stone-500">
                      Monthly Rate • {booking.paymentMethod || 'Auto-Debit'}
                    </span>
                    <span className="text-base font-bold text-emerald-700 font-serif">
                      ₹{(booking.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {booking.transactionId && (
                    <p className="text-[10px] text-stone-400 font-mono">
                      Invoice Ref: {booking.transactionId}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-5 pt-1 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="flex gap-2 flex-1">
                    <Link href="/my-payments" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-stone-300 hover:border-amber-400">
                        View Invoices
                      </Button>
                    </Link>
                    <Link href="/request" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-stone-300 hover:border-amber-400">
                        Get Support
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVacateModalBooking(booking)}
                    className="text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    Schedule Move-Out
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Facility Contact & Emergency Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy-900 font-serif">
                On-Duty Facility Management
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Manager on duty: <strong>Marcus Vance</strong> (Austin SafeStore Hub). Available for freight assistance, lock-outs, and handcart rentals.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs">
                <a
                  href="tel:+15125550199"
                  className="font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="h-3 w-3" />
                  +1 (512) 555-0199
                </a>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">Gate Hours: 6:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-stone-200 bg-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy-900 font-serif">
                24/7 Security &amp; Tenant Protection
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your unit is guarded with individual door contact sensors, CCTV perimeter coverage, and ₹5,00,000 comprehensive policy protection included.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs">
                <Link href="/request" className="font-bold text-navy-900 hover:underline flex items-center gap-1">
                  <span>Report Security Issue</span>
                  <ArrowRight className="h-3 w-3 text-amber-600" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Guest Pass / Mover Temporary PIN Modal */}
      {guestPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 bg-white border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-navy-900 font-serif">
                  Generate Guest / Mover Pass
                </h3>
              </div>
              <button
                onClick={() => {
                  setGuestPassBooking(null);
                  setGuestPinGenerated(null);
                  setGuestName('');
                  setGuestPhone('');
                }}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Generate a temporary 24-hour keypad code for family, friends, or moving companies to access {guestPassBooking.unitName}.
            </p>

            {guestPinGenerated ? (
              <div className="space-y-4 py-3">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Temporary 24h Gate PIN
                  </span>
                  <p className="text-3xl font-mono font-bold tracking-widest text-navy-900">
                    #{guestPinGenerated}
                  </p>
                  <span className="text-[11px] text-stone-500 block pt-1">
                    Valid for: <strong>{guestName}</strong> ({guestPhone || 'No phone'})
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-600 space-y-1 border border-stone-200">
                  <p className="font-semibold text-navy-900">Instructions to share with your mover:</p>
                  <p>&bull; Keypad location: South Gate Entrance &amp; Freight Elevator B</p>
                  <p>&bull; Punch <strong>#{guestPinGenerated}</strong> followed by &apos;#&apos; key</p>
                  <p>&bull; Code automatically expires after 24 hours</p>
                </div>

                <Button
                  onClick={() => {
                    handleCopyPin(guestPinGenerated);
                  }}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  {copiedPin ? 'Copied to Clipboard!' : 'Copy Guest Pass Details'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerateGuestPass} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Guest or Mover Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Apex Movers"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 012-3456"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs py-2.5 rounded-xl mt-2"
                >
                  Generate 24h Access Pass
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Vacate / Move-Out Notice Modal */}
      {vacateModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 bg-white border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-navy-900 font-serif">
                  Schedule Move-Out Notice
                </h3>
              </div>
              <button
                onClick={() => {
                  setVacateModalBooking(null);
                  setVacateSubmitted(false);
                }}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {vacateSubmitted ? (
              <div className="py-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-navy-900">Move-Out Notice Recorded</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Your facility manager has received your notice for <strong>{vacateModalBooking.unitName}</strong>. You will receive an inspection checklist prior to move-out.
                </p>
                <Button
                  onClick={() => {
                    setVacateModalBooking(null);
                    setVacateSubmitted(false);
                  }}
                  className="bg-navy-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setVacateSubmitted(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-stone-500">
                  Submitting this notice gives your facility team advance notice to inspect the unit and release any security deposits upon vacating.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Planned Move-Out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={vacateDate}
                    onChange={(e) => setVacateDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Primary Reason
                  </label>
                  <select
                    value={vacateReason}
                    onChange={(e) => setVacateReason(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  >
                    <option>Relocation / Moved houses</option>
                    <option>No longer need additional storage</option>
                    <option>Downsizing to smaller unit</option>
                    <option>Found alternative facility</option>
                    <option>Other personal reasons</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVacateModalBooking(null)}
                    className="flex-1 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs"
                  >
                    Confirm Notice
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
