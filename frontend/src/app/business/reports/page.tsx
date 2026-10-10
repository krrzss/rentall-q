'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, Download, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function BusinessReportsPage() {
  return (
    <div className="space-y-6 text-navy-900 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            Manager &amp; Owner Access Only
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif mt-1">
            Business &amp; Financial Reports
          </h1>
          <p className="text-xs text-stone-500">
            Export occupancy forecasts, revenue collections, and churn analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Exporting full CSV report...')}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-800 transition cursor-pointer"
        >
          <Download className="h-4 w-4 text-amber-400" />
          <span>Export CSV / PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>YTD Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">₹412,850.00</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">+14.2% YoY growth</div>
        </Card>

        <Card>
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>Avg Lease Duration</span>
            <Calendar className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">11.4 Months</div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">High tenant stability</div>
        </Card>

        <Card>
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>Churn Rate</span>
            <Filter className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900 mt-2 font-serif">2.1%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">-0.8% decrease</div>
        </Card>
      </div>
    </div>
  );
}
