// Fixed Roles & Permissions View - Fully Functional
import React, { useState } from 'react';
import { 
  Shield, Lock, Check, X, Save, Users, Package, DollarSign, 
  FileText, Settings, AlertCircle, RefreshCw
} from 'lucide-react';
import { User } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  [role: string]: string[];
}

// Define all available permissions
const ALL_PERMISSIONS: Permission[] = [
  // Dashboard Permissions
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access main dashboard', category: 'Dashboard' },
  { id: 'view_analytics', name: 'View Analytics', description: 'View reports and analytics', category: 'Dashboard' },
  
  // User Management Permissions
  { id: 'view_users', name: 'View Users', description: 'View user list', category: 'Users' },
  { id: 'create_users', name: 'Create Users', description: 'Add new users', category: 'Users' },
  { id: 'edit_users', name: 'Edit Users', description: 'Modify user details', category: 'Users' },
  { id: 'delete_users', name: 'Delete Users', description: 'Remove users', category: 'Users' },
  
  // Inventory Permissions
  { id: 'view_inventory', name: 'View Inventory', description: 'View inventory items', category: 'Inventory' },
  { id: 'create_inventory', name: 'Add Inventory', description: 'Add new items', category: 'Inventory' },
  { id: 'edit_inventory', name: 'Edit Inventory', description: 'Modify inventory', category: 'Inventory' },
  { id: 'delete_inventory', name: 'Delete Inventory', description: 'Remove items', category: 'Inventory' },
  { id: 'adjust_stock', name: 'Adjust Stock', description: 'Adjust stock levels', category: 'Inventory' },
  
  // Billing Permissions
  { id: 'view_bills', name: 'View Bills', description: 'View sales bills', category: 'Billing' },
  { id: 'create_bills', name: 'Create Bills', description: 'Create new bills', category: 'Billing' },
  { id: 'edit_bills', name: 'Edit Bills', description: 'Modify existing bills', category: 'Billing' },
  { id: 'delete_bills', name: 'Delete Bills', description: 'Remove bills', category: 'Billing' },
  { id: 'process_refunds', name: 'Process Refunds', description: 'Handle refunds', category: 'Billing' },
  
  // Finance Permissions
  { id: 'view_finance', name: 'View Finance', description: 'View financial data', category: 'Finance' },
  { id: 'view_expenses', name: 'View Expenses', description: 'View expense records', category: 'Finance' },
  { id: 'create_expenses', name: 'Add Expenses', description: 'Record new expenses', category: 'Finance' },
  { id: 'approve_expenses', name: 'Approve Expenses', description: 'Approve expense claims', category: 'Finance' },
  { id: 'view_profit_loss', name: 'View P&L', description: 'View profit & loss', category: 'Finance' },
  
  // Parties Permissions
  { id: 'view_parties', name: 'View Parties', description: 'View customers/suppliers', category: 'Parties' },
  { id: 'create_parties', name: 'Add Parties', description: 'Add customers/suppliers', category: 'Parties' },
  { id: 'edit_parties', name: 'Edit Parties', description: 'Modify party details', category: 'Parties' },
  { id: 'delete_parties', name: 'Delete Parties', description: 'Remove parties', category: 'Parties' },
  
  // Settings Permissions
  { id: 'view_settings', name: 'View Settings', description: 'Access settings', category: 'Settings' },
  { id: 'edit_settings', name: 'Edit Settings', description: 'Modify system settings', category: 'Settings' },
  { id: 'manage_branches', name: 'Manage Branches', description: 'Add/edit branches', category: 'Settings' },
];

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  super_admin: ALL_PERMISSIONS.map(p => p.id), // All permissions
  admin: [
    'view_dashboard', 'view_analytics',
    'view_users', 'create_users', 'edit_users',
    'view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory', 'adjust_stock',
    'view_bills', 'create_bills', 'edit_bills', 'delete_bills',
    'view_finance', 'view_expenses',
    'view_parties', 'create_parties', 'edit_parties', 'delete_parties',
    'view_settings'
  ],
  inventory_manager: [
    'view_dashboard',
    'view_inventory', 'create_inventory', 'edit_inventory', 'adjust_stock',
    'view_parties', 'create_parties', 'edit_parties',
  ],
  cashier: [
    'view_dashboard',
    'view_inventory',
    'view_bills', 'create_bills',
    'view_parties', 'create_parties',
  ],
  finance: [
    'view_dashboard', 'view_analytics',
    'view_bills',
    'view_finance', 'view_expenses', 'create_expenses', 'approve_expenses', 'view_profit_loss',
    'view_parties',
  ],
};

// Role configuration with proper Tailwind classes
const ROLE_CONFIG = {
  super_admin: {
    name: 'Super Admin',
    icon: Shield,
    description: 'Full system access',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700'
  },
  admin: {
    name: 'Admin',
    icon: Users,
    description: 'Manage store operations',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700'
  },
  inventory_manager: {
    name: 'Inventory Manager',
    icon: Package,
    description: 'Manage inventory',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700'
  },
  cashier: {
    name: 'Cashier',
    icon: DollarSign,
    description: 'Process sales',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700'
  },
  finance: {
    name: 'Finance',
    icon: FileText,
    description: 'Financial management',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700'
  }
};

interface RolesPermissionsFixedProps {
  users: User[];
  onUpdate: () => void;
}

