import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  UserCheck,
  Shield,
  Package,
  Wallet,
  Eye,
  Copy,
  Check,
  AlertCircle,
  Info,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { User as UserType } from "../types";
import { toast } from "sonner";
import { PopupContainer } from "./PopupContainer";
import { useCustomPopup } from "../hooks/useCustomPopup";

interface TestUser {
  id: string;
  email: string;
  password: string;
  role: "admin" | "inventory_manager" | "cashier";
  name: string;
  businessName?: string;
  phone?: string;
  workspaceId: string;
  isActive: boolean;
  createdAt: string;
  permissions: string[];
}

const TEST_USERS: TestUser[] = [
  {
    id: "test_admin_001",
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    name: "Test Admin",
    businessName: "Test Business",
    phone: "+977-9801234567",
    workspaceId: "test_workspace_001",
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: [],
  },
  {
    id: "test_inventory_001",
    email: "inventory@test.com",
    password: "inventory123",
    role: "inventory_manager",
    name: "Test Inventory Manager",
    workspaceId: "test_workspace_001",
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: [],
  },
  {
    id: "test_cashier_001",
    email: "cashier@test.com",
    password: "cashier123",
    role: "cashier",
    name: "Test Cashier",
    workspaceId: "test_workspace_001",
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: [],
  },
];

