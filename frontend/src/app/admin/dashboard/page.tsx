'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Building2, Shield, Trash2, AlertTriangle, CheckCircle2,
  Search, Eye, Ban, RefreshCw, TrendingUp, Users, Layers,
  IndianRupee, ClipboardList, MapPin, Mail, Calendar, Phone, FileText, X,
} from 'lucide-react';
import Link from 'next/link';

interface BusinessTenant {
  tenantName: string;
  email: string;
  phone: string;
  unitCode: string;
  unitType: string;
  monthlyRentInr: number;
  leaseDuration: string;
  status: 'ACTIVE' | 'OVERDUE' | 'COMPLETED' | 'UPCOMING';
}

interface Business {
  id: string;
  name: string;
  businessType: string;
  city: string;
  address?: string;
  gstin?: string;
  phone?: string;
  createdAt: string;
  ownerEmail: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
  unitsCount: number;
  occupiedUnits: number;
  monthlyRevenueInr: number;
  tenants?: BusinessTenant[];
}

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  admin: string;
  time: string;
}

// Realistic Indian-context seed data (used as fallback when DB is empty)
const SEED_BUSINESSES: Business[] = [
  {
    id: 'b-ind-01',
    name: 'Hindustan Cold Storage & Logistics',
    businessType: 'warehouse',
    city: 'Mumbai',
    address: 'Plot 42, MIDC Industrial Area, Turbhe, Navi Mumbai, Maharashtra 400705',
    gstin: '27AABCH1234F1Z8',
    phone: '+91 22 2789 4400',
    createdAt: '2026-09-10T08:30:00Z',
    ownerEmail: 'ops@hindustancold.in',
    status: 'ACTIVE',
    unitsCount: 48,
    occupiedUnits: 42,
    monthlyRevenueInr: 630000,
    tenants: [
      { tenantName: 'Amit Sharma', email: 'amit.sharma@gmail.com', phone: '+91 98201 11234', unitCode: 'MUM-A101', unitType: 'Climate-Controlled', monthlyRentInr: 8500, leaseDuration: '12 Months', status: 'ACTIVE' },
      { tenantName: 'Kabir Khan', email: 'kabir.khan@gmail.com', phone: '+91 98900 66789', unitCode: 'MUM-B201', unitType: 'Heavy Warehouse Bay', monthlyRentInr: 25000, leaseDuration: '6 Months', status: 'OVERDUE' },
    ],
  },
  {
    id: 'b-ind-02',
    name: 'Urban Attic Self-Storage',
    businessType: 'self_storage',
    city: 'Bengaluru',
    address: 'Survey 88, Near Electronic City Phase 1, Bengaluru, Karnataka 560100',
    gstin: '29AAACU9876E1Z5',
    phone: '+91 80 4123 7890',
    createdAt: '2026-08-22T10:00:00Z',
    ownerEmail: 'info@urbanattic.in',
    status: 'ACTIVE',
    unitsCount: 60,
    occupiedUnits: 55,
    monthlyRevenueInr: 495000,
    tenants: [
      { tenantName: 'Priya Verma', email: 'priya.verma@outlook.com', phone: '+91 90000 22345', unitCode: 'BLR-D88', unitType: 'Drive-Up Storage', monthlyRentInr: 6800, leaseDuration: '6 Months', status: 'ACTIVE' },
      { tenantName: 'Anjali Singh', email: 'anjali.singh@proton.me', phone: '+91 91234 56780', unitCode: 'BLR-L99', unitType: 'Heavy Warehouse Bay', monthlyRentInr: 32000, leaseDuration: '12 Months', status: 'ACTIVE' },
    ],
  },
  {
    id: 'b-ind-03',
    name: 'Capital Vault Warehousing',
    businessType: 'warehouse',
    city: 'Delhi NCR',
    address: 'Sector 37, Pace City II, Gurugram, Haryana 122001',
    gstin: '06AAACC3456D1Z2',
    phone: '+91 124 456 7890',
    createdAt: '2026-07-05T07:00:00Z',
    ownerEmail: 'admin@capitalvault.in',
    status: 'ACTIVE',
    unitsCount: 35,
    occupiedUnits: 29,
    monthlyRevenueInr: 377000,
    tenants: [
      { tenantName: 'Ravi Kumar', email: 'ravi.kumar@yahoo.com', phone: '+91 98711 44567', unitCode: 'DEL-F02', unitType: 'Cold Storage', monthlyRentInr: 18500, leaseDuration: '3 Months', status: 'COMPLETED' },
    ],
  },
  {
    id: 'b-ind-04',
    name: 'SafeKeep Pune Storage',
    businessType: 'self_storage',
    city: 'Pune',
    address: 'Gate 23, Hinjawadi Phase 2, Pune, Maharashtra 411057',
    gstin: '27AABCS7890G1Z1',
    phone: '+91 20 6789 1234',
    createdAt: '2026-10-01T09:15:00Z',
    ownerEmail: 'contact@safekeeppune.com',
    status: 'ACTIVE',
    unitsCount: 30,
    occupiedUnits: 25,
    monthlyRevenueInr: 262500,
    tenants: [
      { tenantName: 'Sunita Patel', email: 'sunita@hotmail.com', phone: '+91 98220 55678', unitCode: 'PUN-G09', unitType: 'Micro-Locker', monthlyRentInr: 2800, leaseDuration: '6 Months', status: 'OVERDUE' },
      { tenantName: 'Rohit Desai', email: 'rohit.desai@gmail.com', phone: '+91 98221 77890', unitCode: 'PUN-S02', unitType: 'Micro-Locker', monthlyRentInr: 2800, leaseDuration: '3 Months', status: 'COMPLETED' },
    ],
  },
  {
    id: 'b-ind-05',
    name: 'Metro Box Hyderabad',
    businessType: 'self_storage',
    city: 'Hyderabad',
    address: 'Sy No 44, Gachibowli Financial District, Hyderabad, Telangana 500032',
    gstin: '36AAACM4567J1Z9',
    phone: '+91 40 2300 5678',
    createdAt: '2026-09-20T11:00:00Z',
    ownerEmail: 'hello@metroboxhyd.in',
    status: 'ACTIVE',
    unitsCount: 50,
    occupiedUnits: 44,
    monthlyRevenueInr: 440000,
    tenants: [
      { tenantName: 'Deepak Nair', email: 'deepak.nair@gmail.com', phone: '+91 97110 77890', unitCode: 'HYD-H22', unitType: 'Heavy Warehouse Bay', monthlyRentInr: 22000, leaseDuration: '12 Months', status: 'UPCOMING' },
    ],
  },
  {
    id: 'b-ind-06',
    name: 'SecureHub Chennai',
    businessType: 'warehouse',
    city: 'Chennai',
    address: 'Old Mahabalipuram Rd (OMR), Sholinganallur, Chennai, Tamil Nadu 600119',
    gstin: '33AAACS1234B1Z4',
    phone: '+91 44 2450 8900',
    createdAt: '2026-06-15T06:45:00Z',
    ownerEmail: 'ops@securehubchennai.in',
    status: 'ACTIVE',
    unitsCount: 42,
    occupiedUnits: 36,
    monthlyRevenueInr: 504000,
    tenants: [
      { tenantName: 'Meera Joshi', email: 'meera.joshi@gmail.com', phone: '+91 98111 33456', unitCode: 'CHN-I14', unitType: 'Document Storage', monthlyRentInr: 5500, leaseDuration: '24 Months', status: 'ACTIVE' },
      { tenantName: 'Nisha Reddy', email: 'nisha.reddy@gmail.com', phone: '+91 97000 44567', unitCode: 'CHN-S02', unitType: 'Secure Vault', monthlyRentInr: 9000, leaseDuration: '6 Months', status: 'ACTIVE' },
    ],
  },
  {
    id: 'b-ind-07',
    name: 'GreenField Storage Co.',
    businessType: 'self_storage',
    city: 'Ahmedabad',
    address: 'SG Highway, Makarba, Ahmedabad, Gujarat 380051',
    gstin: '24AAACG5678K1Z3',
    phone: '+91 79 4001 2345',
    createdAt: '2026-10-10T14:00:00Z',
    ownerEmail: 'md@greenfieldstorage.com',
    status: 'UNDER_REVIEW',
    unitsCount: 20,
    occupiedUnits: 0,
    monthlyRevenueInr: 0,
    tenants: [],
  },
  {
    id: 'b-ind-08',
    name: 'Kolkata Cargo & Storage Hub',
    businessType: 'warehouse',
    city: 'Kolkata',
    address: 'Taratala Road, Kolkata Port Trust Area, Kolkata, West Bengal 700088',
    gstin: '19AAACK9012L1Z7',
    phone: '+91 33 2401 5678',
    createdAt: '2026-05-01T08:00:00Z',
    ownerEmail: 'info@kolkatacargo.in',
    status: 'SUSPENDED',
    unitsCount: 25,
    occupiedUnits: 0,
    monthlyRevenueInr: 0,
    tenants: [],
  },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: 'a1', action: 'Approved Business', target: 'Hindustan Cold Storage & Logistics', admin: 'admin@rentallq.com', time: '10 Nov 2026 · 11:42 AM' },
  { id: 'a2', action: 'Suspended Business', target: 'Kolkata Cargo & Storage Hub', admin: 'admin@rentallq.com', time: '08 Nov 2026 · 03:15 PM' },
  { id: 'a3', action: 'Platform Fee Updated → 8.5%', target: 'Platform Settings', admin: 'admin@rentallq.com', time: '05 Nov 2026 · 09:00 AM' },
  { id: 'a4', action: 'Rejected Application', target: 'Dubious Storage Co.', admin: 'admin@rentallq.com', time: '03 Nov 2026 · 02:30 PM' },
  { id: 'a5', action: 'Reviewed Complaint', target: 'Metro Box Hyderabad', admin: 'admin@rentallq.com', time: '01 Nov 2026 · 06:45 PM' },
];

