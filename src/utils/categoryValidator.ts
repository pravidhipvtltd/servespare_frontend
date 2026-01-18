/**
 * Category Validator - Helps identify and fix category issues
 */

import { getFromStorage, saveToStorage } from './mockData';
import { STORAGE_KEYS } from './dataInitializer';

export interface CategoryValidationResult {
  valid: boolean;
  orphanedCategories: string[];
  productsAffected: number;
  availableCategories: string[];
  usedCategories: string[];
}

/**
 * Validate all product categories
 */
export const validateProductCategories = (): CategoryValidationResult => {
  const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const categories = getFromStorage(STORAGE_KEYS.CATEGORIES, []);

  // Get all category names from categories storage
  const availableCategories = categories.map((c: any) => c.name);
  const categorySet = new Set(availableCategories);

  // Get all categories used by products
  const usedCategories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];

  // Find orphaned categories (used but don't exist)
  const orphanedCategories = usedCategories.filter(cat => !categorySet.has(cat));

  // Count affected products
  const productsAffected = products.filter((p: any) => 
    p.category && !categorySet.has(p.category)
  ).length;

  return {
    valid: orphanedCategories.length === 0,
    orphanedCategories,
    productsAffected,
    availableCategories: availableCategories.sort(),
    usedCategories: usedCategories.sort()
  };
};

/**
 * Fix all orphaned categories by removing them from products
 */
export const fixOrphanedCategories = (): { fixed: number; details: string[] } => {
  console.log('🔧 [Category Validator] Fixing orphaned categories...');
  
  const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const categories = getFromStorage(STORAGE_KEYS.CATEGORIES, []);
  const categoryNames = new Set(categories.map((c: any) => c.name));

  let fixedCount = 0;
  const details: string[] = [];

  const fixedProducts = products.map((product: any) => {
    if (product.category && !categoryNames.has(product.category)) {
      fixedCount++;
      const detail = `Removed category "${product.category}" from product: ${product.name || product.sku || product.id}`;
      details.push(detail);
      console.log(`🔧 ${detail}`);
      
      return {
        ...product,
        category: null,
        lastUpdated: new Date().toISOString()
      };
    }
    return product;
  });

  if (fixedCount > 0) {
    saveToStorage(STORAGE_KEYS.PRODUCTS, fixedProducts);
    console.log(`✅ [Category Validator] Fixed ${fixedCount} products!`);
  } else {
    console.log('✅ [Category Validator] No issues found!');
  }

  return {
    fixed: fixedCount,
    details
  };
};

/**
 * Create missing categories automatically
 * (Use with caution - only creates basic categories)
 */
export const createMissingCategories = (vehicleType: '2_wheeler' | '4_wheeler' = '2_wheeler', type: 'local' | 'original' = 'local'): { created: number; categories: string[] } => {
  console.log('🔧 [Category Validator] Creating missing categories...');
  
  const validation = validateProductCategories();
  const existingCategories = getFromStorage(STORAGE_KEYS.CATEGORIES, []);
  const workspaceId = 'ws1'; // Default workspace - adjust as needed

  let createdCount = 0;
  const createdCategories: string[] = [];

  validation.orphanedCategories.forEach((categoryName) => {
    const newCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: categoryName,
      description: `Auto-created category for ${categoryName}`,
      vehicleType,
      type,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    existingCategories.push(newCategory);
    createdCategories.push(categoryName);
    createdCount++;
    console.log(`✅ Created category: ${categoryName}`);
  });

  if (createdCount > 0) {
    saveToStorage(STORAGE_KEYS.CATEGORIES, existingCategories);
    console.log(`✅ [Category Validator] Created ${createdCount} categories!`);
  }

  return {
    created: createdCount,
    categories: createdCategories
  };
};

/**
 * Generate a report of category usage
 */
export const generateCategoryReport = (): string => {
  const validation = validateProductCategories();
  
  let report = `
CATEGORY VALIDATION REPORT
==========================
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Status: ${validation.valid ? '✅ VALID' : '⚠️ ISSUES FOUND'}
Orphaned Categories: ${validation.orphanedCategories.length}
Products Affected: ${validation.productsAffected}
Available Categories: ${validation.availableCategories.length}
Used Categories: ${validation.usedCategories.length}

`;

  if (validation.orphanedCategories.length > 0) {
    report += `
ORPHANED CATEGORIES (used but don't exist)
------------------------------------------
${validation.orphanedCategories.map((cat, i) => `${i + 1}. "${cat}"`).join('\n')}

ACTION REQUIRED
---------------
These categories are referenced by ${validation.productsAffected} product(s) but don't exist in the system.

OPTIONS:
1. Remove these categories from products (recommended)
   → Use: fixOrphanedCategories()

2. Create these categories in the system
   → Use: createMissingCategories()
   → Then assign proper vehicle type and part type

`;
  }

  report += `
AVAILABLE CATEGORIES
--------------------
${validation.availableCategories.length > 0 ? validation.availableCategories.map((cat, i) => `${i + 1}. ${cat}`).join('\n') : 'No categories defined'}

USED CATEGORIES
---------------
${validation.usedCategories.length > 0 ? validation.usedCategories.map((cat, i) => `${i + 1}. ${cat}`).join('\n') : 'No categories in use'}
`;

  return report;
};

/**
 * Export category report to file
 */
export const exportCategoryReport = () => {
  const report = generateCategoryReport();
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `category_report_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  console.log('✅ Category report exported!');
};
