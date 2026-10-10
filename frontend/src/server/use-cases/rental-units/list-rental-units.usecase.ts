import { RentalUnitRepository } from '@/server/repositories/rentalUnitRepository';
import { RentalUnitRecord } from './types';

export class ListRentalUnitsUseCase {
  constructor(private readonly rentalUnitRepository: RentalUnitRepository) {}

  async execute(businessId?: string): Promise<RentalUnitRecord[]> {
    return this.rentalUnitRepository.findAll(businessId);
  }
}
