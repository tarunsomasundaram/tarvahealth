
-- Create a private schema not exposed by the API
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Move SECURITY DEFINER helpers out of public
ALTER FUNCTION public.can_caregiver_access(uuid, uuid, text) SET SCHEMA private;
ALTER FUNCTION public.handle_new_user() SET SCHEMA private;

-- Lock down execution
REVOKE ALL ON FUNCTION private.can_caregiver_access(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_caregiver_access(uuid, uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.handle_new_user() TO service_role, supabase_auth_admin;
