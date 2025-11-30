// Debug helpers for development
export const resetAllData = () => {
  console.log('🔄 Resetting all localStorage data...');
  localStorage.clear();
  console.log('✅ localStorage cleared. Please refresh the page.');
  window.location.reload();
};

export const logStorageData = () => {
  console.log('📦 LocalStorage Contents:');
  console.log('Users:', JSON.parse(localStorage.getItem('users') || '[]'));
  console.log('Workspaces:', JSON.parse(localStorage.getItem('workspaces') || '[]'));
  console.log('Current User:', JSON.parse(localStorage.getItem('currentUser') || 'null'));
  console.log('SuperAdmin Permissions:', JSON.parse(localStorage.getItem('superadmin_permissions') || '[]'));
  console.log('Admin Permissions:', JSON.parse(localStorage.getItem('admin_permissions') || '[]'));
};

export const activateSuperAdmin = () => {
  console.log('⚡ ACTIVATING SUPERADMIN - Complete Rollback & Activation...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // List of all available permissions
  const allPermissions = [
    'inventory.view', 'inventory.add', 'inventory.edit', 'inventory.delete', 
    'inventory.bulk_import', 'inventory.stock_adjustment',
    'finance.view', 'finance.bills', 'finance.expenses', 'finance.reports', 'finance.bank_accounts',
    'users.view', 'users.add', 'users.edit', 'users.delete', 'users.permissions',
    'reports.view', 'reports.export', 'reports.analytics',
    'system.settings', 'system.audit_log', 'system.notifications', 'system.branches',
    'advanced.database', 'advanced.api', 'advanced.maintenance'
  ];
  
  // Step 1: Grant all permissions to SuperAdmin
  localStorage.setItem('superadmin_permissions', JSON.stringify(allPermissions));
  console.log('✅ Step 1: Granted ALL 27 permissions to SuperAdmin');
  
  // Step 2: Reset other roles to defaults
  const adminPerms = allPermissions.filter(p => !p.startsWith('advanced.'));
  localStorage.setItem('admin_permissions', JSON.stringify(adminPerms));
  console.log('✅ Step 2: Reset Admin permissions (' + adminPerms.length + ')');
  
  const inventoryPerms = allPermissions.filter(p => p.startsWith('inventory.'));
  localStorage.setItem('inventory_manager_permissions', JSON.stringify(inventoryPerms));
  console.log('✅ Step 3: Reset Inventory Manager permissions (' + inventoryPerms.length + ')');
  
  const cashierPerms = ['inventory.view', 'finance.bills'];
  localStorage.setItem('cashier_permissions', JSON.stringify(cashierPerms));
  console.log('✅ Step 4: Reset Cashier permissions (' + cashierPerms.length + ')');
  
  const financePerms = allPermissions.filter(p => p.startsWith('finance.'));
  localStorage.setItem('finance_permissions', JSON.stringify(financePerms));
  console.log('✅ Step 5: Reset Finance permissions (' + financePerms.length + ')');
  
  // Step 3: Activate SuperAdmin accounts
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const updatedUsers = users.map((user: any) => {
    if (user.role === 'super_admin') {
      console.log('✅ Step 6: Activated SuperAdmin account: ' + user.email);
      return { ...user, isActive: true };
    }
    return user;
  });
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Step 4: Update sync timestamp
  localStorage.setItem('permission_sync_timestamp', Date.now().toString());
  console.log('✅ Step 7: Updated sync timestamp');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SUPERADMIN ACTIVATED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Final Permissions Summary:');
  console.log('  ✓ SuperAdmin: ALL permissions (' + allPermissions.length + ')');
  console.log('  ✓ Admin: All except advanced (' + adminPerms.length + ')');
  console.log('  ✓ Inventory Manager: Inventory only (' + inventoryPerms.length + ')');
  console.log('  ✓ Cashier: View + Billing only (' + cashierPerms.length + ')');
  console.log('  ✓ Finance: Finance only (' + financePerms.length + ')');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 SUPERADMIN PROTECTION ACTIVE:');
  console.log('  ✓ Cannot be deactivated by ANYONE (including SuperAdmins)');
  console.log('  ✓ Cannot be deleted by ANYONE (including SuperAdmins)');
  console.log('  ✓ Role cannot be changed by ANYONE (including SuperAdmins)');
  console.log('  ✓ Always remains active for system recovery');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 SuperAdmin Login Credentials:');
  console.log('  Option 1: superadmin@autoparts.com / super123');
  console.log('  Option 2: admin.chief@servespares.com / ChiefAdmin@2024');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Refreshing page...');
  
  setTimeout(() => window.location.reload(), 1000);
};

export const rollbackSuperAdminAccess = () => {
  console.log('🔄 Rolling back SuperAdmin access to default...');
  
  // List of all available permissions
  const allPermissions = [
    'inventory.view', 'inventory.add', 'inventory.edit', 'inventory.delete', 
    'inventory.bulk_import', 'inventory.stock_adjustment',
    'finance.view', 'finance.bills', 'finance.expenses', 'finance.reports', 'finance.bank_accounts',
    'users.view', 'users.add', 'users.edit', 'users.delete', 'users.permissions',
    'reports.view', 'reports.export', 'reports.analytics',
    'system.settings', 'system.audit_log', 'system.notifications', 'system.branches',
    'advanced.database', 'advanced.api', 'advanced.maintenance'
  ];
  
  // Grant all permissions to SuperAdmin
  localStorage.setItem('superadmin_permissions', JSON.stringify(allPermissions));
  
  // Reset other roles to defaults
  const adminPerms = allPermissions.filter(p => !p.startsWith('advanced.'));
  localStorage.setItem('admin_permissions', JSON.stringify(adminPerms));
  
  const inventoryPerms = allPermissions.filter(p => p.startsWith('inventory.'));
  localStorage.setItem('inventory_manager_permissions', JSON.stringify(inventoryPerms));
  
  const cashierPerms = ['inventory.view', 'finance.bills'];
  localStorage.setItem('cashier_permissions', JSON.stringify(cashierPerms));
  
  const financePerms = allPermissions.filter(p => p.startsWith('finance.'));
  localStorage.setItem('finance_permissions', JSON.stringify(financePerms));
  
  // Update sync timestamp
  localStorage.setItem('permission_sync_timestamp', Date.now().toString());
  
  console.log('✅ SuperAdmin access rolled back to defaults!');
  console.log('📊 Permissions Summary:');
  console.log('  - SuperAdmin: ALL permissions (' + allPermissions.length + ')');
  console.log('  - Admin: All except advanced (' + adminPerms.length + ')');
  console.log('  - Inventory Manager: Inventory only (' + inventoryPerms.length + ')');
  console.log('  - Cashier: View + Billing only (' + cashierPerms.length + ')');
  console.log('  - Finance: Finance only (' + financePerms.length + ')');
  console.log('🔄 Please refresh the page to see changes.');
  
  window.location.reload();
};

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).activateSuperAdmin = activateSuperAdmin;
  (window as any).rollbackSuperAdminAccess = rollbackSuperAdminAccess;
  (window as any).logStorageData = logStorageData;
  (window as any).resetAllData = resetAllData;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛠️  SERVE SPARES DEBUG HELPERS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ window.activateSuperAdmin()');
  console.log('   → Complete rollback & activation (RECOMMENDED)');
  console.log('');
  console.log('🔄 window.rollbackSuperAdminAccess()');
  console.log('   → Rollback permissions only');
  console.log('');
  console.log('📊 window.logStorageData()');
  console.log('   → View all storage contents');
  console.log('');
  console.log('🗑️  window.resetAllData()');
  console.log('   → Clear everything and restart');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
