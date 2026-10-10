import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/lib/supabaseServer';

export interface RegisterBusinessBody {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessType: 'self_storage' | 'warehouse' | 'hostel' | 'parking' | 'equipment';
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterBusinessBody = await request.json();
    const { name, email, password, businessName, businessType } = body;

    // Basic validation
    if (!email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Business Owner';
    const cleanBizName = businessName.trim();

    // Use the service-role / anon key server client.
    // For sign-up we use the anon key (Supabase auth.signUp works with anon key).
    // Profile + business writes happen server-side so the role is ALWAYS server-set.
    const supabase = createClient();

    // 1. Sign up the user via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: cleanName },
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Signup failed to initialize user.' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. Create the business record (server-side, no client influence over role)
    const { data: businessData, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name: cleanBizName,
        business_type: businessType,
        owner_profile_id: userId,
      })
      .select('id')
      .single();

    if (bizError) {
      console.error('[register-business] Error creating business:', bizError);
      // Attempt to clean up the orphaned auth user
      await supabase.auth.admin?.deleteUser(userId).catch(() => null);
      return NextResponse.json(
        { error: 'Failed to create business: ' + bizError.message },
        { status: 500 }
      );
    }

    // 3. Upsert the profile — role is ALWAYS BUSINESS_OWNER, never client-supplied
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: cleanName,
        role: 'BUSINESS_OWNER',          // hardcoded server-side, cannot be overridden
        business_id: businessData.id,
      });

    if (profileError) {
      console.error('[register-business] Error setting profile:', profileError);
      // Non-fatal: the user + business exist; the trigger/RLS will still enforce role
    }

    const hasSession = Boolean(authData.session);

    return NextResponse.json(
      {
        success: true,
        requiresEmailConfirmation: !hasSession,
        email: cleanEmail,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[register-business] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
