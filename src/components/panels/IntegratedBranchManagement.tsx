import React, { useState, useEffect } from 'react';
import {
  Building2, Store, Users, DollarSign, Package, Plus, Search, Edit, Trash2,
  Mail, Phone, MapPin, Globe, X, CheckCircle, XCircle, ChevronRight,
  Award, Activity, BarChart3, TrendingUp, Shield, Lock, Unlock, Key,
  Settings, Eye, UserPlus, ShieldCheck, AlertCircle, FileText, Clock,
  Star, Briefcase, CreditCard, Database, Zap, Bell, Info
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { Workspace, User, Bill } from '../../types';
import { Pagination } from '../common/Pagination';

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  parentBranchId: string; // Links to workspace
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  monthlyFee: number;
  totalRevenue: number;
  activeUsers: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

interface BranchRole {
  id: string;
  name: string;
  permissions: string[];
  canAccessVendors: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageInventory: boolean;
  canManageFinance: boolean;
}

const SUBSCRIPTION_PLANS = {
  free: { name: 'Free', monthlyFee: 0, color: 'gray' },
  basic: { name: 'Basic', monthlyFee: 999, color: 'blue' },
  premium: { name: 'Premium', monthlyFee: 2499, color: 'purple' },
  enterprise: { name: 'Enterprise', monthlyFee: 4999, color: 'orange' }
};

const DEFAULT_ROLES: BranchRole[] = [
  {
    id: 'admin',
    name: 'Branch Admin',
    permissions: ['all'],
    canAccessVendors: true,
    canManageUsers: true,
    canViewReports: true,
    canManageInventory: true,
    canManageFinance: true
  },
  {
    id: 'manager',
    name: 'Branch Manager',
    permissions: ['read', 'write'],
    canAccessVendors: true,
    canManageUsers: false,
    canViewReports: true,
    canManageInventory: true,
    canManageFinance: true
  },
  {
    id: 'staff',
    name: 'Branch Staff',
    permissions: ['read'],
    canAccessVendors: false,
    canManageUsers: false,
    canViewReports: false,
    canManageInventory: true,
    canManageFinance: false
  }
];

export const IntegratedBranchManagement: React.FC<{ users: User[]; bills: Bill[]; onUpdate: () => void }> = ({ users, bills, onUpdate }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Workspace | null>(null);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'roles' | 'users'>('overview');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setWorkspaces(getFromStorage('workspaces', []));
    setVendors(getFromStorage('vendors', []));
  };

  const handleAddBranch = (formData: any) => {
    const newWorkspace: Workspace = {
      id: `WS${Date.now()}`,
      name: formData.name,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      address: formData.address,
      createdAt: new Date().toISOString(),
    };

    const allWorkspaces = getFromStorage('workspaces', []);
    saveToStorage('workspaces', [...allWorkspaces, newWorkspace]);

    // Create default roles for this branch
    const branchRoles = getFromStorage('branchRoles', {});
    branchRoles[newWorkspace.id] = DEFAULT_ROLES;
    saveToStorage('branchRoles', branchRoles);
    
    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Create Branch',
      details: `Created branch: ${formData.name}`,
      category: 'branch',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    onUpdate();
    setShowAddBranchModal(false);
    alert('✅ Branch created successfully with default roles!');
  };

  const handleAddVendor = (formData: any) => {
    if (!selectedBranch) return;

    const plan = SUBSCRIPTION_PLANS[formData.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
    
    const newVendor: Vendor = {
      id: `VND${Date.now()}`,
      name: formData.name,
      businessName: formData.businessName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      parentBranchId: selectedBranch.id,
      subscriptionPlan: formData.subscriptionPlan,
      monthlyFee: plan.monthlyFee,
      totalRevenue: 0,
      activeUsers: 1,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const allVendors = getFromStorage('vendors', []);
    saveToStorage('vendors', [...allVendors, newVendor]);

    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Create Vendor',
      details: `Created vendor: ${formData.businessName} under ${selectedBranch.name}`,
      category: 'vendor',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    setShowAddVendorModal(false);
    alert('✅ Vendor organization added to branch!');
  };

  const handleDeleteBranch = (branchId: string) => {
    if (!confirm('⚠️ Delete this branch and all associated vendors?')) return;

    const allWorkspaces = getFromStorage('workspaces', []);
    const branch = allWorkspaces.find((w: Workspace) => w.id === branchId);
    const updatedWorkspaces = allWorkspaces.filter((w: Workspace) => w.id !== branchId);
    saveToStorage('workspaces', updatedWorkspaces);

    // Delete associated vendors
    const allVendors = getFromStorage('vendors', []);
    const updatedVendors = allVendors.filter((v: Vendor) => v.parentBranchId !== branchId);
    saveToStorage('vendors', updatedVendors);

    // Delete branch roles
    const branchRoles = getFromStorage('branchRoles', {});
    delete branchRoles[branchId];
    saveToStorage('branchRoles', branchRoles);

    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Delete Branch',
      details: `Deleted branch: ${branch?.name} and all vendors`,
      category: 'branch',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    onUpdate();
    alert('✅ Branch and vendors deleted!');
    setSelectedBranches([]);
  };

  const handleBulkDelete = () => {
    if (selectedBranches.length === 0) {
      alert('Please select branches to delete');
      return;
    }

    if (!confirm(`⚠️ Delete ${selectedBranches.length} branch(es) and all associated vendors?\\n\\nThis action cannot be undone!`)) return;

    const allWorkspaces = getFromStorage('workspaces', []);
    const allVendors = getFromStorage('vendors', []);
    const branchRoles = getFromStorage('branchRoles', {});
    
    // Filter out selected branches
    const updatedWorkspaces = allWorkspaces.filter((w: Workspace) => !selectedBranches.includes(w.id));
    saveToStorage('workspaces', updatedWorkspaces);

    // Delete associated vendors for all selected branches
    const updatedVendors = allVendors.filter((v: Vendor) => !selectedBranches.includes(v.parentBranchId));
    saveToStorage('vendors', updatedVendors);

    // Delete branch roles
    selectedBranches.forEach(branchId => {
      delete branchRoles[branchId];
    });
    saveToStorage('branchRoles', branchRoles);

    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Bulk Delete Branches',
      details: `Deleted ${selectedBranches.length} branches and all associated vendors`,
      category: 'branch',
    });
    saveToStorage('auditLog', auditLog);

    setSelectedBranches([]);
    loadData();
    onUpdate();
    alert(`✅ ${selectedBranches.length} branch(es) and vendors deleted!`);
  };

  const toggleSelectAll = () => {
    if (selectedBranches.length === paginatedBranches.length) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches(paginatedBranches.map(b => b.id));
    }
  };

  const toggleSelectBranch = (id: string) => {
    setSelectedBranches(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!confirm('⚠️ Delete this vendor organization?')) return;

    const allVendors = getFromStorage('vendors', []);
    const vendor = allVendors.find((v: Vendor) => v.id === vendorId);
    const updatedVendors = allVendors.filter((v: Vendor) => v.id !== vendorId);
    saveToStorage('vendors', updatedVendors);

    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Delete Vendor',
      details: `Deleted vendor: ${vendor?.businessName}`,
      category: 'vendor',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    alert('✅ Vendor deleted!');
  };

  const getStats = () => {
    const totalBranches = workspaces.length;
    const totalVendors = vendors.length;
    const totalUsers = users.filter(u => workspaces.some(w => w.id === u.workspaceId)).length;
    const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
    const monthlyFees = vendors.reduce((sum, v) => sum + v.monthlyFee, 0);
    
    return { totalBranches, totalVendors, totalUsers, totalRevenue, monthlyFees };
  };

  const stats = getStats();

  const filteredBranches = workspaces.filter(branch =>
    (branch.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.contactEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedBranches = filteredBranches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            <span>Branch Management</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage branches, vendor organizations, roles and access control
          </p>
        </div>
        <button
          onClick={() => setShowAddBranchModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <Building2 className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalBranches}</p>
          <p className="text-purple-100 text-sm">Main Branches</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
          <Store className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalVendors}</p>
          <p className="text-orange-100 text-sm">Vendor Orgs</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-blue-100 text-sm">Total Users</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">NPR {stats.totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 text-sm">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">NPR {stats.monthlyFees.toLocaleString()}</p>
          <p className="text-pink-100 text-sm">Monthly Fees</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branches..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Bulk Delete Button */}
          {selectedBranches.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete ({selectedBranches.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedBranches.map((branch) => {
          const branchUsers = users.filter(u => u.workspaceId === branch.id);
          const branchBills = bills.filter(b => b.workspaceId === branch.id);
          const branchVendors = vendors.filter(v => v.parentBranchId === branch.id);
          const branchRevenue = branchBills.reduce((sum, b) => sum + b.total, 0);
          const vendorRevenue = branchVendors.reduce((sum, v) => sum + v.monthlyFee, 0);

          return (
            <div key={branch.id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Branch Name */}
                <h3 className="text-gray-900 font-bold text-xl mb-4">{branch.name}</h3>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-900">{branchUsers.length}</p>
                    <p className="text-xs text-purple-600">Users</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <Store className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-900">{branchVendors.length}</p>
                    <p className="text-xs text-orange-600">Vendors</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-900">{branchBills.length}</p>
                    <p className="text-xs text-blue-600">Sales</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-900">{(branchRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-600">Revenue</p>
                  </div>
                </div>

                {/* Contact Info */}
                {(branch.contactEmail || branch.contactPhone) && (
                  <div className="mb-4 pt-4 border-t border-gray-200 space-y-2">
                    {branch.contactEmail && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{branch.contactEmail}</span>
                      </div>
                    )}
                    {branch.contactPhone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {branch.contactPhone}
                      </div>
                    )}
                  </div>
                )}

                {/* Revenue Info */}
                {vendorRevenue > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-pink-700 font-semibold">Vendor Monthly Fees</span>
                      <span className="text-lg font-bold text-pink-900">NPR {vendorRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedBranch(branch);
                    setShowBranchDetails(true);
                    setActiveTab('overview');
                  }}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleDeleteBranch(branch.id)}
                  className="px-4 py-2.5 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <AddBranchModal
          onClose={() => setShowAddBranchModal(false)}
          onAdd={handleAddBranch}
        />
      )}

      {/* Branch Details Modal */}
      {showBranchDetails && selectedBranch && (
        <BranchDetailsModal
          branch={selectedBranch}
          vendors={vendors.filter(v => v.parentBranchId === selectedBranch.id)}
          users={users.filter(u => u.workspaceId === selectedBranch.id)}
          bills={bills.filter(b => b.workspaceId === selectedBranch.id)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => {
            setShowBranchDetails(false);
            setSelectedBranch(null);
          }}
          onAddVendor={() => setShowAddVendorModal(true)}
          onDeleteVendor={handleDeleteVendor}
          onRefresh={loadData}
        />
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && selectedBranch && (
        <AddVendorModal
          branchName={selectedBranch.name}
          onClose={() => setShowAddVendorModal(false)}
          onAdd={handleAddVendor}
        />
      )}
    </div>
  );
};

// Add Branch Modal
const AddBranchModal: React.FC<{ onClose: () => void; onAdd: (data: any) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = () => {
    if (!formData.name) {
      alert('⚠️ Please enter branch name');
      return;
    }
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-gray-900 font-bold text-2xl mb-6 flex items-center">
          <Building2 className="w-6 h-6 text-purple-600 mr-2" />
          Add New Main Branch
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Main Branch / Headquarters"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="branch@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+977-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
          >
            Create Branch
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Vendor Modal
const AddVendorModal: React.FC<{ branchName: string; onClose: () => void; onAdd: (data: any) => void }> = ({ branchName, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nepal',
    subscriptionPlan: 'basic' as 'free' | 'basic' | 'premium' | 'enterprise'
  });

  const handleSubmit = () => {
    if (!formData.businessName || !formData.email || !formData.phone) {
      alert('⚠️ Please fill all required fields');
      return;
    }
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-gray-900 font-bold text-2xl mb-2 flex items-center">
          <Store className="w-6 h-6 text-orange-600 mr-2" />
          Add Vendor Organization
        </h3>
        <p className="text-gray-600 mb-6">Adding to: <span className="font-semibold text-purple-600">{branchName}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Business Name *</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="ABC Auto Parts Ltd."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vendor@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+977-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Kathmandu"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-3">Subscription Plan *</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setFormData({ ...formData, subscriptionPlan: key as any })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.subscriptionPlan === key
                      ? `border-${plan.color}-500 bg-${plan.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Award className={`w-6 h-6 mx-auto mb-2 ${formData.subscriptionPlan === key ? `text-${plan.color}-600` : 'text-gray-400'}`} />
                  <div className="font-bold text-sm text-gray-900">{plan.name}</div>
                  <div className="text-xs text-gray-600 mt-1">NPR {plan.monthlyFee}/mo</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold"
          >
            Add Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

// Branch Details Modal
const BranchDetailsModal: React.FC<{
  branch: Workspace;
  vendors: Vendor[];
  users: User[];
  bills: Bill[];
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'vendors' | 'roles' | 'users') => void;
  onClose: () => void;
  onAddVendor: () => void;
  onDeleteVendor: (id: string) => void;
  onRefresh: () => void;
}> = ({ branch, vendors, users, bills, activeTab, setActiveTab, onClose, onAddVendor, onDeleteVendor, onRefresh }) => {
  const revenue = bills.reduce((sum, b) => sum + b.total, 0);
  const monthlyFees = vendors.reduce((sum, v) => sum + v.monthlyFee, 0);
  const branchRoles = getFromStorage('branchRoles', {})[branch.id] || DEFAULT_ROLES;

  const [editingRole, setEditingRole] = useState<BranchRole | null>(null);

  const handleUpdateRole = (updatedRole: BranchRole) => {
    const allBranchRoles = getFromStorage('branchRoles', {});
    const currentRoles = allBranchRoles[branch.id] || DEFAULT_ROLES;
    const updatedRoles = currentRoles.map((r: BranchRole) => 
      r.id === updatedRole.id ? updatedRole : r
    );
    allBranchRoles[branch.id] = updatedRoles;
    saveToStorage('branchRoles', allBranchRoles);
    setEditingRole(null);
    onRefresh();
    alert('✅ Role updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Building2 className="w-7 h-7 text-purple-600 mr-3" />
                {branch.name}
              </h3>
              <p className="text-gray-600 mt-1">Complete branch management and control</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'vendors', label: 'Vendor Organizations', icon: Store, badge: vendors.length },
              { id: 'roles', label: 'Roles & Access', icon: ShieldCheck },
              { id: 'users', label: 'Users', icon: Users, badge: users.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-3xl font-bold text-blue-900">{users.length}</p>
                  <p className="text-sm text-blue-700">Total Users</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <Store className="w-8 h-8 text-orange-600 mb-3" />
                  <p className="text-3xl font-bold text-orange-900">{vendors.length}</p>
                  <p className="text-sm text-orange-700">Vendor Orgs</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <BarChart3 className="w-8 h-8 text-green-600 mb-3" />
                  <p className="text-3xl font-bold text-green-900">{bills.length}</p>
                  <p className="text-sm text-green-700">Total Sales</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
                  <p className="text-3xl font-bold text-purple-900">NPR {revenue.toLocaleString()}</p>
                  <p className="text-sm text-purple-700">Revenue</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branch.contactEmail && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{branch.contactEmail}</p>
                      </div>
                    </div>
                  )}
                  {branch.contactPhone && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-semibold text-gray-900">{branch.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  {branch.address && (
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-semibold text-gray-900">{branch.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Revenue */}
              {monthlyFees > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-pink-600" />
                    Recurring Revenue from Vendors
                  </h4>
                  <p className="text-4xl font-bold text-pink-900">NPR {monthlyFees.toLocaleString()}</p>
                  <p className="text-pink-700 mt-2">Per month from {vendors.length} vendor organizations</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-900 text-xl">Vendor Organizations</h4>
                <button
                  onClick={onAddVendor}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vendor</span>
                </button>
              </div>

              {vendors.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No Vendor Organizations</p>
                  <p className="text-gray-500 text-sm mb-4">Add vendor organizations to this branch</p>
                  <button
                    onClick={onAddVendor}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add First Vendor</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendors.map(vendor => {
                    const plan = SUBSCRIPTION_PLANS[vendor.subscriptionPlan];
                    return (
                      <div key={vendor.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 rounded-lg flex items-center justify-center`}>
                              <Store className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900">{vendor.businessName}</h5>
                              <p className="text-sm text-gray-600">{vendor.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteVendor(vendor.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 bg-${plan.color}-100 text-${plan.color}-700`}>
                          <Award className="w-3 h-3 mr-1" />
                          {plan.name} Plan
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Monthly Fee</span>
                            <span className="font-bold text-gray-900">NPR {vendor.monthlyFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Active Users</span>
                            <span className="font-bold text-gray-900">{vendor.activeUsers}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm text-green-700">Revenue</span>
                            <span className="font-bold text-green-900">NPR {vendor.totalRevenue.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-2" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            {vendor.phone}
                          </div>
                          {vendor.city && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mr-2" />
                              {vendor.city}, {vendor.country}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-900 text-xl">Roles & Access Control</h4>
                <span className="text-sm text-gray-600">Manage permissions for this branch</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {branchRoles.map((role: BranchRole) => (
                  <div key={role.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-bold text-gray-900 text-lg flex items-center">
                          <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
                          {role.name}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {role.permissions.includes('all') ? 'Full access to all features' : 'Limited access based on permissions'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingRole(role)}
                        className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className={`p-3 rounded-lg ${role.canAccessVendors ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <Store className={`w-4 h-4 ${role.canAccessVendors ? 'text-green-600' : 'text-gray-400'}`} />
                          {role.canAccessVendors ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">Vendors</p>
                      </div>

                      <div className={`p-3 rounded-lg ${role.canManageUsers ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <Users className={`w-4 h-4 ${role.canManageUsers ? 'text-green-600' : 'text-gray-400'}`} />
                          {role.canManageUsers ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">Users</p>
                      </div>

                      <div className={`p-3 rounded-lg ${role.canViewReports ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <BarChart3 className={`w-4 h-4 ${role.canViewReports ? 'text-green-600' : 'text-gray-400'}`} />
                          {role.canViewReports ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">Reports</p>
                      </div>

                      <div className={`p-3 rounded-lg ${role.canManageInventory ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <Package className={`w-4 h-4 ${role.canManageInventory ? 'text-green-600' : 'text-gray-400'}`} />
                          {role.canManageInventory ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">Inventory</p>
                      </div>

                      <div className={`p-3 rounded-lg ${role.canManageFinance ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <DollarSign className={`w-4 h-4 ${role.canManageFinance ? 'text-green-600' : 'text-gray-400'}`} />
                          {role.canManageFinance ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-900">Finance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {editingRole && (
                <RoleEditModal
                  role={editingRole}
                  onClose={() => setEditingRole(null)}
                  onSave={handleUpdateRole}
                />
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-900 text-xl">Branch Users</h4>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">No users assigned</p>
                  <p className="text-gray-500 text-sm mt-2">Add users to this branch</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                          <p className={`text-xs font-bold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Role Edit Modal
const RoleEditModal: React.FC<{
  role: BranchRole;
  onClose: () => void;
  onSave: (role: BranchRole) => void;
}> = ({ role, onClose, onSave }) => {
  const [editedRole, setEditedRole] = useState(role);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-gray-900 font-bold text-xl mb-6 flex items-center">
          <ShieldCheck className="w-6 h-6 text-purple-600 mr-2" />
          Edit Role: {role.name}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="font-semibold text-gray-900">Access Vendors</span>
            <input
              type="checkbox"
              checked={editedRole.canAccessVendors}
              onChange={(e) => setEditedRole({ ...editedRole, canAccessVendors: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="font-semibold text-gray-900">Manage Users</span>
            <input
              type="checkbox"
              checked={editedRole.canManageUsers}
              onChange={(e) => setEditedRole({ ...editedRole, canManageUsers: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="font-semibold text-gray-900">View Reports</span>
            <input
              type="checkbox"
              checked={editedRole.canViewReports}
              onChange={(e) => setEditedRole({ ...editedRole, canViewReports: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="font-semibold text-gray-900">Manage Inventory</span>
            <input
              type="checkbox"
              checked={editedRole.canManageInventory}
              onChange={(e) => setEditedRole({ ...editedRole, canManageInventory: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="font-semibold text-gray-900">Manage Finance</span>
            <input
              type="checkbox"
              checked={editedRole.canManageFinance}
              onChange={(e) => setEditedRole({ ...editedRole, canManageFinance: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedRole)}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};