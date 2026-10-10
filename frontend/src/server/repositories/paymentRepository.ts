import {
  PaymentRecord,
  PaymentStatus,
  PaymentMethod,
  CreatePaymentInput,
} from '@/server/use-cases/payments/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class PaymentRepository {
  constructor(private readonly client: SupabaseClient) {}

  private mapToRecord(record: any): PaymentRecord {
    const booking = Array.isArray(record.booking) ? record.booking[0] : record.booking;
    const customer = booking?.customer ? (Array.isArray(booking.customer) ? booking.customer[0] : booking.customer) : null;
    const unit = booking?.rentalUnit ? (Array.isArray(booking.rentalUnit) ? booking.rentalUnit[0] : booking.rentalUnit) : null;

    return {
      id: record.id,
      bookingId: record.booking_id,
      bookingCustomerName: customer?.name || customer?.full_name || '',
      bookingUnitName: unit?.name || unit?.title || '',
      amount: Number(record.amount),
      dueDate: record.due_date ? new Date(record.due_date) : new Date(),
      method: (record.method as PaymentMethod) || 'CREDIT_CARD',
      status: (record.status as PaymentStatus) || 'PENDING',
      createdAt: record.created_at ? new Date(record.created_at) : new Date(),
    };
  }

  async findAll(businessId?: string): Promise<PaymentRecord[]> {
    let query = this.client
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        due_date,
        method,
        status,
        created_at,
        booking:bookings(
          id,
          customer:customers(name),
          rentalUnit:rental_units(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payments from Supabase:', error);
      throw error;
    }
    return (data || []).map((record) => this.mapToRecord(record));
  }

  async findById(id: string): Promise<PaymentRecord | null> {
    const { data, error } = await this.client
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        due_date,
        method,
        status,
        created_at,
        booking:bookings(
          id,
          customer:customers(name),
          rentalUnit:rental_units(name)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.mapToRecord(data);
  }

  async create(input: CreatePaymentInput & { businessId?: string }): Promise<PaymentRecord> {
    const payload: any = {
      booking_id: input.bookingId,
      amount: input.amount,
      due_date: input.dueDate.toISOString(),
      method: input.method,
      status: input.status || 'PENDING',
    };

    if (input.businessId) {
      payload.business_id = input.businessId;
    }

    const { data: inserted, error: insertError } = await this.client
      .from('payments')
      .insert(payload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    const record = await this.findById(inserted.id);
    if (!record) {
      throw new Error('Failed to retrieve newly created payment');
    }
    return record;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentRecord> {
    const { error: updateError } = await this.client
      .from('payments')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    const record = await this.findById(id);
    if (!record) {
      throw new Error('Failed to retrieve updated payment');
    }
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Signature aliases
  async listPayments(businessId?: string): Promise<PaymentRecord[]> {
    return this.findAll(businessId);
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return this.findById(id);
  }

  async createPayment(input: CreatePaymentInput & { businessId?: string }): Promise<PaymentRecord> {
    return this.create(input);
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentRecord> {
    return this.updateStatus(id, status);
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export const PrismaPaymentRepository = PaymentRepository;
export type PrismaPaymentRepository = PaymentRepository;
