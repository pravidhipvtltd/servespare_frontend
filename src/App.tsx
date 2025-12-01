import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SyncProvider } from './contexts/SyncContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { LandingPage } from './components/LandingPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryManagerDashboard } from './components/InventoryManagerDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ProfileCompletion } from './components/ProfileCompletion';
import './utils/debugHelpers';

const AppContent: React.FC = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const [needsProfileCompletion, setNeedsProfileCompletion] = React.useState(false);

  // Set document title
  React.useEffect(() => {
    document.title = 'Serve Spares - Inventory System';
  }, []);

  // Check if profile completion is needed
  React.useEffect(() => {
    if (currentUser) {
      const needsCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
      console.log('🔍 Profile completion check:', {
        user: currentUser.email,
        needsCompletion,
        role: currentUser.role
      });
      setNeedsProfileCompletion(needsCompletion);
    } else {
      console.log('⚠️ No current user found');
    }
  }, [currentUser]);

  console.log('📱 App render state:', {
    isLoading,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    needsProfileCompletion,
    role: currentUser?.role
  });

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
    return <LandingPage />;
  }

  // Show profile completion if needed
  if (needsProfileCompletion) {
    return (
      <ProfileCompletion
        userEmail={currentUser.email}
        onComplete={() => {
          localStorage.removeItem('needsProfileCompletion');
          setNeedsProfileCompletion(false);
          window.location.reload();
        }}
        onSkip={() => {
          localStorage.removeItem('needsProfileCompletion');
          setNeedsProfileCompletion(false);
        }}
      />
    );
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
      return <LandingPage />;
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