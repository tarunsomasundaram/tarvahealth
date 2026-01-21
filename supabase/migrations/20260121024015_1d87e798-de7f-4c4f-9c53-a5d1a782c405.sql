
-- Drop existing profiles table to replace with user_profiles
DROP TABLE IF EXISTS public.profiles CASCADE;

-- A) Core user profile
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT,
  phone TEXT,
  age INTEGER,
  height_value NUMERIC,
  height_unit TEXT DEFAULT 'cm' CHECK (height_unit IN ('cm', 'in')),
  weight_value NUMERIC,
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  blood_group TEXT,
  allergies_text TEXT,
  condition_other_text TEXT,
  timezone TEXT DEFAULT 'UTC',
  share_profile_in_forum BOOLEAN DEFAULT false,
  passcode_enabled BOOLEAN DEFAULT false,
  avatar_url TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'caregiver'))
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- B) Conditions catalog
CREATE TABLE public.conditions_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  synonyms TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.conditions_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read conditions catalog" ON public.conditions_catalog
  FOR SELECT USING (true);

-- User conditions relation
CREATE TABLE public.user_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_id UUID NOT NULL REFERENCES public.conditions_catalog(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, condition_id)
);

ALTER TABLE public.user_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conditions" ON public.user_conditions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conditions" ON public.user_conditions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conditions" ON public.user_conditions
  FOR DELETE USING (auth.uid() = user_id);

-- C) Behavior categories
CREATE TABLE public.behavior_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.behavior_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read behavior categories" ON public.behavior_categories
  FOR SELECT USING (true);

-- Behaviors catalog
CREATE TABLE public.behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.behavior_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  prompt TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.behaviors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read behaviors" ON public.behaviors
  FOR SELECT USING (true);

-- User behaviors
CREATE TABLE public.user_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  behavior_id UUID NOT NULL REFERENCES public.behaviors(id) ON DELETE CASCADE,
  selected BOOLEAN DEFAULT true,
  selected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, behavior_id)
);

ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own behaviors" ON public.user_behaviors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behaviors" ON public.user_behaviors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behaviors" ON public.user_behaviors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behaviors" ON public.user_behaviors
  FOR DELETE USING (auth.uid() = user_id);

-- D) Medications
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generic_name TEXT NOT NULL,
  alt_names TEXT[],
  strength_value NUMERIC,
  strength_unit TEXT,
  form TEXT DEFAULT 'tablet',
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  stored_in_case BOOLEAN DEFAULT false,
  compartment INTEGER,
  refill_quantity_doses INTEGER,
  refill_threshold_doses INTEGER DEFAULT 2,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_medications_user_id ON public.medications(user_id);

-- Medication schedules
CREATE TABLE public.medication_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_type TEXT DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'custom', 'as-needed')),
  times_of_day TEXT[] NOT NULL DEFAULT ARRAY['08:00'],
  days_of_week INTEGER[],
  on_time_window_minutes INTEGER DEFAULT 30,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules" ON public.medication_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON public.medication_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON public.medication_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON public.medication_schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_medication_schedules_user_id ON public.medication_schedules(user_id);

-- Dose logs
CREATE TABLE public.dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_datetime TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('taken', 'skipped', 'missed', 'snoozed')),
  event_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT CHECK (status IN ('on_time', 'late')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('case', 'manual')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dose logs" ON public.dose_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dose logs" ON public.dose_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dose logs" ON public.dose_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_dose_logs_user_scheduled ON public.dose_logs(user_id, scheduled_datetime);

-- E) Devices
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT DEFAULT 'TARVA Case',
  device_identifier TEXT,
  last_seen_at TIMESTAMPTZ,
  battery_percent INTEGER DEFAULT 100,
  firmware_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own devices" ON public.devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON public.devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON public.devices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" ON public.devices
  FOR DELETE USING (auth.uid() = user_id);

-- Case inventory
CREATE TABLE public.case_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  doses_remaining INTEGER DEFAULT 0,
  last_refill_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, medication_id)
);

