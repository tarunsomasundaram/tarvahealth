import { useEffect, useState, useCallback } from 'react';
import { NotificationService, ScheduledNotification } from '@/services/NotificationService';
import { useOnboarding } from '@/contexts/OnboardingContext';

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeReminder, setActiveReminder] = useState<ScheduledNotification | null>(null);
  const { notificationPreferences, addNotification } = useOnboarding();

  useEffect(() => {
    setPermissionStatus(NotificationService.getPermissionStatus());
  }, []);

  useEffect(() => {
    // Set up notification callback for in-app handling
    NotificationService.setNotificationCallback((notification) => {
      if (notificationPreferences.doseReminders) {
        setActiveReminder(notification);
        
        // Add to notification history
        addNotification({
          id: `notif_${Date.now()}`,
          type: 'dose_reminder',
          title: 'Dose reminder sent',
          medicationName: notification.title.replace('Time to take ', ''),
          timestamp: new Date().toISOString(),
          status: 'sent',
          read: false,
        });
      }
    });
  }, [notificationPreferences.doseReminders, addNotification]);

  const requestPermission = useCallback(async () => {
    const granted = await NotificationService.requestPermission();
    setPermissionStatus(NotificationService.getPermissionStatus());
    return granted;
  }, []);

  const dismissActiveReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  const snoozeActiveReminder = useCallback((minutes: number) => {
    if (activeReminder) {
      NotificationService.snoozeNotification(activeReminder.id, minutes);
      setActiveReminder(null);
    }
  }, [activeReminder]);

  const scheduleReminder = useCallback((
    medicationId: string,
    medicationName: string,
    strength: string,
    instructions: string | undefined,
    scheduleId: string,
    timesOfDay: string[],
  ) => {
    if (notificationPreferences.doseReminders) {
      NotificationService.scheduleRemindersForMedication(
        medicationId,
        medicationName,
        strength,
        instructions,
        scheduleId,
        timesOfDay,
      );
    }
  }, [notificationPreferences.doseReminders]);

  const cancelReminder = useCallback((notificationId: string) => {
    NotificationService.cancelNotification(notificationId);
  }, []);

  const cancelAllForMedication = useCallback((medicationId: string) => {
    NotificationService.cancelAllForMedication(medicationId);
  }, []);

  return {
    permissionStatus,
    activeReminder,
    requestPermission,
    dismissActiveReminder,
    snoozeActiveReminder,
    scheduleReminder,
    cancelReminder,
    cancelAllForMedication,
  };
}
