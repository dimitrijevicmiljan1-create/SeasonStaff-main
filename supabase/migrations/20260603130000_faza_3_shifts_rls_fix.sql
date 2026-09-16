-- Faza 3 review fix: org_staff_manage_shifts must verify employee_id belongs to same org

DROP POLICY IF EXISTS "org_staff_manage_shifts" ON public.shifts;
CREATE POLICY "org_staff_manage_shifts" ON public.shifts
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
    AND employee_id IN (
      SELECT id FROM public.employees
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
    AND employee_id IN (
      SELECT id FROM public.employees
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );
