import { useState, useCallback, useRef } from 'react';
import { useData, ScheduledDose } from '@/contexts/DataContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNotifications } from './use-notifications';
import { triggerHaptic } from './use-haptics';
import { addMinutes, subMinutes } from 'date-fns';

export interface CaseOpenEvent {
  timestamp: Date;
  compartmentOpened?: string;
  eventId?: string;
  deviceId?: string;
}

const DEDUP_WINDOW_SECONDS = 60;

export function useCaseDevice() {
  const {
    medications,
    schedules,
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

  // Deduplication tracking
  const lastEventRef = useRef<{ deviceId?: string; timestamp: number }>({ timestamp: 0 });
  const processedEventIds = useRef<Set<string>>(new Set());

  const isDuplicateEvent = useCallback((event: CaseOpenEvent): boolean => {
    if (event.eventId) {
      if (processedEventIds.current.has(event.eventId)) return true;
      processedEventIds.current.add(event.eventId);
      if (processedEventIds.current.size > 200) {
        const arr = Array.from(processedEventIds.current);
        processedEventIds.current = new Set(arr.slice(-100));
      }
    }
    const nowMs = event.timestamp.getTime();
    const last = lastEventRef.current;
    if (
      Math.abs(nowMs - last.timestamp) < DEDUP_WINDOW_SECONDS * 1000 &&
      (event.deviceId === last.deviceId || !event.deviceId)
    ) {
      return true;
    }
    lastEventRef.current = { deviceId: event.deviceId, timestamp: nowMs };
    return false;
  }, []);

  // Find eligible doses using per-medication auto_mark_window_minutes
  const getEligibleDoses = useCallback((eventTime: Date): ScheduledDose[] => {
    const candidates: ScheduledDose[] = [];
    const today = new Date(eventTime);
    candidates.push(...getScheduledDosesForDate(today));

    const hours = eventTime.getHours();
    if (hours < 1) {
      const prevDay = new Date(eventTime);
      prevDay.setDate(prevDay.getDate() - 1);
      candidates.push(...getScheduledDosesForDate(prevDay));
    } else if (hours >= 23) {
      const nextDay = new Date(eventTime);
      nextDay.setDate(nextDay.getDate() + 1);
      candidates.push(...getScheduledDosesForDate(nextDay));
    }

    const seen = new Set<string>();
    const unique = candidates.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    return unique.filter((dose) => {
      const med = medications.find((m) => m.id === dose.medicationId);
      if (!med?.stored_in_case) return false;
      if (dose.status !== 'pending' && dose.status !== 'snoozed') return false;

      // Use per-medication auto_mark_window_minutes from schedule
      const schedule = getScheduleForMedication(dose.medicationId);
      const windowMinutes = schedule?.auto_mark_window_minutes ?? 30;

      const windowStart = subMinutes(dose.scheduledTime, windowMinutes);
      const windowEnd = addMinutes(dose.scheduledTime, windowMinutes);

      return eventTime >= windowStart && eventTime <= windowEnd;
    });
  }, [getScheduledDosesForDate, medications, getScheduleForMedication]);

  const findClosestDose = useCallback((doses: ScheduledDose[], eventTime: Date): ScheduledDose | null => {
    if (doses.length === 0) return null;
    if (doses.length === 1) return doses[0];

    let closest: ScheduledDose = doses[0];
    let closestDiff = Math.abs(eventTime.getTime() - doses[0].scheduledTime.getTime());

    for (let i = 1; i < doses.length; i++) {
      const diff = Math.abs(eventTime.getTime() - doses[i].scheduledTime.getTime());
      if (diff < closestDiff) {
        closest = doses[i];
        closestDiff = diff;
      }
    }
    return closest;
  }, []);

  const markDoseFromCase = useCallback(async (dose: ScheduledDose, eventTime?: Date) => {
    const takenAt = eventTime ?? new Date();
    const schedule = getScheduleForMedication(dose.medicationId);
    const onTimeWindowMinutes = schedule?.on_time_window_minutes ?? 30;
    const windowEnd = addMinutes(dose.scheduledTime, onTimeWindowMinutes);
    const isLate = takenAt > windowEnd;

    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'taken',
      { status: isLate ? 'late' : 'on_time', source: 'case', notes: 'CASE_OPEN_AUTO' }
    );

    await decrementDose(dose.medicationId);
    await cancelNotification(dose.medicationId, dose.scheduledTime.toISOString());

    triggerHaptic('success');
    setPendingCaseSelection(null);
  }, [getScheduleForMedication, logDose, decrementDose, cancelNotification]);

  const logOutOfWindowEvent = useCallback(async (event: CaseOpenEvent) => {
    console.log('[CaseDevice] Case opened outside auto-mark window — no auto-mark', {
      timestamp: event.timestamp.toISOString(),
      deviceId: event.deviceId,
    });
    await createNotification('case_open_outside_window', {
      metadata: {
        eventTimestamp: event.timestamp.toISOString(),
        deviceId: event.deviceId,
        caseOpenOutsideWindow: true,
      },
    });
  }, [createNotification]);

  const handleCaseOpen = useCallback(async (event: CaseOpenEvent) => {
    if (isDuplicateEvent(event)) {
      console.log('[CaseDevice] Duplicate case open event ignored');
      return null;
    }

    setIsProcessingCaseOpen(true);
    const eventTime = event.timestamp;
    const eligibleDoses = getEligibleDoses(eventTime);

    if (eligibleDoses.length === 0) {
      await logOutOfWindowEvent(event);
      setIsProcessingCaseOpen(false);
      return null;
    }

    const closestDose = findClosestDose(eligibleDoses, eventTime);

    if (!closestDose) {
      await logOutOfWindowEvent(event);
      setIsProcessingCaseOpen(false);
      return null;
    }

    await markDoseFromCase(closestDose, eventTime);
    setIsProcessingCaseOpen(false);
    return { autoMarked: closestDose };
  }, [isDuplicateEvent, getEligibleDoses, findClosestDose, markDoseFromCase, logOutOfWindowEvent]);

  const confirmCaseSelection = useCallback(async (dose: ScheduledDose) => {
    await markDoseFromCase(dose);
  }, [markDoseFromCase]);

  const cancelCaseSelection = useCallback(() => {
    setPendingCaseSelection(null);
  }, []);

  const simulateCaseOpen = useCallback(() => {
    return handleCaseOpen({ timestamp: new Date() });
  }, [handleCaseOpen]);

  const getDueDoses = useCallback((windowMinutes: number = 30): ScheduledDose[] => {
    return getEligibleDoses(new Date());
  }, [getEligibleDoses]);

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
