import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, UserX, Search, Filter, Clock, Mail, Phone, Store, 
  Shield, CheckCircle, XCircle, AlertTriangle, Eye, User, Bot
} from 'lucide-react';
import { PopupContainer } from '../PopupContainer';
import { useCustomPopup } from '../../hooks/useCustomPopup';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  password: string;
  role: string;
  status: string;
  requestedAt: string;
  createdBy: string;
  verificationNote: string;
}

export const PendingVerificationsPanel: React.FC = () => {
  const popup = useCustomPopup();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = () => {
    const pending = JSON.parse(localStorage.getItem('pending_user_verifications') || '[]');
    setPendingUsers(pending);
  };

  const handleApprove = (user: PendingUser) => {
    popup.showConfirm(
      'Approve Account',
      `Approve account for ${user.name}?\n\nEmail: ${user.email}\nRole: ${user.role}\nShop: ${user.shopName}`,
      () => {
        // Add to users
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: Date.now().toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          shopName: user.shopName,
          password: user.password,
          role: user.role.toLowerCase().replace(/ /g, '_'),
          createdAt: new Date().toISOString(),
          status: 'active',
          plan: 'trial',
          approvedBy: 'Super Admin',
          approvedAt: new Date().toISOString()
        };

        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));

        // Remove from pending
        const updatedPending = pendingUsers.filter(u => u.id !== user.id);
        localStorage.setItem('pending_user_verifications', JSON.stringify(updatedPending));
        setPendingUsers(updatedPending);

        // Log activity
        const activityLog = {
          id: Date.now().toString(),
          type: 'user_verification_approved',
          description: `Approved account for ${user.name} (${user.email}) with role ${user.role}`,
          user: 'Super Admin',
          timestamp: new Date().toISOString(),
          severity: 'success'
        };
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        logs.unshift(activityLog);
        localStorage.setItem('activity_logs', JSON.stringify(logs.slice(0, 1000)));

        popup.showSuccess('Account Approved!', `${user.name} can now log in with their email and password.`);
      }
    );
  };

  const handleReject = (user: PendingUser) => {
    const reason = prompt(`Reject account for ${user.name}?\n\nPlease provide a reason (will be sent to the user):`);
    
    if (!reason) return;

    // Remove from pending
    const updatedPending = pendingUsers.filter(u => u.id !== user.id);
    localStorage.setItem('pending_user_verifications', JSON.stringify(updatedPending));
    setPendingUsers(updatedPending);

    // Log activity
    const activityLog = {
      id: Date.now().toString(),
      type: 'user_verification_rejected',
      description: `Rejected account for ${user.name} (${user.email}). Reason: ${reason}`,
      user: 'Super Admin',
      timestamp: new Date().toISOString(),
      severity: 'warning'
    };
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.unshift(activityLog);
    localStorage.setItem('activity_logs', JSON.stringify(logs.slice(0, 1000)));

    popup.showError(`Reason: ${reason}\n\nThe user will be notified via email.`, 'Account Rejected', 'warning');
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'from-blue-500 to-indigo-600';
      case 'Inventory Manager': return 'from-purple-500 to-pink-600';
      case 'Cashier': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <UserCheck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Pending User Verifications
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve AI ChatBot registration requests
              </p>
            </div>
          </div>

          {/* AI Created Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Bot className="text-purple-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-1">AI ChatBot Registrations</h3>
              <p className="text-purple-800 text-sm">
                These accounts were created through our ChatGPT-powered AI assistant. Review each request carefully before approval.
                <strong className="block mt-1">🔒 Security Note: AI can only create Admin, Inventory Manager, or Cashier roles - never Super Admin.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingUsers.length}</p>
              </div>
              <Clock className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Admin Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pendingUsers.filter(u => u.role === 'Admin').length}
                </p>
              </div>
              <Shield className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Manager Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pendingUsers.filter(u => u.role === 'Inventory Manager').length}
                </p>
              </div>
              <User className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">Other Roles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pendingUsers.filter(u => u.role !== 'Admin' && u.role !== 'Inventory Manager').length}
                </p>
              </div>
              <UserCheck className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, shop, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
            <UserCheck className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {pendingUsers.length === 0 ? 'No Pending Verifications' : 'No Results Found'}
            </h3>
            <p className="text-gray-600">
              {pendingUsers.length === 0 
                ? 'All user registration requests have been processed. New AI ChatBot registrations will appear here.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-indigo-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                          {user.role}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Bot size={12} />
                          AI Created
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} className="text-indigo-500" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-green-500" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Store size={16} className="text-orange-500" />
                          <span>{user.shopName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Requested {getTimeAgo(user.requestedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-orange-500" />
                          <span className="text-orange-600 font-semibold">Awaiting Approval</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetails(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                      title="View Details"
                    >
                      <Eye size={18} />
                      Details
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(user)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(user)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {showDetails && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <XCircle size={24} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${getRoleColor(selectedUser.role)} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                      <p className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRoleColor(selectedUser.role)} text-white inline-block mt-1`}>
                        {selectedUser.role}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Shop/Business Name</p>
                      <p className="font-semibold text-gray-900">{selectedUser.shopName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Requested Role</p>
                      <p className="font-semibold text-gray-900">{selectedUser.role}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Request Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedUser.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Created By</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Bot size={16} className="text-purple-600" />
                        {selectedUser.createdBy}
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-600 font-semibold mb-2">Verification Note</p>
                    <p className="text-purple-900">{selectedUser.verificationNote}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleApprove(selectedUser);
                        setShowDetails(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Approve Account
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedUser);
                        setShowDetails(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Reject Request
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
    </div>
  );
};