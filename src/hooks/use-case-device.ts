import { useState, useCallback, useRef } from 'react';
import { useData, ScheduledDose } from '@/contexts/DataContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNotifications } from './use-notifications';
import { triggerHaptic } from './use-haptics';
import { addMinutes, subMinutes, differenceInSeconds } from 'date-fns';

export interface CaseOpenEvent {
  timestamp: Date;
  compartmentOpened?: string;
  eventId?: string;       // optional dedup id from sensor
  deviceId?: string;      // optional device identifier
}

const AUTO_TAKEN_WINDOW_MINUTES = 30;
const DEDUP_WINDOW_SECONDS = 60;

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

  // Deduplication tracking
  const lastEventRef = useRef<{ deviceId?: string; timestamp: number }>({ timestamp: 0 });
  const processedEventIds = useRef<Set<string>>(new Set());

  // --- Deduplication ---
  const isDuplicateEvent = useCallback((event: CaseOpenEvent): boolean => {
    // By eventId
    if (event.eventId) {
      if (processedEventIds.current.has(event.eventId)) return true;
      processedEventIds.current.add(event.eventId);
      // Keep set from growing unbounded
      if (processedEventIds.current.size > 200) {
        const arr = Array.from(processedEventIds.current);
        processedEventIds.current = new Set(arr.slice(-100));
      }
    }

    // By time bucket (same device within DEDUP_WINDOW_SECONDS)
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

  // --- Find eligible doses within ±30 min of a given timestamp ---
  const getEligibleDoses = useCallback((eventTime: Date): ScheduledDose[] => {
    // Check today and, if near midnight, also adjacent day
    const candidates: ScheduledDose[] = [];
    const today = new Date(eventTime);

    // Always check today's doses
    const todayDoses = getScheduledDosesForDate(today);
    candidates.push(...todayDoses);

    // If near midnight, also check previous/next day
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

    // Dedupe by dose id
    const seen = new Set<string>();
    const unique = candidates.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    return unique.filter((dose) => {
      // Only stored-in-case medications
      const med = medications.find((m) => m.id === dose.medicationId);
      if (!med?.stored_in_case) return false;

      // Only pending or snoozed (not already taken/skipped/missed)
      if (dose.status !== 'pending' && dose.status !== 'snoozed') return false;

      // Check ±30 min window using full timestamps (handles midnight crossing, DST)
      const windowStart = subMinutes(dose.scheduledTime, AUTO_TAKEN_WINDOW_MINUTES);
      const windowEnd = addMinutes(dose.scheduledTime, AUTO_TAKEN_WINDOW_MINUTES);

      return eventTime >= windowStart && eventTime <= windowEnd;
    });
  }, [getScheduledDosesForDate, medications]);

  // --- Find the single closest dose to the event ---
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

  // --- Silently mark a dose as taken from case auto-open ---
  const markDoseFromCase = useCallback(async (dose: ScheduledDose, eventTime?: Date) => {
    const takenAt = eventTime ?? new Date();
    const schedule = getScheduleForMedication(dose.medicationId);
    const onTimeWindowMinutes = schedule?.on_time_window_minutes ?? 30;
    const windowEnd = addMinutes(dose.scheduledTime, onTimeWindowMinutes);
    const isLate = takenAt > windowEnd;

    // 1) Log dose — source = "case_auto" for auto-marked
    await logDose(
      dose.medicationId,
      dose.scheduledTime,
      'taken',
      { status: isLate ? 'late' : 'on_time', source: 'case', notes: 'CASE_OPEN_AUTO' }
    );

    // 2) Decrement inventory
    await decrementDose(dose.medicationId);

    // 3) Cancel the pending reminder notification (silent — no new notification created)
    await cancelNotification(dose.medicationId, dose.scheduledTime.toISOString());

    triggerHaptic('success');
    setPendingCaseSelection(null);
  }, [getScheduleForMedication, logDose, decrementDose, cancelNotification]);

  // --- Log out-of-window case open (audit only, no auto-mark) ---
  const logOutOfWindowEvent = useCallback(async (event: CaseOpenEvent) => {
    console.log('[CaseDevice] Case opened outside ±30min window — no auto-mark', {
      timestamp: event.timestamp.toISOString(),
      deviceId: event.deviceId,
    });
    // Store as a notification event for audit trail
    await createNotification('case_open_outside_window', {
      metadata: {
        eventTimestamp: event.timestamp.toISOString(),
        deviceId: event.deviceId,
        caseOpenOutsideWindow: true,
      },
    });
  }, [createNotification]);

  // --- Main handler ---
  const handleCaseOpen = useCallback(async (event: CaseOpenEvent) => {
    // 1) Deduplicate
    if (isDuplicateEvent(event)) {
      console.log('[CaseDevice] Duplicate case open event ignored');
      return null;
    }

    setIsProcessingCaseOpen(true);

    const eventTime = event.timestamp;

    // 2) Find eligible doses within ±30 min window
    const eligibleDoses = getEligibleDoses(eventTime);

    if (eligibleDoses.length === 0) {
      // Out-of-window: log event, no auto-mark, no popup
      await logOutOfWindowEvent(event);
      setIsProcessingCaseOpen(false);
      return null;
    }

    // 3) Find the closest dose to the event timestamp
    const closestDose = findClosestDose(eligibleDoses, eventTime);

    if (!closestDose) {
      await logOutOfWindowEvent(event);
      setIsProcessingCaseOpen(false);
      return null;
    }

    // 4) Auto-mark silently (no popup, no confirmation, no extra notification)
    await markDoseFromCase(closestDose, eventTime);
    setIsProcessingCaseOpen(false);

    return { autoMarked: closestDose };
  }, [isDuplicateEvent, getEligibleDoses, findClosestDose, markDoseFromCase, logOutOfWindowEvent]);

  // --- Confirm dose selection from case chooser (legacy, kept for compatibility) ---
  const confirmCaseSelection = useCallback(async (dose: ScheduledDose) => {
    await markDoseFromCase(dose);
  }, [markDoseFromCase]);

  const cancelCaseSelection = useCallback(() => {
    setPendingCaseSelection(null);
  }, []);

  // Simulate case open (for testing without hardware)
  const simulateCaseOpen = useCallback(() => {
    return handleCaseOpen({ timestamp: new Date() });
  }, [handleCaseOpen]);

  // Legacy getDueDoses kept for backward compatibility
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
