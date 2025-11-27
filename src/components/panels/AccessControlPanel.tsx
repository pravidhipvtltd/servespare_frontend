import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Unlock, Users, Settings, Globe, Save, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Languages,
  Bell, Check, X, Info, ChevronDown, ChevronRight, Search,
  Filter, Copy, Download, Upload, BarChart3, Package, DollarSign,
  FileText, Building2, Wrench, Database, Activity, Key, Zap
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { usePermissions } from '../../contexts/PermissionContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'inventory' | 'finance' | 'users' | 'reports' | 'system' | 'advanced';
  icon: any;
}

interface RolePermissions {
  role: 'superadmin' | 'admin' | 'inventory_manager' | 'cashier' | 'finance';
  permissions: string[];
  lastUpdated: string;
  updatedBy: string;
}

interface LanguageSettings {
  currentLanguage: string;
  availableLanguages: string[];
  lastUpdated: string;
  updatedBy: string;
}

// Define all available permissions
const AVAILABLE_PERMISSIONS: Permission[] = [
  // Inventory Permissions
  { id: 'inventory.view', name: 'View Inventory', description: 'View inventory items and stock levels', category: 'inventory', icon: Package },
  { id: 'inventory.add', name: 'Add Inventory', description: 'Add new inventory items', category: 'inventory', icon: Package },
  { id: 'inventory.edit', name: 'Edit Inventory', description: 'Edit existing inventory items', category: 'inventory', icon: Package },
  { id: 'inventory.delete', name: 'Delete Inventory', description: 'Delete inventory items', category: 'inventory', icon: Package },
  { id: 'inventory.bulk_import', name: 'Bulk Import', description: 'Import inventory in bulk', category: 'inventory', icon: Upload },
  { id: 'inventory.stock_adjustment', name: 'Stock Adjustment', description: 'Adjust stock levels manually', category: 'inventory', icon: Package },
  
  // Finance Permissions
  { id: 'finance.view', name: 'View Finance', description: 'View financial data and reports', category: 'finance', icon: DollarSign },
  { id: 'finance.bills', name: 'Manage Bills', description: 'Create and manage bills', category: 'finance', icon: FileText },
  { id: 'finance.expenses', name: 'Manage Expenses', description: 'Record and track expenses', category: 'finance', icon: DollarSign },
  { id: 'finance.reports', name: 'Financial Reports', description: 'Access financial reports', category: 'finance', icon: BarChart3 },
  { id: 'finance.bank_accounts', name: 'Bank Accounts', description: 'Manage bank accounts', category: 'finance', icon: Building2 },
  
  // User Management Permissions
  { id: 'users.view', name: 'View Users', description: 'View user list and details', category: 'users', icon: Users },
  { id: 'users.add', name: 'Add Users', description: 'Create new user accounts', category: 'users', icon: Users },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'users', icon: Users },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users', icon: Users },
  { id: 'users.permissions', name: 'Manage Permissions', description: 'Manage user permissions', category: 'users', icon: Key },
  
  // Reports Permissions
  { id: 'reports.view', name: 'View Reports', description: 'Access reports and analytics', category: 'reports', icon: BarChart3 },
  { id: 'reports.export', name: 'Export Reports', description: 'Export reports to PDF/Excel', category: 'reports', icon: Download },
  { id: 'reports.analytics', name: 'Advanced Analytics', description: 'Access advanced analytics', category: 'reports', icon: Activity },
  
  // System Permissions
  { id: 'system.settings', name: 'System Settings', description: 'Access system settings', category: 'system', icon: Settings },
  { id: 'system.audit_log', name: 'Audit Log', description: 'View system audit logs', category: 'system', icon: FileText },
  { id: 'system.notifications', name: 'Notifications', description: 'Manage system notifications', category: 'system', icon: Bell },
  { id: 'system.branches', name: 'Branch Management', description: 'Manage branches/workspaces', category: 'system', icon: Building2 },
  
  // Advanced Permissions
  { id: 'advanced.database', name: 'Database Access', description: 'Access database management', category: 'advanced', icon: Database },
  { id: 'advanced.api', name: 'API Access', description: 'Access API management', category: 'advanced', icon: Zap },
  { id: 'advanced.maintenance', name: 'Maintenance Mode', description: 'Enable maintenance mode', category: 'advanced', icon: Wrench },
];

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ne', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
];

