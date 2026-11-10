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
  ChevronRight,
  PlusCircle,
  FileText,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Client');
  const [loading, setLoading] = useState(true);

  // Quick Unlock timer
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSeconds, setUnlockSeconds] = useState(0);
  const [copiedPin, setCopiedPin] = useState(false);

  // AI Advisor State
  const [activeAiTab, setActiveAiTab] = useState<'savings' | 'space' | 'climate'>('savings');
  const [claimedDiscount, setClaimedDiscount] = useState(false);

  useEffect(() => {
    async function checkRole() {
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

          setUserName(profile?.name || user.email?.split('@')[0] || 'Client');
        } else {
          setUserName('Tanisha Sharma');
        }
      } catch {
        setUserName('Tanisha Sharma');
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  const handleRemoteUnlock = () => {
    setIsUnlocking(true);
    setUnlockSeconds(45);
    const interval = setInterval(() => {
      setUnlockSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsUnlocking(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-900 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. WELCOME HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6 sm:p-8 text-white shadow-md border border-stone-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                Tenant Self-Service Hub
              </span>
              <span className="text-xs text-stone-300">
                Verified Customer Account
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-stone-300 max-w-xl">
              You have <strong className="text-amber-400 font-semibold">3 active rented units</strong> across Mumbai, Bengaluru, and Delhi NCR. Gate access, invoices, and maintenance controls are ready below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/my-bookings">
              <Button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-sm">
                <Calendar className="h-4 w-4" />
                <span>Manage My Bookings</span>
              </Button>
            </Link>
            <Link href="/storage-spaces">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-amber-400" />
                <span>Browse New Spaces</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. 4 QUICK KPI OVERVIEW CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Units */}
        <Card className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Rented Units
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy-900">3 Units</div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">100% Occupancy</span>
            <span>&bull; All bays secure</span>
          </div>
        </Card>

        {/* Card 2: Next Payment Due */}
        <Card className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Next Rent Due
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy-900">₹6,800</div>
          <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
            <span>Due 28 Nov</span>
            <span className="text-stone-400 font-normal">&bull; #BLR-D88</span>
          </div>
        </Card>

        {/* Card 3: Primary Gate PIN */}
        <Card className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Primary Gate PIN
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-navy-900 tracking-wider">
            #8429
          </div>
          <div className="text-[11px] text-stone-500 truncate max-w-[170px]">
            Hindustan Cold Storage &bull; PIN
          </div>
        </Card>

        {/* Card 4: Climate Telemetry */}
        <Card className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Climate Status
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy-900">21.4°C</div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span>44% Humidity</span>
            <span className="text-stone-400 font-normal">&bull; Protected</span>
          </div>
        </Card>
      </div>

      {/* ── 2.5 AI STORAGE & LEASE ADVISOR WIDGET ── */}
      <Card className="p-5 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy-900 font-serif">
                  RentAll-Q AI Storage Advisor
                </h3>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-full">
                  96% Confidence Score
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Proactive intelligence analyzing your 3 rented bays, lease terms, and climate telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveAiTab('savings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeAiTab === 'savings'
                  ? 'bg-navy-900 text-amber-400 shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              💰 Pre-Pay &amp; Save
            </button>
            <button
              type="button"
              onClick={() => setActiveAiTab('space')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeAiTab === 'space'
                  ? 'bg-navy-900 text-amber-400 shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              📦 Space Capacity
            </button>
            <button
              type="button"
              onClick={() => setActiveAiTab('climate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeAiTab === 'climate'
                  ? 'bg-navy-900 text-amber-400 shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              🛡️ Climate Safety
            </button>
          </div>
        </div>

        {/* AI Insight Content */}
        {activeAiTab === 'savings' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Lease Alert &bull; Unit #BLR-D88
                </span>
                <span className="text-xs text-stone-500">Expires in 18 days (28 Nov 2026)</span>
              </div>
              <p className="text-xs text-stone-700 font-medium pt-0.5">
                Switching Unit #BLR-D88 (Urban Attic) from month-to-month to a <strong>3-month pre-paid renewal</strong> locks in a 10% loyalty discount (₹6,120/mo instead of ₹6,800/mo) &mdash; <strong className="text-emerald-700 font-bold">saves ₹2,040 total</strong>.
              </p>
            </div>

            <button
              type="button"
              disabled={claimedDiscount}
              onClick={() => setClaimedDiscount(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-60 transition"
            >
              {claimedDiscount ? '✓ 10% Discount Applied to Next Invoice!' : 'Claim 10% Pre-Pay Rate'}
            </button>
          </div>
        )}

        {activeAiTab === 'space' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  Volumetric Estimate &bull; Unit #MUM-A101
                </span>
                <span className="text-xs text-stone-500">10x10 Climate-Controlled (100 sq ft)</span>
              </div>
              <p className="text-xs text-stone-700 font-medium pt-0.5">
                Current estimated volumetric utilization is <strong>78%</strong>. You have room for approximately <strong>4-6 more standard moving totes</strong> by utilizing vertical wall shelving before needing a larger unit.
              </p>
            </div>

            <Link href="/storage-spaces">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
              >
                Explore Unit Upgrades &rarr;
              </button>
            </Link>
          </div>
        )}

        {activeAiTab === 'climate' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Telemetry Monitor &bull; Mumbai &amp; Bengaluru
                </span>
                <span className="text-xs text-emerald-700 font-bold">100% Online &bull; Optimal</span>
              </div>
              <p className="text-xs text-stone-700 font-medium pt-0.5">
                Continuous IoT sensor telemetry for #MUM-A101 (21.4°C, 44% RH) and #BLR-D88 (19.8°C, 48% RH) shows zero humidity spikes over the last 14 days. Your electronics and fabrics are completely protected from mildew.
              </p>
            </div>

            <Link href="/my-bookings">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-navy-900 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition"
              >
                Inspect Telemetry Sensors &rarr;
              </button>
            </Link>
          </div>
        )}
      </Card>

      {/* ── 3. DUAL COLUMN: QUICK GATE ACCESS & ACTIVE PORTFOLIO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rented Units Snapshot */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 font-serif">
                Your Rented Storage Portfolio
              </h2>
              <p className="text-xs text-stone-500">
                Click any unit to open full access, invoice slips, or unit maintenance.
              </p>
            </div>
            <Link
              href="/my-bookings"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Unit 1 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy-900 text-sm">
                      Unit #MUM-A101 &bull; 10x10 Climate-Controlled
                    </h3>
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hindustan Cold Storage & Logistics &bull; Ground Level Bay B-14
                  </p>
                  <div className="text-[11px] text-stone-400 mt-1">
                    PIN: <strong className="text-navy-900">#8429</strong> &bull; Next Rent: ₹8,500 due 15 Dec 2026
                  </div>
                </div>
              </div>

              <Link href="/my-bookings">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold text-navy-900 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span>Manage</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Unit 2 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy-900 text-sm">
                      Unit #BLR-D88 &bull; 15x20 Commercial Warehouse Bay
                    </h3>
                    <Badge className="text-[10px] bg-rose-50 text-rose-800 border-rose-200 font-bold animate-pulse">
                      Rent Due Soon
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Urban Attic Self-Storage &bull; Loading Dock Bay F-08
                  </p>
                  <div className="text-[11px] text-stone-400 mt-1">
                    PIN: <strong className="text-navy-900">#6190</strong> &bull; Next Rent: ₹6,800 due 28 Nov 2026
                  </div>
                </div>
              </div>

              <Link href="/my-bookings">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold text-navy-900 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span>Manage</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Unit 3 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy-900 text-sm">
                      Unit #DEL-V12 &bull; 20x10 Covered Vehicle Bay
                    </h3>
                    <Badge className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 font-bold">
                      Auto-Renew
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Capital Vault Warehousing &bull; Covered Ground Bay V-12
                  </p>
                  <div className="text-[11px] text-stone-400 mt-1">
                    PIN: <strong className="text-navy-900">#3374</strong> &bull; Next Rent: ₹16,500 due 10 Dec 2026
                  </div>
                </div>
              </div>

              <Link href="/my-bookings">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold text-navy-900 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span>Manage</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Keyless Gate Access & Quick Actions */}
        <div className="space-y-4">
          <Card className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900 text-sm">Fast Gate Unlock</h3>
                <p className="text-[11px] text-stone-500">Primary Austin Facility</p>
              </div>
              <KeyRound className="h-5 w-5 text-amber-600" />
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="font-mono text-xl font-bold tracking-widest text-navy-900">
                #8429
              </div>
              <button
                type="button"
                onClick={() => handleCopyPin('8429')}
                className="text-xs font-semibold text-stone-600 hover:text-navy-900 cursor-pointer flex items-center gap-1"
              >
                {copiedPin ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <Button
              type="button"
              disabled={isUnlocking}
              onClick={handleRemoteUnlock}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-sm"
            >
              <Unlock className="h-4 w-4 text-amber-400" />
              <span>{isUnlocking ? `Gate Unlocked (${unlockSeconds}s)` : '1-Click Remote Gate Unlock'}</span>
            </Button>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Quick Shortcuts
            </span>
            <div className="space-y-1.5">
              <Link
                href="/my-bookings"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-navy-900 hover:border-amber-400 hover:bg-amber-50/30 transition"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>My Bookings &amp; Units</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </Link>

              <Link
                href="/storage-spaces"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-navy-900 hover:border-amber-400 hover:bg-amber-50/30 transition"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>Browse Storage Spaces</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </Link>

              <Link
                href="/my-payments"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-navy-900 hover:border-amber-400 hover:bg-amber-50/30 transition"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  <span>Payments &amp; Receipts</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </Link>

              <Link
                href="/request"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-navy-900 hover:border-amber-400 hover:bg-amber-50/30 transition"
              >
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-amber-600" />
                  <span>Help &amp; Maintenance</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
