import { BookingEntity, BookingStatus } from '../../domain/entities/booking.entity';
import { IBookingRepository } from '../../interfaces/repositories/booking.repository.interface';
import { DomainException } from '../../domain/exceptions/domain.exception';

export interface CreateBookingDTO {
  customerId: string;
  rentalUnitId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
}

export class CreateBookingUseCase {
  constructor(private bookingRepo: IBookingRepository) {}

  async execute(dto: CreateBookingDTO): Promise<BookingEntity> {
    const existingBookings = await this.bookingRepo.findByUnit(dto.rentalUnitId);
    const newStart = (dto.startDate instanceof Date ? dto.startDate : new Date(dto.startDate)).getTime();
    const newEnd = (dto.endDate instanceof Date ? dto.endDate : new Date(dto.endDate)).getTime();

    const hasOverlap = existingBookings.some((booking) => {
      if (booking.status?.toUpperCase() === 'CANCELLED') return false;
      const existingStart = (booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate)).getTime();
      const existingEnd = (booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate)).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw new DomainException('This unit is already booked for part of this date range');
    }

    const booking = new BookingEntity({
      customerId: dto.customerId,
      rentalUnitId: dto.rentalUnitId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalAmount: dto.totalAmount,
      status: 'PENDING',
    });

    return await this.bookingRepo.save(booking);
  }
}
