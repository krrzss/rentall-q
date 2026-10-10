'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usePayments } from '@/features/payments/hooks/usePayments';
import { PaymentMethod, PaymentStatus } from '@/server/use-cases/payments/types';
import { BookingRecord } from '@/server/use-cases/bookings/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface PaymentFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function PaymentForm({ onSuccess, onClose }: PaymentFormProps) {
  const { createPayment } = usePayments();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookings(data);
          if (data.length > 0) {
            setBookingId(data[0].id);
            setAmount(String(data[0].totalAmount || ''));
          }
        }
      } catch (err) {
        setError('Failed to fetch bookings for dropdown');
      }
    }
    loadBookings();
  }, []);

  function handleBookingChange(selectedId: string) {
    setBookingId(selectedId);
    const selectedBooking = bookings.find((b) => b.id === selectedId);
    if (selectedBooking && selectedBooking.totalAmount) {
      setAmount(String(selectedBooking.totalAmount));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Payment amount must be a positive number');
      }

      await createPayment({
        bookingId,
        amount: parsedAmount,
        dueDate: new Date(dueDate),
        method,
        status,
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
        <CardTitle>Record New Payment</CardTitle>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </CardHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 pt-4">
        <Select
          label="Select Booking"
          value={bookingId}
          onChange={(e) => handleBookingChange(e.target.value)}
          required
          className="md:col-span-2"
        >
          {bookings.length === 0 ? (
            <option value="">No active bookings found</option>
          ) : (
            bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                Booking {booking.id.slice(0, 8)}... — {booking.customerName || 'Customer'} (
                {booking.rentalUnitName || 'Unit'}) - ₹{booking.totalAmount}
              </option>
            ))
          )}
        </Select>

        <Input
          label="Payment Amount (₹)"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="250.00"
        />

        <Input
          label="Due Date"
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Select
          label="Payment Method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        >
          <option value="CREDIT_CARD">CREDIT CARD</option>
          <option value="BANK_TRANSFER">BANK TRANSFER</option>
          <option value="CASH">CASH</option>
          <option value="STRIPE">STRIPE</option>
          <option value="PAYPAL">PAYPAL</option>
        </Select>

        <Select
          label="Initial Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentStatus)}
        >
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </Select>

        {error ? (
          <p className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 md:col-span-2 font-medium">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 md:col-span-2 justify-end pt-2 border-t border-slate-100 mt-2">
          {onClose ? (
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" loading={loading} disabled={!bookingId}>
            Create Payment
          </Button>
        </div>
      </form>
    </Card>
  );
}
