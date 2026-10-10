import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { ListRentalUnitsUseCase } from '@/server/use-cases/rental-units/list-rental-units.usecase';
import { CreateRentalUnitUseCase } from '@/server/use-cases/rental-units/create-rental-unit.usecase';
import { RentalUnitRepository } from '@/server/repositories/rentalUnitRepository';

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new RentalUnitRepository(ctx.supabase);
    const useCase = new ListRentalUnitsUseCase(repo);
    const units = await useCase.execute(ctx.businessId ?? undefined);
    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch rental units' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new RentalUnitRepository(ctx.supabase);
    const useCase = new CreateRentalUnitUseCase(repo);

    const unit = await useCase.execute({
      name: body.name,
      type: body.type,
      description: body.description,
      basePrice: Number(body.basePrice ?? 0),
      status: body.status,
      businessId: ctx.businessId ?? undefined,
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create rental unit' }, { status: 400 });
  }
}
