import { useOnboarding, Notification } from '@/contexts/OnboardingContext';
import { useMedication } from '@/contexts/MedicationContext';

export type NotificationEventType = 
  | 'reminder_sent'
  | 'reminder_snoozed'
  | 'marked_taken'
  | 'marked_skipped'
  | 'late_alert'
  | 'caregiver_notified'
  | 'refill_alert'
  | 'low_battery'
  | 'caregiver_request'
  | 'caregiver_approved';

interface CreateEventParams {
  type: NotificationEventType;
  medicationId?: string;
  medicationName?: string;
  scheduledDatetime?: string;
  metadata?: {
    source?: 'case' | 'manual';
    minutesLate?: number;
    caregiverId?: string;
    snoozeMinutes?: number;
  };
}

export function useNotificationEvents() {
  const { addNotification, notificationPreferences } = useOnboarding();
  const { medications } = useMedication();

  const createEvent = ({
    type,
    medicationId,
    medicationName,
    scheduledDatetime,
    metadata,
  }: CreateEventParams) => {
    // Check if this notification type is enabled
    const shouldNotify = shouldCreateNotification(type, notificationPreferences);
    if (!shouldNotify) return;

    const medName = medicationName || 
      medications.find(m => m.id === medicationId)?.genericName || 
      undefined;

    const notification = buildNotification(type, medName, metadata);
    addNotification(notification);
  };

  const shouldCreateNotification = (
    type: NotificationEventType,
    prefs: typeof notificationPreferences
  ): boolean => {
    switch (type) {
      case 'reminder_sent':
      case 'reminder_snoozed':
      case 'marked_taken':
      case 'marked_skipped':
        return prefs.doseReminders;
      case 'late_alert':
        return prefs.lateDoseAlerts;
      case 'refill_alert':
        return prefs.refillAlerts;
      case 'low_battery':
        return prefs.lowBatteryAlerts;
      case 'caregiver_notified':
      case 'caregiver_request':
      case 'caregiver_approved':
        return prefs.caregiverSharingAlerts;
      default:
        return true;
    }
  };

  const buildNotification = (
    type: NotificationEventType,
    medicationName?: string,
    metadata?: CreateEventParams['metadata']
  ): Notification => {
    const id = `${type}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const configs: Record<NotificationEventType, { 
      notificationType: Notification['type']; 
      title: string; 
      subtitle?: string;
      status?: Notification['status'];
    }> = {
      reminder_sent: {
        notificationType: 'dose_reminder',
        title: 'Dose reminder sent',
        status: 'sent',
      },
      reminder_snoozed: {
        notificationType: 'dose_reminder',
        title: 'Reminder snoozed',
        subtitle: metadata?.snoozeMinutes 
          ? `Snoozed for ${metadata.snoozeMinutes} minutes` 
          : 'Reminder snoozed',
        status: 'sent',
      },
      marked_taken: {
        notificationType: 'dose_taken',
        title: 'Dose marked taken',
        subtitle: metadata?.source === 'case' 
          ? 'Detected from case' 
          : 'Marked manually',
        status: 'sent',
      },
      marked_skipped: {
        notificationType: 'dose_missed',
        title: 'Dose skipped',
        subtitle: 'Marked as skipped',
        status: 'sent',
      },
      late_alert: {
        notificationType: 'dose_late',
        title: 'Dose taken late',
        subtitle: metadata?.minutesLate 
          ? `${metadata.minutesLate} minutes past scheduled time` 
          : 'Taken after scheduled window',
        status: 'late',
      },
      refill_alert: {
        notificationType: 'refill',
        title: 'Refill reminder',
        subtitle: '2 doses remaining in case',
      },
      low_battery: {
        notificationType: 'low_battery',
        title: 'Low battery alert',
        subtitle: 'Case battery is running low',
      },
      caregiver_notified: {
        notificationType: 'caregiver_notified',
        title: 'Caregiver notified',
        subtitle: 'Your caregiver was alerted',
      },
      caregiver_request: {
        notificationType: 'caregiver_request',
        title: 'Caregiver request',
        subtitle: 'New caregiver access request',
      },
      caregiver_approved: {
        notificationType: 'caregiver_approved',
        title: 'Caregiver linked',
        subtitle: 'Caregiver now has access',
        status: 'approved',
      },
    };

    const config = configs[type];

    return {
      id,
      type: config.notificationType,
      title: config.title,
      subtitle: config.subtitle,
      medicationName,
      timestamp,
      status: config.status,
      read: false,
    };
  };

  // Helper functions for common events
  const logDoseTaken = (medicationId: string, source: 'case' | 'manual', isLate: boolean, minutesLate?: number) => {
    createEvent({
      type: 'marked_taken',
      medicationId,
      metadata: { source },
    });

    if (isLate && minutesLate) {
      createEvent({
        type: 'late_alert',
        medicationId,
        metadata: { minutesLate },
      });
    }
  };

  const logDoseSkipped = (medicationId: string) => {
    createEvent({
      type: 'marked_skipped',
      medicationId,
    });
  };

  const logDoseSnoozed = (medicationId: string, snoozeMinutes: number) => {
    createEvent({
      type: 'reminder_snoozed',
      medicationId,
      metadata: { snoozeMinutes },
    });
  };

  const logRefillAlert = (medicationId: string) => {
    createEvent({
      type: 'refill_alert',
      medicationId,
    });
  };

  const logLowBattery = () => {
    createEvent({
      type: 'low_battery',
    });
  };

  return {
    createEvent,
    logDoseTaken,
    logDoseSkipped,
    logDoseSnoozed,
    logRefillAlert,
    logLowBattery,
  };
}