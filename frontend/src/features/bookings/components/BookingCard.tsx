'use client';

import { BookingRecord } from '@/server/use-cases/bookings/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Building2, User, CreditCard, Calendar, Hash } from 'lucide-react';

interface BookingCardProps {
  booking: BookingRecord;
  onStatusChange: (id: string, status: string) => Promise<unknown>;
}

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  return (
    <Card className="border-stone-200 shadow-sm bg-white p-5 rounded-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400 text-[10px] uppercase">Booking ID:</span>
            <span className="font-mono text-navy-900 font-bold bg-stone-100 px-2 py-0.5 rounded text-[11px]">
              {booking.id}
            </span>
            {booking.isNew && (
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                Live Client Booking
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="font-medium text-stone-500">Client / Tenant:</span>{' '}
            <span className="font-bold text-navy-900 text-sm font-serif">
              {booking.clientName ?? booking.customerName ?? booking.customerId}
            </span>
            {booking.clientEmail && (
              <span className="text-[10px] text-stone-500 font-mono">({booking.clientEmail})</span>
            )}
          </div>

          {booking.businessName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-medium text-stone-500">Company:</span>{' '}
              <span className="font-semibold text-navy-900 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                {booking.businessName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-500">Rental Space:</span>{' '}
            <span className="font-semibold text-navy-900">
              {booking.rentalUnitName ?? booking.rentalUnitId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="font-medium text-stone-500">Lease Period:</span>{' '}
            <span className="text-stone-700 font-medium">
              {new Date(booking.startDate).toLocaleDateString()} &rarr; {new Date(booking.endDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-stone-500">Total Paid:</span>{' '}
            <span className="font-bold text-emerald-700 text-sm font-serif">₹{booking.totalAmount.toLocaleString()}</span>
            {booking.paymentMethod && (
              <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                {booking.paymentMethod}
              </span>
            )}
            {booking.transactionId && (
              <span className="text-[10px] text-stone-400 font-mono">
                TXN: {booking.transactionId}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          <Badge status={booking.status} className="self-start">
            {booking.status}
          </Badge>
          <Select
            value={booking.status}
            onChange={(event) => onStatusChange(booking.id, event.target.value)}
            className="text-xs bg-cream-50"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </Select>
        </div>
      </div>
    </Card>
  );
}
