// Fixed Branch Management View Component
import React, { useState } from "react";
import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  X,
  Check,
} from "lucide-react";
import { Workspace, User, Bill } from "../types";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { ViewBranchModal, EditBranchModal } from "./SuperAdminModals";
import { handlePhoneInput, NEPAL_COUNTRY_CODE } from "../utils/phoneValidation";

interface BranchManagementViewProps {
  workspaces: Workspace[];
  users: User[];
  bills: Bill[];
  onUpdate: () => void;
}

export const BranchManagementViewFixed: React.FC<BranchManagementViewProps> = ({
  workspaces,
  users,
  bills,
  onUpdate,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: NEPAL_COUNTRY_CODE,
    address: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhoneInput(
      e.target.value,
      (phone) => setFormData({ ...formData, contactPhone: phone }),
      setPhoneError,
    );
  };

  const handleAddBranch = () => {
    if (!formData.name) {
      alert("⚠️ Please enter branch name");
      return;
    }

    const newWorkspace: Workspace = {
      id: `ws${Date.now()}`,
      name: formData.name,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: formData.address,
      createdAt: new Date().toISOString(),
    };

    const allWorkspaces: Workspace[] = getFromStorage("workspaces", []);
    saveToStorage("workspaces", [...allWorkspaces, newWorkspace]);
    onUpdate();
    setShowAddModal(false);
    setFormData({
      name: "",
      contactEmail: "",
      contactPhone: NEPAL_COUNTRY_CODE,
      address: "",
    });
    alert("✅ Branch created successfully!");
  };

  const deleteBranch = (workspaceId: string) => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to delete this branch? This action cannot be undone.",
      )
    ) {
      const allWorkspaces: Workspace[] = getFromStorage("workspaces", []);
      const updatedWorkspaces = allWorkspaces.filter(
        (w) => w.id !== workspaceId,
      );
      saveToStorage("workspaces", updatedWorkspaces);
      onUpdate();
      alert("✅ Branch deleted successfully!");
    }
  };

  const openViewModal = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowViewModal(true);
  };

  const openEditModal = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedWorkspace(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">
            Branch Management
          </h2>
          <p className="text-gray-600">
            Manage all business locations, stores, and branches
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{workspaces.length}</h2>
            <p className="text-purple-100">Total Active Branches</p>
          </div>
          <Building2 className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace: Workspace) => {
          const branchUsers = users.filter(
            (u: User) => u.workspaceId === workspace.id,
          );
          const branchBills = bills.filter(
            (b: Bill) => b.workspaceId === workspace.id,
          );
          const branchRevenue = branchBills.reduce(
            (sum: number, b: Bill) => sum + b.total,
            0,
          );

          return (
            <div
              key={workspace.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ● Active
                </span>
              </div>

              {/* Branch Name */}
              <h3 className="text-gray-900 font-bold text-xl mb-4">
                {workspace.name}
              </h3>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 text-sm">Users</span>
                  </div>
                  <span className="text-gray-900 font-bold">
                    {branchUsers.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 text-sm">Sales</span>
                  </div>
                  <span className="text-gray-900 font-bold">
                    {branchBills.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-sm">Revenue</span>
                  </div>
                  <span className="text-green-600 font-bold">
                    NPR {branchRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              {(workspace.contactEmail || workspace.contactPhone) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {workspace.contactEmail && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{workspace.contactEmail}</span>
                    </div>
                  )}
                  {workspace.contactPhone && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{workspace.contactPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openViewModal(workspace)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center space-x-2"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditModal(workspace)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Edit Branch"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => deleteBranch(workspace.id)}
                  className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Branch"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal - Clear and Simple */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-xl">
                    Add New Branch
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Create a new business location
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    contactEmail: "",
                    contactPhone: NEPAL_COUNTRY_CODE,
                    address: "",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Main Store Pokhara"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-gray-500 text-xs mt-1">
                  This field is required
                </p>
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Mail className="w-4 h-4 mr-2 text-purple-600" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  placeholder="branch@servespares.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Phone className="w-4 h-4 mr-2 text-purple-600" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handlePhoneChange}
                  placeholder="+977 98XXXXXXXX"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    phoneError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Enter 10 digit number after +977
                </p>
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                  Branch Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address, City, Postal Code"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    contactEmail: "",
                    contactPhone: NEPAL_COUNTRY_CODE,
                    address: "",
                  });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBranch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Add Branch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Branch Modal */}
      {showViewModal && selectedWorkspace && (
        <ViewBranchModal
          workspace={selectedWorkspace}
          users={users}
          bills={bills}
          onClose={closeModals}
        />
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedWorkspace && (
        <EditBranchModal
          workspace={selectedWorkspace}
          onClose={closeModals}
          onUpdate={() => {
            onUpdate();
            closeModals();
          }}
        />
      )}
    </div>
  );
};
