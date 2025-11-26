import React, { useState, useEffect } from 'react';
import { 
  Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  DollarSign, Calendar, Filter, Search, Download, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { CashTransaction } from '../../types';

export const CashInHandPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideBalance, setHideBalance] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'in' as 'in' | 'out',
    amount: 0,
    description: '',
    category: '',
    reference: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const allTransactions = getFromStorage('cashTransactions', []);
    const filtered = allTransactions.filter((t: CashTransaction) => t.workspaceId === currentUser?.workspaceId);
    setTransactions(filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleAddTransaction = () => {
    const transaction: CashTransaction = {
      id: Date.now().toString(),
      ...newTransaction,
      workspaceId: currentUser?.workspaceId || '',
      createdAt: new Date().toISOString()
    };

    const allTransactions = getFromStorage('cashTransactions', []);
    saveToStorage('cashTransactions', [...allTransactions, transaction]);
    loadTransactions();
    setShowAddModal(false);
    setNewTransaction({
      type: 'in',
      amount: 0,
      description: '',
      category: '',
      reference: ''
    });
  };

  const cashIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const balance = cashIn - cashOut;

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.createdAt.split('T')[0] === today);
  const todayCashIn = todayTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const todayCashOut = todayTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl">Cash In Hand</h3>
          <p className="text-gray-500 text-sm mt-1">Track all your cash transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{hideBalance ? 'Show' : 'Hide'}</span>
          </button>
          <button
            onClick={loadTransactions}
            className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Current Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-white/80 text-sm mb-2">Current Balance</div>
          <div className="text-white text-4xl">
            {hideBalance ? '₹ •••••' : `₹${balance.toLocaleString()}`}
          </div>
          <div className="mt-4 flex items-center text-white/70 text-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>{balance >= 0 ? 'Positive' : 'Negative'} Balance</span>
          </div>
        </div>

        {/* Cash In Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500">Total In</div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Cash In</div>
          <div className="text-green-600 text-4xl">
            {hideBalance ? '•••••' : `₹${cashIn.toLocaleString()}`}
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            {transactions.filter(t => t.type === 'in').length} transaction(s)
          </div>
        </div>

        {/* Cash Out Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500">Total Out</div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Cash Out</div>
          <div className="text-red-600 text-4xl">
            {hideBalance ? '•••••' : `₹${cashOut.toLocaleString()}`}
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            {transactions.filter(t => t.type === 'out').length} transaction(s)
          </div>
        </div>

        {/* Today's Net Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Today's Net</div>
          <div className={`text-4xl ${(todayCashIn - todayCashOut) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {hideBalance ? '•••••' : `₹${(todayCashIn - todayCashOut).toLocaleString()}`}
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            {todayTransactions.length} transaction(s)
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterType === 'in'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cash In
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterType === 'out'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cash Out
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="pl-12 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full md:w-80"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-gray-900 text-xl">Recent Transactions</h4>
            <div className="text-gray-500 text-sm">{filteredTransactions.length} transaction(s)</div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 text-xl mb-2">No Transactions</h3>
            <p className="text-gray-500 mb-6">Add your first cash transaction to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((txn) => (
              <div key={txn.id} className="p-6 hover:bg-gray-50 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      txn.type === 'in'
                        ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                        : 'bg-gradient-to-br from-red-100 to-pink-200'
                    }`}>
                      {txn.type === 'in' ? (
                        <ArrowDownRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-red-600" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="text-gray-900">{txn.description}</div>
                        {txn.type === 'in' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Income
                          </span>
                        )}
                        {txn.type === 'out' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Expense
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">{txn.category}</span>
                        {txn.reference && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400">Ref: {txn.reference}</span>
                          </>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400">
                          {new Date(txn.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className={`text-2xl ${txn.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 text-2xl">Add Cash Transaction</h3>
                  <p className="text-gray-500 text-sm mt-1">Record a new cash transaction</p>
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
              {/* Transaction Type */}
              <div>
                <label className="block text-gray-700 mb-2">Transaction Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'in' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newTransaction.type === 'in'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900">Cash In</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'out' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newTransaction.type === 'out'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                      <span className="text-gray-900">Cash Out</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Office supplies purchase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Sales">Sales</option>
                    <option value="Purchases">Purchases</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Salary">Salary</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Optional reference"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.amount || !newTransaction.description || !newTransaction.category}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
