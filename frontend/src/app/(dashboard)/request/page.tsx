'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Send,
  CheckCircle2,
  Wrench,
  Sparkles,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Building2,
  PhoneCall,
  Info,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  unitNumber: string;
  facilityName: string;
  category: string;
  subject: string;
  date: string;
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED';
  aiRecommendation?: string;
}

const PAST_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-8910',
    unitNumber: '#ATX-104',
    facilityName: 'Austin SafeStore & Central Depot',
    category: 'Overhead Light Bulb',
    subject: 'Bay overhead fixture flickering on entry',
    date: '02 Nov 2026',
    status: 'RESOLVED',
    aiRecommendation: 'LED bulb replaced with 5000K archival daylight bulb by facility maintenance.',
  },
  {
    id: 'TKT-8944',
    unitNumber: '#CHI-208',
    facilityName: 'Chicago MetroHub Micro-Depot',
    category: 'Gate Keypad Check',
    subject: 'Keypad was beeping 3 times when entering code',
    date: '06 Nov 2026',
    status: 'RESOLVED',
    aiRecommendation: 'Resolved via AI diagnostic: Keypad requires leading "#" before entering 4-digit PIN.',
  },
];

export default function ClientRequestPage() {
  const [selectedUnit, setSelectedUnit] = useState('#ATX-104 (Austin SafeStore & Central Depot)');
  const [category, setCategory] = useState('gate');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const getAiDiagnostic = () => {
    switch (category) {
      case 'gate':
        return {
          title: 'AI Quick Access Diagnostic',
          tip: "Most gate keypad errors happen when the '#' key is omitted. Try entering '#' followed by your 4-digit PIN. You can also use the 1-Click Remote Gate Unlock button on your dashboard without needing the physical keypad.",
          actionText: 'Go to Remote Gate Unlock',
          actionHref: '/dashboard',
        };
      case 'lock':
        return {
          title: 'AI Lock Diagnostic & Replacement',
          tip: 'If your disc lock or brass padlock is stiff due to temperature, facility front desks stock graphite dry-lubricant. In case of lost keys, on-site managers can perform verified lock removal during office hours.',
          actionText: 'View Facility Hours',
          actionHref: '/my-bookings',
        };
      case 'climate':
        return {
          title: 'AI Climate Telemetry Check',
          tip: 'IoT sensors record telemetry every 15 minutes. Permissible archival range for indoor units is 18°C–24°C (65°F–75°F) and 35%–55% humidity. Submitting this ticket alerts the facility HVAC engineer immediately.',
          actionText: null,
          actionHref: null,
        };
      case 'leak':
        return {
          title: 'AI Urgent Moisture Dispatch',
          tip: 'Moisture alerts are automatically prioritized as High Urgency. Facility management receives an instant SMS notification to inspect the ceiling and adjacent bays within 60 minutes.',
          actionText: null,
          actionHref: null,
        };
      default:
        return {
          title: 'AI Assistance',
          tip: 'Your ticket will be routed directly to the on-site operations team. Average response time across all facilities is under 2 hours during working hours.',
          actionText: null,
          actionHref: null,
        };
    }
  };

  const aiDiag = getAiDiagnostic();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Tenant Support Desk
          </span>
          <span className="text-xs text-stone-500 font-medium">
            AI-Assisted Maintenance &amp; Inquiries
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 font-serif mt-1">
          Make a Request
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Submit maintenance tickets, report lock issues, or request unit inspections directly to your storage facility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-2xl border border-stone-200 bg-white shadow-xs">
            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 font-serif">
                  Support Ticket Dispatched!
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Your ticket has been sent to the on-site facility manager. A confirmation and technician update will be sent to your registered email.
                </p>
                <div className="p-3 bg-stone-50 rounded-xl text-xs font-mono font-bold text-navy-900 inline-block">
                  Ticket Reference: #TKT-{Math.floor(1000 + Math.random() * 9000)}
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setSubject('');
                      setDetails('');
                    }}
                    className="text-xs font-bold text-navy-900 cursor-pointer"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Unit Selector */}
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Which Unit Needs Attention?
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  >
                    <option>#ATX-104 (Austin SafeStore &amp; Central Depot &bull; 10x10)</option>
                    <option>#CHI-208 (Chicago MetroHub Micro-Depot &bull; 15x20)</option>
                    <option>#SEA-012 (Seattle Pacific Port &bull; 10x20 Vehicle Bay)</option>
                    <option>General Account / Billing Question</option>
                  </select>
                </div>

                {/* 2. Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'gate', label: 'Gate Access / PIN' },
                      { id: 'lock', label: 'Lock / Shutter' },
                      { id: 'climate', label: 'Climate / Temp' },
                      { id: 'leak', label: 'Moisture / Water' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                          category === cat.id
                            ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Real-Time AI Diagnostic Banner */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-navy-900 font-serif">
                      {aiDiag.title}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {aiDiag.tip}
                  </p>
                  {aiDiag.actionHref && (
                    <Link
                      href={aiDiag.actionHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline pt-1"
                    >
                      <span>{aiDiag.actionText}</span>
                      <span>&rarr;</span>
                    </Link>
                  )}
                </div>

                {/* 4. Subject */}
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Subject / Short Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Shutter keyhole sticking on Bay 104"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* 5. Details */}
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please explain the issue and what time you are usually visiting the facility..."
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-navy-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-sm"
                >
                  <Send className="h-4 w-4 text-amber-400" />
                  <span>Submit Maintenance Ticket</span>
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Past Tickets Tracker & Facility Contact */}
        <div className="space-y-4">
          <Card className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
            <h3 className="font-bold text-navy-900 text-sm font-serif">
              Recent Ticket History
            </h3>
            <p className="text-xs text-stone-500">
              Track resolution progress on your previous unit inquiries.
            </p>

            <div className="space-y-2.5 pt-1">
              {PAST_TICKETS.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900 font-mono text-[11px]">
                      {ticket.id}
                    </span>
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="font-semibold text-navy-900 text-xs">
                    {ticket.subject}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {ticket.unitNumber} &bull; {ticket.date}
                  </div>
                  {ticket.aiRecommendation && (
                    <div className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200 flex items-start gap-1.5 mt-1">
                      <Sparkles className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                      <span>{ticket.aiRecommendation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-amber-700" />
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Emergency Gate Intercom
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              For after-hours emergency lockouts or security alerts at any facility, call the 24/7 centralized dispatch line:
            </p>
            <div className="font-mono text-sm font-bold text-navy-900 bg-white p-2.5 rounded-xl border border-stone-200 text-center">
              1-800-555-RENTQ (Toll-Free)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
