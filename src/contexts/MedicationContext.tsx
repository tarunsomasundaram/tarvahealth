import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { format, parseISO, isToday, isSameDay, startOfDay, addMinutes, isBefore, isAfter } from 'date-fns';

// ==================== DATA MODELS ====================

export interface Medication {
  id: string;
  patientUserId?: string;
  genericName: string;
  altNames?: string[];
  strengthValue: string;
  strengthUnit: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'patch' | 'other';
  instructions?: string;
  isActive: boolean;
  storedInCase: boolean;
  compartment?: string;
  refillQuantityDoses: number;
  refillThresholdDoses: number;
  remainingDoses: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  frequencyType: 'daily' | 'weekly' | 'custom' | 'as-needed';
  timesOfDay: string[]; // HH:mm format
  daysOfWeek?: number[]; // 0-6, Sunday=0
  onTimeWindowMinutes: number;
  startDate: string;
  endDate?: string;
}

export type DoseEventType = 'taken' | 'skipped' | 'missed' | 'snoozed';
export type DoseStatus = 'on_time' | 'late';
export type DoseSource = 'case' | 'manual';
export type SnoozeState = { until: string; count: number } | null;

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledDatetime: string; // ISO datetime
  eventType: DoseEventType;
  eventDatetime: string; // When the event was recorded
  status?: DoseStatus; // Only for taken doses
  source: DoseSource;
  notes?: string;
}

// Display-ready dose for UI
export interface ScheduledDose {
  id: string;
  medicationId: string;
  medication: Medication;
  scheduledTime: string; // Display time like "8:00 AM"
  scheduledDatetime: string; // ISO datetime
  displayStatus: 'pending' | 'taken' | 'skipped' | 'missed' | 'late' | 'snoozed';
  takenTime?: string;
  skippedTime?: string;
  source?: DoseSource;
  onTimeWindowMinutes: number;
  snoozeState?: SnoozeState;
}

// ==================== CONTEXT INTERFACE ====================

interface MedicationContextType {
  // Core data
  medications: Medication[];
  schedules: MedicationSchedule[];
  doseLogs: DoseLog[];
  
  // Medication CRUD
  addMedication: (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>, schedule: Omit<MedicationSchedule, 'id' | 'medicationId'>) => string;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  
  // Schedule CRUD
  updateSchedule: (medicationId: string, updates: Partial<MedicationSchedule>) => void;
  
  // Dose actions
  markDoseTaken: (scheduledDose: ScheduledDose, source?: DoseSource) => void;
  markDoseSkipped: (scheduledDose: ScheduledDose) => void;
  markDoseSnoozed: (scheduledDose: ScheduledDose, snoozeMinutes: number) => void;
  
  // Computed data
  getScheduledDosesForDate: (date: Date) => ScheduledDose[];
  getDoseLogsForDateRange: (startDate: Date, endDate: Date) => DoseLog[];
  getUpcomingDoses: (date: Date) => ScheduledDose[];
  getCompletedDoses: (date: Date) => ScheduledDose[];
  getSkippedDoses: (date: Date) => ScheduledDose[];
  
  // Stats calculations
  calculateAdherenceRate: (startDate: Date, endDate: Date) => number;
  calculateOnTimeRate: (startDate: Date, endDate: Date) => number;
  getCurrentStreak: () => number;
  getAverageDelay: (startDate: Date, endDate: Date) => number;
  
  // For calendar
  getDoseMarkersForMonth: (year: number, month: number) => Record<string, { id: string; status: 'taken' | 'missed' | 'late' | 'pending' | 'skipped' | 'snoozed' }[]>;
}

