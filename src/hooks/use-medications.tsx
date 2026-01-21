import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id: string;
  user_id: string;
  generic_name: string;
  alt_names: string[] | null;
  strength_value: number | null;
  strength_unit: string | null;
  form: string;
  instructions: string | null;
  is_active: boolean;
  stored_in_case: boolean;
  compartment: number | null;
  refill_quantity_doses: number | null;
  refill_threshold_doses: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  user_id: string;
  frequency_type: string;
  times_of_day: string[];
  days_of_week: number[] | null;
  on_time_window_minutes: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoseLog {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_datetime: string;
  event_type: 'taken' | 'skipped' | 'missed' | 'snoozed';
  event_datetime: string;
  status: 'on_time' | 'late' | null;
  source: 'case' | 'manual';
  notes: string | null;
  created_at: string;
}

export interface ScheduledDose {
  id: string;
  medicationId: string;
  medicationName: string;
  strengthValue: number | null;
  strengthUnit: string | null;
  form: string;
  scheduledTime: Date;
  status: 'pending' | 'taken' | 'skipped' | 'missed' | 'snoozed';
  eventTime?: Date;
  isLate?: boolean;
  source?: 'case' | 'manual';
  snoozeUntil?: Date;
}

export function useMedications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!user) {
      setMedications([]);
      setSchedules([]);
      setDoseLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch medications
      const { data: medsData, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (medsError) throw medsError;
      setMedications(medsData as Medication[]);

      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('user_id', user.id);

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData as MedicationSchedule[]);

      // Fetch dose logs (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: logsData, error: logsError } = await supabase
        .from('dose_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_datetime', ninetyDaysAgo.toISOString())
        .order('scheduled_datetime', { ascending: false });

      if (logsError) throw logsError;
      setDoseLogs(logsData as DoseLog[]);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = useCallback(async (
    medication: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    schedule?: Omit<MedicationSchedule, 'id' | 'user_id' | 'medication_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return { error: new Error('Not authenticated'), medication: null };

    try {
      // Insert medication
      const { data: medData, error: medError } = await supabase
        .from('medications')
        .insert({
          ...medication,
          user_id: user.id,
        })
        .select()
        .single();

      if (medError) throw medError;

      const newMed = medData as Medication;
      setMedications(prev => [newMed, ...prev]);

      // Insert schedule if provided
      if (schedule) {
        const { data: schedData, error: schedError } = await supabase
          .from('medication_schedules')
          .insert({
            ...schedule,
            user_id: user.id,
            medication_id: newMed.id,
          })
          .select()
          .single();

        if (schedError) throw schedError;

        setSchedules(prev => [...prev, schedData as MedicationSchedule]);
      }

      return { error: null, medication: newMed };
    } catch (err) {
      return { error: err as Error, medication: null };
    }
  }, [user]);

  const updateMedication = useCallback(async (id: string, updates: Partial<Medication>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const deleteMedication = useCallback(async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMedications(prev => prev.filter(m => m.id !== id));
      setSchedules(prev => prev.filter(s => s.medication_id !== id));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<MedicationSchedule>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('medication_schedules')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const logDose = useCallback(async (
    medicationId: string,
    scheduledDatetime: Date,
    eventType: DoseLog['event_type'],
    options?: { status?: 'on_time' | 'late'; source?: 'case' | 'manual'; notes?: string }
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('dose_logs')
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          scheduled_datetime: scheduledDatetime.toISOString(),
          event_type: eventType,
          event_datetime: new Date().toISOString(),
          status: options?.status || null,
          source: options?.source || 'manual',
          notes: options?.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setDoseLogs(prev => [data as DoseLog, ...prev]);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const getScheduledDosesForDate = useCallback((date: Date): ScheduledDose[] => {
    const dateStr = date.toISOString().split('T')[0];
    const doses: ScheduledDose[] = [];

    medications.filter(m => m.is_active).forEach(med => {
      const medSchedules = schedules.filter(s => s.medication_id === med.id);
      
      medSchedules.forEach(schedule => {
        const startDate = new Date(schedule.start_date);
        const endDate = schedule.end_date ? new Date(schedule.end_date) : null;
        
        // Check if date is within schedule range
        if (date < startDate || (endDate && date > endDate)) return;

        // Check frequency type
        if (schedule.frequency_type === 'weekly' && schedule.days_of_week) {
          if (!schedule.days_of_week.includes(date.getDay())) return;
        }

        schedule.times_of_day.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date(date);
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Check if there's a log for this dose
          const log = doseLogs.find(l => 
            l.medication_id === med.id && 
            new Date(l.scheduled_datetime).toISOString() === scheduledTime.toISOString()
          );

          doses.push({
            id: `${med.id}-${scheduledTime.toISOString()}`,
            medicationId: med.id,
            medicationName: med.generic_name,
            strengthValue: med.strength_value,
            strengthUnit: med.strength_unit,
            form: med.form,
            scheduledTime,
            status: log ? log.event_type as ScheduledDose['status'] : 'pending',
            eventTime: log ? new Date(log.event_datetime) : undefined,
            isLate: log?.status === 'late',
            source: log?.source,
          });
        });
      });
    });

    return doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }, [medications, schedules, doseLogs]);

  const getAdherenceRate = useCallback((startDate: Date, endDate: Date): number => {
    const logsInRange = doseLogs.filter(log => {
      const logDate = new Date(log.scheduled_datetime);
      return logDate >= startDate && logDate <= endDate;
    });

    if (logsInRange.length === 0) return 0;

    const takenCount = logsInRange.filter(log => log.event_type === 'taken').length;
    return Math.round((takenCount / logsInRange.length) * 100);
  }, [doseLogs]);

  const getOnTimeRate = useCallback((startDate: Date, endDate: Date): number => {
    const takenLogs = doseLogs.filter(log => {
      const logDate = new Date(log.scheduled_datetime);
      return log.event_type === 'taken' && logDate >= startDate && logDate <= endDate;
    });

    if (takenLogs.length === 0) return 0;

    const onTimeCount = takenLogs.filter(log => log.status === 'on_time').length;
    return Math.round((onTimeCount / takenLogs.length) * 100);
  }, [doseLogs]);

  const getScheduleForMedication = useCallback((medicationId: string): MedicationSchedule | undefined => {
    return schedules.find(s => s.medication_id === medicationId);
  }, [schedules]);

  const activeMedications = medications.filter(m => m.is_active);

  return {
    medications,
    activeMedications,
    schedules,
    doseLogs,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    updateSchedule,
    logDose,
    getScheduledDosesForDate,
    getAdherenceRate,
    getOnTimeRate,
    getScheduleForMedication,
    refreshMedications: fetchMedications,
  };
}
