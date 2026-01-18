/**
 * Storage Adapter
 * Unified API that works with both localStorage (web fallback) and IndexedDB (desktop/modern browsers)
 * Automatically queues changes for sync when offline
 */

import {
  initDB,
  setItem as idbSetItem,
  getItem as idbGetItem,
  getAllItems as idbGetAllItems,
  deleteItem as idbDeleteItem,
  clearStore as idbClearStore,
  STORES,
} from './indexedDB';
import { addToSyncQueue } from '../sync/syncQueue';
import { offlineDetector } from '../sync/offlineDetection';

// Check if we're in desktop mode
const isDesktopMode = (): boolean => {
  return !!(window as any).electron || localStorage.getItem('appMode') === 'desktop';
};

// Check if IndexedDB is supported
const isIndexedDBSupported = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

/**
 * Initialize storage system
 */
export const initStorage = async (): Promise<void> => {
  if (isIndexedDBSupported()) {
    await initDB();
    console.log('✅ [StorageAdapter] Using IndexedDB');
  } else {
    console.log('⚠️ [StorageAdapter] IndexedDB not supported, falling back to localStorage');
  }
};

/**
 * Set item (Create/Update)
 */
export const setStorageItem = async (
  storeName: string,
  item: any,
  queueForSync: boolean = true
): Promise<void> => {
  if (isIndexedDBSupported()) {
    // Use IndexedDB
    await idbSetItem(storeName, item);

    // Queue for sync if we're offline or it's a desktop app
    if (queueForSync && (isDesktopMode() || !offlineDetector.getStatus())) {
      await addToSyncQueue('update', storeName, item);
    }
  } else {
    // Fallback to localStorage
    const key = `${storeName}_data`;
    const existing = localStorage.getItem(key);
    const items = existing ? JSON.parse(existing) : [];
    
    // Update or add item
    const index = items.findIndex((i: any) => i.id === (item as any).id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    
    localStorage.setItem(key, JSON.stringify(items));
  }
};

/**
 * Get item
 */
export const getStorageItem = async (
  storeName: string,
  id: string | number
): Promise<any> => {
  if (isIndexedDBSupported()) {
    return await idbGetItem(storeName, id);
  } else {
    // Fallback to localStorage
    const key = `${storeName}_data`;
    const existing = localStorage.getItem(key);
    if (!existing) return null;
    
    const items = JSON.parse(existing);
    return items.find((i: any) => i.id === id) || null;
  }
};

/**
 * Get all items
 */
export const getAllStorageItems = async (storeName: string): Promise<any[]> => {
  if (isIndexedDBSupported()) {
    return await idbGetAllItems(storeName);
  } else {
    // Fallback to localStorage
    const key = `${storeName}_data`;
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  }
};

/**
 * Delete item
 */
export const deleteStorageItem = async (
  storeName: string,
  id: string | number,
  queueForSync: boolean = true
): Promise<void> => {
  if (isIndexedDBSupported()) {
    await idbDeleteItem(storeName, id);

    // Queue for sync
    if (queueForSync && (isDesktopMode() || !offlineDetector.getStatus())) {
      await addToSyncQueue('delete', storeName, { id });
    }
  } else {
    // Fallback to localStorage
    const key = `${storeName}_data`;
    const existing = localStorage.getItem(key);
    if (!existing) return;
    
    const items = JSON.parse(existing);
    const filtered = items.filter((i: any) => i.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
};

/**
 * Clear store
 */
export const clearStorage = async (storeName: string): Promise<void> => {
  if (isIndexedDBSupported()) {
    await idbClearStore(storeName);
  } else {
    // Fallback to localStorage
    const key = `${storeName}_data`;
    localStorage.removeItem(key);
  }
};

/**
 * Migration helper: Move data from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
  if (!isIndexedDBSupported()) {
    console.log('⚠️ [StorageAdapter] Cannot migrate: IndexedDB not supported');
    return;
  }

  console.log('🔄 [StorageAdapter] Starting migration from localStorage to IndexedDB...');

  const storesToMigrate = [
    { localKey: 'users', idbStore: STORES.USERS },
    { localKey: 'inventory', idbStore: STORES.INVENTORY },
    { localKey: 'parties', idbStore: STORES.PARTIES },
    { localKey: 'orders', idbStore: STORES.ORDERS },
    { localKey: 'bills', idbStore: STORES.BILLS },
    { localKey: 'branches', idbStore: STORES.BRANCHES },
    { localKey: 'categories', idbStore: STORES.CATEGORIES },
    { localKey: 'transactions', idbStore: STORES.TRANSACTIONS },
  ];

  let migratedCount = 0;

  for (const { localKey, idbStore } of storesToMigrate) {
    try {
      const data = localStorage.getItem(localKey);
      if (data) {
        const items = JSON.parse(data);
        if (Array.isArray(items) && items.length > 0) {
          // Special handling for users store to prevent duplicate email errors
          if (idbStore === STORES.USERS) {
            // Get existing users from IndexedDB
            const existingUsers = await idbGetAllItems(idbStore);
            const existingEmails = new Set(existingUsers.map((u: any) => u.email?.toLowerCase()));
            
            // Filter out users with duplicate emails
            const uniqueUsers = items.filter((user: any) => {
              const email = user.email?.toLowerCase();
              if (!email) return false; // Skip users without email
              if (existingEmails.has(email)) {
                console.log(`  ⚠️ Skipping duplicate email: ${user.email}`);
                return false;
              }
              existingEmails.add(email);
              return true;
            });
            
            // Migrate unique users only
            for (const item of uniqueUsers) {
              try {
                await idbSetItem(idbStore, item);
                migratedCount++;
              } catch (err) {
                console.error(`  ⚠️ Failed to migrate user ${item.email}:`, err);
              }
            }
            console.log(`  ✓ Migrated ${uniqueUsers.length}/${items.length} unique users from ${localKey}`);
          } else {
            // For non-user stores, migrate all items
            for (const item of items) {
              try {
                await idbSetItem(idbStore, item);
                migratedCount++;
              } catch (err) {
                console.error(`  ⚠️ Failed to migrate item from ${localKey}:`, err);
              }
            }
            console.log(`  ✓ Migrated ${items.length} items from ${localKey}`);
          }
        }
      }
    } catch (error) {
      console.error(`  ✗ Failed to migrate ${localKey}:`, error);
    }
  }

  console.log(`✅ [StorageAdapter] Migration complete: ${migratedCount} items migrated`);
  
  // Mark migration as complete
  localStorage.setItem('migrated_to_indexeddb', 'true');
};

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  return (
    isIndexedDBSupported() &&
    !localStorage.getItem('migrated_to_indexeddb') &&
    localStorage.getItem('users') !== null
  );
};

/**
 * Helper: Get storage type
 */
export const getStorageType = (): 'indexeddb' | 'localstorage' => {
  return isIndexedDBSupported() ? 'indexeddb' : 'localstorage';
};

console.log('💾 [StorageAdapter] Module loaded');