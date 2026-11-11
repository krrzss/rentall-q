'use client';

import React, { useState } from 'react';
import {
  Truck, ArrowUpRight, ArrowDownRight, AlertTriangle, KeyRound,
  CheckCircle2, Clock, Send, ShieldAlert, X, Eye, Phone, Mail,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MoveInEvent {
  id: string;
  tenantName: string;
  unitCode: string;
  unitType: string;
  scheduledTime: string;
  monthlyRentInr: number;
  phone: string;
  email: string;
  pin: string;
  status: 'PENDING_INSPECTION' | 'READY_FOR_KEYS' | 'COMPLETED';
}

interface MoveOutEvent {
  id: string;
  tenantName: string;
  unitCode: string;
  scheduledDate: string;
  depositToRefundInr: number;
  inspectionStatus: 'PENDING' | 'PASSED' | 'DEDUCTION_REQUIRED';
}

interface DelinquentTenant {
  id: string;
  tenantName: string;
  unitCode: string;
  overdueAmountInr: number;
  daysLate: number;
  phone: string;
  email: string;
  lockoutActive: boolean;
}

interface GateAccessLog {
  id: string;
  time: string;
  tenantName: string;
  unitCode: string;
  method: 'KEYPAD_PIN' | 'MOBILE_APP' | 'STAFF_OVERRIDE';
  status: 'GRANTED' | 'DENIED_DELINQUENT';
}

const INITIAL_MOVE_INS: MoveInEvent[] = [
  { id: 'mi-1', tenantName: 'Amit Sharma', unitCode: 'MUM-A101', unitType: 'Climate-Controlled 10x10', scheduledTime: '10:30 AM', monthlyRentInr: 8500, phone: '+91 98201 11234', email: 'amit.sharma@gmail.com', pin: '482910', status: 'READY_FOR_KEYS' },
  { id: 'mi-2', tenantName: 'Priya Verma', unitCode: 'BLR-D88', unitType: 'Drive-Up Storage 10x20', scheduledTime: '02:15 PM', monthlyRentInr: 6800, phone: '+91 90000 22345', email: 'priya.verma@outlook.com', pin: '772103', status: 'PENDING_INSPECTION' },
  { id: 'mi-3', tenantName: 'Deepak Nair', unitCode: 'HYD-H22', unitType: 'Heavy Warehouse Bay 20x30', scheduledTime: '04:45 PM', monthlyRentInr: 22000, phone: '+91 97110 77890', email: 'deepak.nair@gmail.com', pin: '901244', status: 'PENDING_INSPECTION' },
];

const INITIAL_MOVE_OUTS: MoveOutEvent[] = [
  { id: 'mo-1', tenantName: 'Ravi Kumar', unitCode: 'DEL-F02', scheduledDate: 'Today (31 Oct lease end)', depositToRefundInr: 37000, inspectionStatus: 'PENDING' },
];

const INITIAL_DELINQUENTS: DelinquentTenant[] = [
  { id: 'dq-1', tenantName: 'Sunita Patel', unitCode: 'PUN-G09', overdueAmountInr: 2800, daysLate: 11, phone: '+91 98220 55678', email: 'sunita@hotmail.com', lockoutActive: true },
  { id: 'dq-2', tenantName: 'Kabir Khan', unitCode: 'MUM-B201', overdueAmountInr: 25000, daysLate: 10, phone: '+91 98900 66789', email: 'kabir.khan@gmail.com', lockoutActive: true },
];

const INITIAL_GATE_LOGS: GateAccessLog[] = [
  { id: 'g-1', time: '10:14 AM', tenantName: 'Amit Sharma', unitCode: 'MUM-A101', method: 'KEYPAD_PIN', status: 'GRANTED' },
  { id: 'g-2', time: '09:42 AM', tenantName: 'Kabir Khan', unitCode: 'MUM-B201', method: 'KEYPAD_PIN', status: 'DENIED_DELINQUENT' },
  { id: 'g-3', time: '08:15 AM', tenantName: 'Priya Verma', unitCode: 'BLR-D88', method: 'MOBILE_APP', status: 'GRANTED' },
  { id: 'g-4', time: '07:30 AM', tenantName: 'Facility Maintenance', unitCode: 'MAIN-GATE', method: 'STAFF_OVERRIDE', status: 'GRANTED' },
];

export function DailyOperationalBar() {
  const [moveIns, setMoveIns] = useState<MoveInEvent[]>(INITIAL_MOVE_INS);
  const [moveOuts, setMoveOuts] = useState<MoveOutEvent[]>(INITIAL_MOVE_OUTS);
  const [delinquents, setDelinquents] = useState<DelinquentTenant[]>(INITIAL_DELINQUENTS);
  const [gateLogs] = useState<GateAccessLog[]>(INITIAL_GATE_LOGS);

  // Active Modals
  const [activeModal, setActiveModal] = useState<'MOVE_INS' | 'MOVE_OUTS' | 'DELINQUENTS' | 'GATE_LOG' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCompleteMoveIn = (id: string, name: string) => {
    setMoveIns((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'COMPLETED' } : m))
    );
    showToast(`Move-In finalized for ${name}. Digital key & welcome packet dispatched.`);
  };

  const handleApproveInspection = (id: string, unit: string) => {
    setMoveOuts((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inspectionStatus: 'PASSED' } : m))
    );
    showToast(`Inspection passed for Unit ${unit}. Security deposit release approved.`);
  };

  const handleSendNotice = (tenantName: string, amount: number) => {
    showToast(`Urgent Overdue Notice (SMS + Email) sent to ${tenantName} for ₹${amount.toLocaleString('en-IN')}.`);
  };

  const totalOverdue = delinquents.reduce((s, d) => s + d.overdueAmountInr, 0);

  return (
    <div className="space-y-3 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-amber-400 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Bar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            STORENTIC Daily Facility Operations
          </h2>
        </div>
        <span className="text-[11px] text-stone-400">Live Telemetry Synchronized</span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Move-Ins Today */}
        <Card
          onClick={() => setActiveModal('MOVE_INS')}
          className="bg-white border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Move-Ins Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-serif text-navy-900">{moveIns.length} Scheduled</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 1 Ready for Keypad PIN
            </p>
          </div>
        </Card>

        {/* Card 2: Move-Outs Due */}
        <Card
          onClick={() => setActiveModal('MOVE_OUTS')}
          className="bg-white border-stone-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Move-Outs & Inspections</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-serif text-navy-900">{moveOuts.length} Inspection Due</div>
            <p className="text-[11px] text-sky-700 font-medium mt-0.5">
              Unit turnover & deposit refund
            </p>
          </div>
        </Card>

        {/* Card 3: Overdue Collections */}
        <Card
          onClick={() => setActiveModal('DELINQUENTS')}
          className="bg-white border-stone-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Overdue Collections</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-serif text-rose-600">₹{totalOverdue.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
              {delinquents.length} Delinquent Tenants · Lockout Active
            </p>
          </div>
        </Card>

        {/* Card 4: Live Gate Access Log */}
        <Card
          onClick={() => setActiveModal('GATE_LOG')}
          className="bg-white border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Gate Security Telemetry</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-serif text-navy-900">Live Access Log</div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Latest entry: {gateLogs[0]?.time} ({gateLogs[0]?.tenantName})
            </p>
          </div>
        </Card>
      </div>

      {/* MODAL 1: MOVE-INS */}
      {activeModal === 'MOVE_INS' && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-navy-900 font-serif">Today&apos;s Scheduled Move-Ins</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {moveIns.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-sm">{m.tenantName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        Unit {m.unitCode}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{m.unitType} · {m.scheduledTime}</p>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">₹{m.monthlyRentInr.toLocaleString('en-IN')}/mo</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-600">
                      <KeyRound className="h-3 w-3 text-amber-600" />
                      <span>Keypad PIN: <strong className="font-mono text-navy-900">{m.pin}</strong></span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    {m.status === 'COMPLETED' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Move-In Done
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteMoveIn(m.id, m.tenantName)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        Handover Keys & PIN
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MOVE-OUTS */}
      {activeModal === 'MOVE_OUTS' && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-sky-600" />
                <h3 className="text-lg font-bold text-navy-900 font-serif">Move-Out Inspections Due</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {moveOuts.map((mo) => (
                <div key={mo.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-sm">{mo.tenantName}</span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-200">
                        Unit {mo.unitCode}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{mo.scheduledDate}</p>
                    <p className="text-xs font-semibold text-stone-700 mt-0.5">
                      Security Deposit to Refund: <strong className="text-navy-900">₹{mo.depositToRefundInr.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>
                  <div>
                    {mo.inspectionStatus === 'PASSED' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Inspection Passed
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApproveInspection(mo.id, mo.unitCode)}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
                      >
                        Approve Inspection
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELINQUENT OVERDUE TENANTS */}
      {activeModal === 'DELINQUENTS' && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-bold text-navy-900 font-serif">Overdue Tenants & Delinquency Lockout</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {delinquents.map((dq) => (
                <div key={dq.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-sm">{dq.tenantName}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200">
                        Unit {dq.unitCode} · {dq.daysLate} Days Overdue
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-bold mt-1">₹{dq.overdueAmountInr.toLocaleString('en-IN')} Outstanding</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{dq.phone} · {dq.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded mt-2 border border-rose-200">
                      <ShieldAlert className="h-3 w-3" /> Gate Keypad Lockout Active
                    </span>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      onClick={() => handleSendNotice(dq.tenantName, dq.overdueAmountInr)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs w-full sm:w-auto"
                    >
                      <Send className="h-3 w-3 mr-1.5" /> Send Notice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GATE SECURITY TELEMETRY */}
      {activeModal === 'GATE_LOG' && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-bold text-navy-900 font-serif">Facility Gate Security Log</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {gateLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{log.tenantName}</span>
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                        {log.unitCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">Method: {log.method.replace('_', ' ')} · {log.time}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    log.status === 'GRANTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {log.status === 'GRANTED' ? 'Access Granted' : 'Delinquent Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

