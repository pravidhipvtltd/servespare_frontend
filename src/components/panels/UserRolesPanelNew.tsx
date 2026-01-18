import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Edit, Trash2, Search, X, Eye, EyeOff, Shield, 
  Lock, DollarSign, Package, Users as UsersIcon, Settings,
  Clock, MapPin, Mail, Phone, CheckCircle, XCircle, ChevronRight,
  FileText, TrendingUp, ShoppingCart, Briefcase, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Pagination } from '../common/Pagination';
// Backend API removed - using localStorage only

// Backend User type (multi-tenant aware)
interface BackendUser {
  id: string;
  tenantId: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  isFirstLogin?: boolean;
  mustChangePassword?: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastLoginAt?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  cashier: 'Cashier',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; badge: string }> = {
  super_admin: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-gradient-to-r from-red-500 to-pink-600' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
  inventory_manager: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
  cashier: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-gradient-to-r from-green-500 to-emerald-600' },
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
    financialAccess: { viewReports: true, viewTransactions: true, exportData: true, manageBudget: true },
    priceEditing: { viewPrices: true, editPrices: true, setDiscounts: true, bulkUpdate: true },
    supplierManagement: { viewSuppliers: true, addSuppliers: true, editSuppliers: true, deleteSuppliers: true },
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
    priceEditing: { viewPrices: true, editPrices: false, setDiscounts: false, bulkUpdate: false },
    supplierManagement: { viewSuppliers: false, addSuppliers: false, editSuppliers: false, deleteSuppliers: false },
  },
};

export const UserRolesPanel: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<BackendUser | null>(null);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS.inventory_manager);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch users from backend - backend automatically filters by tenantId
      // Load users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const response = { success: true, data: users };
      
      if (response.success && response.data) {
        const allUsers = response.data as BackendUser[];
        
        // Admin can only see and manage inventory_manager and cashier roles
        // Super_admin and admin roles are managed separately
        if (currentUser?.role === 'admin') {
          setUsers(allUsers.filter((u: BackendUser) => 
            u.role === 'inventory_manager' || u.role === 'cashier'
          ));
        } else {
          // For super_admin (shouldn't normally access this panel)
          setUsers(allUsers);
        }
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSidebar = (user?: BackendUser) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '', // Don't show password for security
        role: user.role,
        isActive: user.status === 'active',
        avatar: '',
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

  const handleOpenPermissionsDrawer = (user: BackendUser) => {
    setPermissions(DEFAULT_PERMISSIONS[user.role]);
    setPermissionsDrawerOpen(true);
    setSelectedUserForPermissions(user);
  };

  const handleClosePermissionsDrawer = () => {
    setPermissionsDrawerOpen(false);
    setSelectedUserForPermissions(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          status: formData.isActive ? 'active' : 'inactive',
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        // Update user in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === editingUser.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updateData };
          localStorage.setItem('users', JSON.stringify(users));
          alert('✅ User updated successfully!');
          handleCloseSidebar();
          loadUsers();
        } else {
          setError('User not found');
          alert('❌ User not found');
        }
      } else {
        // Create new user
        const createData = {
          email: formData.email,
          password: formData.password || `Temp${Math.random().toString(36).slice(2, 10)}!`,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        };
        
        // Create user in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: `user_${Date.now()}`,
          ...createData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('✅ User created successfully! Password: ' + createData.password);
        handleCloseSidebar();
        loadUsers();
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
      alert('❌ ' + (err.message || 'Failed to save user'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const targetUser = users.find((u: BackendUser) => u.id === userId);
    
    // Cannot delete own account
    if (userId === currentUser?.id) {
      alert('⚠️ You cannot delete your own account!');
      return;
    }
    
    if (!confirm(`⚠️ Are you sure you want to delete ${targetUser?.name}?\n\nThis action cannot be undone!`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete user from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const filteredUsers = users.filter((u: any) => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      setSelectedUsers([]);
      alert('✅ User deleted successfully!');
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
      alert('❌ ' + (err.message || 'Failed to delete user'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('⚠️ No users selected');
      return;
    }

    // Check if trying to delete own account
    if (selectedUsers.includes(currentUser?.id || '')) {
      alert('⚠️ Cannot delete your own account in bulk delete!');
      return;
    }
    
    if (!confirm(`⚠️ Are you sure you want to delete ${selectedUsers.length} user(s)?\n\nThis action cannot be undone!`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete all selected users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const filteredUsers = users.filter((u: any) => !selectedUsers.includes(u.id));
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      setSelectedUsers([]);
      alert('✅ Users deleted successfully!');
      loadUsers();
    } catch (err: any) {
      console.error('Error bulk deleting users:', err);
      setError(err.message || 'Failed to delete users');
      alert('❌ ' + (err.message || 'Failed to delete users'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user status in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].status = newStatus;
        users[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
      } else {
        setError('User not found');
        alert('❌ User not found');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
      alert('❌ ' + (err.message || 'Failed to update status'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user: BackendUser) => {
    const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    return searchMatch && roleMatch;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col bg-[#0a0e1a]">
      {/* Header */}
      <div className="flex-none bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl text-white">User Roles & Permissions</h2>
              <p className="text-sm text-slate-400">Manage team members and their access levels</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenSidebar()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="cashier">Cashier</option>
          </select>

          <div className="flex gap-2 border border-slate-600 rounded-lg p-1 bg-slate-800/50">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
            <span className="text-blue-400">{selectedUsers.length} user(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading users...</p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${ROLE_COLORS[user.role].badge} flex items-center justify-center text-white`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white">{user.name}</h3>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text} mb-3`}>
                  <Shield className="h-3 w-3" />
                  {ROLE_LABELS[user.role]}
                </div>

                <div className="space-y-2 mb-3">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {user.status === 'active' ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    <span className={user.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenSidebar(user)}
                    className="flex-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(user.id)}
                    className="flex-1 px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm"
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left p-3 text-slate-400 text-sm w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600"
                    />
                  </th>
                  <th className="text-left p-3 text-slate-400 text-sm">User</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Role</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Contact</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Status</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Joined</th>
                  <th className="text-right p-3 text-slate-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${ROLE_COLORS[user.role].badge} flex items-center justify-center text-white text-sm`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[user.role]}
                      </div>
                    </td>
                    <td className="p-3">
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {user.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-sm ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenSidebar(user)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg text-slate-400 mb-2">No users found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit User Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slate-800 shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl text-white">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={handleCloseSidebar} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="+977 9800000000"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
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
                  {isLoading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
