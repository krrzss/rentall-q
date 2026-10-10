import { SupabaseClient } from '@supabase/supabase-js';

export interface BusinessRecord {
  id: string;
  name: string;
  businessType: 'self_storage' | 'warehouse' | 'hostel' | 'parking' | 'equipment';
  ownerProfileId?: string;
  createdAt: Date;
}

export interface CreateBusinessInput {
  name: string;
  businessType: 'self_storage' | 'warehouse' | 'hostel' | 'parking' | 'equipment';
  ownerProfileId?: string;
}

export class BusinessRepository {
  constructor(private readonly client: SupabaseClient) {}

  private mapToRecord(data: any): BusinessRecord {
    return {
      id: data.id,
      name: data.name,
      businessType: data.business_type || 'self_storage',
      ownerProfileId: data.owner_profile_id || undefined,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }

  async findAll(businessId?: string): Promise<BusinessRecord[]> {
    let query = this.client
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
    return (data || []).map((b) => this.mapToRecord(b));
  }

  async findById(id: string): Promise<BusinessRecord | null> {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.mapToRecord(data);
  }

  async create(input: CreateBusinessInput): Promise<BusinessRecord> {
    const { data: inserted, error } = await this.client
      .from('businesses')
      .insert({
        name: input.name,
        business_type: input.businessType,
        owner_profile_id: input.ownerProfileId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating business:', error);
      throw error;
    }
    return this.mapToRecord(inserted);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
    return true;
  }
}
