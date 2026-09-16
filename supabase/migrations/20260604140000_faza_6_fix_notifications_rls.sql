-- Fix: restrict notification UPDATE to the user's current organization,
-- preventing cross-org marking-as-read when user_id appears in multiple orgs.
DROP POLICY IF EXISTS "user_update_own_notifications" ON public.notifications;
CREATE POLICY "user_update_own_notifications" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );
