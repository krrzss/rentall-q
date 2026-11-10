'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Settings, IndianRupee, Shield, CheckCircle2, Hash,
  FileText, ToggleLeft, ToggleRight, TrendingUp,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState(8.5);
  const [gstIn, setGstIn] = useState('27AAACR1234Q1Z5');
  const [legalName, setLegalName] = useState('RentAll-Q Technologies Pvt. Ltd.');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    showToast('Platform settings saved successfully.');
  };

  // Commission Calculator
  const [calcGmv, setCalcGmv] = useState(1000000);
  const calcCommission = Math.round(calcGmv * (commissionRate / 100));
  const calcNetToOwners = calcGmv - calcCommission;

  return (
    <div className="space-y-6 text-navy-900 font-sans max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-5 w-5 text-amber-600" />
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Platform Settings</h1>
        </div>
        <p className="text-xs text-stone-500">Global system configuration, commission rates, GST/tax setup, and security controls.</p>
      </div>

      {/* Commission Rate */}
      <Card className="bg-white border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-navy-900 font-serif">Platform Commission Rate</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-600 mb-2">
              Commission Rate: <span className="text-amber-700 text-sm font-bold">{commissionRate.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>1%</span><span>5%</span><span>10%</span><span>15%</span><span>20%</span>
            </div>
          </div>
          <div className="text-center bg-amber-50 border border-amber-200 rounded-xl p-4 min-w-[120px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Current Rate</p>
            <p className="text-2xl font-bold text-amber-700 font-serif">{commissionRate.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {/* Commission Calculator */}
      <Card className="bg-white border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-navy-900 font-serif">Platform Revenue Calculator</h2>
        </div>
        <p className="text-xs text-stone-500">See how much RentAll-Q earns based on projected platform GMV.</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-600 mb-2">
              Monthly GMV (₹): <span className="text-navy-900 font-bold">{new Intl.NumberFormat('en-IN').format(calcGmv)}</span>
            </label>
            <input type="range" min={100000} max={10000000} step={100000} value={calcGmv} onChange={(e) => setCalcGmv(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹1L</span><span>₹25L</span><span>₹50L</span><span>₹75L</span><span>₹1Cr</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Platform GMV', value: `₹${new Intl.NumberFormat('en-IN').format(calcGmv)}`, color: 'text-navy-900' },
            { label: `Commission (${commissionRate.toFixed(1)}%)`, value: `₹${new Intl.NumberFormat('en-IN').format(calcCommission)}`, color: 'text-emerald-700' },
            { label: 'Net to Business Owners', value: `₹${new Intl.NumberFormat('en-IN').format(calcNetToOwners)}`, color: 'text-sky-700' },
          ].map((row) => (
            <div key={row.label} className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
              <p className={`text-lg font-bold font-serif mt-1 ${row.color}`}>{row.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* GST & Invoicing */}
      <Card className="bg-white border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-navy-900 font-serif">GST & Invoicing Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Legal Entity Name</label>
            <input value={legalName} onChange={(e) => setLegalName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">GSTIN Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input value={gstIn} onChange={(e) => setGstIn(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Invoice Prefix</label>
            <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
          </div>
        </div>
      </Card>

      {/* Security & Access */}
      <Card className="bg-white border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-navy-900 font-serif">Security & Access Control</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-navy-900">Multi-Factor Authentication (MFA)</p>
              <p className="text-[11px] text-stone-500">Require TOTP/email OTP for admin login</p>
            </div>
            <button onClick={() => setMfaEnabled((v) => !v)} className="transition-all">
              {mfaEnabled ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-stone-400" />}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-navy-900">Maintenance Mode</p>
              <p className="text-[11px] text-stone-500">Show maintenance banner to all users. Admin access unaffected.</p>
            </div>
            <button onClick={() => setMaintenanceMode((v) => !v)} className="transition-all">
              {maintenanceMode ? <ToggleRight className="h-6 w-6 text-amber-500" /> : <ToggleLeft className="h-6 w-6 text-stone-400" />}
            </button>
          </div>
        </div>
        {maintenanceMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
            ⚠ Maintenance mode is ON — all non-admin users will see a maintenance banner.
          </div>
        )}
      </Card>

      {/* System Health */}
      <Card className="bg-white border-stone-200 shadow-xs p-6 space-y-3">
        <h2 className="text-sm font-bold text-navy-900 font-serif">System Health Status</h2>
        <div className="space-y-2">
          {[
            { label: 'Database (Supabase)', status: 'Operational', ok: true },
            { label: 'AI Agents Service (Python)', status: 'Operational', ok: true },
            { label: 'Payment Gateway', status: 'Operational', ok: true },
            { label: 'Email Notifications', status: 'Operational', ok: true },
            { label: 'File Storage', status: 'Operational', ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
              <span className="text-xs font-medium text-navy-900">{s.label}</span>
              <span className={`text-[11px] font-bold flex items-center gap-1 ${s.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span className={`h-2 w-2 rounded-full inline-block ${s.ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} variant="primary" className="bg-amber-500 text-navy-900 hover:bg-amber-400 border-amber-500 font-semibold">
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
