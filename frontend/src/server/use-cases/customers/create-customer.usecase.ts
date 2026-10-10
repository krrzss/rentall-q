import { CustomerRepository } from '@/server/repositories/customerRepository';
import { CustomerRecord, CreateCustomerInput } from './types';

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(input: CreateCustomerInput & { businessId?: string }): Promise<CustomerRecord> {
    if (!input.name || !input.name.trim()) {
      throw new Error('Customer name is required');
    }
    if (!input.email || !input.email.trim()) {
      throw new Error('Customer email is required');
    }

    return this.customerRepository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || '',
      address: input.address?.trim() || '',
      status: input.status || 'ACTIVE',
      businessId: input.businessId,
    });
  }
}
