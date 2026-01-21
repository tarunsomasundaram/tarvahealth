import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationEvent {
  id: string;
  user_id: string;
  type: string;
  medication_id: string | null;
  scheduled_datetime: string | null;
  event_datetime: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  dose_reminders: boolean;
  missed_dose_alerts: boolean;
  refill_reminders: boolean;
  case_battery_alerts: boolean;
  caregiver_updates: boolean;
  community_activity: boolean;
  updated_at: string;
}

export function useNotificationsCloud() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch notifications (last 100)
      const { data: notifData, error: notifError } = await supabase
        .from('notification_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (notifError) throw notifError;
      setNotifications(notifData as NotificationEvent[]);

      // Fetch preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefsError) throw prefsError;
      setPreferences(prefsData as NotificationPreferences | null);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const createNotification = useCallback(async (
    type: string,
    options?: {
      medication_id?: string;
      scheduled_datetime?: Date;
      metadata?: Record<string, unknown>;
    }
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const insertData = {
        user_id: user.id,
        type,
        medication_id: options?.medication_id || null,
        scheduled_datetime: options?.scheduled_datetime?.toISOString() || null,
        event_datetime: new Date().toISOString(),
        metadata: options?.metadata || {},
        is_read: false,
      };

      const { data, error } = await supabase
        .from('notification_events')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data as NotificationEvent, ...prev]);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('notification_events')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('notification_events')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const updatePreferences = useCallback(async (
    updates: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data as NotificationPreferences);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    refreshNotifications: fetchNotifications,
  };
}
