'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Calendar,
  CreditCard,
  KeyRound,
  Unlock,
  Lock,
  Copy,
  Check,
  Thermometer,
  Droplets,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  LogOut,
  FileText,
  UserCheck,
  PlusCircle,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface RentedUnit {
  id: string;
  unitNumber: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  facilityCity: string;
  managerName: string;
  managerPhone: string;
  accessHours: string;
  sizeCategory: string;
  dimensions: string;
  sqFt: number;
  floorLevel: string;
  isClimateControlled: boolean;
  temperature: string;
  humidity: string;
  storedItemsSummary: string;
  monthlyRent: number;
  bookedAt: string;
  leaseEndDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'DUE_SOON' | 'AUTO_RENEW';
  gatePin: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  lastTransactionId: string;
  nextDueDate: string;
  autoPayEnabled: boolean;
}

const MOCK_RENTED_UNITS: RentedUnit[] = [
  {
    id: 'rented-unit-001',
    unitNumber: '#ATX-104',
    facilityId: 'b1000000-0000-0000-0000-000000000001',
    facilityName: 'Austin SafeStore & Central Depot',
    facilityAddress: '4200 Industrial Blvd, Austin, TX 78744',
    facilityCity: 'Austin, TX',
    managerName: 'Marcus Vance',
    managerPhone: '(512) 555-0192',
    accessHours: '24/7 Gate Access (Keypad Enabled)',
    sizeCategory: 'Medium Space',
    dimensions: '10ft x 10ft',
    sqFt: 100,
    floorLevel: 'Ground Level • Drive-Up Roll-Up Door',
    isClimateControlled: true,
    temperature: '21.4°C (70.5°F)',
    humidity: '44% RH',
    storedItemsSummary: '2 BHK Household Furniture, Books, Electronics & Wardrobes',
    monthlyRent: 145.0,
    bookedAt: '15 Jan 2026',
    leaseEndDate: '15 Dec 2026',
    daysRemaining: 35,
    status: 'ACTIVE',
    gatePin: '8429',
    lastPaymentDate: '15 Nov 2026',
    lastPaymentAmount: 145.0,
    lastTransactionId: 'TXN-ATX-882194',
    nextDueDate: '15 Dec 2026',
    autoPayEnabled: true,
  },
  {
    id: 'rented-unit-002',
    unitNumber: '#CHI-208',
    facilityId: 'b2000000-0000-0000-0000-000000000002',
    facilityName: 'Chicago MetroHub Micro-Depot',
    facilityAddress: '890 Logistics Way, Chicago, IL 60607',
    facilityCity: 'Chicago, IL',
    managerName: 'Elena Rostova',
    managerPhone: '(312) 555-8831',
    accessHours: '6:00 AM – 10:00 PM Daily',
    sizeCategory: 'Commercial Warehouse Bay',
    dimensions: '15ft x 20ft',
    sqFt: 300,
    floorLevel: 'Loading Dock Level • Double Security Shutter',
    isClimateControlled: true,
    temperature: '19.8°C (67.6°F)',
    humidity: '48% RH',
    storedItemsSummary: 'E-commerce Inventory, Packaging Cartons & Fulfillment Supplies',
    monthlyRent: 320.0,
    bookedAt: '01 Aug 2026',
    leaseEndDate: '28 Nov 2026',
    daysRemaining: 18,
    status: 'DUE_SOON',
    gatePin: '6190',
    lastPaymentDate: '28 Oct 2026',
    lastPaymentAmount: 320.0,
    lastTransactionId: 'TXN-CHI-491022',
    nextDueDate: '28 Nov 2026',
    autoPayEnabled: false,
  },
  {
    id: 'rented-unit-003',
    unitNumber: '#SEA-012',
    facilityId: 'b3000000-0000-0000-0000-000000000003',
    facilityName: 'Seattle Pacific Port & Fleet Terminal',
    facilityAddress: '1400 Harbor Ave SW, Seattle, WA 98116',
    facilityCity: 'Seattle, WA',
    managerName: 'Dave Kowalski',
    managerPhone: '(206) 555-4019',
    accessHours: '24/7 Security Gate with CCTV Patrol',
    sizeCategory: 'Vehicle & Container Bay',
    dimensions: '10ft x 20ft',
    sqFt: 200,
    floorLevel: 'Covered High-Clearance Ground Bay',
    isClimateControlled: false,
    temperature: '17.2°C (63.0°F)',
    humidity: '51% RH',
    storedItemsSummary: '1968 Classic Sedan, Spare Wheels & Metal Tool Chest',
    monthlyRent: 210.0,
    bookedAt: '10 Sep 2026',
    leaseEndDate: '10 Jan 2027',
    daysRemaining: 61,
    status: 'AUTO_RENEW',
    gatePin: '3374',
    lastPaymentDate: '10 Nov 2026',
    lastPaymentAmount: 210.0,
    lastTransactionId: 'TXN-SEA-902311',
    nextDueDate: '10 Dec 2026',
    autoPayEnabled: true,
  },
];

