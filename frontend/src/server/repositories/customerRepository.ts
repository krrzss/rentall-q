import { CustomerRecord, CustomerStatus, CreateCustomerInput, UpdateCustomerInput } from '@/server/use-cases/customers/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class CustomerRepository {
  constructor(private readonly client: SupabaseClient) {}

  private mapToRecord(record: any): CustomerRecord {
    return {
      id: record.id,
      name: record.name || record.full_name || 'Unnamed Client',
      email: record.email || '',
      phone: record.phone || '',
      address: record.address || '',
      status: (record.status as CustomerStatus) || (record.is_active === false ? 'INACTIVE' : 'ACTIVE'),
      createdAt: record.created_at ? new Date(record.created_at) : new Date(),
    };
  }

  async findAll(businessId?: string): Promise<CustomerRecord[]> {
    let query = this.client
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers from Supabase:', error);
      throw error;
    }
    return (data || []).map((record) => this.mapToRecord(record));
  }

  async findById(id: string): Promise<CustomerRecord | null> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.mapToRecord(data);
  }

  async create(input: CreateCustomerInput & { businessId?: string }): Promise<CustomerRecord> {
    const payload: any = {
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      address: input.address || '',
      status: input.status || 'ACTIVE',
    };

    if (input.businessId) {
      payload.business_id = input.businessId;
    }

    const { data: inserted, error: insertError } = await this.client
      .from('customers')
      .insert(payload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    const record = await this.findById(inserted.id);
    if (!record) {
      throw new Error('Failed to retrieve newly created customer');
    }
    return record;
  }

  async update(id: string, input: UpdateCustomerInput): Promise<CustomerRecord> {
    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.email !== undefined) payload.email = input.email;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.address !== undefined) payload.address = input.address;
    if (input.status !== undefined) payload.status = input.status;

    const { error: updateError } = await this.client
      .from('customers')
      .update(payload)
      .eq('id', id);

    if (updateError) throw updateError;

    const record = await this.findById(id);
    if (!record) {
      throw new Error('Failed to retrieve updated customer');
    }
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Alias methods for compatibility
  async listCustomers(businessId?: string): Promise<CustomerRecord[]> {
    return this.findAll(businessId);
  }

  async getCustomerById(id: string): Promise<CustomerRecord | null> {
    return this.findById(id);
  }

  async createCustomer(input: CreateCustomerInput & { businessId?: string }): Promise<CustomerRecord> {
    return this.create(input);
  }

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerRecord> {
    return this.update(id, input);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export const PrismaCustomerRepository = CustomerRepository;
export type PrismaCustomerRepository = CustomerRepository;
