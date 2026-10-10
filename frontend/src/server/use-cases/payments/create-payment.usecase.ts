import { PaymentRepository } from '@/server/repositories/paymentRepository';
import { PaymentRecord, CreatePaymentInput } from './types';

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: CreatePaymentInput & { businessId?: string }): Promise<PaymentRecord> {
    if (!input.bookingId) {
      throw new Error('bookingId is required');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('amount must be a positive number');
    }
    if (!input.dueDate) {
      throw new Error('dueDate is required');
    }
    if (!input.method) {
      throw new Error('payment method is required');
    }

    return this.paymentRepository.create({
      bookingId: input.bookingId,
      amount: input.amount,
      dueDate: input.dueDate,
      method: input.method,
      status: input.status || 'PENDING',
      businessId: input.businessId,
    });
  }
}
