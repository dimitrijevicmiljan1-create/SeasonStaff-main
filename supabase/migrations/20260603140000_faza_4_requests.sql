-- Faza 4 — Unified Request System: requests + notifications

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
    CREATE TYPE public.request_type AS ENUM ('swap', 'time_off');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type            public.request_type NOT NULL,
  status          public.request_status NOT NULL DEFAULT 'pending',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_organization_id ON public.requests (organization_id);
CREATE INDEX IF NOT EXISTS idx_requests_employee_id ON public.requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests (organization_id, status);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_select_own_requests" ON public.requests;
CREATE POLICY "employee_select_own_requests" ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "employee_insert_own_requests" ON public.requests;
CREATE POLICY "employee_insert_own_requests" ON public.requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.profile_id = auth.uid()
        AND e.organization_id = organization_id
    )
  );

DROP POLICY IF EXISTS "org_staff_select_requests" ON public.requests;
CREATE POLICY "org_staff_select_requests" ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "org_staff_update_requests" ON public.requests;
CREATE POLICY "org_staff_update_requests" ON public.requests
  FOR UPDATE
  TO authenticated
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

GRANT SELECT, INSERT, UPDATE ON public.requests TO authenticated;

-- ---------------------------------------------------------------------------
-- notifications (in-app; inserts via service role in server actions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type            text NOT NULL,
  title           text NOT NULL,
  meta            text NOT NULL DEFAULT '',
  href            text NOT NULL DEFAULT '/requests',
  unread          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id) WHERE unread = true;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_own_notifications" ON public.notifications;
CREATE POLICY "user_select_own_notifications" ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_own_notifications" ON public.notifications;
CREATE POLICY "user_update_own_notifications" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
