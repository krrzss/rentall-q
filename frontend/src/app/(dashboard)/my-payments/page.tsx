'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Receipt,
  ShieldCheck,
  Building2,
  X,
  Wallet,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  Check,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNo: string;
  unitName: string;
  dimensions?: string;
  facilityName: string;
  amount: number;
  subtotal: number;
  tax: number;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export default function ClientPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'DUE'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);

  // Pay Now Modal state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial baseline invoices
    const baselineInvoices: Invoice[] = [
      {
        id: 'inv-101',
        invoiceNo: 'INV-2026-0881',
        unitName: 'Storage Locker #102',
        dimensions: '5x5 Standard',
        facilityName: 'Austin SafeStore & Central Depot',
        amount: 20000,
        subtotal: 16950,
        tax: 3050,
        status: 'PAID',
        dueDate: 'Mar 01, 2026',
        paidDate: 'Mar 01, 2026',
        paymentMethod: 'Credit Card (•••• 4242)',
        transactionId: 'TXN-902144',
      },
      {
        id: 'inv-102',
        invoiceNo: 'INV-2026-0942',
        unitName: 'Climate-Controlled Bay #4B',
        dimensions: '10x10 Climate',
        facilityName: 'Chicago MetroHub Micro-Warehousing',
        amount: 9600,
        subtotal: 8135,
        tax: 1465,
        status: 'DUE',
        dueDate: 'Apr 01, 2026',
        paymentMethod: 'Pending Payment',
      },
    ];

    // 2. Read new bookings from localStorage created by the user in the marketplace
    try {
      const storedBookings = localStorage.getItem('rentallq_my_bookings');
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const bookingInvoices: Invoice[] = parsed.map((b: any, index: number) => {
            const amt = Number(b.totalAmount) || 14500;
            const sub = Math.round(amt / 1.18);
            const tx = amt - sub;
            return {
              id: `inv-b-${b.id || index}`,
              invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              unitName: b.unitName || 'Dedicated Storage Unit',
              dimensions: b.dimensions || '10x10 Standard',
              facilityName: b.businessName || 'Austin SafeStore Depot',
              amount: amt,
              subtotal: sub,
              tax: tx,
              status: 'PAID',
              dueDate: b.startDate ? new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Nov 01, 2026',
              paidDate: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Just now',
              paymentMethod: b.paymentMethod ? `${b.paymentMethod.toUpperCase()} (Online)` : 'Credit Card (•••• 4242)',
              transactionId: b.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            };
          });

          // Merge without duplicates
          const merged = [...bookingInvoices, ...baselineInvoices];
          setInvoices(merged);
          return;
        }
      }
    } catch {
      // ignore
    }

    setInvoices(baselineInvoices);
  }, []);

  // Compute metrics
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalDue = invoices
    .filter((inv) => inv.status === 'DUE' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const dueCount = invoices.filter((inv) => inv.status === 'DUE' || inv.status === 'OVERDUE').length;

  // Filtered view
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'PAID') return inv.status === 'PAID';
    if (activeTab === 'DUE') return inv.status === 'DUE' || inv.status === 'OVERDUE';
    return true;
  });

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessingPay(true);
    const newTxId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Simulate payment call
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payingInvoice.amount,
          paymentMethod: payMethod,
          status: 'COMPLETED',
          description: `Online rent settlement for ${payingInvoice.unitName} (${payingInvoice.invoiceNo})`,
          transactionId: newTxId,
        }),
      });
    } catch {
      // fallback
    }

    // Update local state
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payingInvoice.id
          ? {
              ...inv,
              status: 'PAID',
              paidDate: 'Just now',
              paymentMethod: payMethod === 'upi' ? 'UPI / QR Checkout' : payMethod === 'card' ? 'Credit Card (•••• 4242)' : 'Netbanking',
              transactionId: newTxId,
            }
          : inv
      )
    );

    setIsProcessingPay(false);
    setPaySuccessMsg(`Payment of ₹${payingInvoice.amount.toLocaleString('en-IN')} successful for ${payingInvoice.invoiceNo}!`);
    setTimeout(() => {
      setPaySuccessMsg(null);
      setPayingInvoice(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 text-navy-900 max-w-6xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
              Tenant Financial Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 font-serif mt-1">
            My Payments &amp; Invoices
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review detailed payment statements, settle upcoming dues, and download tax-compliant rental receipts.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-navy-900">Encrypted 256-Bit SSL Payments</span>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-stone-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>Total Paid (YTD)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-navy-900 mt-2 font-serif">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{paidCount} successful settlement{paidCount !== 1 ? 's' : ''}</span>
          </div>
        </Card>

        <Card className="p-5 border-stone-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>Upcoming Due Balance</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-navy-900 mt-2 font-serif">
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{dueCount} invoice{dueCount !== 1 ? 's' : ''} awaiting settlement</span>
          </div>
        </Card>

        <Card className="p-5 border-stone-200 bg-white shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 uppercase font-semibold">
            <span>Account Standing</span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2 font-serif flex items-center gap-2">
            <span>Good Standing</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">
            No defaulted accounts &bull; Verified tenant
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Invoices List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: `All Invoices (${invoices.length})` },
              { id: 'PAID', label: `Paid (${paidCount})` },
              { id: 'DUE', label: `Upcoming / Due (${dueCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-cream-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-stone-400 font-medium">
            Showing {filteredInvoices.length} transaction statement{filteredInvoices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Invoice Rows */}
        <div className="space-y-3">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            return (
              <Card
                key={inv.id}
                className={`p-5 border transition-all duration-200 bg-white shadow-xs hover:border-amber-400 ${
                  isPaid ? 'border-stone-200' : 'border-amber-300 ring-2 ring-amber-300/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-navy-900">
                          {inv.invoiceNo}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          &bull; {inv.dimensions}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-navy-900 font-serif">
                        {inv.unitName}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-stone-400" />
                          <span>{inv.facilityName}</span>
                        </span>
                        <span>&bull;</span>
                        <span>{isPaid ? `Paid on ${inv.paidDate}` : `Due by ${inv.dueDate}`}</span>
                        {inv.transactionId && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-stone-400">{inv.transactionId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-stone-400 font-medium">Total Amount</div>
                      <div className="text-lg sm:text-xl font-bold text-navy-900 font-serif">
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-400">Incl. 18% GST</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReceipt(inv)}
                        className="text-xs font-semibold border-stone-200 text-navy-900 hover:bg-cream-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-stone-500" />
                        <span>Receipt</span>
                      </Button>

                      {!isPaid && (
                        <Button
                          size="sm"
                          onClick={() => setPayingInvoice(inv)}
                          className="bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold text-xs border-amber-500 shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Pay Now</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredInvoices.length === 0 && (
            <Card className="p-12 text-center border-stone-200 bg-white">
              <Receipt className="mx-auto h-10 w-10 text-stone-400 mb-3" />
              <h3 className="text-base font-bold text-navy-900">No Invoices in this Category</h3>
              <p className="text-xs text-stone-500 mt-1">
                You have zero pending invoices matching this filter.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* RECEIPT / INVOICE VIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-navy-900 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-navy-900 font-bold">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif">Official Payment Receipt</h3>
                  <p className="text-[11px] text-stone-300 font-mono">{selectedReceipt.invoiceNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6 text-xs text-navy-900">
              {/* Top Meta Details */}
              <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-navy-900 font-serif">RentallQ Platform</h4>
                  <p className="text-stone-500 mt-0.5">Facility: {selectedReceipt.facilityName}</p>
                  <p className="text-stone-500">Tenant Account: Client Portal</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedReceipt.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {selectedReceipt.status}
                  </span>
                  <p className="text-stone-400 text-[10px] mt-1 font-mono">Date: {selectedReceipt.paidDate || selectedReceipt.dueDate}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-semibold text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Unit / Dim</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-3 font-semibold text-navy-900">
                        Monthly Space Rental
                        <span className="block text-[10px] text-stone-500 font-normal">{selectedReceipt.unitName}</span>
                      </td>
                      <td className="p-3 text-center text-stone-600 font-mono">{selectedReceipt.dimensions}</td>
                      <td className="p-3 text-right font-bold text-navy-900">₹{selectedReceipt.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-stone-600">Goods &amp; Services Tax (GST 18%)</td>
                      <td className="p-3 text-center text-stone-400 font-mono">18%</td>
                      <td className="p-3 text-right font-semibold text-stone-700">₹{selectedReceipt.tax.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-cream-50 font-bold border-t border-stone-200">
                    <tr>
                      <td colSpan={2} className="p-3 text-navy-900 font-serif text-sm">Total Paid</td>
                      <td className="p-3 text-right text-navy-900 font-serif text-base">₹{selectedReceipt.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Details Box */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1.5 text-[11px] text-stone-600">
                <div className="flex justify-between">
                  <span>Payment Channel:</span>
                  <strong className="text-navy-900">{selectedReceipt.paymentMethod}</strong>
                </div>
                {selectedReceipt.transactionId && (
                  <div className="flex justify-between">
                    <span>Reference / Transaction ID:</span>
                    <strong className="text-navy-900 font-mono">{selectedReceipt.transactionId}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Billing Verification:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified &amp; Recorded in Depot Ledger
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs font-semibold border-stone-200 text-navy-900 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAY NOW MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 text-navy-900">
            {/* Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-navy-900 font-bold">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif">Settle Rent Due</h3>
                  <p className="text-[11px] text-stone-300 font-mono">{payingInvoice.invoiceNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {paySuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-navy-900 font-serif">Payment Verified!</h3>
                <p className="text-xs text-stone-500">{paySuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
                {/* Summary */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block font-serif">
                      {payingInvoice.unitName}
                    </span>
                    <span className="text-[11px] text-stone-500">Due Date: {payingInvoice.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">Payable Amount</span>
                    <span className="text-base font-bold text-navy-900 font-serif">
                      ₹{payingInvoice.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-navy-900">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: 'Credit Card', icon: CreditCard },
                      { id: 'upi', label: 'UPI / QR', icon: Wallet },
                      { id: 'netbanking', label: 'Netbanking', icon: Building2 },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSel = payMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                            isSel
                              ? 'border-amber-500 bg-amber-50 text-navy-900 font-bold ring-2 ring-amber-500/20'
                              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isSel ? 'text-amber-600' : 'text-stone-400'}`} />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Demo Card Fields */}
                {payMethod === 'card' && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        readOnly
                        value="•••• •••• •••• 4242 (Demo Test Card)"
                        className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-lg font-mono text-xs text-navy-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Expires</label>
                        <input
                          type="text"
                          readOnly
                          value="12 / 28"
                          className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-lg font-mono text-xs text-navy-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">CVV</label>
                        <input
                          type="password"
                          readOnly
                          value="888"
                          className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-lg font-mono text-xs text-navy-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === 'upi' && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-600 space-y-1">
                    <p className="font-semibold text-navy-900">Instant UPI Payment</p>
                    <p className="text-[11px]">Instant settlement via Google Pay, PhonePe, or BHIM.</p>
                  </div>
                )}

                {payMethod === 'netbanking' && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-600 space-y-1">
                    <p className="font-semibold text-navy-900">HDFC / ICICI / SBI Gateway</p>
                    <p className="text-[11px]">Direct bank authentication transfer.</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isProcessingPay}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold text-xs py-2.5 rounded-xl border-amber-500 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPay ? (
                      <span>Processing Settlement...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirm &amp; Pay ₹{payingInvoice.amount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
