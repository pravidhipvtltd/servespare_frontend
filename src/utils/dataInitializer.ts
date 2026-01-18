/**
 * Data Initializer - Manages localStorage data initialization
 * System starts with demo users and can be cleared as needed
 */

import { saveToStorage, getFromStorage } from './mockData';

export const STORAGE_KEYS = {
  // User & Auth
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  WORKSPACES: 'workspaces',
  
  // Products & Inventory
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  
  // Automotive
  AUTOMOTIVE_BRANDS: 'automotive_brands',
  AUTOMOTIVE_VEHICLES: 'automotive_vehicles',
  AUTOMOTIVE_MODELS: 'automotive_models',
  
  // Parties (Customers & Vendors combined)
  PARTIES: 'parties',
  
  // Orders & Transactions
  PURCHASE_ORDERS: 'purchase_orders',
  BILLS: 'bills',
  SALES_RETURNS: 'sales_returns',
  
  // Cash Management
  SHIFTS: 'shifts',
  CASH_TRANSACTIONS: 'cashTransactions',
  BANK_ACCOUNTS: 'bank_accounts',
  CASH_IN_HAND: 'cashInHand',
  
  // Reports & Analytics
  TRANSACTIONS: 'transactions',
  DAYBOOK_ENTRIES: 'daybook',
  LEDGER_ENTRIES: 'ledger',
  
  // Settings & Configuration
  SYSTEM_SETTINGS: 'system_settings',
  PRICING_RULES: 'pricing_rules',
  TAX_SETTINGS: 'tax_settings',
  
  // Admin & Super Admin
  ADMIN_ACCOUNTS: 'admin_accounts',
  SUBSCRIPTIONS: 'subscriptions',
  PENDING_VERIFICATIONS: 'pending_verifications',
  AUDIT_LOGS: 'audit_logs',
  ACCESS_CONTROL: 'access_control',
  BRANCHES: 'branches',
};

/**
 * COMPLETELY CLEAR ALL DATA from localStorage
 * This is run on EVERY app startup to ensure database is always empty
 */
