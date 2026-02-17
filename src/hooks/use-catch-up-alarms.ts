/**
 * Catch-Up Alarms Hook
 * 
 * When the app resumes (visibility change, online event), checks for
 * any doses that were scheduled while the phone was off/app was closed
 * and triggers the alarm overlay for the most recent missed one.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { hasLocalAction } from '@/lib/offlineDoseQueue';

interface CatchUpOptions {
  /** Max hours in the past to look for missed doses */
  lookbackHours?: number;
  /** Callback when a catch-up dose is found */
  onCatchUpDose?: (dose: {
    id: string;
    medicationId: string;
    medicationName: string;
    strengthValue: number | null;
    strengthUnit: string | null;
    form: string;
    scheduledTime: Date;
    displayTime: string;
    instructions?: string;
  }) => void;
}

export function useCatchUpAlarms({ lookbackHours = 4, onCatchUpDose }: CatchUpOptions = {}) {
  const { getScheduledDosesForDate, activeMedications } = useData();
  const lastCheckRef = useRef<number>(Date.now());

  const checkForMissedDoses = useCallback(async () => {
    if (!activeMedications.length || !onCatchUpDose) return;

    const now = new Date();
    const lookbackMs = lookbackHours * 60 * 60 * 1000;
    const cutoff = new Date(now.getTime() - lookbackMs);

    // Get today's doses
    const todayDoses = getScheduledDosesForDate(now);

    // Find pending doses that are past their scheduled time
    for (const dose of todayDoses) {
      if (dose.status !== 'pending') continue;
      if (dose.scheduledTime < cutoff) continue; // Too old
      if (dose.scheduledTime > now) continue; // Not yet due

      // Check if we already handled this offline
      const alreadyHandled = await hasLocalAction(
        dose.medicationId,
        dose.scheduledTime.toISOString()
      );
      if (alreadyHandled) continue;

      // Found a missed dose - trigger catch-up alarm
      const med = activeMedications.find(m => m.id === dose.medicationId);
      if (!med) continue;

      const displayTime = dose.scheduledTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });

      onCatchUpDose({
        id: dose.id,
        medicationId: dose.medicationId,
        medicationName: med.generic_name,
        strengthValue: med.strength_value,
        strengthUnit: med.strength_unit,
        form: med.form,
        scheduledTime: dose.scheduledTime,
        displayTime,
        instructions: med.instructions || undefined,
      });

      // Only trigger for the most urgent (earliest) missed dose
      break;
    }

    lastCheckRef.current = Date.now();
  }, [activeMedications, getScheduledDosesForDate, lookbackHours, onCatchUpDose]);

  // Check on app resume (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only check if at least 30s since last check (avoid spam)
        if (Date.now() - lastCheckRef.current > 30000) {
          checkForMissedDoses();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check when coming back online
    const handleOnline = () => {
      if (Date.now() - lastCheckRef.current > 30000) {
        checkForMissedDoses();
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForMissedDoses]);

  // Initial check on mount
  useEffect(() => {
    // Delay to let data load
    const timeout = setTimeout(checkForMissedDoses, 2000);
    return () => clearTimeout(timeout);
  }, [checkForMissedDoses]);

  return { checkForMissedDoses };
}
