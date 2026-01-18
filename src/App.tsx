import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SyncProvider } from "./contexts/SyncContext";
import { PermissionProvider } from "./contexts/PermissionContext";
import { DashboardLanguageProvider } from "./contexts/DashboardLanguageContext";
import { Toaster } from "./components/ui/sonner";
import { EntryLandingPage } from "./components/EntryLandingPage";
import { LandingPage } from "./components/LandingPage";
import { CustomerPanel } from "./components/CustomerPanel";
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
import { initializeDemoUsers } from "./utils/simpleUserInit";

// =========================================
// SIMPLE INITIALIZATION
// =========================================
console.log("");
console.log(
  "%c🚀 SERVE SPARES - AUTO PARTS INVENTORY SYSTEM",
  "color: #f59e0b; font-size: 20px; font-weight: bold;"
);
console.log("");

// Initialize demo users IMMEDIATELY before anything else
try {
  initializeDemoUsers();
} catch (error) {
  console.error("❌ Failed to initialize demo users:", error);
  // Try one more time with direct approach
  const emergencyUsers = [
    {
      id: "superadmin-1",
      email: "superadmin@autoparts.com",
      password: "super123",
      name: "Super Admin",
      role: "super_admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      branch: "",
      workspaceId: "superadmin-workspace",
    },
    {
      id: "admin-1",
      email: "admin@autoparts.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      branch: "",
      workspaceId: "workspace-1",
      panVatNumber: "1234567890",
      businessName: "Demo Auto Parts Store",
    },
  ];
  localStorage.setItem("users", JSON.stringify(emergencyUsers));
  console.log("✅ Emergency users created");
}

