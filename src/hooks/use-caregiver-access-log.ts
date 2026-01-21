import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

interface LogAccessOptions {
  patientUserId: string;
  resourceType: 'dose_logs' | 'medications' | 'calendar' | 'stats';
  resourceId?: string;
  action?: 'view' | 'export';
  metadata?: Record<string, string | number | boolean | null>;
}

export function useCaregiverAccessLog() {
  const { user } = useAuth();

  const logAccess = useCallback(async (options: LogAccessOptions) => {
    if (!user?.id) return;

    // Only log if the viewer is not the patient (i.e., they're a caregiver)
    if (user.id === options.patientUserId) return;

    try {
      const { error } = await supabase
        .from('caregiver_access_logs')
        .insert([{
          caregiver_user_id: user.id,
          patient_user_id: options.patientUserId,
          resource_type: options.resourceType,
          resource_id: options.resourceId || null,
          action: options.action || 'view',
          user_agent: navigator.userAgent,
          metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : {},
        }]);

      if (error) {
        console.error('Failed to log caregiver access:', error);
      }
    } catch (err) {
      console.error('Error logging caregiver access:', err);
    }
  }, [user?.id]);

  return { logAccess };
}
