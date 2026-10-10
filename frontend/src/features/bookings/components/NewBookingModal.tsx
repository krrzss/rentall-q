'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Building, Calendar, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
}

export function NewBookingModal({ isOpen, onClose, onSuccess }: NewBookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState({ id: 'c-1', name: 'Sarah Lin', email: 'sarah@example.com' });
  const [selectedUnit, setSelectedUnit] = useState({ id: 'u-1', name: 'Storage Locker 102', rate: 250 });
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2027-08-15');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const mockCustomers = [
    { id: 'c-1', name: 'Sarah Lin', email: 'sarah@example.com', type: 'Individual' },
    { id: 'c-2', name: 'Apex Logistics', email: 'ops@apexlogistics.com', type: 'Corporate' },
    { id: 'c-3', name: 'David Miller', email: 'david@miller.io', type: 'Individual' },
  ];

  const mockUnits = [
    { id: 'u-1', name: 'Storage Locker 102', rate: 250, type: 'Self-Storage (10x10)' },
    { id: 'u-2', name: 'Warehouse Bay 4B', rate: 1200, type: 'Commercial Warehouse' },
    { id: 'u-3', name: 'Parking Slot #12', rate: 120, type: 'Parking Lot' },
  ];

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        id: `bk-${Date.now()}`,
        customerName: selectedCustomer.name,
        rentalUnitName: selectedUnit.name,
        startDate,
        endDate,
        totalAmount: selectedUnit.rate * 12,
        status: 'CONFIRMED',
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 text-navy-900 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Step {step} of 4
              </span>
            </div>
            <h2 className="text-xl font-bold text-navy-900 font-serif mt-1">Create New Booking</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-navy-900 hover:bg-cream-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-between px-2">
          {['Select Client', 'Select Unit', 'Dates & Rates', 'Confirm'].map((label, idx) => {
            const stepNum = idx + 1;
            const isPassed = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-navy-900 text-amber-400'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isPassed ? <Check className="h-3.5 w-3.5" /> : stepNum}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${isCurrent ? 'text-navy-900 font-bold' : 'text-stone-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: SELECT CUSTOMER */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy-900 font-serif">1. Select Client for Lease</h3>
            <div className="space-y-2">
              {mockCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedCustomer.id === c.id
                      ? 'border-amber-500 bg-amber-50/60 shadow-2xs ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-navy-900 font-serif">{c.name}</div>
                    <div className="text-xs text-stone-500">{c.email} &bull; {c.type}</div>
                  </div>
                  {selectedCustomer.id === c.id ? <Check className="h-5 w-5 text-amber-600" /> : null}
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)} className="bg-navy-900 text-white font-bold">
                <span>Next: Select Rental Unit</span>
                <ArrowRight className="h-4 w-4 text-amber-400 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT RENTAL UNIT */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy-900 font-serif">2. Select Available Rental Unit</h3>
            <div className="space-y-2">
              {mockUnits.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUnit(u)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedUnit.id === u.id
                      ? 'border-amber-500 bg-amber-50/60 shadow-2xs ring-1 ring-amber-500'
                      : 'border-stone-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-navy-900 font-serif">{u.name}</div>
                    <div className="text-xs text-stone-500">{u.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 text-sm">₹{u.rate}/mo</div>
                    {selectedUnit.id === u.id ? <Check className="h-4 w-4 text-amber-600 ml-auto" /> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-navy-900 text-white font-bold">
                <span>Next: Dates &amp; Rates</span>
                <ArrowRight className="h-4 w-4 text-amber-400 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: DATES & PRICING */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy-900 font-serif">3. Lease Period &amp; Rate Calculation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-navy-800 mb-1">Lease Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-navy-800 mb-1">Lease End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-navy-900 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-cream-50 p-4 space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Monthly Rate:</span>
                <span className="font-bold text-navy-900">₹{selectedUnit.rate}.00 / mo</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Lease Term:</span>
                <span className="font-semibold text-navy-900">12 Months</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-navy-900">
                <span>Total Lease Commitment:</span>
                <span className="text-emerald-700">₹{(selectedUnit.rate * 12).toLocaleString()}.00</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(4)} className="bg-navy-900 text-white font-bold">
                <span>Review &amp; Confirm</span>
                <ArrowRight className="h-4 w-4 text-amber-400 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Ready to Confirm Booking</span>
              </div>
              <div className="space-y-1.5 text-stone-700">
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="font-bold text-navy-900">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit:</span>
                  <span className="font-bold text-navy-900">{selectedUnit.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lease Period:</span>
                  <span className="font-semibold text-navy-900">{startDate} to {endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{(selectedUnit.rate * 12).toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleConfirm} disabled={loading} className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-400">
                <span>{loading ? 'Creating Booking...' : 'Confirm & Generate Booking'}</span>
                <Check className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
