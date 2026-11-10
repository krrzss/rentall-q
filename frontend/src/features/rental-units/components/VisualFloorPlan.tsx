'use client';

import React, { useState } from 'react';
import {
  Thermometer, Droplets, ShieldAlert, KeyRound, CheckCircle2,
  TrendingUp, Sparkles, User, Calendar, X, Eye, Edit3, ArrowRight,
  Maximize2, AlertTriangle, Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface FloorUnit {
  id: string;
  code: string;
  name: string;
  wing: 'Wing A (Climate)' | 'Wing B (Warehouse Bays)' | 'Wing C (Secure Vaults)';
  type: string;
  dimensions: string;
  baseRateInr: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DELINQUENT';
  temperatureC?: number;
  humidityPct?: number;
  doorSensor: 'CLOSED' | 'OPEN';
  tenant?: {
    name: string;
    email: string;
    phone: string;
    leaseEnd: string;
    gatePin: string;
    paidStatus: 'SETTLED' | 'OVERDUE';
  };
  aiPricingRecommendation?: {
    suggestedRateInr: number;
    reason: string;
    confidence: number;
  };
}

const INITIAL_FLOOR_UNITS: FloorUnit[] = [
  // Wing A - Climate
  {
    id: 'fu-01', code: 'MUM-A101', name: 'Unit A-101', wing: 'Wing A (Climate)',
    type: 'Climate-Controlled', dimensions: '10x10 ft', baseRateInr: 8500,
    status: 'OCCUPIED', temperatureC: 21.2, humidityPct: 45, doorSensor: 'CLOSED',
    tenant: { name: 'Amit Sharma', email: 'amit.sharma@gmail.com', phone: '+91 98201 11234', leaseEnd: '31 Dec 2026', gatePin: '482910', paidStatus: 'SETTLED' },
    aiPricingRecommendation: { suggestedRateInr: 9200, reason: 'High seasonal demand & 92% corridor occupancy.', confidence: 94 },
  },
  {
    id: 'fu-02', code: 'MUM-A102', name: 'Unit A-102', wing: 'Wing A (Climate)',
    type: 'Climate-Controlled', dimensions: '10x10 ft', baseRateInr: 8500,
    status: 'AVAILABLE', temperatureC: 20.8, humidityPct: 44, doorSensor: 'CLOSED',
    aiPricingRecommendation: { suggestedRateInr: 8800, reason: 'Ready for lease. Prime ground floor corridor location.', confidence: 91 },
  },
  {
    id: 'fu-03', code: 'MUM-A103', name: 'Unit A-103', wing: 'Wing A (Climate)',
    type: 'Climate-Controlled', dimensions: '10x15 ft', baseRateInr: 12000,
    status: 'OCCUPIED', temperatureC: 21.5, humidityPct: 46, doorSensor: 'CLOSED',
    tenant: { name: 'Priya Verma', email: 'priya.verma@outlook.com', phone: '+91 90000 22345', leaseEnd: '31 Dec 2026', gatePin: '772103', paidStatus: 'SETTLED' },
  },
  {
    id: 'fu-04', code: 'MUM-A104', name: 'Unit A-104', wing: 'Wing A (Climate)',
    type: 'Micro-Locker', dimensions: '5x5 ft', baseRateInr: 2800,
    status: 'DELINQUENT', temperatureC: 21.0, humidityPct: 45, doorSensor: 'CLOSED',
    tenant: { name: 'Sunita Patel', email: 'sunita@hotmail.com', phone: '+91 98220 55678', leaseEnd: '31 Oct 2026', gatePin: '110293', paidStatus: 'OVERDUE' },
  },
  {
    id: 'fu-05', code: 'MUM-A105', name: 'Unit A-105', wing: 'Wing A (Climate)',
    type: 'Micro-Locker', dimensions: '5x5 ft', baseRateInr: 2800,
    status: 'AVAILABLE', temperatureC: 21.1, humidityPct: 44, doorSensor: 'CLOSED',
  },
  {
    id: 'fu-06', code: 'MUM-A106', name: 'Unit A-106', wing: 'Wing A (Climate)',
    type: 'Climate-Controlled', dimensions: '10x20 ft', baseRateInr: 15500,
    status: 'MAINTENANCE', temperatureC: 22.4, humidityPct: 50, doorSensor: 'OPEN',
  },

  // Wing B - Heavy Warehouse Bays
  {
    id: 'fu-07', code: 'MUM-B201', name: 'Bay B-201', wing: 'Wing B (Warehouse Bays)',
    type: 'Heavy Warehouse Bay', dimensions: '20x30 ft', baseRateInr: 25000,
    status: 'DELINQUENT', temperatureC: 24.1, humidityPct: 52, doorSensor: 'CLOSED',
    tenant: { name: 'Kabir Khan', email: 'kabir.khan@gmail.com', phone: '+91 98900 66789', leaseEnd: '30 Nov 2026', gatePin: '665412', paidStatus: 'OVERDUE' },
  },
  {
    id: 'fu-08', code: 'MUM-B202', name: 'Bay B-202', wing: 'Wing B (Warehouse Bays)',
    type: 'Heavy Warehouse Bay', dimensions: '20x30 ft', baseRateInr: 25000,
    status: 'OCCUPIED', temperatureC: 23.8, humidityPct: 50, doorSensor: 'CLOSED',
    tenant: { name: 'Anjali Singh', email: 'anjali.singh@proton.me', phone: '+91 91234 56780', leaseEnd: '14 Nov 2027', gatePin: '334190', paidStatus: 'SETTLED' },
    aiPricingRecommendation: { suggestedRateInr: 27500, reason: 'High industrial cargo demand in Navi Mumbai corridor.', confidence: 96 },
  },
  {
    id: 'fu-09', code: 'MUM-B203', name: 'Bay B-203', wing: 'Wing B (Warehouse Bays)',
    type: 'Drive-Up Commercial', dimensions: '15x25 ft', baseRateInr: 19500,
    status: 'AVAILABLE', temperatureC: 23.5, humidityPct: 49, doorSensor: 'CLOSED',
    aiPricingRecommendation: { suggestedRateInr: 21000, reason: 'Forklift accessible bay with dedicated loading ramp.', confidence: 89 },
  },
  {
    id: 'fu-10', code: 'MUM-B204', name: 'Bay B-204', wing: 'Wing B (Warehouse Bays)',
    type: 'Drive-Up Commercial', dimensions: '15x25 ft', baseRateInr: 19500,
    status: 'OCCUPIED', temperatureC: 24.0, humidityPct: 51, doorSensor: 'CLOSED',
    tenant: { name: 'Deepak Nair', email: 'deepak.nair@gmail.com', phone: '+91 97110 77890', leaseEnd: '30 Nov 2027', gatePin: '901244', paidStatus: 'SETTLED' },
  },

  // Wing C - Secure Vaults
  {
    id: 'fu-11', code: 'MUM-C301', name: 'Vault C-301', wing: 'Wing C (Secure Vaults)',
    type: 'Document Storage', dimensions: '8x10 ft', baseRateInr: 5500,
    status: 'OCCUPIED', temperatureC: 19.8, humidityPct: 40, doorSensor: 'CLOSED',
    tenant: { name: 'Meera Joshi', email: 'meera.joshi@gmail.com', phone: '+91 98111 33456', leaseEnd: '28 Feb 2027', gatePin: '554129', paidStatus: 'SETTLED' },
  },
  {
    id: 'fu-12', code: 'MUM-C302', name: 'Vault C-302', wing: 'Wing C (Secure Vaults)',
    type: 'Secure Vault', dimensions: '10x12 ft', baseRateInr: 9000,
    status: 'AVAILABLE', temperatureC: 19.5, humidityPct: 39, doorSensor: 'CLOSED',
    aiPricingRecommendation: { suggestedRateInr: 9500, reason: 'Biometric and fire-suppression certified vault.', confidence: 93 },
  },
];

const statusStyles = {
  OCCUPIED: { bg: 'bg-emerald-500/15 border-emerald-500 text-emerald-900', dot: 'bg-emerald-500', label: 'Occupied' },
  AVAILABLE: { bg: 'bg-sky-500/15 border-sky-500 text-sky-900', dot: 'bg-sky-500', label: 'Vacant / Ready' },
  MAINTENANCE: { bg: 'bg-amber-500/15 border-amber-500 text-amber-900', dot: 'bg-amber-500', label: 'Maintenance' },
  DELINQUENT: { bg: 'bg-rose-500/15 border-rose-500 text-rose-900', dot: 'bg-rose-500', label: 'Delinquent Lockout' },
};

export function VisualFloorPlan() {
  const [units, setUnits] = useState<FloorUnit[]>(INITIAL_FLOOR_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<FloorUnit | null>(null);
  const [wingFilter, setWingFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApplyAiRate = (unitId: string, newRate: number) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, baseRateInr: newRate, aiPricingRecommendation: undefined } : u))
    );
    if (selectedUnit?.id === unitId) {
      setSelectedUnit((prev) => (prev ? { ...prev, baseRateInr: newRate, aiPricingRecommendation: undefined } : null));
    }
    showToast(`Updated Unit ${selectedUnit?.code} base rate to ₹${newRate.toLocaleString('en-IN')}/mo.`);
  };

  const handleStatusChange = (unitId: string, newStatus: FloorUnit['status']) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
    );
    if (selectedUnit?.id === unitId) {
      setSelectedUnit((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Unit ${selectedUnit?.code} status changed to ${newStatus}.`);
  };

  const wings = ['ALL', 'Wing A (Climate)', 'Wing B (Warehouse Bays)', 'Wing C (Secure Vaults)'];
  const filteredUnits = units.filter((u) => wingFilter === 'ALL' || u.wing === wingFilter);

  const occupiedCount = units.filter((u) => u.status === 'OCCUPIED').length;
  const availableCount = units.filter((u) => u.status === 'AVAILABLE').length;
  const maintenanceCount = units.filter((u) => u.status === 'MAINTENANCE').length;
  const delinquentCount = units.filter((u) => u.status === 'DELINQUENT').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-amber-400 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Control Bar & Legend */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Interactive Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="text-stone-700">Occupied ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-sky-500" />
            <span className="text-stone-700">Vacant / Ready ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-500" />
            <span className="text-stone-700">Maintenance ({maintenanceCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-rose-500" />
            <span className="text-stone-700">Delinquent Lockout ({delinquentCount})</span>
          </div>
        </div>

        {/* Wing Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          {wings.map((w) => (
            <button
              key={w}
              onClick={() => setWingFilter(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                wingFilter === w ? 'bg-white text-navy-900 shadow-xs' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              {w === 'ALL' ? 'All Wings' : w.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Floor Plan Grid */}
      <div className="space-y-6">
        {['Wing A (Climate)', 'Wing B (Warehouse Bays)', 'Wing C (Secure Vaults)'].map((wingTitle) => {
          if (wingFilter !== 'ALL' && wingFilter !== wingTitle) return null;
          const wingUnits = units.filter((u) => u.wing === wingTitle);

          return (
            <div key={wingTitle} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-navy-900 font-serif">{wingTitle}</h3>
                </div>
                <span className="text-xs text-stone-400">{wingUnits.length} Units in Corridor</span>
              </div>

              {/* Units Bay Cells */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {wingUnits.map((unit) => {
                  const style = statusStyles[unit.status];
                  const isSelected = selectedUnit?.id === unit.id;

                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-32 cursor-pointer ${
                        style.bg
                      } ${isSelected ? 'ring-2 ring-navy-900 shadow-md scale-[1.02]' : 'hover:shadow-sm hover:scale-[1.01]'}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-bold text-xs text-navy-900">{unit.code}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-stone-500 truncate">{unit.type}</p>
                        <p className="text-[10px] text-stone-400">{unit.dimensions}</p>
                      </div>

                      <div className="pt-1 border-t border-stone-200/50 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-navy-900">₹{unit.baseRateInr.toLocaleString('en-IN')}</span>
                        {unit.temperatureC && (
                          <span className="text-[10px] text-stone-500 flex items-center">
                            <Thermometer className="h-3 w-3 text-stone-400" /> {unit.temperatureC}°C
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unit Detail & Telemetry Slide-over Drawer / Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-navy-900 font-serif">Unit {selectedUnit.code}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${statusStyles[selectedUnit.status].bg}`}>
                    {statusStyles[selectedUnit.status].label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{selectedUnit.wing} · {selectedUnit.dimensions} ({selectedUnit.type})</p>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* IoT Telemetry Sensors */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Live IoT Telemetry</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Temperature</span>
                  <span className="text-sm font-bold text-navy-900 mt-1 inline-flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-amber-500" /> {selectedUnit.temperatureC ?? 21.0}°C
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Humidity</span>
                  <span className="text-sm font-bold text-navy-900 mt-1 inline-flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-sky-500" /> {selectedUnit.humidityPct ?? 45}%
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Door Sensor</span>
                  <span className={`text-sm font-bold mt-1 block ${selectedUnit.doorSensor === 'OPEN' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {selectedUnit.doorSensor}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Tenant CRM Details (if occupied or delinquent) */}
            {selectedUnit.tenant ? (
              <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Current Lease Tenant</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedUnit.tenant.paidStatus === 'SETTLED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    Payment {selectedUnit.tenant.paidStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-stone-400">Tenant Name:</span>
                    <p className="font-bold text-navy-900">{selectedUnit.tenant.name}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Phone:</span>
                    <p className="font-semibold text-navy-900">{selectedUnit.tenant.phone}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Lease Ends:</span>
                    <p className="font-semibold text-navy-900">{selectedUnit.tenant.leaseEnd}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Keypad PIN:</span>
                    <p className="font-mono font-bold text-amber-700">{selectedUnit.tenant.gatePin}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 rounded-xl p-3 text-center border border-dashed border-stone-200">
                <p className="text-xs text-stone-500">Unit currently vacant. Ready for direct tenant assignment.</p>
              </div>
            )}

            {/* Dynamic Pricing AI Widget */}
            {selectedUnit.aiPricingRecommendation && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Dynamic Pricing Agent
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {selectedUnit.aiPricingRecommendation.confidence}% Confidence
                  </span>
                </div>
                <p className="text-xs text-stone-700">{selectedUnit.aiPricingRecommendation.reason}</p>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-stone-500">Current: ₹{selectedUnit.baseRateInr}</span>
                    <span className="text-xs font-bold text-emerald-800 ml-2">
                      Target: ₹{selectedUnit.aiPricingRecommendation.suggestedRateInr}/mo
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplyAiRate(selectedUnit.id, selectedUnit.aiPricingRecommendation!.suggestedRateInr)}
                    className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold text-xs shadow-xs"
                  >
                    1-Click Apply Rate
                  </Button>
                </div>
              </div>
            )}

            {/* Status Switcher Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Operational Status</span>
              <div className="grid grid-cols-4 gap-2">
                {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DELINQUENT'] as FloorUnit['status'][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedUnit.id, st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      selectedUnit.status === st
                        ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {st === 'AVAILABLE' ? 'Vacant' : st === 'OCCUPIED' ? 'Occupied' : st === 'MAINTENANCE' ? 'Clean/Maint' : 'Lockout'}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => setSelectedUnit(null)} variant="outline" className="w-full text-xs">
              Close Telemetry Drawer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

