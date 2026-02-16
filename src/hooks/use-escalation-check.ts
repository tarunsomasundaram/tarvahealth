import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

/**
 * Periodically calls the check-escalations edge function
 * to alert caregivers when doses are overdue past the escalation delay.
 */
export function useEscalationCheck() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runCheck = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-escalations', {
        method: 'POST',
        body: {},
      });

      if (error) {
        console.error('[Escalation] Check failed:', error);
      } else if (data?.alerted > 0) {
        console.log(`[Escalation] ${data.alerted} caregiver alert(s) sent`);
      }
    } catch (err) {
      console.error('[Escalation] Unexpected error:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Run immediately on mount
    runCheck();

    // Then check periodically
    intervalRef.current = setInterval(runCheck, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, runCheck]);
}
