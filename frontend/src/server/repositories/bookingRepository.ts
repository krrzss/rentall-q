import { BookingRecord, BookingStatus } from '@/server/use-cases/bookings/types';
import { SupabaseClient } from '@supabase/supabase-js';

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
      customerName,
      rentalUnitId: record.rental_unit_id,
      rentalUnitName,
      startDate: new Date(record.start_date),
      endDate: new Date(record.end_date),
      status: record.status as BookingStatus,
      totalAmount: Number(record.total_amount),
      createdAt: new Date(record.created_at),
    };
  }

  async findAll(businessId?: string): Promise<BookingRecord[]> {
    let query = this.client
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
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((record) => this.mapToRecord(record));
  }

  async findById(id: string): Promise<BookingRecord | null> {
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

    if (error) throw error;
    if (!data) return null;

    return this.mapToRecord(data);
  }

  async findActiveByRentalUnitId(rentalUnitId: string, businessId?: string): Promise<BookingRecord[]> {
    let query = this.client
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
      .eq('rental_unit_id', rentalUnitId)
      .neq('status', 'CANCELLED');

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((record) => this.mapToRecord(record));
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

    const { data: inserted, error: insertError } = await this.client
      .from('bookings')
      .insert(payload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    const record = await this.findById(inserted.id);
    if (!record) {
      throw new Error('Failed to retrieve newly created booking');
    }
    return record;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingRecord> {
    const { error: updateError } = await this.client
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    const record = await this.findById(id);
    if (!record) {
      throw new Error('Failed to retrieve updated booking');
    }
    return record;
  }

  // Signature aliases for seamless compatibility
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
