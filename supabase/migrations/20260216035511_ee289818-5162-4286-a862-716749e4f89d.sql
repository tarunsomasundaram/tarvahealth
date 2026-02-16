
-- Add configurable auto-mark window and escalation delay to medication_schedules
ALTER TABLE public.medication_schedules
  ADD COLUMN IF NOT EXISTS auto_mark_window_minutes integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS escalation_delay_minutes integer DEFAULT NULL;

-- Add caregiver_alert_sent_at to dose_logs for dedup of escalation alerts
ALTER TABLE public.dose_logs
  ADD COLUMN IF NOT EXISTS caregiver_alert_sent_at timestamp with time zone DEFAULT NULL;
