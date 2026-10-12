import { BookingRecord, BookingStatus } from '@/server/use-cases/bookings/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { runtimeCustomersCache } from './customerRepository';

export const WAREHOUSE_NAMES: Record<string, string> = {
  'b1000000-0000-0000-0000-000000000001': 'Austin SafeStore & Central Depot',
  'b2000000-0000-0000-0000-000000000002': 'Chicago MetroHub Micro-Warehousing',
  'b3000000-0000-0000-0000-000000000003': 'Seattle Pacific Port & Fleet Terminal',
  'b4000000-0000-0000-0000-000000000004': 'New York Empire Urban Storage & Depot',
};

// Seeded warehouse bookings registry for resilient multi-tenant operation
const SEEDED_WAREHOUSE_BOOKINGS: Record<string, BookingRecord[]> = {
  // Warehouse 1: Austin SafeStore
  'b1000000-0000-0000-0000-000000000001': [
    {
      id: 'a1000000-0000-0000-0000-000000000011',
      customerId: 'c1000000-0000-0000-0000-000000000011',
      customerName: 'Alex Chen',
      clientName: 'Alex Chen',
      clientEmail: 'client@rentallq.com',
      rentalUnitId: 'd1000000-0000-0000-0000-000000000011',
      rentalUnitName: 'Climate Locker A-101',
      startDate: new Date(Date.now() - 90 * 86400000),
      endDate: new Date(Date.now() + 270 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 1800,
      createdAt: new Date(Date.now() - 90 * 86400000),
      businessId: 'b1000000-0000-0000-0000-000000000001',
      businessName: 'Austin SafeStore & Central Depot',
      paymentMethod: 'card',
      transactionId: 'TXN-982101',
    },
    {
      id: 'a1000000-0000-0000-0000-000000000012',
      customerId: 'c1000000-0000-0000-0000-000000000012',
      customerName: 'Sarah Jenkins',
      clientName: 'Sarah Jenkins',
      clientEmail: 'sarah.j@austintech.io',
      rentalUnitId: 'd1000000-0000-0000-0000-000000000014',
      rentalUnitName: 'Drive-Up Unit A-104',
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(Date.now() + 330 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 2520,
      createdAt: new Date(Date.now() - 30 * 86400000),
      businessId: 'b1000000-0000-0000-0000-000000000001',
      businessName: 'Austin SafeStore & Central Depot',
      paymentMethod: 'upi',
      transactionId: 'TXN-741290',
    },
  ],
  // Warehouse 2: Chicago MetroHub
  'b2000000-0000-0000-0000-000000000002': [
    {
      id: 'a2000000-0000-0000-0000-000000000021',
      customerId: 'c2000000-0000-0000-0000-000000000021',
      customerName: 'Marcus Vance',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus.vance@techfleet.io',
      rentalUnitId: 'd2000000-0000-0000-0000-000000000021',
      rentalUnitName: 'Distribution Bay B-201',
      startDate: new Date(Date.now() - 60 * 86400000),
      endDate: new Date(Date.now() + 300 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 5400,
      createdAt: new Date(Date.now() - 60 * 86400000),
      businessId: 'b2000000-0000-0000-0000-000000000002',
      businessName: 'Chicago MetroHub Micro-Warehousing',
      paymentMethod: 'netbanking',
      transactionId: 'TXN-551029',
    },
    {
      id: 'a2000000-0000-0000-0000-000000000022',
      customerId: 'c2000000-0000-0000-0000-000000000022',
      customerName: 'Elena Rostova',
      clientName: 'Elena Rostova',
      clientEmail: 'elena.rostova@nexusretail.com',
      rentalUnitId: 'd2000000-0000-0000-0000-000000000023',
      rentalUnitName: 'Bulk Staging Area B-203',
      startDate: new Date(Date.now() - 45 * 86400000),
      endDate: new Date(Date.now() + 315 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 11400,
      createdAt: new Date(Date.now() - 45 * 86400000),
      businessId: 'b2000000-0000-0000-0000-000000000002',
      businessName: 'Chicago MetroHub Micro-Warehousing',
      paymentMethod: 'card',
      transactionId: 'TXN-329184',
    },
    {
      id: 'a2000000-0000-0000-0000-000000000023',
      customerId: 'c2000000-0000-0000-0000-000000000023',
      customerName: 'Apex Cargo Express',
      clientName: 'Apex Cargo Express',
      clientEmail: 'dispatch@apexcargo.com',
      rentalUnitId: 'd2000000-0000-0000-0000-000000000024',
      rentalUnitName: 'Cold Storage Pod B-204',
      startDate: new Date(Date.now() - 15 * 86400000),
      endDate: new Date(Date.now() + 345 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 6240,
      createdAt: new Date(Date.now() - 15 * 86400000),
      businessId: 'b2000000-0000-0000-0000-000000000002',
      businessName: 'Chicago MetroHub Micro-Warehousing',
      paymentMethod: 'card',
      transactionId: 'TXN-901844',
    },
  ],
  // Warehouse 3: Seattle Pacific Port
  'b3000000-0000-0000-0000-000000000003': [
    {
      id: 'a3000000-0000-0000-0000-000000000031',
      customerId: 'c3000000-0000-0000-0000-000000000031',
      customerName: 'Devon Brooks',
      clientName: 'Devon Brooks',
      clientEmail: 'devon.b@portlogistics.net',
      rentalUnitId: 'd3000000-0000-0000-0000-000000000031',
      rentalUnitName: 'Commercial Fleet Bay C-301',
      startDate: new Date(Date.now() - 40 * 86400000),
      endDate: new Date(Date.now() + 320 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 2280,
      createdAt: new Date(Date.now() - 40 * 86400000),
      businessId: 'b3000000-0000-0000-0000-000000000003',
      businessName: 'Seattle Pacific Port & Fleet Terminal',
      paymentMethod: 'card',
      transactionId: 'TXN-661902',
    },
    {
      id: 'a3000000-0000-0000-0000-000000000032',
      customerId: 'c3000000-0000-0000-0000-000000000032',
      customerName: 'Cascade Freight Lines',
      clientName: 'Cascade Freight Lines',
      clientEmail: 'ops@cascadefreight.com',
      rentalUnitId: 'd3000000-0000-0000-0000-000000000033',
      rentalUnitName: 'Container Staging Yard C-303',
      startDate: new Date(Date.now() - 20 * 86400000),
      endDate: new Date(Date.now() + 340 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 4560,
      createdAt: new Date(Date.now() - 20 * 86400000),
      businessId: 'b3000000-0000-0000-0000-000000000003',
      businessName: 'Seattle Pacific Port & Fleet Terminal',
      paymentMethod: 'netbanking',
      transactionId: 'TXN-410982',
    },
    {
      id: 'a3000000-0000-0000-0000-000000000033',
      customerId: 'c3000000-0000-0000-0000-000000000033',
      customerName: 'Pacific Charter Fleet',
      clientName: 'Pacific Charter Fleet',
      clientEmail: 'fleet@pacificcharter.org',
      rentalUnitId: 'd3000000-0000-0000-0000-000000000034',
      rentalUnitName: 'Covered RV / Boat Bay C-304',
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() + 350 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 3120,
      createdAt: new Date(Date.now() - 10 * 86400000),
      businessId: 'b3000000-0000-0000-0000-000000000003',
      businessName: 'Seattle Pacific Port & Fleet Terminal',
      paymentMethod: 'upi',
      transactionId: 'TXN-119830',
    },
  ],
  // Warehouse 4: New York Empire Depot
  'b4000000-0000-0000-0000-000000000004': [
    {
      id: 'a4000000-0000-0000-0000-000000000041',
      customerId: 'c4000000-0000-0000-0000-000000000041',
      customerName: 'Julian Sterling',
      clientName: 'Julian Sterling',
      clientEmail: 'sterling.j@manhattanvault.com',
      rentalUnitId: 'd4000000-0000-0000-0000-000000000041',
      rentalUnitName: 'Manhattan High-Ceiling Vault D-101',
      startDate: new Date(Date.now() - 75 * 86400000),
      endDate: new Date(Date.now() + 285 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 3720,
      createdAt: new Date(Date.now() - 75 * 86400000),
      businessId: 'b4000000-0000-0000-0000-000000000004',
      businessName: 'New York Empire Urban Storage & Depot',
      paymentMethod: 'card',
      transactionId: 'TXN-882019',
    },
    {
      id: 'a4000000-0000-0000-0000-000000000042',
      customerId: 'c4000000-0000-0000-0000-000000000042',
      customerName: 'Gotham Gourmet Imports',
      clientName: 'Gotham Gourmet Imports',
      clientEmail: 'imports@gothamfood.com',
      rentalUnitId: 'd4000000-0000-0000-0000-000000000042',
      rentalUnitName: 'Wall Street Document Storage D-102',
      startDate: new Date(Date.now() - 50 * 86400000),
      endDate: new Date(Date.now() + 310 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 2160,
      createdAt: new Date(Date.now() - 50 * 86400000),
      businessId: 'b4000000-0000-0000-0000-000000000004',
      businessName: 'New York Empire Urban Storage & Depot',
      paymentMethod: 'card',
      transactionId: 'TXN-734190',
    },
    {
      id: 'a4000000-0000-0000-0000-000000000043',
      customerId: 'c4000000-0000-0000-0000-000000000043',
      customerName: 'Lexington Archival LLC',
      clientName: 'Lexington Archival LLC',
      clientEmail: 'records@lexingtonarchival.com',
      rentalUnitId: 'd4000000-0000-0000-0000-000000000044',
      rentalUnitName: 'Midtown Logistics Cage D-104',
      startDate: new Date(Date.now() - 5 * 86400000),
      endDate: new Date(Date.now() + 355 * 86400000),
      status: 'CONFIRMED',
      totalAmount: 7800,
      createdAt: new Date(Date.now() - 5 * 86400000),
      businessId: 'b4000000-0000-0000-0000-000000000004',
      businessName: 'New York Empire Urban Storage & Depot',
      paymentMethod: 'card',
      transactionId: 'TXN-109283',
    },
  ],
};

// In-memory runtime cache for dynamically created/updated bookings
// This is a module-level singleton — shared across all Next.js API route calls in the same process
const runtimeBookingsCache: Map<string, BookingRecord> = new Map();

// Export for direct access from API routes that need cross-context sharing
export function getRuntimeBookingsCache() {
  return runtimeBookingsCache;
}

export class BookingRepository {
  constructor(private readonly client: SupabaseClient) {}

  private mapToRecord(record: any): BookingRecord {
    const customerName = Array.isArray(record.customer)
      ? record.customer[0]?.name ?? ''
      : record.customer?.name ?? '';

    const rentalUnitName = Array.isArray(record.rentalUnit)
      ? record.rentalUnit[0]?.name ?? ''
      : record.rentalUnit?.name ?? '';

    return {
      id: record.id,
      customerId: record.customer_id,
      customerName: customerName || 'Client Tenant',
      clientName: customerName || 'Client Tenant',
      rentalUnitId: record.rental_unit_id,
      rentalUnitName: rentalUnitName || 'Storage Unit',
      startDate: new Date(record.start_date),
      endDate: new Date(record.end_date),
      status: record.status as BookingStatus,
      totalAmount: Number(record.total_amount),
      createdAt: new Date(record.created_at),
      businessId: record.business_id,
      businessName: record.business_id ? WAREHOUSE_NAMES[record.business_id] : undefined,
    };
  }

  async findAll(businessId?: string): Promise<BookingRecord[]> {
    let dbRecords: BookingRecord[] = [];
    const isAll = !businessId || businessId === 'all' || businessId === 'ALL';
    const targetBiz = isAll ? null : businessId;

    try {
      let query = this.client
        .from('bookings')
        .select(`
          id,
          customer_id,
          rental_unit_id,
          business_id,
          start_date,
          end_date,
          status,
          total_amount,
          created_at,
          customer:customers(name),
          rentalUnit:rental_units(name)
        `)
        .order('created_at', { ascending: false });

      if (targetBiz) {
        query = query.eq('business_id', targetBiz);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        dbRecords = data.map((record) => this.mapToRecord(record));
      }
    } catch {
      // Fallback below
    }

    // 1. Gather matching runtime cache entries (live client bookings)
    const allRuntime = Array.from(runtimeBookingsCache.values());
    const matchingRuntime = targetBiz
      ? allRuntime.filter((b) => !b.businessId || b.businessId === targetBiz)
      : allRuntime;

    // 2. Gather seeded warehouse bookings
    let seededList: BookingRecord[] = [];
    if (targetBiz) {
      seededList = SEEDED_WAREHOUSE_BOOKINGS[targetBiz] || [];
    } else {
      seededList = Object.values(SEEDED_WAREHOUSE_BOOKINGS).flat();
    }

    // 3. Merge cleanly: seeded -> DB records -> runtime cache (newest take priority)
    const combinedMap = new Map<string, BookingRecord>();

    for (const s of seededList) {
      combinedMap.set(s.id, s);
    }
    for (const d of dbRecords) {
      combinedMap.set(d.id, d);
    }
    for (const r of matchingRuntime) {
      combinedMap.set(r.id, r);
    }

    const merged = Array.from(combinedMap.values());

    // Sort descending by createdAt or startDate
    merged.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.startDate).getTime();
      const timeB = new Date(b.createdAt || b.startDate).getTime();
      return timeB - timeA;
    });

    return merged;
  }

  async findById(id: string): Promise<BookingRecord | null> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select(`
          id,
          customer_id,
          rental_unit_id,
          start_date,
          end_date,
          status,
          total_amount,
          created_at,
          customer:customers(name),
          rentalUnit:rental_units(name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return this.mapToRecord(data);
      }
    } catch {
      // Fallback below
    }

    if (runtimeBookingsCache.has(id)) {
      return runtimeBookingsCache.get(id)!;
    }

    for (const list of Object.values(SEEDED_WAREHOUSE_BOOKINGS)) {
      const found = list.find((b) => b.id === id);
      if (found) return found;
    }

    return null;
  }

  async findActiveByRentalUnitId(rentalUnitId: string, businessId?: string): Promise<BookingRecord[]> {
    const all = await this.findAll(businessId);
    return all.filter((b) => b.rentalUnitId === rentalUnitId && b.status !== 'CANCELLED');
  }

  async findByRentalUnitId(rentalUnitId: string, businessId?: string): Promise<BookingRecord[]> {
    return this.findActiveByRentalUnitId(rentalUnitId, businessId);
  }

  async create(input: {
    customerId: string;
    rentalUnitId: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    status: BookingStatus;
    businessId?: string;
    businessName?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    unitName?: string;
    paymentMethod?: string;
    transactionId?: string;
  }): Promise<BookingRecord> {
    const existingBookings = await this.findActiveByRentalUnitId(input.rentalUnitId, input.businessId);

    const newStart = (input.startDate instanceof Date ? input.startDate : new Date(input.startDate)).getTime();
    const newEnd = (input.endDate instanceof Date ? input.endDate : new Date(input.endDate)).getTime();

    const hasOverlap = existingBookings.some((booking) => {
      if (booking.status?.toUpperCase() === 'CANCELLED') return false;
      const existingStart = (booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate)).getTime();
      const existingEnd = (booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate)).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw new Error('This unit is already booked for part of this date range');
    }

    const resolvedBusinessName =
      input.businessName ||
      (input.businessId ? WAREHOUSE_NAMES[input.businessId] : undefined) ||
      'Associated Storage Co.';

    const clientDisplayName = input.clientName || 'Client Tenant';

    // Sync to customer repository so this client appears in business portal customer list
    if (input.clientName) {
      const custId = input.customerId || `c-${Date.now()}`;
      runtimeCustomersCache.set(custId, {
        id: custId,
        name: clientDisplayName,
        email: input.clientEmail || '',
        phone: input.clientPhone || '',
        address: 'Direct Online Tenant',
        status: 'ACTIVE',
        createdAt: new Date(),
      });
    }

    const payload: any = {
      customer_id: input.customerId,
      rental_unit_id: input.rentalUnitId,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      total_amount: input.totalAmount,
      status: input.status,
    };

    if (input.businessId) {
      payload.business_id = input.businessId;
    }

    let insertedId: string = `a${Date.now()}`;

    try {
      const { data: inserted, error: insertError } = await this.client
        .from('bookings')
        .insert(payload)
        .select('id')
        .single();

      if (!insertError && inserted?.id) {
        insertedId = inserted.id;
      }
    } catch {
      // fallback
    }

    const record: BookingRecord = {
      id: insertedId,
      customerId: input.customerId,
      customerName: clientDisplayName,
      clientName: clientDisplayName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      rentalUnitId: input.rentalUnitId,
      rentalUnitName: input.unitName || 'Storage Bay / Unit',
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      totalAmount: input.totalAmount,
      createdAt: new Date(),
      businessId: input.businessId,
      businessName: resolvedBusinessName,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId,
      isNew: true,
    };

    runtimeBookingsCache.set(insertedId, record);
    return record;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingRecord> {
    try {
      const { error: updateError } = await this.client
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (!updateError) {
        const record = await this.findById(id);
        if (record) return record;
      }
    } catch {
      // fallback
    }

    const existing = await this.findById(id);
    if (existing) {
      const updated: BookingRecord = { ...existing, status };
      runtimeBookingsCache.set(id, updated);
      return updated;
    }

    throw new Error('Failed to retrieve updated booking');
  }

  async listBookings(businessId?: string): Promise<BookingRecord[]> {
    return this.findAll(businessId);
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    return this.findById(id);
  }

  async createBooking(input: {
    customerId: string;
    rentalUnitId: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    status: BookingStatus;
    businessId?: string;
  }): Promise<BookingRecord> {
    return this.create(input);
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRecord> {
    return this.updateStatus(id, status);
  }
}

export const PrismaBookingRepository = BookingRepository;
export type PrismaBookingRepository = BookingRepository;
