import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface CaregiverLink {
  id: string;
  patient_user_id: string;
  caregiver_user_id: string;
  status: 'pending' | 'active' | 'blocked';
  invite_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaregiverPermissions {
  id: string;
  patient_user_id: string;
  caregiver_user_id: string;
  can_view_calendar: boolean;
  can_view_stats: boolean;
  can_view_medications: boolean;
  can_receive_missed_alerts: boolean;
  can_receive_late_alerts: boolean;
  can_receive_refill_alerts: boolean;
  can_receive_low_battery_alerts: boolean;
  can_receive_dose_taken: boolean;
  updated_at: string;
}

export interface LinkedCaregiver {
  link: CaregiverLink;
  permissions: CaregiverPermissions | null;
  caregiverProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface LinkedPatient {
  link: CaregiverLink;
  permissions: CaregiverPermissions | null;
  patientProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useCaregivers() {
  const { user } = useAuth();
  const [linkedCaregivers, setLinkedCaregivers] = useState<LinkedCaregiver[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCaregiverData = useCallback(async () => {
    if (!user) {
      setLinkedCaregivers([]);
      setLinkedPatients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch caregivers (where user is the patient)
      const { data: caregiverLinks, error: caregiverLinksError } = await supabase
        .from('caregiver_links')
        .select('*')
        .eq('patient_user_id', user.id);

      if (caregiverLinksError) throw caregiverLinksError;

      // Fetch permissions for caregivers
      const { data: caregiverPerms, error: caregiverPermsError } = await supabase
        .from('caregiver_permissions')
        .select('*')
        .eq('patient_user_id', user.id);

      if (caregiverPermsError) throw caregiverPermsError;

      // Map caregivers with permissions
      const caregivers: LinkedCaregiver[] = (caregiverLinks || []).map(link => ({
        link: link as CaregiverLink,
        permissions: (caregiverPerms || []).find(
          p => p.caregiver_user_id === link.caregiver_user_id
        ) as CaregiverPermissions | null || null,
      }));

      setLinkedCaregivers(caregivers);

      // Fetch patients (where user is the caregiver)
      const { data: patientLinks, error: patientLinksError } = await supabase
        .from('caregiver_links')
        .select('*')
        .eq('caregiver_user_id', user.id);

      if (patientLinksError) throw patientLinksError;

      // Fetch permissions for patients
      const { data: patientPerms, error: patientPermsError } = await supabase
        .from('caregiver_permissions')
        .select('*')
        .eq('caregiver_user_id', user.id);

      if (patientPermsError) throw patientPermsError;

      // Map patients with permissions
      const patients: LinkedPatient[] = (patientLinks || []).map(link => ({
        link: link as CaregiverLink,
        permissions: (patientPerms || []).find(
          p => p.patient_user_id === link.patient_user_id
        ) as CaregiverPermissions | null || null,
      }));

      setLinkedPatients(patients);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching caregiver data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCaregiverData();
  }, [fetchCaregiverData]);

  const generateInviteCode = useCallback((): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const createCaregiverInvite = useCallback(async () => {
    if (!user) return { error: new Error('Not authenticated'), inviteCode: null };

    try {
      const inviteCode = generateInviteCode();
      
      // We'll create a pending link with just an invite code
      // The caregiver will claim it later
      const { data, error } = await supabase
        .from('caregiver_links')
        .insert({
          patient_user_id: user.id,
          caregiver_user_id: user.id, // Temporary, will be updated when claimed
          status: 'pending',
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (error) throw error;

      return { error: null, inviteCode };
    } catch (err) {
      return { error: err as Error, inviteCode: null };
    }
  }, [user, generateInviteCode]);

  const acceptCaregiverInvite = useCallback(async (inviteCode: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Find the pending link
      const { data: linkData, error: findError } = await supabase
        .from('caregiver_links')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .single();

      if (findError || !linkData) {
        throw new Error('Invalid or expired invite code');
      }

      // Check if invite has expired
      if (linkData.invite_expires_at && new Date(linkData.invite_expires_at) < new Date()) {
        throw new Error('This invite code has expired');
      }

      // Update the link with the actual caregiver, set to pending_confirmation
      const { error: updateError } = await supabase
        .from('caregiver_links')
        .update({
          caregiver_user_id: user.id,
          status: 'pending_confirmation',
        })
        .eq('id', linkData.id);

      if (updateError) throw updateError;

      // Trigger confirmation email to the patient
      const { error: emailError } = await supabase.functions.invoke(
        'send-caregiver-confirmation',
        { body: { linkId: linkData.id } }
      );

      if (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't throw - the link is already pending, patient can still confirm
      }

      await fetchCaregiverData();
      return { error: null, pendingConfirmation: true };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, fetchCaregiverData]);

  const updateCaregiverPermissions = useCallback(async (
    caregiverUserId: string,
    permissions: Partial<Omit<CaregiverPermissions, 'id' | 'patient_user_id' | 'caregiver_user_id' | 'updated_at'>>
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('caregiver_permissions')
        .upsert({
          patient_user_id: user.id,
          caregiver_user_id: caregiverUserId,
          ...permissions,
        }, {
          onConflict: 'patient_user_id,caregiver_user_id'
        });

      if (error) throw error;

      await fetchCaregiverData();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, fetchCaregiverData]);

  const removeCaregiver = useCallback(async (caregiverUserId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Delete the link
      const { error: linkError } = await supabase
        .from('caregiver_links')
        .delete()
        .eq('patient_user_id', user.id)
        .eq('caregiver_user_id', caregiverUserId);

      if (linkError) throw linkError;

      // Delete permissions
      await supabase
        .from('caregiver_permissions')
        .delete()
        .eq('patient_user_id', user.id)
        .eq('caregiver_user_id', caregiverUserId);

      await fetchCaregiverData();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, fetchCaregiverData]);

  const blockCaregiver = useCallback(async (caregiverUserId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('caregiver_links')
        .update({ status: 'blocked' })
        .eq('patient_user_id', user.id)
        .eq('caregiver_user_id', caregiverUserId);

      if (error) throw error;

      await fetchCaregiverData();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, fetchCaregiverData]);

  return {
    linkedCaregivers,
    linkedPatients,
    loading,
    error,
    createCaregiverInvite,
    acceptCaregiverInvite,
    updateCaregiverPermissions,
    removeCaregiver,
    blockCaregiver,
    refreshCaregiverData: fetchCaregiverData,
  };
}
