'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ClipboardList, CheckCircle2, XCircle, Eye, Building2,
  MapPin, Mail, Phone, Hash, Calendar, FileText, AlertTriangle,
} from 'lucide-react';

interface OnboardingApp {
  id: string;
  companyName: string;
  applicantName: string;
  city: string;
  address: string;
  gstin: string;
  businessType: string;
  unitsPlanned: number;
  requestedDate: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  documents: { label: string; url: string }[];
}

const SEED_APPS: OnboardingApp[] = [
  {
    id: 'app-001',
    companyName: 'Hindustan Cold Storage & Logistics',
    applicantName: 'Rajiv Mehra',
    city: 'Mumbai',
    address: 'Plot No. 48B, Bhiwandi Industrial Zone, Thane West, Mumbai - 421302',
    gstin: '27AAACH7409R1ZZ',
    businessType: 'warehouse',
    unitsPlanned: 45,
    requestedDate: '01 Dec 2026',
    email: 'rajiv.mehra@hindustancold.in',
    phone: '+91 98201 44321',
    status: 'PENDING',
    submittedAt: '10 Nov 2026 · 09:15 AM',
    documents: [
      { label: 'GST Certificate', url: '#' },
      { label: 'Property Lease Agreement', url: '#' },
      { label: 'Fire Safety NOC', url: '#' },
    ],
  },
  {
    id: 'app-002',
    companyName: 'Urban Attic Self-Storage Pvt. Ltd.',
    applicantName: 'Priya Kulkarni',
    city: 'Pune',
    address: 'Survey No. 102, Baner Road, Pune - 411045',
    gstin: '27AAHCU2163B1Z8',
    businessType: 'self_storage',
    unitsPlanned: 30,
    requestedDate: '15 Dec 2026',
    email: 'priya@urbanattic.in',
    phone: '+91 94220 88765',
    status: 'PENDING',
    submittedAt: '10 Nov 2026 · 11:42 AM',
    documents: [
      { label: 'Company Registration Certificate', url: '#' },
      { label: 'Property Ownership Deed', url: '#' },
    ],
  },
  {
    id: 'app-003',
    companyName: 'GreenField Storage Co.',
    applicantName: 'Suresh Patel',
    city: 'Ahmedabad',
    address: 'GIDC Phase 2, Naroda, Ahmedabad - 382330',
    gstin: '24AAACG2415K1ZP',
    businessType: 'self_storage',
    unitsPlanned: 20,
    requestedDate: '20 Nov 2026',
    email: 'suresh@greenfieldstorage.com',
    phone: '+91 97250 77001',
    status: 'PENDING',
    submittedAt: '09 Nov 2026 · 04:30 PM',
    documents: [
      { label: 'GST Registration', url: '#' },
      { label: 'Lease Agreement', url: '#' },
    ],
  },
  {
    id: 'app-004',
    companyName: 'Delhi North Cargo Hub',
    applicantName: 'Amandeep Singh',
    city: 'Delhi NCR',
    address: 'Sector 18, Rohini, New Delhi - 110085',
    gstin: '07AAHCD1234K1ZB',
    businessType: 'warehouse',
    unitsPlanned: 55,
    requestedDate: '05 Jan 2027',
    email: 'amandeep@delhicargo.in',
    phone: '+91 99110 23456',
    status: 'APPROVED',
    submittedAt: '01 Nov 2026 · 10:00 AM',
    documents: [
      { label: 'GST Certificate', url: '#' },
      { label: 'NOC from Municipality', url: '#' },
    ],
  },
  {
    id: 'app-005',
    companyName: 'Dubious Box & Pack Ltd.',
    applicantName: 'Unknown Entity',
    city: 'Hyderabad',
    address: 'No address provided',
    gstin: 'INVALID',
    businessType: 'self_storage',
    unitsPlanned: 5,
    requestedDate: '—',
    email: 'scam@fakestore.com',
    phone: 'N/A',
    status: 'REJECTED',
    submittedAt: '03 Nov 2026 · 02:30 PM',
    documents: [],
  },
];

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const bizTypeLabel: Record<string, string> = {
  self_storage: 'Self-Storage',
  warehouse: 'Warehouse',
  hostel: 'Hostel',
  parking: 'Parking',
  equipment: 'Equipment',
};

