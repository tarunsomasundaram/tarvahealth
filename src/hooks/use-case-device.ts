import { useState, useEffect, useCallback } from 'react';
import { useMedication, ScheduledDose } from '@/contexts/MedicationContext';
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
    getUpcomingDoses, 
    markDoseTaken, 
    updateMedication 
  } = useMedication();
  const { caseDevice, addNotification } = useOnboarding();
  const { cancelNotification } = useNotifications();
  
  const [pendingCaseSelection, setPendingCaseSelection] = useState<ScheduledDose[] | null>(null);
  const [isProcessingCaseOpen, setIsProcessingCaseOpen] = useState(false);

  // Find doses that are currently due (within configurable window)
  const getDueDoses = useCallback((windowMinutes: number = 60): ScheduledDose[] => {
    const now = new Date();
    const upcomingDoses = getUpcomingDoses(now);
    
    return upcomingDoses.filter(dose => {
      // Only consider doses stored in case
      if (!dose.medication.storedInCase) return false;
      
      const scheduledTime = parseISO(dose.scheduledDatetime);
      const windowStart = subMinutes(scheduledTime, windowMinutes);
      const windowEnd = addMinutes(scheduledTime, windowMinutes);
      
      return isWithinInterval(now, { start: windowStart, end: windowEnd });
    });
  }, [getUpcomingDoses]);

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
    const scheduledTime = parseISO(dose.scheduledDatetime);
    const windowEnd = addMinutes(scheduledTime, dose.onTimeWindowMinutes);
    const isLate = now > windowEnd;

    // Create dose log with source = case
    markDoseTaken(dose, 'case');
    
    // Cancel the pending reminder notification
    await cancelNotification(dose.medicationId, dose.scheduledDatetime);
    
    // Add notification event
    addNotification({
      id: `taken_${dose.id}_${Date.now()}`,
      type: isLate ? 'dose_late' : 'dose_taken',
      title: isLate ? 'Dose taken late' : 'Dose marked taken',
      subtitle: 'Detected from case',
      medicationName: `${dose.medication.genericName} ${dose.medication.strengthValue}${dose.medication.strengthUnit}`,
      timestamp: new Date().toISOString(),
      status: isLate ? 'late' : 'sent',
      read: false,
    });

    triggerHaptic('success');
    setPendingCaseSelection(null);
  }, [markDoseTaken, cancelNotification, addNotification]);

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
