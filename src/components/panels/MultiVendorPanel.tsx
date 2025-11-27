import React, { useState, useEffect } from 'react';
import { 
  Store, Plus, Edit, Trash2, Eye, Database, Users, Package, 
  DollarSign, TrendingUp, Building2, Search, Filter, X, 
  CheckCircle, XCircle, AlertCircle, BarChart3, Activity,
  MapPin, Phone, Mail, Calendar, Settings, RefreshCw,
  ArrowRight, FileText, ShoppingCart, Wallet
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: string;
  ownerName: string;
  taxId: string;
  logo?: string;
}

interface VendorStats {
  totalUsers: number;
  totalInventory: number;
  totalValue: number;
  totalTransactions: number;
  totalRevenue: number;
  lowStockItems: number;
  activeOrders: number;
  monthlyRevenue: number;
}

export const MultiVendorPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showEditVendor, setShowEditVendor] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'basic' | 'premium' | 'enterprise'>('all');
  const [vendorStats, setVendorStats] = useState<Record<string, VendorStats>>({});

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    const allVendors = getFromStorage('vendors', []);
    setVendors(allVendors);
    
    // Calculate stats for each vendor
    const stats: Record<string, VendorStats> = {};
    allVendors.forEach((vendor: Vendor) => {
      stats[vendor.id] = calculateVendorStats(vendor.id);
    });
    setVendorStats(stats);
  };

  const calculateVendorStats = (vendorId: string): VendorStats => {
    const allUsers = getFromStorage('users', []);
    const allInventory = getFromStorage('inventory', []);
    const allTransactions = getFromStorage('transactions', []);

    const vendorUsers = allUsers.filter((u: any) => u.workspaceId === vendorId);
    const vendorInventory = allInventory.filter((i: any) => i.workspaceId === vendorId);
    const vendorTransactions = allTransactions.filter((t: any) => t.workspaceId === vendorId);

    const totalValue = vendorInventory.reduce((sum: number, item: any) => 
      sum + (item.sellingPrice || item.price || 0) * (item.quantity || 0), 0
    );

    const totalRevenue = vendorTransactions.reduce((sum: number, t: any) => 
      sum + (t.total || 0), 0
    );

    const lowStockItems = vendorInventory.filter((i: any) => 
      i.quantity <= (i.minStock || i.reorderLevel || 5)
    ).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const monthlyRevenue = vendorTransactions
      .filter((t: any) => new Date(t.createdAt).getMonth() === currentMonth)
      .reduce((sum: number, t: any) => sum + (t.total || 0), 0);

    return {
      totalUsers: vendorUsers.length,
      totalInventory: vendorInventory.length,
      totalValue,
      totalTransactions: vendorTransactions.length,
      totalRevenue,
      lowStockItems,
      activeOrders: 0, // Can be calculated from orders
      monthlyRevenue,
    };
  };

  const handleAddVendor = (vendorData: Partial<Vendor>) => {
    const newVendor: Vendor = {
      id: `VENDOR-${Date.now()}`,
      name: vendorData.name || '',
      businessName: vendorData.businessName || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || '',
      city: vendorData.city || '',
      country: vendorData.country || 'Nepal',
      registrationDate: new Date().toISOString(),
      status: 'active',
      subscriptionPlan: vendorData.subscriptionPlan || 'free',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      ownerName: vendorData.ownerName || '',
      taxId: vendorData.taxId || '',
    };

    const allVendors = [...vendors, newVendor];
    setVendors(allVendors);
    saveToStorage('vendors', allVendors);
    
    // Create default admin user for this vendor
    createDefaultAdminForVendor(newVendor);
    
    setShowAddVendor(false);
    loadVendors();
  };

  const createDefaultAdminForVendor = (vendor: Vendor) => {
    const allUsers = getFromStorage('users', []);
    const defaultAdmin = {
      id: `USER-${Date.now()}`,
      email: vendor.email,
      name: vendor.ownerName || vendor.name,
      role: 'admin',
      workspaceId: vendor.id,
      password: 'admin123', // Default password
      createdAt: new Date().toISOString(),
    };
    allUsers.push(defaultAdmin);
    saveToStorage('users', allUsers);
  };

  const handleUpdateVendor = (vendorData: Partial<Vendor>) => {
    if (!selectedVendor) return;

    const allVendors = vendors.map(v => 
      v.id === selectedVendor.id ? { ...v, ...vendorData } : v
    );
    setVendors(allVendors);
    saveToStorage('vendors', allVendors);
    setShowEditVendor(false);
    setSelectedVendor(null);
    loadVendors();
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor? All associated data will be removed.')) {
      return;
    }

    // Remove vendor
    const allVendors = vendors.filter(v => v.id !== vendorId);
    setVendors(allVendors);
    saveToStorage('vendors', allVendors);

    // Remove vendor's users
    const allUsers = getFromStorage('users', []);
    const filteredUsers = allUsers.filter((u: any) => u.workspaceId !== vendorId);
    saveToStorage('users', filteredUsers);

    // Remove vendor's inventory
    const allInventory = getFromStorage('inventory', []);
    const filteredInventory = allInventory.filter((i: any) => i.workspaceId !== vendorId);
    saveToStorage('inventory', filteredInventory);

    // Remove vendor's transactions
    const allTransactions = getFromStorage('transactions', []);
    const filteredTransactions = allTransactions.filter((t: any) => t.workspaceId !== vendorId);
    saveToStorage('transactions', filteredTransactions);

    loadVendors();
  };

  const handleToggleStatus = (vendorId: string) => {
    const allVendors = vendors.map(v => {
      if (v.id === vendorId) {
        const newStatus = v.status === 'active' ? 'inactive' : 'active';
        return { ...v, status: newStatus };
      }
      return v;
    });
    setVendors(allVendors);
    saveToStorage('vendors', allVendors);
    loadVendors();
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || (vendor.subscriptionPlan || 'free') === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate overall stats
  const totalStats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'active').length,
    totalUsers: Object.values(vendorStats).reduce((sum, s) => sum + s.totalUsers, 0),
    totalInventory: Object.values(vendorStats).reduce((sum, s) => sum + s.totalInventory, 0),
    totalRevenue: Object.values(vendorStats).reduce((sum, s) => sum + s.totalRevenue, 0),
    monthlyRevenue: Object.values(vendorStats).reduce((sum, s) => sum + s.monthlyRevenue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Store className="w-6 h-6 text-purple-600" />
            <span>Multi-Vendor Management</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage all vendors and their databases</p>
        </div>
        <button
          onClick={() => setShowAddVendor(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Store className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">{totalStats.totalVendors}</p>
              <p className="text-xs opacity-90">Total Vendors</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">{totalStats.activeVendors}</p>
              <p className="text-xs opacity-90">Active Vendors</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">{totalStats.totalUsers}</p>
              <p className="text-xs opacity-90">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">{totalStats.totalInventory}</p>
              <p className="text-xs opacity-90">Total Items</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">NPR {(totalStats.monthlyRevenue / 1000).toFixed(1)}K</p>
              <p className="text-xs opacity-90">Monthly Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-2xl font-bold">NPR {(totalStats.totalRevenue / 1000).toFixed(1)}K</p>
              <p className="text-xs opacity-90">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          const stats = vendorStats[vendor.id] || {
            totalUsers: 0,
            totalInventory: 0,
            totalValue: 0,
            totalTransactions: 0,
            totalRevenue: 0,
            lowStockItems: 0,
            activeOrders: 0,
            monthlyRevenue: 0,
          };

          return (
            <div key={vendor.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all">
              {/* Vendor Header */}
              <div className={`p-4 rounded-t-xl ${
                vendor.status === 'active' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                vendor.status === 'inactive' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
                <div className="flex items-start justify-between text-white">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Store className="w-5 h-5" />
                      <h3 className="font-semibold">{vendor.businessName}</h3>
                    </div>
                    <p className="text-sm opacity-90">{vendor.name}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      vendor.subscriptionPlan === 'enterprise' ? 'bg-yellow-400 text-yellow-900' :
                      vendor.subscriptionPlan === 'premium' ? 'bg-purple-400 text-purple-900' :
                      vendor.subscriptionPlan === 'basic' ? 'bg-blue-400 text-blue-900' :
                      'bg-gray-400 text-gray-900'
                    }`}>
                      {(vendor.subscriptionPlan || 'free').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{vendor.city}, {vendor.country}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(vendor.registrationDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-blue-900">{stats.totalUsers}</p>
                    <p className="text-xs text-blue-600">Users</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <Package className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-orange-900">{stats.totalInventory}</p>
                    <p className="text-xs text-orange-600">Items</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-green-900">NPR {(stats.totalRevenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-green-600">Revenue</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <ShoppingCart className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-purple-900">{stats.totalTransactions}</p>
                    <p className="text-xs text-purple-600">Orders</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowVendorDetails(true);
                  }}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowEditVendor(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(vendor.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      vendor.status === 'active' 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={vendor.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {vendor.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 text-lg mb-2">No Vendors Found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== 'all' || filterPlan !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first vendor'}
          </p>
          {!searchQuery && filterStatus === 'all' && filterPlan === 'all' && (
            <button
              onClick={() => setShowAddVendor(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Vendor</span>
            </button>
          )}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <VendorFormModal
          title="Add New Vendor"
          onClose={() => setShowAddVendor(false)}
          onSave={handleAddVendor}
        />
      )}

      {/* Edit Vendor Modal */}
      {showEditVendor && selectedVendor && (
        <VendorFormModal
          title="Edit Vendor"
          vendor={selectedVendor}
          onClose={() => {
            setShowEditVendor(false);
            setSelectedVendor(null);
          }}
          onSave={handleUpdateVendor}
        />
      )}

      {/* Vendor Details Modal */}
      {showVendorDetails && selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          stats={vendorStats[selectedVendor.id]}
          onClose={() => {
            setShowVendorDetails(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
};

// Vendor Form Modal Component
const VendorFormModal: React.FC<{
  title: string;
  vendor?: Vendor;
  onClose: () => void;
  onSave: (data: Partial<Vendor>) => void;
}> = ({ title, vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Vendor>>(
    vendor || {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Nepal',
      ownerName: '',
      taxId: '',
      subscriptionPlan: 'free',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ABC Auto Parts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ABC Auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="owner@abcauto.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+977 9812345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / PAN
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Kathmandu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nepal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Plan *
              </label>
              <select
                required
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Street address, building, etc."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {vendor ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Vendor Details Modal Component
const VendorDetailsModal: React.FC<{
  vendor: Vendor;
  stats: VendorStats;
  onClose: () => void;
}> = ({ vendor, stats, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'inventory' | 'transactions'>('overview');
  
  const allUsers = getFromStorage('users', []).filter((u: any) => u.workspaceId === vendor.id);
  const allInventory = getFromStorage('inventory', []).filter((i: any) => i.workspaceId === vendor.id);
  const allTransactions = getFromStorage('transactions', []).filter((t: any) => t.workspaceId === vendor.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{vendor.businessName}</h3>
            <p className="text-sm opacity-90">{vendor.name} • {vendor.email}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'inventory'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Inventory ({allInventory.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions ({allTransactions.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                  <p className="text-sm text-blue-600">Total Users</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Package className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-900">{stats.totalInventory}</p>
                  <p className="text-sm text-orange-600">Inventory Items</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">NPR {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">Total Revenue</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{stats.totalTransactions}</p>
                  <p className="text-sm text-purple-600">Transactions</p>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Vendor Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium">{vendor.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tax ID</p>
                    <p className="font-medium">{vendor.taxId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{vendor.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium">{vendor.city}, {vendor.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium">{new Date(vendor.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subscription</p>
                    <p className="font-medium capitalize">{vendor.subscriptionPlan}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{vendor.address}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {allUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No users found for this vendor</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {allInventory.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No inventory items found for this vendor</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Part Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Part Number</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allInventory.slice(0, 50).map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.partName || item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.partNumber || item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">NPR {(item.sellingPrice || item.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allInventory.length > 50 && (
                    <p className="text-sm text-gray-600 text-center py-3">
                      Showing 50 of {allInventory.length} items
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {allTransactions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No transactions found for this vendor</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allTransactions.slice(0, 50).map((transaction: any) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{transaction.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">NPR {transaction.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {transaction.paymentMethod || 'Cash'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allTransactions.length > 50 && (
                    <p className="text-sm text-gray-600 text-center py-3">
                      Showing 50 of {allTransactions.length} transactions
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};