// Ensure demo customer exists
const customers = JSON.parse(localStorage.getItem("customers") || "[]");
if (!customers.find((c: any) => c.email === "customer@demo.com")) {
  customers.push({
    id: "customer_demo_001",
    name: "Demo Customer",
    email: "customer@demo.com",
    phone: "+977988862838",
    address: "Pokhara, Nepal",
    password: "demo123",
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("customers", JSON.stringify(customers));
  console.log("✅ Demo customer created");
}

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
  const [needsProfileCompletion, setNeedsProfileCompletion] =
    React.useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] =
    React.useState(false);
  const [showKYCModal, setShowKYCModal] = React.useState(false);
  const [adminAccountForPasswordChange, setAdminAccountForPasswordChange] =
    React.useState<any>(null);
  const [isTestMode, setIsTestMode] = React.useState(false);

  // NEW: App mode state (entry | customer | admin)
  const [appMode, setAppMode] = React.useState<"entry" | "customer" | "admin">(
    "entry"
  );

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
        console.log(
          "📦 Restored package from localStorage:",
          payment.packageName
        );
      } catch (error) {
        console.error("Failed to restore package:", error);
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
        "passwordChangeAdminId"
      );

      if (requirePasswordChange && passwordChangeAdminId) {
        // Get admin account details
        const adminAccounts = JSON.parse(
          localStorage.getItem("admin_accounts") || "[]"
        );
        const adminAccount = adminAccounts.find(
          (a: any) => a.id === passwordChangeAdminId
        );

        if (adminAccount) {
          console.log("🔐 Password change required - showing modal");
          setAdminAccountForPasswordChange(adminAccount);
          setShowPasswordChangeModal(true);
        }
      }
    }
  }, [currentUser]);

  // NEW: Check for backend-driven first login flow (password change + KYC)
  React.useEffect(() => {
    if (!currentUser) return;

    console.log("🔍 [First Login Check] Checking login flags...");

    const mustChangePassword =
      localStorage.getItem("must_change_password") === "true";
    const isFirstLogin = localStorage.getItem("is_first_login") === "true";
    const kycCompleted = localStorage.getItem("kyc_completed") === "true";
    const userId = localStorage.getItem("user_id");
    const tenantId = localStorage.getItem("tenant_id");

    console.log("   Must Change Password:", mustChangePassword);
    console.log("   Is First Login:", isFirstLogin);
    console.log("   KYC Completed:", kycCompleted);

    // Priority 1: Force password change if needed
    if (mustChangePassword && currentUser.role === "admin") {
      console.log("🔐 [First Login] Password change required - showing modal");

      // Create a temporary admin account object for the modal
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
      console.log("📝 [First Login] KYC required - showing modal");
      setShowKYCModal(true);
      return;
    }

    console.log("✅ [First Login] No onboarding steps required");
  }, [currentUser]);

  // Check if profile completion is needed
  React.useEffect(() => {
    if (currentUser) {
      const needsCompletion =
        localStorage.getItem("needsProfileCompletion") === "true";
      console.log(" Profile completion check:", {
        user: currentUser.email,
        needsCompletion,
        role: currentUser.role,
      });
      setNeedsProfileCompletion(needsCompletion);
    } else {
      console.log("⚠️ No current user found");
    }
  }, [currentUser]);

  // Check if admin needs business verification and package selection
  React.useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      const isVerified = localStorage.getItem("business_verified") === "true";
      const hasPackage = localStorage.getItem("package_active") === "true";
      const selectedPkg = localStorage.getItem("selected_package");

      console.log("🔍 Admin onboarding check:", {
        isVerified,
        hasPackage,
        selectedPkg,
        allFlags: {
          business_verified: localStorage.getItem("business_verified"),
          package_active: localStorage.getItem("package_active"),
          selected_package: localStorage.getItem("selected_package"),
        },
      });

      // First check: Business verification
      if (!isVerified) {
        console.log("🏢 Admin needs business verification");
        setOnboardingStep("verification");
        return;
      }

      // Second check: Package selection
      if (!hasPackage && !selectedPkg) {
        console.log("📦 Admin needs to select package");
        setOnboardingStep("package");
        return;
      }

      // All requirements met
      console.log("✅ All requirements met - setting onboardingStep to none");
      setOnboardingStep("none");
    }
  }, [currentUser]);

  const handleBusinessVerificationComplete = (data: any) => {
    console.log("✅ Business verification completed:", data);
    // Proceed to package selection
    setOnboardingStep("package");
  };

  const handlePackageSelected = (pkg: any) => {
    console.log("📦 Package selected:", pkg);
    setSelectedPackage(pkg);
    setOnboardingStep("confirmation");
  };

  const handlePackageConfirmed = () => {
    console.log("✅ Package confirmed, proceeding to payment");
    setOnboardingStep("payment");
  };

  const handlePaymentComplete = () => {
    console.log("💳 Payment completed successfully");
    // Note: Don't set state before reload - it will be lost anyway
    // The useEffect will detect package_active and business_verified flags and set onboardingStep appropriately
    window.location.reload();
  };

  const handleOnboardingCancel = () => {
    console.log("❌ Onboarding cancelled");
    logout();
  };

  console.log("📱 App render state:", {
    isLoading,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    needsProfileCompletion,
    role: currentUser?.role,
  });

  // Show loading while waiting for initialization
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
    // Show entry landing page or customer/admin panel based on appMode
    if (appMode === "entry") {
      return (
        <EntryLandingPage
          onSelectCustomer={() => setAppMode("customer")}
          onSelectAdmin={() => setAppMode("admin")}
        />
      );
    } else if (appMode === "customer") {
      return <CustomerPanel onBackToEntry={() => setAppMode("entry")} />;
    } else {
      // Admin mode - show admin landing/login page
      return <LandingPage onBackToEntry={() => setAppMode("entry")} />;
    }
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

  // Role-based dashboard routing
  console.log(
    "🎯 Rendering dashboard for role:",
    currentUser.role,
    "onboardingStep:",
    onboardingStep
  );

  let dashboardComponent;

  switch (currentUser.role) {
    case "super_admin":
      dashboardComponent = <SuperAdminDashboardRefined />;
      break;
    case "admin":
      dashboardComponent = <AdminDashboardWorldClass />;
      break;
    case "inventory_manager":
      dashboardComponent = <InventoryManagerDashboardNew />;
      break;
    case "cashier":
      dashboardComponent = <CashierDashboardNew />;
      break;
    default:
      dashboardComponent = <LandingPage />;
  }

  return (
    <>
      {dashboardComponent}
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
            console.log("✅ KYC completed successfully!");
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
