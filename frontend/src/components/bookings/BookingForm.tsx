'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface BookingFormProps {
  onSuccess?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSuccess }) => {
  const [customerId, setCustomerId] = useState('demo-cust-101');
  const [rentalUnitId, setRentalUnitId] = useState('demo-unit-202');
  const [checkIn, setCheckIn] = useState('2026-08-01');
  const [checkOut, setCheckOut] = useState('2026-08-05');
  const [dailyRate, setDailyRate] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          rentalUnitId,
          checkIn,
          checkOut,
          dailyRate: Number(dailyRate),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Rental Booking" subtitle="Execute Clean Architecture domain validation & booking workflow">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer ID</label>
          <input className="input-field" value={customerId} onChange={e => setCustomerId(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rental Unit ID</label>
          <input className="input-field" value={rentalUnitId} onChange={e => setRentalUnitId(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check-In Date</label>
          <input className="input-field" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check-Out Date</label>
          <input className="input-field" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Daily Rate (₹)</label>
          <input className="input-field" type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))} required />
        </div>
        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
          {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '12px' }}>Error: {error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Processing Domain Rules...' : 'Submit Booking'}
          </button>
        </div>
      </form>
    </Card>
  );
};
