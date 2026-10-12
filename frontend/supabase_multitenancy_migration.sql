-- ============================================================================
-- RentAll-Q Master Database Schema & Realtime Seed Data
-- ============================================================================
-- Complete schema for fresh or existing Supabase project.
-- Contains:
--  1. Tables (businesses, profiles, rental_units, customers, bookings, payments, contact_submissions)
--  2. Constraints, Foreign Keys, Indexes
--  3. Automated profile & customer sync trigger on auth.users (Google OAuth & Email)
--  4. Row-Level Security (RLS) policies for CLIENT, BUSINESS_OWNER, MANAGER, STAFF, ADMIN
--  5. Supabase Realtime Publication configuration
--  6. Rich, interconnected production seed data for immediate realtime testing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 2. CORE TABLES
-- ----------------------------------------------------------------------------

-- (a) businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('self_storage', 'warehouse', 'hostel', 'parking', 'equipment')),
  owner_profile_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- (b) profiles (tied to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- (c) rental_units
CREATE TABLE IF NOT EXISTS public.rental_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- (d) customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- (e) bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  rental_unit_id UUID REFERENCES public.rental_units(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- (f) payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  method TEXT DEFAULT 'CREDIT_CARD' CHECK (method IN ('CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'UPI', 'STRIPE')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- (g) contact_submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  city TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON public.profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_rental_units_business_id ON public.rental_units(business_id);
CREATE INDEX IF NOT EXISTS idx_rental_units_status ON public.rental_units(status);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON public.bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_id ON public.bookings(rental_unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

-- ----------------------------------------------------------------------------
-- 4. AUTOMATED USER & CUSTOMER TRIGGER (Google OAuth & Auth Signups)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_biz_id UUID;
  user_email TEXT;
  user_name TEXT;
  user_role TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(user_email, '@', 1),
    'User'
  );
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT');

  -- Insert profile
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, user_name, user_role)
  ON CONFLICT (id) DO UPDATE
  SET 
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = now();

  -- If this is a Client and has an email, connect them to a customer record
  IF user_role = 'CLIENT' AND user_email IS NOT NULL THEN
    SELECT id INTO first_biz_id FROM public.businesses ORDER BY created_at ASC LIMIT 1;
    IF first_biz_id IS NOT NULL THEN
      -- If customer already exists with this email, update their name
      UPDATE public.customers
      SET name = user_name
      WHERE email = user_email;

      -- If no customer exists, insert one
      IF NOT FOUND THEN
        INSERT INTO public.customers (name, email, phone, address, status, business_id)
        VALUES (user_name, user_email, '+1 (555) 019-2834', 'Client Address', 'ACTIVE', first_biz_id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- (a) Businesses Policies
DROP POLICY IF EXISTS "Public and authenticated can read businesses" ON public.businesses;
CREATE POLICY "Public and authenticated can read businesses" ON public.businesses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to businesses" ON public.businesses;
CREATE POLICY "Admin full access to businesses" ON public.businesses
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Owners manage their business" ON public.businesses;
CREATE POLICY "Owners manage their business" ON public.businesses
  FOR ALL USING (
    owner_profile_id = auth.uid() OR
    id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    )
  );

-- (b) Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile (name only)" ON public.profiles;
CREATE POLICY "Users can update own profile (name only)" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Admin full access to profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- (c) Rental Units Policies
DROP POLICY IF EXISTS "Anyone authenticated can view rental units" ON public.rental_units;
CREATE POLICY "Anyone authenticated can view rental units" ON public.rental_units
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business operators manage rental units" ON public.rental_units;
CREATE POLICY "Business operators manage rental units" ON public.rental_units
  FOR ALL USING (
    public.is_admin() OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    )
  );

-- (d) Customers Policies
DROP POLICY IF EXISTS "Multi-tenant customers policy" ON public.customers;
CREATE POLICY "Multi-tenant customers policy" ON public.customers
  FOR ALL USING (
    public.is_admin() OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    ) OR
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT') AND
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- (e) Bookings Policies
DROP POLICY IF EXISTS "Multi-tenant bookings policy" ON public.bookings;
CREATE POLICY "Multi-tenant bookings policy" ON public.bookings
  FOR ALL USING (
    public.is_admin() OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    ) OR
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT') AND
      customer_id IN (
        SELECT id FROM public.customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- (f) Payments Policies
DROP POLICY IF EXISTS "Multi-tenant payments policy" ON public.payments;
CREATE POLICY "Multi-tenant payments policy" ON public.payments
  FOR ALL USING (
    public.is_admin() OR
    business_id = (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('BUSINESS_OWNER', 'MANAGER', 'STAFF', 'ADMIN')
    ) OR
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'CLIENT') AND
      booking_id IN (
        SELECT id FROM public.bookings WHERE customer_id IN (
          SELECT id FROM public.customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
      )
    )
  );

-- (g) Contact Submissions Policies
DROP POLICY IF EXISTS "Anyone can insert contact submission" ON public.contact_submissions;
CREATE POLICY "Anyone can insert contact submission" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. SUPABASE REALTIME REPLICATION
-- ----------------------------------------------------------------------------
-- Set replica identity to full so Supabase Realtime emits full record changes
ALTER TABLE public.businesses REPLICA IDENTITY FULL;
ALTER TABLE public.rental_units REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication safely
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_units;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ----------------------------------------------------------------------------
-- 7. REALTIME SEED DATA (Clean, Interlinked, Production-Grade)
-- ----------------------------------------------------------------------------

-- Seed Businesses
INSERT INTO public.businesses (id, name, business_type)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Apex SafeStore Solutions', 'self_storage'),
  ('b0000000-0000-0000-0000-000000000002', 'MetroHub Micro-Warehousing', 'warehouse'),
  ('b0000000-0000-0000-0000-000000000003', 'FleetPark Logistics & Bays', 'parking')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, business_type = EXCLUDED.business_type;

-- Seed Rental Units
INSERT INTO public.rental_units (id, name, type, description, base_price, status, business_id)
VALUES
  ('u0000000-0000-0000-0000-000000000001', 'Climate Vault A-101', 'Self Storage', '10x10 ft temp-controlled locker with 24/7 biometric access & CCTV.', 150.00, 'OCCUPIED', 'b0000000-0000-0000-0000-000000000001'),
  ('u0000000-0000-0000-0000-000000000002', 'Secure Locker A-102', 'Self Storage', '5x5 ft compact personal storage locker with automated keypad lock.', 65.00, 'AVAILABLE', 'b0000000-0000-0000-0000-000000000001'),
  ('u0000000-0000-0000-0000-000000000003', 'Executive Vault A-103', 'Climate Controlled', '15x10 ft premium storage vault ideal for documents and fine artwork.', 240.00, 'AVAILABLE', 'b0000000-0000-0000-0000-000000000001'),
  ('u0000000-0000-0000-0000-000000000004', 'Warehouse Bay B-201', 'Warehouse Space', '25x20 ft high-ceiling distribution bay with dedicated loading dock.', 450.00, 'OCCUPIED', 'b0000000-0000-0000-0000-000000000002'),
  ('u0000000-0000-0000-0000-000000000005', 'Micro Fulfillment Hub B-202', 'Warehouse Space', '40x25 ft pallet racking zone with IoT temperature & humidity sensors.', 780.00, 'AVAILABLE', 'b0000000-0000-0000-0000-000000000002'),
  ('u0000000-0000-0000-0000-000000000006', 'Commercial Vehicle Bay C-301', 'Parking Bay', 'Covered 30ft fleet parking bay with 24/7 gated security & EV charging.', 190.00, 'OCCUPIED', 'b0000000-0000-0000-0000-000000000003'),
  ('u0000000-0000-0000-0000-000000000007', 'Heavy Equipment Yard C-302', 'Equipment Yard', 'Open asphalt lot for trailer parking and contractor staging.', 320.00, 'AVAILABLE', 'b0000000-0000-0000-0000-000000000003'),
  ('u0000000-0000-0000-0000-000000000008', 'Cold Storage Pod D-401', 'Specialty Storage', 'Walk-in refrigeration container calibrated to 4°C for perishables.', 520.00, 'MAINTENANCE', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, status = EXCLUDED.status, base_price = EXCLUDED.base_price;

-- Seed Customers (Tenants / Clients)
INSERT INTO public.customers (id, name, email, phone, address, status, business_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Alex Chen', 'client@rentallq.com', '+1 (512) 555-0192', '742 Evergreen Terrace, Austin, TX', 'ACTIVE', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Khushi Sarkar', 'sarkarkhushi2006@gmail.com', '+91 98765 43210', 'Sector 42, Metro Towers, Apt 5B', 'ACTIVE', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Marcus Vance', 'marcus.vance@techfleet.io', '+1 (312) 555-0144', '1200 W Fulton Market, Chicago, IL', 'ACTIVE', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000004', 'Elena Rostova', 'elena.rostova@nexusretail.com', '+1 (415) 555-0188', '88 King Street, San Francisco, CA', 'ACTIVE', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000005', 'Devon Brooks', 'devon.brooks@horizonlogistics.net', '+1 (206) 555-0176', '450 Pine St, Seattle, WA', 'ACTIVE', 'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000006', 'Priya Sharma', 'priya.sharma@innovatedesign.org', '+91 91234 56789', 'Green Park Extension, New Delhi', 'ACTIVE', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email;

-- Seed Bookings
INSERT INTO public.bookings (id, customer_id, rental_unit_id, start_date, end_date, total_amount, status, business_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000001', now() - interval '60 days', now() + interval '300 days', 1800.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000001', now() - interval '30 days', now() + interval '150 days', 900.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000004', now() - interval '90 days', now() + interval '180 days', 2700.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000004', now() - interval '15 days', now() + interval '345 days', 5400.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000006', now() - interval '45 days', now() + interval '135 days', 1140.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000003', now() - interval '10 days', now() + interval '80 days', 720.00, 'CONFIRMED', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE 
SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount;

-- Seed Payments
INSERT INTO public.payments (id, booking_id, amount, due_date, method, status, business_id)
VALUES
  ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 150.00, now() - interval '30 days', 'CREDIT_CARD', 'COMPLETED', 'b0000000-0000-0000-0000-000000000001'),
  ('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 150.00, now() + interval '15 days', 'CREDIT_CARD', 'PENDING', 'b0000000-0000-0000-0000-000000000001'),
  ('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 150.00, now() - interval '5 days', 'UPI', 'COMPLETED', 'b0000000-0000-0000-0000-000000000001'),
  ('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 150.00, now() + interval '25 days', 'UPI', 'PENDING', 'b0000000-0000-0000-0000-000000000001'),
  ('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 450.00, now() - interval '60 days', 'BANK_TRANSFER', 'COMPLETED', 'b0000000-0000-0000-0000-000000000002'),
  ('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 450.00, now() + interval '5 days', 'BANK_TRANSFER', 'PENDING', 'b0000000-0000-0000-0000-000000000002'),
  ('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 450.00, now() - interval '10 days', 'CREDIT_CARD', 'COMPLETED', 'b0000000-0000-0000-0000-000000000002'),
  ('p0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 190.00, now() - interval '15 days', 'CREDIT_CARD', 'COMPLETED', 'b0000000-0000-0000-0000-000000000003'),
  ('p0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 240.00, now() - interval '2 days', 'CREDIT_CARD', 'COMPLETED', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE 
SET status = EXCLUDED.status, amount = EXCLUDED.amount;

-- ----------------------------------------------------------------------------
-- 8. BACKFILL EXISTING AUTH USERS INTO PROFILES & LINK DEFAULT BUSINESS
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  default_biz UUID := 'b0000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert profile for all pre-existing users in auth.users
  INSERT INTO public.profiles (id, name, role)
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'User'),
    CASE
      WHEN email ILIKE '%owner%' THEN 'BUSINESS_OWNER'
      WHEN email ILIKE '%manager%' THEN 'MANAGER'
      WHEN email ILIKE '%admin%' THEN 'ADMIN'
      ELSE COALESCE(raw_user_meta_data->>'role', 'CLIENT')
    END
  FROM auth.users
  ON CONFLICT (id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    name = COALESCE(EXCLUDED.name, public.profiles.name);

  -- Explicitly update roles for designated business accounts
  UPDATE public.profiles p
  SET 
    role = 'BUSINESS_OWNER',
    business_id = default_biz
  FROM auth.users u
  WHERE p.id = u.id AND (u.email = 'owner@rentallq.com' OR u.email ILIKE '%owner%');

  UPDATE public.profiles p
  SET 
    role = 'MANAGER',
    business_id = default_biz
  FROM auth.users u
  WHERE p.id = u.id AND (u.email = 'manager@rentallq.com' OR u.email ILIKE '%manager%');

  UPDATE public.profiles p
  SET 
    role = 'ADMIN'
  FROM auth.users u
  WHERE p.id = u.id AND (u.email = 'admin@rentallq.com' OR u.email ILIKE '%admin%');

  -- Link business owner_profile_id
  UPDATE public.businesses
  SET owner_profile_id = (SELECT p.id FROM public.profiles p WHERE p.role = 'BUSINESS_OWNER' LIMIT 1)
  WHERE id = default_biz;

  -- Backfill customer records for all client accounts in auth.users
  INSERT INTO public.customers (name, email, phone, address, status, business_id)
  SELECT 
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Client'),
    u.email,
    '+1 (555) 019-2834',
    'Client Account Address',
    'ACTIVE',
    default_biz
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.role = 'CLIENT' AND u.email IS NOT NULL
  ON CONFLICT DO NOTHING;
END $$;