export const RoleTestingPanel: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const popup = useCustomPopup();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [originalUser, setOriginalUser] = useState<UserType | null>(null);
  const [testUsers, setTestUsers] = useState<TestUser[]>(TEST_USERS);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // Check if currently in test mode
    const testModeFlag = localStorage.getItem("test_mode");
    const savedOriginalUser = localStorage.getItem("original_superadmin");

    if (testModeFlag === "true" && savedOriginalUser) {
      setIsTestMode(true);
      setOriginalUser(JSON.parse(savedOriginalUser));
    }

    // Load test users from localStorage if they exist
    const storedTestUsers = localStorage.getItem("test_users");
    if (storedTestUsers) {
      setTestUsers(JSON.parse(storedTestUsers));
    } else {
      // Initialize test users in storage
      localStorage.setItem("test_users", JSON.stringify(TEST_USERS));
    }
  }, []);

  const copyToClipboard = (text: string, type: "email" | "password") => {
    // Try modern clipboard API first
    if (
      navigator.clipboard &&
      navigator.clipboard.writeText &&
      window.isSecureContext
    ) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (type === "email") {
            setCopiedEmail(text);
            setTimeout(() => setCopiedEmail(null), 2000);
          } else {
            setCopiedPassword(text);
            setTimeout(() => setCopiedPassword(null), 2000);
          }
          toast.success(
            `${type === "email" ? "Email" : "Password"} copied to clipboard!`
          );
        })
        .catch(() => {
          // Fallback method
          fallbackCopyToClipboard(text, type);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text, type);
    }
  };

  const fallbackCopyToClipboard = (
    text: string,
    type: "email" | "password"
  ) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      if (type === "email") {
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
      } else {
        setCopiedPassword(text);
        setTimeout(() => setCopiedPassword(null), 2000);
      }
      toast.success(
        `${type === "email" ? "Email" : "Password"} copied to clipboard!`
      );
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  const switchToRole = async (testUser: TestUser) => {
    try {
      setIsSwitching(true);

      // Save current superadmin session
      if (!isTestMode && currentUser) {
        localStorage.setItem(
          "original_superadmin",
          JSON.stringify(currentUser)
        );
        localStorage.setItem("test_mode", "true");
      }

      // Get all users from storage
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if test user already exists, if not add them
      const existingUserIndex = allUsers.findIndex(
        (u: any) => u.id === testUser.id
      );
      if (existingUserIndex === -1) {
        allUsers.push(testUser);
        localStorage.setItem("users", JSON.stringify(allUsers));
      }

      // Set up session for test user
      localStorage.setItem("auth_token", "test_token_" + testUser.id);
      localStorage.setItem("user_id", testUser.id);
      localStorage.setItem("user_email", testUser.email);
      localStorage.setItem("user_name", testUser.name);
      localStorage.setItem("user_role", testUser.role);

      if (testUser.businessName) {
        localStorage.setItem("business_name", testUser.businessName);
      }

      toast.success(
        `Switching to ${testUser.role.replace("_", " ").toUpperCase()} view...`
      );

      // Immediate reload
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch role");
      setIsSwitching(false);
    }
  };

  const returnToSuperAdmin = async () => {
    try {
      setIsSwitching(true);

      const savedOriginalUser = localStorage.getItem("original_superadmin");
      if (!savedOriginalUser) {
        toast.error("Cannot find original SuperAdmin session");
        setIsSwitching(false);
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

      toast.success("Returning to SuperAdmin view...");

      // Immediate reload
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (error) {
      console.error("Error returning to SuperAdmin:", error);
      toast.error("Failed to return to SuperAdmin view");
      setIsSwitching(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "inventory_manager":
        return Package;
      case "cashier":
        return Wallet;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "from-purple-500 to-indigo-600";
      case "inventory_manager":
        return "from-blue-500 to-cyan-600";
      case "cashier":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const deleteTestUser = useCallback(
    (userId: string) => {
      popup.showConfirm(
        "Delete Test User",
        "Are you sure you want to delete this test user?",
        () => {
          const updatedUsers = testUsers.filter((u) => u.id !== userId);
          setTestUsers(updatedUsers);
          localStorage.setItem("test_users", JSON.stringify(updatedUsers));

          // Also remove from users array
          const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
          const filteredUsers = allUsers.filter((u: any) => u.id !== userId);
          localStorage.setItem("users", JSON.stringify(filteredUsers));

          toast.success("Test user deleted");
          popup.showSuccess(
            "User Deleted",
            "The test user has been successfully deleted."
          );
        }
      );
    },
    [testUsers, popup]
  );

  const resetTestUsers = useCallback(() => {
    popup.showConfirm(
      "Reset Test Users",
      "Reset all test users to default? This will remove any custom test users.",
      () => {
        setTestUsers(TEST_USERS);
        localStorage.setItem("test_users", JSON.stringify(TEST_USERS));

        // Clean up users array
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const cleanedUsers = allUsers.filter(
          (u: any) =>
            u.role === "super_admin" || TEST_USERS.some((tu) => tu.id === u.id)
        );
        localStorage.setItem("users", JSON.stringify(cleanedUsers));

        toast.success("Test users reset to defaults");
        popup.showSuccess(
          "Test Users Reset",
          "All test users have been reset to default values."
        );
      }
    );
  }, [popup]);

  return (
    <div className="p-6 space-y-6">
      {/* Smooth Loading Overlay */}
      {isSwitching && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Switching Dashboard...
            </h3>
            <p className="text-gray-600">Please wait a moment</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Role Testing Panel</h2>
            <p className="text-orange-100">
              Switch between different user roles to test their dashboards
              without logging out
            </p>
          </div>
          <UserCheck className="w-12 h-12 text-white/50" />
        </div>
      </div>

      {/* Test Mode Warning */}
      {isTestMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold mb-1">
                Test Mode Active
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                You are currently viewing a test user dashboard. Click the
                button below to return to SuperAdmin view.
              </p>
              <button
                onClick={returnToSuperAdmin}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to SuperAdmin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-800">
            <p className="font-semibold mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>
                Click "Switch to This Role" to view that user&apos;s dashboard
              </li>
              <li>Copy credentials to manually login if needed</li>
              <li>
                Your SuperAdmin session is preserved - you can return anytime
              </li>
              <li>Test users are isolated and won&apos;t affect real data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={resetTestUsers}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Test Users</span>
        </button>
      </div>

      {/* Test Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {testUsers.map((testUser) => {
          const RoleIcon = getRoleIcon(testUser.role);
          const roleColor = getRoleColor(testUser.role);

          return (
            <div
              key={testUser.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${roleColor} p-4 text-white`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <RoleIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg capitalize">
                      {testUser.role.replace("_", " ")}
                    </h3>
                    <p className="text-white/80 text-sm">{testUser.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Email */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={testUser.email}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(testUser.email, "email")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === testUser.email ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">
                    Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={testUser.password}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(testUser.password, "password")
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy password"
                    >
                      {copiedPassword === testUser.password ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                {testUser.businessName && (
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block">
                      Business Name
                    </label>
                    <p className="text-sm text-gray-700">
                      {testUser.businessName}
                    </p>
                  </div>
                )}

                {testUser.phone && (
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block">
                      Phone
                    </label>
                    <p className="text-sm text-gray-700">{testUser.phone}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => switchToRole(testUser)}
                    disabled={isTestMode && currentUser?.id === testUser.id}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isTestMode && currentUser?.id === testUser.id
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : `bg-gradient-to-r ${roleColor} text-white hover:opacity-90`
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>
                      {isTestMode && currentUser?.id === testUser.id
                        ? "Currently Viewing"
                        : "Switch to This Role"}
                    </span>
                  </button>

                  {!TEST_USERS.some((u) => u.id === testUser.id) && (
                    <button
                      onClick={() => deleteTestUser(testUser.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5 text-gray-600" />
          <span>Testing Tips</span>
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-orange-600 font-bold">•</span>
            <span>
              <strong>Admin Dashboard:</strong> Test admin-level features like
              user management, branch setup, and business settings
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              <strong>Inventory Manager:</strong> Test inventory operations,
              stock management, and product cataloging
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-600 font-bold">•</span>
            <span>
              <strong>Cashier Dashboard:</strong> Test POS system, billing, and
              cash drawer operations
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-gray-600 font-bold">•</span>
            <span>
              All test users share the same workspace for easier testing of
              collaborative features
            </span>
          </li>
        </ul>
      </div>

      {/* Popup Container */}
      <PopupContainer
        showSuccessPopup={popup.showSuccessPopup}
        successTitle={popup.successTitle}
        successMessage={popup.successMessage}
        onSuccessClose={popup.hideSuccess}
        showErrorPopup={popup.showErrorPopup}
        errorTitle={popup.errorTitle}
        errorMessage={popup.errorMessage}
        errorType={popup.errorType}
        onErrorClose={popup.hideError}
        showConfirmDialog={popup.showConfirmDialog}
        confirmConfig={popup.confirmConfig}
        onConfirmCancel={popup.hideConfirm}
      />
    </div>
  );
};
