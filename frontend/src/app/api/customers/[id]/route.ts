import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { GetCustomerByIdUseCase } from '@/server/use-cases/customers/get-customer.usecase';
import { UpdateCustomerUseCase } from '@/server/use-cases/customers/update-customer.usecase';
import { DeleteCustomerUseCase } from '@/server/use-cases/customers/delete-customer.usecase';
import { CustomerRepository } from '@/server/repositories/customerRepository';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new CustomerRepository(ctx.supabase);
    const useCase = new GetCustomerByIdUseCase(repo);
    const customer = await useCase.execute(params.id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new CustomerRepository(ctx.supabase);
    const useCase = new UpdateCustomerUseCase(repo);
    const customer = await useCase.execute(params.id, body);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update customer' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new CustomerRepository(ctx.supabase);
    const useCase = new DeleteCustomerUseCase(repo);
    await useCase.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete customer' }, { status: 400 });
  }
}
