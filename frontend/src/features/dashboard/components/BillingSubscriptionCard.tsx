'use client';

import React, { useState } from 'react';
import { Crown, Zap, ShieldCheck, CreditCard, ArrowUpRight, Check, X } from 'lucide-react';

interface BillingSubscriptionCardProps {
  onNotify: (msg: string) => void;
}

export function BillingSubscriptionCard({ onNotify }: BillingSubscriptionCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Owner Exclusive
            </span>
          </div>
          <h2 className="text-lg font-bold text-navy-900 font-serif mt-1">Billing &amp; Subscription Portal</h2>
          <p className="text-xs text-stone-500">
            Manage your subscription tier, billing period, seat quotas &amp; payment gateway integrations.
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-navy-950 shadow-xs hover:bg-amber-400 transition cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 text-navy-950" />
          <span>Upgrade to Enterprise</span>
        </button>
      </div>

      {/* Plan Details & Meters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Plan Overview Card */}
        <div className="rounded-xl bg-navy-900 text-white p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-navy-950 font-bold">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold font-serif">Professional Tier</div>
                <div className="text-xs text-stone-300">₹7,999 / mo &bull; Billed Annually</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500 text-navy-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
              ACTIVE
            </span>
          </div>

          <div className="border-t border-navy-800 pt-3 flex items-center justify-between text-xs text-stone-300">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" /> Card ending in •••• 4242
            </span>
            <span className="text-[11px] text-stone-400">Renews Aug 2027</span>
          </div>
        </div>

        {/* Quota & Usage Meters */}
        <div className="rounded-xl bg-cream-50 border border-stone-200 p-5 space-y-4">
          <div className="text-xs font-bold text-navy-900">Current Plan Usage Quotas</div>

          {/* Unit Quota */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-stone-600">
              <span>Managed Rental Units</span>
              <span className="text-navy-900 font-bold">184 / 250 Units (73%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full bg-navy-900 rounded-full" style={{ width: '73%' }} />
            </div>
          </div>

          {/* Staff Seat Quota */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-stone-600">
              <span>Team &amp; Manager Seats</span>
              <span className="text-navy-900 font-bold">5 / 10 Seats (50%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 font-sans space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-navy-900 font-serif">Upgrade to Enterprise Portfolio Tier</h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-navy-900">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 text-sm font-serif">Enterprise Tier Benefits</div>
                <ul className="space-y-1 text-stone-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600" /> Unlimited Rental Units &amp; Warehouse Bays
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600" /> Unlimited Manager &amp; Staff Team Seats
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600" /> Dedicated AI Agent Tuning &amp; Custom WhatsApp Integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600" /> Priority 24/7 Account Management
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onNotify('Enterprise tier upgrade request submitted! An account manager will reach out.');
                    setShowUpgradeModal(false);
                  }}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-navy-950 shadow-md hover:bg-amber-400 transition cursor-pointer"
                >
                  Request Enterprise Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
