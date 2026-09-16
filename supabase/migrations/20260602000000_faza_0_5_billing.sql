-- Faza 0.5 — Billing & Subscription Layer
-- organizations stub (Faza 1 extends with business columns)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Enums
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled');

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  employee_limit integer NOT NULL,
  monthly_price numeric NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions(organization_id);

-- organization_billing
CREATE TABLE public.organization_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  implementation_fee numeric DEFAULT 300,
  implementation_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_organization_billing_organization_id ON public.organization_billing(organization_id);

-- Minimal profiles stub required for billing RLS (Faza 1 extends columns + auth link)
CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'employee');

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_subscription" ON public.subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "owner_select_billing" ON public.organization_billing
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_billing TO authenticated;

-- Helper: get active subscription for organization
CREATE OR REPLACE FUNCTION public.get_organization_subscription(org_id uuid)
RETURNS TABLE (
  plan public.subscription_plan,
  status public.subscription_status,
  employee_limit integer,
  monthly_price numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.plan, s.status, s.employee_limit, s.monthly_price
  FROM public.subscriptions s
  WHERE s.organization_id = org_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_organization_subscription(uuid) TO authenticated;
