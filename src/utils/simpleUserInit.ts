/**
 * SIMPLE USER INITIALIZATION
 * This is a clean, synchronous user creation system
 */

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin' | 'inventory_manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
  branch: string;
  workspaceId: string;
  panVatNumber?: string;
  businessName?: string;
}

// Define all demo users
export const DEMO_USERS: DemoUser[] = [
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

/**
 * Initialize demo users - SYNCHRONOUS
 * This runs immediately and ensures users exist
 */
export function initializeDemoUsers(): void {
  try {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 INITIALIZING DEMO USERS (Simple Method)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Get existing users
    const usersJson = localStorage.getItem('users');
    let users: DemoUser[] = usersJson ? JSON.parse(usersJson) : [];
    
    console.log('📊 Current users in storage:', users.length);
    
    // Check each demo user
    let created = 0;
    let updated = 0;
    
    for (const demoUser of DEMO_USERS) {
      const existingIndex = users.findIndex(u => 
        u.email.toLowerCase() === demoUser.email.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // Update existing user to ensure correct password
        users[existingIndex] = demoUser;
        updated++;
        console.log(`   🔄 Updated: ${demoUser.email} → ${demoUser.password}`);
      } else {
        // Add new user
        users.push(demoUser);
        created++;
        console.log(`   ✅ Created: ${demoUser.email} → ${demoUser.password}`);
      }
    }
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Setup demo admin configuration
    setupDemoAdminConfig();
    
    // Verify
    const verifyJson = localStorage.getItem('users');
    const verifyUsers = verifyJson ? JSON.parse(verifyJson) : [];
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ INITIALIZATION COMPLETE');
    console.log('   Created:', created, 'user(s)');
    console.log('   Updated:', updated, 'user(s)');
    console.log('   Total in storage:', verifyUsers.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // Show credentials
    showLoginCredentials();
    
  } catch (error) {
    console.error('❌ Failed to initialize demo users:', error);
    throw error;
  }
}

/**
 * Setup demo admin configuration
 */
function setupDemoAdminConfig(): void {
  try {
    // Business verification
    localStorage.setItem('business_verified', 'true');
    const businessData = {
      businessName: 'Demo Auto Parts Store',
      panVatNumber: '123456789',
      panVatCertificate: 'demo_certificate_data',
      ownerCitizenship: 'demo_citizenship_data',
      privacyPolicyAccepted: true,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem('business_verification', JSON.stringify(businessData));
    
    // Package configuration
    localStorage.setItem('selected_package', 'professional');
    localStorage.setItem('package_active', 'true');
    localStorage.setItem('trial_active', 'true');
    
    const paymentData = {
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
    localStorage.setItem('payment_data', JSON.stringify(paymentData));
    
    console.log('   📦 Demo admin configuration complete');
  } catch (error) {
    console.error('❌ Failed to setup demo admin config:', error);
  }
}

/**
 * Show login credentials in console
 */
export function showLoginCredentials(): void {
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f59e0b;');
  console.log('%c🔐 LOGIN CREDENTIALS', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f59e0b;');
  console.log('');
  
  DEMO_USERS.forEach((user, index) => {
    const roleColors = {
      'super_admin': '#ef4444',
      'admin': '#3b82f6',
      'inventory_manager': '#10b981',
      'cashier': '#8b5cf6'
    };
    
    const color = roleColors[user.role] || '#6b7280';
    const roleDisplay = user.role.replace('_', ' ').toUpperCase();
    
    console.log(`%c${index + 1}. ${roleDisplay}:`, `color: ${color}; font-weight: bold;`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log('');
  });
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f59e0b;');
  console.log('%c💡 TIP: Copy credentials from above to login', 'color: #f59e0b; font-style: italic;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f59e0b;');
  console.log('');
}

/**
 * Get all demo users
 */
export function getDemoUsers(): DemoUser[] {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Verify user credentials
 */
export function verifyLogin(email: string, password: string): DemoUser | null {
  const users = getDemoUsers();
  
  console.log('🔐 [verifyLogin] Attempting login...');
  console.log('   Email entered:', email);
  console.log('   Password entered:', password);
  console.log('   Total users:', users.length);
  
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password &&
    u.isActive
  );
  
  if (user) {
    console.log('   ✅ Login successful!');
    console.log('   User:', user.name);
    console.log('   Role:', user.role);
  } else {
    console.log('   ❌ Login failed - Invalid credentials');
    console.log('   Available users:');
    users.forEach(u => {
      console.log(`      - ${u.email} / ${u.password} (${u.isActive ? 'Active' : 'Inactive'})`);
    });
  }
  
  return user || null;
}

// Browser console helpers
if (typeof window !== 'undefined') {
  (window as any).initializeDemoUsers = initializeDemoUsers;
  (window as any).showLoginCredentials = showLoginCredentials;
  (window as any).getDemoUsers = getDemoUsers;
  (window as any).verifyLogin = verifyLogin;
  
  console.log('');
  console.log('🛠️  Simple User Init Loaded!');
  console.log('   - window.initializeDemoUsers()  → Initialize users');
  console.log('   - window.showLoginCredentials() → Show credentials');
  console.log('   - window.getDemoUsers()         → Get all users');
  console.log('   - window.verifyLogin(email, pw) → Test login');
  console.log('');
}
