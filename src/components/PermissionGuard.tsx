// Permission Guard Component - Blocks access to unauthorized features
import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionContext';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback,
  showMessage = true 
}) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-gray-900 text-2xl font-semibold mb-3">Access Denied</h3>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this feature. Please contact your administrator.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-left text-sm text-yellow-800">
            <strong className="font-medium">Required Permission:</strong>
            <br />
            <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">{permission}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for conditional rendering
export const usePermissionCheck = (permission: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};