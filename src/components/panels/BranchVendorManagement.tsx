import React, { useState, useEffect } from 'react';
import {
  Building2, Store, Users, DollarSign, Package, TrendingUp, Plus, Search,
  Edit, Trash2, Eye, Mail, Phone, MapPin, Globe, Calendar, Check, X,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, ChevronDown, Filter,
  Download, Upload, RefreshCw, Settings, CreditCard, Clock, Star,
  Award, Activity, BarChart3, PieChart, TrendingDown, Zap, Shield,
  Lock, Unlock, Archive, Copy, ExternalLink, FileText, Bell, Info
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { Workspace, User, Bill } from '../../types';

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  taxId?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'trial';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  monthlyFee: number;
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  features: string[];
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

type ViewMode = 'branches' | 'vendors';

const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    monthlyFee: 0,
    features: ['1 User', '1GB Storage', 'Basic Support', 'Email Notifications'],
    color: 'gray',
    storageLimit: 1
  },
  basic: {
    name: 'Basic',
    monthlyFee: 999,
    features: ['5 Users', '10GB Storage', 'Priority Support', 'SMS Notifications', 'Basic Reports'],
    color: 'blue',
    storageLimit: 10
  },
  premium: {
    name: 'Premium',
    monthlyFee: 2499,
    features: ['20 Users', '50GB Storage', 'Premium Support', 'All Notifications', 'Advanced Reports', 'API Access'],
    color: 'purple',
    storageLimit: 50
  },
  enterprise: {
    name: 'Enterprise',
    monthlyFee: 4999,
    features: ['Unlimited Users', '500GB Storage', '24/7 Support', 'Custom Features', 'White Label', 'Dedicated Manager'],
    color: 'orange',
    storageLimit: 500
  }
};

