
-- Explicitly deny UPDATE and DELETE on caregiver_access_logs to protect audit trail integrity
CREATE POLICY "Deny all updates to access logs"
ON public.caregiver_access_logs
AS RESTRICTIVE
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Deny all deletes from access logs"
ON public.caregiver_access_logs
AS RESTRICTIVE
FOR DELETE
TO public
USING (false);
