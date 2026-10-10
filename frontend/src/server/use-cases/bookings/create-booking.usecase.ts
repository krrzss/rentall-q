import { PrismaBookingRepository } from '@/server/repositories/bookingRepository';
import { BookingRecord, CreateBookingInput } from '@/server/use-cases/bookings/types';

export class CreateBookingUseCase {
  constructor(private readonly bookingRepository: PrismaBookingRepository) {}

  async execute(input: CreateBookingInput & { businessId?: string }): Promise<BookingRecord> {
    if (!input.customerId || !input.rentalUnitId) {
      throw new Error('customerId and rentalUnitId are required');
    }

    if (input.endDate.getTime() <= input.startDate.getTime()) {
      throw new Error('endDate must be after startDate');
    }

    if (!Number.isFinite(input.totalAmount) || input.totalAmount < 0) {
      throw new Error('totalAmount must be a valid non-negative number');
    }

    let existingBookings: BookingRecord[] = [];
    if (typeof (this.bookingRepository as any).findActiveByRentalUnitId === 'function') {
      existingBookings = await (this.bookingRepository as any).findActiveByRentalUnitId(
        input.rentalUnitId,
        input.businessId
      );
    } else if (typeof (this.bookingRepository as any).findByRentalUnitId === 'function') {
      existingBookings = await (this.bookingRepository as any).findByRentalUnitId(
        input.rentalUnitId,
        input.businessId
      );
    } else if (typeof (this.bookingRepository as any).findAll === 'function') {
      const all = await this.bookingRepository.findAll(input.businessId);
      existingBookings = all.filter(
        (b) => b.rentalUnitId === input.rentalUnitId && b.status?.toUpperCase() !== 'CANCELLED'
      );
    }

    const newStart = (input.startDate instanceof Date ? input.startDate : new Date(input.startDate)).getTime();
    const newEnd = (input.endDate instanceof Date ? input.endDate : new Date(input.endDate)).getTime();

    const hasOverlap = existingBookings.some((booking) => {
      if (booking.rentalUnitId && booking.rentalUnitId !== input.rentalUnitId) return false;
      if (booking.status?.toUpperCase() === 'CANCELLED') return false;
      const existingStart = (booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate)).getTime();
      const existingEnd = (booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate)).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw new Error('This unit is already booked for part of this date range');
    }

    return this.bookingRepository.create({
      customerId: input.customerId,
      rentalUnitId: input.rentalUnitId,
      startDate: input.startDate,
      endDate: input.endDate,
      totalAmount: input.totalAmount,
      status: input.status ?? 'PENDING',
      businessId: input.businessId,
    });
  }
}
