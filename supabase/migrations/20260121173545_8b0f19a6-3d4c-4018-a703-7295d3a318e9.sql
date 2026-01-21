-- Create audit log table for tracking caregiver access to sensitive data
CREATE TABLE public.caregiver_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_user_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- e.g., 'dose_logs', 'medications', 'calendar'
  resource_id UUID, -- optional: specific record accessed
  action TEXT NOT NULL DEFAULT 'view', -- 'view', 'export', etc.
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.caregiver_access_logs ENABLE ROW LEVEL SECURITY;

-- Caregivers can insert their own access logs
CREATE POLICY "Caregivers can log their own access"
ON public.caregiver_access_logs
FOR INSERT
WITH CHECK (auth.uid() = caregiver_user_id);

-- Patients can view access logs for their data
CREATE POLICY "Patients can view access logs for their data"
ON public.caregiver_access_logs
FOR SELECT
USING (auth.uid() = patient_user_id);

-- Caregivers can view their own access history
CREATE POLICY "Caregivers can view their own access logs"
ON public.caregiver_access_logs
FOR SELECT
USING (auth.uid() = caregiver_user_id);

-- Create index for efficient querying
CREATE INDEX idx_caregiver_access_logs_patient ON public.caregiver_access_logs(patient_user_id, created_at DESC);
CREATE INDEX idx_caregiver_access_logs_caregiver ON public.caregiver_access_logs(caregiver_user_id, created_at DESC);
CREATE INDEX idx_caregiver_access_logs_resource ON public.caregiver_access_logs(resource_type, created_at DESC);