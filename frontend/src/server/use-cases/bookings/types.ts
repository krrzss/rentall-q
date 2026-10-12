export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BookingRecord {
  id: string;
  customerId: string;
  customerName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  rentalUnitId: string;
  rentalUnitName?: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  totalAmount: number;
  createdAt: Date;
  businessId?: string;
  businessName?: string;
  paymentMethod?: string;
  transactionId?: string;
  isNew?: boolean;
}

export interface CreateBookingInput {
  customerId: string;
  rentalUnitId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status?: BookingStatus;
  businessId?: string;
  businessName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  unitName?: string;
  paymentMethod?: string;
  transactionId?: string;
}
