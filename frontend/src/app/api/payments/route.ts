import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { ListPaymentsUseCase } from '@/server/use-cases/payments/list-payments.usecase';
import { CreatePaymentUseCase } from '@/server/use-cases/payments/create-payment.usecase';
import { PaymentRepository } from '@/server/repositories/paymentRepository';

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new PaymentRepository(ctx.supabase);
    const useCase = new ListPaymentsUseCase(repo);
    const payments = await useCase.execute(ctx.businessId ?? undefined);
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new PaymentRepository(ctx.supabase);
    const useCase = new CreatePaymentUseCase(repo);

    const payment = await useCase.execute({
      bookingId: body.bookingId,
      amount: Number(body.amount ?? 0),
      dueDate: new Date(body.dueDate),
      method: body.method,
      status: body.status,
      businessId: ctx.businessId ?? undefined,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 400 });
  }
}
