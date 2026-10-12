'use client';

import { useState, useEffect } from 'react';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { BookingStatusStepper } from '@/features/bookings/components/BookingStatusStepper';
import { NewBookingModal } from '@/features/bookings/components/NewBookingModal';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  RefreshCw,
  Plus,
  Calendar as CalendarIcon,
  List,
  Building2,
  User,
  Radio,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface BookingListProps {
  refreshKey?: number;
  /** Pre-select a specific business — passed from the business portal */
  defaultBusinessId?: string;
}

const PRESET_COMPANIES = [
  { id: 'ALL', name: 'All Companies & Warehouses' },
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Austin SafeStore & Central Depot' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Chicago MetroHub Micro-Warehousing' },
  { id: 'b3000000-0000-0000-0000-000000000003', name: 'Seattle Pacific Port & Fleet Terminal' },
  { id: 'b4000000-0000-0000-0000-000000000004', name: 'New York Empire Urban Storage & Depot' },
];

export function BookingList({ refreshKey = 0, defaultBusinessId }: BookingListProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>(defaultBusinessId ?? 'ALL');
  const [hasManuallyChanged, setHasManuallyChanged] = useState(false);
  const [companyList, setCompanyList] = useState(PRESET_COMPANIES);

  const {
    bookings,
    loading,
    error,
    latestLiveBooking,
    clearLiveAlert,
    updateStatus,
    refresh,
  } = useBookings(selectedCompany === 'ALL' ? undefined : selectedCompany);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');

  // When the parent resolves the businessId asynchronously, update the selection
  // (only if the user hasn't manually changed it)
  useEffect(() => {
    if (!hasManuallyChanged && defaultBusinessId) {
      setSelectedCompany(defaultBusinessId);
    }
  }, [defaultBusinessId, hasManuallyChanged]);

  // Load any extra dynamic companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const extra = data.map((b: any) => ({ id: b.id, name: b.name }));
            const merged = [...PRESET_COMPANIES];
            for (const item of extra) {
              if (!merged.some((m) => m.id === item.id)) {
                merged.push(item);
              }
            }
            setCompanyList(merged);
          }
        }
      } catch {
        // ignore
      }
    }
    loadCompanies();
  }, []);

  // Update last refreshed time
  useEffect(() => {
    setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [bookings]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) ?? null;

  return (
    <section className="space-y-6 text-navy-900 font-sans">
      {/* Real-Time Booking Alert Banner */}
      {latestLiveBooking && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-navy-900 p-4 text-white shadow-lg animate-fadeIn border border-emerald-400">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Live Booking Event
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    Just Now
                  </span>
                </div>
                <p className="text-sm font-semibold mt-0.5 text-white">
                  Client <strong className="text-amber-300 font-bold">{latestLiveBooking.clientName || latestLiveBooking.customerName || 'Online Client'}</strong> just booked{' '}
                  <strong>{latestLiveBooking.rentalUnitName}</strong> for ₹{latestLiveBooking.totalAmount?.toLocaleString()}
                  {latestLiveBooking.businessName && (
                    <span className="text-emerald-100 font-normal"> at {latestLiveBooking.businessName}</span>
                  )}
                  !
                </p>
              </div>
            </div>

            <button
              onClick={clearLiveAlert}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-navy-900 font-serif">Rental Bookings &amp; Leases</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time feed of client storage reservations, active leases &amp; payments &bull; Updated: {lastRefreshedAt}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-2 bg-cream-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setHasManuallyChanged(true);
              }}
              className="bg-transparent font-bold text-navy-900 focus:outline-hidden cursor-pointer text-xs"
            >
              {companyList.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex rounded-xl border border-stone-200 bg-cream-50 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-stone-500 hover:text-navy-900'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-navy-900 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>New Booking</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-stone-500 font-medium">Loading bookings...</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
          {error.message}
        </div>
      ) : null}

      {/* VIEW MODE 1: LIST VIEW TABLE WITH CLIENT AND COMPANY DETAILS */}
      {!loading && viewMode === 'table' && bookings.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream-50/70 border-stone-200">
                <TableHead className="font-bold text-navy-900">Client / Tenant</TableHead>
                <TableHead className="font-bold text-navy-900">Company / Facility</TableHead>
                <TableHead className="font-bold text-navy-900">Storage Unit</TableHead>
                <TableHead className="font-bold text-navy-900">Lease Dates</TableHead>
                <TableHead className="font-bold text-navy-900">Amount &amp; Payment</TableHead>
                <TableHead className="font-bold text-navy-900">Pipeline Status</TableHead>
                <TableHead className="font-bold text-navy-900 text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const clientName = booking.clientName || booking.customerName || booking.customerId;
                const isOnlineClientBooking = Boolean(booking.clientEmail || booking.paymentMethod || booking.isNew);

                return (
                  <TableRow
                    key={booking.id}
                    className={`hover:bg-cream-50/50 transition-colors ${
                      booking.isNew ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Client / Tenant Column */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/10 text-navy-900 text-xs font-bold shrink-0">
                          {clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedBookingId(booking.id)}
                            className="text-left font-bold text-navy-900 hover:text-amber-700 transition cursor-pointer font-serif block leading-tight"
                          >
                            {clientName}
                          </button>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {booking.clientEmail && (
                              <span className="text-[10px] text-stone-500 font-mono">
                                {booking.clientEmail}
                              </span>
                            )}
                            {isOnlineClientBooking && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Client Booked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company / Facility */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                        <Building2 className="h-3 w-3 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[150px]">{booking.businessName || 'Austin SafeStore'}</span>
                      </span>
                    </TableCell>

                    {/* Rental Unit */}
                    <TableCell className="text-stone-700 text-xs font-semibold">
                      <div>{booking.rentalUnitName ?? booking.rentalUnitId}</div>
                    </TableCell>

                    {/* Lease Dates */}
                    <TableCell className="text-stone-500 text-xs">
                      <div>
                        {new Date(booking.startDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>

                    {/* Amount & Payment */}
                    <TableCell>
                      <div className="font-bold text-emerald-700 text-xs">
                        ₹{booking.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1 mt-0.5">
                        {booking.paymentMethod && (
                          <span className="uppercase text-stone-600 font-semibold">{booking.paymentMethod}</span>
                        )}
                        {booking.transactionId && (
                          <span>&bull; {booking.transactionId}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Stepper */}
                    <TableCell>
                      <BookingStatusStepper status={booking.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Select
                        value={booking.status}
                        onChange={(event) => updateStatus(booking.id, event.target.value)}
                        className="py-1 text-xs font-semibold border-stone-200 rounded-lg bg-cream-50 inline-block w-32"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-16 text-center space-y-3">
          <CalendarIcon className="mx-auto h-10 w-10 text-stone-300" />
          <h3 className="text-base font-bold text-navy-900 font-serif">No Bookings Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {selectedCompany === 'ALL'
              ? 'There are currently no rental bookings in the system.'
              : `No bookings found for the selected company. Client bookings made in the client portal will show here in real-time.`}
          </p>
          <Button
            size="sm"
            onClick={() => setSelectedCompany('ALL')}
            variant="outline"
            className="text-xs font-semibold mt-2"
          >
            Show All Companies
          </Button>
        </div>
      )}

      {/* VIEW MODE 2: CALENDAR VIEW */}
      {!loading && viewMode === 'calendar' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-navy-900 font-serif">Lease Schedule Calendar</h3>
            <span className="text-xs text-stone-500 font-semibold">
              Gold: Active Client Bookings &bull; Green: Available
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-400 pb-2">
            <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const hasBooking = day >= 10 && day <= 25;

              return (
                <div
                  key={day}
                  className={`rounded-xl p-3 text-center border font-bold text-xs flex flex-col justify-between h-16 ${
                    hasBooking
                      ? 'bg-amber-500/20 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className="text-left font-serif text-[11px]">{day}</span>
                  <span className="text-[10px] font-semibold">{hasBooking ? 'Active Lease' : 'Open'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Summary Drawer */}
      {selectedBooking ? (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">Booking Summary</h3>
            <button
              type="button"
              onClick={() => setSelectedBookingId(null)}
              className="text-xs text-amber-700 hover:underline font-bold cursor-pointer"
            >
              Close details
            </button>
          </div>
          <BookingCard booking={selectedBooking} onStatusChange={updateStatus} />
        </div>
      ) : null}
    </section>
  );
}
