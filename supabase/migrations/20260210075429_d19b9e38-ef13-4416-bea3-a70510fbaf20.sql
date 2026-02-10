
-- Add restrictive policy requiring authentication for all SELECT on user_profiles
CREATE POLICY "Require authentication for all access"
ON public.user_profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);
