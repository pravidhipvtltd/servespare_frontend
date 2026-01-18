/**
 * Auto-Initialize Demo Users on Page Load
 * This ensures users are always available for login
 */

export function autoInitializeUsers() {
  try {
    const usersJson = localStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Check if we have any users at all
    if (users.length === 0) {
      console.log('⚠️ No users found! Auto-creating demo users...');
      createDemoUsers();
      return;
    }
    
    // Check if we have the required demo users
    const requiredEmails = [
      'superadmin@autoparts.com',
      'admin.chief@servespares.com',
      'admin@autoparts.com',
      'manager@autoparts.com',
      'cashier@autoparts.com'
    ];
    
    const missingUsers = requiredEmails.filter(email => 
      !users.some((u: any) => u.email === email)
    );
    
    if (missingUsers.length > 0) {
      console.log('⚠️ Missing demo users detected:', missingUsers);
      console.log('   Auto-creating missing users...');
      createDemoUsers();
    } else {
      console.log('✅ All demo users present');
    }
  } catch (error) {
    console.error('❌ Error in auto-init users:', error);
  }
}

function createDemoUsers() {
  const usersJson = localStorage.getItem('users');
  const users = usersJson ? JSON.parse(usersJson) : [];
  
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
  
  let addedCount = 0;
  
  // Add missing users
  for (const demoUser of demoUsers) {
    const exists = users.some((u: any) => u.email === demoUser.email);
    if (!exists) {
      users.push(demoUser);
      addedCount++;
      console.log(`   ✅ Created: ${demoUser.name} (${demoUser.email})`);
    }
  }
  
  if (addedCount > 0) {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Auto-created', addedCount, 'demo user(s)');
  }
}

// Auto-run on import
if (typeof window !== 'undefined') {
  // Run immediately
  autoInitializeUsers();
  
  // Also run after a short delay to catch any timing issues
  setTimeout(autoInitializeUsers, 100);
}
