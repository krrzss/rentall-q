'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart3, Download, TrendingUp, Calendar, Filter, Printer,
  CheckCircle2, ArrowUpRight, PieChart as PieIcon, Layers, FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, AreaChart, Area,
} from 'recharts';

interface MonthlyStatement {
  month: string;
  grossRevenueInr: number;
  platformFeeInr: number;
  netPayoutInr: number;
  occupancyPct: number;
  activeUnits: number;
  status: 'SETTLED' | 'IN_PROCESSING';
}

const MONTHLY_DATA: MonthlyStatement[] = [
  { month: 'Jun 2026', grossRevenueInr: 580000, platformFeeInr: 49300, netPayoutInr: 530700, occupancyPct: 81.2, activeUnits: 39, status: 'SETTLED' },
  { month: 'Jul 2026', grossRevenueInr: 610000, platformFeeInr: 51850, netPayoutInr: 558150, occupancyPct: 83.5, activeUnits: 40, status: 'SETTLED' },
  { month: 'Aug 2026', grossRevenueInr: 595000, platformFeeInr: 50575, netPayoutInr: 544425, occupancyPct: 82.0, activeUnits: 39, status: 'SETTLED' },
  { month: 'Sep 2026', grossRevenueInr: 640000, platformFeeInr: 54400, netPayoutInr: 585600, occupancyPct: 85.4, activeUnits: 41, status: 'SETTLED' },
  { month: 'Oct 2026', grossRevenueInr: 665000, platformFeeInr: 56525, netPayoutInr: 608475, occupancyPct: 87.5, activeUnits: 42, status: 'SETTLED' },
  { month: 'Nov 2026 (MTD)', grossRevenueInr: 630000, platformFeeInr: 53550, netPayoutInr: 576450, occupancyPct: 87.5, activeUnits: 42, status: 'IN_PROCESSING' },
];

function formatInr(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

export default function BusinessReportsPage() {
  const [period, setPeriod] = useState<'3M' | '6M' | 'YTD' | 'ALL'>('6M');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const exportCSV = () => {
    const headers = ['Month', 'Gross Revenue (INR)', 'Platform Fee 8.5% (INR)', 'Net Payout (INR)', 'Occupancy %', 'Active Units', 'Status'];
    const rows = MONTHLY_DATA.map((d) => [
      d.month,
      d.grossRevenueInr,
      d.platformFeeInr,
      d.netPayoutInr,
      `${d.occupancyPct}%`,
      d.activeUnits,
      d.status,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RentAllQ_Business_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Facility financial audit statement exported as CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalGross = MONTHLY_DATA.reduce((s, m) => s + m.grossRevenueInr, 0);
  const totalPayout = MONTHLY_DATA.reduce((s, m) => s + m.netPayoutInr, 0);
  const avgOccupancy = (MONTHLY_DATA.reduce((s, m) => s + m.occupancyPct, 0) / MONTHLY_DATA.length).toFixed(1);

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-amber-400 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Manager &amp; Owner Executive Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 font-serif">
            Financial &amp; Operational Reports
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Reconciled revenue settlements, tax reports, and historical occupancy analytics in ₹.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={exportCSV}
            variant="outline"
            className="border-stone-300 text-navy-900 hover:bg-stone-50 text-xs font-bold shadow-xs"
          >
            <Download className="h-4 w-4 text-amber-600 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            onClick={handlePrint}
            className="bg-navy-900 text-white hover:bg-navy-800 text-xs font-bold shadow-xs"
          >
            <Printer className="h-4 w-4 text-amber-400 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar & Time Horizon Switcher */}
      <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs font-semibold">
        <span className="text-stone-500">Reporting Horizon:</span>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
          {(['3M', '6M', 'YTD', 'ALL'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setPeriod(t);
                showToast(`Filter applied: ${t} window.`);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === t ? 'bg-navy-900 text-white shadow-xs' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              {t === '3M' ? 'Last 3 Months' : t === '6M' ? 'Last 6 Months' : t === 'YTD' ? 'YTD 2026' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            <span>Total Gross Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">{formatInr(totalGross)}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">+14.2% YoY growth</div>
        </Card>

        <Card className="bg-white border-stone-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            <span>Net Dispatched Payout</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-800 mt-2 font-serif">{formatInr(totalPayout)}</div>
          <div className="text-[11px] text-stone-400 mt-1">Dispatched to facility account</div>
        </Card>

        <Card className="bg-white border-stone-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            <span>Average Occupancy</span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">{avgOccupancy}%</div>
          <div className="text-[11px] text-stone-500 mt-1">42 / 48 Units occupied</div>
        </Card>

        <Card className="bg-white border-stone-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            <span>Annual Churn Rate</span>
            <Filter className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">2.1%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">-0.8% decrease (High retention)</div>
        </Card>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue vs Net Payout */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-900 font-serif">Revenue &amp; Payout History (₹)</h3>
              <p className="text-xs text-stone-400">Gross revenue vs net payout received</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              8.5% Platform Fee
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="grossRevenueInr" name="Gross Revenue (₹)" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="netPayoutInr" name="Net Payout (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Occupancy Rate Trajectory */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-900 font-serif">Occupancy Rate Trajectory</h3>
              <p className="text-xs text-stone-400">Monthly portfolio capacity utilization</p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Target: 85%+
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Occupancy']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="occupancyPct" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#occupancyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Reconciled Settlement Statements Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4.5 w-4.5 text-amber-600" />
            <h3 className="text-sm font-bold text-navy-900 font-serif">
              Reconciled Monthly Statements &amp; Audit Trail
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-medium">All amounts verified in ₹</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Statement Period</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Platform Fee (8.5%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Occupancy %</th>
                <th className="py-3 px-4">Active Units</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Statement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {MONTHLY_DATA.map((stmt) => (
                <tr key={stmt.month} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-900">{stmt.month}</td>
                  <td className="py-3.5 px-4 font-bold text-navy-900">{formatInr(stmt.grossRevenueInr)}</td>
                  <td className="py-3.5 px-4 text-stone-500 font-medium">{formatInr(stmt.platformFeeInr)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{formatInr(stmt.netPayoutInr)}</td>
                  <td className="py-3.5 px-4 font-semibold text-navy-900">{stmt.occupancyPct}%</td>
                  <td className="py-3.5 px-4 text-stone-600 font-medium">{stmt.activeUnits} units</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      stmt.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {stmt.status === 'SETTLED' ? 'Settled' : 'Processing'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => showToast(`Statement for ${stmt.month} downloaded.`)}
                      className="text-xs font-bold text-navy-900 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3 text-amber-600" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
