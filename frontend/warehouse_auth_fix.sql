-- ============================================================================
-- Supabase GoTrue Auth Fix for Multi-Warehouse Accounts
-- ============================================================================
-- Fixes the "status: 500 AuthRetryableFetchError" by properly syncing
-- auth.identities, passwords, and profile roles in Supabase.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure Auth Users exist with valid bcrypt password and confirmed email
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
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Also update existing owner@rentallq.com if present
UPDATE auth.users
SET 
  encrypted_password = crypt('Password@123', gen_salt('bf')),
  email_confirmed_at = now()
WHERE email = 'owner@rentallq.com';

-- ----------------------------------------------------------------------------
-- 2. CRITICAL: POPULATE AUTH IDENTITIES (Prevents 500 AuthRetryableFetchError)
-- ----------------------------------------------------------------------------
-- Supabase GoTrue strictly requires a corresponding auth.identities record
-- for email/password authentication to work.
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
-- 3. ENSURE PROFILES & BUSINESS MAPPING
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

-- Link owner@rentallq.com if present
UPDATE public.profiles p
SET role = 'BUSINESS_OWNER', business_id = 'b1000000-0000-0000-0000-000000000001'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'owner@rentallq.com';
