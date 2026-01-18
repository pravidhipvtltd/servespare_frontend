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
import { SuccessPopup } from '../SuccessPopup';
import { ErrorPopup } from '../ErrorPopup';
import { ConfirmDialog } from '../ConfirmDialog';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'inventory' | 'users' | 'reports' | 'system' | 'advanced' | 'billing';
  icon: any;
}

interface RolePermissions {
  role: 'superadmin' | 'admin' | 'inventory_manager' | 'cashier';
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
  
  // Billing Permissions
  { id: 'billing.view', name: 'View Billing', description: 'View billing data and reports', category: 'billing', icon: DollarSign },
  { id: 'billing.bills', name: 'Manage Bills', description: 'Create and manage bills', category: 'billing', icon: FileText },
  { id: 'billing.expenses', name: 'Manage Expenses', description: 'Record and track expenses', category: 'billing', icon: DollarSign },
  { id: 'billing.reports', name: 'Financial Reports', description: 'Access financial reports', category: 'billing', icon: BarChart3 },
  { id: 'billing.bank_accounts', name: 'Bank Accounts', description: 'Manage bank accounts', category: 'billing', icon: Building2 },
];

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
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
  const [selectedRole, setSelectedRole] = useState<'admin' | 'inventory_manager' | 'cashier'>('admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [superadminPermissions, setSuperadminPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['inventory', 'users', 'reports', 'system', 'advanced', 'billing']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Custom Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Success');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    details: string[];
    onConfirm: () => void;
    type: 'warning' | 'danger' | 'info' | 'success';
  } | null>(null);

  const showSuccess = (message: string, title: string = 'Success') => {
    setSuccessMessage(message);
    setSuccessTitle(title);
    setShowSuccessPopup(true);
  };

  const showError = (message: string, title: string = 'Warning') => {
    setErrorMessage(message);
    setErrorTitle(title);
    setShowErrorPopup(true);
  };

  const showConfirm = (title: string, message: string, details: string[], onConfirm: () => void, type: 'warning' | 'danger' | 'info' | 'success' = 'warning') => {
    setConfirmConfig({ title, message, details, onConfirm, type });
    setShowConfirmDialog(true);
  };

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

    setRolePermissions({
      admin: adminPerms,
      inventory_manager: inventoryPerms,
      cashier: cashierPerms,
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
      showError('SuperAdmin has denied this permission. Contact SuperAdmin to enable it first.', 'Access Denied');
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
    setShowSuccessMessage(true);

    // Trigger permission refresh for all connected clients
    refreshPermissions();

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleActivateSuperAdmin = async () => {
    showConfirm(
      'Rollback & Activate SuperAdmin',
      'This will reset all permissions to defaults and activate both SuperAdmin accounts.',
      [
        'Grant SuperAdmin ALL 27 permissions',
        'Activate both SuperAdmin accounts',
        'Reset all role permissions to defaults',
        'Save changes immediately',
        'Sync across all users'
      ],
      async () => {
        setShowConfirmDialog(false);
        setSyncInProgress(true);

        // Grant all permissions to SuperAdmin
        const defaultPermissions = AVAILABLE_PERMISSIONS.map(p => p.id);
        setSuperadminPermissions(defaultPermissions);

        // Reset all role permissions to defaults
        const newRolePermissions = {
          admin: AVAILABLE_PERMISSIONS.filter(p => p.category !== 'advanced').map(p => p.id),
          inventory_manager: AVAILABLE_PERMISSIONS.filter(p => p.category === 'inventory').map(p => p.id),
          cashier: AVAILABLE_PERMISSIONS.filter(p => ['inventory.view', 'billing.bills'].includes(p.id)).map(p => p.id),
        };
        setRolePermissions(newRolePermissions);

        // Save SuperAdmin permissions
        saveToStorage('superadmin_permissions', defaultPermissions);

        // Save role permissions
        saveToStorage('admin_permissions', newRolePermissions.admin);
        saveToStorage('inventory_manager_permissions', newRolePermissions.inventory_manager);
        saveToStorage('cashier_permissions', newRolePermissions.cashier);

        // Ensure SuperAdmin accounts are active
        const users = getFromStorage('users', []);
        const updatedUsers = users.map((user: any) => {
          if (user.role === 'super_admin') {
            return { ...user, isActive: true };
          }
          return user;
        });
        saveToStorage('users', updatedUsers);

        // Update sync timestamp
        const syncTimestamp = Date.now();
        saveToStorage('permission_sync_timestamp', syncTimestamp);

        // Create audit log
        const auditLog = getFromStorage('auditLog', []);
        auditLog.unshift({
          id: `AUDIT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'superadmin',
          userName: 'Super Admin',
          action: 'SuperAdmin Rollback & Activation',
          details: 'Rolled back all permissions to defaults and activated SuperAdmin accounts',
          ipAddress: '127.0.0.1',
          category: 'security',
        });
        saveToStorage('auditLog', auditLog);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSyncInProgress(false);
        setHasChanges(false);
        setShowSuccessMessage(true);

        // Trigger permission refresh
        refreshPermissions();

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Show completion popup
        setTimeout(() => {
          showSuccess(
            'All 27 permissions granted to SuperAdmin. Both SuperAdmin accounts are now active. All role permissions reset to defaults. Changes synchronized across all users. You can now login with either SuperAdmin account!',
            'SuperAdmin Activated!'
          );
        }, 1500);
      },
      'success'
    );
  };

  const handleResetToDefaults = () => {
    showConfirm(
      'Reset to Default Permissions',
      'This will reset all permissions to their default values.',
      [
        'Grant SuperAdmin ALL permissions',
        'Reset Admin to all permissions except advanced',
        'Reset Inventory Manager to inventory-only permissions',
        'Reset Cashier to view-only permissions'
      ],
      () => {
        setShowConfirmDialog(false);
        const defaultPermissions = AVAILABLE_PERMISSIONS.map(p => p.id);
        setSuperadminPermissions(defaultPermissions);

        setRolePermissions({
          admin: AVAILABLE_PERMISSIONS.filter(p => p.category !== 'advanced').map(p => p.id),
          inventory_manager: AVAILABLE_PERMISSIONS.filter(p => p.category === 'inventory').map(p => p.id),
          cashier: AVAILABLE_PERMISSIONS.filter(p => ['inventory.view', 'billing.bills'].includes(p.id)).map(p => p.id),
        });

        setHasChanges(true);
        showSuccess('Permissions have been reset to default values. Click "Save & Sync Changes" to apply.', 'Reset Complete');
      },
      'danger'
    );
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
      case 'users': return Users;
      case 'reports': return BarChart3;
      case 'system': return Settings;
      case 'advanced': return Zap;
      case 'billing': return DollarSign;
      default: return Shield;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'users': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reports': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'system': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      case 'billing': return 'text-green-600 bg-green-50 border-green-200';
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
            onClick={handleActivateSuperAdmin}
            disabled={syncInProgress}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl font-bold"
          >
            <Zap className="w-5 h-5" />
            <span>🔄 Activate SuperAdmin</span>
          </button>
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rollback Only</span>
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
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-900 font-medium">Changes Saved Successfully!</p>
            <p className="text-green-700 text-sm">
              Permissions and language settings have been synchronized across all users.
            </p>
          </div>
        </div>
      )}

      {/* Rollback & Activation Instructions */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-xl p-5 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-lg mb-2 flex items-center">
              ⚡ Activate SuperAdmin - One-Click Solution!
            </h3>
            <p className="text-green-800 text-sm mb-3">
              Click the <strong className="text-green-600">🔄 "Activate SuperAdmin"</strong> button above to instantly rollback permissions, activate both SuperAdmin accounts, and save all changes automatically!
            </p>
            <div className="bg-white/60 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">SuperAdmin:</strong>
                  <span className="text-gray-700"> Gets ALL permissions (Full Access)</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Admin:</strong>
                  <span className="text-gray-700"> Gets all permissions except advanced</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Inventory Manager:</strong>
                  <span className="text-gray-700"> Gets inventory-only permissions</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Cashier:</strong>
                  <span className="text-gray-700"> Gets view inventory + billing only</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2 text-orange-900">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Warning: This action cannot be undone. A confirmation dialog will appear.</span>
            </div>
          </div>
        </div>
      </div>

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
            <option value="users">Users</option>
            <option value="reports">Reports</option>
            <option value="system">System</option>
            <option value="advanced">Advanced</option>
            <option value="billing">Billing</option>
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

      {/* Custom Popups */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title={successTitle}
        message={successMessage}
        autoClose={true}
        autoCloseDelay={4000}
      />

      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title={errorTitle}
        message={errorMessage}
        type="warning"
      />

      {confirmConfig && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          title={confirmConfig.title}
          message={confirmConfig.message}
          details={confirmConfig.details}
          type={confirmConfig.type}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};