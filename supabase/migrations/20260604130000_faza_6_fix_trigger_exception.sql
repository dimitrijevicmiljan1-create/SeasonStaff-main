-- Fix: wrap notification insert in exception block so a notification failure
-- never blocks the check-in write.
CREATE OR REPLACE FUNCTION public.notify_attendance_check_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NEW.type <> 'check_in' THEN
    RETURN NEW;
  END IF;

  SELECT e.profile_id INTO v_user_id
  FROM public.employees e
  WHERE e.id = NEW.employee_id;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    INSERT INTO public.notifications (
      user_id,
      organization_id,
      type,
      title,
      meta,
      href,
      unread
    ) VALUES (
      v_user_id,
      NEW.organization_id,
      'attendance_confirmation',
      'Checked in',
      'Your attendance was recorded.',
      '/attendance',
      true
    );
  EXCEPTION WHEN OTHERS THEN
    -- Notification failure must never block check-in
    NULL;
  END;

  RETURN NEW;
END;
$$;
