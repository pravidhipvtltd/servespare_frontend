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

// New helper to show all login credentials
export const showLoginCredentials = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
      console.log('❌ No users found in localStorage');
      console.log('💡 Run window.createSuperAdminNow() to create demo users');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    users.forEach((user: any) => {
      console.log(`\n${user.role.toUpperCase().replace('_', ' ')}:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password || '(password not stored)'}`);
      console.log(`  Name:     ${user.name}`);
      console.log(`  Active:   ${user.isActive ? '✅ Yes' : '❌ No'}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${users.length} user(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error reading users:', error);
  }
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

// View all users in storage
export const viewAllUsers = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 ALL USERS IN STORAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
      console.log('❌ No users found in localStorage');
      console.log('💡 Run window.resetDemoUsers() to create demo users');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    console.table(users.map((u: any) => ({
      Email: u.email,
      Password: u.password || '(not stored)',
      Name: u.name,
      Role: u.role,
      Active: u.isActive ? '✅' : '❌',
      WorkspaceId: u.workspaceId || 'N/A'
    })));
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${users.length} user(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error reading users:', error);
  }
};

// Fix demo user passwords
export const fixDemoPasswords = () => {
  console.log('🔧 Fixing demo user passwords...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
      console.log('❌ No users found. Run window.resetDemoUsers() first.');
      return;
    }
    
    const updatedUsers = users.map((user: any) => {
      let password = user.password;
      
      // Fix passwords based on role
      if (user.role === 'super_admin') {
        password = user.email === 'superadmin@autoparts.com' ? 'super123' : 'ChiefAdmin@2024';
      } else if (user.role === 'admin') {
        password = 'admin123';
      } else if (user.role === 'inventory_manager') {
        password = 'inventory123';
      } else if (user.role === 'cashier') {
        password = 'cashier123';
      }
      
      console.log(`✅ Fixed: ${user.email} → ${password}`);
      
      return {
        ...user,
        password,
        isActive: true
      };
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All passwords fixed and users activated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 You can now login with:');
    showLoginCredentials();
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  }
};

// Reset demo users completely
export const resetDemoUsers = () => {
  console.log('🔄 Resetting demo users...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const demoUsers = [
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
    },
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
    },
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
    },
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
    },
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
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(demoUsers));
  
  console.log('✅ Demo users created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 Users created:');
  demoUsers.forEach(u => {
    console.log(`  ${u.role.toUpperCase().replace('_', ' ')}: ${u.email} / ${u.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Try logging in now!');
};

// View database structure for a specific admin
export const viewAdminDatabase = (emailOrWorkspaceId: string) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗄️ ADMIN DATABASE STRUCTURE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const branches = JSON.parse(localStorage.getItem('branches') || '[]');
    const adminAccounts = JSON.parse(localStorage.getItem('admin_accounts') || '[]');
    
    // Find admin by email or workspace
    const admin = users.find((u: any) => 
      u.email === emailOrWorkspaceId || u.workspaceId === emailOrWorkspaceId
    );
    
    if (!admin) {
      console.log('❌ Admin not found:', emailOrWorkspaceId);
      console.log('💡 Available admins:');
      users.filter((u: any) => u.role === 'admin').forEach((u: any) => {
        console.log(`   - ${u.email} (${u.workspaceId})`);
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    const workspaceId = admin.workspaceId;
    const tenantId = admin.tenantId;
    
    console.log('📧 Admin Email:', admin.email);
    console.log('👤 Admin Name:', admin.name);
    console.log('🏢 Business Name:', admin.businessName || 'N/A');
    console.log('🆔 Workspace ID:', workspaceId);
    console.log('🔑 Tenant ID:', tenantId || 'N/A');
    console.log('📋 PAN/VAT:', admin.panVatNumber || 'N/A');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Find related records
    const adminSub = subscriptions.find((s: any) => s.workspaceId === workspaceId);
    const adminWorkspace = workspaces.find((w: any) => w.id === workspaceId);
    const adminBranches = branches.filter((b: any) => b.workspaceId === workspaceId);
    const adminUsers = users.filter((u: any) => u.workspaceId === workspaceId);
    const adminAccount = adminAccounts.find((a: any) => a.email === admin.email);
    
    console.log('💳 SUBSCRIPTION:');
    if (adminSub) {
      console.log('  ✓ Package:', adminSub.package);
      console.log('  ✓ Price: NPR', adminSub.price);
      console.log('  ✓ Status:', adminSub.status);
      console.log('  ✓ Start Date:', new Date(adminSub.startDate).toLocaleDateString());
      console.log('  ✓ Expiry Date:', new Date(adminSub.expiryDate).toLocaleDateString());
      const daysLeft = Math.ceil((new Date(adminSub.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      console.log('  ✓ Days Left:', daysLeft > 0 ? daysLeft : 'EXPIRED');
    } else {
      console.log('  ❌ No subscription found');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 WORKSPACE:');
    if (adminWorkspace) {
      console.log('  ✓ Business:', adminWorkspace.businessName);
      console.log('  ✓ Status:', adminWorkspace.status);
      console.log('  ✓ Created:', new Date(adminWorkspace.createdAt).toLocaleDateString());
    } else {
      console.log('  ❌ No workspace found');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏪 BRANCHES:', adminBranches.length);
    adminBranches.forEach((b: any, index: number) => {
      console.log(`  ${index + 1}. ${b.name} - ${b.location || 'No location'} ${b.isMainBranch ? '(Main)' : ''}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 USERS:', adminUsers.length);
    adminUsers.forEach((u: any, index: number) => {
      console.log(`  ${index + 1}. ${u.name} (${u.role}) - ${u.email} - ${u.isActive ? '✅ Active' : '❌ Inactive'}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ADMIN ACCOUNT:');
    if (adminAccount) {
      console.log('  ✓ Created By:', adminAccount.createdBySuperAdmin ? 'SuperAdmin' : 'Self-registered');
      console.log('  ✓ Demo Mode:', adminAccount.demoMode ? 'Yes' : 'No');
      console.log('  ✓ First Login:', adminAccount.isFirstLogin ? 'Yes' : 'No');
      console.log('  ✓ Due Amount: NPR', adminAccount.dueAmount || 0);
    } else {
      console.log('  ❌ No admin account record found');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database structure complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  }
};

// View all admin databases
export const viewAllAdminDatabases = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗄️ ALL ADMIN DATABASES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUsers = users.filter((u: any) => u.role === 'admin');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }
    
    console.log(`Found ${adminUsers.length} admin(s):\n`);
    
    adminUsers.forEach((admin: any, index: number) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   Business: ${admin.businessName || 'N/A'}`);
      console.log(`   Workspace: ${admin.workspaceId}`);
      console.log(`   Tenant: ${admin.tenantId || 'N/A'}`);
      console.log(`   PAN/VAT: ${admin.panVatNumber || 'N/A'}`);
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 TIP: Use window.viewAdminDatabase("email@example.com")');
    console.log('   to view detailed database structure for a specific admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error viewing databases:', error);
  }
};

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).activateSuperAdmin = activateSuperAdmin;
  (window as any).rollbackSuperAdminAccess = rollbackSuperAdminAccess;
  (window as any).logStorageData = logStorageData;
  (window as any).resetAllData = resetAllData;
  (window as any).showLoginCredentials = showLoginCredentials;
  (window as any).viewAllUsers = viewAllUsers;
  (window as any).fixDemoPasswords = fixDemoPasswords;
  (window as any).resetDemoUsers = resetDemoUsers;
  (window as any).viewAdminDatabase = viewAdminDatabase;
  (window as any).viewAllAdminDatabases = viewAllAdminDatabases;
  
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
  console.log('');
  console.log('🔐 window.showLoginCredentials()');
  console.log('   → Show all login credentials');
  console.log('');
  console.log('👥 window.viewAllUsers()');
  console.log('   → View all users in storage');
  console.log('');
  console.log('🔧 window.fixDemoPasswords()');
  console.log('   → Fix demo user passwords');
  console.log('');
  console.log('🔄 window.resetDemoUsers()');
  console.log('   → Reset demo users completely');
  console.log('');
  console.log('🗄️ window.viewAdminDatabase("email@example.com")');
  console.log('   → View detailed database structure for a specific admin');
  console.log('');
  console.log('🗄️ window.viewAllAdminDatabases()');
  console.log('   → View all admin databases');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}