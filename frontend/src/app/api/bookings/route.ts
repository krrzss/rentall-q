import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { createClient } from '@/server/lib/supabaseServer';
import { ListBookingsUseCase } from '@/server/use-cases/bookings/list-bookings.usecase';
import { CreateBookingUseCase } from '@/server/use-cases/bookings/create-booking.usecase';
import { BookingRepository, WAREHOUSE_NAMES } from '@/server/repositories/bookingRepository';

export async function GET(request: Request) {
  let ctx: any = await getAuthContext();
  let supabase = ctx instanceof NextResponse ? createClient() : ctx.supabase;
  let authBizId = ctx instanceof NextResponse ? undefined : ctx.businessId;

  try {
    const { searchParams } = new URL(request.url);
    const requestedBizId = searchParams.get('businessId');

    let targetBusinessId: string | undefined = undefined;

    if (requestedBizId === 'all' || requestedBizId === 'ALL') {
      targetBusinessId = undefined; // Return all across companies
    } else if (requestedBizId) {
      targetBusinessId = requestedBizId;
    } else if (authBizId) {
      targetBusinessId = authBizId;
    }

    const repo = new BookingRepository(supabase);
    const useCase = new ListBookingsUseCase(repo);
    const bookings = await useCase.execute(targetBusinessId);
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let ctx: any = await getAuthContext();
  let supabase = ctx instanceof NextResponse ? createClient() : ctx.supabase;
  let userId = ctx instanceof NextResponse ? `client-${Date.now()}` : ctx.userId;
  let authBizId = ctx instanceof NextResponse ? undefined : ctx.businessId;

  try {
    const body = await request.json();
    const repo = new BookingRepository(supabase);
    const useCase = new CreateBookingUseCase(repo);

    // Accept both field naming conventions:
    // - storage-spaces page sends: unitId, amount, unitName, businessId, businessName, clientName
    // - booking form sends: rentalUnitId, totalAmount, customerId
    const rentalUnitId = body.rentalUnitId || body.unitId || `unit-${Date.now()}`;
    const totalAmount = Number(body.totalAmount ?? body.amount ?? 0);
    const customerId = body.customerId || userId;
    const unitName = body.unitName || body.rentalUnitName || 'Storage Space';
    const paymentMethod = body.paymentMethod || 'card';
    const transactionId = body.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const clientName = body.clientName || 'Client Tenant';
    const clientEmail = body.clientEmail || null;
    const clientPhone = body.clientPhone || null;

    // Use businessId from body (client chooses company) or fall back to auth context
    const targetBusinessId = body.businessId || authBizId || 'b1000000-0000-0000-0000-000000000001';
    const resolvedBusinessName =
      body.businessName ||
      (targetBusinessId ? WAREHOUSE_NAMES[targetBusinessId] : undefined) ||
      'Associated Storage Co.';

    const booking = await (repo as any).create({
      customerId,
      rentalUnitId,
      startDate: new Date(body.startDate || Date.now()),
      endDate: new Date(body.endDate || Date.now() + 30 * 86400000),
      totalAmount,
      status: body.status || 'CONFIRMED',
      businessId: targetBusinessId,
      businessName: resolvedBusinessName,
      unitName,
      clientName,
      clientEmail,
      clientPhone,
      paymentMethod,
      transactionId,
    });

    // Return enriched record so caller can render immediately
    return NextResponse.json(
      {
        ...booking,
        rentalUnitName: booking.rentalUnitName || unitName,
        customerName: booking.customerName || clientName,
        clientName,
        clientEmail,
        clientPhone,
        paymentMethod,
        transactionId,
        businessId: targetBusinessId,
        businessName: resolvedBusinessName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 400 });
  }
}
