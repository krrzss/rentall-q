'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Card
      title="Active Rental Bookings"
      subtitle="Retrieved via Prisma Repository clean architecture pattern"
      action={<button className="btn" onClick={fetchBookings}>Refresh</button>}
    >
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No bookings found. Use the form above to add one.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 8px' }}>Customer</th>
                <th style={{ padding: '12px 8px' }}>Rental Unit</th>
                <th style={{ padding: '12px 8px' }}>Check-In</th>
                <th style={{ padding: '12px 8px' }}>Check-Out</th>
                <th style={{ padding: '12px 8px' }}>Daily Rate</th>
                <th style={{ padding: '12px 8px' }}>Total Price</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id || b.customerId + b.checkIn} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 8px' }}>{b.customerId}</td>
                  <td style={{ padding: '12px 8px' }}>{b.rentalUnitId}</td>
                  <td style={{ padding: '12px 8px' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 8px' }}>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 8px' }}>₹{b.dailyRate}</td>
                  <td style={{ padding: '12px 8px', color: '#4ade80', fontWeight: 600 }}>₹{b.totalPrice}</td>
                  <td style={{ padding: '12px 8px' }}><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
