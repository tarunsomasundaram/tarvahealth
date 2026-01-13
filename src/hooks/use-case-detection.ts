import { useEffect, useCallback } from 'react';
import { CaseService, CaseOpenEvent } from '@/services/CaseService';
import { useMedication, ScheduledDose } from '@/contexts/MedicationContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { NotificationService } from '@/services/NotificationService';
import { triggerHaptic } from '@/hooks/use-haptics';
import { isWithinInterval, parseISO, addMinutes, subMinutes } from 'date-fns';

interface CaseOpenResult {
  matchedDoses: ScheduledDose[];
  autoMarked: boolean;
}

export function useCaseDetection() {
  const { getUpcomingDoses, markDoseTakenFromCase, medications } = useMedication();
  const { addNotification, caseDevice } = useOnboarding();

  const handleCaseOpen = useCallback((event: CaseOpenEvent): CaseOpenResult => {
    const now = new Date();
    const upcomingDoses = getUpcomingDoses(now);
    
    // Find doses that are:
    // 1. Stored in the case
    // 2. Within the due window (scheduled time ± 60 minutes)
    const matchedDoses = upcomingDoses.filter(dose => {
      const medication = medications.find(m => m.id === dose.medicationId);
      if (!medication?.storedInCase) return false;

      const scheduledTime = parseISO(dose.scheduledDatetime);
      const windowStart = subMinutes(scheduledTime, 60);
      const windowEnd = addMinutes(scheduledTime, 60);

      return isWithinInterval(now, { start: windowStart, end: windowEnd });
    });

    // If exactly one dose matches, auto-mark as taken from case
    if (matchedDoses.length === 1) {
      const dose = matchedDoses[0];
      markDoseTakenFromCase(dose);
      
      // Cancel any pending notification for this dose
      const notificationId = `${dose.medicationId}_${dose.scheduledDatetime}`;
      NotificationService.cancelNotification(notificationId);

      // Add notification to history
      addNotification({
        id: `notif_${Date.now()}`,
        type: 'dose_taken',
        title: 'Dose marked taken',
        subtitle: 'Detected from case',
        medicationName: `${dose.medication.genericName} ${dose.medication.strengthValue}${dose.medication.strengthUnit}`,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: false,
      });

      triggerHaptic('success');

      return { matchedDoses, autoMarked: true };
    }

    // If multiple doses match, return them for user selection
    if (matchedDoses.length > 1) {
      triggerHaptic('medium');
      return { matchedDoses, autoMarked: false };
    }

    return { matchedDoses: [], autoMarked: false };
  }, [getUpcomingDoses, medications, markDoseTakenFromCase, addNotification]);

  useEffect(() => {
    // Subscribe to case open events
    const unsubscribe = CaseService.onCaseOpen(handleCaseOpen);
    return unsubscribe;
  }, [handleCaseOpen]);

  const simulateCaseOpen = useCallback((compartment?: string) => {
    CaseService.simulateCaseOpen(compartment);
  }, []);

  const isCaseConnected = caseDevice?.connected ?? false;

  return {
    handleCaseOpen,
    simulateCaseOpen,
    isCaseConnected,
    caseStatus: CaseService.getStatus(),
  };
}
