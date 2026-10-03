'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Building2,
  Package,
  Warehouse,
  BedDouble,
  Car,
  HardHat,
  CheckCircle2,
  TrendingUp,
  Users,
  BoxSelect,
  IndianRupee,
  Search,
  Filter,
  LogIn,
  LogOut,
  CreditCard,
  Wrench,
  RefreshCw,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  getCompanyBySlug,
  MockCompany,
  CompanyCategory,
  StorageUnit,
  WarehouseBay,
  HostelBed,
  ParkingSpot,
  EquipmentAsset,
  InventoryItem,
  InventoryStatus,
  PaymentStatus,
} from '@/features/company-associated/data/mockCompanyData';


// ─── Accent / badge styling maps ──────────────────────────────────────────────
const ACCENT: Record<string, {
  pill: string; icon: string; header: string; bar: string; border: string;
}> = {
  amber: {
    pill:   'bg-amber-50 text-amber-700 border-amber-200',
    icon:   'bg-amber-100 text-amber-700',
    header: 'text-amber-400',
    bar:    '#D89B3C',
    border: 'border-amber-200',
  },
  sky: {
    pill:   'bg-sky-50 text-sky-700 border-sky-200',
    icon:   'bg-sky-100 text-sky-700',
    header: 'text-sky-400',
    bar:    '#0ea5e9',
    border: 'border-sky-200',
  },
  violet: {
    pill:   'bg-violet-50 text-violet-700 border-violet-200',
    icon:   'bg-violet-100 text-violet-700',
    header: 'text-violet-400',
    bar:    '#7c3aed',
    border: 'border-violet-200',
  },
  emerald: {
    pill:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon:   'bg-emerald-100 text-emerald-700',
    header: 'text-emerald-400',
    bar:    '#10b981',
    border: 'border-emerald-200',
  },
  rose: {
    pill:   'bg-rose-50 text-rose-700 border-rose-200',
    icon:   'bg-rose-100 text-rose-700',
    header: 'text-rose-400',
    bar:    '#f43f5e',
    border: 'border-rose-200',
  },
};

const CATEGORY_META: Record<CompanyCategory, { label: string; icon: React.ElementType }> = {
  self_storage: { label: 'Self Storage', icon: Package },
  warehouse:    { label: 'Warehouse',    icon: Warehouse },
  hostel:       { label: 'Hostel',       icon: BedDouble },
  parking:      { label: 'Parking',      icon: Car },
  equipment:    { label: 'Equipment',    icon: HardHat },
};

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: InventoryStatus }) {
  const styles: Record<InventoryStatus, string> = {
    Available:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    Occupied:    'bg-sky-50 text-sky-700 border-sky-200',
    Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status]}`}>
      {status === 'Available' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'Occupied' && <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
      {status === 'Maintenance' && <Wrench className="h-3 w-3" />}
      {status}
    </span>
  );
}

// ─── Payment status pill ──────────────────────────────────────────────────────
function PaymentPill({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    Paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status]}`}>
      {status === 'Paid'    && <CheckCircle2 className="h-3 w-3" />}
      {status === 'Overdue' && <AlertCircle  className="h-3 w-3" />}
      {status === 'Pending' && <Clock        className="h-3 w-3" />}
      {status}
    </span>
  );
}

// ─── Activity icon ─────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    move_in:     { icon: LogIn,      cls: 'bg-emerald-100 text-emerald-600' },
    move_out:    { icon: LogOut,     cls: 'bg-rose-100 text-rose-600' },
    payment:     { icon: CreditCard, cls: 'bg-sky-100 text-sky-600' },
    maintenance: { icon: Wrench,     cls: 'bg-amber-100 text-amber-600' },
    renewal:     { icon: RefreshCw,  cls: 'bg-violet-100 text-violet-600' },
  };
  const { icon: Icon, cls } = map[type] ?? { icon: Building2, cls: 'bg-stone-100 text-stone-600' };
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

