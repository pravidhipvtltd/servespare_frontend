import React, { useState, useEffect } from "react";
import {
  Plus,
  Building2,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users as UsersIcon,
  Crown,
  Lock,
  X,
  Check,
  UserPlus,
  Eye,
  EyeOff,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { PaymentModal } from "./PaymentModal";
import { UserRole } from "../types";
import { PopupContainer } from "./PopupContainer";
import { useCustomPopup } from "../hooks/useCustomPopup";
// Backend API removed - using localStorage only
import {
  getCurrentUserSubscription,
  Subscription,
} from "../api/subscription.api";

// Branch limits are now fetched from API only - no hardcoded values

// Backend User type
interface BackendUser {
  id: string;
  tenantId: string;
  username?: string;
  email: string;
  password?: string;
  role: UserRole;
  name?: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  phone: string;
  email?: string;
  manager?: string;
  managerName?: string;
  isActive: boolean;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

interface BranchManagementProps {
  onNavigateToSubscription?: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  inventory_manager: "Inventory Manager",
  cashier: "Cashier",
};

const ROLE_COLORS: Record<
  UserRole,
  { bg: string; text: string; badge: string }
> = {
  super_admin: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-gradient-to-r from-red-500 to-pink-600",
  },
  admin: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "bg-gradient-to-r from-purple-500 to-indigo-600",
  },
  inventory_manager: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-gradient-to-r from-blue-500 to-cyan-600",
  },
  cashier: {
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-gradient-to-r from-green-500 to-emerald-600",
  },
};

