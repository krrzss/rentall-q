'use client';

import { PaymentRecord, PaymentStatus } from '@/server/use-cases/payments/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface PaymentCardProps {
  payment: PaymentRecord;
  onStatusChange?: (id: string, status: PaymentStatus) => Promise<unknown>;
  onDelete?: (id: string) => Promise<unknown>;
}

export function PaymentCard({ payment, onStatusChange, onDelete }: PaymentCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-emerald-600">₹{payment.amount.toFixed(2)}</h3>
            <Badge status={payment.status}>{payment.status}</Badge>
          </div>
          <div><span className="font-medium text-slate-500">Payment ID:</span> <span className="font-mono text-xs text-slate-800">{payment.id}</span></div>
          <div><span className="font-medium text-slate-500">Booking ID:</span> <span className="font-mono text-xs text-slate-800">{payment.bookingId}</span></div>
          {payment.bookingCustomerName ? (
            <div><span className="font-medium text-slate-500">Customer:</span> <span className="text-slate-800 font-semibold">{payment.bookingCustomerName}</span></div>
          ) : null}
          {payment.bookingUnitName ? (
            <div><span className="font-medium text-slate-500">Rental Unit:</span> <span className="text-slate-800 font-semibold">{payment.bookingUnitName}</span></div>
          ) : null}
          <div><span className="font-medium text-slate-500">Method:</span> <span className="text-slate-800">{payment.method.replace('_', ' ')}</span></div>
          <div><span className="font-medium text-slate-500">Due Date:</span> <span className="text-slate-800">{new Date(payment.dueDate).toLocaleDateString()}</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onStatusChange ? (
            <Select
              value={payment.status}
              onChange={(e) => onStatusChange(payment.id, e.target.value as PaymentStatus)}
              className="text-xs w-auto py-1"
            >
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </Select>
          ) : null}

          {onDelete ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm(`Are you sure you want to delete this payment record?`)) {
                  onDelete(payment.id);
                }
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