// ─── Currency formatter ────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Category-specific inventory columns ──────────────────────────────────────
function InventoryExtraColumns({ item, category }: { item: InventoryItem; category: CompanyCategory }) {
  if (category === 'self_storage') {
    const u = item as StorageUnit;
    return (
      <>
        <td className="px-4 py-3 text-xs text-stone-700 font-medium whitespace-nowrap">{u.size}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${u.climateControl ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
            {u.climateControl ? '❄ Climate' : 'Standard'}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{u.floor}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{u.accessType}</td>
      </>
    );
  }
  if (category === 'warehouse') {
    const b = item as WarehouseBay;
    return (
      <>
        <td className="px-4 py-3 text-xs text-stone-700 font-medium whitespace-nowrap">{b.sqFt.toLocaleString()} sq ft</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{b.dockDoors} doors</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{b.ceilingHeight}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-stone-50 text-stone-600 border-stone-200`}>{b.zoneType}</span>
        </td>
      </>
    );
  }
  if (category === 'hostel') {
    const h = item as HostelBed;
    return (
      <>
        <td className="px-4 py-3 text-xs text-stone-700 font-medium whitespace-nowrap">{h.bedType}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{h.roomNumber}</td>
        <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap max-w-[160px] truncate">{h.amenities.join(', ')}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">
          {h.checkIn ? `${fmtDate(h.checkIn)} → ${fmtDate(h.checkOut)}` : '—'}
        </td>
      </>
    );
  }
  if (category === 'parking') {
    const p = item as ParkingSpot;
    return (
      <>
        <td className="px-4 py-3 text-xs text-stone-700 font-medium whitespace-nowrap">{p.spotType}</td>
        <td className="px-4 py-3 text-xs text-stone-500 font-mono whitespace-nowrap">{p.permitNumber ?? '—'}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap max-w-[160px] truncate">{p.vehicle ?? '—'}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{fmtDate(p.renewalDate)}</td>
      </>
    );
  }
  if (category === 'equipment') {
    const e = item as EquipmentAsset;
    const conditionStyle: Record<string, string> = {
      Excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Good:      'bg-sky-50 text-sky-700 border-sky-200',
      Fair:      'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <>
        <td className="px-4 py-3 text-xs text-stone-700 font-medium whitespace-nowrap">{e.assetCategory}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${conditionStyle[e.condition] ?? 'bg-stone-50 text-stone-600 border-stone-200'}`}>{e.condition}</span>
        </td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{fmtDate(e.lastMaintenance)}</td>
        <td className="px-4 py-3 text-xs text-stone-600 whitespace-nowrap">{fmtDate(e.nextMaintenance)}</td>
      </>
    );
  }
  return null;
}

// ─── Extra column headers per category ───────────────────────────────────────
const EXTRA_HEADERS: Record<CompanyCategory, string[]> = {
  self_storage: ['Size', 'Climate', 'Floor', 'Access'],
  warehouse:    ['Sq Ft', 'Dock Doors', 'Ceiling', 'Zone'],
  hostel:       ['Bed Type', 'Room', 'Amenities', 'Dates'],
  parking:      ['Spot Type', 'Permit #', 'Vehicle', 'Renewal'],
  equipment:    ['Category', 'Condition', 'Last Maint.', 'Next Maint.'],
};

// ─── Custom recharts tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg text-xs">
        <p className="font-semibold text-navy-900 mb-1">{label}</p>
        <p className="text-stone-600">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function CompanyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const company = getCompanyBySlug(params.slug);

  if (!company) notFound();

  return <CompanyDetail company={company} />;
}

