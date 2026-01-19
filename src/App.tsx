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
import { ProfileCompletion } from "./components/ProfileCompletion";
import { BusinessVerification } from "./components/onboarding/BusinessVerification";
import { PackageSelection } from "./components/onboarding/PackageSelection";
import { PackageConfirmation } from "./components/onboarding/PackageConfirmation";
import { PaymentProcessing } from "./components/onboarding/PaymentProcessing";
import { ForcePasswordChangeModal } from "./components/modals/ForcePasswordChangeModal";
import { OfflineStatusBar } from "./components/OfflineStatusBar";
import { KYCFormModal } from "./components/modals/KYCFormModal";
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
  const [needsProfileCompletion, setNeedsProfileCompletion] =
    React.useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] =
    React.useState(false);
  const [showKYCModal, setShowKYCModal] = React.useState(false);
  const [adminAccountForPasswordChange, setAdminAccountForPasswordChange] =
    React.useState<any>(null);
  const [isTestMode, setIsTestMode] = React.useState(false);

  // Onboarding states for admin
  const [onboardingStep, setOnboardingStep] = React.useState<
    "none" | "verification" | "package" | "confirmation" | "payment"
  >("none");
  const [selectedPackage, setSelectedPackage] = React.useState<any>(null);

  // Check if current path is payment upgrade
  const currentPath = window.location.pathname;
  const isPaymentUpgradePage = currentPath === "/payment-upgrade";

  // Restore selected package from localStorage if available
  React.useEffect(() => {
    const savedPackageId = localStorage.getItem("selected_package");
    const paymentData = localStorage.getItem("payment_data");
    if (savedPackageId && paymentData && !selectedPackage) {
      try {
        const payment = JSON.parse(paymentData);
        setSelectedPackage({
          id: payment.packageId,
          name: payment.packageName,
          price: payment.amount,
          currency: payment.currency,
        });
      } catch (error) {
        // Silent error
      }
    }
  }, [selectedPackage]);

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

    // Priority 2: Force KYC if password was changed but KYC not completed
    if (
      !mustChangePassword &&
      isFirstLogin &&
      !kycCompleted &&
      currentUser.role === "admin"
    ) {
      setShowKYCModal(true);
      return;
    }
  }, [currentUser]);

  // Check if profile completion is needed
  React.useEffect(() => {
    if (currentUser) {
      const needsCompletion =
        localStorage.getItem("needsProfileCompletion") === "true";
      setNeedsProfileCompletion(needsCompletion);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      const isVerified = localStorage.getItem("business_verified") === "true";
      const hasPackage = localStorage.getItem("package_active") === "true";
      const selectedPkg = localStorage.getItem("selected_package");

      // First check: Business verification
      if (!isVerified) {
        setOnboardingStep("verification");
        return;
      }

      // Second check: Package selection
      if (!hasPackage && !selectedPkg) {
        setOnboardingStep("package");
        return;
      }

      // All requirements met
      setOnboardingStep("none");
    }
  }, [currentUser]);

  const handleBusinessVerificationComplete = (data: any) => {
    // Proceed to package selection
    setOnboardingStep("package");
  };

  const handlePackageSelected = (pkg: any) => {
    setSelectedPackage(pkg);
    setOnboardingStep("confirmation");
  };

  const handlePackageConfirmed = () => {
    setOnboardingStep("payment");
  };

  const handlePaymentComplete = () => {
    window.location.reload();
  };

  const handleOnboardingCancel = () => {
    logout();
  };

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
        return "/customer/home";
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
          <Route
            path="/customer/*"
            element={<CustomerPanel onBackToEntry={() => navigate("/")} />}
          />
          {/* Catch-all route for unauthenticated users redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <OfflineStatusBar />
        <Toaster />
      </>
    );
  }

  // Show profile completion if needed
  if (needsProfileCompletion) {
    return (
      <ProfileCompletion
        userEmail={currentUser.email}
        onComplete={() => {
          localStorage.removeItem("needsProfileCompletion");
          setNeedsProfileCompletion(false);
          window.location.reload();
        }}
        onSkip={() => {
          localStorage.removeItem("needsProfileCompletion");
          setNeedsProfileCompletion(false);
        }}
      />
    );
  }

  // Show onboarding flow for admins
  if (currentUser.role === "admin" && onboardingStep !== "none") {
    switch (onboardingStep) {
      case "verification":
        return (
          <BusinessVerification
            adminEmail={currentUser.email}
            onComplete={handleBusinessVerificationComplete}
            onCancel={handleOnboardingCancel}
          />
        );
      case "package":
        return (
          <PackageSelection
            adminEmail={currentUser.email}
            onPackageSelected={handlePackageSelected}
            onCancel={handleOnboardingCancel}
          />
        );
      case "confirmation":
        return (
          <PackageConfirmation
            selectedPackage={selectedPackage}
            adminEmail={currentUser.email}
            onConfirm={handlePackageConfirmed}
            onBack={() => setOnboardingStep("package")}
          />
        );
      case "payment":
        return (
          <PaymentProcessing
            selectedPackage={selectedPackage}
            adminEmail={currentUser.email}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setOnboardingStep("confirmation")}
          />
        );
    }
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
              <AdminDashboardWorldClass />
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
          path="/admin/cashier/dashboard"
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
          element={
            currentUser.role === "customer" ? (
              <CustomerPanel onBackToEntry={logout} />
            ) : (
              <Navigate to={getDashboardRoute(currentUser.role)} replace />
            )
          }
        />
        {/* Redirect any authenticated user trying to access other paths back to their dashboard */}
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
      {/* KYC Form Modal */}
      {showKYCModal && currentUser && (
        <KYCFormModal
          userId={localStorage.getItem("user_id") || currentUser.id}
          userEmail={currentUser.email}
          userName={currentUser.name}
          tenantId={localStorage.getItem("tenant_id") || ""}
          onComplete={() => {
            setShowKYCModal(false);
            // Reload to refresh the app state
            window.location.reload();
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