export default function OnboardingRequestsPage() {
  const [apps, setApps] = useState<OnboardingApp[]>(SEED_APPS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [viewApp, setViewApp] = useState<OnboardingApp | null>(null);
  const [rejectTarget, setRejectTarget] = useState<OnboardingApp | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [working, setWorking] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  };

  const handleApprove = async (app: OnboardingApp) => {
    setWorking(true);
    await new Promise((r) => setTimeout(r, 900));
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: 'APPROVED' } : a));
    if (viewApp?.id === app.id) setViewApp({ ...viewApp, status: 'APPROVED' });
    showToast(`"${app.companyName}" approved & activated on the platform!`, true);
    setWorking(false);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setWorking(true);
    await new Promise((r) => setTimeout(r, 800));
    setApps((prev) => prev.map((a) => a.id === rejectTarget.id ? { ...a, status: 'REJECTED' } : a));
    showToast(`Application from "${rejectTarget.companyName}" rejected. Reason noted.`, false);
    setRejectTarget(null);
    setRejectReason('');
    setWorking(false);
  };

  const filtered = apps.filter((a) => filterStatus === 'ALL' || a.status === filterStatus);
  const pendingCount = apps.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-navy-900 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${toast.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              Onboarding Requests
            </h1>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500">
            Review new business applications, verify KYC documents, and approve or reject listings.
          </p>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-amber-500 text-navy-900 border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Application Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((app) => (
          <Card key={app.id} className="bg-white border-stone-200 shadow-xs p-5 flex flex-col gap-4 hover:border-amber-400 hover:shadow-md transition-all">
            {/* Top */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-navy-900/5 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-navy-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 font-serif leading-tight">{app.companyName}</h3>
                  <p className="text-[11px] text-stone-500">{app.applicantName}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 ${statusColors[app.status]}`}>
                {app.status}
              </span>
            </div>

            {/* Meta */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-stone-400" />{app.city}</div>
              <div className="flex items-center gap-2"><Hash className="h-3 w-3 text-stone-400" />GSTIN: {app.gstin}</div>
              <div className="flex items-center gap-2"><Building2 className="h-3 w-3 text-stone-400" />{bizTypeLabel[app.businessType]} · {app.unitsPlanned} units planned</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-stone-400" />{app.email}</div>
              <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-stone-400" />Submitted: {app.submittedAt}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-stone-100">
              <Button
                variant="outline"
                className="flex-1 text-xs border-stone-200 text-stone-600 hover:bg-stone-50"
                onClick={() => setViewApp(app)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" /> View Docs
              </Button>
              {app.status === 'PENDING' && (
                <>
                  <Button
                    variant="primary"
                    className="flex-1 text-xs bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600"
                    onClick={() => handleApprove(app)}
                    disabled={working}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => setRejectTarget(app)}
                    disabled={working}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* View Documents Modal */}
      {viewApp && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900 font-serif">{viewApp.companyName}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{viewApp.city} · {bizTypeLabel[viewApp.businessType]}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColors[viewApp.status]}`}>
                {viewApp.status}
              </span>
            </div>

            {/* Full Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Applicant', value: viewApp.applicantName },
                { label: 'Phone', value: viewApp.phone },
                { label: 'Email', value: viewApp.email },
                { label: 'GSTIN', value: viewApp.gstin },
                { label: 'Full Address', value: viewApp.address },
                { label: 'Units Planned', value: `${viewApp.unitsPlanned}` },
                { label: 'Requested Listing Date', value: viewApp.requestedDate },
                { label: 'Application Date', value: viewApp.submittedAt },
              ].map((row) => (
                <div key={row.label} className="bg-stone-50 rounded-xl p-3 col-span-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                  <p className="font-semibold text-navy-900 mt-0.5 break-words">{row.value}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Submitted Documents</p>
              {viewApp.documents.length === 0 ? (
                <p className="text-xs text-rose-500 font-medium">⚠ No documents submitted — flag for incomplete KYC.</p>
              ) : (
                <div className="space-y-2">
                  {viewApp.documents.map((doc) => (
                    <div key={doc.label} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-navy-900">{doc.label}</span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-sky-600 hover:underline"
                      >
                        View PDF →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {viewApp.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => { handleApprove(viewApp); setViewApp(null); }}
                    disabled={working}
                    variant="primary"
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve & Activate
                  </Button>
                  <Button
                    onClick={() => { setRejectTarget(viewApp); setViewApp(null); }}
                    variant="outline"
                    className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setViewApp(null)} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-navy-900 font-serif">Reject Application?</h3>
              <p className="text-xs text-stone-500 mt-1">&quot;{rejectTarget.companyName}&quot; will be notified with the reason below.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Rejection Reason *</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-rose-400 mb-2"
              >
                <option value="">Select a reason...</option>
                <option value="Incomplete KYC documents">Incomplete KYC documents</option>
                <option value="Invalid GSTIN number">Invalid GSTIN number</option>
                <option value="Duplicate location conflict">Duplicate location conflict</option>
                <option value="Property lease not verified">Property lease not verified</option>
                <option value="Business does not meet platform standards">Does not meet platform standards</option>
                <option value="Suspicious / fraudulent application">Suspicious / fraudulent application</option>
              </select>
              <textarea
                placeholder="Additional notes (optional)..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-navy-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRejectConfirm}
                disabled={!rejectReason || working}
                variant="outline"
                className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                {working ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
              <Button onClick={() => { setRejectTarget(null); setRejectReason(''); }} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

