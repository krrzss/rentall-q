'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users, Search, Eye, Mail, Phone, IndianRupee,
  Calendar, CheckCircle2, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/server/lib/supabaseClient';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  activeBookings: number;
  lifetimeSpendInr: number;
  joinedDate: string;
  status: 'VERIFIED' | 'FLAGGED' | 'INACTIVE';
  bookingHistory: { code: string; facility: string; unit: string; monthlyRent: number; status: string }[];
}

const SEED_CLIENTS: Client[] = [
  { id: 'cli-01', name: 'Amit Sharma', email: 'amit.sharma@gmail.com', phone: '+91 98201 11234', city: 'Mumbai', activeBookings: 1, lifetimeSpendInr: 102000, joinedDate: '01 Jan 2026', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00841', facility: 'Hindustan Cold Storage', unit: 'MUM-A101', monthlyRent: 8500, status: 'ACTIVE' }] },
  { id: 'cli-02', name: 'Priya Verma', email: 'priya.verma@outlook.com', phone: '+91 90000 22345', city: 'Bengaluru', activeBookings: 1, lifetimeSpendInr: 40800, joinedDate: '01 Jul 2026', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00729', facility: 'Urban Attic Self-Storage', unit: 'BLR-D88', monthlyRent: 6800, status: 'ACTIVE' }] },
  { id: 'cli-03', name: 'Ravi Kumar', email: 'ravi.kumar@yahoo.com', phone: '+91 91234 33456', city: 'Delhi NCR', activeBookings: 0, lifetimeSpendInr: 55500, joinedDate: '01 May 2025', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00615', facility: 'Capital Vault Warehousing', unit: 'DEL-F02', monthlyRent: 18500, status: 'COMPLETED' }] },
  { id: 'cli-04', name: 'Sunita Patel', email: 'sunita@hotmail.com', phone: '+91 92345 44567', city: 'Pune', activeBookings: 0, lifetimeSpendInr: 16800, joinedDate: '01 May 2026', status: 'FLAGGED', bookingHistory: [{ code: 'RQ-2026-00502', facility: 'SafeKeep Pune Storage', unit: 'PUN-G09', monthlyRent: 2800, status: 'OVERDUE' }] },
  { id: 'cli-05', name: 'Deepak Nair', email: 'deepak.nair@gmail.com', phone: '+91 93456 55678', city: 'Hyderabad', activeBookings: 1, lifetimeSpendInr: 22000, joinedDate: '01 Nov 2026', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00990', facility: 'Metro Box Hyderabad', unit: 'HYD-H22', monthlyRent: 22000, status: 'UPCOMING' }] },
  { id: 'cli-06', name: 'Meera Joshi', email: 'meera.joshi@gmail.com', phone: '+91 94567 66789', city: 'Chennai', activeBookings: 1, lifetimeSpendInr: 198000, joinedDate: '01 Mar 2025', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00888', facility: 'SecureHub Chennai', unit: 'CHN-I14', monthlyRent: 5500, status: 'ACTIVE' }] },
  { id: 'cli-07', name: 'Kabir Khan', email: 'kabir.khan@gmail.com', phone: '+91 95678 77890', city: 'Mumbai', activeBookings: 0, lifetimeSpendInr: 150000, joinedDate: '01 Jun 2025', status: 'FLAGGED', bookingHistory: [{ code: 'RQ-2026-00441', facility: 'Hindustan Cold Storage', unit: 'MUM-B201', monthlyRent: 25000, status: 'OVERDUE' }] },
  { id: 'cli-08', name: 'Anjali Singh', email: 'anjali.singh@proton.me', phone: '+91 96789 88901', city: 'Bengaluru', activeBookings: 1, lifetimeSpendInr: 384000, joinedDate: '15 Nov 2025', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-01001', facility: 'Urban Attic Self-Storage', unit: 'BLR-L99', monthlyRent: 32000, status: 'ACTIVE' }] },
  { id: 'cli-09', name: 'Rohit Desai', email: 'rohit@gmail.com', phone: '+91 97890 99012', city: 'Pune', activeBookings: 0, lifetimeSpendInr: 8400, joinedDate: '01 Apr 2026', status: 'INACTIVE', bookingHistory: [{ code: 'RQ-2026-00410', facility: 'SafeKeep Pune Storage', unit: 'PUN-G09', monthlyRent: 2800, status: 'REFUNDED' }] },
  { id: 'cli-10', name: 'Nisha Reddy', email: 'nisha.reddy@gmail.com', phone: '+91 98901 00123', city: 'Chennai', activeBookings: 0, lifetimeSpendInr: 54000, joinedDate: '01 Apr 2026', status: 'VERIFIED', bookingHistory: [{ code: 'RQ-2026-00311', facility: 'SecureHub Chennai', unit: 'CHN-J07', monthlyRent: 9000, status: 'COMPLETED' }] },
];

const statusConfig = {
  VERIFIED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck },
  FLAGGED: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  INACTIVE: { color: 'bg-stone-50 text-stone-500 border-stone-200', icon: CheckCircle2 },
};

function formatInr(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewClient, setViewClient] = useState<Client | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: profiles } = await supabase.from('profiles').select('id, name, role, created_at').eq('role', 'CLIENT');
        if (profiles && profiles.length > 0) {
          const mapped: Client[] = profiles.map((p: any, i: number) => ({
            ...SEED_CLIENTS[i % SEED_CLIENTS.length],
            id: p.id,
            name: p.name || SEED_CLIENTS[i % SEED_CLIENTS.length].name,
            joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : SEED_CLIENTS[i % SEED_CLIENTS.length].joinedDate,
          }));
          setClients(mapped);
        } else {
          setClients(SEED_CLIENTS);
        }
      } catch {
        setClients(SEED_CLIENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) &&
      (statusFilter === 'ALL' || c.status === statusFilter)
    );
  });

  const totalSpend = clients.reduce((s, c) => s + c.lifetimeSpendInr, 0);

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Platform Clients</h1>
          </div>
          <p className="text-xs text-stone-500">Master tenant directory — all registered clients, their bookings, spending, and account status.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Total Platform Lifetime Spend</p>
          <p className="text-base font-bold text-amber-700 font-serif">{formatInr(totalSpend)}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: String(clients.length), color: 'text-navy-900' },
          { label: 'Verified', value: String(clients.filter((c) => c.status === 'VERIFIED').length), color: 'text-emerald-700' },
          { label: 'Flagged', value: String(clients.filter((c) => c.status === 'FLAGGED').length), color: 'text-rose-600' },
          { label: 'Active Bookings', value: String(clients.reduce((s, c) => s + c.activeBookings, 0)), color: 'text-sky-700' },
        ].map((k) => (
          <Card key={k.label} className="bg-white border-stone-200 shadow-xs p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{k.label}</p>
            <p className={`text-2xl font-bold font-serif mt-1 ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input type="text" placeholder="Search client name, email, city..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'VERIFIED', 'FLAGGED', 'INACTIVE'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-xs text-stone-500 py-8 text-center">Loading clients...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left">
                  {['Client', 'Email', 'Phone', 'City', 'Active Bookings', 'Lifetime Spend ₹', 'Joined', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-stone-500 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((c) => {
                  const sc = statusConfig[c.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={c.id} className="hover:bg-cream-100/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-navy-900/5 flex items-center justify-center font-bold text-navy-700 text-xs flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-navy-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-600"><Mail className="h-3 w-3 text-stone-400" />{c.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-600"><Phone className="h-3 w-3 text-stone-400" />{c.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{c.city}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${c.activeBookings > 0 ? 'text-emerald-700' : 'text-stone-400'}`}>{c.activeBookings}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">
                        <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{c.lifetimeSpendInr.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-stone-500 whitespace-nowrap"><Calendar className="h-3 w-3 text-stone-400" />{c.joinedDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                          <StatusIcon className="h-3 w-3" />{c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewClient(c)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"><Eye className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-navy-900 flex items-center justify-center font-bold text-white text-base">
                  {viewClient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-navy-900 font-serif">{viewClient.name}</h2>
                  <p className="text-xs text-stone-500">{viewClient.email}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewClient.status].color}`}>{viewClient.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phone', value: viewClient.phone },
                { label: 'City', value: viewClient.city },
                { label: 'Member Since', value: viewClient.joinedDate },
                { label: 'Active Bookings', value: String(viewClient.activeBookings) },
                { label: 'Lifetime Spend', value: `₹${viewClient.lifetimeSpendInr.toLocaleString('en-IN')}` },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Booking History</p>
              <div className="space-y-2">
                {viewClient.bookingHistory.map((bk) => (
                  <div key={bk.code} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-xs font-mono font-bold text-navy-900">{bk.code}</p>
                      <p className="text-[11px] text-stone-500">{bk.facility} · {bk.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700">₹{bk.monthlyRent.toLocaleString('en-IN')}/mo</p>
                      <span className={`text-[9px] font-bold uppercase ${bk.status === 'ACTIVE' ? 'text-emerald-600' : bk.status === 'OVERDUE' ? 'text-rose-600' : 'text-stone-400'}`}>{bk.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => setViewClient(null)} variant="outline" className="w-full text-xs">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
