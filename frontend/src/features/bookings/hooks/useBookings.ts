import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { BookingRecord } from '@/server/use-cases/bookings/types';
import { createClient } from '@/server/lib/supabaseClient';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as BookingRecord[];
};

export function useBookings(businessId?: string) {
  const [latestLiveBooking, setLatestLiveBooking] = useState<BookingRecord | null>(null);

  const endpoint = businessId
    ? `/api/bookings?businessId=${encodeURIComponent(businessId)}`
    : '/api/bookings';

  const { data, isLoading, error, mutate } = useSWR(endpoint, fetcher, {
    refreshInterval: 3000, // Poll every 3 seconds for real-time responsiveness
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const bookings = Array.isArray(data) ? data : [];

  // Real-Time Cross-Tab synchronization using BroadcastChannel and window StorageEvent
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('rentallq_bookings_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_BOOKING') {
            const newBooking = event.data.booking as BookingRecord;
            setLatestLiveBooking(newBooking);
            mutate();
          }
        };
      }
    } catch {
      // BroadcastChannel fallback
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'rentallq_latest_booking' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLatestLiveBooking(parsed);
          mutate();
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // Also listen to Supabase Realtime table if client connected
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel('realtime_bookings_list')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            mutate();
          }
        )
        .subscribe();
    } catch {
      // ignore
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [mutate]);

  const clearLiveAlert = useCallback(() => {
    setLatestLiveBooking(null);
  }, []);

  const createBooking = async (input: {
    customerId: string;
    rentalUnitId: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    status?: string;
    businessId?: string;
    businessName?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    unitName?: string;
  }) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Unable to create booking');
    }

    // Broadcast real-time booking event to all open tabs / windows
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rentallq_latest_booking', JSON.stringify(payload));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('rentallq_bookings_channel');
          bc.postMessage({ type: 'NEW_BOOKING', booking: payload });
          bc.close();
        }
      }
    } catch {}

    await mutate();
    return payload as BookingRecord;
  };

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Unable to update booking');
    }

    await mutate();
    return payload as BookingRecord;
  };

  return {
    bookings,
    loading: isLoading,
    error,
    latestLiveBooking,
    clearLiveAlert,
    createBooking,
    updateStatus,
    refresh: mutate,
  };
}
