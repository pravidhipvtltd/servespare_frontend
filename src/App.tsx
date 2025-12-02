import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SyncProvider } from './contexts/SyncContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { LandingPage } from './components/LandingPage';
import { SuperAdminDashboardRefined } from './components/SuperAdminDashboardRefined';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryManagerDashboard } from './components/InventoryManagerDashboard';
import { InventoryManagerDashboardNew } from './components/InventoryManagerDashboardNew';
import { CashierDashboardComplete } from './components/CashierDashboardComplete';
import { CashierDashboardNew } from './components/CashierDashboardNew';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ProfileCompletion } from './components/ProfileCompletion';
import { AIChatBotWidget } from './components/AIChatBotWidget';
import './utils/debugHelpers';
import { Bill } from './types';

// Global migration utility - runs once on app load
const migrateBillsData = () => {
  const MIGRATION_KEY = 'bills_migration_v2_completed';
  
  // Check if migration already ran
  if (localStorage.getItem(MIGRATION_KEY) === 'true') {
    return;
  }

  const storedBills = localStorage.getItem('bills');
  if (!storedBills) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  try {
    const bills: Bill[] = JSON.parse(storedBills);
    let migratedCount = 0;

    const migratedBills = bills.map(bill => {
      // Check if bill is missing createdAt
      if (!bill.createdAt) {
        migratedCount++;
        
        // Try to use 'date' field if it exists, otherwise extract from bill ID
        let createdAt: string;
        if ((bill as any).date) {
          createdAt = (bill as any).date;
        } else if (bill.id && bill.id.includes('_')) {
          // Extract timestamp from bill ID like "bill_1764604525045"
          const timestamp = parseInt(bill.id.split('_')[1]);
          if (!isNaN(timestamp)) {
            createdAt = new Date(timestamp).toISOString();
          } else {
            createdAt = new Date().toISOString();
          }
        } else if (bill.id && bill.id.startsWith('bill')) {
          // Try to extract timestamp from "bill1764604525045"
          const timestamp = parseInt(bill.id.replace('bill', ''));
          if (!isNaN(timestamp)) {
            createdAt = new Date(timestamp).toISOString();
          } else {
            createdAt = new Date().toISOString();
          }
        } else {
          createdAt = new Date().toISOString();
        }

        // Remove old 'date' field if it exists
        const { date, ...billWithoutDate } = bill as any;
        return { ...billWithoutDate, createdAt };
      }
      return bill;
    });

    if (migratedCount > 0) {
      localStorage.setItem('bills', JSON.stringify(migratedBills));
      console.log(`✅ [App Migration] Successfully migrated ${migratedCount} bills to include createdAt field`);
    }
    
    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch (error) {
    console.error('❌ [App Migration] Error migrating bills data:', error);
  }
};

// Run migration immediately when module loads
migrateBillsData();

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
      console.log(' Profile completion check:', {
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
  let dashboardComponent;
  
  switch (currentUser.role) {
    case 'super_admin':
      dashboardComponent = <SuperAdminDashboardRefined />;
      break;
    case 'admin':
      dashboardComponent = <AdminDashboard />;
      break;
    case 'inventory_manager':
      dashboardComponent = <InventoryManagerDashboardNew />;
      break;
    case 'cashier':
      dashboardComponent = <CashierDashboardNew />;
      break;
    case 'finance':
      dashboardComponent = <FinanceDashboard />;
      break;
    default:
      dashboardComponent = <LandingPage />;
  }

  return (
    <>
      {dashboardComponent}
      {/* AI ChatBot Widget - Available on all dashboard pages */}
      {currentUser && <AIChatBotWidget />}
    </>
  );
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