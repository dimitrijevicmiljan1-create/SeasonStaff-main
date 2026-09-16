-- Faza 5 — Employee App Attendance: attendance_logs

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_log_type') THEN
    CREATE TYPE public.attendance_log_type AS ENUM ('check_in', 'check_out');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  timestamp       timestamptz NOT NULL DEFAULT now(),
  type            public.attendance_log_type NOT NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_organization_id
  ON public.attendance_logs (organization_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_employee_id
  ON public.attendance_logs (employee_id, timestamp DESC);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_select_own_attendance_logs" ON public.attendance_logs;
CREATE POLICY "employee_select_own_attendance_logs" ON public.attendance_logs
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "employee_insert_own_attendance_logs" ON public.attendance_logs;
CREATE POLICY "employee_insert_own_attendance_logs" ON public.attendance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.profile_id = auth.uid()
        AND e.organization_id = organization_id
    )
  );

DROP POLICY IF EXISTS "org_staff_select_attendance_logs" ON public.attendance_logs;
CREATE POLICY "org_staff_select_attendance_logs" ON public.attendance_logs
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "owner_update_attendance_logs" ON public.attendance_logs;
CREATE POLICY "owner_update_attendance_logs" ON public.attendance_logs
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.attendance_logs TO authenticated;
