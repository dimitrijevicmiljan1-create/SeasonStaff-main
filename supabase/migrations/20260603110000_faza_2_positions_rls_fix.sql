-- Faza 2 review fix: allow all org members to read positions (JOIN for employees)

CREATE POLICY "org_member_read_positions" ON public.positions
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );
