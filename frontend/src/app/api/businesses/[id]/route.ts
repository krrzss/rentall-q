import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { BusinessRepository } from '@/server/repositories/businessRepository';

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // App-layer scoping: If not ADMIN and businessId is set, ensure they only access their own business
    if (ctx.role !== 'ADMIN' && ctx.businessId && ctx.businessId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const repo = new BusinessRepository(ctx.supabase);
    const business = await repo.findById(id);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch business' }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Only ADMIN or the business owner themselves can delete
    if (ctx.role !== 'ADMIN' && ctx.businessId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const repo = new BusinessRepository(ctx.supabase);
    await repo.delete(id);
    return NextResponse.json({ success: true, message: 'Business removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove business' }, { status: 500 });
  }
}
