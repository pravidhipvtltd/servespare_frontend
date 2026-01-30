import React, { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SyncProvider } from "./contexts/SyncContext";
import { PermissionProvider } from "./contexts/PermissionContext";
import { DashboardLanguageProvider } from "./contexts/DashboardLanguageContext";
import { Toaster } from "./components/ui/sonner";
import { EntryLandingPage } from "./components/EntryLandingPage";
import { LandingPage } from "./components/LandingPage";
import { CustomerPanel } from "./components/CustomerPanel";
import { CustomerAuthEnhanced } from "./components/customer/CustomerAuthEnhanced";
import { SuperAdminDashboardRefined } from "./components/SuperAdminDashboardRefined";
import { AdminDashboard as AdminDashboardWorldClass } from "./components/AdminDashboardWorldClass";
import { InventoryManagerDashboardNew } from "./components/InventoryManagerDashboardNew";
import { CashierDashboardNew } from "./components/CashierDashboardNew";
import { ForcePasswordChangeModal } from "./components/modals/ForcePasswordChangeModal";
import { OfflineStatusBar } from "./components/OfflineStatusBar";
import { BranchProvider } from "./contexts/BranchContext";
import "./utils/debugHelpers";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SyncProvider>
          <PermissionProvider>
            <DashboardLanguageProvider>
              <AppContent />
            </DashboardLanguageProvider>
          </PermissionProvider>
        </SyncProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordChangeModal, setShowPasswordChangeModal] =
    React.useState(false);
  const [adminAccountForPasswordChange, setAdminAccountForPasswordChange] =
    React.useState<any>(null);
  const [isTestMode, setIsTestMode] = React.useState(false);

  // Check if current path is payment upgrade
  const currentPath = window.location.pathname;
  const isPaymentUpgradePage = currentPath === "/payment-upgrade";

  // Check if in test mode
  React.useEffect(() => {
    const testModeFlag = localStorage.getItem("test_mode");
    setIsTestMode(testModeFlag === "true");
  }, [currentUser]);

  // Set document title
  React.useEffect(() => {
    document.title = "Serve Spares - Inventory System";
  }, []);

  // Check if password change is required (first-time login)
  React.useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      const requirePasswordChange =
        localStorage.getItem("requirePasswordChange") === "true";
      const passwordChangeAdminId = localStorage.getItem(
        "passwordChangeAdminId",
      );

      if (requirePasswordChange && passwordChangeAdminId) {
        // Get admin account details
        const adminAccounts = JSON.parse(
          localStorage.getItem("admin_accounts") || "[]",
        );
        const adminAccount = adminAccounts.find(
          (a: any) => a.id === passwordChangeAdminId,
        );

        if (adminAccount) {
          setAdminAccountForPasswordChange(adminAccount);
          setShowPasswordChangeModal(true);
        }
      }
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;

    const mustChangePassword =
      localStorage.getItem("must_change_password") === "true";
    const isFirstLogin = localStorage.getItem("is_first_login") === "true";
    const kycCompleted = localStorage.getItem("kyc_completed") === "true";
    const userId = localStorage.getItem("user_id");
    const tenantId = localStorage.getItem("tenant_id");

    // Priority 1: Force password change if needed
    if (mustChangePassword && currentUser.role === "admin") {
      const tempAdminAccount = {
        id: userId,
        email: currentUser.email,
        name: currentUser.name,
        businessName: localStorage.getItem("business_name") || "Your Business",
      };

      setAdminAccountForPasswordChange(tempAdminAccount);
      setShowPasswordChangeModal(true);
      return; // Don't proceed to KYC yet
    }
  }, [currentUser]);

  // Role-based dashboard routing helper
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case "super_admin":
        return "/admin/super-admin/dashboard";
      case "admin":
        return "/admin/admin/dashboard";
      case "inventory_manager":
        return "/admin/inventory-manager/dashboard";
      case "cashier":
        return "/admin/cashier/dashboard";
      case "customer":
        return "/shop";
      default:
        return "/";
    }
  };

  // Effect to redirect to correct dashboard URL if at root or wrong path
  useEffect(() => {
    if (currentUser && location.pathname === "/") {
      navigate(getDashboardRoute(currentUser.role));
    }
  }, [currentUser, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Routes for unauthenticated users
    return (
      <>
        <Routes>
          <Route
            path="/"
            element={
              <EntryLandingPage
                onSelectCustomer={() => navigate("/customer")}
                onSelectAdmin={() => navigate("/admin")}
              />
            }
          />
          <Route
            path="/admin/*"
            element={<LandingPage onBackToEntry={() => navigate("/")} />}
          />
          {/* Customer panel routes */}
          <Route
            path="/customer"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/customer/*"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          {/* Customer panel routes at root level */}
          <Route
            path="/login"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/register"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/shop"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/my-orders"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/profile"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/product/:id"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          <Route
            path="/all-products"
            element={
              <CustomerPanel key="guest" onBackToEntry={() => navigate("/")} />
            }
          />
          {/* Catch-all route for unauthenticated users redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <OfflineStatusBar />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/admin/super-admin/*"
          element={
            currentUser.role === "super_admin" ? (
              <SuperAdminDashboardRefined />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/admin/admin/*"
          element={
            currentUser.role === "admin" ? (
              <BranchProvider>
                <AdminDashboardWorldClass />
              </BranchProvider>
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/admin/inventory-manager/dashboard"
          element={
            currentUser.role === "inventory_manager" ? (
              <InventoryManagerDashboardNew />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/admin/cashier/*"
          element={
            currentUser.role === "cashier" ? (
              <CashierDashboardNew />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/customer/home"
          element={<Navigate to="/shop" replace />}
        />
        <Route
          path="/customer"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/customer/*"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/shop"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/cart"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/my-orders"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/checkout"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/product/:id"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/all-products"
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel key="auth" onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            <Navigate to={getDashboardRoute(currentUser.role)} replace />
          }
        />
        <Route
          path="/register"
          element={
            <Navigate to={getDashboardRoute(currentUser.role)} replace />
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={getDashboardRoute(currentUser.role)} replace />
          }
        />
      </Routes>

      {/* Force Password Change Modal */}
      {adminAccountForPasswordChange && showPasswordChangeModal && (
        <ForcePasswordChangeModal
          adminAccount={adminAccountForPasswordChange}
          onClose={() => {
            setAdminAccountForPasswordChange(null);
            setShowPasswordChangeModal(false);
          }}
        />
      )}

      {/* Offline Status Bar */}
      <OfflineStatusBar />
      {/* Toaster */}
      <Toaster />
    </>
  );
};
