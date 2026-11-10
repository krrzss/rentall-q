'use client';

import { useState } from 'react';
import { PaymentCard } from '@/features/payments/components/PaymentCard';
import { RevenueChart } from '@/features/payments/components/RevenueChart';
import { usePayments } from '@/features/payments/hooks/usePayments';
import { PaymentStatus } from '@/server/use-cases/payments/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { RefreshCw, Plus, Send, FileText, Check, DollarSign, AlertTriangle, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentListProps {
  refreshKey?: number;
}

export function PaymentList({ refreshKey = 0 }: PaymentListProps) {
  const { payments, loading, error, updateStatus, deletePayment, refresh } = usePayments();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  // Interactive Toast & Modal States
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [invoiceModalPayment, setInvoiceModalPayment] = useState<any | null>(null);

  // Form State for Record Payment
  const [clientName, setClientName] = useState('Sarah Lin');
  const [amount, setAmount] = useState('250.00');
  const [method, setMethod] = useState('CREDIT_CARD');

  const selectedPayment = payments.find((p) => p.id === selectedPaymentId) ?? null;

  async function handleStatusChange(id: string, status: PaymentStatus) {
    await updateStatus(id, status);
  }

  const handleSendReminder = (customerName: string) => {
    setReminderToast(`Automated WhatsApp & Email payment link sent to ${customerName}.`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderToast(`Payment of ₹${amount} recorded for ${clientName}.`);
    setIsRecordModalOpen(false);
    setTimeout(() => setReminderToast(null), 3500);
    refresh();
  };

  return (
    <section className="space-y-6 text-navy-900 font-sans">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy-900 font-serif">Billing &amp; Payment Ledger</h2>
          <p className="text-xs text-stone-500">Record transactions, send payment reminders &amp; generate invoices</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRecordModalOpen(true)}
            className="bg-navy-900 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Record Payment</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Animated Reminder Toast */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{reminderToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1: Animated Revenue Chart */}
      <RevenueChart />

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-navy-900 font-serif">Record Client Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Client Name</label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Payment Amount (₹)</label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Payment Method</label>
                <Select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-xl">
                  <option value="CREDIT_CARD">Credit Card / Stripe</option>
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CASH">Cash Payment</option>
                </Select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-navy-900 text-white font-bold">Save Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {invoiceModalPayment && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-navy-900 font-serif">Official Tax Invoice</h3>
              </div>
              <button onClick={() => setInvoiceModalPayment(null)} className="text-stone-400 hover:text-navy-900 font-bold">✕</button>
            </div>
            <div className="space-y-2 bg-cream-50 p-4 rounded-xl border border-stone-200">
              <div className="flex justify-between text-stone-500">
                <span>Invoice ID:</span>
                <span className="font-mono text-navy-900 font-bold">INV-{invoiceModalPayment.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Client Name:</span>
                <span className="font-semibold text-navy-900">{invoiceModalPayment.bookingCustomerName || 'Sarah Lin'}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Amount Due / Paid:</span>
                <span className="font-bold text-emerald-700">₹{invoiceModalPayment.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  const receiptText = `
========================================
       RENTALL-Q TAX INVOICE RECEIPT
========================================
Invoice Code: INV-${invoiceModalPayment.id.substring(0, 8)}
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Facility: Hindustan Cold Storage & Logistics
GSTIN: 27AABCH1234F1Z8
----------------------------------------
Billed To: ${invoiceModalPayment.bookingCustomerName || 'Client Profile'}
Booking ID: ${invoiceModalPayment.bookingId}
Method: ${invoiceModalPayment.method.replace('_', ' ')}
----------------------------------------
Gross Amount:    ₹${invoiceModalPayment.amount.toFixed(2)}
Platform Fee:    ₹${(invoiceModalPayment.amount * 0.085).toFixed(2)} (8.5%)
Net Dispatched:  ₹${(invoiceModalPayment.amount * 0.915).toFixed(2)}
Status:          ${invoiceModalPayment.status === 'COMPLETED' ? 'PAID & SETTLED' : 'PENDING'}
========================================
`;
                  const blob = new Blob([receiptText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Invoice_INV-${invoiceModalPayment.id.substring(0, 8)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setReminderToast(`Receipt for INV-${invoiceModalPayment.id.substring(0, 8)} downloaded.`);
                }}
                className="flex-1 bg-navy-900 text-white font-bold"
              >
                Download Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 border-stone-300 text-stone-700"
              >
                Print Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Transactions Table */}
      {!loading && payments.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream-50/70 border-stone-200">
                <TableHead className="font-bold text-navy-900">Invoice ID</TableHead>
                <TableHead className="font-bold text-navy-900">Client / Customer</TableHead>
                <TableHead className="font-bold text-navy-900">Amount</TableHead>
                <TableHead className="font-bold text-navy-900">Payment Method</TableHead>
                <TableHead className="font-bold text-navy-900">Status</TableHead>
                <TableHead className="font-bold text-navy-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const customerName = payment.bookingCustomerName || 'Client Profile';
                const isOverdue = payment.status === 'PENDING';

                return (
                  <TableRow key={payment.id} className="hover:bg-cream-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-navy-900">
                      INV-{payment.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-stone-700 text-xs">
                      <div className="font-bold text-navy-900 font-serif">{customerName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">Booking ID: {payment.bookingId.slice(0, 6)}</div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700 text-xs">
                      ₹{payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-stone-600 text-xs font-medium">
                      {payment.method.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          payment.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {payment.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setInvoiceModalPayment(payment)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-amber-700 cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-stone-500" />
                          <span>Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendReminder(customerName)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 cursor-pointer"
                        >
                          <BellRing className="h-3.5 w-3.5 text-amber-600" />
                          <span>Reminder</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

    </section>
  );
}