export const AccessControlPanel: React.FC = () => {
  const { permissions: userPermissions, refreshPermissions } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'inventory_manager' | 'cashier' | 'finance'>('admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [superadminPermissions, setSuperadminPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['inventory', 'finance', 'users', 'reports', 'system', 'advanced']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    loadPermissions();
    loadLanguageSettings();
  }, []);

  const loadPermissions = () => {
    // Load SuperAdmin permissions
    const superadminPerms = getFromStorage('superadmin_permissions', AVAILABLE_PERMISSIONS.map(p => p.id));
    setSuperadminPermissions(superadminPerms);

    // Load role permissions
    const adminPerms = getFromStorage('admin_permissions', []);
    const inventoryPerms = getFromStorage('inventory_manager_permissions', []);
    const cashierPerms = getFromStorage('cashier_permissions', []);
    const financePerms = getFromStorage('finance_permissions', []);

    setRolePermissions({
      admin: adminPerms,
      inventory_manager: inventoryPerms,
      cashier: cashierPerms,
      finance: financePerms,
    });
  };

  const loadLanguageSettings = () => {
    const langSettings = getFromStorage('language_settings', { currentLanguage: 'en' });
    setCurrentLanguage(langSettings.currentLanguage);
  };

  const handleSuperAdminPermissionToggle = (permissionId: string) => {
    const newPermissions = superadminPermissions.includes(permissionId)
      ? superadminPermissions.filter(p => p !== permissionId)
      : [...superadminPermissions, permissionId];

    setSuperadminPermissions(newPermissions);
    
    // Auto-cascade to all roles
    cascadePermissionChange(permissionId, newPermissions.includes(permissionId));
    
    setHasChanges(true);
  };

  const cascadePermissionChange = (permissionId: string, isGranted: boolean) => {
    const updatedRolePermissions = { ...rolePermissions };

    Object.keys(updatedRolePermissions).forEach(role => {
      if (isGranted) {
        // If SuperAdmin grants permission, allow it for the role (don't force add)
        // Role can have it or not based on their own settings
      } else {
        // If SuperAdmin denies permission, remove it from all roles
        updatedRolePermissions[role] = updatedRolePermissions[role].filter(p => p !== permissionId);
      }
    });

    setRolePermissions(updatedRolePermissions);
  };

  const handleRolePermissionToggle = (permissionId: string) => {
    // Check if SuperAdmin has this permission
    if (!superadminPermissions.includes(permissionId)) {
      alert('⚠️ Access Denied: SuperAdmin has denied this permission. Contact SuperAdmin to enable it first.');
      return;
    }

    const currentPerms = rolePermissions[selectedRole] || [];
    const newPermissions = currentPerms.includes(permissionId)
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: newPermissions,
    });

    setHasChanges(true);
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setSyncInProgress(true);

    // Save SuperAdmin permissions
    saveToStorage('superadmin_permissions', superadminPermissions);

    // Save role permissions
    saveToStorage('admin_permissions', rolePermissions.admin || []);
    saveToStorage('inventory_manager_permissions', rolePermissions.inventory_manager || []);
    saveToStorage('cashier_permissions', rolePermissions.cashier || []);
    saveToStorage('finance_permissions', rolePermissions.finance || []);

    // Save language settings
    const languageSettings = {
      currentLanguage,
      availableLanguages: AVAILABLE_LANGUAGES.map(l => l.code),
      lastUpdated: new Date().toISOString(),
      updatedBy: 'superadmin',
    };
    saveToStorage('language_settings', languageSettings);

    // Update sync timestamp to trigger real-time sync
    const syncTimestamp = Date.now();
    saveToStorage('permission_sync_timestamp', syncTimestamp);
    saveToStorage('language_sync_timestamp', syncTimestamp);

    // Create audit log entry
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Permission & Language Update',
      details: `Updated permissions and language settings. Language: ${currentLanguage}`,
      ipAddress: '127.0.0.1',
      category: 'security',
    });
    saveToStorage('auditLog', auditLog);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSyncInProgress(false);
    setHasChanges(false);
    setShowSuccess(true);

    // Trigger permission refresh for all connected clients
    refreshPermissions();

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (!confirm('Reset all permissions to default values? This cannot be undone.')) {
      return;
    }

    const defaultPermissions = AVAILABLE_PERMISSIONS.map(p => p.id);
    setSuperadminPermissions(defaultPermissions);

    setRolePermissions({
      admin: AVAILABLE_PERMISSIONS.filter(p => p.category !== 'advanced').map(p => p.id),
      inventory_manager: AVAILABLE_PERMISSIONS.filter(p => p.category === 'inventory').map(p => p.id),
      cashier: AVAILABLE_PERMISSIONS.filter(p => ['inventory.view', 'finance.bills'].includes(p.id)).map(p => p.id),
      finance: AVAILABLE_PERMISSIONS.filter(p => p.category === 'finance').map(p => p.id),
    });

    setHasChanges(true);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return Package;
      case 'finance': return DollarSign;
      case 'users': return Users;
      case 'reports': return BarChart3;
      case 'system': return Settings;
      case 'advanced': return Zap;
      default: return Shield;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'finance': return 'text-green-600 bg-green-50 border-green-200';
      case 'users': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reports': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'system': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPermissionStats = () => {
    const total = AVAILABLE_PERMISSIONS.length;
    const superadminGranted = superadminPermissions.length;
    const roleGranted = (rolePermissions[selectedRole] || []).length;
    return { total, superadminGranted, roleGranted };
  };

  const stats = getPermissionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Access Control & Language Management</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage permissions and language settings for all roles
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || syncInProgress}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              hasChanges && !syncInProgress
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {syncInProgress ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Sync Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-900 font-medium">Changes Saved Successfully!</p>
            <p className="text-green-700 text-sm">
              Permissions and language settings have been synchronized across all users.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-600">Total Permissions</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Unlock className="w-8 h-8 text-green-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-green-900">{stats.superadminGranted}</p>
              <p className="text-xs text-green-600">SuperAdmin Granted</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-900">{stats.roleGranted}</p>
              <p className="text-xs text-purple-600 capitalize">{selectedRole.replace('_', ' ')} Access</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-8 h-8 text-orange-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-900">
                {AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.flag}
              </p>
              <p className="text-xs text-orange-600">Current Language</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Settings Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Global Language Settings</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Changes will be applied to all users immediately upon saving
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AVAILABLE_LANGUAGES.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentLanguage === language.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{language.flag}</div>
              <div className="text-sm font-medium text-gray-900">{language.name}</div>
              {currentLanguage === language.code && (
                <div className="mt-2 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Role Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Role to Configure</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { role: 'admin', label: 'Admin', icon: Users, color: 'blue' },
            { role: 'inventory_manager', label: 'Inventory Manager', icon: Package, color: 'orange' },
            { role: 'cashier', label: 'Cashier/Reception', icon: DollarSign, color: 'green' },
            { role: 'finance', label: 'Finance', icon: BarChart3, color: 'purple' },
          ].map(({ role, label, icon: Icon, color }) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === role
                  ? `border-${color}-500 bg-${color}-50`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                selectedRole === role ? `text-${color}-600` : 'text-gray-400'
              }`} />
              <div className="text-sm font-medium text-gray-900">{label}</div>
              <div className="text-xs text-gray-500 mt-1">
                {(rolePermissions[role as keyof typeof rolePermissions] || []).length} permissions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="inventory">Inventory</option>
            <option value="finance">Finance</option>
            <option value="users">Users</option>
            <option value="reports">Reports</option>
            <option value="system">System</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Permission
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  SuperAdmin
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 capitalize">
                  {selectedRole.replace('_', ' ')}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const CategoryIcon = getCategoryIcon(category);
                const isExpanded = expandedCategories.includes(category);
                
                return (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr className="bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleCategory(category)}>
                      <td colSpan={4} className="px-6 py-3">
                        <div className="flex items-center space-x-2">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                          <CategoryIcon className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900 capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({permissions.length} permissions)
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Permissions in Category */}
                    {isExpanded && permissions.map(permission => {
                      const Icon = permission.icon;
                      const isSuperAdminGranted = superadminPermissions.includes(permission.id);
                      const isRoleGranted = (rolePermissions[selectedRole] || []).includes(permission.id);
                      const canRoleAccess = isSuperAdminGranted;

                      return (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </div>
                          </td>

                          {/* SuperAdmin Toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleSuperAdminPermissionToggle(permission.id)}
                              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                                isSuperAdminGranted
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {isSuperAdminGranted ? (
                                <>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Granted
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Denied
                                </>
                              )}
                            </button>
                          </td>

                          {/* Role Toggle */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRolePermissionToggle(permission.id)}
                              disabled={!canRoleAccess}
                              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                                !canRoleAccess
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isRoleGranted
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title={!canRoleAccess ? 'SuperAdmin has denied this permission' : ''}
                            >
                              {!canRoleAccess ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Blocked
                                </>
                              ) : isRoleGranted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Enabled
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Disabled
                                </>
                              )}
                            </button>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            {!isSuperAdminGranted ? (
                              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                <Lock className="w-3 h-3 mr-1" />
                                Admin Denied
                              </div>
                            ) : isRoleGranted ? (
                              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How Access Control Works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>SuperAdmin Control:</strong> When SuperAdmin denies a permission, it is automatically blocked for all roles</li>
            <li><strong>Role Control:</strong> When SuperAdmin grants a permission, roles can individually enable/disable it</li>
            <li><strong>Language Sync:</strong> Language changes apply to all users immediately upon saving</li>
            <li><strong>Real-Time Sync:</strong> Changes are synchronized across all active sessions within 3 seconds</li>
            <li><strong>Audit Trail:</strong> All permission changes are logged in the audit log</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
