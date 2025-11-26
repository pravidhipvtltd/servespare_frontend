// Permission Utility Functions
import { getFromStorage } from './mockData';

interface RolePermissions {
  [role: string]: string[];
}

// Default permissions (same as in RolesPermissionsFixed)
const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  super_admin: [
    'view_dashboard', 'view_analytics',
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory', 'adjust_stock',
    'view_bills', 'create_bills', 'edit_bills', 'delete_bills', 'process_refunds',
    'view_finance', 'view_expenses', 'create_expenses', 'approve_expenses', 'view_profit_loss',
    'view_parties', 'create_parties', 'edit_parties', 'delete_parties',
    'view_settings', 'edit_settings', 'manage_branches'
  ],
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

/**
 * Check if a user has a specific permission
 * @param userRole - The role of the current user
 * @param permissionId - The permission to check
 * @returns boolean - true if user has permission
 */
export const hasPermission = (userRole: string, permissionId: string): boolean => {
  // Super admin always has all permissions
  if (userRole === 'super_admin') {
    return true;
  }
  
  // Get custom permissions from storage or use defaults
  const rolePermissions: RolePermissions = getFromStorage('rolePermissions', DEFAULT_ROLE_PERMISSIONS);
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.includes(permissionId);
};

/**
 * Check if user has any of the specified permissions
 * @param userRole - The role of the current user
 * @param permissionIds - Array of permission IDs to check
 * @returns boolean - true if user has at least one permission
 */
export const hasAnyPermission = (userRole: string, permissionIds: string[]): boolean => {
  return permissionIds.some(permId => hasPermission(userRole, permId));
};

/**
 * Check if user has all of the specified permissions
 * @param userRole - The role of the current user
 * @param permissionIds - Array of permission IDs to check
 * @returns boolean - true if user has all permissions
 */
export const hasAllPermissions = (userRole: string, permissionIds: string[]): boolean => {
  return permissionIds.every(permId => hasPermission(userRole, permId));
};

/**
 * Get all permissions for a role
 * @param userRole - The role to get permissions for
 * @returns string[] - Array of permission IDs
 */
export const getRolePermissions = (userRole: string): string[] => {
  const rolePermissions: RolePermissions = getFromStorage('rolePermissions', DEFAULT_ROLE_PERMISSIONS);
  return rolePermissions[userRole] || [];
};

/**
 * Show permission denied alert
 * @param action - The action that was denied
 */
export const showPermissionDenied = (action: string = 'perform this action'): void => {
  alert(`🚫 Permission Denied\n\nYou don't have permission to ${action}.\nContact your administrator for access.`);
};

/**
 * React Hook - Check permission and show alert if denied
 * @param userRole - The role of the current user
 * @param permissionId - The permission to check
 * @param action - Description of the action for error message
 * @returns boolean - true if has permission, false and shows alert if not
 */
export const checkAndAlertPermission = (
  userRole: string, 
  permissionId: string, 
  action: string
): boolean => {
  if (!hasPermission(userRole, permissionId)) {
    showPermissionDenied(action);
    return false;
  }
  return true;
};
