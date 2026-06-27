
-- 1. user_profiles: drop the overly-permissive ALL policy
DROP POLICY IF EXISTS "Require authentication for all access" ON public.user_profiles;

-- 2. Extend can_caregiver_access with more scopes (devices, inventory, refills, profile)
CREATE OR REPLACE FUNCTION public.can_caregiver_access(_caregiver_id uuid, _patient_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.caregiver_links cl
    JOIN public.caregiver_permissions cp
      ON cl.patient_user_id = cp.patient_user_id
     AND cl.caregiver_user_id = cp.caregiver_user_id
    WHERE cl.caregiver_user_id = _caregiver_id
      AND cl.patient_user_id = _patient_id
      AND cl.status = 'active'
      AND _caregiver_id IS NOT NULL
      AND _patient_id IS NOT NULL
      AND (
        (_permission = 'calendar' AND cp.can_view_calendar) OR
        (_permission = 'stats' AND cp.can_view_stats) OR
        (_permission = 'medications' AND cp.can_view_medications) OR
        (_permission = 'missed_alerts' AND cp.can_receive_missed_alerts) OR
        (_permission = 'late_alerts' AND cp.can_receive_late_alerts) OR
        (_permission = 'refill_alerts' AND cp.can_receive_refill_alerts) OR
        (_permission = 'battery_alerts' AND cp.can_receive_low_battery_alerts) OR
        (_permission = 'dose_taken' AND cp.can_receive_dose_taken) OR
        -- profile / conditions / behaviors gated on stats (general view)
        (_permission = 'profile' AND cp.can_view_stats) OR
        (_permission = 'conditions' AND cp.can_view_stats) OR
        (_permission = 'behaviors' AND cp.can_view_stats) OR
        (_permission = 'devices' AND cp.can_view_medications) OR
        (_permission = 'inventory' AND cp.can_view_medications) OR
        (_permission = 'refills' AND cp.can_view_medications)
      )
  )
$function$;

-- 3. user_conditions: allow caregivers
DROP POLICY IF EXISTS "Caregivers can view patient conditions" ON public.user_conditions;
CREATE POLICY "Caregivers can view patient conditions"
ON public.user_conditions FOR SELECT
USING (auth.uid() = user_id OR public.can_caregiver_access(auth.uid(), user_id, 'conditions'));

-- 4. user_behaviors: allow caregivers
DROP POLICY IF EXISTS "Caregivers can view patient behaviors" ON public.user_behaviors;
CREATE POLICY "Caregivers can view patient behaviors"
ON public.user_behaviors FOR SELECT
USING (auth.uid() = user_id OR public.can_caregiver_access(auth.uid(), user_id, 'behaviors'));

-- 5. devices: allow caregivers
DROP POLICY IF EXISTS "Caregivers can view patient devices" ON public.devices;
CREATE POLICY "Caregivers can view patient devices"
ON public.devices FOR SELECT
USING (auth.uid() = user_id OR public.can_caregiver_access(auth.uid(), user_id, 'devices'));

-- 6. case_inventory: allow caregivers
DROP POLICY IF EXISTS "Caregivers can view patient inventory" ON public.case_inventory;
CREATE POLICY "Caregivers can view patient inventory"
ON public.case_inventory FOR SELECT
USING (auth.uid() = user_id OR public.can_caregiver_access(auth.uid(), user_id, 'inventory'));

-- 7. refill_logs: allow caregivers
DROP POLICY IF EXISTS "Caregivers can view patient refill logs" ON public.refill_logs;
CREATE POLICY "Caregivers can view patient refill logs"
ON public.refill_logs FOR SELECT
USING (auth.uid() = user_id OR public.can_caregiver_access(auth.uid(), user_id, 'refills'));

-- 8. user_profiles: caregiver SELECT via permissions (in addition to existing 'linked caregiver profiles')
DROP POLICY IF EXISTS "Caregivers can view patient profile" ON public.user_profiles;
CREATE POLICY "Caregivers can view patient profile"
ON public.user_profiles FOR SELECT
USING (public.can_caregiver_access(auth.uid(), user_id, 'profile'));

-- 9. caregiver_permissions: tighten INSERT to require an active caregiver link
DROP POLICY IF EXISTS "Patients can insert permissions" ON public.caregiver_permissions;
CREATE POLICY "Patients can insert permissions"
ON public.caregiver_permissions FOR INSERT
WITH CHECK (
  auth.uid() = patient_user_id
  AND EXISTS (
    SELECT 1 FROM public.caregiver_links cl
    WHERE cl.patient_user_id = caregiver_permissions.patient_user_id
      AND cl.caregiver_user_id = caregiver_permissions.caregiver_user_id
      AND cl.status = 'active'
  )
);

-- 10. caregiver_permissions: tighten UPDATE similarly
DROP POLICY IF EXISTS "Patients can update permissions" ON public.caregiver_permissions;
CREATE POLICY "Patients can update permissions"
ON public.caregiver_permissions FOR UPDATE
USING (auth.uid() = patient_user_id)
WITH CHECK (
  auth.uid() = patient_user_id
  AND EXISTS (
    SELECT 1 FROM public.caregiver_links cl
    WHERE cl.patient_user_id = caregiver_permissions.patient_user_id
      AND cl.caregiver_user_id = caregiver_permissions.caregiver_user_id
      AND cl.status = 'active'
  )
);
