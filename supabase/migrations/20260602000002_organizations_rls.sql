-- RLS for organizations stub (Faza 0.5 / pre-Faza 1 hardening)

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_organization" ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

GRANT SELECT ON public.organizations TO authenticated;
