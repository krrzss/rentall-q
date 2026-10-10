import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { ListCustomersUseCase } from '@/server/use-cases/customers/list-customers.usecase';
import { CreateCustomerUseCase } from '@/server/use-cases/customers/create-customer.usecase';
import { CustomerRepository } from '@/server/repositories/customerRepository';

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new CustomerRepository(ctx.supabase);
    const useCase = new ListCustomersUseCase(repo);
    const customers = await useCase.execute(ctx.businessId ?? undefined);
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new CustomerRepository(ctx.supabase);
    const useCase = new CreateCustomerUseCase(repo);

    const customer = await useCase.execute({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      status: body.status,
      businessId: ctx.businessId ?? undefined,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 400 });
  }
}
