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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { PaymentModal } from "./PaymentModal";

// Package limits for branches
const BRANCH_LIMITS = {
  basic: 1, // Single branch allowed
  professional: 5, // Up to 5 branches
  enterprise: Infinity, // Unlimited
};

interface BranchManagementProps {
  onNavigateToSubscription?: () => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({
  onNavigateToSubscription,
}) => {
  const { currentUser, tenantInfo } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const currentPackage = tenantInfo?.package || "basic";
  const branchLimit =
    BRANCH_LIMITS[currentPackage as keyof typeof BRANCH_LIMITS] || 0;

  useEffect(() => {
    loadBranches();
  }, [currentUser]);

  const loadBranches = () => {
    const allBranches: Branch[] = getFromStorage("branches", []);
    const userBranches = allBranches.filter(
      (b) => b.workspaceId === currentUser?.workspaceId
    );
    setBranches(userBranches);
  };

  const handleAddBranch = () => {
    // Check package limits
    if (branches.length >= branchLimit) {
      if (currentPackage === "basic") {
        setUpgradeMessage(
          "You've reached the maximum of 1 branch in the Basic package. Upgrade to Professional to create up to 5 branches, or Enterprise for unlimited branches."
        );
      } else if (currentPackage === "professional") {
        setUpgradeMessage(
          "You've reached the maximum of 5 branches in the Professional package. Upgrade to Enterprise for unlimited branches."
        );
      } else {
        setUpgradeMessage(
          "You've reached your branch limit. Please upgrade your package."
        );
      }
      setShowUpgradeModal(true);
      return;
    }

    setEditingBranch(null);
    setShowAddModal(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setShowAddModal(true);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this branch? Users assigned to this branch will need to be reassigned."
      )
    ) {
      const allBranches: Branch[] = getFromStorage("branches", []);
      const updatedBranches = allBranches.filter((b) => b.id !== branchId);
      saveToStorage("branches", updatedBranches);
      loadBranches();
    }
  };

  const handleSaveBranch = (branchData: Partial<Branch>) => {
    const allBranches: Branch[] = getFromStorage("branches", []);

    if (editingBranch) {
      // Update existing branch
      const updatedBranches = allBranches.map((b) =>
        b.id === editingBranch.id
          ? { ...b, ...branchData, updatedAt: new Date().toISOString() }
          : b
      );
      saveToStorage("branches", updatedBranches);
    } else {
      // Create new branch
      const newBranch: Branch = {
        id: `branch_${Date.now()}`,
        name: branchData.name || "",
        code: branchData.code || "",
        address: branchData.address || "",
        city: branchData.city || "",
        state: branchData.state,
        phone: branchData.phone || "",
        email: branchData.email,
        manager: branchData.manager,
        managerName: branchData.managerName,
        isActive: true,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };
      saveToStorage("branches", [...allBranches, newBranch]);
    }

    setShowAddModal(false);
    setEditingBranch(null);
    loadBranches();
  };

  // Get users count for each branch
  const getBranchUserCount = (branchId: string): number => {
    const allUsers = getFromStorage("users", []);
    return allUsers.filter((u: any) => u.branchId === branchId && u.isActive)
      .length;
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
        </div>
        <div className="text-right">
          <button
            onClick={handleAddBranch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Branch
          </button>
          <p className="text-xs text-gray-500 mt-2">
            <span>
              {branches.length} / {branchLimit === Infinity ? "∞" : branchLimit}{" "}
              branches used
            </span>
          </p>
        </div>
      </div>

      {/* Package Limit Warning - Only for Basic with 1 branch already */}
      {currentPackage === "basic" && branches.length >= 1 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start">
            <Lock className="text-orange-600 mr-3 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">
                Branch Limit Reached
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Your Basic package allows 1 branch only. Upgrade to Professional
                to create up to 5 branches, or Enterprise for unlimited
                branches.
              </p>
              <button
                onClick={() => {
                  setUpgradeMessage(
                    "Upgrade to Professional or Enterprise to unlock more branches and assign staff to different locations."
                  );
                  setShowUpgradeModal(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 flex items-center"
              >
                <Crown size={16} className="mr-2" />
                Upgrade Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
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
          branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{branch.name}</h3>
                    <p className="text-xs text-gray-500">Code: {branch.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBranch(branch)}
                    className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <p className="flex items-start">
                  <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                  {branch.address}, {branch.city}
                </p>
                {branch.phone && <p>📞 {branch.phone}</p>}
                {branch.managerName && (
                  <p className="flex items-center text-indigo-600">
                    <UsersIcon size={14} className="mr-2" />
                    Manager: {branch.managerName}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon size={16} className="mr-2" />
                  {getBranchUserCount(branch.id)} staff members
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    branch.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Branch Modal */}
      {showAddModal && (
        <BranchModal
          branch={editingBranch}
          onSave={handleSaveBranch}
          onClose={() => {
            setShowAddModal(false);
            setEditingBranch(null);
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          message={upgradeMessage}
          currentPackage={currentPackage}
          onClose={() => setShowUpgradeModal(false)}
          onPaymentSuccess={() => {
            // Save the panel to navigate to after reload
            localStorage.setItem("navigateToPanel", "subscription");
            // Reload to refresh data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Branch Modal Component
interface BranchModalProps {
  branch: Branch | null;
  onSave: (data: Partial<Branch>) => void;
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
    manager: branch?.manager || "",
    managerName: branch?.managerName || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900 flex items-center">
            <Building2 className="mr-2" size={24} />
            {branch ? "Edit Branch" : "Add New Branch"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Main Branch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="MAIN"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              placeholder="Street Address"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Pokhara"
                required
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Bagmati"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="+977"
                required
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="branch@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {branch ? "Update Branch" : "Create Branch"}
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
  onPaymentSuccess?: () => void;
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

  const handleUpgrade = (targetPackage: string, price: number) => {
    setSelectedPackageForPayment({ name: targetPackage, price });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onClose();
    // Call parent callback which will handle redirect + reload
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-orange-600" size={32} />
              </div>
              <h3 className="text-gray-900 mb-2">Upgrade Your Package</h3>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Package Comparison */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div
                className={`border-2 rounded-xl p-4 ${
                  currentPackage === "basic"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Basic</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 1 branch only</p>
                  <p>• Single location</p>
                  <p className="text-xs text-gray-500 mt-2">NPR 5,000/month</p>
                </div>
                {currentPackage === "basic" && (
                  <div className="mt-2 text-xs font-bold text-indigo-600">
                    Current Plan
                  </div>
                )}
              </div>

              <div
                className={`border-2 rounded-xl p-4 ${
                  currentPackage === "professional"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Professional</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Up to 5 branches</p>
                  <p>• Multi-location</p>
                  <p className="text-xs text-gray-500 mt-2">NPR 15,000/month</p>
                </div>
                {currentPackage === "professional" && (
                  <div className="mt-2 text-xs font-bold text-indigo-600">
                    Current Plan
                  </div>
                )}
                {currentPackage === "basic" && (
                  <button
                    onClick={() => handleUpgrade("professional", 15000)}
                    className="mt-2 w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                  >
                    Upgrade
                  </button>
                )}
              </div>

              <div
                className={`border-2 rounded-xl p-4 ${
                  currentPackage === "enterprise"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Enterprise</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Unlimited branches</p>
                  <p>• Advanced features</p>
                  <p className="text-xs text-gray-500 mt-2">NPR 35,000/month</p>
                </div>
                {currentPackage === "enterprise" && (
                  <div className="mt-2 text-xs font-bold text-indigo-600">
                    Current Plan
                  </div>
                )}
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
