'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CreditCard, Download, IndianRupee, TrendingUp,
  CheckCircle2, AlertTriangle, Clock, Eye, Search,
} from 'lucide-react';

interface Transaction {
  id: string;
  invoiceCode: string;
  paidBy: string;
  paidTo: string;
  grossAmountInr: number;
  platformFeeInr: number;
  netToOwnerInr: number;
  method: 'UPI' | 'NetBanking' | 'Card' | 'Cash';
  date: string;
  status: 'SETTLED' | 'PENDING_PAYOUT' | 'FAILED' | 'REFUNDED';
}

const TRANSACTIONS: Transaction[] = [
  { id: 't-01', invoiceCode: 'INV-2026-00841', paidBy: 'Amit Sharma', paidTo: 'Hindustan Cold Storage & Logistics', grossAmountInr: 8500, platformFeeInr: 723, netToOwnerInr: 7777, method: 'UPI', date: '01 Nov 2026', status: 'SETTLED' },
  { id: 't-02', invoiceCode: 'INV-2026-00729', paidBy: 'Priya Verma', paidTo: 'Urban Attic Self-Storage', grossAmountInr: 6800, platformFeeInr: 578, netToOwnerInr: 6222, method: 'NetBanking', date: '01 Nov 2026', status: 'SETTLED' },
  { id: 't-03', invoiceCode: 'INV-2026-00888', paidBy: 'Meera Joshi', paidTo: 'SecureHub Chennai', grossAmountInr: 5500, platformFeeInr: 468, netToOwnerInr: 5033, method: 'Card', date: '01 Nov 2026', status: 'SETTLED' },
  { id: 't-04', invoiceCode: 'INV-2026-01001', paidBy: 'Anjali Singh', paidTo: 'Urban Attic Self-Storage', grossAmountInr: 32000, platformFeeInr: 2720, netToOwnerInr: 29280, method: 'NetBanking', date: '15 Nov 2026', status: 'PENDING_PAYOUT' },
  { id: 't-05', invoiceCode: 'INV-2026-00502', paidBy: 'Sunita Patel', paidTo: 'SafeKeep Pune Storage', grossAmountInr: 2800, platformFeeInr: 238, netToOwnerInr: 2562, method: 'UPI', date: '01 Oct 2026', status: 'FAILED' },
  { id: 't-06', invoiceCode: 'INV-2026-00441', paidBy: 'Kabir Khan', paidTo: 'Hindustan Cold Storage & Logistics', grossAmountInr: 25000, platformFeeInr: 2125, netToOwnerInr: 22875, method: 'NetBanking', date: '01 Nov 2026', status: 'PENDING_PAYOUT' },
  { id: 't-07', invoiceCode: 'INV-2026-00615', paidBy: 'Ravi Kumar', paidTo: 'Capital Vault Warehousing', grossAmountInr: 18500, platformFeeInr: 1573, netToOwnerInr: 16928, method: 'Card', date: '01 Aug 2026', status: 'SETTLED' },
  { id: 't-08', invoiceCode: 'INV-2026-00990', paidBy: 'Deepak Nair', paidTo: 'Metro Box Hyderabad', grossAmountInr: 22000, platformFeeInr: 1870, netToOwnerInr: 20130, method: 'UPI', date: '01 Dec 2026', status: 'PENDING_PAYOUT' },
  { id: 't-09', invoiceCode: 'INV-2026-00410', paidBy: 'Rohit Desai', paidTo: 'SafeKeep Pune Storage', grossAmountInr: 2800, platformFeeInr: 238, netToOwnerInr: 2562, method: 'UPI', date: '01 Sep 2026', status: 'REFUNDED' },
  { id: 't-10', invoiceCode: 'INV-2026-00311', paidBy: 'Nisha Reddy', paidTo: 'SecureHub Chennai', grossAmountInr: 9000, platformFeeInr: 765, netToOwnerInr: 8235, method: 'Card', date: '01 Oct 2026', status: 'SETTLED' },
];

