-- ============================================================================
-- RentAll-Q Multi-Tenancy Database Migration
-- Supporting 3 Primary Roles: CLIENT, BUSINESS_OWNER, ADMIN
-- (Also supports MANAGER and STAFF for business portal delegations)
-- Idempotent: Works on fresh or existing Supabase projects.
-- ============================================================================

-- 1. Create businesses table if not exists
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('self_storage', 'warehouse', 'hostel', 'parking', 'equipment')),
  owner_profile_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create profiles table if not exists (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if profiles table pre-existed with different columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'CLIENT';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Add check constraint to profiles role
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('CLIENT', 'BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Create or ensure entity tables exist with business_id foreign key

-- (a) rental_units
CREATE TABLE IF NOT EXISTS public.rental_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'AVAILABLE',
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rental_units' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE public.rental_units ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- (b) customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'ACTIVE',
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- (c) bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  rental_unit_id UUID REFERENCES public.rental_units(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'CONFIRMED',
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- (d) payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  method TEXT DEFAULT 'CREDIT_CARD',
  status TEXT DEFAULT 'PENDING',
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Automatic profile generation on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth.users into profiles if missing
INSERT INTO public.profiles (id, name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', ''),
  COALESCE(raw_user_meta_data->>'role', 'CLIENT')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Create default business & backfill existing rows
DO $$
DECLARE
  default_biz_id UUID;
BEGIN
  -- Insert or fetch default business
  SELECT id INTO default_biz_id FROM public.businesses WHERE name = 'Default Business' LIMIT 1;
  
  IF default_biz_id IS NULL THEN
    INSERT INTO public.businesses (name, business_type)
    VALUES ('Default Business', 'self_storage')
    RETURNING id INTO default_biz_id;
  END IF;

  -- Backfill business_id ONLY for business operator roles (BUSINESS_OWNER, MANAGER, STAFF)
  -- CLIENT profiles are deliberately NOT backfilled with a business_id:
  -- their relationship to a business is established via customer records.
  UPDATE public.profiles 
  SET business_id = default_biz_id 
  WHERE business_id IS NULL 
    AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF');

  -- If any CLIENT profiles had a business_id erroneously assigned, clear it
  UPDATE public.profiles
  SET business_id = NULL
  WHERE role = 'CLIENT' AND business_id IS NOT NULL;

  -- Backfill entities with default business_id if missing
  UPDATE public.rental_units SET business_id = default_biz_id WHERE business_id IS NULL;
  UPDATE public.bookings SET business_id = default_biz_id WHERE business_id IS NULL;
  UPDATE public.payments SET business_id = default_biz_id WHERE business_id IS NULL;
  UPDATE public.customers SET business_id = default_biz_id WHERE business_id IS NULL;
END $$;

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Businesses Policies
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access to businesses" ON public.businesses;
CREATE POLICY "Admin full access to businesses" ON public.businesses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Owners access their own business" ON public.businesses;
CREATE POLICY "Owners access their own business" ON public.businesses
  FOR ALL USING (
    owner_profile_id = auth.uid() OR
    id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    )
  );

-- ============================================================================
-- Profiles Policies — Split & Protected against role/business_id self-escalation
-- ============================================================================

-- (a) SELECT: a user may always read their own profile row
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- (b) UPDATE: a user may update ONLY their own non-sensitive columns (e.g. name).
--     The trigger below enforces that role and business_id cannot be changed
--     by the user themselves; only ADMINs or service role can do so.
DROP POLICY IF EXISTS "Users can update own profile (name only)" ON public.profiles;
CREATE POLICY "Users can update own profile (name only)" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- (c) Remove legacy open policy if present
DROP POLICY IF EXISTS "Users can read/update own profile" ON public.profiles;

-- Helper function to check if current user is admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- (d) Admin full access to all profiles (uses security definer function to avoid recursion)
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Admin full access to profiles" ON public.profiles
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================================
-- Trigger: prevent a user from changing their own role or business_id.
-- Admins and service-role calls are exempted so server-side code can set fields.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_and_business_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow changes made via the service role (server-side API routes)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If the requesting user is an ADMIN, allow all changes
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  ) THEN
    RETURN NEW;
  END IF;

  -- Block any attempt to change role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You are not permitted to change your own role.';
  END IF;

  -- Block any attempt to change business_id
  IF NEW.business_id IS DISTINCT FROM OLD.business_id THEN
    RAISE EXCEPTION 'You are not permitted to change your own business_id.';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS trg_prevent_role_business_self_update ON public.profiles;
CREATE TRIGGER trg_prevent_role_business_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_and_business_self_update();

-- ============================================================================
-- Entity Tables Policies (Rental Units, Customers, Bookings, Payments)
-- ============================================================================

-- Rental Units
DROP POLICY IF EXISTS "Business Owner rental units policy" ON public.rental_units;
CREATE POLICY "Business Owner rental units policy" ON public.rental_units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    )
  );

-- Customers
DROP POLICY IF EXISTS "Business Owner clients policy" ON public.customers;
CREATE POLICY "Business Owner clients policy" ON public.customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    )
    OR
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT')
      AND
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Bookings
-- business_id matching applies ONLY to BUSINESS_OWNER, MANAGER, STAFF, and ADMIN.
-- Clients match ONLY through the narrower "my own record" clause (customer_id).
DROP POLICY IF EXISTS "Multi-tenant bookings policy" ON public.bookings;
CREATE POLICY "Multi-tenant bookings policy" ON public.bookings
  FOR ALL USING (
    -- Admin global access
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    OR
    -- Business operators match via business_id (strictly for business staff & admin roles)
    (
      business_id = (
        SELECT business_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
      )
    )
    OR
    -- Clients match ONLY through their own customer record (never via profiles.business_id)
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT')
      AND
      customer_id IN (
        SELECT id FROM public.customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Payments
-- business_id matching applies ONLY to BUSINESS_OWNER, MANAGER, STAFF, and ADMIN.
-- Clients match ONLY through the narrower "my own record" clause (booking -> customer).
DROP POLICY IF EXISTS "Multi-tenant payments policy" ON public.payments;
CREATE POLICY "Multi-tenant payments policy" ON public.payments
  FOR ALL USING (
    -- Admin global access
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    OR
    -- Business operators match via business_id (strictly for business staff & admin roles)
    (
      business_id = (
        SELECT business_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
      )
    )
    OR
    -- Clients match ONLY through their own booking records
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT')
      AND
      booking_id IN (
        SELECT id FROM public.bookings WHERE customer_id IN (
          SELECT id FROM public.customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
      )
    )
  );
