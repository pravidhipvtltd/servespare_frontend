import React, { useState, useEffect } from 'react';
import { 
  Plus, Building2, CreditCard, TrendingUp, DollarSign, 
  Edit2, Trash2, Eye, EyeOff, MoreVertical, CheckCircle,
  ArrowUpRight, ArrowDownRight, Activity, Wallet
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { BankAccount } from '../../types';

export const BankAccountsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    balance: 0,
    branch: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const allAccounts = getFromStorage('bankAccounts', []);
    setAccounts(allAccounts.filter((a: BankAccount) => a.workspaceId === currentUser?.workspaceId));
  };

  const handleAddAccount = () => {
    const account: BankAccount = {
      id: Date.now().toString(),
      ...newAccount,
      workspaceId: currentUser?.workspaceId || '',
      createdAt: new Date().toISOString()
    };

    const allAccounts = getFromStorage('bankAccounts', []);
    saveToStorage('bankAccounts', [...allAccounts, account]);
    loadAccounts();
    setShowAddModal(false);
    setNewAccount({
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      balance: 0,
      branch: ''
    });
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const allAccounts = getFromStorage('bankAccounts', []);
      saveToStorage('bankAccounts', allAccounts.filter((a: BankAccount) => a.id !== id));
      loadAccounts();
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeAccounts = accounts.filter(a => a.balance > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl">Bank Accounts</h3>
          <p className="text-gray-500 text-sm mt-1">Manage all your business bank accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{hideBalances ? 'Show' : 'Hide'} Balances</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm bg-white/20 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>Total</span>
            </div>
          </div>
          <div className="text-white/80 text-sm mb-2">Total Bank Balance</div>
          <div className="text-white text-4xl">
            {hideBalances ? '₹ •••••' : `₹${totalBalance.toLocaleString()}`}
          </div>
          <div className="mt-4 flex items-center text-white/70 text-sm">
            <Activity className="w-4 h-4 mr-2" />
            <span>{accounts.length} Total Accounts</span>
          </div>
        </div>

        {/* Active Accounts Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Active Accounts</div>
          <div className="text-gray-900 text-4xl">{activeAccounts}</div>
          <div className="mt-4 text-gray-400 text-sm">
            Accounts with positive balance
          </div>
        </div>

        {/* Average Balance Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Average Balance</div>
          <div className="text-gray-900 text-4xl">
            {hideBalances ? '•••••' : `₹${accounts.length > 0 ? Math.round(totalBalance / accounts.length).toLocaleString() : '0'}`}
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Per account
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-gray-900 text-xl">Your Bank Accounts</h4>
          <div className="text-gray-500 text-sm">{accounts.length} account(s)</div>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 text-xl mb-2">No Bank Accounts</h3>
            <p className="text-gray-500 mb-6">Add your first bank account to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Add Bank Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="group relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/70">Active</span>
                  </div>
                </div>

                {/* Bank Name */}
                <div className="mb-6">
                  <div className="text-white/60 text-xs mb-1">Bank Name</div>
                  <div className="text-white text-xl">{account.bankName}</div>
                </div>

                {/* Account Details Grid */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-white/60 text-xs mb-1">Account Number</div>
                    <div className="text-white font-mono text-sm tracking-wider">
                      •••• •••• •••• {account.accountNumber.slice(-4)}
                    </div>
                  </div>

                  {account.ifscCode && (
                    <div>
                      <div className="text-white/60 text-xs mb-1">IFSC Code</div>
                      <div className="text-white font-mono text-sm">{account.ifscCode}</div>
                    </div>
                  )}

                  {account.accountHolderName && (
                    <div>
                      <div className="text-white/60 text-xs mb-1">Account Holder</div>
                      <div className="text-white text-sm">{account.accountHolderName}</div>
                    </div>
                  )}

                  {account.branch && (
                    <div>
                      <div className="text-white/60 text-xs mb-1">Branch</div>
                      <div className="text-white text-sm">{account.branch}</div>
                    </div>
                  )}
                </div>

                {/* Balance */}
                <div className="border-t border-white/10 pt-4">
                  <div className="text-white/60 text-xs mb-1">Current Balance</div>
                  <div className="text-white text-3xl">
                    {hideBalances ? '₹ •••••' : `₹${account.balance.toLocaleString()}`}
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg backdrop-blur-xl transition-all"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full blur-2xl"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 text-2xl">Add Bank Account</h3>
                  <p className="text-gray-500 text-sm mt-1">Enter your bank account details</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <span className="text-gray-500 text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., State Bank of India"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    value={newAccount.accountHolderName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountHolderName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Account Number *</label>
                  <input
                    type="text"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="1234567890123456"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={newAccount.ifscCode}
                    onChange={(e) => setNewAccount({ ...newAccount, ifscCode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="SBIN0001234"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Branch</label>
                  <input
                    type="text"
                    value={newAccount.branch}
                    onChange={(e) => setNewAccount({ ...newAccount, branch: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Kathmandu Main Branch"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Initial Balance *</label>
                  <input
                    type="number"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAccount}
                  disabled={!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountHolderName}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
