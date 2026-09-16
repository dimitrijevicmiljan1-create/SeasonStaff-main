-- Faza 1 — Auth i organizacija

-- ---------------------------------------------------------------------------
-- Extend organizations
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS business_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------------
-- Extend profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------------
-- employee_status enum + employees + employee_invites
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
    CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'suspended');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  position_id uuid, -- FK to positions(id) to be added when that table is created in faza_2
  status public.employee_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_employees_org_email UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_profile_id ON public.employees(profile_id);

CREATE TABLE IF NOT EXISTS public.employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_invites_token ON public.employee_invites(token);
CREATE INDEX IF NOT EXISTS idx_employee_invites_organization_id ON public.employee_invites(organization_id);

-- ---------------------------------------------------------------------------
-- Invite flow: link auth user to profile + employee when metadata present
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_role public.app_role;
  v_employee_id uuid;
BEGIN
  v_org_id := NULLIF(NEW.raw_user_meta_data->>'organization_id', '')::uuid;
  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', '')::public.app_role,
    'employee'::public.app_role
  );

  INSERT INTO public.profiles (id, organization_id, role, first_name, last_name, phone)
  VALUES (
    NEW.id,
    v_org_id,
    v_role,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  v_employee_id := NULLIF(NEW.raw_user_meta_data->>'employee_id', '')::uuid;
  IF v_employee_id IS NOT NULL THEN
    UPDATE public.employees
    SET profile_id = NEW.id
    WHERE id = v_employee_id
      AND organization_id = v_org_id;

    UPDATE public.employee_invites
    SET accepted_at = now()
    WHERE employee_id = v_employee_id
      AND accepted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Owner onboarding: create organization + owner profile (no org yet at signup)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_organization_and_profile(
  p_business_name text,
  p_org_phone text DEFAULT NULL,
  p_org_email text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_profile_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Profile already exists';
  END IF;

  IF NULLIF(trim(p_business_name), '') IS NULL THEN
    RAISE EXCEPTION 'Business name is required';
  END IF;

  INSERT INTO public.organizations (business_name, phone, email, address)
  VALUES (trim(p_business_name), p_org_phone, p_org_email, p_address)
  RETURNING id INTO v_org_id;

  INSERT INTO public.profiles (id, organization_id, role, first_name, last_name, phone)
  VALUES (v_user_id, v_org_id, 'owner', p_first_name, p_last_name, p_profile_phone);

  RETURN v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization_and_profile(text, text, text, text, text, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS: organizations (replace owner-only SELECT)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owner_select_organization" ON public.organizations;

CREATE POLICY "org_member_select_organization" ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "owner_update_organization" ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Allow authenticated users without profile to INSERT org via RPC only (no direct INSERT policy)

-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_select_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "self_update_profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "org_staff_select_profiles" ON public.profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'manager')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: employees
-- ---------------------------------------------------------------------------
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_staff_all_employees" ON public.employees
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "employee_select_own" ON public.employees
  FOR SELECT
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: employee_invites
-- ---------------------------------------------------------------------------
ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_staff_manage_invites" ON public.employee_invites
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Token lookup via RPC (no broad anon table access)
CREATE OR REPLACE FUNCTION public.get_employee_invite_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  employee_id uuid,
  email text,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.organization_id, i.employee_id, i.email, i.expires_at
  FROM public.employee_invites i
  WHERE i.token = p_token
    AND i.accepted_at IS NULL
    AND i.expires_at > now()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_employee_invite_by_token(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- GRANTs
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_invites TO authenticated;

GRANT UPDATE ON public.organizations TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