export const clearAllData = () => {
  console.log('🗑️ [Database Cleaner] CLEARING ALL DATABASE DATA...');
  
  // Clear all specific storage keys
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✓ Cleared: ${key}`);
  });
  
  // Clear all other potential keys to ensure complete cleanup
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ [Database Cleaner] ALL DATA CLEARED - Database is now completely empty');
  console.log('📋 [Database Cleaner] System is ready for manual data entry');
};

/**
 * Initialize all required localStorage keys with EMPTY values
 * Called AFTER clearAllData to ensure proper structure
 */
export const initializeDataStorage = () => {
  console.log('🧹 [Data Initializer] Starting database initialization...');
  
  // Check if users already exist - if so, DON'T clear everything
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  const hasUsers = existingUsers && JSON.parse(existingUsers).length > 0;
  
  if (hasUsers) {
    console.log('ℹ️ [Data Initializer] Users already exist - skipping full data clear');
    console.log('   Use window.resetAllData() to clear everything and restart');
  } else {
    // FIRST: Clear everything ONLY if no users exist
    clearAllData();
  }
  
  console.log('📦 [Data Initializer] Setting up empty database structure...');
  
  const initializations = [
    // User & Auth - ONLY SUPERADMIN ACCOUNT if no users exist
    { key: STORAGE_KEYS.USERS, default: hasUsers ? JSON.parse(existingUsers) : [
      {
        id: 'superadmin_001',
        email: 'superadmin@servespares.com',
        password: 'admin123',
        role: 'super_admin',
        name: 'Super Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: []
      }
    ]},
    { key: STORAGE_KEYS.WORKSPACES, default: [] },
    
    // Products & Inventory - EMPTY
    { key: STORAGE_KEYS.PRODUCTS, default: [] },
    { key: STORAGE_KEYS.CATEGORIES, default: [] },
    
    // Automotive - EMPTY
    { key: STORAGE_KEYS.AUTOMOTIVE_BRANDS, default: [] },
    { key: STORAGE_KEYS.AUTOMOTIVE_VEHICLES, default: [] },
    { key: STORAGE_KEYS.AUTOMOTIVE_MODELS, default: [] },
    
    // Parties - EMPTY
    { key: STORAGE_KEYS.PARTIES, default: [] },
    
    // Orders & Transactions - EMPTY
    { key: STORAGE_KEYS.PURCHASE_ORDERS, default: [] },
    { key: STORAGE_KEYS.BILLS, default: [] },
    { key: STORAGE_KEYS.SALES_RETURNS, default: [] },
    
    // Cash Management - EMPTY
    { key: STORAGE_KEYS.SHIFTS, default: [] },
    { key: STORAGE_KEYS.CASH_TRANSACTIONS, default: [] },
    { key: STORAGE_KEYS.BANK_ACCOUNTS, default: [] },
    { key: STORAGE_KEYS.CASH_IN_HAND, default: { amount: 0, lastUpdated: new Date().toISOString() } },
    
    // Reports & Analytics - EMPTY
    { key: STORAGE_KEYS.TRANSACTIONS, default: [] },
    { key: STORAGE_KEYS.DAYBOOK_ENTRIES, default: [] },
    { key: STORAGE_KEYS.LEDGER_ENTRIES, default: [] },
    
    // Settings & Configuration - MINIMAL (only system defaults)
    { key: STORAGE_KEYS.SYSTEM_SETTINGS, default: {
      companyName: 'Serve Spares',
      currency: 'NPR',
      taxRate: 13,
      locale: 'en',
      lowStockThreshold: 10
    }},
    { key: STORAGE_KEYS.PRICING_RULES, default: [] },
    { key: STORAGE_KEYS.TAX_SETTINGS, default: {
      defaultTaxRate: 13,
      taxEnabled: true
    }},
    
    // Admin & Super Admin - EMPTY
    { key: STORAGE_KEYS.ADMIN_ACCOUNTS, default: [] },
    { key: STORAGE_KEYS.SUBSCRIPTIONS, default: [] },
    { key: STORAGE_KEYS.PENDING_VERIFICATIONS, default: [] },
    { key: STORAGE_KEYS.AUDIT_LOGS, default: [] },
    { key: STORAGE_KEYS.ACCESS_CONTROL, default: [] },
    { key: STORAGE_KEYS.BRANCHES, default: [] },
  ];

  // Initialize each key - skip users if they already exist
  initializations.forEach(({ key, default: defaultValue }) => {
    if (key === STORAGE_KEYS.USERS && hasUsers) {
      console.log(`   ⏭️ Skipped: ${key} (already exists with ${JSON.parse(existingUsers).length} users)`);
      return;
    }
    
    const existing = localStorage.getItem(key);
    if (!existing) {
      saveToStorage(key, defaultValue);
      console.log(`   ✓ Initialized: ${key}`);
    } else {
      console.log(`   ⏭️ Skipped: ${key} (already exists)`);
    }
    
    // DEBUG: Show what was saved for users key
    if (key === STORAGE_KEYS.USERS) {
      console.log('   📋 [DEBUG] Users data saved:', defaultValue);
      // Verify it was actually saved
      const verifyUsers = getFromStorage(STORAGE_KEYS.USERS, []);
      console.log('   📋 [DEBUG] Users data verified from storage:', verifyUsers);
    }
  });

  if (hasUsers) {
    console.log('✅ [Data Initializer] Database setup complete - Preserved existing users');
  } else {
    console.log('✅ [Data Initializer] Database setup complete - All databases are EMPTY');
  }
  console.log('💡 [Data Initializer] System is ready for manual data entry or custom backend integration');
};

/**
 * Auto-extract unique brands from CSV data
 * Utility function for bulk import
 */
export const autoExtractBrands = (products: any[], workspaceId?: string) => {
  const brands = new Set<string>();
  products.forEach(product => {
    if (product.brand) {
      brands.add(product.brand);
    }
  });
  
  // If workspaceId is provided, save to storage
  if (workspaceId) {
    const existingBrands = getFromStorage('automotive_brands', []);
    const newBrands = Array.from(brands).map(name => ({
      id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      workspaceId,
      createdAt: new Date().toISOString()
    }));
    
    // Merge with existing, avoiding duplicates
    const allBrands = [...existingBrands];
    newBrands.forEach(newBrand => {
      if (!allBrands.some(b => b.name === newBrand.name && b.workspaceId === workspaceId)) {
        allBrands.push(newBrand);
      }
    });
    
    saveToStorage('automotive_brands', allBrands);
    return newBrands;
  }
  
  return Array.from(brands);
};

/**
 * Auto-extract unique categories from CSV data
 * Utility function for bulk import
 */
export const autoExtractCategories = (products: any[], workspaceId?: string) => {
  const categories = new Set<string>();
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  
  // If workspaceId is provided, save to storage
  if (workspaceId) {
    const existingCategories = getFromStorage('categories', []);
    const newCategories = Array.from(categories).map(name => ({
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      workspaceId,
      createdAt: new Date().toISOString()
    }));
    
    // Merge with existing, avoiding duplicates
    const allCategories = [...existingCategories];
    newCategories.forEach(newCat => {
      if (!allCategories.some(c => c.name === newCat.name && c.workspaceId === workspaceId)) {
        allCategories.push(newCat);
      }
    });
    
    saveToStorage('categories', allCategories);
    return newCategories;
  }
  
  return Array.from(categories);
};

/**
 * Get statistics about all data in localStorage
 * Used by SystemVerificationPanel
 */
export const getDataStatistics = () => {
  const stats: any = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          stats[name] = {
            key,
            count: parsed.length,
            type: 'array',
            size: new Blob([data]).size
          };
        } else if (typeof parsed === 'object') {
          stats[name] = {
            key,
            count: Object.keys(parsed).length,
            type: 'object',
            size: new Blob([data]).size
          };
        }
      } else {
        stats[name] = {
          key,
          count: 0,
          type: 'empty',
          size: 0
        };
      }
    } catch (error) {
      stats[name] = {
        key,
        count: 0,
        type: 'error',
        size: 0,
        error: String(error)
      };
    }
  });
  
  return stats;
};

/**
 * Export all data from localStorage as JSON
 * Used by SystemVerificationPanel for backup
 */
export const exportAllData = () => {
  const allData: any = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        allData[key] = JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error exporting ${key}:`, error);
    }
  });
  
  return allData;
};

/**
 * Auto-fix all data issues in localStorage
 * Used by SystemVerificationPanel
 */
export const autoFixAllData = () => {
  let fixCount = 0;
  const fixes: string[] = [];
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const data = localStorage.getItem(key);
      
      // Fix 1: Initialize missing keys
      if (!data) {
        const defaultValue = key.includes('settings') || key === 'cashInHand' ? {} : [];
        saveToStorage(key, defaultValue);
        fixCount++;
        fixes.push(`Initialized missing key: ${key}`);
      }
      
      // Fix 2: Fix corrupted JSON
      else {
        try {
          JSON.parse(data);
        } catch (parseError) {
          const defaultValue = key.includes('settings') || key === 'cashInHand' ? {} : [];
          saveToStorage(key, defaultValue);
          fixCount++;
          fixes.push(`Fixed corrupted data in: ${key}`);
        }
      }
    } catch (error) {
      console.error(`Error fixing ${key}:`, error);
      fixes.push(`Error fixing ${key}: ${error}`);
    }
  });
  
  return {
    fixCount,
    fixes,
    message: `Fixed ${fixCount} issue(s)`
  };
};
