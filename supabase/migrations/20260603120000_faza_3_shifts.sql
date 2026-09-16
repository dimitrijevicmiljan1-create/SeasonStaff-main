-- Faza 3 — Weekly Shift Board: shifts table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
    CREATE TYPE public.shift_status AS ENUM ('scheduled', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.shifts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_date      date NOT NULL,
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  position_id     uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  status          public.shift_status NOT NULL DEFAULT 'scheduled',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_org_date ON public.shifts (organization_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON public.shifts (employee_id, shift_date);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_staff_manage_shifts" ON public.shifts;
CREATE POLICY "org_staff_manage_shifts" ON public.shifts
  FOR ALL
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

DROP POLICY IF EXISTS "employee_read_own_shifts" ON public.shifts;
CREATE POLICY "employee_read_own_shifts" ON public.shifts
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE profile_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
