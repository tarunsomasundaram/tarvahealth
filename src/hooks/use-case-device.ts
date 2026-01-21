import { useState, useCallback } from 'react';
import { useData, ScheduledDose } from '@/contexts/DataContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNotifications } from './use-notifications';
import { triggerHaptic } from './use-haptics';
import { addMinutes, parseISO, isWithinInterval, subMinutes } from 'date-fns';

export interface CaseOpenEvent {
  timestamp: Date;
  compartmentOpened?: string;
}

export function useCaseDevice() {
  const {
    medications,
    getScheduledDosesForDate,
    getScheduleForMedication,
    logDose,
    decrementDose,
    createNotification,
  } = useData();

  const { caseDevice } = useOnboarding();
  const { cancelNotification } = useNotifications();
  
  const [pendingCaseSelection, setPendingCaseSelection] = useState<ScheduledDose[] | null>(null);
  const [isProcessingCaseOpen, setIsProcessingCaseOpen] = useState(false);

  // Find doses that are currently due (within configurable window)
  const getDueDoses = useCallback((windowMinutes: number = 60): ScheduledDose[] => {
    const now = new Date();
    const todaysDoses = getScheduledDosesForDate(now);

    return todaysDoses.filter((dose) => {
      // Only consider doses stored in case
      const med = medications.find((m) => m.id === dose.medicationId);
      if (!med?.stored_in_case) return false;

      // Only pending/snoozed are eligible for auto-mark from case opening
      if (dose.status !== 'pending' && dose.status !== 'snoozed') return false;

      const windowStart = subMinutes(dose.scheduledTime, windowMinutes);
      const windowEnd = addMinutes(dose.scheduledTime, windowMinutes);

      return isWithinInterval(now, { start: windowStart, end: windowEnd });
    });
  }, [getScheduledDosesForDate, medications]);

  // Handle case open event - auto-mark dose if single match, else show chooser
  const handleCaseOpen = useCallback(async (event: CaseOpenEvent) => {
    setIsProcessingCaseOpen(true);
    triggerHaptic('medium');

    const dueDoses = getDueDoses(60);
    
    if (dueDoses.length === 0) {
      console.log('Case opened but no due doses found');
      setIsProcessingCaseOpen(false);
      return null;
    }

    if (dueDoses.length === 1) {
      // Auto-mark the single due dose
      const dose = dueDoses[0];
      await markDoseFromCase(dose);
      setIsProcessingCaseOpen(false);
      return { autoMarked: dose };
    }

    // Multiple doses due - need user selection
    setPendingCaseSelection(dueDoses);
    setIsProcessingCaseOpen(false);
    return { needsSelection: dueDoses };
  }, [getDueDoses]);

  // Mark a dose as taken from case (decrements inventory)
  const markDoseFromCase = useCallback(async (dose: ScheduledDose) => {
    const now = new Date();
    const schedule = getScheduleForMedication(dose.medicationId);
    const onTimeWindowMinutes = schedule?.on_time_window_minutes ?? 30;
    const windowEnd = addMinutes(dose.scheduledTime, onTimeWindowMinutes);
    const isLate = now > windowEnd;

    // 1) Log dose with source=case
    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'taken',
      { status: isLate ? 'late' : 'on_time', source: 'case' }
    );

    // 2) Decrement inventory (if tracked)
    await decrementDose(dose.medicationId);

    // 3) Cancel the pending reminder notification
    await cancelNotification(dose.medicationId, dose.scheduledTime.toISOString());

    // 4) Create an in-app notification event
    await createNotification(isLate ? 'dose_late' : 'dose_taken', {
      medication_id: dose.medicationId,
      scheduled_datetime: dose.scheduledTime,
      metadata: { source: 'case' },
    });

    triggerHaptic('success');
    setPendingCaseSelection(null);
  }, [getScheduleForMedication, logDose, decrementDose, cancelNotification, createNotification]);

  // Confirm dose selection from case chooser
  const confirmCaseSelection = useCallback(async (dose: ScheduledDose) => {
    await markDoseFromCase(dose);
  }, [markDoseFromCase]);

  // Cancel case selection dialog
  const cancelCaseSelection = useCallback(() => {
    setPendingCaseSelection(null);
  }, []);

  // Simulate case open (for testing without hardware)
  const simulateCaseOpen = useCallback(() => {
    return handleCaseOpen({ timestamp: new Date() });
  }, [handleCaseOpen]);

  return {
    caseDevice,
    isConnected: caseDevice?.connected ?? false,
    batteryLevel: caseDevice?.batteryLevel ?? 0,
    lastSync: caseDevice?.lastSync,
    pendingCaseSelection,
    isProcessingCaseOpen,
    handleCaseOpen,
    markDoseFromCase,
    confirmCaseSelection,
    cancelCaseSelection,
    simulateCaseOpen,
    getDueDoses,
  };
}
