import { RentalUnitRepository } from '@/server/repositories/rentalUnitRepository';
import { RentalUnitRecord, CreateRentalUnitInput } from './types';

export class CreateRentalUnitUseCase {
  constructor(private readonly rentalUnitRepository: RentalUnitRepository) {}

  async execute(input: CreateRentalUnitInput & { businessId?: string }): Promise<RentalUnitRecord> {
    if (!input.name || !input.name.trim()) {
      throw new Error('Rental unit name is required');
    }
    if (!input.type || !input.type.trim()) {
      throw new Error('Rental unit type is required');
    }
    if (!Number.isFinite(input.basePrice) || input.basePrice < 0) {
      throw new Error('basePrice must be a non-negative number');
    }

    return this.rentalUnitRepository.create({
      name: input.name.trim(),
      type: input.type.trim(),
      description: input.description?.trim() || '',
      basePrice: input.basePrice,
      status: input.status || 'AVAILABLE',
      businessId: input.businessId,
    });
  }
}
