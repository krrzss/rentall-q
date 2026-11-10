'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MessageSquareWarning, Search, Eye, CheckCircle2,
  AlertTriangle, Clock, Building2, Calendar, ChevronDown, X,
} from 'lucide-react';

interface BusinessComplaint {
  id: string;
  complaintCode: string;
  businessName: string;
  city: string;
  filedBy: string; // admin or automated
  issue: string;
  details: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  filedAt: string;
  resolvedAt: string | null;
  adminNotes: string;
}

const COMPLAINTS: BusinessComplaint[] = [
  { id: 'bc-01', complaintCode: 'BC-2026-0041', businessName: 'Metro Box Hyderabad', city: 'Hyderabad', filedBy: 'Platform Audit System', issue: 'Unit Maintenance Delay', details: 'Unit HYD-H22 has been listed as "Under Maintenance" for 22 days without update. Tenant impacted.', category: 'Facility Management', severity: 'HIGH', status: 'UNDER_REVIEW', filedAt: '01 Nov 2026 · 09:00 AM', resolvedAt: null, adminNotes: 'Business owner contacted. Resolution expected by 20 Nov.' },
  { id: 'bc-02', complaintCode: 'BC-2026-0038', businessName: 'Kolkata Cargo & Storage Hub', city: 'Kolkata', filedBy: 'Platform Audit System', issue: 'Repeated Policy Violation', details: 'Business has received 3 tenant complaints about unauthorized access to units within 30 days.', category: 'Policy Violation', severity: 'CRITICAL', status: 'OPEN', filedAt: '05 Nov 2026 · 11:30 AM', resolvedAt: null, adminNotes: '' },
  { id: 'bc-03', complaintCode: 'BC-2026-0031', businessName: 'GreenField Storage Co.', city: 'Ahmedabad', filedBy: 'admin@rentallq.com', issue: 'Incorrect Pricing Listed', details: 'Business listed units at ₹500/mo but charged ₹2,800 upon booking. Deceptive pricing found in audit.', category: 'Pricing Dispute', severity: 'HIGH', status: 'RESOLVED', filedAt: '28 Oct 2026 · 02:15 PM', resolvedAt: '05 Nov 2026 · 04:00 PM', adminNotes: 'Business corrected pricing. Final warning issued.' },
  { id: 'bc-04', complaintCode: 'BC-2026-0025', businessName: 'SafeKeep Pune Storage', city: 'Pune', filedBy: 'admin@rentallq.com', issue: 'CCTV System Offline', details: 'Tenant reported CCTV feed offline for 7 days. Business has not provided any explanation.', category: 'Security Failure', severity: 'MEDIUM', status: 'RESOLVED', filedAt: '20 Oct 2026 · 08:45 AM', resolvedAt: '25 Oct 2026 · 03:30 PM', adminNotes: 'Business replaced CCTV. Verified by site inspection.' },
  { id: 'bc-05', complaintCode: 'BC-2026-0019', businessName: 'Urban Attic Self-Storage', city: 'Bengaluru', filedBy: 'Platform Audit System', issue: 'GST Invoice Not Provided', details: 'Multiple tenants reported GST invoices not issued for payments above ₹5,000.', category: 'Compliance', severity: 'MEDIUM', status: 'DISMISSED', filedAt: '10 Oct 2026 · 10:00 AM', resolvedAt: '12 Oct 2026 · 02:00 PM', adminNotes: 'Business provided documentation proving invoices were sent. Complaint dismissed.' },
];

const severityColors = {
  LOW: 'bg-stone-50 text-stone-600 border-stone-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
};

const statusConfig = {
  OPEN: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  UNDER_REVIEW: { color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Clock },
  RESOLVED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DISMISSED: { color: 'bg-stone-50 text-stone-600 border-stone-200', icon: X },
};

