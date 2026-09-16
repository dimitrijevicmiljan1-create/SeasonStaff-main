-- Faza 2 — Employee Management: positions table + FK on employees

CREATE TABLE IF NOT EXISTS public.positions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_positions_org_name UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_positions_organization_id ON public.positions(organization_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'employees_position_id_fkey'
  ) THEN
    ALTER TABLE public.employees
      ADD CONSTRAINT employees_position_id_fkey
        FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_staff_manage_positions" ON public.positions
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
