import { NextResponse } from 'next/server';
import { createClient } from '@/server/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'CLIENT' | 'BUSINESS_OWNER' | 'MANAGER' | 'STAFF' | 'ADMIN';

export interface AuthContext {
  supabase: SupabaseClient;
  userId: string;
  role: UserRole;
  /** null for ADMINs (they see all data) */
  businessId: string | null;
}

/**
 * Resolves the authenticated user and their profile from the per-request
 * Supabase server client.  Returns a 401 NextResponse if unauthenticated.
 *
 * Usage in an API route:
 *   const result = await getAuthContext();
 *   if (result instanceof NextResponse) return result;   // 401
 *   const { supabase, userId, role, businessId } = result;
 */
export async function getAuthContext(): Promise<AuthContext | NextResponse> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. A valid session is required.' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role ?? 'CLIENT') as UserRole;
  // ADMINs bypass business scoping (business_id = null → no filter applied)
  const businessId = role === 'ADMIN' ? null : (profile?.business_id ?? null);

  return { supabase, userId: user.id, role, businessId };
}
