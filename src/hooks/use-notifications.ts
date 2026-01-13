import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions, PendingLocalNotificationSchema } from '@capacitor/local-notifications';
import { format, addMinutes, parseISO } from 'date-fns';
import type { Medication, MedicationSchedule, ScheduledDose } from '@/contexts/MedicationContext';

export interface NotificationSettings {
  doseReminders: boolean;
  lateDoseAlerts: boolean;
  refillAlerts: boolean;
  lowBatteryAlerts: boolean;
  caregiverSharingAlerts: boolean;
}

// Generate a stable numeric ID from medication_id + scheduled_datetime
function generateNotificationId(medicationId: string, scheduledDatetime: string): number {
  const str = `${medicationId}_${scheduledDatetime}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Check if running in Capacitor native environment
function isNativeEnvironment(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.isNativePlatform?.();
}

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState<PendingLocalNotificationSchema[]>([]);

  // Request notification permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNativeEnvironment()) {
      console.log('Not in native environment, using web fallback');
      // Web fallback - check if Notification API is available
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        setPermissionGranted(result === 'granted');
        return result === 'granted';
      }
      return false;
    }

    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  // Check current permission status
  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (!isNativeEnvironment()) {
      if ('Notification' in window) {
        const granted = Notification.permission === 'granted';
        setPermissionGranted(granted);
        return granted;
      }
      return false;
    }

    try {
      const result = await LocalNotifications.checkPermissions();
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return false;
    }
  }, []);

  // Schedule a dose reminder notification
  const scheduleDoseReminder = useCallback(async (
    medication: Medication,
    scheduledDatetime: string,
    scheduleId: string
  ): Promise<void> => {
    const notificationId = generateNotificationId(medication.id, scheduledDatetime);
    const scheduledTime = parseISO(scheduledDatetime);
    
    // Don't schedule notifications for past times
    if (scheduledTime <= new Date()) {
      return;
    }

    const title = `Time to take ${medication.genericName}`;
    const body = `${medication.strengthValue}${medication.strengthUnit}${medication.instructions ? ` • ${medication.instructions}` : ''}`;

    if (!isNativeEnvironment()) {
      // Web fallback - schedule using setTimeout (only works while page is open)
      const delay = scheduledTime.getTime() - Date.now();
      if (delay > 0 && 'Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification(title, { body, icon: '/favicon.ico' });
        }, delay);
      }
      return;
    }

    try {
      const options: ScheduleOptions = {
        notifications: [{
          id: notificationId,
          title,
          body,
          schedule: { at: scheduledTime },
          sound: 'default',
          actionTypeId: 'DOSE_REMINDER',
          extra: {
            medicationId: medication.id,
            scheduledDatetime,
            scheduleId,
            patientUserId: medication.patientUserId,
          },
        }],
      };

      await LocalNotifications.schedule(options);
      console.log(`Scheduled notification ${notificationId} for ${scheduledDatetime}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, []);

  // Schedule a snoozed reminder
  const scheduleSnoozeReminder = useCallback(async (
    medication: Medication,
    originalScheduledDatetime: string,
    snoozeMinutes: number
  ): Promise<void> => {
    const snoozeTime = addMinutes(new Date(), snoozeMinutes);
    const snoozeId = generateNotificationId(medication.id, `${originalScheduledDatetime}_snooze`);

    const title = `Reminder: ${medication.genericName}`;
    const body = `${medication.strengthValue}${medication.strengthUnit} (snoozed ${snoozeMinutes} min)`;

    if (!isNativeEnvironment()) {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }, snoozeMinutes * 60 * 1000);
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: snoozeId,
          title,
          body,
          schedule: { at: snoozeTime },
          sound: 'default',
          extra: {
            medicationId: medication.id,
            originalScheduledDatetime,
            isSnooze: true,
          },
        }],
      });
    } catch (error) {
      console.error('Failed to schedule snooze notification:', error);
    }
  }, []);

  // Cancel a specific notification
  const cancelNotification = useCallback(async (
    medicationId: string,
    scheduledDatetime: string
  ): Promise<void> => {
    if (!isNativeEnvironment()) return;

    const notificationId = generateNotificationId(medicationId, scheduledDatetime);
    
    try {
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  // Cancel all pending notifications for a medication
  const cancelMedicationNotifications = useCallback(async (medicationId: string): Promise<void> => {
    if (!isNativeEnvironment()) return;

    try {
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications
        .filter(n => n.extra?.medicationId === medicationId)
        .map(n => ({ id: n.id }));
      
      if (toCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: toCancel });
      }
    } catch (error) {
      console.error('Failed to cancel medication notifications:', error);
    }
  }, []);

  // Schedule notifications for all upcoming doses (rolling 14-day window)
  const scheduleAllReminders = useCallback(async (
    medications: Medication[],
    schedules: MedicationSchedule[],
    settings: NotificationSettings
  ): Promise<void> => {
    if (!settings.doseReminders) return;
    if (!isNativeEnvironment() && !('Notification' in window)) return;

    const now = new Date();
    const endDate = addMinutes(now, 14 * 24 * 60); // 14 days ahead

    for (const medication of medications) {
      if (!medication.isActive) continue;
      
      const schedule = schedules.find(s => s.medicationId === medication.id);
      if (!schedule) continue;

      // Generate scheduled times for the next 14 days
      for (let day = 0; day < 14; day++) {
        const currentDate = new Date(now);
        currentDate.setDate(currentDate.getDate() + day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Check if schedule applies to this day
        if (schedule.frequencyType === 'weekly' && schedule.daysOfWeek) {
          if (!schedule.daysOfWeek.includes(currentDate.getDay())) continue;
        }

        for (const time of schedule.timesOfDay) {
          const scheduledDatetime = `${dateStr}T${time}:00`;
          await scheduleDoseReminder(medication, scheduledDatetime, schedule.id);
        }
      }
    }
  }, [scheduleDoseReminder]);

  // Get pending notifications
  const refreshPendingNotifications = useCallback(async () => {
    if (!isNativeEnvironment()) return;

    try {
      const result = await LocalNotifications.getPending();
      setPendingNotifications(result.notifications);
    } catch (error) {
      console.error('Failed to get pending notifications:', error);
    }
  }, []);

  // Set up notification action listeners
  useEffect(() => {
    if (!isNativeEnvironment()) return;

    const setupListeners = async () => {
      // Register action types (snooze options)
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'DOSE_REMINDER',
            actions: [
              { id: 'mark_taken', title: 'Mark Taken' },
              { id: 'snooze_5', title: 'Snooze 5 min' },
              { id: 'snooze_10', title: 'Snooze 10 min' },
              { id: 'snooze_15', title: 'Snooze 15 min' },
            ],
          },
        ],
      });
    };

    setupListeners();
    checkPermission();
  }, [checkPermission]);

  return {
    permissionGranted,
    pendingNotifications,
    requestPermission,
    checkPermission,
    scheduleDoseReminder,
    scheduleSnoozeReminder,
    cancelNotification,
    cancelMedicationNotifications,
    scheduleAllReminders,
    refreshPendingNotifications,
    isNativeEnvironment: isNativeEnvironment(),
  };
}
