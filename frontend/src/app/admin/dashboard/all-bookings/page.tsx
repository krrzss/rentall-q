'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Calendar, Search, Download, Eye, MapPin,
  CheckCircle2, AlertTriangle, Clock, IndianRupee,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingCode: string;
  tenantName: string;
  tenantEmail: string;
  facility: string;
  city: string;
  unitCode: string;
  unitType: string;
  leaseDuration: string;
  monthlyRentInr: number;
  startDate: string;
  endDate: string;
  nextRenewal: string;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'UPCOMING';
}

const BOOKINGS: Booking[] = [
  { id: 'bk-01', bookingCode: 'RQ-2026-00841', tenantName: 'Amit Sharma', tenantEmail: 'amit.sharma@gmail.com', facility: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', unitCode: 'MUM-A101', unitType: 'Climate-Controlled', leaseDuration: '12 Months', monthlyRentInr: 8500, startDate: '01 Jan 2026', endDate: '31 Dec 2026', nextRenewal: '01 Jan 2027', status: 'ACTIVE' },
  { id: 'bk-02', bookingCode: 'RQ-2026-00729', tenantName: 'Priya Verma', tenantEmail: 'priya.verma@outlook.com', facility: 'Urban Attic Self-Storage', city: 'Bengaluru', unitCode: 'BLR-D88', unitType: 'Drive-Up Storage', leaseDuration: '6 Months', monthlyRentInr: 6800, startDate: '01 Jul 2026', endDate: '31 Dec 2026', nextRenewal: '01 Jan 2027', status: 'ACTIVE' },
  { id: 'bk-03', bookingCode: 'RQ-2026-00615', tenantName: 'Ravi Kumar', tenantEmail: 'ravi.kumar@yahoo.com', facility: 'Capital Vault Warehousing', city: 'Delhi NCR', unitCode: 'DEL-F02', unitType: 'Cold Storage', leaseDuration: '3 Months', monthlyRentInr: 18500, startDate: '01 Aug 2026', endDate: '31 Oct 2026', nextRenewal: 'N/A', status: 'COMPLETED' },
  { id: 'bk-04', bookingCode: 'RQ-2026-00502', tenantName: 'Sunita Patel', tenantEmail: 'sunita@hotmail.com', facility: 'SafeKeep Pune Storage', city: 'Pune', unitCode: 'PUN-G09', unitType: 'Micro-Locker', leaseDuration: '6 Months', monthlyRentInr: 2800, startDate: '01 May 2026', endDate: '31 Oct 2026', nextRenewal: 'N/A', status: 'OVERDUE' },
  { id: 'bk-05', bookingCode: 'RQ-2026-00990', tenantName: 'Deepak Nair', tenantEmail: 'deepak.nair@gmail.com', facility: 'Metro Box Hyderabad', city: 'Hyderabad', unitCode: 'HYD-H22', unitType: 'Heavy Warehouse Bay', leaseDuration: '12 Months', monthlyRentInr: 22000, startDate: '01 Dec 2026', endDate: '30 Nov 2027', nextRenewal: '01 Dec 2027', status: 'UPCOMING' },
  { id: 'bk-06', bookingCode: 'RQ-2026-00888', tenantName: 'Meera Joshi', tenantEmail: 'meera.joshi@gmail.com', facility: 'SecureHub Chennai', city: 'Chennai', unitCode: 'CHN-I14', unitType: 'Document Storage', leaseDuration: '24 Months', monthlyRentInr: 5500, startDate: '01 Mar 2025', endDate: '28 Feb 2027', nextRenewal: '01 Mar 2027', status: 'ACTIVE' },
  { id: 'bk-07', bookingCode: 'RQ-2026-00441', tenantName: 'Kabir Khan', tenantEmail: 'kabir.khan@gmail.com', facility: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', unitCode: 'MUM-B201', unitType: 'Heavy Warehouse Bay', leaseDuration: '6 Months', monthlyRentInr: 25000, startDate: '01 Jun 2026', endDate: '30 Nov 2026', nextRenewal: 'N/A', status: 'OVERDUE' },
  { id: 'bk-08', bookingCode: 'RQ-2026-01001', tenantName: 'Anjali Singh', tenantEmail: 'anjali.singh@proton.me', facility: 'Urban Attic Self-Storage', city: 'Bengaluru', unitCode: 'BLR-L99', unitType: 'Heavy Warehouse Bay', leaseDuration: '12 Months', monthlyRentInr: 32000, startDate: '15 Nov 2026', endDate: '14 Nov 2027', nextRenewal: '15 Nov 2027', status: 'ACTIVE' },
];

const statusConfig = {
  ACTIVE: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  COMPLETED: { color: 'bg-stone-50 text-stone-600 border-stone-200', icon: CheckCircle2 },
  OVERDUE: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  UPCOMING: { color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Clock },
};

const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai'];

function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function exportCSV(data: Booking[]) {
  const headers = ['Booking Code', 'Tenant', 'Email', 'Facility', 'City', 'Unit', 'Type', 'Duration', 'Monthly Rent (₹)', 'Start Date', 'End Date', 'Next Renewal', 'Status'];
  const rows = data.map((b) => [b.bookingCode, b.tenantName, b.tenantEmail, b.facility, b.city, b.unitCode, b.unitType, b.leaseDuration, b.monthlyRentInr, b.startDate, b.endDate, b.nextRenewal, b.status]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RentAllQ_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const filtered = BOOKINGS.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.tenantName.toLowerCase().includes(q) || b.bookingCode.toLowerCase().includes(q) || b.facility.toLowerCase().includes(q) || b.unitCode.toLowerCase().includes(q)) &&
      (cityFilter === 'All Cities' || b.city === cityFilter) &&
      (statusFilter === 'ALL' || b.status === statusFilter)
    );
  });

  const totalActiveRent = BOOKINGS.filter((b) => b.status === 'ACTIVE').reduce((s, b) => s + b.monthlyRentInr, 0);
  const overdueCount = BOOKINGS.filter((b) => b.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Platform Bookings</h1>
          </div>
          <p className="text-xs text-stone-500">Complete audit log of all rental contracts across all registered facilities.</p>
        </div>
        <Button onClick={() => exportCSV(filtered)} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: String(BOOKINGS.length), color: 'text-navy-900' },
          { label: 'Active Leases', value: String(BOOKINGS.filter((b) => b.status === 'ACTIVE').length), color: 'text-emerald-700' },
          { label: 'Overdue', value: String(overdueCount), color: 'text-rose-600' },
          { label: 'Active Monthly Revenue ₹', value: formatInr(totalActiveRent), color: 'text-amber-700' },
        ].map((k) => (
          <Card key={k.label} className="bg-white border-stone-200 shadow-xs p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{k.label}</p>
            <p className={`text-xl font-bold font-serif mt-1 ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input type="text" placeholder="Search tenant, booking ID, unit..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(['ALL', 'ACTIVE', 'OVERDUE', 'COMPLETED', 'UPCOMING'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                {['Booking Code', 'Tenant', 'Facility / City', 'Unit', 'Duration', 'Monthly Rent ₹', 'End Date', 'Status', 'View'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-stone-500 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((b) => {
                const sc = statusConfig[b.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={b.id} className="hover:bg-cream-100/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-navy-900 text-[11px]">{b.bookingCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-900">{b.tenantName}</p>
                      <p className="text-stone-400 text-[10px]">{b.tenantEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900 max-w-[160px] truncate">{b.facility}</p>
                      <div className="flex items-center gap-1 text-stone-400 text-[10px] mt-0.5"><MapPin className="h-3 w-3" />{b.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-navy-900">{b.unitCode}</p>
                      <p className="text-stone-400 text-[10px]">{b.unitType}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{b.leaseDuration}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">
                      <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{b.monthlyRentInr.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{b.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />{b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewBooking(b)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"><Eye className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Booking Modal */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif">{viewBooking.bookingCode}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{viewBooking.tenantName} · {viewBooking.facility}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewBooking.status].color}`}>{viewBooking.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tenant Email', value: viewBooking.tenantEmail },
                { label: 'Facility', value: viewBooking.facility },
                { label: 'City', value: viewBooking.city },
                { label: 'Unit Code', value: viewBooking.unitCode },
                { label: 'Unit Type', value: viewBooking.unitType },
                { label: 'Lease Duration', value: viewBooking.leaseDuration },
                { label: 'Monthly Rent', value: formatInr(viewBooking.monthlyRentInr) },
                { label: 'Lease Start', value: viewBooking.startDate },
                { label: 'Lease End', value: viewBooking.endDate },
                { label: 'Next Renewal', value: viewBooking.nextRenewal },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => exportCSV([viewBooking])} variant="outline" className="flex-1 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Lease
              </Button>
              <Button onClick={() => setViewBooking(null)} variant="outline" className="flex-1 text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
