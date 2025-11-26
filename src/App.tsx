import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SyncProvider } from './contexts/SyncContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { LoginPage } from './components/LoginPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryManagerDashboard } from './components/InventoryManagerDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { FinanceDashboard } from './components/FinanceDashboard';

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // Role-based dashboard routing
  switch (currentUser.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'inventory_manager':
      return <InventoryManagerDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    case 'finance':
      return <FinanceDashboard />;
    default:
      return <LoginPage />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SyncProvider>
          <PermissionProvider>
            <AppContent />
          </PermissionProvider>
        </SyncProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}