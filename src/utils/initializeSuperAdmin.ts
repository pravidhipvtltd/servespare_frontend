// ==========================================
// INITIALIZE SUPER ADMIN - Development Helper
// ==========================================

/**
 * This utility creates a Super Admin user in localStorage
 * Use this ONLY for development/testing when backend is not available
 * 
 * Usage:
 * 1. Import this file in your App.tsx
 * 2. Call initializeSuperAdminLocalStorage() on mount
 * 3. Or run createSuperAdminNow() in browser console
 */

import { User } from '../types';

export function createSuperAdminInLocalStorage(): void {
  try {
    console.log('🔧 [createSuperAdminInLocalStorage] Starting initialization...');
    
    // Get existing users
    const usersJson = localStorage.getItem('users');
    console.log('   Raw users JSON from localStorage:', usersJson ? 'EXISTS' : 'NULL');
    
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    console.log('   Parsed users array length:', users.length);
    
    // Define demo users - ALIGNED WITH debugHelpers.ts
    const demoUsers: Array<User & { password: string }> = [
      {
        id: 'superadmin-1',
        email: 'superadmin@autoparts.com',
        password: 'super123',
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        branch: '',
        workspaceId: 'superadmin-workspace'
      } as any,
      {
        id: 'superadmin-2',
        email: 'admin.chief@servespares.com',
        password: 'ChiefAdmin@2024',
        name: 'Chief Admin',
        role: 'super_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        branch: '',
        workspaceId: 'superadmin-workspace'
      } as any,
      {
        id: 'admin-1',
        email: 'admin@autoparts.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        branch: '',
        workspaceId: 'workspace-1',
        panVatNumber: '1234567890',
        businessName: 'Demo Auto Parts Store'
      } as any,
      {
        id: 'manager-1',
        email: 'manager@autoparts.com',
        password: 'inventory123',
        name: 'Inventory Manager',
        role: 'inventory_manager',
        isActive: true,
        createdAt: new Date().toISOString(),
        branch: 'Main Branch',
        workspaceId: 'workspace-1'
      } as any,
      {
        id: 'cashier-1',
        email: 'cashier@autoparts.com',
        password: 'cashier123',
        name: 'Cashier User',
        role: 'cashier',
        isActive: true,
        createdAt: new Date().toISOString(),
        branch: 'Main Branch',
        workspaceId: 'workspace-1'
      } as any
    ];
    
    let addedCount = 0;
    let updatedCount = 0;
    
    // Add or update each demo user
    for (const demoUser of demoUsers) {
      const existingIndex = users.findIndex(u => 
        u.email.toLowerCase() === demoUser.email.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // Update existing user to ensure password is correct
        users[existingIndex] = demoUser;
        updatedCount++;
        console.log(`   🔄 Updated: ${demoUser.name} (${demoUser.email}) - Password: ${demoUser.password}`);
      } else {
        // Add new user
        users.push(demoUser);
        addedCount++;
        console.log(`   ✅ Created: ${demoUser.name} (${demoUser.email}) - Password: ${demoUser.password}`);
      }
    }
    
    // CRITICAL: Always save back to localStorage, even if no changes
    console.log('   💾 Saving users to localStorage...');
    localStorage.setItem('users', JSON.stringify(users));
    
    // VERIFY the save worked
    const verifyJson = localStorage.getItem('users');
    const verifyUsers = verifyJson ? JSON.parse(verifyJson) : [];
    console.log('   ✅ VERIFICATION: Users in localStorage:', verifyUsers.length);
    
    if (verifyUsers.length !== users.length) {
      console.error('   ❌ CRITICAL ERROR: Save verification failed!');
      console.error('   Expected:', users.length, 'Got:', verifyUsers.length);
    }
    
    if (addedCount > 0 || updatedCount > 0) {
      // Initialize package and business verification for demo admin user
      const demoAdmin = users.find(u => u.email === 'admin@autoparts.com');
      if (demoAdmin) {
        // Set up business verification
        localStorage.setItem('business_verified', 'true');
        const demoBusinessData = {
          businessName: 'Demo Auto Parts Store',
          panVatNumber: '123456789',
          panVatCertificate: 'demo_certificate_data',
          ownerCitizenship: 'demo_citizenship_data',
          privacyPolicyAccepted: true,
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem('business_verification', JSON.stringify(demoBusinessData));
        
        // Set up demo admin with Professional package
        localStorage.setItem('selected_package', 'professional');
        localStorage.setItem('package_active', 'true');
        localStorage.setItem('trial_active', 'true');
        
        const demoPaymentData = {
          packageId: 'professional',
          packageName: 'Professional',
          amount: 5000,
          currency: 'NPR',
          paymentMethod: 'demo',
          paymentDate: new Date().toISOString(),
          transactionId: `DEMO${Date.now()}`,
          status: 'completed',
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('payment_data', JSON.stringify(demoPaymentData));
        console.log('   📦 Demo admin configured with Professional package + business verification');
      }
      
      console.log('✅ Demo users initialized successfully!');
      console.log('   Added:', addedCount, 'new user(s)');
      console.log('   Updated:', updatedCount, 'existing user(s)');
      console.log('   Total users:', users.length);
      console.log('');
      console.log('📋 Demo Credentials:');
      console.log('   Super Admin:        superadmin@autoparts.com / super123');
      console.log('   Chief Admin:        admin.chief@servespares.com / ChiefAdmin@2024');
      console.log('   Admin:              admin@autoparts.com / admin123');
      console.log('   Inventory Manager:  manager@autoparts.com / inventory123');
      console.log('   Cashier:            cashier@autoparts.com / cashier123');
    } else {
      console.log('ℹ️ All demo users already exist and are up-to-date');
    }
    
  } catch (error) {
    console.error('❌ Failed to create demo users:', error);
    throw error; // Re-throw to catch in caller
  }
}

/**
 * Initialize Super Admin if not exists
 * Call this on app startup for development
 */
export function initializeSuperAdminLocalStorage(): void {
  // Always run initialization (removed development mode check)
  try {
    createSuperAdminInLocalStorage();
  } catch (error) {
    console.error('❌ Failed to initialize Super Admin:', error);
  }
}

/**
 * Force create Super Admin (browser console helper)
 * Run in browser console: window.createSuperAdminNow()
 */
export function createSuperAdminNow(): void {
  createSuperAdminInLocalStorage();
}

/**
 * View all users in localStorage (browser console helper)
 * Run in browser console: window.viewAllUsers()
 */
export function viewAllUsers(): void {
  try {
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    console.log('📋 Users in localStorage:');
    console.log('─────────────────────────────────────');
    
    if (users.length === 0) {
      console.log('   (No users found)');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });
    }
    
    console.log('─────────────────────────────────────');
    console.log(`Total: ${users.length} user(s)`);
    
  } catch (error) {
    console.error('❌ Failed to view users:', error);
  }
}

