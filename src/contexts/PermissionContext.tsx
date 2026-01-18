// Permission Context - Real-time permission checking
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFromStorage } from '../utils/mockData';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  hasPermission: (permissionKey: string) => boolean;
  userPermissions: string[];
  refreshPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Default permissions for each role
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'view_dashboard', 'view_analytics',
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'view_inventory', 'add_inventory', 'edit_inventory', 'delete_inventory',
    'view_parties', 'add_parties', 'edit_parties', 'delete_parties',
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
    'view_bills', 'create_bills', 'edit_bills', 'delete_bills',
    'view_daybook', 'view_ledger', 'view_returns',
    'view_pricing', 'edit_pricing',
    'view_reports', 'view_settings', 'view_crm'
  ],
  admin: [
    'view_dashboard', 'view_analytics',
    'view_inventory', 'add_inventory', 'edit_inventory',
    'view_parties', 'add_parties', 'edit_parties',
    'view_orders', 'create_orders', 'edit_orders',
    'view_bills', 'create_bills', 'edit_bills',
    'view_daybook', 'view_ledger',
    'view_pricing', 'edit_pricing',
    'view_reports', 'view_crm'
  ],
  inventory_manager: [
    'view_dashboard',
    'view_inventory', 'add_inventory', 'edit_inventory',
    'view_orders', 'create_orders',
    'view_reports'
  ],
  cashier: [
    'view_dashboard',
    'view_inventory',
    'view_parties',
    'view_bills', 'create_bills',
    'view_orders', 'create_orders'
  ]
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const loadPermissions = () => {
    if (!currentUser) {
      setUserPermissions([]);
      return;
    }

    // Get custom permissions from storage
    const rolePermissions = getFromStorage('rolePermissions', {});
    const customPermissions = rolePermissions[currentUser.role];

    // If custom permissions exist, use them; otherwise use defaults
    if (customPermissions && Array.isArray(customPermissions)) {
      setUserPermissions(customPermissions);
    } else {
      setUserPermissions(DEFAULT_PERMISSIONS[currentUser.role] || []);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [currentUser]);

  // Check for permission changes every 3 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      loadPermissions();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rolePermissions') {
        console.log('📡 Permissions changed - reloading...');
        loadPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const hasPermission = (permissionKey: string): boolean => {
    // Super admin always has all permissions
    if (currentUser?.role === 'super_admin') {
      return true;
    }
    
    return userPermissions.includes(permissionKey);
  };

  const refreshPermissions = () => {
    loadPermissions();
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, userPermissions, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};
