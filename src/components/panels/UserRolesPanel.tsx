import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Edit, Trash2, Search, X, Eye, EyeOff, Shield, 
  Lock, DollarSign, Package, Users as UsersIcon, Settings,
  Clock, MapPin, Mail, Phone, CheckCircle, XCircle, ChevronRight,
  FileText, TrendingUp, ShoppingCart, Briefcase
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import { Pagination } from '../common/Pagination';

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  cashier: 'Cashier',
  finance: 'Finance',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; badge: string }> = {
  super_admin: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-gradient-to-r from-red-500 to-pink-600' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
  inventory_manager: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
  cashier: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  finance: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-gradient-to-r from-orange-500 to-amber-600' },
};

interface RolePermissions {
  inventoryAccess: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  financialAccess: {
    viewReports: boolean;
    viewTransactions: boolean;
    exportData: boolean;
    manageBudget: boolean;
  };
  priceEditing: {
    viewPrices: boolean;
    editPrices: boolean;
    setDiscounts: boolean;
    bulkUpdate: boolean;
  };
  supplierManagement: {
    viewSuppliers: boolean;
    addSuppliers: boolean;
    editSuppliers: boolean;
    deleteSuppliers: boolean;
  };
}

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    inventoryAccess: { view: true, add: true, edit: true, delete: true },
    financialAccess: { viewReports: true, viewTransactions: true, exportData: true, manageBudget: true },
    priceEditing: { viewPrices: true, editPrices: true, setDiscounts: true, bulkUpdate: true },
    supplierManagement: { viewSuppliers: true, addSuppliers: true, editSuppliers: true, deleteSuppliers: true },
  },
  admin: {
    inventoryAccess: { view: true, add: true, edit: true, delete: true },
    financialAccess: { viewReports: true, viewTransactions: true, exportData: true, manageBudget: false },
    priceEditing: { viewPrices: true, editPrices: true, setDiscounts: true, bulkUpdate: false },
    supplierManagement: { viewSuppliers: true, addSuppliers: true, editSuppliers: true, deleteSuppliers: false },
  },
  inventory_manager: {
    inventoryAccess: { view: true, add: true, edit: true, delete: false },
    financialAccess: { viewReports: false, viewTransactions: false, exportData: false, manageBudget: false },
    priceEditing: { viewPrices: true, editPrices: false, setDiscounts: false, bulkUpdate: false },
    supplierManagement: { viewSuppliers: true, addSuppliers: false, editSuppliers: false, deleteSuppliers: false },
  },
  cashier: {
    inventoryAccess: { view: true, add: false, edit: false, delete: false },
    financialAccess: { viewReports: false, viewTransactions: true, exportData: false, manageBudget: false },
    priceEditing: { viewPrices: true, editPrices: false, setDiscounts: true, bulkUpdate: false },
    supplierManagement: { viewSuppliers: false, addSuppliers: false, editSuppliers: false, deleteSuppliers: false },
  },
  finance: {
    inventoryAccess: { view: true, add: false, edit: false, delete: false },
    financialAccess: { viewReports: true, viewTransactions: true, exportData: true, manageBudget: true },
    priceEditing: { viewPrices: true, editPrices: true, setDiscounts: true, bulkUpdate: false },
    supplierManagement: { viewSuppliers: true, addSuppliers: false, editSuppliers: false, deleteSuppliers: false },
  },
};

