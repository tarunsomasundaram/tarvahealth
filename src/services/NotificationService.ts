/**
 * NotificationService - Client-side notification scheduling using Web Notifications API
 * Provides local notification scheduling with snooze support
 */

export interface ScheduledNotification {
  id: string;
  medicationId: string;
  scheduledDatetime: string;
  title: string;
  body: string;
  scheduledAt: number; // timestamp when notification should fire
  snoozedUntil?: number;
  payload: {
    medicationId: string;
    scheduledDatetime: string;
    scheduleId: string;
  };
}

class NotificationServiceClass {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private pendingNotifications: ScheduledNotification[] = [];
  private onNotificationCallback?: (notification: ScheduledNotification) => void;
  private permissionGranted = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('tarva-scheduled-notifications');
    if (saved) {
      this.pendingNotifications = JSON.parse(saved);
      // Reschedule pending notifications
      this.pendingNotifications.forEach(n => this.scheduleInternal(n));
    }
  }

  private saveToStorage() {
    localStorage.setItem('tarva-scheduled-notifications', JSON.stringify(this.pendingNotifications));
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const result = await Notification.requestPermission();
    this.permissionGranted = result === 'granted';
    return this.permissionGranted;
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  setNotificationCallback(callback: (notification: ScheduledNotification) => void) {
    this.onNotificationCallback = callback;
  }

  scheduleNotification(notification: Omit<ScheduledNotification, 'id'>): string {
    const id = `${notification.medicationId}_${notification.scheduledDatetime}`;
    
    // Cancel existing notification for this dose
    this.cancelNotification(id);

    const fullNotification: ScheduledNotification = {
      ...notification,
      id,
    };

    this.pendingNotifications.push(fullNotification);
    this.saveToStorage();
    this.scheduleInternal(fullNotification);

    return id;
  }

  private scheduleInternal(notification: ScheduledNotification) {
    const now = Date.now();
    const targetTime = notification.snoozedUntil || notification.scheduledAt;
    const delay = targetTime - now;

    if (delay <= 0) {
      // Fire immediately if time has passed
      this.fireNotification(notification);
      return;
    }

    const timeoutId = setTimeout(() => {
      this.fireNotification(notification);
    }, delay);

    this.scheduledNotifications.set(notification.id, timeoutId);
  }

  private fireNotification(notification: ScheduledNotification) {
    // Remove from scheduled
    this.scheduledNotifications.delete(notification.id);
    this.pendingNotifications = this.pendingNotifications.filter(n => n.id !== notification.id);
    this.saveToStorage();

    // Trigger callback for in-app handling
    this.onNotificationCallback?.(notification);

    // Show browser notification if permitted
    if (this.permissionGranted && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    }
  }

  cancelNotification(id: string) {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
    }
    this.pendingNotifications = this.pendingNotifications.filter(n => n.id !== id);
    this.saveToStorage();
  }

  snoozeNotification(id: string, minutes: number): string {
    const notification = this.pendingNotifications.find(n => n.id === id);
    if (!notification) {
      // Create a new snoozed notification
      return id;
    }

    // Cancel existing
    this.cancelNotification(id);

    // Create snoozed version
    const snoozedNotification: ScheduledNotification = {
      ...notification,
      snoozedUntil: Date.now() + minutes * 60 * 1000,
    };

    this.pendingNotifications.push(snoozedNotification);
    this.saveToStorage();
    this.scheduleInternal(snoozedNotification);

    return id;
  }

  scheduleRemindersForMedication(
    medicationId: string,
    medicationName: string,
    strength: string,
    instructions: string | undefined,
    scheduleId: string,
    timesOfDay: string[],
    daysAhead: number = 14
  ) {
    const now = new Date();
    
    for (let day = 0; day < daysAhead; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      timesOfDay.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(date);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Only schedule if in the future
        if (scheduledTime.getTime() > Date.now()) {
          this.scheduleNotification({
            medicationId,
            scheduledDatetime: `${dateStr}T${time}:00`,
            title: `Time to take ${medicationName}`,
            body: `${strength}${instructions ? ` • ${instructions}` : ''}`,
            scheduledAt: scheduledTime.getTime(),
            payload: {
              medicationId,
              scheduledDatetime: `${dateStr}T${time}:00`,
              scheduleId,
            },
          });
        }
      });
    }
  }

  cancelAllForMedication(medicationId: string) {
    const toCancel = this.pendingNotifications.filter(n => n.medicationId === medicationId);
    toCancel.forEach(n => this.cancelNotification(n.id));
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return [...this.pendingNotifications];
  }

  clearAll() {
    this.scheduledNotifications.forEach((_, id) => this.cancelNotification(id));
    this.pendingNotifications = [];
    this.saveToStorage();
  }
}

export const NotificationService = new NotificationServiceClass();
