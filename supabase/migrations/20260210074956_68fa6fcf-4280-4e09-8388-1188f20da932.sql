
-- Add invite expiration and confirmation token to caregiver_links
ALTER TABLE public.caregiver_links 
  ADD COLUMN invite_expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  ADD COLUMN confirmation_token text,
  ADD COLUMN confirmation_expires_at timestamp with time zone;

-- Add index on confirmation_token for fast lookups
CREATE INDEX idx_caregiver_links_confirmation_token ON public.caregiver_links (confirmation_token) WHERE confirmation_token IS NOT NULL;

-- Add index on invite_code for fast lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_caregiver_links_invite_code ON public.caregiver_links (invite_code) WHERE invite_code IS NOT NULL;

-- Allow caregivers to update caregiver_links (needed for claiming invite codes)
CREATE POLICY "Caregivers can update links they are claiming"
ON public.caregiver_links
FOR UPDATE
USING (
  auth.uid() = caregiver_user_id 
  OR (status = 'pending' AND invite_code IS NOT NULL)
);