export const UserRolesPanel: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS.inventory_manager);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'inventory_manager' as UserRole,
    isActive: true,
    avatar: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getFromStorage('users', []);
    setUsers(allUsers.filter((u: User) => u.workspaceId === currentUser?.workspaceId));
  };

  const handleOpenSidebar = (user?: User) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: user.password,
        role: user.role,
        isActive: true,
        avatar: user.avatar || '',
      });
      setEditingUser(user);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'inventory_manager',
        isActive: true,
        avatar: '',
      });
      setEditingUser(null);
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'inventory_manager',
      isActive: true,
      avatar: '',
    });
    setEditingUser(null);
    setSidebarOpen(false);
  };

  const handleOpenPermissionsDrawer = (user: User) => {
    // Load user's custom permissions or default role permissions
    const userPermissions = user.permissions || DEFAULT_PERMISSIONS[user.role];
    setPermissions(userPermissions);
    setPermissionsDrawerOpen(true);
    setSelectedUserForPermissions(user);
  };

  const handleClosePermissionsDrawer = () => {
    setPermissionsDrawerOpen(false);
    setSelectedUserForPermissions(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = getFromStorage('users', []);

    if (editingUser) {
      // CRITICAL: Prevent changing SuperAdmin role BY ANYONE (including other SuperAdmins)
      if (editingUser.role === 'super_admin' && formData.role !== 'super_admin') {
        alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin role CANNOT be changed by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin role must remain constant to ensure:\n• System integrity\n• Critical security functions\n• Emergency administration access\n\nThis is a permanent security policy that cannot be overridden.');
        return;
      }
      
      // CRITICAL: SuperAdmin accounts must always be active
      const updatedData = editingUser.role === 'super_admin' 
        ? { ...formData, isActive: true } 
        : formData;
      
      const updated = allUsers.map((u: User) =>
        u.id === editingUser.id ? { ...u, ...updatedData } : u
      );
      saveToStorage('users', updated);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };
      saveToStorage('users', [...allUsers, newUser]);
    }

    loadUsers();
    handleCloseSidebar();
  };

  const handleDelete = (userId: string) => {
    const allUsers = getFromStorage('users', []);
    const targetUser = allUsers.find((u: User) => u.id === userId);
    
    // Cannot delete own account
    if (userId === currentUser?.id) {
      alert('❌ You cannot delete your own account.');
      return;
    }
    
    // CRITICAL: SuperAdmin accounts cannot be deleted BY ANYONE (including other SuperAdmins)
    if (targetUser?.role === 'super_admin') {
      alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin accounts CANNOT be deleted by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin accounts must ALWAYS exist to ensure:\n• System access and recovery\n• Critical security functions\n• Emergency administration\n\nThis is a permanent security policy that cannot be overridden.');
      return;
    }
    
    if (confirm('⚠️ Are you sure you want to delete this user?\n\nThis action cannot be undone!')) {
      const filtered = allUsers.filter((u: User) => u.id !== userId);
      saveToStorage('users', filtered);
      setSelectedUsers([]);
      loadUsers();
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to delete');
      return;
    }

    const allUsers = getFromStorage('users', []);
    
    // Check if trying to delete own account
    if (selectedUsers.includes(currentUser?.id || '')) {
      alert('❌ You cannot delete your own account.');
      return;
    }
    
    // Check if trying to delete super admin
    const hasSuperAdmin = selectedUsers.some(id => {
      const user = allUsers.find((u: User) => u.id === id);
      return user?.role === 'super_admin';
    });
    
    if (hasSuperAdmin) {
      alert('🔒 SUPERADMIN PROTECTION\\n\\n❌ SuperAdmin accounts CANNOT be deleted.\\n\\nPlease deselect SuperAdmin users and try again.');
      return;
    }

    if (confirm(`⚠️ Are you sure you want to delete ${selectedUsers.length} user(s)?\\n\\nThis action cannot be undone!`)) {
      const filtered = allUsers.filter((u: User) => !selectedUsers.includes(u.id));
      saveToStorage('users', filtered);
      setSelectedUsers([]);
      loadUsers();
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleUserStatus = (userId: string) => {
    const allUsers = getFromStorage('users', []);
    const targetUser = allUsers.find((u: User) => u.id === userId);
    
    // Cannot toggle own status
    if (userId === currentUser?.id) {
      alert('❌ You cannot change your own status.');
      return;
    }
    
    // CRITICAL: SuperAdmin accounts cannot be deactivated BY ANYONE (including other SuperAdmins)
    if (targetUser?.role === 'super_admin') {
      alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin accounts CANNOT be deactivated by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin accounts must ALWAYS remain active to ensure:\n• System access and recovery\n• Critical security functions\n• Emergency administration\n\nThis is a permanent security policy that cannot be overridden.');
      return;
    }
    
    const updated = allUsers.map((u: User) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    saveToStorage('users', updated);
    loadUsers();
  };
  
  const savePermissions = () => {
    if (!selectedUserForPermissions) return;
    
    const allUsers = getFromStorage('users', []);
    const updated = allUsers.map((u: User) =>
      u.id === selectedUserForPermissions.id ? { ...u, permissions } : u
    );
    saveToStorage('users', updated);
    loadUsers();
    handleClosePermissionsDrawer();
  };
  
  const canEditUser = (user: User) => {
    // Only super admin can edit admin roles
    if (user.role === 'admin' && currentUser?.role !== 'super_admin') {
      return false;
    }
    return true;
  };
  
  const canDeleteUser = (user: User) => {
    // Cannot delete own account
    if (user.id === currentUser?.id) {
      return false;
    }
    // CRITICAL: SuperAdmin accounts cannot be deleted
    if (user.role === 'super_admin') {
      return false;
    }
    // Only super admin can delete admin
    if (user.role === 'admin' && currentUser?.role !== 'super_admin') {
      return false;
    }
    return true;
  };
  
  const canToggleStatus = (user: User) => {
    // Cannot toggle own status
    if (user.id === currentUser?.id) {
      return false;
    }
    // CRITICAL: SuperAdmin accounts cannot be deactivated
    if (user.role === 'super_admin') {
      return false;
    }
    // Only super admin can toggle admin status
    if (user.role === 'admin' && currentUser?.role !== 'super_admin') {
      return false;
    }
    return true;
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when changing filters or search
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchQuery]);

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-cyan-400 to-cyan-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">User & Role Management</h3>
          <p className="text-gray-500 text-sm">Manage team members and their permissions</p>
        </div>
        <button 
          onClick={() => handleOpenSidebar()}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bulk Delete Button */}
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete ({selectedUsers.length})</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Role Filter Badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedRole === 'all'
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users ({users.length})
          </button>
          {(['inventory_manager', 'cashier', 'finance'] as UserRole[]).map((role) => {
            const colors = ROLE_COLORS[role];
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedRole === role
                    ? `${colors.bg} ${colors.text} shadow-lg ring-2 ring-offset-2 ring-${colors.text.split('-')[1]}-500`
                    : `${colors.bg} ${colors.text} hover:shadow-md`
                }`}
              >
                {ROLE_LABELS[role]} ({roleCounts[role] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* SuperAdmin Protection Warning Banner */}
      {filteredUsers.some(user => user.role === 'super_admin') && (
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-5 shadow-lg mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 text-lg mb-2 flex items-center">
                🔒 SuperAdmin Default Settings - Immutable Protection Policy
              </h3>
              <p className="text-orange-800 text-sm mb-3">
                <strong>CRITICAL SECURITY NOTICE:</strong> The SuperAdmin role has <strong>default status settings that CANNOT be changed by ANY user</strong>, including other admins. SuperAdmin accounts displayed below are permanently protected and <strong>CANNOT</strong> be modified by <strong>ANYONE</strong>.
              </p>
              <div className="bg-white/60 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✕</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">Cannot be Deactivated:</strong>
                    <span className="text-gray-700"> SuperAdmin is ALWAYS ACTIVE in default state and cannot be made inactive</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✕</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">Cannot be Deleted:</strong>
                    <span className="text-gray-700"> SuperAdmin accounts must always exist in the system</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✕</span>
                  </div>
                  <div>
                    <strong className="text-gray-900">Role Cannot be Changed:</strong>
                    <span className="text-gray-700"> SuperAdmin role is permanent and cannot be modified</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mt-3 pt-3 border-t border-orange-200">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <strong className="text-green-900">Reason:</strong>
                    <span className="text-green-800"> These restrictions ensure system access, recovery capabilities, and critical security functions are always maintained.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedUsers.map((user, index) => (
            <div
              key={user.id}
              className={`group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                user.role === 'super_admin' 
                  ? 'border-4 border-yellow-400 shadow-2xl shadow-yellow-100 ring-2 ring-yellow-300 ring-offset-2' 
                  : 'border border-gray-200'
              }`}
            >
              {/* Card Header with Avatar */}
              <div className={`relative h-32 flex items-center justify-center ${
                user.role === 'super_admin'
                  ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100'
              }`}>
                {/* Checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className={`w-24 h-24 rounded-full ${getRandomGradient(index)} flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {getInitials(user.name)}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {user.role === 'super_admin' ? (
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin CANNOT be deactivated by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin accounts must ALWAYS remain active to ensure:\n• System access and recovery\n• Critical security functions\n• Emergency administration\n\nThis is a permanent security policy that cannot be overridden.\n\nThe SuperAdmin role has default status settings that CANNOT be changed by ANY user, including other admins.');
                          }}
                          className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-white animate-pulse cursor-pointer hover:scale-125 transition-transform"
                          title="SuperAdmin - Always Active (Click to see why)"
                        />
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>PROTECTED</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin CANNOT be deactivated by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin accounts must ALWAYS remain active to ensure:\n• System access and recovery\n• Critical security functions\n• Emergency administration\n\nThis is a permanent security policy that cannot be overridden.\n\nThe SuperAdmin role has default status settings that CANNOT be changed by ANY user, including other admins.');
                        }}
                        className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-300 cursor-pointer hover:bg-green-100 hover:border-green-400 transition-all"
                        title="Click to see why SuperAdmin cannot be deactivated"
                      >
                        ALWAYS ACTIVE
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      disabled={!canToggleStatus(user)}
                      className={`w-3 h-3 rounded-full ${user.isActive !== false ? 'bg-green-500' : 'bg-red-500'} ring-4 ring-white ${canToggleStatus(user) ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed opacity-60'} transition-transform`}
                    />
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <div className="text-center mb-4">
                  <h4 className="text-gray-900 font-semibold text-lg mb-1">{user.name}</h4>
                  <div className="flex flex-col items-center space-y-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                    {user.role === 'super_admin' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                        DEFAULT SETTINGS LOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Info */}
                <div className="space-y-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Added {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Main Branch</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenPermissionsDrawer(user)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Permissions</span>
                  </button>
                  {user.role === 'super_admin' ? (
                    <>
                      <button
                        onClick={() => handleOpenSidebar(user)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit (Role Protected)"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        disabled
                        className="p-2 text-gray-400 cursor-not-allowed rounded-lg opacity-50"
                        title="Cannot Delete SuperAdmin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenSidebar(user)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination for Cards */}
        {filteredUsers.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">User</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Contact</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Role</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Status</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Created</th>
                  <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr key={user.id} className={`border-b border-gray-100 transition-colors ${
                    user.role === 'super_admin' 
                      ? 'bg-yellow-50 hover:bg-yellow-100' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${getRandomGradient(index)} flex items-center justify-center text-white font-semibold ${
                          user.role === 'super_admin' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                        }`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900 font-medium">{user.name}</span>
                            {user.role === 'super_admin' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                                <Shield className="w-3 h-3 mr-1" />
                                PROTECTED
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.phone || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.role === 'super_admin' ? (
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => {
                              alert('🔒 SUPERADMIN PROTECTION\n\n❌ SuperAdmin CANNOT be deactivated by ANYONE.\n\nThis includes:\n• Other SuperAdmin accounts\n• System administrators\n• Any user role\n\n✅ SuperAdmin accounts must ALWAYS remain active to ensure:\n• System access and recovery\n• Critical security functions\n• Emergency administration\n\nThis is a permanent security policy that cannot be overridden.\n\nThe SuperAdmin role has default status settings that CANNOT be changed by ANY user, including other admins.');
                            }}
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-400 cursor-pointer hover:bg-green-200 hover:border-green-500 transition-all"
                            title="Click to see why SuperAdmin cannot be deactivated"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                            <span>ALWAYS ACTIVE</span>
                            <Shield className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-500 italic pl-3">Default State - Cannot be Inactive</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={!canToggleStatus(user)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.isActive !== false
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          } ${!canToggleStatus(user) ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          {user.isActive !== false ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenPermissionsDrawer(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Manage Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {user.role === 'super_admin' ? (
                          <>
                            <button
                              onClick={() => handleOpenSidebar(user)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit (Role & Status Protected)"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              disabled
                              className="p-2 text-gray-400 cursor-not-allowed rounded-lg opacity-50"
                              title="🔒 SuperAdmin Cannot Be Deleted"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenSidebar(user)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={!canDeleteUser(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                canDeleteUser(user)
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-gray-400 cursor-not-allowed opacity-50'
                              }`}
                              title={canDeleteUser(user) ? "Delete User" : "Cannot Delete This User"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination for Table */}
        {filteredUsers.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
        </>
      )}

      {/* Add/Edit User Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
            onClick={handleCloseSidebar}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-gray-900 text-2xl font-semibold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {editingUser ? 'Update user information' : 'Create a new team member'}
                  </p>
                </div>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* SuperAdmin Protection Notice */}
              {editingUser?.role === 'super_admin' && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-4 shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-orange-900 text-sm mb-2">
                        🔒 SUPERADMIN DEFAULT SETTINGS - IMMUTABLE
                      </h4>
                      <p className="text-orange-800 text-xs mb-2">
                        <strong>CRITICAL:</strong> The SuperAdmin role has <strong>default status settings that CANNOT be changed by ANY user</strong>, including other admins.
                      </p>
                      <div className="bg-white/60 rounded-lg p-2 space-y-1.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">✕</span>
                          </div>
                          <span className="text-gray-900"><strong>Role:</strong> Locked to SuperAdmin (cannot be changed)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">✕</span>
                          </div>
                          <span className="text-gray-900"><strong>Status:</strong> ALWAYS ACTIVE in default state (cannot be made inactive)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <span className="text-green-900"><strong>Editable:</strong> Name, Email, Phone, Password, Avatar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Profile Avatar</label>
                  <div className="flex items-center space-x-4">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {formData.name ? getInitials(formData.name) : '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+977 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Role Permissions Drawer */}
      {permissionsDrawerOpen && selectedUserForPermissions && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
            onClick={handleClosePermissionsDrawer}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-full ${getRandomGradient(0)} flex items-center justify-center text-white font-bold text-xl`}>
                    {getInitials(selectedUserForPermissions.name)}
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-2xl font-semibold">{selectedUserForPermissions.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${ROLE_COLORS[selectedUserForPermissions.role].bg} ${ROLE_COLORS[selectedUserForPermissions.role].text}`}>
                      {ROLE_LABELS[selectedUserForPermissions.role]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClosePermissionsDrawer}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Permissions Groups */}
              <div className="space-y-6">
                {/* Inventory Access */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-gray-900 font-semibold text-lg">Inventory Access</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(permissions.inventoryAccess).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => setPermissions({
                              ...permissions,
                              inventoryAccess: { ...permissions.inventoryAccess, [key]: !value }
                            })}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Financial Access */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="text-gray-900 font-semibold text-lg">Financial Access</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(permissions.financialAccess).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => setPermissions({
                              ...permissions,
                              financialAccess: { ...permissions.financialAccess, [key]: !value }
                            })}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-orange-600' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Editing */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-gray-900 font-semibold text-lg">Price Editing</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(permissions.priceEditing).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => setPermissions({
                              ...permissions,
                              priceEditing: { ...permissions.priceEditing, [key]: !value }
                            })}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-green-600' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Supplier Management */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="text-gray-900 font-semibold text-lg">Supplier Management</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(permissions.supplierManagement).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => setPermissions({
                              ...permissions,
                              supplierManagement: { ...permissions.supplierManagement, [key]: !value }
                            })}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={handleClosePermissionsDrawer}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};