export const BranchManagement: React.FC<BranchManagementProps> = ({
  onNavigateToSubscription,
}) => {
  const { currentUser, tenantInfo } = useAuth();
  const popup = useCustomPopup();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);

  // Subscription state
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // User management states
  const [branchUsers, setBranchUsers] = useState<{
    [branchId: string]: BackendUser[];
  }>({});
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [selectedBranchForUser, setSelectedBranchForUser] =
    useState<Branch | null>(null);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Determine current package and limits from subscription API only
  const currentPackage =
    currentSubscription?.subscription_plan_detail?.plan_name?.toLowerCase() ||
    null;
  const branchLimit = currentSubscription?.subscription_plan_detail
    ?.no_of_branch
    ? parseInt(currentSubscription.subscription_plan_detail.no_of_branch)
    : null;

  useEffect(() => {
    loadBranches();
    loadSubscription();
  }, [currentUser]);

  useEffect(() => {
    // Load users for all branches
    loadAllBranchUsers();
  }, [branches]);

  const loadSubscription = async () => {
    setIsLoadingSubscription(true);
    try {
      const workspaceId = currentUser?.workspaceId;
      const email = currentUser?.email;

      const subscription = await getCurrentUserSubscription(workspaceId, email);
      setCurrentSubscription(subscription);

      console.log("Loaded subscription:", subscription);
    } catch (error) {
      console.error("Error loading subscription:", error);
      // Fallback to tenantInfo if API fails
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const loadBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/branch/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedBranches: Branch[] = data.results.map((apiBranch: any) => ({
          id: apiBranch.id.toString(),
          name: apiBranch.branch_name,
          code: apiBranch.branch_code,
          address: apiBranch.Address,
          city: apiBranch.city,
          state: apiBranch.state,
          phone: apiBranch.phone,
          email: apiBranch.Email,
          isActive: apiBranch.is_active,
          workspaceId: apiBranch.tenant
            ? apiBranch.tenant.toString()
            : currentUser?.workspaceId?.toString(),
          createdAt: apiBranch.created,
          updatedAt: apiBranch.modified,
        }));
        setBranches(mappedBranches);
      } else {
        console.error("Failed to fetch branches:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const loadAllBranchUsers = async () => {
    if (branches.length === 0) {
      setBranchUsers({});
      return;
    }

    setIsLoadingUsers(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      const promises = branches.map(async (branch) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/users/by-branch/${
              branch.id
            }/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const usersList = Array.isArray(data) ? data : data.results || [];

            const mappedUsers: BackendUser[] = usersList.map(
              (apiUser: any) => ({
                id: apiUser.id.toString(),
                tenantId: apiUser.tenant?.toString() || "",
                username: apiUser.username,
                email: apiUser.email,
                role: apiUser.role as UserRole,
                name:
                  apiUser.full_name ||
                  `${apiUser.first_name || ""} ${
                    apiUser.last_name || ""
                  }`.trim(),
                phone: apiUser.phone,
                status: apiUser.status,
                branchId: apiUser.branch?.toString(),
                createdAt: apiUser.created,
                updatedAt: apiUser.modified,
              })
            );

            return { branchId: branch.id, users: mappedUsers };
          }
        } catch (err) {
          console.error(`Error fetching users for branch ${branch.id}:`, err);
        }
        return { branchId: branch.id, users: [] };
      });

      const results = await Promise.all(promises);
      const groupedUsers: { [branchId: string]: BackendUser[] } = {};

      results.forEach((result) => {
        if (result.users && result.users.length > 0) {
          groupedUsers[result.branchId] = result.users;
        }
      });

      setBranchUsers(groupedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddBranch = () => {
    if (isLoadingSubscription) {
      popup.showError(
        "Please wait while we load your subscription information.",
        "Loading..."
      );
      return;
    }

    // Check if subscription data is available
    if (!currentSubscription || branchLimit === null) {
      popup.showError(
        "Unable to verify your subscription plan. Please try again.",
        "Subscription Error"
      );
      return;
    }

    // Check branch limit from API
    if (branches.length >= branchLimit) {
      const planName = currentSubscription.subscription_plan_detail.plan_name;
      setUpgradeMessage(
        `You've reached the maximum of ${branchLimit} ${
          branchLimit === 1 ? "branch" : "branches"
        } allowed in your ${planName} plan. Please upgrade your package to create more branches.`
      );
      setShowUpgradeModal(true);
      return;
    }

    setEditingBranch(null);
    setShowAddBranchModal(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setShowAddBranchModal(true);
  };

  const handleDeleteBranch = async (branchId: string) => {
    popup.showConfirm(
      "Delete Branch",
      "Are you sure you want to delete this branch?",
      async () => {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("auth_token");
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/branch/${branchId}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          if (response.ok) {
            loadBranches();
            popup.showSuccess("Branch deleted successfully!");
          } else {
            console.error("Failed to delete branch:", response.statusText);
            popup.showError(
              "Failed to delete branch. Please try again.",
              "Delete Failed"
            );
          }
        } catch (error) {
          console.error("Error deleting branch:", error);
          popup.showError(
            "An error occurred while deleting the branch.",
            "Error"
          );
        }
      },
      {
        type: "danger",
        details: [
          "Users assigned to this branch will need to be reassigned",
          "This action cannot be undone",
        ],
      }
    );
  };

  const handleSaveBranch = async (branchData: Partial<Branch>) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      const apiData = {
        is_removed: false,
        is_active:
          branchData.isActive !== undefined ? branchData.isActive : true,
        branch_name: branchData.name || "",
        branch_code: branchData.code || "",
        Address: branchData.address || "",
        city: branchData.city || "",
        state: branchData.state || "",
        phone: branchData.phone || "",
        Email: branchData.email || "",
      };

      let response;
      if (editingBranch) {
        // Update existing branch
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/branch/${editingBranch.id}/`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(apiData),
          }
        );
      } else {
        // Create new branch
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/branch/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = "Failed to save branch";

        if (errorData) {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === "object") {
            const messages: string[] = [];
            Object.entries(errorData).forEach(([key, value]) => {
              const formattedKey =
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
              if (Array.isArray(value)) {
                messages.push(`${formattedKey}: ${value.join(", ")}`);
              } else if (typeof value === "string") {
                messages.push(`${formattedKey}: ${value}`);
              } else if (typeof value === "object" && value !== null) {
                // Handle nested objects if necessary, or just stringify
                messages.push(`${formattedKey}: ${JSON.stringify(value)}`);
              }
            });
            if (messages.length > 0) {
              errorMessage = messages.join("\n");
            }
          }
        }
        throw new Error(errorMessage);
      }

      setShowAddBranchModal(false);
      setEditingBranch(null);
      loadBranches();
      popup.showSuccess(
        editingBranch
          ? "Branch updated successfully"
          : "Branch created successfully"
      );
    } catch (error: any) {
      console.error("Error saving branch:", error);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const getBranchUserCount = (branchId: string): number => {
    return (
      branchUsers[branchId]?.filter((u) => u.status === "active").length || 0
    );
  };

  const toggleBranchExpand = (branchId: string) => {
    setExpandedBranchId(expandedBranchId === branchId ? null : branchId);
  };

  const handleAddUserToBranch = (branch: Branch) => {
    setSelectedBranchForUser(branch);
    setEditingUser(null);
    setShowUserDrawer(true);
  };

  const handleEditUser = (user: BackendUser, branch: Branch) => {
    setSelectedBranchForUser(branch);
    setEditingUser(user);
    setShowUserDrawer(true);
  };

  const handleDeleteUser = async (userId: string) => {
    popup.showConfirm(
      "Delete User",
      "Are you sure you want to delete this user?",
      async () => {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("auth_token");

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/users/${userId}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          if (!response.ok) {
            console.error("Failed to delete user:", response.statusText);
            throw new Error("Failed to delete user from server");
          }

          // Delete user from localStorage
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const filteredUsers = users.filter((u: any) => u.id !== userId);
          localStorage.setItem("users", JSON.stringify(filteredUsers));
          loadAllBranchUsers();
          popup.showSuccess("User deleted successfully!");
        } catch (error) {
          console.error("Error deleting user:", error);
          popup.showError(
            "Failed to delete user. Please try again.",
            "Delete Failed"
          );
        }
      },
      {
        type: "danger",
        details: [
          "This action cannot be undone",
          "User access will be revoked immediately",
        ],
      }
    );
  };

  return (
    <div className="p-6">
      {/* Header with Package Info */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-gray-900 mb-2 flex items-center">
            <Building2 className="mr-2" size={24} />
            Branch Management
          </h2>
          <p className="text-gray-600 text-sm">
            Manage your business locations and assign staff
          </p>
          {isLoadingSubscription && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <span className="animate-pulse">Loading subscription...</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <button
            onClick={handleAddBranch}
            disabled={isLoadingSubscription}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} className="mr-2" />
            Add Branch
          </button>
          {branchLimit !== null && (
            <p className="text-xs text-gray-500 mt-2">
              <span>
                {branches.length} /{" "}
                {branchLimit === Infinity || branchLimit === 999999
                  ? "∞"
                  : branchLimit}{" "}
                branches used
              </span>
            </p>
          )}
          {currentSubscription && (
            <p className="text-xs text-gray-400 mt-1">
              Plan: {currentSubscription.subscription_plan_detail.plan_name}
            </p>
          )}
        </div>
      </div>

      {/* Package Limit Warning */}
      {branchLimit !== null && branches.length >= branchLimit && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start">
            <Lock className="text-orange-600 mr-3 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">
                Branch Limit Reached
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                You've reached your limit of {branchLimit}{" "}
                {branchLimit === 1 ? "branch" : "branches"} in the{" "}
                {currentSubscription?.subscription_plan_detail.plan_name} plan.
                Upgrade to add more branches.
              </p>
              {/* <button
                onClick={() => {
                  setUpgradeMessage(
                    `Your current plan allows ${branchLimit} ${
                      branchLimit === 1 ? "branch" : "branches"
                    }. Upgrade your package to unlock more branches and assign staff to different locations.`
                  );
                  setShowUpgradeModal(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 flex items-center"
              >
                <Crown size={16} className="mr-2" />
                Upgrade Package
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Branches List with Expandable User Sections */}
      <div className="space-y-4">
        {isLoadingBranches ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading branches...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-gray-600 mb-2">No branches created yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first branch to start organizing your business
              locations
            </p>
            <button
              onClick={handleAddBranch}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create First Branch
            </button>
          </div>
        ) : (
          branches.map((branch) => {
            const isExpanded = expandedBranchId === branch.id;
            const users = branchUsers[branch.id] || [];

            return (
              <div
                key={branch.id}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Branch Header */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start flex-1">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <MapPin className="text-indigo-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {branch.name}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {branch.code}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2" />
                            {branch.address}, {branch.city}
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2" />
                            {branch.phone}
                          </div>
                          {branch.email && (
                            <div className="flex items-center">
                              <Mail size={14} className="mr-2" />
                              {branch.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Branch Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditBranch(branch)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Branch"
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* User Stats & Expand Button */}
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <UsersIcon size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          {getBranchUserCount(branch.id)} Active Users
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBranchExpand(branch.id)}
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      <span>{isExpanded ? "Hide Users" : "Manage Users"}</span>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Users Section */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <UsersIcon size={18} className="mr-2" />
                        Branch Users
                      </h4>
                      <button
                        onClick={() => handleAddUserToBranch(branch)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center text-sm"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Add User
                      </button>
                    </div>

                    {/* Users List */}
                    {users.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <UsersIcon
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <p className="text-gray-500 text-sm mb-3">
                          No users assigned to this branch yet
                        </p>
                        <button
                          onClick={() => handleAddUserToBranch(branch)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Add your first user
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                          >
                            {(() => {
                              const displayName =
                                user.name ||
                                user.username ||
                                user.email ||
                                "User";
                              const initial = displayName
                                .charAt(0)
                                .toUpperCase();
                              return (
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      ROLE_COLORS[user.role].bg
                                    }`}
                                  >
                                    <span
                                      className={`font-semibold ${
                                        ROLE_COLORS[user.role].text
                                      }`}
                                    >
                                      {initial}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {displayName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  ROLE_COLORS[user.role].bg
                                } ${ROLE_COLORS[user.role].text}`}
                              >
                                {ROLE_LABELS[user.role]}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {user.status}
                              </span>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEditUser(user, branch)}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={14} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} className="text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Branch Add/Edit Modal */}
      {showAddBranchModal && (
        <BranchModal
          branch={editingBranch}
          onSave={handleSaveBranch}
          onClose={() => {
            setShowAddBranchModal(false);
            setEditingBranch(null);
          }}
        />
      )}

      {/* User Add/Edit Drawer */}
      {showUserDrawer && selectedBranchForUser && (
        <UserDrawer
          branch={selectedBranchForUser}
          user={editingUser}
          tenantId={currentUser?.workspaceId || null}
          onClose={() => {
            setShowUserDrawer(false);
            setSelectedBranchForUser(null);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowUserDrawer(false);
            setSelectedBranchForUser(null);
            setEditingUser(null);
            loadAllBranchUsers();
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          message={upgradeMessage}
          currentPackage={currentPackage || ""}
          onClose={() => setShowUpgradeModal(false)}
          onPaymentSuccess={() => {
            localStorage.setItem("navigateToPanel", "subscription");
            window.location.reload();
          }}
        />
      )}

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

// Branch Modal Component
interface BranchModalProps {
  branch: Branch | null;
  onSave: (data: Partial<Branch>) => Promise<void>;
  onClose: () => void;
}

const BranchModal: React.FC<BranchModalProps> = ({
  branch,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    code: branch?.code || "",
    address: branch?.address || "",
    city: branch?.city || "",
    state: branch?.state || "",
    phone: branch?.phone || "+977",
    email: branch?.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-900">
            {branch ? "Edit Branch" : "Add New Branch"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Main Branch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="BR001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Pokhara"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Bagmati"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+977"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="branch@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {branch ? "Update Branch" : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Drawer Component (Same as UserRolesPanel)
interface UserDrawerProps {
  branch: Branch;
  user: BackendUser | null;
  tenantId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  branch,
  user,
  tenantId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    username: user?.username || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    confirmPassword: "",
    role: (user?.role || "inventory_manager") as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate password and confirm password match
      if (!user && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      if (user) {
        // Update existing user via API
        const updatePayload: any = {
          username: formData.username,
          phone: formData.phone,
          role: formData.role,
        };

        if (formData.password) {
          updatePayload.password = formData.password;
          updatePayload.password_confirm = formData.confirmPassword;
        }

        console.log("Updating user with payload:", updatePayload);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(updatePayload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMessage = "Failed to update user";

          if (errorData) {
            if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === "object") {
              const messages: string[] = [];
              Object.entries(errorData).forEach(([key, value]) => {
                const formattedKey =
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
                if (Array.isArray(value)) {
                  messages.push(`${formattedKey}: ${value.join(", ")}`);
                } else if (typeof value === "string") {
                  messages.push(`${formattedKey}: ${value}`);
                }
              });
              if (messages.length > 0) {
                errorMessage = messages.join("\n");
              }
            }
          }
          throw new Error(errorMessage);
        }

        // Also update localStorage for UI consistency
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            username: formData.username,
            name: formData.username,
            phone: formData.phone,
            role: formData.role,
          };
          localStorage.setItem("users", JSON.stringify(users));
        }
      } else {
        // Create new user via API then mirror to localStorage for UI consistency
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          phone: formData.phone,
          tenant: branch.workspaceId
            ? Number(branch.workspaceId)
            : Number(tenantId),
          branch: Number(branch.id),
          role: formData.role,
        };

        console.log("Creating user with payload:", payload);
        console.log("Original branch object:", branch);
        console.log("Passed tenantId:", tenantId);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMessage = "Failed to create user";

          if (errorData) {
            if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === "object") {
              const messages: string[] = [];
              Object.entries(errorData).forEach(([key, value]) => {
                const formattedKey =
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
                if (Array.isArray(value)) {
                  messages.push(`${formattedKey}: ${value.join(", ")}`);
                } else if (typeof value === "string") {
                  messages.push(`${formattedKey}: ${value}`);
                }
              });
              if (messages.length > 0) {
                errorMessage = messages.join("\n");
              }
            }
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        const created = responseData.user || responseData;

        // If branch or tenant is null, update them explicitly via PATCH
        if (created.id && (!created.branch || !created.tenant)) {
          try {
            const patchPayload = {
              branch: Number(branch.id),
              branch_id: Number(branch.id),
              tenant: branch.workspaceId
                ? Number(branch.workspaceId)
                : Number(tenantId),
              tenant_id: branch.workspaceId
                ? Number(branch.workspaceId)
                : Number(tenantId),
              workspace_id: branch.workspaceId
                ? Number(branch.workspaceId)
                : Number(tenantId),
            };

            await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/users/${created.id}/`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(patchPayload),
              }
            );
          } catch (patchError) {
            console.error(
              "Failed to patch user branch/tenant info:",
              patchError
            );
          }
        }

        // Mirror to localStorage so the UI list updates immediately
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        users.push({
          id: created?.id?.toString() || `user_${Date.now()}`,
          username: created?.username || formData.username,
          name: created?.full_name || created?.username || formData.username,
          email: created?.email || formData.email,
          phone: created?.phone || formData.phone,
          role: created?.role || formData.role,
          branchId: branch.id,
          tenantId: tenantId,
          status: created?.status || "active",
          createdAt: created?.created || new Date().toISOString(),
          updatedAt: created?.modified || new Date().toISOString(),
        });
        localStorage.setItem("users", JSON.stringify(users));
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-lg bg-slate-800 shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl text-white">
              {user ? "Edit User" : "Add New User"}
            </h3>
            <p className="text-sm text-slate-400 mt-1">Branch: {branch.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm whitespace-pre-line">
                {error}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Email *</label>
            <input
              type="email"
              required
              disabled={!!user}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="+977"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Password {user ? "(leave blank to keep current)" : "*"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!user}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder={user ? "Enter new password" : "Enter password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Confirm Password {user ? "(leave blank to keep current)" : "*"}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required={!user}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder={
                  user ? "Re-enter new password" : "Confirm password"
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="inventory_manager">Inventory Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Upgrade Modal Component
interface UpgradeModalProps {
  message: string;
  currentPackage: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  message,
  currentPackage,
  onClose,
  onPaymentSuccess,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<{
    name: string;
    price: number;
  } | null>(null);

  const handleUpgrade = (packageName: string, price: number) => {
    setSelectedPackageForPayment({ name: packageName, price });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onClose();
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Crown className="mr-2 text-orange-600" size={24} />
                Upgrade Your Package
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Basic Package */}
              <div className="border-2 border-gray-300 rounded-xl p-4">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">Basic</h4>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    NPR 15,000
                  </div>
                  <div className="text-gray-500 text-sm">/year</div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />1 Branch
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    Basic Features
                  </li>
                </ul>
                {currentPackage === "basic" && (
                  <div className="text-center text-sm text-gray-600 font-medium">
                    Current Plan
                  </div>
                )}
              </div>

              {/* Professional Package */}
              <div className="border-2 border-indigo-600 rounded-xl p-4 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Popular
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Professional
                  </h4>
                  <div className="text-3xl font-bold text-indigo-600 mt-2">
                    NPR 25,000
                  </div>
                  <div className="text-gray-500 text-sm">/year</div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />5
                    Branches
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    Advanced Features
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    Priority Support
                  </li>
                </ul>
                {currentPackage !== "professional" &&
                  currentPackage !== "enterprise" && (
                    <button
                      onClick={() => handleUpgrade("professional", 25000)}
                      className="mt-2 w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                    >
                      Upgrade
                    </button>
                  )}
                {currentPackage === "professional" && (
                  <div className="text-center text-sm text-gray-600 font-medium">
                    Current Plan
                  </div>
                )}
              </div>

              {/* Enterprise Package */}
              <div className="border-2 border-orange-500 rounded-xl p-4">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Enterprise
                  </h4>
                  <div className="text-3xl font-bold text-orange-600 mt-2">
                    NPR 35,000
                  </div>
                  <div className="text-gray-500 text-sm">/year</div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    Unlimited Branches
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    All Features
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="text-green-600 mr-2" size={16} />
                    24/7 Support
                  </li>
                </ul>
                {currentPackage !== "enterprise" && (
                  <button
                    onClick={() => handleUpgrade("enterprise", 35000)}
                    className="mt-2 w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackageForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          currentPackage={currentPackage}
          targetPackage={selectedPackageForPayment.name}
          targetPrice={selectedPackageForPayment.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
