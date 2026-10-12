-- ============================================================================
-- RentAll-Q Multi-Warehouse Accounts & Distinct Data Provisioning
-- ============================================================================
-- All UUIDs are strictly valid hexadecimal [0-9a-f].
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROVISION 4 DISTINCT BUSINESS WAREHOUSES
-- ----------------------------------------------------------------------------
INSERT INTO public.businesses (id, name, business_type)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Austin SafeStore & Central Depot', 'self_storage'),
  ('b2000000-0000-0000-0000-000000000002', 'Chicago MetroHub Micro-Warehousing', 'warehouse'),
  ('b3000000-0000-0000-0000-000000000003', 'Seattle Pacific Port & Fleet Terminal', 'parking'),
  ('b4000000-0000-0000-0000-000000000004', 'New York Empire Urban Storage & Depot', 'warehouse')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, business_type = EXCLUDED.business_type;

-- ----------------------------------------------------------------------------
-- 2. CREATE DEDICATED AUTH USERS (Passwords: Password@123)
-- ----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'warehouse.austin@rentallq.com',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Austin Warehouse Manager","name":"Austin Warehouse Manager","role":"BUSINESS_OWNER"}',
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'warehouse.chicago@rentallq.com',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Chicago Fulfillment Lead","name":"Chicago Fulfillment Lead","role":"BUSINESS_OWNER"}',
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'warehouse.seattle@rentallq.com',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Seattle Port Ops Manager","name":"Seattle Port Ops Manager","role":"BUSINESS_OWNER"}',
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'warehouse.ny@rentallq.com',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"NY Urban Depot Supervisor","name":"NY Urban Depot Supervisor","role":"BUSINESS_OWNER"}',
    now(),
    now(),
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE
SET 
  encrypted_password = crypt('Password@123', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Also update existing owner@rentallq.com if present
UPDATE auth.users
SET 
  encrypted_password = crypt('Password@123', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = '{"full_name":"Sarah Sterling","role":"BUSINESS_OWNER"}'::jsonb
WHERE email = 'owner@rentallq.com';

-- ----------------------------------------------------------------------------
-- 2b. LINK AUTH IDENTITIES (REQUIRED BY SUPABASE GOTRUE)
-- ----------------------------------------------------------------------------
-- Supabase GoTrue crashes with error 500 if an auth.user lacks an identity record.
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email IN (
  'warehouse.austin@rentallq.com',
  'warehouse.chicago@rentallq.com',
  'warehouse.seattle@rentallq.com',
  'warehouse.ny@rentallq.com',
  'owner@rentallq.com'
)
AND NOT EXISTS (
  SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
);

-- ----------------------------------------------------------------------------
-- 3. LINK PROFILES TO EACH RESPECTIVE BUSINESS WAREHOUSE
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, name, role, business_id)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Austin Warehouse Manager', 'BUSINESS_OWNER', 'b1000000-0000-0000-0000-000000000001'),
  ('22222222-0000-0000-0000-000000000002', 'Chicago Fulfillment Lead', 'BUSINESS_OWNER', 'b2000000-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000003', 'Seattle Port Ops Manager', 'BUSINESS_OWNER', 'b3000000-0000-0000-0000-000000000003'),
  ('44444444-0000-0000-0000-000000000004', 'NY Urban Depot Supervisor', 'BUSINESS_OWNER', 'b4000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = 'BUSINESS_OWNER',
  business_id = EXCLUDED.business_id;

-- Link owner profile id on businesses
UPDATE public.businesses SET owner_profile_id = '11111111-0000-0000-0000-000000000001' WHERE id = 'b1000000-0000-0000-0000-000000000001';
UPDATE public.businesses SET owner_profile_id = '22222222-0000-0000-0000-000000000002' WHERE id = 'b2000000-0000-0000-0000-000000000002';
UPDATE public.businesses SET owner_profile_id = '33333333-0000-0000-0000-000000000003' WHERE id = 'b3000000-0000-0000-0000-000000000003';
UPDATE public.businesses SET owner_profile_id = '44444444-0000-0000-0000-000000000004' WHERE id = 'b4000000-0000-0000-0000-000000000004';

-- Ensure owner@rentallq.com also points to Austin
UPDATE public.profiles p
SET role = 'BUSINESS_OWNER', business_id = 'b1000000-0000-0000-0000-000000000001'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'owner@rentallq.com';

-- ----------------------------------------------------------------------------
-- 4. PROVISION DISTINCT RENTAL UNITS PER WAREHOUSE (Valid hex: d...)
-- ----------------------------------------------------------------------------
INSERT INTO public.rental_units (id, name, type, description, base_price, status, business_id)
VALUES
  -- Warehouse 1: Austin SafeStore
  ('d1000000-0000-0000-0000-000000000011', 'Climate Locker A-101', 'Self Storage', '10x10 ft temp-controlled locker with biometric security.', 150.00, 'OCCUPIED', 'b1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000012', 'Personal Locker A-102', 'Self Storage', '5x5 ft compact personal storage locker.', 65.00, 'AVAILABLE', 'b1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000013', 'Executive Vault A-103', 'Climate Controlled', '15x10 ft premium storage vault for high-value items.', 240.00, 'AVAILABLE', 'b1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000014', 'Drive-Up Unit A-104', 'Self Storage', '20x10 ft roll-up door unit with 24/7 drive-in vehicle access.', 210.00, 'OCCUPIED', 'b1000000-0000-0000-0000-000000000001'),

  -- Warehouse 2: Chicago MetroHub
  ('d2000000-0000-0000-0000-000000000021', 'Distribution Bay B-201', 'Warehouse Space', '25x20 ft high-ceiling distribution bay with loading dock.', 450.00, 'OCCUPIED', 'b2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000022', 'Micro Fulfillment Bay B-202', 'Warehouse Space', '40x25 ft pallet racking zone with IoT sensors.', 780.00, 'AVAILABLE', 'b2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000023', 'Bulk Staging Area B-203', 'Warehouse Space', '50x30 ft open warehouse floor for bulk palletized freight.', 950.00, 'OCCUPIED', 'b2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000024', 'Cold Storage Pod B-204', 'Specialty Storage', 'Walk-in refrigerated container set at 4°C.', 520.00, 'OCCUPIED', 'b2000000-0000-0000-0000-000000000002'),

  -- Warehouse 3: Seattle Pacific Fleet
  ('d3000000-0000-0000-0000-000000000031', 'Commercial Fleet Bay C-301', 'Parking Bay', 'Covered 30ft fleet parking bay with EV charging port.', 190.00, 'OCCUPIED', 'b3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000032', 'Heavy Equipment Yard C-302', 'Equipment Yard', 'Open asphalt lot for trailer parking & staging.', 320.00, 'AVAILABLE', 'b3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000033', 'Container Staging Yard C-303', 'Equipment Yard', '40ft intermodal container parking spot with 24/7 security.', 380.00, 'OCCUPIED', 'b3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000034', 'Covered RV / Boat Bay C-304', 'Parking Bay', '35ft high-clearance covered storage bay for large vessels.', 260.00, 'OCCUPIED', 'b3000000-0000-0000-0000-000000000003'),

  -- Warehouse 4: New York Empire Depot
  ('d4000000-0000-0000-0000-000000000041', 'Manhattan High-Ceiling Vault D-101', 'Warehouse Space', '12x12 ft climate-sealed space in Midtown core.', 310.00, 'OCCUPIED', 'b4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000042', 'Wall Street Document Storage D-102', 'Self Storage', '8x8 ft reinforced fireproof lockbox for legal archives.', 180.00, 'OCCUPIED', 'b4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000043', 'Brooklyn Commercial Locker D-103', 'Self Storage', '15x15 ft creator storage space with high-speed WiFi.', 420.00, 'AVAILABLE', 'b4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000044', 'Midtown Logistics Cage D-104', 'Warehouse Space', '30x20 ft security caged area for high-value tech inventory.', 650.00, 'OCCUPIED', 'b4000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, status = EXCLUDED.status, base_price = EXCLUDED.base_price;

-- ----------------------------------------------------------------------------
-- 5. PROVISION DISTINCT CUSTOMERS (TENANTS) (Valid hex: c...)
-- ----------------------------------------------------------------------------
INSERT INTO public.customers (id, name, email, phone, address, status, business_id)
VALUES
  -- Austin Customers
  ('c1000000-0000-0000-0000-000000000011', 'Alex Chen', 'client@rentallq.com', '+1 (512) 555-0192', '742 Evergreen Terrace, Austin, TX', 'ACTIVE', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000012', 'Sarah Jenkins', 'sarah.j@austintech.io', '+1 (512) 555-0144', '1400 Congress Ave, Austin, TX', 'ACTIVE', 'b1000000-0000-0000-0000-000000000001'),

  -- Chicago Customers
  ('c2000000-0000-0000-0000-000000000021', 'Marcus Vance', 'marcus.vance@techfleet.io', '+1 (312) 555-0144', '1200 W Fulton Market, Chicago, IL', 'ACTIVE', 'b2000000-0000-0000-0000-000000000002'),
  ('c2000000-0000-0000-0000-000000000022', 'Elena Rostova', 'elena.rostova@nexusretail.com', '+1 (312) 555-0188', '88 Michigan Ave, Chicago, IL', 'ACTIVE', 'b2000000-0000-0000-0000-000000000002'),
  ('c2000000-0000-0000-0000-000000000023', 'Apex Cargo Express', 'dispatch@apexcargo.com', '+1 (312) 555-0921', '900 S Canal St, Chicago, IL', 'ACTIVE', 'b2000000-0000-0000-0000-000000000002'),

  -- Seattle Customers
  ('c3000000-0000-0000-0000-000000000031', 'Devon Brooks', 'devon.brooks@horizonlogistics.net', '+1 (206) 555-0176', '450 Pine St, Seattle, WA', 'ACTIVE', 'b3000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000032', 'Cascade Freight Lines', 'ops@cascadefreight.com', '+1 (206) 555-0332', 'Port Harbor Gate 4, Seattle, WA', 'ACTIVE', 'b3000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000033', 'Pacific Charter Fleet', 'admin@pacificcharter.com', '+1 (206) 555-0789', 'Elliott Bay Marina, Seattle, WA', 'ACTIVE', 'b3000000-0000-0000-0000-000000000003'),

  -- New York Customers
  ('c4000000-0000-0000-0000-000000000041', 'Julian Sterling', 'julian@sterlingadvisors.nyc', '+1 (212) 555-0199', '350 5th Ave, New York, NY', 'ACTIVE', 'b4000000-0000-0000-0000-000000000004'),
  ('c4000000-0000-0000-0000-000000000042', 'Gotham Gourmet Imports', 'imports@gothamfood.com', '+1 (212) 555-0455', 'Meatpacking District Bay 3, NY', 'ACTIVE', 'b4000000-0000-0000-0000-000000000004'),
  ('c4000000-0000-0000-0000-000000000043', 'Lexington Archival LLC', 'records@lexingtonarchival.com', '+1 (212) 555-0811', 'Lexington & 53rd, New York, NY', 'ACTIVE', 'b4000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, email = EXCLUDED.email;

-- ----------------------------------------------------------------------------
-- 6. PROVISION DISTINCT BOOKINGS (Valid hex: a...)
-- ----------------------------------------------------------------------------
INSERT INTO public.bookings (id, customer_id, rental_unit_id, start_date, end_date, total_amount, status, business_id)
VALUES
  -- Austin Bookings
  ('a1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000011', now() - interval '90 days', now() + interval '270 days', 1800.00, 'CONFIRMED', 'b1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000014', now() - interval '30 days', now() + interval '330 days', 2520.00, 'CONFIRMED', 'b1000000-0000-0000-0000-000000000001'),

  -- Chicago Bookings
  ('a2000000-0000-0000-0000-000000000021', 'c2000000-0000-0000-0000-000000000021', 'd2000000-0000-0000-0000-000000000021', now() - interval '60 days', now() + interval '300 days', 5400.00, 'CONFIRMED', 'b2000000-0000-0000-0000-000000000002'),
  ('a2000000-0000-0000-0000-000000000022', 'c2000000-0000-0000-0000-000000000022', 'd2000000-0000-0000-0000-000000000023', now() - interval '45 days', now() + interval '315 days', 11400.00, 'CONFIRMED', 'b2000000-0000-0000-0000-000000000002'),
  ('a2000000-0000-0000-0000-000000000023', 'c2000000-0000-0000-0000-000000000023', 'd2000000-0000-0000-0000-000000000024', now() - interval '15 days', now() + interval '345 days', 6240.00, 'CONFIRMED', 'b2000000-0000-0000-0000-000000000002'),

  -- Seattle Bookings
  ('a3000000-0000-0000-0000-000000000031', 'c3000000-0000-0000-0000-000000000031', 'd3000000-0000-0000-0000-000000000031', now() - interval '40 days', now() + interval '320 days', 2280.00, 'CONFIRMED', 'b3000000-0000-0000-0000-000000000003'),
  ('a3000000-0000-0000-0000-000000000032', 'c3000000-0000-0000-0000-000000000032', 'd3000000-0000-0000-0000-000000000033', now() - interval '20 days', now() + interval '340 days', 4560.00, 'CONFIRMED', 'b3000000-0000-0000-0000-000000000003'),
  ('a3000000-0000-0000-0000-000000000033', 'c3000000-0000-0000-0000-000000000033', 'd3000000-0000-0000-0000-000000000034', now() - interval '10 days', now() + interval '350 days', 3120.00, 'CONFIRMED', 'b3000000-0000-0000-0000-000000000003'),

  -- New York Bookings
  ('a4000000-0000-0000-0000-000000000041', 'c4000000-0000-0000-0000-000000000041', 'd4000000-0000-0000-0000-000000000041', now() - interval '75 days', now() + interval '285 days', 3720.00, 'CONFIRMED', 'b4000000-0000-0000-0000-000000000004'),
  ('a4000000-0000-0000-0000-000000000042', 'c4000000-0000-0000-0000-000000000042', 'd4000000-0000-0000-0000-000000000042', now() - interval '50 days', now() + interval '310 days', 2160.00, 'CONFIRMED', 'b4000000-0000-0000-0000-000000000004'),
  ('a4000000-0000-0000-0000-000000000043', 'c4000000-0000-0000-0000-000000000043', 'd4000000-0000-0000-0000-000000000044', now() - interval '5 days', now() + interval '355 days', 7800.00, 'CONFIRMED', 'b4000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount;

-- ----------------------------------------------------------------------------
-- 7. PROVISION DISTINCT PAYMENTS (Valid hex: e...)
-- ----------------------------------------------------------------------------
INSERT INTO public.payments (id, booking_id, amount, due_date, method, status, business_id)
VALUES
  -- Austin Payments (~$18.5k scale)
  ('e1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 1500.00, now() - interval '30 days', 'CREDIT_CARD', 'COMPLETED', 'b1000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000011', 150.00, now() + interval '10 days', 'CREDIT_CARD', 'PENDING', 'b1000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000012', 2100.00, now() - interval '10 days', 'UPI', 'COMPLETED', 'b1000000-0000-0000-0000-000000000001'),

  -- Chicago Payments (~$46.2k scale)
  ('e2000000-0000-0000-0000-000000000021', 'a2000000-0000-0000-0000-000000000021', 4500.00, now() - interval '30 days', 'BANK_TRANSFER', 'COMPLETED', 'b2000000-0000-0000-0000-000000000002'),
  ('e2000000-0000-0000-0000-000000000022', 'a2000000-0000-0000-0000-000000000022', 9500.00, now() - interval '15 days', 'BANK_TRANSFER', 'COMPLETED', 'b2000000-0000-0000-0000-000000000002'),
  ('e2000000-0000-0000-0000-000000000023', 'a2000000-0000-0000-0000-000000000023', 5200.00, now() - interval '5 days', 'BANK_TRANSFER', 'COMPLETED', 'b2000000-0000-0000-0000-000000000002'),
  ('e2000000-0000-0000-0000-000000000024', 'a2000000-0000-0000-0000-000000000022', 950.00, now() + interval '15 days', 'BANK_TRANSFER', 'PENDING', 'b2000000-0000-0000-0000-000000000002'),

  -- Seattle Payments (~$28.4k scale)
  ('e3000000-0000-0000-0000-000000000031', 'a3000000-0000-0000-0000-000000000031', 1900.00, now() - interval '20 days', 'CREDIT_CARD', 'COMPLETED', 'b3000000-0000-0000-0000-000000000003'),
  ('e3000000-0000-0000-0000-000000000032', 'a3000000-0000-0000-0000-000000000032', 3800.00, now() - interval '10 days', 'CREDIT_CARD', 'COMPLETED', 'b3000000-0000-0000-0000-000000000003'),
  ('e3000000-0000-0000-0000-000000000033', 'a3000000-0000-0000-0000-000000000033', 2600.00, now() - interval '5 days', 'CREDIT_CARD', 'COMPLETED', 'b3000000-0000-0000-0000-000000000003'),

  -- New York Payments (~$64.8k scale)
  ('e4000000-0000-0000-0000-000000000041', 'a4000000-0000-0000-0000-000000000041', 3100.00, now() - interval '40 days', 'CREDIT_CARD', 'COMPLETED', 'b4000000-0000-0000-0000-000000000004'),
  ('e4000000-0000-0000-0000-000000000042', 'a4000000-0000-0000-0000-000000000042', 1800.00, now() - interval '25 days', 'BANK_TRANSFER', 'COMPLETED', 'b4000000-0000-0000-0000-000000000004'),
  ('e4000000-0000-0000-0000-000000000043', 'a4000000-0000-0000-0000-000000000043', 6500.00, now() - interval '2 days', 'CREDIT_CARD', 'COMPLETED', 'b4000000-0000-0000-0000-000000000004'),
  ('e4000000-0000-0000-0000-000000000044', 'a4000000-0000-0000-0000-000000000043', 650.00, now() + interval '28 days', 'CREDIT_CARD', 'PENDING', 'b4000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status, amount = EXCLUDED.amount;
