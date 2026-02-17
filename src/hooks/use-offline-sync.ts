/**
 * Offline Sync Hook
 * 
 * Monitors connectivity and syncs queued dose actions to Supabase when online.
 * Also handles catch-up alarm checks on app resume.
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import {
  getUnsyncedActions,
  markActionSynced,
  purgeOldSyncedActions,
  QueuedDoseAction,
} from '@/lib/offlineDoseQueue';

export function useOfflineSync(onSyncComplete?: () => void) {
  const { user } = useAuth();
  const syncingRef = useRef(false);

  const syncQueuedActions = useCallback(async () => {
    if (!user || syncingRef.current) return;
    syncingRef.current = true;

    try {
      const actions = await getUnsyncedActions();
      if (actions.length === 0) {
        syncingRef.current = false;
        return;
      }

      console.log(`[OfflineSync] Syncing ${actions.length} queued dose actions`);

      for (const action of actions) {
        try {
          // Check for duplicate in cloud (idempotency)
          const { data: existing } = await supabase
            .from('dose_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('medication_id', action.medication_id)
            .eq('scheduled_datetime', action.scheduled_datetime)
            .eq('event_type', action.event_type)
            .maybeSingle();

          if (existing) {
            // Already synced (e.g. from another device)
            await markActionSynced(action.id);
            continue;
          }

          const { error } = await supabase.from('dose_logs').insert({
            user_id: user.id,
            medication_id: action.medication_id,
            scheduled_datetime: action.scheduled_datetime,
            event_type: action.event_type,
            event_datetime: action.event_datetime,
            status: action.status,
            source: action.source,
            notes: action.notes,
          });

          if (error) {
            console.error(`[OfflineSync] Failed to sync action ${action.id}:`, error);
          } else {
            await markActionSynced(action.id);
            console.log(`[OfflineSync] Synced action ${action.id}`);
          }
        } catch (err) {
          console.error(`[OfflineSync] Error syncing action ${action.id}:`, err);
        }
      }

      // Cleanup old synced entries
      await purgeOldSyncedActions();

      onSyncComplete?.();
    } finally {
      syncingRef.current = false;
    }
  }, [user, onSyncComplete]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineSync] Back online, syncing...');
      syncQueuedActions();
    };

    window.addEventListener('online', handleOnline);

    // Also sync on mount if we're online
    if (navigator.onLine) {
      syncQueuedActions();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueuedActions]);

  // Sync on visibility change (app comes to foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncQueuedActions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncQueuedActions]);

  return { syncQueuedActions };
}
