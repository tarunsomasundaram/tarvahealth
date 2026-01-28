-- Allow patients to view profiles of their linked caregivers
CREATE POLICY "Patients can view linked caregiver profiles"
ON public.user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.caregiver_links
    WHERE caregiver_links.caregiver_user_id = user_profiles.user_id
    AND caregiver_links.patient_user_id = auth.uid()
    AND caregiver_links.status = 'active'
  )
);