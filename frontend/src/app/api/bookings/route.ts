import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { ListBookingsUseCase } from '@/server/use-cases/bookings/list-bookings.usecase';
import { CreateBookingUseCase } from '@/server/use-cases/bookings/create-booking.usecase';
import { BookingRepository } from '@/server/repositories/bookingRepository';

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new BookingRepository(ctx.supabase);
    const useCase = new ListBookingsUseCase(repo);
    const bookings = await useCase.execute(ctx.businessId ?? undefined);
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new BookingRepository(ctx.supabase);
    const useCase = new CreateBookingUseCase(repo);

    const booking = await useCase.execute({
      customerId: body.customerId,
      rentalUnitId: body.rentalUnitId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      totalAmount: Number(body.totalAmount ?? 0),
      status: body.status,
      businessId: ctx.businessId ?? undefined,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 400 });
  }
}
