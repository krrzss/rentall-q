import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { GetBookingByIdUseCase } from '@/server/use-cases/bookings/get-booking.usecase';
import { UpdateBookingStatusUseCase } from '@/server/use-cases/bookings/update-booking-status.usecase';
import { BookingRepository } from '@/server/repositories/bookingRepository';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new BookingRepository(ctx.supabase);
    const useCase = new GetBookingByIdUseCase(repo);
    const booking = await useCase.execute(params.id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new BookingRepository(ctx.supabase);
    const useCase = new UpdateBookingStatusUseCase(repo);
    const booking = await useCase.execute(params.id, body.status);
    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 400 });
  }
}
