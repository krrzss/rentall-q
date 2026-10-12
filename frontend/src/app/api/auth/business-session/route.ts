import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { warehouseId, warehouseName, warehouseEmail, role = 'BUSINESS_OWNER' } = body;

    const warehouseData = {
      id: warehouseId,
      name: warehouseName,
      email: warehouseEmail,
      role,
    };

    const response = NextResponse.json({
      success: true,
      warehouse: warehouseData,
    });

    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax' as const,
      httpOnly: false,
    };

    response.cookies.set('rentallq_active_warehouse', JSON.stringify(warehouseData), cookieOptions);
    response.cookies.set('rentallq_demo_session', role, cookieOptions);

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('rentallq_active_warehouse')?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, warehouse: null });
  }

  try {
    const warehouse = JSON.parse(cookie);
    return NextResponse.json({ success: true, warehouse });
  } catch {
    return NextResponse.json({ success: false, warehouse: null });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('rentallq_active_warehouse');
  response.cookies.delete('rentallq_demo_session');
  return response;
}
