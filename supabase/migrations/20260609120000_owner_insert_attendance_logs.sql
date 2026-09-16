-- Allow organization owners to manually insert attendance log entries.
-- Mirrors the existing owner_update_attendance_logs policy pattern.

DROP POLICY IF EXISTS "owner_insert_attendance_logs" ON public.attendance_logs;
CREATE POLICY "owner_insert_attendance_logs" ON public.attendance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
