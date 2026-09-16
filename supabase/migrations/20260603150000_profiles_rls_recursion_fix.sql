-- Fix infinite recursion (42P17) on profiles SELECT policies.
-- org_staff_select_profiles must not subquery profiles under RLS on the same table.

CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_org_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'manager')
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_organization_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_is_org_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_org_staff() TO authenticated;

DROP POLICY IF EXISTS "org_staff_select_profiles" ON public.profiles;

CREATE POLICY "org_staff_select_profiles" ON public.profiles
  FOR SELECT
  USING (
    public.current_user_is_org_staff()
    AND organization_id = public.current_user_organization_id()
  );