/**
 * Clear all users from localStorage (browser console helper)
 * Run in browser console: window.clearAllUsers()
 * WARNING: This will delete all user data!
 */
export function clearAllUsers(): void {
  const confirm = window.confirm(
    'Are you sure you want to delete ALL users from localStorage?\n\n' +
    'This action cannot be undone!'
  );
  
  if (confirm) {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    console.log('✅ All users cleared from localStorage');
    console.log('   Please refresh the page');
  } else {
    console.log('❌ Cancelled');
  }
}

/**
 * Reset to Super Admin only (browser console helper)
 * Run in browser console: window.resetToSuperAdmin()
 */
export function resetToSuperAdmin(): void {
  const confirm = window.confirm(
    'Reset to Super Admin only?\n\n' +
    'This will delete all users and create only the Super Admin.'
  );
  
  if (confirm) {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    createSuperAdminInLocalStorage();
    console.log('✅ Reset complete! Please refresh the page.');
  } else {
    console.log('❌ Cancelled');
  }
}

/**
 * Fix passwords for demo users (browser console helper)
 * Run in browser console: window.fixDemoPasswords()
 */
export function fixDemoPasswords(): void {
  try {
    const usersJson = localStorage.getItem('users');
    const users: Array<User & { password?: string }> = usersJson ? JSON.parse(usersJson) : [];
    
    let fixedCount = 0;
    
    // Fix passwords for demo users
    users.forEach(user => {
      if (user.email === 'superadmin@autoparts.com' && user.password !== 'super123') {
        user.password = 'super123';
        fixedCount++;
        console.log('   ✅ Fixed password for Super Admin');
      }
      if (user.email === 'admin.chief@servespares.com' && user.password !== 'ChiefAdmin@2024') {
        user.password = 'ChiefAdmin@2024';
        fixedCount++;
        console.log('   ✅ Fixed password for Chief Admin');
      }
      if (user.email === 'admin@autoparts.com' && user.password !== 'admin123') {
        user.password = 'admin123';
        fixedCount++;
        console.log('   ✅ Fixed password for Admin');
      }
      if (user.email === 'manager@autoparts.com' && user.password !== 'inventory123') {
        user.password = 'inventory123';
        fixedCount++;
        console.log('   ✅ Fixed password for Inventory Manager');
      }
      if (user.email === 'cashier@autoparts.com' && user.password !== 'cashier123') {
        user.password = 'cashier123';
        fixedCount++;
        console.log('   ✅ Fixed password for Cashier');
      }
    });
    
    if (fixedCount > 0) {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ Fixed', fixedCount, 'password(s)');
      console.log('🔄 Please try logging in again');
    } else {
      console.log('ℹ️ All demo user passwords are already correct');
    }
    
  } catch (error) {
    console.error('❌ Failed to fix passwords:', error);
  }
}