ALTER TABLE public.case_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory" ON public.case_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON public.case_inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.case_inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_case_inventory_user_id ON public.case_inventory(user_id);

-- Refill logs
CREATE TABLE public.refill_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  quantity_added INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  refilled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.refill_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own refill logs" ON public.refill_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own refill logs" ON public.refill_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- F) Caregiver links
CREATE TABLE public.caregiver_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  invite_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_user_id, caregiver_user_id)
);

ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their caregiver links" ON public.caregiver_links
  FOR SELECT USING (auth.uid() = patient_user_id OR auth.uid() = caregiver_user_id);

CREATE POLICY "Patients can insert caregiver links" ON public.caregiver_links
  FOR INSERT WITH CHECK (auth.uid() = patient_user_id);

CREATE POLICY "Patients can update their caregiver links" ON public.caregiver_links
  FOR UPDATE USING (auth.uid() = patient_user_id);

CREATE POLICY "Patients can delete caregiver links" ON public.caregiver_links
  FOR DELETE USING (auth.uid() = patient_user_id);

-- Caregiver permissions
CREATE TABLE public.caregiver_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_view_calendar BOOLEAN DEFAULT false,
  can_view_stats BOOLEAN DEFAULT false,
  can_view_medications BOOLEAN DEFAULT false,
  can_receive_missed_alerts BOOLEAN DEFAULT false,
  can_receive_late_alerts BOOLEAN DEFAULT false,
  can_receive_refill_alerts BOOLEAN DEFAULT false,
  can_receive_low_battery_alerts BOOLEAN DEFAULT false,
  can_receive_dose_taken BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_user_id, caregiver_user_id)
);

ALTER TABLE public.caregiver_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients and caregivers can view permissions" ON public.caregiver_permissions
  FOR SELECT USING (auth.uid() = patient_user_id OR auth.uid() = caregiver_user_id);

CREATE POLICY "Patients can insert permissions" ON public.caregiver_permissions
  FOR INSERT WITH CHECK (auth.uid() = patient_user_id);

CREATE POLICY "Patients can update permissions" ON public.caregiver_permissions
  FOR UPDATE USING (auth.uid() = patient_user_id);

-- G) Notification events
CREATE TABLE public.notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE SET NULL,
  scheduled_datetime TIMESTAMPTZ,
  event_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notification_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notification_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notification_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_notification_events_user_id ON public.notification_events(user_id, created_at DESC);

-- Notification preferences
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dose_reminders BOOLEAN DEFAULT true,
  missed_dose_alerts BOOLEAN DEFAULT true,
  refill_reminders BOOLEAN DEFAULT true,
  case_battery_alerts BOOLEAN DEFAULT true,
  caregiver_updates BOOLEAN DEFAULT true,
  community_activity BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_schedules_updated_at BEFORE UPDATE ON public.medication_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_inventory_updated_at BEFORE UPDATE ON public.case_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_caregiver_links_updated_at BEFORE UPDATE ON public.caregiver_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_caregiver_permissions_updated_at BEFORE UPDATE ON public.caregiver_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function for caregiver access
CREATE OR REPLACE FUNCTION public.can_caregiver_access(
  _caregiver_id UUID,
  _patient_id UUID,
  _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.caregiver_links cl
    JOIN public.caregiver_permissions cp ON cl.patient_user_id = cp.patient_user_id 
      AND cl.caregiver_user_id = cp.caregiver_user_id
    WHERE cl.caregiver_user_id = _caregiver_id
      AND cl.patient_user_id = _patient_id
      AND cl.status = 'active'
      AND (
        (_permission = 'calendar' AND cp.can_view_calendar) OR
        (_permission = 'stats' AND cp.can_view_stats) OR
        (_permission = 'medications' AND cp.can_view_medications) OR
        (_permission = 'missed_alerts' AND cp.can_receive_missed_alerts) OR
        (_permission = 'late_alerts' AND cp.can_receive_late_alerts) OR
        (_permission = 'refill_alerts' AND cp.can_receive_refill_alerts) OR
        (_permission = 'battery_alerts' AND cp.can_receive_low_battery_alerts) OR
        (_permission = 'dose_taken' AND cp.can_receive_dose_taken)
      )
  )
