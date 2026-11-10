'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  HeadphonesIcon, Search, Eye, CheckCircle2,
  AlertTriangle, Clock, User, Calendar, X,
} from 'lucide-react';

interface ClientComplaint {
  id: string;
  complaintCode: string;
  clientName: string;
  clientEmail: string;
  againstBusiness: string;
  city: string;
  issue: string;
  details: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  filedAt: string;
  resolvedAt: string | null;
  adminNotes: string;
}

const CLIENT_COMPLAINTS: ClientComplaint[] = [
  { id: 'cc-01', complaintCode: 'CC-2026-0094', clientName: 'Ravi Kumar', clientEmail: 'ravi.kumar@yahoo.com', againstBusiness: 'Metro Box Hyderabad', city: 'Hyderabad', issue: 'Gate Access PIN Not Working', details: 'My gate access PIN MBH-4821 stopped working after my lease renewal. I cannot access my unit. This has been going on for 3 days. Business support is not responding.', category: 'Access Issue', severity: 'HIGH', status: 'OPEN', filedAt: '10 Nov 2026 · 07:30 AM', resolvedAt: null, adminNotes: '' },
  { id: 'cc-02', complaintCode: 'CC-2026-0088', clientName: 'Sunita Patel', clientEmail: 'sunita@hotmail.com', againstBusiness: 'SafeKeep Pune Storage', city: 'Pune', issue: 'Invoice Not Received for 2 Months', details: 'I have been paying ₹2,800/month but have not received proper GST invoice for September and October. The business is not issuing receipts.', category: 'Billing Issue', severity: 'MEDIUM', status: 'UNDER_REVIEW', filedAt: '08 Nov 2026 · 11:00 AM', resolvedAt: null, adminNotes: 'Business notified. Invoice generation pending.' },
  { id: 'cc-03', complaintCode: 'CC-2026-0071', clientName: 'Meera Joshi', clientEmail: 'meera.joshi@gmail.com', againstBusiness: 'SecureHub Chennai', city: 'Chennai', issue: 'Unit Condition — Water Damage', details: 'Found water seepage marks inside unit CHN-I14. Some of my archived documents got damaged. Business denied any responsibility.', category: 'Facility Condition', severity: 'HIGH', status: 'RESOLVED', filedAt: '25 Oct 2026 · 02:15 PM', resolvedAt: '05 Nov 2026 · 04:30 PM', adminNotes: 'Business agreed to repair and provided compensation of ₹5,000.' },
  { id: 'cc-04', complaintCode: 'CC-2026-0059', clientName: 'Amit Sharma', clientEmail: 'amit.sharma@gmail.com', againstBusiness: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', issue: 'Unexpected Rate Hike', details: 'My monthly rate was suddenly increased from ₹8,500 to ₹10,200 without any prior notice or lease amendment. This was not agreed upon.', category: 'Pricing Dispute', severity: 'HIGH', status: 'RESOLVED', filedAt: '15 Oct 2026 · 09:00 AM', resolvedAt: '20 Oct 2026 · 03:00 PM', adminNotes: 'Business reverted to original rate. Final warning issued.' },
  { id: 'cc-05', complaintCode: 'CC-2026-0044', clientName: 'Priya Verma', clientEmail: 'priya.verma@outlook.com', againstBusiness: 'Urban Attic Self-Storage', city: 'Bengaluru', issue: 'Poor Customer Service', details: 'Staff was rude and unresponsive when I reported a broken door hinge in my drive-up unit. Issue unresolved for 2 weeks.', category: 'Customer Service', severity: 'LOW', status: 'DISMISSED', filedAt: '10 Oct 2026 · 06:00 PM', resolvedAt: '11 Oct 2026 · 10:00 AM', adminNotes: 'Business provided screenshots showing the hinge was repaired within 24 hours. Complaint dismissed.' },
  { id: 'cc-06', complaintCode: 'CC-2026-0101', clientName: 'Kabir Khan', clientEmail: 'kabir.khan@gmail.com', againstBusiness: 'Hindustan Cold Storage & Logistics', city: 'Mumbai', issue: 'Overdue Charge Despite Payment', details: 'I paid ₹25,000 on 1 Nov via NetBanking but the system still shows my account as overdue. Proof of payment attached.', category: 'Payment Not Reflected', severity: 'HIGH', status: 'OPEN', filedAt: '10 Nov 2026 · 09:45 AM', resolvedAt: null, adminNotes: '' },
];

const severityColors = {
  LOW: 'bg-stone-50 text-stone-600 border-stone-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusConfig = {
  OPEN: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  UNDER_REVIEW: { color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Clock },
  RESOLVED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DISMISSED: { color: 'bg-stone-50 text-stone-600 border-stone-200', icon: X },
};

export default function ClientComplaintsPage() {
  const [complaints, setComplaints] = useState<ClientComplaint[]>(CLIENT_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewC, setViewC] = useState<ClientComplaint | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const updateStatus = (id: string, newStatus: ClientComplaint['status']) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus, resolvedAt: ['RESOLVED', 'DISMISSED'].includes(newStatus) ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · Now' : c.resolvedAt, adminNotes: adminNote || c.adminNotes }
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
      (c.clientName.toLowerCase().includes(q) || c.complaintCode.toLowerCase().includes(q) || c.againstBusiness.toLowerCase().includes(q) || c.issue.toLowerCase().includes(q)) &&
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
            <HeadphonesIcon className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">Client Complaints</h1>
          </div>
          <p className="text-xs text-stone-500">Complaints filed by tenants against facilities — access issues, billing disputes, facility conditions.</p>
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
        <input type="text" placeholder="Search client name, issue, business..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                {['Code', 'Client', 'Against Business', 'City', 'Issue', 'Category', 'Severity', 'Filed At', 'Status', ''].map((h) => (
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
                        <User className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-navy-900">{c.clientName}</p>
                          <p className="text-stone-400 text-[10px]">{c.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900 max-w-[160px] truncate">{c.againstBusiness}</td>
                    <td className="px-4 py-3 text-stone-600">{c.city}</td>
                    <td className="px-4 py-3 font-medium text-navy-900 max-w-[180px] truncate">{c.issue}</td>
                    <td className="px-4 py-3 text-stone-500">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${severityColors[c.severity]}`}>{c.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-stone-500 whitespace-nowrap"><Calendar className="h-3 w-3 text-stone-400" />{c.filedAt.split(' · ')[0]}</div>
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
                <p className="text-xs text-stone-500 mt-0.5">{viewC.clientName} vs. {viewC.againstBusiness}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig[viewC.status].color}`}>{viewC.status.replace('_', ' ')}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-xs font-bold text-rose-700 mb-1">{viewC.issue}</p>
              <p className="text-xs text-rose-600 leading-relaxed">{viewC.details}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Client', value: viewC.clientName },
                { label: 'Client Email', value: viewC.clientEmail },
                { label: 'Against Business', value: viewC.againstBusiness },
                { label: 'City', value: viewC.city },
                { label: 'Category', value: viewC.category },
                { label: 'Severity', value: viewC.severity },
                { label: 'Filed At', value: viewC.filedAt },
                { label: 'Resolved At', value: viewC.resolvedAt || 'Pending' },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="text-xs font-bold text-navy-900 mt-0.5 break-words">{row.value}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Admin Resolution Notes</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" rows={3}
                placeholder="Add resolution notes — what action was taken..." />
            </div>
            {viewC.status === 'OPEN' || viewC.status === 'UNDER_REVIEW' ? (
              <div className="flex gap-2">
                <Button onClick={() => updateStatus(viewC.id, 'UNDER_REVIEW')} variant="outline" className="flex-1 text-xs border-sky-200 text-sky-600 hover:bg-sky-50">
                  Under Review
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