const statusConfig = {
  SETTLED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Settled', icon: CheckCircle2 },
  PENDING_PAYOUT: { color: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Pending Payout', icon: Clock },
  FAILED: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Failed', icon: AlertTriangle },
  REFUNDED: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Refunded', icon: AlertTriangle },
};

const methodColor: Record<string, string> = {
  UPI: 'bg-violet-50 text-violet-700 border-violet-200',
  NetBanking: 'bg-sky-50 text-sky-700 border-sky-200',
  Card: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cash: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function exportCSV(data: Transaction[]) {
  const headers = ['Invoice Code', 'Paid By', 'Paid To', 'Gross Amount (₹)', 'Platform Fee (₹)', 'Net to Owner (₹)', 'Method', 'Date', 'Status'];
  const rows = data.map((t) => [t.invoiceCode, t.paidBy, t.paidTo, t.grossAmountInr, t.platformFeeInr, t.netToOwnerInr, t.method, t.date, t.status]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RentAllQ_Financials_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewTx, setViewTx] = useState<Transaction | null>(null);

  const filtered = TRANSACTIONS.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.invoiceCode.toLowerCase().includes(q) || t.paidBy.toLowerCase().includes(q) || t.paidTo.toLowerCase().includes(q)) &&
      (statusFilter === 'ALL' || t.status === statusFilter)
    );
  });

  const totalCollected = TRANSACTIONS.filter((t) => t.status === 'SETTLED').reduce((s, t) => s + t.grossAmountInr, 0);
  const totalCommission = TRANSACTIONS.filter((t) => t.status === 'SETTLED').reduce((s, t) => s + t.platformFeeInr, 0);
  const totalPayout = TRANSACTIONS.filter((t) => t.status === 'SETTLED').reduce((s, t) => s + t.netToOwnerInr, 0);
  const totalFailed = TRANSACTIONS.filter((t) => ['FAILED', 'REFUNDED'].includes(t.status)).reduce((s, t) => s + t.grossAmountInr, 0);

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Financials & Payouts</h1>
          </div>
          <p className="text-xs text-stone-500">Platform transaction ledger, commission earned, and business owner payouts in ₹.</p>
        </div>
        <Button onClick={() => exportCSV(filtered)} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download Tax & Payout Report (CSV)
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: formatInr(totalCollected), sub: 'Settled transactions', color: 'text-navy-900', icon: IndianRupee, iconC: 'text-amber-600' },
          { label: 'Platform Commission', value: formatInr(totalCommission), sub: 'Platform revenue', color: 'text-emerald-700', icon: TrendingUp, iconC: 'text-emerald-600' },
          { label: 'Net to Business Owners', value: formatInr(totalPayout), sub: 'Dispatched payouts', color: 'text-sky-700', icon: CheckCircle2, iconC: 'text-sky-500' },
          { label: 'Failed / Refunded', value: formatInr(totalFailed), sub: 'Needs attention', color: 'text-rose-600', icon: AlertTriangle, iconC: 'text-rose-500' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="bg-white border-stone-200 shadow-xs p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{k.label}</span>
                <Icon className={`h-4 w-4 ${k.iconC}`} />
              </div>
              <p className={`text-xl font-bold font-serif ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-stone-400">{k.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input type="text" placeholder="Search invoice, tenant, facility..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'SETTLED', 'PENDING_PAYOUT', 'FAILED', 'REFUNDED'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ').charAt(0) + s.replace('_', ' ').slice(1).toLowerCase()}
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
                {['Invoice', 'Paid By', 'Paid To (Facility)', 'Gross ₹', 'Platform Fee ₹', 'Net to Owner ₹', 'Method', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-stone-500 uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((t) => {
                const sc = statusConfig[t.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={t.id} className="hover:bg-cream-100/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-navy-900 text-[11px]">{t.invoiceCode}</td>
                    <td className="px-4 py-3 font-medium text-navy-900">{t.paidBy}</td>
                    <td className="px-4 py-3 text-stone-600 max-w-[160px] truncate">{t.paidTo}</td>
                    <td className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">
                      <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{t.grossAmountInr.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3 text-rose-600 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{t.platformFeeInr.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{t.netToOwnerInr.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${methodColor[t.method]}`}>{t.method}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewTx(t)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"><Eye className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Transaction Modal */}
      {viewTx && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif">Invoice: {viewTx.invoiceCode}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{viewTx.paidBy} → {viewTx.paidTo}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewTx.status].color}`}>{statusConfig[viewTx.status].label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Paid By (Tenant)', value: viewTx.paidBy },
                { label: 'Paid To (Facility)', value: viewTx.paidTo },
                { label: 'Gross Amount', value: formatInr(viewTx.grossAmountInr) },
                { label: 'Platform Fee (8.5%)', value: formatInr(viewTx.platformFeeInr) },
                { label: 'Net to Owner', value: formatInr(viewTx.netToOwnerInr) },
                { label: 'Payment Method', value: viewTx.method },
                { label: 'Transaction Date', value: viewTx.date },
                { label: 'Status', value: statusConfig[viewTx.status].label },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => exportCSV([viewTx])} variant="outline" className="flex-1 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Receipt
              </Button>
              <Button onClick={() => setViewTx(null)} variant="outline" className="flex-1 text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
