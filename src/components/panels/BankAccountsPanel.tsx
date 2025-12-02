import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Edit2, Trash2, Save, X, 
  Smartphone, CreditCard, DollarSign, TrendingUp, Eye,
  Banknote, CheckCircle, Clock, AlertCircle, Filter,
  Download, ArrowUpCircle, ArrowDownCircle, History
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Pagination } from '../common/Pagination';
import { TransactionDetailsModal } from '../modals/TransactionDetailsModal';

export interface BankAccount {
  id: string;
  accountType: 'bank' | 'esewa' | 'fonepay' | 'cash';
  accountName: string;
  bankName?: string; // For bank accounts
  accountNumber?: string; // For bank accounts
  accountHolder?: string; // For bank accounts
  esewaId?: string; // For eSewa
  fonepayId?: string; // For FonePay
  currentBalance: number;
  totalReceived: number;
  totalPaid: number;
  isActive: boolean;
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
}

export const BankAccountsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Transaction view state
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedAccountForTransactions, setSelectedAccountForTransactions] = useState<BankAccount | null>(null);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const [formData, setFormData] = useState({
    accountType: 'bank' as 'bank' | 'esewa' | 'fonepay' | 'cash',
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    esewaId: '',
    fonepayId: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const storedAccounts = getFromStorage('bankAccounts', [])
      .filter((a: BankAccount) => a.workspaceId === currentUser?.workspaceId);
    setAccounts(storedAccounts);
  };

  const resetForm = () => {
    setFormData({
      accountType: 'bank',
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      esewaId: '',
      fonepayId: '',
    });
    setEditingAccount(null);
  };

  const handleSubmit = () => {
    if (!formData.accountName.trim()) {
      alert('Please enter account name');
      return;
    }

    if (formData.accountType === 'bank' && (!formData.bankName || !formData.accountNumber)) {
      alert('Please enter bank name and account number');
      return;
    }

    if (formData.accountType === 'esewa' && !formData.esewaId) {
      alert('Please enter eSewa ID');
      return;
    }

    if (formData.accountType === 'fonepay' && !formData.fonepayId) {
      alert('Please enter FonePay ID');
      return;
    }

    const allAccounts = getFromStorage('bankAccounts', []);

    if (editingAccount) {
      // Update existing account
      const updatedAccounts = allAccounts.map((a: BankAccount) =>
        a.id === editingAccount.id
          ? {
              ...a,
              accountType: formData.accountType,
              accountName: formData.accountName,
              bankName: formData.bankName || undefined,
              accountNumber: formData.accountNumber || undefined,
              accountHolder: formData.accountHolder || undefined,
              esewaId: formData.esewaId || undefined,
              fonepayId: formData.fonepayId || undefined,
            }
          : a
      );
      saveToStorage('bankAccounts', updatedAccounts);
    } else {
      // Add new account
      const newAccount: BankAccount = {
        id: `BA${Date.now()}`,
        accountType: formData.accountType,
        accountName: formData.accountName,
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
        accountHolder: formData.accountHolder || undefined,
        esewaId: formData.esewaId || undefined,
        fonepayId: formData.fonepayId || undefined,
        currentBalance: 0,
        totalReceived: 0,
        totalPaid: 0,
        isActive: true,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };

      allAccounts.push(newAccount);
      saveToStorage('bankAccounts', allAccounts);
    }

    loadAccounts();
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      accountType: account.accountType,
      accountName: account.accountName,
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountHolder: account.accountHolder || '',
      esewaId: account.esewaId || '',
      fonepayId: account.fonepayId || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    const allAccounts = getFromStorage('bankAccounts', []);
    const updatedAccounts = allAccounts.filter((a: BankAccount) => a.id !== id);
    saveToStorage('bankAccounts', updatedAccounts);
    setSelectedAccounts([]);
    loadAccounts();
  };

  const handleBulkDelete = () => {
    if (selectedAccounts.length === 0) {
      alert('Please select accounts to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAccounts.length} account(s)?`)) return;

    const allAccounts = getFromStorage('bankAccounts', []);
    const updatedAccounts = allAccounts.filter((a: BankAccount) => !selectedAccounts.includes(a.id));
    saveToStorage('bankAccounts', updatedAccounts);
    setSelectedAccounts([]);
    loadAccounts();
  };

  const toggleSelectAll = () => {
    if (selectedAccounts.length === paginatedAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(paginatedAccounts.map(a => a.id));
    }
  };

  const toggleSelectAccount = (id: string) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleStatus = (id: string) => {
    const allAccounts = getFromStorage('bankAccounts', []);
    const updatedAccounts = allAccounts.map((a: BankAccount) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    saveToStorage('bankAccounts', updatedAccounts);
    loadAccounts();
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
    totalBalance: accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0),
    totalReceived: accounts.reduce((sum, a) => sum + (a.totalReceived || 0), 0),
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'esewa':
        return Smartphone;
      case 'fonepay':
        return Smartphone;
      case 'cash':
        return Banknote;
      default:
        return Building2;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'esewa':
        return 'bg-green-100 text-green-700';
      case 'fonepay':
        return 'bg-blue-100 text-blue-700';
      case 'cash':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span>Bank Accounts & Payment Methods</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage all payment accounts and track transactions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Building2 className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-blue-100 text-xs">Total Accounts</p>
              <p className="text-2xl font-bold">{totalStats.totalAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-green-100 text-xs">Active Accounts</p>
              <p className="text-2xl font-bold">{totalStats.activeAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-purple-100 text-xs">Total Balance</p>
              <p className="text-2xl font-bold">रू{totalStats.totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-orange-100 text-xs">Total Received</p>
              <p className="text-2xl font-bold">रू{totalStats.totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by account name, bank name, or account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedAccounts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Selected ({selectedAccounts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Accounts Found</h3>
            <p className="text-gray-500">Add your first payment account to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900">S.N</th>
                  <th className="px-6 py-4 text-left text-gray-900">Account Type</th>
                  <th className="px-6 py-4 text-left text-gray-900">Account Name</th>
                  <th className="px-6 py-4 text-left text-gray-900">Details</th>
                  <th className="px-6 py-4 text-left text-gray-900">Total Received</th>
                  <th className="px-6 py-4 text-left text-gray-900">Current Balance</th>
                  <th className="px-6 py-4 text-left text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAccounts.map((account, index) => {
                  const Icon = getAccountIcon(account.accountType);
                  return (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAccountTypeColor(account.accountType)}`}>
                            {account.accountType?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{account.accountName}</p>
                      </td>
                      <td className="px-6 py-4">
                        {account.accountType === 'bank' && (
                          <div className="text-sm">
                            <p className="text-gray-900">{account.bankName}</p>
                            <p className="text-gray-500 font-mono">{account.accountNumber}</p>
                            {account.accountHolder && (
                              <p className="text-gray-500">{account.accountHolder}</p>
                            )}
                          </div>
                        )}
                        {account.accountType === 'esewa' && (
                          <p className="text-sm text-gray-900 font-mono">{account.esewaId}</p>
                        )}
                        {account.accountType === 'fonepay' && (
                          <p className="text-sm text-gray-900 font-mono">{account.fonepayId}</p>
                        )}
                        {account.accountType === 'cash' && (
                          <p className="text-sm text-gray-500">Cash on Hand</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">
                          रू{(account.totalReceived || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-bold text-lg">
                          रू{(account.currentBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(account.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            account.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAccountForTransactions(account);
                              setShowTransactionsModal(true);
                            }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="View Transactions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(account)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAccounts.length > itemsPerPage && (
        <Pagination
          totalItems={filteredAccounts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredAccounts.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Account Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'bank', label: 'Bank Account', icon: Building2 },
                    { value: 'esewa', label: 'eSewa', icon: Smartphone },
                    { value: 'fonepay', label: 'FonePay', icon: Smartphone },
                    { value: 'cash', label: 'Cash', icon: Banknote },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, accountType: type.value as any })}
                        className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                          formData.accountType === type.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${formData.accountType === type.value ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className={`font-semibold ${formData.accountType === type.value ? 'text-blue-600' : 'text-gray-900'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name *</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Main Business Account"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bank-specific fields */}
              {formData.accountType === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name *</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., Nepal Bank Limited"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number *</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="e.g., 01234567890123"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      placeholder="e.g., Business Name Pvt. Ltd."
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* eSewa-specific fields */}
              {formData.accountType === 'esewa' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">eSewa ID *</label>
                  <input
                    type="text"
                    value={formData.esewaId}
                    onChange={(e) => setFormData({ ...formData, esewaId: e.target.value })}
                    placeholder="e.g., 9841234567 or esewaid@example.com"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* FonePay-specific fields */}
              {formData.accountType === 'fonepay' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">FonePay ID *</label>
                  <input
                    type="text"
                    value={formData.fonepayId}
                    onChange={(e) => setFormData({ ...formData, fonepayId: e.target.value })}
                    placeholder="e.g., 9841234567"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionsModal && selectedAccountForTransactions && (
        <TransactionDetailsModal
          account={selectedAccountForTransactions}
          onClose={() => {
            setShowTransactionsModal(false);
            setSelectedAccountForTransactions(null);
            setTransactionSearchQuery('');
            setTransactionFilter('all');
          }}
          searchQuery={transactionSearchQuery}
          onSearchChange={setTransactionSearchQuery}
          filter={transactionFilter}
          onFilterChange={setTransactionFilter}
        />
      )}
    </div>
  );
};