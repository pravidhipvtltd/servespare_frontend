import React, { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Search, Filter,
  Calendar, Download, ArrowUpRight, ArrowDownLeft, Building2,
  Smartphone, Banknote, RefreshCw, Eye, X, CheckCircle, Clock,
  Receipt, ShoppingCart, RotateCcw, CreditCard, AlertCircle
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';

interface CashTransaction {
  id: string;
  type: 'cash_in' | 'cash_out' | 'transfer';
  source: 'bill_payment' | 'sales_return' | 'bank_transfer' | 'opening_balance' | 'manual';
  amount: number;
  description: string;
  billId?: string;
  returnId?: string;
  bankAccountId?: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  accountType: 'bank' | 'esewa' | 'fonepay' | 'cash';
  accountName: string;
  bankName?: string;
  accountNumber?: string;
  currentBalance: number;
}

export const CashInHandPanel: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cash_in' | 'cash_out' | 'transfer'>('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualType, setManualType] = useState<'cash_in' | 'cash_out'>('cash_in');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedTransactions = getFromStorage('cashTransactions', []);
    setTransactions(storedTransactions);
    
    const storedAccounts = getFromStorage('bankAccounts', []);
    setBankAccounts(storedAccounts.filter((acc: BankAccount) => acc.accountType !== 'cash'));
  };

  // Calculate active drawer amount
  const calculateBalance = () => {
    const cashIn = transactions
      .filter(t => t.type === 'cash_in')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const cashOut = transactions
      .filter(t => t.type === 'cash_out' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return cashIn - cashOut;
  };

  const getTodayTransactions = () => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === today);
  };

  const getTodayStats = () => {
    const todayTxns = getTodayTransactions();
    const cashIn = todayTxns.filter(t => t.type === 'cash_in').reduce((sum, t) => sum + t.amount, 0);
    const cashOut = todayTxns.filter(t => t.type === 'cash_out' || t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);
    return { cashIn, cashOut, count: todayTxns.length };
  };

  const handleTransferToBankAccount = () => {
    if (!selectedAccount || !transferAmount || parseFloat(transferAmount) <= 0) {
      alert('⚠️ Please select account and enter valid amount');
      return;
    }

    const amount = parseFloat(transferAmount);
    const currentBalance = calculateBalance();

    if (amount > currentBalance) {
      alert('⚠️ Insufficient cash in drawer! Available: NPR ' + currentBalance.toLocaleString());
      return;
    }

    const account = bankAccounts.find(a => a.id === selectedAccount);
    if (!account) return;

    // Create transfer transaction
    const newTransaction: CashTransaction = {
      id: `CASH-${Date.now()}`,
      type: 'transfer',
      source: 'bank_transfer',
      amount: amount,
      description: `Transfer to ${account.accountName}`,
      bankAccountId: selectedAccount,
      date: new Date().toISOString(),
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    const allTransactions = getFromStorage('cashTransactions', []);
    saveToStorage('cashTransactions', [newTransaction, ...allTransactions]);

    // Update bank account balance
    const allAccounts = getFromStorage('bankAccounts', []);
    const updatedAccounts = allAccounts.map((acc: BankAccount) => {
      if (acc.id === selectedAccount) {
        return {
          ...acc,
          currentBalance: acc.currentBalance + amount,
          totalReceived: (acc.totalReceived || 0) + amount
        };
      }
      return acc;
    });
    saveToStorage('bankAccounts', updatedAccounts);

    loadData();
    setShowTransferModal(false);
    setTransferAmount('');
    setSelectedAccount('');
    alert('✅ Cash transferred successfully!');
  };

  const handleManualEntry = () => {
    if (!manualAmount || parseFloat(manualAmount) <= 0 || !manualDescription) {
      alert('⚠️ Please enter valid amount and description');
      return;
    }

    const amount = parseFloat(manualAmount);

    if (manualType === 'cash_out') {
      const currentBalance = calculateBalance();
      if (amount > currentBalance) {
        alert('⚠️ Insufficient cash in drawer! Available: NPR ' + currentBalance.toLocaleString());
        return;
      }
    }

    const newTransaction: CashTransaction = {
      id: `CASH-${Date.now()}`,
      type: manualType,
      source: 'manual',
      amount: amount,
      description: manualDescription,
      date: new Date().toISOString(),
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    const allTransactions = getFromStorage('cashTransactions', []);
    saveToStorage('cashTransactions', [newTransaction, ...allTransactions]);

    loadData();
    setShowAddModal(false);
    setManualAmount('');
    setManualDescription('');
    alert('✅ Transaction added successfully!');
  };

  const todayStats = getTodayStats();
  const activeBalance = calculateBalance();

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || t.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTransactionIcon = (transaction: CashTransaction) => {
    if (transaction.type === 'cash_in') {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    } else if (transaction.type === 'transfer') {
      return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    } else {
      return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      bill_payment: 'Bill Payment',
      sales_return: 'Sales Return',
      bank_transfer: 'Bank Transfer',
      opening_balance: 'Opening Balance',
      manual: 'Manual Entry'
    };
    return labels[source] || source;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-green-600" />
            <span>Cash in Hand</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Track physical cash drawer and manage transfers
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={activeBalance <= 0}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              activeBalance > 0
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Transfer to Bank</span>
          </button>
        </div>
      </div>

      {/* Active Drawer Amount - Big Display */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Wallet className="w-10 h-10 opacity-80" />
              <span className="text-green-100 text-lg">Active Drawer Amount</span>
            </div>
            <p className="text-5xl font-bold mb-2">
              NPR {activeBalance.toLocaleString()}
            </p>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-sm">Cash In: NPR {todayStats.cashIn.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">Cash Out: NPR {todayStats.cashOut.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm text-green-100">Today's Transactions</p>
              <p className="text-3xl font-bold">{todayStats.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              TODAY
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cash In</p>
          <p className="text-2xl font-bold text-green-900">
            NPR {todayStats.cashIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
              TODAY
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cash Out</p>
          <p className="text-2xl font-bold text-red-900">
            NPR {todayStats.cashOut.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              NET
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Today's Net</p>
          <p className={`text-2xl font-bold ${
            todayStats.cashIn - todayStats.cashOut >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            NPR {(todayStats.cashIn - todayStats.cashOut).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All', icon: Filter },
              { value: 'cash_in', label: 'Cash In', icon: ArrowDownLeft },
              { value: 'cash_out', label: 'Cash Out', icon: ArrowUpRight },
              { value: 'transfer', label: 'Transfers', icon: RefreshCw }
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
                    filterType === filter.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Transactions</h3>
            <p className="text-gray-500">Cash transactions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Source</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-semibold">Description</th>
                  <th className="px-6 py-4 text-right text-gray-900 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          transaction.type === 'cash_in'
                            ? 'bg-green-100 text-green-700'
                            : transaction.type === 'transfer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'cash_in' ? 'CASH IN' : 
                           transaction.type === 'transfer' ? 'TRANSFER' : 'CASH OUT'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{getSourceLabel(transaction.source)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{transaction.description}</div>
                      {transaction.billId && (
                        <div className="text-xs text-blue-600 mt-1">Bill: {transaction.billId}</div>
                      )}
                      {transaction.bankAccountId && (
                        <div className="text-xs text-purple-600 mt-1">
                          To: {bankAccounts.find(a => a.id === transaction.bankAccountId)?.accountName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-lg ${
                        transaction.type === 'cash_in'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'cash_in' ? '+' : '-'}NPR {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer to Bank Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <ArrowUpRight className="w-6 h-6 text-green-600 mr-2" />
                Transfer to Bank
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 mb-1">Available Cash in Drawer</p>
              <p className="text-3xl font-bold text-green-900">
                NPR {activeBalance.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Select Account *</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose account...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} ({account.accountType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Transfer Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    NPR
                  </span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferToBankAccount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                Manual Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Transaction Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setManualType('cash_in')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      manualType === 'cash_in'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ArrowDownLeft className={`w-6 h-6 mx-auto mb-2 ${
                      manualType === 'cash_in' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`font-semibold ${
                      manualType === 'cash_in' ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      Cash In
                    </span>
                  </button>
                  <button
                    onClick={() => setManualType('cash_out')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      manualType === 'cash_out'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ArrowUpRight className={`w-6 h-6 mx-auto mb-2 ${
                      manualType === 'cash_out' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <span className={`font-semibold ${
                      manualType === 'cash_out' ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      Cash Out
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    NPR
                  </span>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Enter transaction description..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualEntry}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
