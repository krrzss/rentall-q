import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { GetRentalUnitByIdUseCase } from '@/server/use-cases/rental-units/get-rental-unit.usecase';
import { UpdateRentalUnitUseCase } from '@/server/use-cases/rental-units/update-rental-unit.usecase';
import { DeleteRentalUnitUseCase } from '@/server/use-cases/rental-units/delete-rental-unit.usecase';
import { RentalUnitRepository } from '@/server/repositories/rentalUnitRepository';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new RentalUnitRepository(ctx.supabase);
    const useCase = new GetRentalUnitByIdUseCase(repo);
    const unit = await useCase.execute(params.id);

    if (!unit) {
      return NextResponse.json({ error: 'Rental unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch rental unit' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new RentalUnitRepository(ctx.supabase);
    const useCase = new UpdateRentalUnitUseCase(repo);
    const unit = await useCase.execute(params.id, body);
    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update rental unit' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new RentalUnitRepository(ctx.supabase);
    const useCase = new DeleteRentalUnitUseCase(repo);
    await useCase.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete rental unit' }, { status: 400 });
  }
}