type ActiveTab = 'overview' | 'access' | 'billing' | 'service';

export default function MyBookingsPage() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(MOCK_RENTED_UNITS[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Gate PIN feedback
  const [copiedPin, setCopiedPin] = useState(false);

  // Remote Gate Unlock
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSeconds, setUnlockSeconds] = useState(0);

  // Modals
  const [showGuestPassModal, setShowGuestPassModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPassResult, setGuestPassResult] = useState<string | null>(null);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceCategory, setMaintenanceCategory] = useState('Lock Stiff or Keypad Issue');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [maintenanceSubmitted, setMaintenanceSubmitted] = useState(false);

  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState('2026-12-15');
  const [moveOutConfirmed, setMoveOutConfirmed] = useState(false);

  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const currentUnit =
    MOCK_RENTED_UNITS.find((u) => u.id === selectedUnitId) || MOCK_RENTED_UNITS[0];

  const handleCopyPin = () => {
    navigator.clipboard.writeText(currentUnit.gatePin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

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

  const handleGenerateGuestPass = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGuestPassResult(pin);
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    setMaintenanceSubmitted(true);
    setTimeout(() => {
      setShowMaintenanceModal(false);
      setMaintenanceSubmitted(false);
      setMaintenanceNote('');
    }, 2200);
  };

  const handlePayRent = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        setPaymentSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Active Storage Portfolio
            </span>
            <span className="text-xs text-stone-500 font-medium">
              3 Units Across 3 Cities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 font-serif mt-1">
            My Rented Storage Spaces
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Select any unit below to view facility details, digital gate access, invoices, or request maintenance.
          </p>
        </div>
        <Link href="/storage-spaces">
          <Button className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white cursor-pointer shadow-sm">
            <PlusCircle className="h-4 w-4 text-amber-400" />
            <span>Rent Another Space</span>
          </Button>
        </Link>
      </div>

      {/* ── 1. UNIT SELECTOR CARDS (Top Bar) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_RENTED_UNITS.map((unit) => {
          const isSelected = unit.id === selectedUnitId;
          return (
            <div
              key={unit.id}
              onClick={() => setSelectedUnitId(unit.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white/80 border-stone-200 hover:border-amber-300 hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? 'bg-navy-900 text-amber-400 shadow-xs'
                        : 'bg-cream-100 text-navy-800'
                    }`}
                  >
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-base flex items-center gap-1.5">
                      <span>{unit.unitNumber}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-500 text-navy-950 font-bold px-1.5 py-0.2 rounded-full">
                          Viewing
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium truncate max-w-[170px]">
                      {unit.facilityName}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    unit.status === 'ACTIVE'
                      ? 'outline'
                      : unit.status === 'DUE_SOON'
                      ? 'danger'
                      : 'default'
                  }
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    unit.status === 'ACTIVE'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : unit.status === 'DUE_SOON'
                      ? 'border-rose-300 bg-rose-50 text-rose-800 animate-pulse'
                      : 'border-sky-300 bg-sky-50 text-sky-800'
                  }`}
                >
                  {unit.status === 'ACTIVE'
                    ? 'Active'
                    : unit.status === 'DUE_SOON'
                    ? 'Due Soon'
                    : 'Auto-Renew'}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">{unit.dimensions} ({unit.sqFt} sqft)</span>
                <span className="font-bold text-navy-900">${unit.monthlyRent}/mo</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. SELECTED UNIT 360° MANAGEMENT COMMAND CENTER ── */}
      <Card className="border border-stone-200 bg-white shadow-md overflow-hidden rounded-2xl">
        {/* Banner Header for Selected Unit */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold font-serif text-amber-400">
                  Unit {currentUnit.unitNumber}
                </span>
                <span className="text-xs text-stone-300 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                  {currentUnit.sizeCategory}
                </span>
                <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Lease Active ({currentUnit.daysRemaining} Days Left)
                </span>
              </div>
              <p className="text-sm text-stone-200 font-medium flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>{currentUnit.facilityName}</span>
                <span className="text-stone-400">&bull;</span>
                <span className="text-stone-300">{currentUnit.facilityAddress}</span>
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAgreementModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border border-white/15"
              >
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>Lease Contract</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-navy-950 transition cursor-pointer shadow-sm"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Request Maintenance</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-t border-white/10 pt-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Unit Specs & Telemetry', icon: Layers },
              { id: 'access', label: 'Gate Access & PIN', icon: KeyRound },
              { id: 'billing', label: 'Rent & Invoices', icon: CreditCard },
              { id: 'service', label: 'Move-Out & Help', icon: LogOut },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 sm:p-8">
          {/* ── TAB 1: OVERVIEW & TELEMETRY ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Specs Box */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Unit Specifications
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Dimensions:</span>
                      <span className="font-bold text-navy-900">{currentUnit.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total Area:</span>
                      <span className="font-bold text-navy-900">{currentUnit.sqFt} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Floor Level:</span>
                      <span className="font-bold text-navy-900">{currentUnit.floorLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Monthly Rent:</span>
                      <span className="font-bold text-amber-700">${currentUnit.monthlyRent} / mo</span>
                    </div>
                  </div>
                </div>

                {/* Climate & Telemetry Box */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Climate Telemetry
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Sensors Online
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Thermometer className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-400">Temp</div>
                        <div className="text-xs font-bold text-navy-900">{currentUnit.temperature}</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                        <Droplets className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-400">Humidity</div>
                        <div className="text-xs font-bold text-navy-900">{currentUnit.humidity}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Climate telemetry is monitored 24/7 to protect stored valuables from mold and heat damage.
                  </p>
                </div>

                {/* Facility & Manager Contact */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Facility Manager
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Manager:</span>
                      <span className="font-bold text-navy-900">{currentUnit.managerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <a href={`tel:${currentUnit.managerPhone}`} className="font-bold text-sky-700 hover:underline flex items-center gap-1">
                        <PhoneCall className="h-3 w-3" />
                        <span>{currentUnit.managerPhone}</span>
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Gate Hours:</span>
                      <span className="font-medium text-stone-700">{currentUnit.accessHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What is Stored Card */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Stored Valuables Notes
                  </span>
                  <p className="text-sm font-medium text-navy-900">
                    {currentUnit.storedItemsSummary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(true)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 underline whitespace-nowrap cursor-pointer"
                >
                  Report an issue with this unit &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: PHYSICAL GATE ACCESS & REMOTE UNLOCK ── */}
          {activeTab === 'access' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gate PIN Card */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">Keyless Gate Access PIN</h3>
                    <p className="text-xs text-stone-500">
                      Use this 4-digit code on the facility keypad followed by &apos;#&apos;.
                    </p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-stone-300">
                  <div className="flex-1 font-mono text-2xl font-bold tracking-widest text-navy-900">
                    #{currentUnit.gatePin}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPin}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    {copiedPin ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-600" />
                        <span>Copy PIN</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-3 bg-cream-100 rounded-xl text-xs text-stone-600 space-y-1">
                  <div className="font-semibold text-navy-900">Access Instructions:</div>
                  <div>1. Pull up to {currentUnit.facilityName} front gate.</div>
                  <div>2. Enter <strong className="text-navy-900">#{currentUnit.gatePin}</strong> on the intercom keypad.</div>
                  <div>3. Gate will open automatically and hold for 60 seconds.</div>
                </div>
              </div>

              {/* Remote Unlock & Guest Pass Card */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div>
                  <h3 className="font-bold text-navy-900 text-sm">Digital Gate Controls</h3>
                  <p className="text-xs text-stone-500">
                    Open the gate remotely from your phone or create a temporary pass for movers.
                  </p>
                </div>

                {/* 1-Click Unlock */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">One-Tap Remote Unlock</span>
                    {isUnlocking && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                        Gate Open ({unlockSeconds}s)
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    disabled={isUnlocking}
                    onClick={handleRemoteUnlock}
                    className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-2.5 cursor-pointer shadow-sm"
                  >
                    <Unlock className="h-4 w-4 text-amber-400" />
                    <span>{isUnlocking ? `Gate Unlocked (${unlockSeconds}s)` : 'Tap to Unlock Front Gate'}</span>
                  </Button>
                </div>

                {/* Guest / Mover Pass button */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">Mover / Guest Pass</h4>
                    <p className="text-[11px] text-stone-500">Generate a 24-hour temporary PIN for friends or movers.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setGuestPassResult(null);
                      setGuestName('');
                      setShowGuestPassModal(true);
                    }}
                    className="text-xs font-bold text-navy-900 cursor-pointer"
                  >
                    Create Pass
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: BILLING & INVOICES ── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                  <span className="text-xs font-semibold text-stone-500">Monthly Rent</span>
                  <div className="text-2xl font-bold text-navy-900 mt-1">${currentUnit.monthlyRent}</div>
                  <span className="text-[11px] text-stone-400">Billed on the {currentUnit.nextDueDate.split(' ')[0]}th monthly</span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                  <span className="text-xs font-semibold text-stone-500">Next Due Date</span>
                  <div className="text-2xl font-bold text-navy-900 mt-1">{currentUnit.nextDueDate}</div>
                  <span className={`text-[11px] font-bold ${currentUnit.status === 'DUE_SOON' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {currentUnit.status === 'DUE_SOON' ? '⚠️ Payment Due Soon' : 'Paid in Advance'}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-500">Action</span>
                    <div className="text-xs font-bold text-navy-900 mt-1">Make Next Payment</div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowPayModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs mt-2 cursor-pointer shadow-xs"
                  >
                    Pay Next Month (${currentUnit.monthlyRent})
                  </Button>
                </div>
              </div>

              {/* Invoices History Table for this unit */}
              <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
                <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Recent Invoices for {currentUnit.unitNumber}
                  </h4>
                  <Link href="/my-payments" className="text-xs font-semibold text-sky-700 hover:underline">
                    View Complete Payments Hub &rarr;
                  </Link>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy-900">{currentUnit.lastTransactionId}</div>
                      <div className="text-stone-400 text-[11px]">Paid on {currentUnit.lastPaymentDate} via Auto-Pay</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy-900">${currentUnit.lastPaymentAmount.toFixed(2)}</div>
                      <span className="inline-block text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full font-bold">
                        Paid &amp; Cleared
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: SERVICE, MAINTENANCE & MOVE-OUT ── */}
          {activeTab === 'service' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit Maintenance */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">Unit Maintenance Request</h3>
                    <p className="text-xs text-stone-500">Report facility or locker issues directly to facility management.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                  <div className="font-semibold text-navy-900">Supported Quick Requests:</div>
                  <div>&bull; Shutter Lock sticking or damaged</div>
                  <div>&bull; Air-conditioner or climate control variation</div>
                  <div>&bull; Overhead lighting replacement</div>
                  <div>&bull; Water or moisture inspection</div>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowMaintenanceModal(true)}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-2.5 cursor-pointer shadow-sm"
                >
                  Create Maintenance Ticket for {currentUnit.unitNumber}
                </Button>
              </div>

              {/* Move-Out Notice */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-navy-950 flex items-center justify-center">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">Schedule Move-Out Notice</h3>
                    <p className="text-xs text-stone-500">Submit a 30-day notice when you are ready to vacate.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                  <div className="font-semibold text-navy-900">Move-Out Procedure:</div>
                  <div>1. Submit your planned departure date.</div>
                  <div>2. Empty the unit and remove your personal padlock.</div>
                  <div>3. Facility manager inspects the bay and security deposit is refunded.</div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMoveOutConfirmed(false);
                    setShowMoveOutModal(true);
                  }}
                  className="w-full text-xs font-bold text-stone-700 hover:text-rose-700 hover:border-rose-300 cursor-pointer"
                >
                  Schedule Move-Out Date
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── MODALS ── */}

      {/* 1. Guest Pass Modal */}
      {showGuestPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5 text-amber-600" />
                <span>Temporary Mover Pass</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGuestPassModal(false)}
                className="text-stone-400 hover:text-navy-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {guestPassResult ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-navy-900 text-sm">Pass Generated for {guestName || 'Mover'}</h4>
                <div className="text-xs text-stone-500">Valid for 24 Hours at {currentUnit.facilityName}</div>
                <div className="p-3 bg-stone-100 rounded-xl font-mono text-2xl font-bold tracking-widest text-navy-900">
                  #{guestPassResult}
                </div>
                <Button
                  type="button"
                  onClick={() => setShowGuestPassModal(false)}
                  className="w-full bg-navy-900 text-white font-bold text-xs"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerateGuestPass} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mover or Guest Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g., QuickMovers Team / Brother Alex"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  This generates a temporary keypad PIN valid for gate entry for the next 24 hours only.
                </p>
                <Button type="submit" className="w-full bg-navy-900 text-white font-bold text-xs py-2.5 cursor-pointer">
                  Generate 24-Hour Pass
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Maintenance Request Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-amber-600" />
                <span>Unit Maintenance Ticket</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="text-stone-400 hover:text-navy-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {maintenanceSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-navy-900">Maintenance Request Dispatched!</h4>
                <p className="text-xs text-stone-500">
                  Facility manager {currentUnit.managerName} has been alerted for unit {currentUnit.unitNumber}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitMaintenance} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Issue Category
                  </label>
                  <select
                    value={maintenanceCategory}
                    onChange={(e) => setMaintenanceCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  >
                    <option>Lock Stiff or Keypad Issue</option>
                    <option>Climate Control / Temperature Variance</option>
                    <option>Overhead Light Bulb Out</option>
                    <option>Water or Moisture Inspection</option>
                    <option>General Bay Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Description &amp; Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Describe what needs repair..."
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-navy-900 text-white font-bold text-xs py-2.5 cursor-pointer">
                  Submit Maintenance Request
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Move-Out Modal */}
      {showMoveOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <LogOut className="h-4.5 w-4.5 text-amber-600" />
                <span>Schedule Move-Out Notice</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMoveOutModal(false)}
                className="text-stone-400 hover:text-navy-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {moveOutConfirmed ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-navy-900">Move-Out Notice Recorded</h4>
                <p className="text-xs text-stone-500">
                  Your lease for {currentUnit.unitNumber} is scheduled to end on {moveOutDate}. Deposit refund instructions sent to your email.
                </p>
                <Button
                  type="button"
                  onClick={() => setShowMoveOutModal(false)}
                  className="w-full bg-navy-900 text-white font-bold text-xs mt-3 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">
                  You are giving notice to vacate <strong>{currentUnit.unitNumber}</strong> at {currentUnit.facilityName}.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Planned Vacate Date
                  </label>
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setMoveOutConfirmed(true)}
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs py-2.5 cursor-pointer"
                >
                  Confirm 30-Day Move-Out Notice
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Pay Next Rent Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-amber-600" />
                <span>Pay Rent for {currentUnit.unitNumber}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-stone-400 hover:text-navy-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-navy-900">Payment Successful!</h4>
                <p className="text-xs text-stone-500">
                  ${currentUnit.monthlyRent.toFixed(2)} has been charged to your card. Receipt has been logged in Payments Hub.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Unit:</span>
                    <span className="font-bold text-navy-900">{currentUnit.unitNumber} ({currentUnit.facilityName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Billing Period:</span>
                    <span className="font-medium text-navy-900">Next 1 Month</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm">
                    <span className="font-bold text-navy-900">Total Charge:</span>
                    <span className="font-bold text-amber-700">${currentUnit.monthlyRent.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={isPaying}
                  onClick={handlePayRent}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 cursor-pointer shadow-sm"
                >
                  {isPaying ? 'Processing Payment...' : `Confirm & Pay $${currentUnit.monthlyRent.toFixed(2)}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Lease Agreement Document Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-amber-600" />
                <span>Rental Agreement &bull; {currentUnit.unitNumber}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="text-stone-400 hover:text-navy-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-cream-50 rounded-xl border border-stone-200 space-y-2 text-xs font-mono">
              <div className="font-bold text-navy-900 border-b border-stone-200 pb-1">
                RENTALLQ MASTER STORAGE LEASE CONTRACT
              </div>
              <div>Facility: {currentUnit.facilityName}</div>
              <div>Address: {currentUnit.facilityAddress}</div>
              <div>Unit Number: {currentUnit.unitNumber} ({currentUnit.dimensions})</div>
              <div>Tenant: Verified Account Tenant</div>
              <div>Monthly Rent: ${currentUnit.monthlyRent}.00 USD</div>
              <div>Lease Term: {currentUnit.bookedAt} to {currentUnit.leaseEndDate}</div>
              <div>Gate Security PIN: #{currentUnit.gatePin}</div>
              <div className="text-emerald-700 font-bold pt-1">[STATUS: DIGITALLY EXECUTED &amp; ACTIVE]</div>
            </div>

            <Button
              type="button"
              onClick={() => setShowAgreementModal(false)}
              className="w-full bg-navy-900 text-white font-bold text-xs cursor-pointer"
            >
              Close Contract Viewer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
