/**
 * Offline Dose Queue
 * 
 * Uses IndexedDB to queue dose actions when offline.
 * Syncs to Supabase when connectivity returns.
 * Ensures the dose loop works without internet.
 */

const DB_NAME = 'tarva-offline';
const DB_VERSION = 1;
const STORE_NAME = 'dose_queue';

export interface QueuedDoseAction {
  id: string;
  medication_id: string;
  scheduled_datetime: string; // ISO
  event_type: 'taken' | 'skipped' | 'missed' | 'snoozed';
  event_datetime: string; // ISO
  status: 'on_time' | 'late' | null;
  source: 'case' | 'manual';
  notes: string | null;
  synced: boolean;
  created_at: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('medication_id', 'medication_id', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Add a dose action to the offline queue */
export async function queueDoseAction(action: Omit<QueuedDoseAction, 'id' | 'synced' | 'created_at'>): Promise<string> {
  const db = await openDB();
  const id = crypto.randomUUID();
  const entry: QueuedDoseAction = {
    ...action,
    id,
    synced: false,
    created_at: new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(entry);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all unsynced actions */
export async function getUnsyncedActions(): Promise<QueuedDoseAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('synced');
    const request = index.getAll(IDBKeyRange.only(false));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Mark an action as synced */
export async function markActionSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const entry = getReq.result;
      if (entry) {
        entry.synced = true;
        store.put(entry);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all local actions for a medication+datetime (to check if already logged offline) */
export async function hasLocalAction(medicationId: string, scheduledDatetime: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('medication_id');
    const request = index.getAll(IDBKeyRange.only(medicationId));
    request.onsuccess = () => {
      const match = request.result.find(
        (a: QueuedDoseAction) => a.scheduled_datetime === scheduledDatetime && 
          (a.event_type === 'taken' || a.event_type === 'skipped')
      );
      resolve(!!match);
    };
    request.onerror = () => reject(request.error);
  });
}

/** Purge synced actions older than 7 days */
export async function purgeOldSyncedActions(): Promise<void> {
  const db = await openDB();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const action = cursor.value as QueuedDoseAction;
        if (action.synced && action.created_at < sevenDaysAgo) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
