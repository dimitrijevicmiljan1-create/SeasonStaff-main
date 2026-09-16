-- Fix: restrict notification SELECT to the user's current organization,
-- preventing cross-org reads when user_id appears in multiple orgs.
DROP POLICY IF EXISTS "user_select_own_notifications" ON public.notifications;
CREATE POLICY "user_select_own_notifications" ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );
