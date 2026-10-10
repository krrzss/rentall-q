import { NextResponse } from 'next/server';
import { getAuthContext } from '@/server/lib/getAuthContext';
import { BusinessRepository } from '@/server/repositories/businessRepository';

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const repo = new BusinessRepository(ctx.supabase);
    const businesses = await repo.findAll(ctx.businessId ?? undefined);
    return NextResponse.json(businesses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch businesses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const body = await request.json();
    const repo = new BusinessRepository(ctx.supabase);

    const business = await repo.create({
      name: body.name,
      businessType: body.businessType || 'self_storage',
      ownerProfileId: body.ownerProfileId || ctx.userId,
    });
    return NextResponse.json(business, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create business' }, { status: 400 });
  }
}
