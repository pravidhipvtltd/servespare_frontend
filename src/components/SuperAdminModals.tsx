// Super Admin Edit & View Modals - FULLY FUNCTIONAL
import React, { useState } from 'react';
import { 
  X, Save, Edit, Eye, Users, Building2, Package, Mail, Phone, MapPin,
  Calendar, DollarSign, Tag, FileText, AlertCircle, CheckCircle, Shield
} from 'lucide-react';
import { User, Workspace, InventoryItem, Party } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';

// ==================== USER MODALS ====================

interface EditUserModalProps {
  user: User;
  workspaces: Workspace[];
  onClose: () => void;
  onUpdate: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, workspaces, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    workspaceId: user.workspaceId,
    isActive: user.isActive
  });

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    const allUsers: User[] = getFromStorage('users', []);
    const updatedUsers = allUsers.map(u => 
      u.id === user.id ? { ...u, ...formData } : u
    );
    saveToStorage('users', updatedUsers);
    onUpdate();
    onClose();
    alert('✅ User updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Edit User</h3>
              <p className="text-gray-600 text-sm">Update user information and permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User ID (Read-only) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">User ID</label>
            <input
              type="text"
              value={user.id}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("+977")) {
                  if (value.length <= 14) {
                    setFormData({ ...formData, phone: value });
                  }
                } else if (value.length <= 10) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              maxLength={14}
              placeholder="+977-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          {/* Workspace */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Workspace</label>
            <select
              value={formData.workspaceId}
              onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Workspace</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-700 font-semibold cursor-pointer">
              Active User Account
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewUserModalProps {
  user: User;
  workspaces: Workspace[];
  onClose: () => void;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, workspaces, onClose }) => {
  const workspace = workspaces.find(w => w.id === user.workspaceId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">User Details</h3>
              <p className="text-gray-600 text-sm">Complete user information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* User Avatar & Status */}
        <div className="flex items-center space-x-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="text-gray-900 text-2xl font-bold">{user.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.isActive ? '● Active' : '● Inactive'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">User ID</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-mono">{user.id}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Email Address</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{user.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Phone Number</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{user.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Workspace</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Building2 className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{workspace?.name || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Account Created</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Role Type</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{user.role.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
          <h4 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            Permissions & Access
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {user.role === 'super_admin' && (
              <>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Full System Access</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">User Management</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Branch Management</span>
                </div>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Dashboard Access</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Inventory Management</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Order Management</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Billing Access</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== BRANCH MODALS ====================

interface EditBranchModalProps {
  workspace: Workspace;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({ workspace, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: workspace.name,
    contactEmail: workspace.contactEmail || '',
    contactPhone: workspace.contactPhone || '',
    address: workspace.address || ''
  });

  const handleSave = () => {
    if (!formData.name) {
      alert('⚠️ Please enter branch name');
      return;
    }

    const allWorkspaces: Workspace[] = getFromStorage('workspaces', []);
    const updatedWorkspaces = allWorkspaces.map(w => 
      w.id === workspace.id ? { ...w, ...formData } : w
    );
    saveToStorage('workspaces', updatedWorkspaces);
    onUpdate();
    onClose();
    alert('✅ Branch updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Edit Branch</h3>
              <p className="text-gray-600 text-sm">Update branch information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Branch ID</label>
            <input
              type="text"
              value={workspace.id}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter branch name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="branch@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Phone</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("+977")) {
                  if (value.length <= 14) {
                    setFormData({ ...formData, contactPhone: value });
                  }
                } else if (value.length <= 10) {
                  setFormData({ ...formData, contactPhone: value });
                }
              }}
              maxLength={14}
              placeholder="+977-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter branch address"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewBranchModalProps {
  workspace: Workspace;
  users: User[];
  bills: any[];
  onClose: () => void;
}

export const ViewBranchModal: React.FC<ViewBranchModalProps> = ({ workspace, users, bills, onClose }) => {
  const branchUsers = users.filter(u => u.workspaceId === workspace.id);
  const branchBills = bills.filter(b => b.workspaceId === workspace.id);
  const branchRevenue = branchBills.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Branch Details</h3>
              <p className="text-gray-600 text-sm">Complete branch information and statistics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Branch Header */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 text-2xl font-bold">{workspace.name}</h4>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                ● Active Branch
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-blue-50 rounded-2xl text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-blue-600 text-3xl font-bold">{branchUsers.length}</div>
            <div className="text-blue-700 text-sm font-semibold">Total Users</div>
          </div>
          <div className="p-6 bg-green-50 rounded-2xl text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-green-600 text-3xl font-bold">NPR {branchRevenue.toLocaleString()}</div>
            <div className="text-green-700 text-sm font-semibold">Total Revenue</div>
          </div>
          <div className="p-6 bg-purple-50 rounded-2xl text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-purple-600 text-3xl font-bold">{branchBills.length}</div>
            <div className="text-purple-700 text-sm font-semibold">Total Sales</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Branch ID</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Tag className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-mono">{workspace.id}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Contact Email</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{workspace.contactEmail || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Contact Phone</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{workspace.contactPhone || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Created Date</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">
                {workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        {workspace.address && (
          <div className="mb-8">
            <label className="text-gray-600 text-sm font-semibold mb-2 block">Branch Address</label>
            <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <span className="text-gray-900">{workspace.address}</span>
            </div>
          </div>
        )}

        {/* Branch Users */}
        <div className="mb-8">
          <h4 className="text-gray-900 font-bold text-lg mb-4">Branch Users ({branchUsers.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {branchUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">{user.name}</div>
                    <div className="text-gray-600 text-xs">{user.email}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'cashier' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ==================== INVENTORY MODALS ====================

interface EditInventoryModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ item, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    partNumber: item.partNumber,
    category: item.category,
    price: item.price,
    quantity: item.quantity,
    minStockLevel: item.minStockLevel,
    location: item.location || '',
    description: item.description || ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    const updatedInventory = allInventory.map(i => 
      i.id === item.id ? { ...i, ...formData } : i
    );
    saveToStorage('inventory', updatedInventory);
    onUpdate();
    onClose();
    alert('✅ Inventory item updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Edit Inventory Item</h3>
              <p className="text-gray-600 text-sm">Update inventory item details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Part Number</label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Engine Parts">Engine Parts</option>
              <option value="Brakes">Brakes</option>
              <option value="Electrical">Electrical</option>
              <option value="Body Parts">Body Parts</option>
              <option value="Suspension">Suspension</option>
              <option value="Transmission">Transmission</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Price (NPR) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Min Stock Level</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Shelf/Rack location"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewInventoryModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export const ViewInventoryModal: React.FC<ViewInventoryModalProps> = ({ item, onClose }) => {
  const totalValue = item.price * item.quantity;
  const stockStatus = item.quantity === 0 ? 'out' : item.quantity <= item.minStockLevel ? 'low' : 'good';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl">Inventory Item Details</h3>
              <p className="text-gray-600 text-sm">Complete item information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Item Header */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-900 text-2xl font-bold mb-2">{item.name}</h4>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {item.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  stockStatus === 'out' ? 'bg-red-100 text-red-700' :
                  stockStatus === 'low' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {stockStatus === 'out' ? '● Out of Stock' :
                   stockStatus === 'low' ? '● Low Stock' :
                   '● In Stock'}
                </span>
              </div>
            </div>
            <Package className="w-16 h-16 text-orange-600 opacity-50" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-green-600 text-2xl font-bold">NPR {item.price.toLocaleString()}</div>
            <div className="text-green-700 text-xs font-semibold">Unit Price</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-blue-600 text-2xl font-bold">{item.quantity}</div>
            <div className="text-blue-700 text-xs font-semibold">In Stock</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="text-purple-600 text-2xl font-bold">NPR {totalValue.toLocaleString()}</div>
            <div className="text-purple-700 text-xs font-semibold">Total Value</div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Part Number</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900 font-mono">{item.partNumber}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Min Stock Level</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900">{item.minStockLevel} units</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Location</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-gray-900">{item.location || 'Not specified'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-sm font-semibold">Item ID</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900 font-mono text-sm">{item.id}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mb-8">
            <label className="text-gray-600 text-sm font-semibold mb-2 block">Description</label>
            <div className="p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-900">{item.description}</span>
            </div>
          </div>
        )}

        {/* Stock Alert */}
        {stockStatus !== 'good' && (
          <div className={`p-4 rounded-xl mb-8 flex items-center space-x-3 ${
            stockStatus === 'out' ? 'bg-red-50' : 'bg-yellow-50'
          }`}>
            <AlertCircle className={`w-6 h-6 ${
              stockStatus === 'out' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <div className={`font-semibold ${
                stockStatus === 'out' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {stockStatus === 'out' ? 'Out of Stock!' : 'Low Stock Alert!'}
              </div>
              <div className={`text-sm ${
                stockStatus === 'out' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {stockStatus === 'out' 
                  ? 'This item is currently out of stock. Please reorder immediately.'
                  : `Stock level is below minimum threshold. Current: ${item.quantity}, Minimum: ${item.minStockLevel}`
                }
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};