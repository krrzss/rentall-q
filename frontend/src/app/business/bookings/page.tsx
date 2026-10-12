'use client';

import { useState, useEffect } from 'react';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingList } from '@/features/bookings/components/BookingList';
import { Button } from '@/components/ui/Button';
import { Plus, Building2, Radio, Wifi } from 'lucide-react';
import { createClient } from '@/server/lib/supabaseClient';

const WAREHOUSE_NAMES: Record<string, string> = {
  'b1000000-0000-0000-0000-000000000001': 'Austin SafeStore & Central Depot',
  'b2000000-0000-0000-0000-000000000002': 'Chicago MetroHub Micro-Warehousing',
  'b3000000-0000-0000-0000-000000000003': 'Seattle Pacific Port & Fleet Terminal',
  'b4000000-0000-0000-0000-000000000004': 'New York Empire Urban Storage & Depot',
};

export default function BookingsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [businessId, setBusinessId] = useState<string | undefined>(undefined);
  const [businessName, setBusinessName] = useState<string>('');
  const [isLoadingBiz, setIsLoadingBiz] = useState(true);

  // Detect the logged-in business on mount
  useEffect(() => {
    async function detectBusiness() {
      try {
        // 1) Try the business session cookie (demo/warehouse login)
        const sessionRes = await fetch('/api/auth/business-session');
        const sessionJson = await sessionRes.json();
        if (sessionJson.success && sessionJson.warehouse?.id) {
          const wid = sessionJson.warehouse.id;
          setBusinessId(wid);
          setBusinessName(
            sessionJson.warehouse.name ||
              WAREHOUSE_NAMES[wid] ||
              'Your Business'
          );
          return;
        }
      } catch {
        // ignore
      }

      try {
        // 2) Try Supabase auth session
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.business_id) {
            setBusinessId(profile.business_id);
            setBusinessName(
              WAREHOUSE_NAMES[profile.business_id] || 'Your Business'
            );
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3) Fallback: show all (admin view)
      setBusinessId(undefined);
      setBusinessName('');
    }

    detectBusiness().finally(() => setIsLoadingBiz(false));
  }, []);

  return (
    <main className="space-y-6 text-navy-900">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 font-serif">
              Bookings
            </h1>
            {/* Live sync badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="h-3 w-3" />
              <span>Real-Time</span>
            </div>
          </div>

          {/* Business context indicator */}
          {!isLoadingBiz && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              {businessName ? (
                <span>
                  Showing bookings for{' '}
                  <strong className="text-navy-900 font-serif">
                    {businessName}
                  </strong>{' '}
                  &bull; Client reservations appear here in real-time
                </span>
              ) : (
                <span>
                  Showing bookings across{' '}
                  <strong className="text-navy-900">all companies</strong>{' '}
                  (admin view)
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className="bg-amber-500 text-navy-900 hover:bg-amber-400 font-semibold border-amber-500 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </header>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/50 p-6 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <BookingForm
              onSuccess={() => {
                setRefreshKey((prev) => prev + 1);
                setShowForm(false);
              }}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      ) : null}

      {!isLoadingBiz && (
        <BookingList
          refreshKey={refreshKey}
          defaultBusinessId={businessId}
        />
      )}

      {isLoadingBiz && (
        <div className="py-16 text-center text-sm text-stone-500 font-medium animate-pulse">
          Detecting your business portal...
        </div>
      )}
    </main>
  );
}