export default function BusinessComplaintsPage() {
  const [complaints, setComplaints] = useState<BusinessComplaint[]>(COMPLAINTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewC, setViewC] = useState<BusinessComplaint | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const updateStatus = (id: string, newStatus: BusinessComplaint['status']) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus, resolvedAt: ['RESOLVED', 'DISMISSED'].includes(newStatus) ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : c.resolvedAt, adminNotes: adminNote || c.adminNotes }
          : c
      )
    );
    showToast(`Complaint ${id} marked as ${newStatus}.`);
    setViewC(null);
    setAdminNote('');
  };

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.businessName.toLowerCase().includes(q) || c.complaintCode.toLowerCase().includes(q) || c.issue.toLowerCase().includes(q)) &&
      (statusFilter === 'ALL' || c.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareWarning className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Business Complaints</h1>
          </div>
          <p className="text-xs text-stone-500">Complaints filed against registered businesses — policy violations, security failures, pricing issues.</p>
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ').charAt(0) + s.replace('_', ' ').slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: complaints.filter((c) => c.status === 'OPEN').length, color: 'text-rose-600' },
          { label: 'Under Review', count: complaints.filter((c) => c.status === 'UNDER_REVIEW').length, color: 'text-sky-600' },
          { label: 'Resolved', count: complaints.filter((c) => c.status === 'RESOLVED').length, color: 'text-emerald-600' },
          { label: 'Total', count: complaints.length, color: 'text-navy-900' },
        ].map((s) => (
          <Card key={s.label} className="bg-white border-stone-200 shadow-xs p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{s.label}</p>
            <p className={`text-2xl font-bold font-serif mt-1 ${s.color}`}>{s.count}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <input type="text" placeholder="Search business or issue..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                {['Code', 'Business', 'City', 'Issue', 'Category', 'Severity', 'Filed At', 'Status', 'Actions'].map((h) => (
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
                    <td className="px-4 py-3 font-mono font-bold text-navy-900 text-[11px]">{c.complaintCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                        <span className="font-semibold text-navy-900 max-w-[140px] truncate">{c.businessName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{c.city}</td>
                    <td className="px-4 py-3 font-medium text-navy-900 max-w-[180px] truncate">{c.issue}</td>
                    <td className="px-4 py-3 text-stone-500">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${severityColors[c.severity]}`}>{c.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-stone-500"><Calendar className="h-3 w-3 text-stone-400" />{c.filedAt.split(' · ')[0]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />{c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setViewC(c); setAdminNote(c.adminNotes); }} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-all"><Eye className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewC && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif">{viewC.complaintCode}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{viewC.businessName} · {viewC.city}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewC.status].color}`}>{viewC.status.replace('_', ' ')}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-xs font-bold text-rose-700 mb-1">{viewC.issue}</p>
              <p className="text-xs text-rose-600 leading-relaxed">{viewC.details}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Category', value: viewC.category },
                { label: 'Severity', value: viewC.severity },
                { label: 'Filed By', value: viewC.filedBy },
                { label: 'Filed At', value: viewC.filedAt },
                { label: 'Resolved At', value: viewC.resolvedAt || 'Not yet' },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-xs font-bold text-navy-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Admin Notes</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" rows={3}
                placeholder="Add resolution notes..." />
            </div>
            {viewC.status === 'OPEN' || viewC.status === 'UNDER_REVIEW' ? (
              <div className="flex gap-2">
                <Button onClick={() => updateStatus(viewC.id, 'UNDER_REVIEW')} variant="outline" className="flex-1 text-xs border-sky-200 text-sky-600 hover:bg-sky-50">
                  Mark Under Review
                </Button>
                <Button onClick={() => updateStatus(viewC.id, 'RESOLVED')} variant="primary" className="flex-1 text-xs bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                </Button>
                <Button onClick={() => updateStatus(viewC.id, 'DISMISSED')} variant="outline" className="flex-1 text-xs border-stone-200 text-stone-500">
                  Dismiss
                </Button>
              </div>
            ) : (
              <Button onClick={() => setViewC(null)} variant="outline" className="w-full text-xs">Close</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

