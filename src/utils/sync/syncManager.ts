/**
 * Sync Manager
 * Coordinates data synchronization between local IndexedDB and remote server
 */

import { offlineDetector } from './offlineDetection';
import {
  getPendingSyncItems,
  markSyncItemComplete,
  markSyncItemFailed,
  getSyncQueueStats,
  clearSyncedItems,
} from './syncQueue';
import { setMetadata, getMetadata } from '../db/indexedDB';

type SyncCallback = (stats: {
  success: number;
  failed: number;
  pending: number;
}) => void;

class SyncManager {
  private isSyncing: boolean = false;
  private syncCallbacks: SyncCallback[] = [];
  private autoSyncInterval: number | null = null;
  private readonly AUTO_SYNC_INTERVAL = 60000; // 1 minute
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.init();
  }

  private init() {
    // Listen to online/offline events
    offlineDetector.addListener((isOnline) => {
      if (isOnline) {
        console.log('🌐 [SyncManager] Connection restored, triggering sync...');
        this.sync();
      } else {
        console.log('📴 [SyncManager] Connection lost, pausing sync');
        this.stopAutoSync();
      }
    });

    // Start auto-sync if online
    if (offlineDetector.getStatus()) {
      this.startAutoSync();
    }

    console.log('🔄 [SyncManager] Initialized');
  }

  /**
   * Perform synchronization
   */
  public async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ [SyncManager] Sync already in progress, skipping...');
      return;
    }

    if (!offlineDetector.getStatus()) {
      console.log('📴 [SyncManager] Offline, cannot sync');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 [SyncManager] Starting sync...');

    try {
      const pendingItems = await getPendingSyncItems();
      console.log(`📊 [SyncManager] Found ${pendingItems.length} pending items`);

      let successCount = 0;
      let failedCount = 0;

      for (const item of pendingItems) {
        // Skip items that exceeded max retries
        if (item.retryCount >= this.MAX_RETRIES) {
          console.warn(
            `⚠️ [SyncManager] Item ${item.id} exceeded max retries, skipping...`
          );
          failedCount++;
          continue;
        }

        try {
          // TODO: Replace with actual API calls when backend is ready
          await this.syncItem(item);
          
          if (item.id) {
            await markSyncItemComplete(item.id);
          }
          successCount++;
        } catch (error: any) {
          console.error(`❌ [SyncManager] Failed to sync item ${item.id}:`, error);
          
          if (item.id) {
            await markSyncItemFailed(item.id, error.message);
          }
          failedCount++;
        }
      }

      // Clean up synced items
      await clearSyncedItems();

      // Update last sync time
      await setMetadata('lastSyncTime', new Date().toISOString());

      const stats = await getSyncQueueStats();
      console.log(`✅ [SyncManager] Sync complete: ${successCount} success, ${failedCount} failed, ${stats.pending} pending`);

      // Notify callbacks
      this.notifyCallbacks({
        success: successCount,
        failed: failedCount,
        pending: stats.pending,
      });
    } catch (error) {
      console.error('❌ [SyncManager] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual item
   * TODO: Replace with actual API calls
   */
  private async syncItem(item: any): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // TODO: Implement actual API calls here
    // Example:
    // if (item.operation === 'create') {
    //   await fetch('/api/create', { method: 'POST', body: JSON.stringify(item.data) });
    // } else if (item.operation === 'update') {
    //   await fetch('/api/update', { method: 'PUT', body: JSON.stringify(item.data) });
    // } else if (item.operation === 'delete') {
    //   await fetch('/api/delete', { method: 'DELETE', body: JSON.stringify(item.data) });
    // }

    console.log(`✓ [SyncManager] Synced ${item.operation} for ${item.storeName}`);
  }

  /**
   * Start auto-sync
   */
  private startAutoSync() {
    if (this.autoSyncInterval) {
      return;
    }

    this.autoSyncInterval = window.setInterval(() => {
      this.sync();
    }, this.AUTO_SYNC_INTERVAL);

    console.log('⏰ [SyncManager] Auto-sync started');
  }

  /**
   * Stop auto-sync
   */
  private stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log('⏹️ [SyncManager] Auto-sync stopped');
    }
  }

  /**
   * Add sync callback
   */
  public addSyncCallback(callback: SyncCallback): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(stats: { success: number; failed: number; pending: number }) {
    this.syncCallbacks.forEach((callback) => {
      try {
        callback(stats);
      } catch (error) {
        console.error('❌ [SyncManager] Error in sync callback:', error);
      }
    });
  }

  /**
   * Get last sync time
   */
  public async getLastSyncTime(): Promise<string | null> {
    return await getMetadata('lastSyncTime');
  }

  /**
   * Force sync now
   */
  public async forceSyncNow(): Promise<void> {
    console.log('🔄 [SyncManager] Force sync triggered');
    await this.sync();
  }

  /**
   * Get sync status
   */
  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

// Singleton instance
export const syncManager = new SyncManager();

console.log('🔄 [SyncManager] Module loaded');
