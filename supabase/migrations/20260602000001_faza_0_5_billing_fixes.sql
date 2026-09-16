-- Faza 0.5 — Billing Code Review Fixes

-- 1a. Revoke mutation grants from authenticated — billing is mutated by service role only
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.organization_billing FROM authenticated;

-- 1b. SECURITY INVOKER + deterministic active subscription lookup
CREATE OR REPLACE FUNCTION public.get_organization_subscription(org_id uuid)
RETURNS TABLE (
  plan public.subscription_plan,
  status public.subscription_status,
  employee_limit integer,
  monthly_price numeric
)
LANGUAGE sql
SET search_path = public
AS $$
  SELECT s.plan, s.status, s.employee_limit, s.monthly_price
  FROM public.subscriptions s
  WHERE s.organization_id = org_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

-- 1c. profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_select_profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- 1d. UNIQUE constraints
ALTER TABLE public.organization_billing
  ADD CONSTRAINT uq_organization_billing_org UNIQUE (organization_id);

CREATE UNIQUE INDEX uq_subscriptions_org_active
  ON public.subscriptions(organization_id)
  WHERE status = 'active';

-- 1e. updated_at on subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
