'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Settings, Crown, CreditCard, ShieldCheck, Check } from 'lucide-react';

export default function BusinessSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 text-navy-900 font-sans max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
          Business Owner Access Only
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif mt-1">
          Settings &amp; Subscription Billing
        </h1>
        <p className="text-xs text-stone-500">
          Manage business profile, team seats, payment gateway integration, and subscription plan.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Business settings updated successfully.</span>
        </div>
      )}

      {/* Plan Details */}
      <Card title="Current Subscription Plan">
        <div className="flex items-center justify-between p-4 bg-navy-900 text-white rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-navy-900 font-bold">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold font-serif">Professional Plan</div>
              <div className="text-xs text-stone-300">₹7,999 / month &bull; Billed Annually</div>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-500 text-navy-900 px-3 py-1 rounded-full">
            ACTIVE
          </span>
        </div>
      </Card>

      {/* Settings Form */}
      <form onSubmit={handleSave}>
        <Card title="Business Profile">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-navy-800 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="RentallQ Demo Portfolio"
                className="w-full rounded-xl border border-stone-300 p-2.5 text-sm text-navy-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-navy-800 mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="admin@rentallq.com"
                className="w-full rounded-xl border border-stone-300 p-2.5 text-sm text-navy-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-navy-800 transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