export const BranchVendorManagement: React.FC<{ users: User[]; bills: Bill[]; onUpdate: () => void }> = ({ users, bills, onUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('branches');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Workspace | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setWorkspaces(getFromStorage('workspaces', []));
    setVendors(getFromStorage('vendors', []));
  };

  const getStats = () => {
    if (viewMode === 'branches') {
      const activeBranches = workspaces.filter(w => w.id).length;
      const totalBranchUsers = users.filter(u => workspaces.some(w => w.id === u.workspaceId)).length;
      const totalBranchRevenue = bills.reduce((sum, b) => sum + b.total, 0);
      
      return {
        total: workspaces.length,
        active: activeBranches,
        users: totalBranchUsers,
        revenue: totalBranchRevenue
      };
    } else {
      const activeVendors = vendors.filter(v => v.status === 'active').length;
      const totalVendorRevenue = vendors.reduce((sum, v) => sum + v.totalRevenue, 0);
      const totalMonthlyFees = vendors.filter(v => v.subscriptionStatus === 'active').reduce((sum, v) => sum + v.monthlyFee, 0);
      
      return {
        total: vendors.length,
        active: activeVendors,
        revenue: totalVendorRevenue,
        monthlyRevenue: totalMonthlyFees
      };
    }
  };

  const stats = getStats();

  // Branch Functions
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
    
    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Create Branch',
      details: `Created new branch: ${formData.name}`,
      category: 'branch',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    onUpdate();
    setShowAddBranchModal(false);
    alert('✅ Branch created successfully!');
  };

  const handleDeleteBranch = (branchId: string) => {
    if (!confirm('⚠️ Delete this branch? This action cannot be undone.')) return;

    const allWorkspaces = getFromStorage('workspaces', []);
    const branch = allWorkspaces.find((w: Workspace) => w.id === branchId);
    const updatedWorkspaces = allWorkspaces.filter((w: Workspace) => w.id !== branchId);
    saveToStorage('workspaces', updatedWorkspaces);

    // Audit log
    const auditLog = getFromStorage('auditLog', []);
    auditLog.unshift({
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'superadmin',
      userName: 'Super Admin',
      action: 'Delete Branch',
      details: `Deleted branch: ${branch?.name}`,
      category: 'branch',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    onUpdate();
    alert('✅ Branch deleted successfully!');
  };

  // Vendor Functions
  const handleAddVendor = (formData: any) => {
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
      website: formData.website,
      taxId: formData.taxId,
      subscriptionPlan: formData.subscriptionPlan,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyFee: plan.monthlyFee,
      totalRevenue: 0,
      totalOrders: 0,
      activeUsers: 1,
      storageUsed: 0,
      storageLimit: plan.storageLimit,
      features: plan.features,
      createdAt: new Date().toISOString(),
      status: 'active',
      notes: formData.notes || ''
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
      details: `Created new vendor: ${formData.businessName} (${formData.subscriptionPlan} plan)`,
      category: 'vendor',
    });
    saveToStorage('auditLog', auditLog);

    loadData();
    setShowAddVendorModal(false);
    alert('✅ Vendor created successfully!');
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!confirm('⚠️ Delete this vendor? This will remove all their data.')) return;

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
    alert('✅ Vendor deleted successfully!');
  };

  const toggleVendorStatus = (vendorId: string) => {
    const allVendors = getFromStorage('vendors', []);
    const updatedVendors = allVendors.map((v: Vendor) =>
      v.id === vendorId
        ? { ...v, status: v.status === 'active' ? 'suspended' : 'active' }
        : v
    );
    saveToStorage('vendors', updatedVendors);
    loadData();
    alert('✅ Vendor status updated!');
  };

  const filteredBranches = workspaces.filter(branch =>
    (branch.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.contactEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      (vendor.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            <span>Branch & Vendor Management</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Unified management for branches/workspaces and vendor organizations
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 inline-flex space-x-2">
        <button
          onClick={() => setViewMode('branches')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            viewMode === 'branches'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Branches/Workspaces</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            viewMode === 'branches' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {workspaces.length}
          </span>
        </button>
        <button
          onClick={() => setViewMode('vendors')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            viewMode === 'vendors'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Vendor Organizations</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            viewMode === 'vendors' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {vendors.length}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {viewMode === 'branches' ? (
          <>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
              <Building2 className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-purple-100 text-sm">Total Branches</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
              <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-blue-100 text-sm">Active Branches</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <Users className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{stats.users}</p>
              <p className="text-green-100 text-sm">Total Users</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <DollarSign className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">NPR {stats.revenue.toLocaleString()}</p>
              <p className="text-orange-100 text-sm">Total Revenue</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <Store className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-orange-100 text-sm">Total Vendors</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-green-100 text-sm">Active Vendors</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <DollarSign className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">NPR {stats.revenue.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Total Revenue</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">NPR {stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-purple-100 text-sm">Monthly Fees</p>
            </div>
          </>
        )}
      </div>

      {/* Search and Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${viewMode === 'branches' ? 'branches' : 'vendors'}...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {viewMode === 'vendors' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
          <button
            onClick={() => viewMode === 'branches' ? setShowAddBranchModal(true) : setShowAddVendorModal(true)}
            className={`px-6 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 ${
              viewMode === 'branches'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-lg'
            } transition-all`}
          >
            <Plus className="w-5 h-5" />
            <span>Add {viewMode === 'branches' ? 'Branch' : 'Vendor'}</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {viewMode === 'branches' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => {
            const branchUsers = users.filter(u => u.workspaceId === branch.id);
            const branchBills = bills.filter(b => b.workspaceId === branch.id);
            const branchRevenue = branchBills.reduce((sum, b) => sum + b.total, 0);

            return (
              <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>

                <h3 className="text-gray-900 font-bold text-xl mb-4">{branch.name}</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 text-sm">Users</span>
                    </div>
                    <span className="text-gray-900 font-bold">{branchUsers.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 text-sm">Sales</span>
                    </div>
                    <span className="text-gray-900 font-bold">{branchBills.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 text-sm">Revenue</span>
                    </div>
                    <span className="text-green-900 font-bold">NPR {branchRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {branch.contactEmail && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      {branch.contactEmail}
                    </div>
                    {branch.contactPhone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        {branch.contactPhone}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchDetails(true);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => alert(`Edit ${branch.name}`)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const plan = SUBSCRIPTION_PLANS[vendor.subscriptionPlan];

            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 rounded-xl flex items-center justify-center`}>
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                      vendor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-gray-900 font-bold text-xl mb-1">{vendor.businessName}</h3>
                <p className="text-gray-600 text-sm mb-4">{vendor.name}</p>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-${plan.color}-100 text-${plan.color}-700`}>
                  <Award className="w-3 h-3 mr-1" />
                  {plan.name} Plan
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 text-sm">Monthly Fee</span>
                    </div>
                    <span className="text-gray-900 font-bold">NPR {vendor.monthlyFee.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 text-sm">Active Users</span>
                    </div>
                    <span className="text-gray-900 font-bold">{vendor.activeUsers}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 text-sm">Revenue</span>
                    </div>
                    <span className="text-green-900 font-bold">NPR {vendor.totalRevenue.toLocaleString()}</span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-700 text-sm">Storage</span>
                      <span className="text-blue-900 font-bold text-sm">{vendor.storageUsed}GB / {vendor.storageLimit}GB</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(vendor.storageUsed / vendor.storageLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.email}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {vendor.phone}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowVendorDetails(true);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toggleVendorStatus(vendor.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={vendor.status === 'active' ? 'Suspend' : 'Activate'}
                  >
                    {vendor.status === 'active' ? <Lock className="w-4 h-4 text-gray-600" /> : <Unlock className="w-4 h-4 text-gray-600" />}
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <AddBranchModal
          onClose={() => setShowAddBranchModal(false)}
          onAdd={handleAddBranch}
        />
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <AddVendorModal
          onClose={() => setShowAddVendorModal(false)}
          onAdd={handleAddVendor}
        />
      )}

      {/* Branch Details Modal */}
      {showBranchDetails && selectedBranch && (
        <BranchDetailsModal
          branch={selectedBranch}
          users={users.filter(u => u.workspaceId === selectedBranch.id)}
          bills={bills.filter(b => b.workspaceId === selectedBranch.id)}
          onClose={() => {
            setShowBranchDetails(false);
            setSelectedBranch(null);
          }}
        />
      )}

      {/* Vendor Details Modal */}
      {showVendorDetails && selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          onClose={() => {
            setShowVendorDetails(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
};

// Add Branch Modal Component
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
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-gray-900 font-bold text-xl mb-6 flex items-center">
          <Building2 className="w-6 h-6 text-purple-600 mr-2" />
          Add New Branch
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Main Branch"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="branch@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone</label>
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
            Add Branch
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Vendor Modal Component
const AddVendorModal: React.FC<{ onClose: () => void; onAdd: (data: any) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nepal',
    website: '',
    taxId: '',
    subscriptionPlan: 'basic' as 'free' | 'basic' | 'premium' | 'enterprise',
    notes: ''
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
        <h3 className="text-gray-900 font-bold text-xl mb-6 flex items-center">
          <Store className="w-6 h-6 text-orange-600 mr-2" />
          Add New Vendor Organization
        </h3>
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
              placeholder="Nepal"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tax ID / VAT</label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">Subscription Plan *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  <div className="text-xs text-gray-600">NPR {plan.monthlyFee}/mo</div>
                </button>
              ))}
            </div>
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
            <label className="block text-gray-700 font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
const BranchDetailsModal: React.FC<{ branch: Workspace; users: User[]; bills: Bill[]; onClose: () => void }> = ({ branch, users, bills, onClose }) => {
  const revenue = bills.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-bold text-xl flex items-center">
            <Building2 className="w-6 h-6 text-purple-600 mr-2" />
            {branch.name}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
            <p className="text-sm text-blue-700">Total Users</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-900">{bills.length}</p>
            <p className="text-sm text-green-700">Total Sales</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-900">NPR {revenue.toLocaleString()}</p>
            <p className="text-sm text-purple-700">Revenue</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {branch.contactEmail && (
                <div className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {branch.contactEmail}
                </div>
              )}
              {branch.contactPhone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {branch.contactPhone}
                </div>
              )}
              {branch.address && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {branch.address}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Recent Users</h4>
            <div className="space-y-2">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vendor Details Modal
const VendorDetailsModal: React.FC<{ vendor: Vendor; onClose: () => void }> = ({ vendor, onClose }) => {
  const plan = SUBSCRIPTION_PLANS[vendor.subscriptionPlan];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-bold text-xl flex items-center">
            <Store className="w-6 h-6 text-orange-600 mr-2" />
            {vendor.businessName}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 rounded-xl p-4">
            <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-900">NPR {vendor.monthlyFee.toLocaleString()}</p>
            <p className="text-sm text-orange-700">Monthly Fee</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-900">NPR {vendor.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-700">Total Revenue</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">{vendor.activeUsers}</p>
            <p className="text-sm text-blue-700">Active Users</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <Package className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-900">{vendor.totalOrders}</p>
            <p className="text-sm text-purple-700">Total Orders</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Subscription Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Plan</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${plan.color}-100 text-${plan.color}-700`}>
                  {plan.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  vendor.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {vendor.subscriptionStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Start Date</span>
                <span className="font-semibold text-gray-900">{new Date(vendor.subscriptionStartDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">End Date</span>
                <span className="font-semibold text-gray-900">{new Date(vendor.subscriptionEndDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                {vendor.email}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                {vendor.phone}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                {vendor.address}, {vendor.city}, {vendor.country}
              </div>
              {vendor.website && (
                <div className="flex items-center text-gray-700">
                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {vendor.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {vendor.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {vendor.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                {vendor.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};