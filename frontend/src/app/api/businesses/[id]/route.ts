import { NextResponse } from 'next/server';
import { BusinessRepository } from '@/server/repositories/businessRepository';

const businessRepository = new BusinessRepository();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    await businessRepository.delete(id);
    return NextResponse.json({ success: true, message: 'Business owner removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove business' }, { status: 500 });
  }
}
