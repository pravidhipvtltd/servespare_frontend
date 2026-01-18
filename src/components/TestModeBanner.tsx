import React from "react";
import { AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";

export const TestModeBanner: React.FC = () => {
  const [isTestMode, setIsTestMode] = React.useState(false);

  React.useEffect(() => {
    const testModeFlag = localStorage.getItem("test_mode");
    setIsTestMode(testModeFlag === "true");
  }, []);

  const returnToSuperAdmin = () => {
    try {
      const savedOriginalUser = localStorage.getItem("original_superadmin");
      if (!savedOriginalUser) {
        toast.error("Cannot find original SuperAdmin session");
        return;
      }

      const superAdmin = JSON.parse(savedOriginalUser);

      // Restore superadmin session
      localStorage.setItem("auth_token", "superadmin_token");
      localStorage.setItem("user_id", superAdmin.id);
      localStorage.setItem("user_email", superAdmin.email);
      localStorage.setItem("user_name", superAdmin.name);
      localStorage.setItem("user_role", superAdmin.role);

      // Clear test mode flags
      localStorage.removeItem("test_mode");
      localStorage.removeItem("original_superadmin");

      toast.success("Returned to SuperAdmin view");

      // Reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error returning to SuperAdmin:", error);
      toast.error("Failed to return to SuperAdmin view");
    }
  };

  if (!isTestMode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
        <div>
          <p className="font-semibold">Test Mode Active</p>
          <p className="text-sm text-yellow-100">
            You are viewing this dashboard as a test user via SuperAdmin
          </p>
        </div>
      </div>
      <button
        onClick={returnToSuperAdmin}
        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <Shield className="w-4 h-4" />
        <span className="font-semibold">Return to SuperAdmin</span>
      </button>
    </div>
  );
};
