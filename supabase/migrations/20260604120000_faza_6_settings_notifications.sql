-- Faza 6 — Settings & Notifications

-- ---------------------------------------------------------------------------
-- organizations: shift defaults
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS default_shift_start time,
  ADD COLUMN IF NOT EXISTS default_shift_end time,
  ADD COLUMN IF NOT EXISTS default_position_ids uuid[] NOT NULL DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- Manager may update operational org fields (not business_name)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "manager_update_organization" ON public.organizations;
CREATE POLICY "manager_update_organization" ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE OR REPLACE FUNCTION public.enforce_manager_organization_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.organization_id = OLD.id;

  IF v_role = 'manager' THEN
    NEW.business_name := OLD.business_name;
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_manager_organization_update ON public.organizations;
CREATE TRIGGER trg_enforce_manager_organization_update
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_manager_organization_update();

-- ---------------------------------------------------------------------------
-- Attendance check-in → in-app notification for employee
-- ---------------------------------------------------------------------------
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_attendance_check_in ON public.attendance_logs;
CREATE TRIGGER trg_notify_attendance_check_in
  AFTER INSERT ON public.attendance_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_attendance_check_in();