// ==================== DEFAULT/MOCK DATA ====================

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultMedications = (): { medications: Medication[]; schedules: MedicationSchedule[] } => {
  const now = new Date().toISOString();
  
  const medications: Medication[] = [
    {
      id: 'med_1',
      genericName: 'Lisinopril',
      altNames: ['Prinivil', 'Zestril'],
      strengthValue: '10',
      strengthUnit: 'mg',
      form: 'tablet',
      instructions: 'Take with breakfast',
      isActive: true,
      storedInCase: true,
      compartment: '1',
      refillQuantityDoses: 30,
      refillThresholdDoses: 2,
      remainingDoses: 14,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_2',
      genericName: 'Metformin',
      altNames: ['Glucophage', 'Fortamet'],
      strengthValue: '500',
      strengthUnit: 'mg',
      form: 'tablet',
      instructions: 'Take after meal',
      isActive: true,
      storedInCase: true,
      compartment: '2',
      refillQuantityDoses: 60,
      refillThresholdDoses: 2,
      remainingDoses: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_3',
      genericName: 'Atorvastatin',
      altNames: ['Lipitor'],
      strengthValue: '20',
      strengthUnit: 'mg',
      form: 'tablet',
      instructions: 'Take at bedtime',
      isActive: true,
      storedInCase: true,
      compartment: '3',
      refillQuantityDoses: 30,
      refillThresholdDoses: 2,
      remainingDoses: 8,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_4',
      genericName: 'Omeprazole',
      altNames: ['Prilosec'],
      strengthValue: '20',
      strengthUnit: 'mg',
      form: 'capsule',
      instructions: 'Take before breakfast',
      isActive: true,
      storedInCase: true,
      compartment: '4',
      refillQuantityDoses: 30,
      refillThresholdDoses: 2,
      remainingDoses: 22,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_5',
      genericName: 'Vitamin D3',
      strengthValue: '2000',
      strengthUnit: 'IU',
      form: 'capsule',
      isActive: true,
      storedInCase: false,
      refillQuantityDoses: 90,
      refillThresholdDoses: 2,
      remainingDoses: 45,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const schedules: MedicationSchedule[] = [
    { id: 'sch_1', medicationId: 'med_1', frequencyType: 'daily', timesOfDay: ['08:00'], onTimeWindowMinutes: 30, startDate: now },
    { id: 'sch_2', medicationId: 'med_2', frequencyType: 'daily', timesOfDay: ['09:00'], onTimeWindowMinutes: 30, startDate: now },
    { id: 'sch_3', medicationId: 'med_3', frequencyType: 'daily', timesOfDay: ['22:00'], onTimeWindowMinutes: 60, startDate: now },
    { id: 'sch_4', medicationId: 'med_4', frequencyType: 'daily', timesOfDay: ['07:30'], onTimeWindowMinutes: 30, startDate: now },
    { id: 'sch_5', medicationId: 'med_5', frequencyType: 'daily', timesOfDay: ['12:00'], onTimeWindowMinutes: 60, startDate: now },
  ];

  return { medications, schedules };
};

// Generate some mock dose logs for past days
const createMockDoseLogs = (): DoseLog[] => {
  const logs: DoseLog[] = [];
  const today = new Date();
  
  // Create logs for past 7 days
  for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Med 1 - always taken on time
    logs.push({
      id: generateId(),
      medicationId: 'med_1',
      scheduledDatetime: `${dateStr}T08:00:00`,
      eventType: 'taken',
      eventDatetime: `${dateStr}T08:05:00`,
      status: 'on_time',
      source: 'case',
    });
    
    // Med 2 - sometimes missed
    if (daysAgo !== 3) {
      logs.push({
        id: generateId(),
        medicationId: 'med_2',
        scheduledDatetime: `${dateStr}T09:00:00`,
        eventType: 'taken',
        eventDatetime: `${dateStr}T09:12:00`,
        status: 'on_time',
        source: 'case',
      });
    } else {
      logs.push({
        id: generateId(),
        medicationId: 'med_2',
        scheduledDatetime: `${dateStr}T09:00:00`,
        eventType: 'missed',
        eventDatetime: `${dateStr}T10:00:00`,
        source: 'manual',
      });
    }
    
    // Med 3 - sometimes late
    logs.push({
      id: generateId(),
      medicationId: 'med_3',
      scheduledDatetime: `${dateStr}T22:00:00`,
      eventType: 'taken',
      eventDatetime: daysAgo === 2 ? `${dateStr}T23:30:00` : `${dateStr}T22:10:00`,
      status: daysAgo === 2 ? 'late' : 'on_time',
      source: 'case',
    });
    
    // Med 4 - always taken
    logs.push({
      id: generateId(),
      medicationId: 'med_4',
      scheduledDatetime: `${dateStr}T07:30:00`,
      eventType: 'taken',
      eventDatetime: `${dateStr}T07:35:00`,
      status: 'on_time',
      source: 'case',
    });
    
    // Med 5 - sometimes skipped
    if (daysAgo !== 4) {
      logs.push({
        id: generateId(),
        medicationId: 'med_5',
        scheduledDatetime: `${dateStr}T12:00:00`,
        eventType: 'taken',
        eventDatetime: `${dateStr}T12:05:00`,
        status: 'on_time',
        source: 'manual',
      });
    } else {
      logs.push({
        id: generateId(),
        medicationId: 'med_5',
        scheduledDatetime: `${dateStr}T12:00:00`,
        eventType: 'skipped',
        eventDatetime: `${dateStr}T12:30:00`,
        source: 'manual',
      });
    }
  }
  
  return logs;
};

// ==================== CONTEXT IMPLEMENTATION ====================

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tarva-medications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMedications(parsed.medications || []);
      setSchedules(parsed.schedules || []);
      setDoseLogs(parsed.doseLogs || []);
    }
    // Start with empty medications - user adds during onboarding or later
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (medications.length > 0 || schedules.length > 0 || doseLogs.length > 0) {
      localStorage.setItem('tarva-medications', JSON.stringify({ medications, schedules, doseLogs }));
    }
  }, [medications, schedules, doseLogs]);

  // ==================== MEDICATION CRUD ====================
  
  const addMedication = useCallback((
    med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>,
    schedule: Omit<MedicationSchedule, 'id' | 'medicationId'>
  ): string => {
    const now = new Date().toISOString();
    const medId = `med_${generateId()}`;
    const schedId = `sch_${generateId()}`;
    
    const newMed: Medication = {
      ...med,
      id: medId,
      createdAt: now,
      updatedAt: now,
    };
    
    const newSchedule: MedicationSchedule = {
      ...schedule,
      id: schedId,
      medicationId: medId,
    };
    
    setMedications(prev => [...prev, newMed]);
    setSchedules(prev => [...prev, newSchedule]);
    
    return medId;
  }, []);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    ));
  }, []);

  const removeMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setSchedules(prev => prev.filter(s => s.medicationId !== id));
    // Keep dose logs for history
  }, []);

  const updateSchedule = useCallback((medicationId: string, updates: Partial<MedicationSchedule>) => {
    setSchedules(prev => prev.map(s => 
      s.medicationId === medicationId ? { ...s, ...updates } : s
    ));
  }, []);

  // ==================== DOSE ACTIONS ====================

  const markDoseTaken = useCallback((scheduledDose: ScheduledDose, source: DoseSource = 'manual') => {
    const now = new Date();
    const scheduledTime = parseISO(scheduledDose.scheduledDatetime);
    const windowEnd = addMinutes(scheduledTime, scheduledDose.onTimeWindowMinutes);
    const isLate = isAfter(now, windowEnd);
    
    const newLog: DoseLog = {
      id: generateId(),
      medicationId: scheduledDose.medicationId,
      scheduledDatetime: scheduledDose.scheduledDatetime,
      eventType: 'taken',
      eventDatetime: now.toISOString(),
      status: isLate ? 'late' : 'on_time',
      source,
    };
    
    setDoseLogs(prev => [...prev, newLog]);
    
    // Only decrement remaining doses if source is 'case' and medication is stored in case
    const med = medications.find(m => m.id === scheduledDose.medicationId);
    if (source === 'case' && med && med.storedInCase && med.remainingDoses > 0) {
      updateMedication(med.id, { remainingDoses: med.remainingDoses - 1 });
    }
  }, [medications, updateMedication]);

  const markDoseSkipped = useCallback((scheduledDose: ScheduledDose) => {
    const now = new Date();
    
    const newLog: DoseLog = {
      id: generateId(),
      medicationId: scheduledDose.medicationId,
      scheduledDatetime: scheduledDose.scheduledDatetime,
      eventType: 'skipped',
      eventDatetime: now.toISOString(),
      source: 'manual',
    };
    
    setDoseLogs(prev => [...prev, newLog]);
  }, []);

  // Snooze state stored in localStorage for simplicity
  const [snoozeStates, setSnoozeStates] = useState<Record<string, SnoozeState>>(() => {
    const saved = localStorage.getItem('tarva-snooze-states');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tarva-snooze-states', JSON.stringify(snoozeStates));
  }, [snoozeStates]);

  const markDoseSnoozed = useCallback((scheduledDose: ScheduledDose, snoozeMinutes: number) => {
    const now = new Date();
    const snoozeUntil = addMinutes(now, snoozeMinutes);
    const currentSnooze = snoozeStates[scheduledDose.id];
    
    setSnoozeStates(prev => ({
      ...prev,
      [scheduledDose.id]: {
        until: snoozeUntil.toISOString(),
        count: (currentSnooze?.count || 0) + 1,
      },
    }));

    // Log the snooze event
    const newLog: DoseLog = {
      id: generateId(),
      medicationId: scheduledDose.medicationId,
      scheduledDatetime: scheduledDose.scheduledDatetime,
      eventType: 'snoozed',
      eventDatetime: now.toISOString(),
      source: 'manual',
      notes: `Snoozed for ${snoozeMinutes} minutes`,
    };
    
    setDoseLogs(prev => [...prev, newLog]);
  }, [snoozeStates]);

  // ==================== COMPUTED DATA ====================

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getScheduledDosesForDate = useCallback((date: Date): ScheduledDose[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const doses: ScheduledDose[] = [];
    
    medications.filter(m => m.isActive).forEach(med => {
      const schedule = schedules.find(s => s.medicationId === med.id);
      if (!schedule) return;
      
      // Check if this schedule applies to this date
      const scheduleStart = startOfDay(parseISO(schedule.startDate));
      if (isBefore(startOfDay(date), scheduleStart)) return;
      if (schedule.endDate && isAfter(startOfDay(date), startOfDay(parseISO(schedule.endDate)))) return;
      
      // For weekly schedules, check day of week
      if (schedule.frequencyType === 'weekly' && schedule.daysOfWeek) {
        const dayOfWeek = date.getDay();
        if (!schedule.daysOfWeek.includes(dayOfWeek)) return;
      }
      
      // Create a dose for each time
      schedule.timesOfDay.forEach(time => {
        const scheduledDatetime = `${dateStr}T${time}:00`;
        const doseId = `${med.id}_${scheduledDatetime}`;
        
        // Find if there's a log for this dose
        const log = doseLogs.find(l => 
          l.medicationId === med.id && 
          l.scheduledDatetime === scheduledDatetime
        );
        
        let displayStatus: ScheduledDose['displayStatus'] = 'pending';
        let takenTime: string | undefined;
        let skippedTime: string | undefined;
        let source: DoseSource | undefined;
        
        if (log) {
          if (log.eventType === 'taken') {
            displayStatus = log.status === 'late' ? 'late' : 'taken';
            takenTime = format(parseISO(log.eventDatetime), 'h:mm a');
            source = log.source;
          } else if (log.eventType === 'skipped') {
            displayStatus = 'skipped';
            skippedTime = format(parseISO(log.eventDatetime), 'h:mm a');
            source = log.source;
          } else if (log.eventType === 'missed') {
            displayStatus = 'missed';
          }
        } else {
          // Check if the scheduled time has passed (auto-mark as pending or could be missed)
          const scheduledTime = parseISO(scheduledDatetime);
          const now = new Date();
          const windowEnd = addMinutes(scheduledTime, schedule.onTimeWindowMinutes);
          
          // If it's a past date and no log exists, mark as missed
          if (!isToday(date) && isBefore(date, startOfDay(now))) {
            displayStatus = 'missed';
          }
        }
        
        doses.push({
          id: doseId,
          medicationId: med.id,
          medication: med,
          scheduledTime: formatTimeDisplay(time),
          scheduledDatetime,
          displayStatus,
          takenTime,
          skippedTime,
          source,
          onTimeWindowMinutes: schedule.onTimeWindowMinutes,
        });
      });
    });
    
    // Sort by scheduled time
    return doses.sort((a, b) => a.scheduledDatetime.localeCompare(b.scheduledDatetime));
  }, [medications, schedules, doseLogs]);

  const getUpcomingDoses = useCallback((date: Date): ScheduledDose[] => {
    return getScheduledDosesForDate(date).filter(d => 
      d.displayStatus === 'pending' || d.displayStatus === 'skipped'
    );
  }, [getScheduledDosesForDate]);

  const getCompletedDoses = useCallback((date: Date): ScheduledDose[] => {
    return getScheduledDosesForDate(date).filter(d => 
      d.displayStatus === 'taken' || d.displayStatus === 'late'
    );
  }, [getScheduledDosesForDate]);

  const getSkippedDoses = useCallback((date: Date): ScheduledDose[] => {
    return getScheduledDosesForDate(date).filter(d => d.displayStatus === 'skipped');
  }, [getScheduledDosesForDate]);

  const getDoseLogsForDateRange = useCallback((startDate: Date, endDate: Date): DoseLog[] => {
    return doseLogs.filter(log => {
      const logDate = parseISO(log.scheduledDatetime);
      return !isBefore(logDate, startOfDay(startDate)) && !isAfter(logDate, endDate);
    });
  }, [doseLogs]);

  // ==================== STATS CALCULATIONS ====================

  const calculateAdherenceRate = useCallback((startDate: Date, endDate: Date): number => {
    const logs = getDoseLogsForDateRange(startDate, endDate);
    if (logs.length === 0) return 0;
    
    const takenCount = logs.filter(l => l.eventType === 'taken').length;
    const totalCount = logs.filter(l => l.eventType !== 'skipped').length; // Exclude skipped from total
    
    return totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  }, [getDoseLogsForDateRange]);

  const calculateOnTimeRate = useCallback((startDate: Date, endDate: Date): number => {
    const logs = getDoseLogsForDateRange(startDate, endDate);
    const takenLogs = logs.filter(l => l.eventType === 'taken');
    if (takenLogs.length === 0) return 0;
    
    const onTimeCount = takenLogs.filter(l => l.status === 'on_time').length;
    return Math.round((onTimeCount / takenLogs.length) * 100);
  }, [getDoseLogsForDateRange]);

  const getCurrentStreak = useCallback((): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const doses = getScheduledDosesForDate(date);
      const allTaken = doses.every(d => 
        d.displayStatus === 'taken' || d.displayStatus === 'late' || d.displayStatus === 'pending'
      );
      const hasMissed = doses.some(d => d.displayStatus === 'missed');
      
      if (hasMissed) break;
      if (doses.length > 0 && doses.every(d => d.displayStatus !== 'pending')) {
        streak++;
      } else if (isToday(date)) {
        // Today is in progress, continue counting
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  }, [getScheduledDosesForDate]);

  const getAverageDelay = useCallback((startDate: Date, endDate: Date): number => {
    const logs = getDoseLogsForDateRange(startDate, endDate);
    const takenLogs = logs.filter(l => l.eventType === 'taken');
    if (takenLogs.length === 0) return 0;
    
    let totalDelayMinutes = 0;
    takenLogs.forEach(log => {
      const scheduled = parseISO(log.scheduledDatetime);
      const actual = parseISO(log.eventDatetime);
      const delayMs = actual.getTime() - scheduled.getTime();
      totalDelayMinutes += Math.max(0, delayMs / (1000 * 60));
    });
    
    return Math.round(totalDelayMinutes / takenLogs.length);
  }, [getDoseLogsForDateRange]);

  // ==================== CALENDAR HELPERS ====================

  const getDoseMarkersForMonth = useCallback((year: number, month: number): Record<string, { id: string; status: 'taken' | 'missed' | 'late' | 'pending' | 'skipped' | 'snoozed' }[]> => {
    const result: Record<string, { id: string; status: 'taken' | 'missed' | 'late' | 'pending' | 'skipped' | 'snoozed' }[]> = {};
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'yyyy-MM-dd');
      const doses = getScheduledDosesForDate(new Date(d));
      
      if (doses.length > 0) {
        result[dateKey] = doses.map(dose => ({
          id: dose.medicationId,
          status: dose.displayStatus,
        }));
      }
    }
    
    return result;
  }, [getScheduledDosesForDate]);

  const value = useMemo(() => ({
    medications,
    schedules,
    doseLogs,
    addMedication,
    updateMedication,
    removeMedication,
    updateSchedule,
    markDoseTaken,
    markDoseSkipped,
    markDoseSnoozed,
    getScheduledDosesForDate,
    getDoseLogsForDateRange,
    getUpcomingDoses,
    getCompletedDoses,
    getSkippedDoses,
    calculateAdherenceRate,
    calculateOnTimeRate,
    getCurrentStreak,
    getAverageDelay,
    getDoseMarkersForMonth,
  }), [
    medications,
    schedules,
    doseLogs,
    addMedication,
    updateMedication,
    removeMedication,
    updateSchedule,
    markDoseTaken,
    markDoseSkipped,
    markDoseSnoozed,
    getScheduledDosesForDate,
    getDoseLogsForDateRange,
    getUpcomingDoses,
    getCompletedDoses,
    getSkippedDoses,
    calculateAdherenceRate,
    calculateOnTimeRate,
    getCurrentStreak,
    getAverageDelay,
    getDoseMarkersForMonth,
  ]);

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedication() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
}