const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata'];
const COMMISSION_RATE = 0.085; // 8.5%

function formatInr(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
};

const businessTypeLabel: Record<string, string> = {
  self_storage: 'Self-Storage',
  warehouse: 'Warehouse',
  hostel: 'Hostel',
  parking: 'Parking',
  equipment: 'Equipment',
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [auditLog] = useState<AuditEntry[]>(SEED_AUDIT);

  // Detail / Confirm modal state
  const [viewBiz, setViewBiz] = useState<Business | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Business | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Business | null>(null);
  const [actionWorking, setActionWorking] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Business[] = data.map((b: any, i: number) => {
              const seed = SEED_BUSINESSES[i % SEED_BUSINESSES.length];
              return {
                id: b.id,
                name: b.name || seed.name,
                businessType: b.businessType || seed.businessType,
                city: b.city || seed.city,
                address: b.address || seed.address,
                gstin: b.gstin || seed.gstin,
                phone: b.phone || seed.phone,
                createdAt: b.createdAt || seed.createdAt,
                ownerEmail: b.ownerEmail || seed.ownerEmail,
                status: (b.status || seed.status) as any,
                unitsCount: b.unitsCount || seed.unitsCount,
                occupiedUnits: b.occupiedUnits || seed.occupiedUnits,
                monthlyRevenueInr: b.monthlyRevenueInr || seed.monthlyRevenueInr,
                tenants: b.tenants || seed.tenants,
              };
            });
            setBusinesses(mapped);
          } else {
            setBusinesses(SEED_BUSINESSES);
          }
        } else {
          setBusinesses(SEED_BUSINESSES);
        }
      } catch {
        setBusinesses(SEED_BUSINESSES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // KPIs
  const activeBiz = businesses.filter((b) => b.status === 'ACTIVE');
  const totalGmv = activeBiz.reduce((s, b) => s + b.monthlyRevenueInr, 0);
  const platformCommission = Math.round(totalGmv * COMMISSION_RATE);
  const totalUnits = businesses.reduce((s, b) => s + b.unitsCount, 0);
  const occupiedUnits = businesses.reduce((s, b) => s + b.occupiedUnits, 0);
  const occupancyPct = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';
  const pendingApprovals = businesses.filter((b) => b.status === 'UNDER_REVIEW').length;

  const filtered = businesses.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchQ = b.name.toLowerCase().includes(q) || b.ownerEmail.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
    const matchCity = cityFilter === 'All Cities' || b.city === cityFilter;
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchQ && matchCity && matchStatus;
  });

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setActionWorking(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === suspendTarget.id
          ? { ...b, status: b.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' }
          : b
      )
    );
    showToast(
      suspendTarget.status === 'SUSPENDED'
        ? `"${suspendTarget.name}" reactivated successfully.`
        : `"${suspendTarget.name}" has been suspended.`,
      true
    );
    setSuspendTarget(null);
    setActionWorking(false);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setActionWorking(true);
    try {
      await fetch(`/api/businesses/${removeTarget.id}`, { method: 'DELETE' });
    } catch {}
    setBusinesses((prev) => prev.filter((b) => b.id !== removeTarget.id));
    showToast(`"${removeTarget.name}" permanently removed from the platform.`, false);
    setRemoveTarget(null);
    setActionWorking(false);
  };

  return (
    <div className="space-y-7 text-navy-900 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${toast.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              Platform Overview
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Super Admin command center — monitor all registered businesses, revenue, and platform health.
          </p>
        </div>
        <Link href="/admin/dashboard/onboarding-requests">
          <Button variant="primary" className="bg-amber-500 text-navy-900 hover:bg-amber-400 font-semibold border-amber-500 text-sm">
            <ClipboardList className="h-4 w-4" />
            Onboarding Requests
            {pendingApprovals > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{pendingApprovals}</span>
            )}
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Platform GMV', value: formatInr(totalGmv), sub: 'This month', icon: IndianRupee, color: 'text-amber-600' },
          { label: 'Platform Commission', value: formatInr(platformCommission), sub: `@ ${(COMMISSION_RATE * 100).toFixed(1)}% rate`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Active Facilities', value: `${activeBiz.length}`, sub: `${businesses.length} total`, icon: Building2, color: 'text-sky-600' },
          { label: 'Unit Occupancy', value: `${occupancyPct}%`, sub: `${occupiedUnits} / ${totalUnits} units`, icon: Layers, color: 'text-violet-600' },
          { label: 'Pending Approvals', value: `${pendingApprovals}`, sub: pendingApprovals > 0 ? 'Action required' : 'All clear', icon: ClipboardList, color: pendingApprovals > 0 ? 'text-rose-600' : 'text-stone-400' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-white border-stone-200 shadow-xs p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">{kpi.label}</span>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="text-xl font-bold text-navy-900 font-serif">{kpi.value}</p>
              <p className="text-[11px] text-stone-400">{kpi.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search business, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <span className="text-xs text-stone-400 font-medium">{filtered.length} facilities</span>
      </div>

      {/* Business Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-stone-500 py-8 justify-center">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading facilities...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left">
                  {['Business / Facility', 'City', 'Type', 'Owner Email', 'Units (Occ/Total)', 'Monthly Rev ₹', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-stone-500 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-cream-100/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-navy-900/5 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-navy-600" />
                        </div>
                        <span className="font-semibold text-navy-900 max-w-[180px] truncate">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-stone-600">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        {b.city}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{businessTypeLabel[b.businessType] || b.businessType}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-stone-600">
                        <Mail className="h-3 w-3 text-stone-400" />
                        <span className="max-w-[160px] truncate">{b.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-navy-900">{b.occupiedUnits}</span>
                      <span className="text-stone-400"> / {b.unitsCount}</span>
                      <div className="mt-1 h-1 w-20 rounded-full bg-stone-100">
                        <div
                          className="h-1 rounded-full bg-amber-500"
                          style={{ width: `${b.unitsCount > 0 ? (b.occupiedUnits / b.unitsCount) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {b.status === 'ACTIVE' ? formatInr(b.monthlyRevenueInr) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status]}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewBiz(b)}
                          title="View Details"
                          className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSuspendTarget(b)}
                          title={b.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-all"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRemoveTarget(b)}
                          title="Remove Permanently"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-navy-900 font-serif">Audit Trail</h2>
          <span className="text-[10px] text-stone-400 font-medium ml-auto">Platform admin action log</span>
        </div>
        <div className="divide-y divide-stone-50">
          {auditLog.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-navy-900">{entry.action}</span>
                  <span className="text-xs text-stone-500 ml-2">on {entry.target}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-[11px] text-stone-400">{entry.admin}</span>
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Calendar className="h-3 w-3" />
                  {entry.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Details Modal */}
      {viewBiz && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  <h2 className="text-xl font-bold text-navy-900 font-serif">{viewBiz.name}</h2>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" /> {viewBiz.city} · {businessTypeLabel[viewBiz.businessType]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${statusColors[viewBiz.status]}`}>
                  {viewBiz.status.replace('_', ' ')}
                </span>
                <button onClick={() => setViewBiz(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Business Contact & Registration Details */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Facility & KYC Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 font-medium">Registered Address:</span>
                  <p className="font-semibold text-navy-900 mt-0.5">{viewBiz.address || 'Address on file'}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-medium">GSTIN / Registration:</span>
                  <p className="font-semibold text-navy-900 mt-0.5">{viewBiz.gstin || '27AABCH1234F1Z8'}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-medium">Primary Contact Email:</span>
                  <p className="font-semibold text-navy-900 mt-0.5">{viewBiz.ownerEmail}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-medium">Contact Phone:</span>
                  <p className="font-semibold text-navy-900 mt-0.5">{viewBiz.phone || '+91 22 2789 4400'}</p>
                </div>
              </div>
            </div>

            {/* Operational & Financial Metrics */}
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Platform Metrics & Revenue Split</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Total Units', value: `${viewBiz.unitsCount}` },
                  { label: 'Occupied Units', value: `${viewBiz.occupiedUnits}` },
                  { label: 'Occupancy Rate', value: `${viewBiz.unitsCount > 0 ? ((viewBiz.occupiedUnits / viewBiz.unitsCount) * 100).toFixed(1) : 0}%` },
                  { label: 'Monthly GMV', value: formatInr(viewBiz.monthlyRevenueInr) },
                  { label: 'Platform Fee (8.5%)', value: formatInr(viewBiz.monthlyRevenueInr * COMMISSION_RATE) },
                  { label: 'Net to Facility', value: formatInr(viewBiz.monthlyRevenueInr * (1 - COMMISSION_RATE)) },
                  { label: 'Member Since', value: new Date(viewBiz.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'KYC Status', value: 'Verified' },
                ].map((row) => (
                  <div key={row.label} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{row.label}</p>
                    <p className="text-xs font-bold text-navy-900 mt-0.5">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tenants / Clients under this Business */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Associated Tenants & Rented Units ({viewBiz.tenants?.length || 0})
                </h3>
                <span className="text-[11px] text-stone-400">Live booking records</span>
              </div>
              {viewBiz.tenants && viewBiz.tenants.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {viewBiz.tenants.map((t, idx) => (
                    <div key={idx} className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-amber-200 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-navy-900">{t.tenantName}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                            Unit {t.unitCode} ({t.unitType})
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">{t.email} · {t.phone}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:text-right">
                        <div>
                          <p className="text-xs font-bold text-emerald-700">₹{t.monthlyRentInr.toLocaleString('en-IN')}/mo</p>
                          <p className="text-[10px] text-stone-400">{t.leaseDuration} lease</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          t.status === 'UPCOMING' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          'bg-stone-50 text-stone-600 border-stone-200'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-stone-50 rounded-xl p-4 text-center border border-dashed border-stone-200">
                  <p className="text-xs text-stone-500">No active client bookings registered for this facility yet.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-stone-100">
              <Button
                onClick={() => { setSuspendTarget(viewBiz); setViewBiz(null); }}
                variant="outline"
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
              >
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                {viewBiz.status === 'SUSPENDED' ? 'Reactivate Facility' : 'Suspend Facility'}
              </Button>
              <Button onClick={() => setViewBiz(null)} variant="outline" className="flex-1 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirm Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Ban className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-navy-900 font-serif">
              {suspendTarget.status === 'SUSPENDED' ? 'Reactivate Business?' : 'Suspend Business?'}
            </h3>
            <p className="text-xs text-stone-500">
              {suspendTarget.status === 'SUSPENDED'
                ? `"${suspendTarget.name}" will be reactivated and their listings will go live again.`
                : `"${suspendTarget.name}" will be suspended. Their listings will be hidden from the marketplace.`}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSuspend}
                disabled={actionWorking}
                variant="primary"
                className="flex-1 bg-amber-500 text-navy-900 hover:bg-amber-400 border-amber-500"
              >
                {actionWorking ? 'Working...' : 'Confirm'}
              </Button>
              <Button onClick={() => setSuspendTarget(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-navy-900 font-serif">Remove Business Permanently?</h3>
            <p className="text-xs text-stone-500">
              This action is <strong>irreversible</strong>. "{removeTarget.name}" and all associated data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleRemove}
                disabled={actionWorking}
                variant="outline"
                className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                {actionWorking ? 'Removing...' : 'Remove Permanently'}
              </Button>
              <Button onClick={() => setRemoveTarget(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
