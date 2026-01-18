/**
 * IndexedDB Database Layer
 * Offline-first storage for hybrid desktop + web application
 * Replaces localStorage with proper database for large datasets
 */

const DB_NAME = 'ServeSpares_DB';
const DB_VERSION = 1;

// Database stores (tables)
export const STORES = {
  USERS: 'users',
  INVENTORY: 'inventory',
  PARTIES: 'parties',
  ORDERS: 'orders',
  BILLS: 'bills',
  BRANCHES: 'branches',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  SYNC_QUEUE: 'sync_queue',
  METADATA: 'metadata',
} as const;

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ [IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ [IndexedDB] Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      console.log('🔧 [IndexedDB] Upgrading database schema...');

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        const usersStore = database.createObjectStore(STORES.USERS, { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('role', 'role', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.INVENTORY)) {
        const inventoryStore = database.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
        inventoryStore.createIndex('sku', 'sku', { unique: true });
        inventoryStore.createIndex('branchId', 'branchId', { unique: false });
        inventoryStore.createIndex('category', 'category', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.PARTIES)) {
        const partiesStore = database.createObjectStore(STORES.PARTIES, { keyPath: 'id' });
        partiesStore.createIndex('type', 'type', { unique: false });
        partiesStore.createIndex('branchId', 'branchId', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.ORDERS)) {
        const ordersStore = database.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
        ordersStore.createIndex('branchId', 'branchId', { unique: false });
        ordersStore.createIndex('status', 'status', { unique: false });
        ordersStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.BILLS)) {
        const billsStore = database.createObjectStore(STORES.BILLS, { keyPath: 'id' });
        billsStore.createIndex('branchId', 'branchId', { unique: false });
        billsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.BRANCHES)) {
        const branchesStore = database.createObjectStore(STORES.BRANCHES, { keyPath: 'id' });
        branchesStore.createIndex('name', 'name', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
        database.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionsStore = database.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
        transactionsStore.createIndex('branchId', 'branchId', { unique: false });
        transactionsStore.createIndex('type', 'type', { unique: false });
        transactionsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.METADATA)) {
        database.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }

      console.log('✅ [IndexedDB] Database schema upgraded');
    };
  });
};

/**
 * Generic CRUD operations
 */

// Create/Update
export const setItem = async (storeName: string, item: any): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      const error = request.error;
      console.error(`[IndexedDB] Failed to set item in ${storeName}:`, error);
      
      // Provide helpful error messages for common issues
      if (error?.name === 'ConstraintError') {
        if (storeName === STORES.USERS && item.email) {
          console.error(`  → Duplicate email detected: ${item.email}`);
          console.error('  → TIP: Run window.clearIndexedDB() to reset the database');
        } else {
          console.error('  → Unique constraint violation detected');
        }
      }
      
      reject(error);
    };
  });
};

// Read single item
export const getItem = async (storeName: string, key: string | number): Promise<any> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// Read all items
export const getAllItems = async (storeName: string): Promise<any[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Query by index
export const getItemsByIndex = async (
  storeName: string,
  indexName: string,
  value: any
): Promise<any[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Delete item
export const deleteItem = async (storeName: string, key: string | number): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Clear all items in store
export const clearStore = async (storeName: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Batch operations
export const batchSet = async (storeName: string, items: any[]): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Metadata operations for sync tracking
 */
export const getMetadata = async (key: string): Promise<any> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.METADATA], 'readonly');
    const store = transaction.objectStore(STORES.METADATA);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error);
  });
};

export const setMetadata = async (key: string, value: any): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.METADATA], 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);
    const request = store.put({ key, value, updatedAt: new Date().toISOString() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Export for debugging
 */
export const exportDatabase = async (): Promise<Record<string, any[]>> => {
  const database = await initDB();
  const result: Record<string, any[]> = {};

  for (const storeName of Object.values(STORES)) {
    result[storeName] = await getAllItems(storeName);
  }

  return result;
};

/**
 * Import data (for initial sync or restore)
 */
export const importDatabase = async (data: Record<string, any[]>): Promise<void> => {
  const database = await initDB();

  for (const [storeName, items] of Object.entries(data)) {
    if (Object.values(STORES).includes(storeName as any)) {
      await batchSet(storeName, items);
    }
  }
};

console.log('📦 [IndexedDB] Module loaded');