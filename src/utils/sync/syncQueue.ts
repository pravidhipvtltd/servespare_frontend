/**
 * Sync Queue System
 * Manages offline changes and syncs them when online
 */

import { setItem, getAllItems, deleteItem, STORES } from '../db/indexedDB';

export interface SyncQueueItem {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  storeName: string;
  data: any;
  timestamp: string;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (
  operation: 'create' | 'update' | 'delete',
  storeName: string,
  data: any
): Promise<void> => {
  const queueItem: SyncQueueItem = {
    operation,
    storeName,
    data,
    timestamp: new Date().toISOString(),
    synced: false,
    retryCount: 0,
  };

  await setItem(STORES.SYNC_QUEUE, queueItem);
  console.log(`📝 [SyncQueue] Added ${operation} operation for ${storeName}`);
};

/**
 * Get all pending sync items
 */
export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const allItems = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);
  return allItems.filter((item) => !item.synced);
};

/**
 * Mark sync item as completed
 */
export const markSyncItemComplete = async (id: number): Promise<void> => {
  await deleteItem(STORES.SYNC_QUEUE, id);
  console.log(`✅ [SyncQueue] Marked item ${id} as synced`);
};

/**
 * Mark sync item as failed
 */
export const markSyncItemFailed = async (id: number, error: string): Promise<void> => {
  const allItems = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);
  const item = allItems.find((i) => i.id === id);

  if (item) {
    item.retryCount += 1;
    item.lastError = error;
    await setItem(STORES.SYNC_QUEUE, item);
    console.log(`⚠️ [SyncQueue] Marked item ${id} as failed (retry ${item.retryCount})`);
  }
};

/**
 * Clear all synced items
 */
export const clearSyncedItems = async (): Promise<void> => {
  const allItems = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);
  const syncedItems = allItems.filter((item) => item.synced);

  for (const item of syncedItems) {
    if (item.id) {
      await deleteItem(STORES.SYNC_QUEUE, item.id);
    }
  }

  console.log(`🧹 [SyncQueue] Cleared ${syncedItems.length} synced items`);
};

/**
 * Get sync queue statistics
 */
export const getSyncQueueStats = async (): Promise<{
  total: number;
  pending: number;
  synced: number;
  failed: number;
}> => {
  const allItems = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);

  return {
    total: allItems.length,
    pending: allItems.filter((i) => !i.synced && i.retryCount === 0).length,
    synced: allItems.filter((i) => i.synced).length,
    failed: allItems.filter((i) => !i.synced && i.retryCount > 0).length,
  };
};

console.log('🔄 [SyncQueue] Module loaded');