function CompanyDetail({ company }: { company: MockCompany }) {
  const accent = ACCENT[company.accent] ?? ACCENT.amber;
  const catMeta = CATEGORY_META[company.category];
  const CatIcon = catMeta.icon;

  const [inventorySearch, setInventorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'All'>('All');

  const filteredInventory = useMemo(() => {
    return company.inventory.filter((item) => {
      const matchSearch =
        item.label.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.renter?.toLowerCase().includes(inventorySearch.toLowerCase()) ?? false);
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [company.inventory, inventorySearch, statusFilter]);

  // Stats
  const stats = [
    {
      label: 'Occupancy Rate',
      value: `${company.occupancyRate}%`,
      icon: TrendingUp,
      sub: `${company.activeTenantsCount} of ${company.totalInventory} occupied`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total Inventory',
      value: company.totalInventory.toLocaleString(),
      icon: BoxSelect,
      sub: `${catMeta.label} units`,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-200',
    },
    {
      label: 'Active Tenants',
      value: company.activeTenantsCount.toLocaleString(),
      icon: Users,
      sub: 'Currently renting',
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-200',
    },
    {
      label: 'Monthly Revenue',
      value: fmt(company.monthlyRevenue),
      icon: IndianRupee,
      sub: 'This month',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ── Back nav bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Link
            href="/#companies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-navy-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Companies
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-8 py-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-500/10" />
          <div className="pointer-events-none absolute -bottom-8 right-24 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${accent.icon} shadow-inner`}>
                <CatIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${accent.pill}`}>
                    <CatIcon className="h-3 w-3" />
                    {catMeta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">{company.name}</h1>
                <p className="text-sm text-navy-300 mt-0.5">{company.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm ${s.bg}`}>
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-medium">{s.label}</p>
                  <p className={`text-xl font-bold font-serif ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Inventory table ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-serif text-navy-900">Inventory</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {filteredInventory.length} of {company.inventory.length} items
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search units or renters…"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900/20 w-48"
                />
              </div>
              {/* Status filter */}
              <div className="relative flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-stone-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | 'All')}
                  className="text-xs rounded-xl border border-stone-200 bg-cream-50 py-2 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-navy-900/20 appearance-none"
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-cream-50/70 border-b border-stone-100">
                  <th className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">Unit</th>
                  <th className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">Renter</th>
                  <th className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">Rate / mo</th>
                  <th className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">End Date</th>
                  {EXTRA_HEADERS[company.category].map((h) => (
                    <th key={h} className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={5 + EXTRA_HEADERS[company.category].length} className="px-4 py-10 text-center text-stone-400">
                      No items match your search.
                    </td>
                  </tr>
                ) : filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy-900 whitespace-nowrap font-serif">{item.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusPill status={item.status} /></td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{item.renter ?? <span className="text-stone-300 italic">Vacant</span>}</td>
                    <td className="px-4 py-3 font-semibold text-stone-700 whitespace-nowrap">{fmt(item.ratePerMonth)}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{fmtDate(item.endDate)}</td>
                    <InventoryExtraColumns item={item} category={company.category} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Tenants + Activity (2-col on lg) ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Tenants / Renters table */}
          <div className="lg:col-span-3 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <h2 className="text-base font-bold font-serif text-navy-900">Tenants & Renters</h2>
              <p className="text-xs text-stone-500 mt-0.5">{company.tenants.length} active contacts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-cream-50/70 border-b border-stone-100">
                    <th className="px-4 py-3 font-bold text-navy-900">Name</th>
                    <th className="px-4 py-3 font-bold text-navy-900">Contact</th>
                    <th className="px-4 py-3 font-bold text-navy-900">Unit</th>
                    <th className="px-4 py-3 font-bold text-navy-900">Rent</th>
                    <th className="px-4 py-3 font-bold text-navy-900">Last Payment</th>
                    <th className="px-4 py-3 font-bold text-navy-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {company.tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-white text-[10px] font-bold">
                            {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-semibold text-navy-900 whitespace-nowrap">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-stone-500"><Mail className="h-3 w-3" /><span>{t.email}</span></div>
                          <div className="flex items-center gap-1 text-stone-500"><Phone className="h-3 w-3" /><span>{t.phone}</span></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-700 whitespace-nowrap">{t.unit}</td>
                      <td className="px-4 py-3 font-semibold text-stone-700 whitespace-nowrap">{fmt(t.monthlyRent)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-500 whitespace-nowrap">
                          <CalendarDays className="h-3 w-3" />
                          {fmtDate(t.lastPayment)}
                        </div>
                      </td>
                      <td className="px-4 py-3"><PaymentPill status={t.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <h2 className="text-base font-bold font-serif text-navy-900">Recent Activity</h2>
              <p className="text-xs text-stone-500 mt-0.5">Latest events</p>
            </div>
            <div className="p-5 space-y-4 max-h-[560px] overflow-y-auto">
              {company.activity.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <ActivityIcon type={event.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy-900 leading-snug">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                      <span>{fmtDateTime(event.timestamp)}</span>
                      <span>·</span>
                      <span>{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Revenue chart ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-navy-900">Revenue Trend</h2>
              <p className="text-xs text-stone-500 mt-0.5">Last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold font-serif text-navy-900">{fmt(company.monthlyRevenue)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                <TrendingUp className="h-3 w-3" /> Trending up
              </p>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={company.revenue} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f1e7' }} />
                <Bar
                  dataKey="revenue"
                  fill={accent.bar}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Footer spacer ────────────────────────────────────────────────────── */}
      <div className="h-12" />
    </div>
  );
}
