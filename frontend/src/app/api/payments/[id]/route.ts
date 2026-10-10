import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { GetPaymentByIdUseCase } from '@/server/use-cases/payments/get-payment.usecase';
import { UpdatePaymentStatusUseCase } from '@/server/use-cases/payments/update-payment-status.usecase';
import { DeletePaymentUseCase } from '@/server/use-cases/payments/delete-payment.usecase';
import { PaymentRepository } from '@/server/repositories/paymentRepository';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new PaymentRepository(ctx.supabase);
    const useCase = new GetPaymentByIdUseCase(repo);
    const payment = await useCase.execute(params.id);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new PaymentRepository(ctx.supabase);
    const useCase = new UpdatePaymentStatusUseCase(repo);
    const payment = await useCase.execute(params.id, body.status);
    return NextResponse.json(payment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update payment status' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new PaymentRepository(ctx.supabase);
    const useCase = new DeletePaymentUseCase(repo);
    await useCase.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete payment' }, { status: 400 });
  }
}