/**
 * Completely reset and recreate all demo users (browser console helper)
 * Run in browser console: window.resetDemoUsers()
 */
export function resetDemoUsers(): void {
  try {
    console.log('🔄 Resetting all demo users...');
    
    const usersJson = localStorage.getItem('users');
    let users: Array<User & { password?: string }> = usersJson ? JSON.parse(usersJson) : [];
    
    // Remove all demo users
    users = users.filter(u => 
      !['superadmin@autoparts.com', 'admin.chief@servespares.com', 'admin@autoparts.com', 'manager@autoparts.com', 'cashier@autoparts.com'].includes(u.email)
    );
    
    // Save filtered list
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('   🗑️  Removed all demo users');
    console.log('   ➕ Creating fresh demo users...');
    
    // Recreate demo users
    createSuperAdminInLocalStorage();
    
    console.log('✅ Demo users reset complete!');
    console.log('🔄 Please refresh the page and try logging in again');
    
  } catch (error) {
    console.error('❌ Failed to reset demo users:', error);
  }
}

/**
 * Clear IndexedDB and reset migration flag (browser console helper)
 * Run in browser console: window.clearIndexedDB()
 */
export function clearIndexedDB(): void {
  const confirm = window.confirm(
    'Clear IndexedDB and reset migration?\n\n' +
    'This will delete all data in IndexedDB and allow re-migration from localStorage.\n\n' +
    'LocalStorage data will NOT be deleted.'
  );
  
  if (confirm) {
    try {
      // Clear migration flag
      localStorage.removeItem('migrated_to_indexeddb');
      
      // Delete IndexedDB
      const deleteRequest = indexedDB.deleteDatabase('ServeSpares_DB');
      
      deleteRequest.onsuccess = () => {
        console.log('✅ IndexedDB deleted successfully');
        console.log('✅ Migration flag cleared');
        console.log('📌 Please refresh the page to re-migrate from localStorage');
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ Failed to delete IndexedDB');
      };
      
      deleteRequest.onblocked = () => {
        console.warn('⚠️ IndexedDB deletion blocked. Close all tabs and try again.');
      };
      
    } catch (error) {
      console.error('❌ Failed to clear IndexedDB:', error);
    }
  } else {
    console.log('❌ Cancelled');
  }
}

/**
 * Show all login credentials (browser console helper)
 * Run in browser console: window.showLoginCredentials()
 */
export function showLoginCredentials(): void {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const usersJson = localStorage.getItem('users');
    const users: Array<User & { password?: string }> = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.length === 0) {
      console.log('❌ No users found in localStorage');
      console.log('💡 Run window.createSuperAdminNow() to create demo users');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    users.forEach((user, index) => {
      const roleDisplay = user.role.toUpperCase().replace('_', ' ');
      console.log(`\n${index + 1}. ${roleDisplay}:`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${user.password || '(password not stored)'}`);
      console.log(`   Name:     ${user.name}`);
      console.log(`   Active:   ${user.isActive ? '✅ Yes' : '❌ No'}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${users.length} user(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error reading users:', error);
  }
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).createSuperAdminNow = createSuperAdminNow;
  (window as any).viewAllUsers = viewAllUsers;
  (window as any).clearAllUsers = clearAllUsers;
  (window as any).resetToSuperAdmin = resetToSuperAdmin;
  (window as any).fixDemoPasswords = fixDemoPasswords;
  (window as any).clearIndexedDB = clearIndexedDB;
  (window as any).showLoginCredentials = showLoginCredentials;
  (window as any).resetDemoUsers = resetDemoUsers;
  
  console.log('🔧 Super Admin utilities loaded!');
  console.log('   Run these commands in browser console:');
  console.log('   - window.createSuperAdminNow()    → Create Super Admin');
  console.log('   - window.viewAllUsers()           → View all users');
  console.log('   - window.resetToSuperAdmin()      → Reset to Super Admin only');
  console.log('   - window.clearAllUsers()          → Clear all users');
  console.log('   - window.fixDemoPasswords()       → Fix demo user passwords');
  console.log('   - window.clearIndexedDB()         → Clear IndexedDB and reset migration');
  console.log('   - window.showLoginCredentials()   → Show all login credentials');
  console.log('   - window.resetDemoUsers()         → Reset and recreate all demo users');
}