export const RolesPermissionsFixed: React.FC<RolesPermissionsFixedProps> = ({ users, onUpdate }) => {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    const saved = getFromStorage('rolePermissions', null);
    return saved || DEFAULT_ROLE_PERMISSIONS;
  });
  
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [hasChanges, setHasChanges] = useState(false);

  const selectedPermissions = rolePermissions[selectedRole] || [];

  // Group permissions by category
  const permissionsByCategory = ALL_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as { [category: string]: Permission[] });

  const togglePermission = (permissionId: string) => {
    if (selectedRole === 'super_admin') {
      alert('⚠️ Super Admin permissions cannot be modified - Super Admin always has full access');
      return;
    }

    const currentPerms = rolePermissions[selectedRole] || [];
    const newPerms = currentPerms.includes(permissionId)
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: newPerms
    });
    setHasChanges(true);
  };

  const savePermissions = () => {
    saveToStorage('rolePermissions', rolePermissions);
    setHasChanges(false);
    alert('✅ Permissions saved successfully! All users with these roles will have updated access.');
  };

  const resetToDefault = () => {
    if (window.confirm('⚠️ Reset ALL permissions to default for ALL roles? This will undo all custom changes.')) {
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      saveToStorage('rolePermissions', DEFAULT_ROLE_PERMISSIONS);
      setHasChanges(false);
      alert('✅ All permissions reset to default!');
    }
  };

  const getUserCountByRole = (roleId: string) => {
    return users.filter(u => u.role === roleId).length;
  };

  const getPermissionCount = (roleId: string) => {
    return (rolePermissions[roleId] || []).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Roles & Permissions</h2>
          <p className="text-gray-600">Configure access control - Permissions take effect immediately after saving</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
          {hasChanges && (
            <button
              onClick={savePermissions}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2 animate-pulse"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-bold">⚠️ You have unsaved changes</p>
            <p className="text-yellow-700 text-sm mt-1">Click "Save Changes" to apply your modifications. Users will be restricted based on these permissions.</p>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-semibold">How Permissions Work:</p>
            <p className="text-blue-700 text-sm mt-1">
              When you disable a permission for a role, all users with that role will lose access to that feature immediately after saving. 
              Super Admin always has full access and cannot be restricted.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selector - Left Side */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Select Role
            </h3>
            <div className="space-y-2">
              {Object.entries(ROLE_CONFIG).map(([roleId, config]) => {
                const userCount = getUserCountByRole(roleId);
                const permCount = getPermissionCount(roleId);
                const isSelected = selectedRole === roleId;
                const Icon = config.icon;
                
                return (
                  <button
                    key={roleId}
                    onClick={() => setSelectedRole(roleId)}
                    className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                      isSelected
                        ? `${config.bgColor} ${config.borderColor}`
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900 font-semibold">{config.name}</div>
                        <div className="text-gray-500 text-xs">{config.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{userCount} {userCount === 1 ? 'user' : 'users'}</span>
                      <span className={`px-2 py-1 rounded-full font-bold ${
                        isSelected ? `${config.badgeBg} ${config.badgeText}` : 'bg-gray-200 text-gray-600'
                      }`}>
                        {permCount} permissions
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permission Editor - Right Side */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-gray-900 font-bold text-lg flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-blue-600" />
                  {ROLE_CONFIG[selectedRole as keyof typeof ROLE_CONFIG]?.name} Permissions
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedRole === 'super_admin' 
                    ? '🔒 Super Admin has all permissions (cannot be modified)'
                    : '✏️ Click any permission below to enable/disable for this role'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-bold text-3xl">{selectedPermissions.length}</div>
                <div className="text-gray-600 text-sm">of {ALL_PERMISSIONS.length}</div>
              </div>
            </div>

            {selectedRole === 'super_admin' && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-bold">🔒 Full System Access</p>
                  <p className="text-red-700 text-sm">Super Admin role has unrestricted access to all {ALL_PERMISSIONS.length} features and cannot be customized for security reasons.</p>
                </div>
              </div>
            )}

            {/* Permissions by Category */}
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                const categoryEnabled = permissions.filter(p => selectedPermissions.includes(p.id)).length;
                const categoryTotal = permissions.length;
                
                return (
                  <div key={category} className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-gray-900 font-bold flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                        {category}
                      </h4>
                      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {categoryEnabled} / {categoryTotal} enabled
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => {
                        const isEnabled = selectedPermissions.includes(permission.id);
                        const isDisabled = selectedRole === 'super_admin';
                        
                        return (
                          <button
                            key={permission.id}
                            onClick={() => togglePermission(permission.id)}
                            disabled={isDisabled}
                            className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all text-left ${
                              isDisabled
                                ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-70'
                                : isEnabled
                                ? 'bg-green-50 border-green-500 hover:shadow-md hover:scale-105'
                                : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                              isEnabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {isEnabled ? (
                                <Check className="w-5 h-5 text-white font-bold" />
                              ) : (
                                <X className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`font-semibold text-sm mb-1 ${
                                isEnabled ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {permission.name}
                              </div>
                              <div className={`text-xs ${
                                isEnabled ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {permission.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(ROLE_CONFIG).map(([roleId, config]) => {
          const permissions = getPermissionCount(roleId);
          const userCount = getUserCountByRole(roleId);
          const Icon = config.icon;
          
          return (
            <div key={roleId} className={`${config.bgColor} rounded-xl p-4 border-2 ${config.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
                <span className={`text-xs font-bold px-2 py-1 ${config.badgeBg} ${config.badgeText} rounded-full`}>
                  {userCount} {userCount === 1 ? 'user' : 'users'}
                </span>
              </div>
              <div className={`${config.textColor} font-bold text-sm mb-1`}>{config.name}</div>
              <div className={`${config.textColor} text-xs opacity-80`}>{permissions} of {ALL_PERMISSIONS.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export utility function to check permissions
export const checkPermission = (userRole: string, permissionId: string): boolean => {
  const rolePermissions: RolePermissions = getFromStorage('rolePermissions', DEFAULT_ROLE_PERMISSIONS);
  
  // Super admin always has all permissions
  if (userRole === 'super_admin') {
    return true;
  }
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permissionId);
};
