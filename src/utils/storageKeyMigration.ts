/**
 * Storage Key Migration Utility
 * Migrates from old 'inventory' key to new 'products' key
 */

import { getFromStorage, saveToStorage } from './mockData';

export const migrateInventoryToProducts = () => {
  const MIGRATION_KEY = 'inventory_to_products_migration_completed';
  
  // Check if migration already ran
  if (localStorage.getItem(MIGRATION_KEY) === 'true') {
    console.log('✅ [Storage Migration] Already migrated inventory → products');
    return;
  }

  console.log('🔄 [Storage Migration] Starting inventory → products migration...');

  try {
    // Get data from both keys
    const inventoryData = getFromStorage('inventory', []);
    const productsData = getFromStorage('products', []);

    if (inventoryData.length > 0 && productsData.length === 0) {
      // Migrate from inventory to products
      console.log(`📦 [Storage Migration] Migrating ${inventoryData.length} items from 'inventory' to 'products'`);
      saveToStorage('products', inventoryData);
      console.log('✅ [Storage Migration] Migration complete!');
    } else if (inventoryData.length > 0 && productsData.length > 0) {
      // Both exist - merge without duplicates
      console.log('⚠️ [Storage Migration] Both keys exist. Merging data...');
      
      const productIds = new Set(productsData.map((p: any) => p.id));
      const uniqueInventoryItems = inventoryData.filter((item: any) => !productIds.has(item.id));
      
      if (uniqueInventoryItems.length > 0) {
        const merged = [...productsData, ...uniqueInventoryItems];
        saveToStorage('products', merged);
        console.log(`✅ [Storage Migration] Merged ${uniqueInventoryItems.length} unique items from inventory`);
      } else {
        console.log('✅ [Storage Migration] No unique items to merge');
      }
    } else if (inventoryData.length === 0 && productsData.length > 0) {
      // Only products exist - all good
      console.log('✅ [Storage Migration] Already using products key');
    } else {
      // Both empty - initialize products
      console.log('✅ [Storage Migration] No data to migrate');
      saveToStorage('products', []);
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('✅ [Storage Migration] Migration marked as complete');

  } catch (error) {
    console.error('❌ [Storage Migration] Error during migration:', error);
  }
};

/**
 * Helper function to ensure consistent key usage
 * Use this instead of direct getFromStorage('inventory') calls
 */
export const getProducts = (workspaceId?: string) => {
  const products = getFromStorage('products', []);
  if (workspaceId) {
    return products.filter((p: any) => p.workspaceId === workspaceId);
  }
  return products;
};

/**
 * Helper function to save products
 */
export const saveProducts = (products: any[]) => {
  saveToStorage('products', products);
};
