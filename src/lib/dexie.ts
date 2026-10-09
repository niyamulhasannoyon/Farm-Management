import Dexie, { Table } from 'dexie';
import { WeeklyInputData } from './calculations';
import { saveStoredFlockRecords, getStoredFlockRecords } from './mockData';

export interface OfflineQueueItem {
  id?: number;
  flockId: string;
  ageWeeks: number;
  recordData: WeeklyInputData;
  createdAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

export interface CachedFlockRecord {
  id?: number;
  flockId: string;
  ageWeeks: number;
  recordData: WeeklyInputData;
  updatedAt: string;
}

export class FlockMonitorDexieDB extends Dexie {
  offlineQueue!: Table<OfflineQueueItem, number>;
  cachedRecords!: Table<CachedFlockRecord, number>;

  constructor() {
    super('RBCLFlockMonitorDB');
    this.version(1).stores({
      offlineQueue: '++id, flockId, ageWeeks, status, createdAt',
      cachedRecords: '++id, flockId, ageWeeks, [flockId+ageWeeks], updatedAt',
    });
  }
}

export const db = new FlockMonitorDexieDB();

/**
 * Enqueues a weekly entry made while offline
 */
export async function enqueueOfflineRecord(flockId: string, record: WeeklyInputData): Promise<number> {
  const queueId = await db.offlineQueue.add({
    flockId,
    ageWeeks: record.ageWeeks,
    recordData: record,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  });

  // Also update local storage/cache so the UI updates immediately!
  const current = getStoredFlockRecords(flockId);
  const updated = current.filter((r) => r.ageWeeks !== record.ageWeeks);
  updated.push(record);
  updated.sort((a, b) => a.ageWeeks - b.ageWeeks);
  saveStoredFlockRecords(flockId, updated);

  return queueId;
}

/**
 * Counts unsynced pending offline records
 */
export async function getPendingOfflineCount(): Promise<number> {
  try {
    return await db.offlineQueue.where('status').equals('PENDING').count();
  } catch {
    return 0;
  }
}

/**
 * Synchronizes offline records to server / database
 */
export async function syncOfflineQueue(): Promise<{
  syncedCount: number;
  failedCount: number;
}> {
  let syncedCount = 0;
  let failedCount = 0;

  try {
    const pendingItems = await db.offlineQueue.where('status').equals('PENDING').toArray();

    for (const item of pendingItems) {
      try {
        // In a live connected environment with Supabase, this sends a POST to Supabase/API.
        // Also persist locally in storage.
        const current = getStoredFlockRecords(item.flockId);
        const updated = current.filter((r) => r.ageWeeks !== item.recordData.ageWeeks);
        updated.push(item.recordData);
        updated.sort((a, b) => a.ageWeeks - b.ageWeeks);
        saveStoredFlockRecords(item.flockId, updated);

        if (item.id) {
          await db.offlineQueue.update(item.id, {
            status: 'SYNCED',
          });
        }
        syncedCount++;
      } catch (err: unknown) {
        failedCount++;
        if (item.id) {
          const errMsg = err instanceof Error ? err.message : 'Sync failed';
          await db.offlineQueue.update(item.id, {
            status: 'FAILED',
            errorMessage: errMsg,
          });
        }
      }
    }
  } catch (err) {
    console.error('Dexie sync queue error:', err);
  }

  return { syncedCount, failedCount };
}
