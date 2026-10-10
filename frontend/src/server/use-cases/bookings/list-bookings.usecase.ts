import { PrismaBookingRepository } from '@/server/repositories/bookingRepository';
import { BookingRecord } from '@/server/use-cases/bookings/types';

export class ListBookingsUseCase {
  constructor(private readonly bookingRepository: PrismaBookingRepository) {}

  async execute(businessId?: string): Promise<BookingRecord[]> {
    return this.bookingRepository.findAll(businessId);
  }
}