$$;

-- Add caregiver read policies for patient data
CREATE POLICY "Caregivers can view patient medications" ON public.medications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.can_caregiver_access(auth.uid(), user_id, 'medications')
  );

CREATE POLICY "Caregivers can view patient schedules" ON public.medication_schedules
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.can_caregiver_access(auth.uid(), user_id, 'calendar')
  );

CREATE POLICY "Caregivers can view patient dose logs" ON public.dose_logs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.can_caregiver_access(auth.uid(), user_id, 'calendar')
  );

-- Seed conditions catalog
INSERT INTO public.conditions_catalog (name, category, sort_order) VALUES
  ('Epilepsy', 'Neurological', 1),
  ('Diabetes Type 1', 'Metabolic', 2),
  ('Diabetes Type 2', 'Metabolic', 3),
  ('Hypertension', 'Cardiovascular', 4),
  ('Asthma', 'Respiratory', 5),
  ('ADHD', 'Neurological', 6),
  ('Depression', 'Mental Health', 7),
  ('Anxiety', 'Mental Health', 8),
  ('Hypothyroidism', 'Endocrine', 9),
  ('Hyperthyroidism', 'Endocrine', 10),
  ('Arthritis', 'Musculoskeletal', 11),
  ('Migraine', 'Neurological', 12),
  ('GERD', 'Gastrointestinal', 13),
  ('Heart Disease', 'Cardiovascular', 14),
  ('Chronic Pain', 'General', 15),
  ('Insomnia', 'Sleep', 16),
  ('Allergies', 'Immune', 17),
  ('COPD', 'Respiratory', 18),
  ('Osteoporosis', 'Musculoskeletal', 19),
  ('Other', 'General', 100);

-- Seed behavior categories
INSERT INTO public.behavior_categories (name, sort_order) VALUES
  ('Lifestyle', 1),
  ('Health & Symptoms', 2),
  ('Hormonal Health', 3),
  ('Drugs & Medication', 4);

-- Seed behaviors
INSERT INTO public.behaviors (category_id, name, prompt, sort_order)
SELECT bc.id, b.name, b.prompt, b.sort_order
FROM public.behavior_categories bc
CROSS JOIN (VALUES
  ('Lifestyle', 'Exercise', 'Track your exercise routine', 1),
  ('Lifestyle', 'Sleep Quality', 'Monitor your sleep patterns', 2),
  ('Lifestyle', 'Stress Level', 'Track daily stress levels', 3),
  ('Lifestyle', 'Water Intake', 'Log your hydration', 4),
  ('Lifestyle', 'Alcohol', 'Track alcohol consumption', 5),
  ('Lifestyle', 'Caffeine', 'Monitor caffeine intake', 6),
  ('Health & Symptoms', 'Pain Level', 'Rate your pain 1-10', 7),
  ('Health & Symptoms', 'Energy Level', 'Track energy throughout day', 8),
  ('Health & Symptoms', 'Mood', 'Log your emotional state', 9),
  ('Health & Symptoms', 'Appetite', 'Track hunger and eating', 10),
  ('Health & Symptoms', 'Nausea', 'Note any nausea episodes', 11),
  ('Health & Symptoms', 'Dizziness', 'Track dizzy spells', 12),
  ('Hormonal Health', 'Period', 'Track menstrual cycle', 13),
  ('Hormonal Health', 'Hot Flashes', 'Log hot flash episodes', 14),
  ('Hormonal Health', 'Mood Swings', 'Note hormonal mood changes', 15),
  ('Drugs & Medication', 'Side Effects', 'Report medication side effects', 16),
  ('Drugs & Medication', 'Effectiveness', 'Rate medication effectiveness', 17),
  ('Drugs & Medication', 'Supplements', 'Track supplement intake', 18)
) AS b(category_name, name, prompt, sort_order)
WHERE bc.name = b.category_name;
