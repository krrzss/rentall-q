import {
  RentalUnitRecord,
  RentalUnitStatus,
  CreateRentalUnitInput,
  UpdateRentalUnitInput,
} from '@/server/use-cases/rental-units/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class RentalUnitRepository {
  constructor(private readonly client: SupabaseClient) {}

  private mapToRecord(record: any): RentalUnitRecord {
    const rawStatus = record.status;
    let status: RentalUnitStatus = 'AVAILABLE';

    if (rawStatus && ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'].includes(rawStatus)) {
      status = rawStatus as RentalUnitStatus;
    } else if (record.is_available === false) {
      status = 'UNAVAILABLE';
    }

    return {
      id: record.id,
      name: record.name || record.title || 'Unnamed Unit',
      type: record.type || record.unit_type || 'Apartment',
      description: record.description || record.address || '',
      basePrice: Number(record.base_price ?? record.daily_rate ?? 0),
      status,
      createdAt: record.created_at ? new Date(record.created_at) : new Date(),
    };
  }

  async findAll(businessId?: string): Promise<RentalUnitRecord[]> {
    let query = this.client
      .from('rental_units')
      .select('*')
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rental units from Supabase:', error);
      throw error;
    }
    return (data || []).map((record) => this.mapToRecord(record));
  }

  async findById(id: string): Promise<RentalUnitRecord | null> {
    const { data, error } = await this.client
      .from('rental_units')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.mapToRecord(data);
  }

  async create(input: CreateRentalUnitInput & { businessId?: string }): Promise<RentalUnitRecord> {
    const payload: any = {
      name: input.name,
      type: input.type,
      description: input.description || '',
      base_price: input.basePrice,
      status: input.status || 'AVAILABLE',
    };

    if (input.businessId) {
      payload.business_id = input.businessId;
    }

    const { data: inserted, error: insertError } = await this.client
      .from('rental_units')
      .insert(payload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    const record = await this.findById(inserted.id);
    if (!record) {
      throw new Error('Failed to retrieve newly created rental unit');
    }
    return record;
  }

  async update(id: string, input: UpdateRentalUnitInput): Promise<RentalUnitRecord> {
    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.type !== undefined) payload.type = input.type;
    if (input.description !== undefined) payload.description = input.description;
    if (input.basePrice !== undefined) payload.base_price = input.basePrice;
    if (input.status !== undefined) payload.status = input.status;

    const { error: updateError } = await this.client
      .from('rental_units')
      .update(payload)
      .eq('id', id);

    if (updateError) throw updateError;

    const record = await this.findById(id);
    if (!record) {
      throw new Error('Failed to retrieve updated rental unit');
    }
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('rental_units')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Alias methods for compatibility
  async listRentalUnits(businessId?: string): Promise<RentalUnitRecord[]> {
    return this.findAll(businessId);
  }

  async getRentalUnitById(id: string): Promise<RentalUnitRecord | null> {
    return this.findById(id);
  }

  async createRentalUnit(input: CreateRentalUnitInput & { businessId?: string }): Promise<RentalUnitRecord> {
    return this.create(input);
  }

  async updateRentalUnit(id: string, input: UpdateRentalUnitInput): Promise<RentalUnitRecord> {
    return this.update(id, input);
  }

  async deleteRentalUnit(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export const PrismaRentalUnitRepository = RentalUnitRepository;
export type PrismaRentalUnitRepository = RentalUnitRepository;
