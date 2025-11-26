import React, { useState, useEffect, useRef } from 'react';
import {
  DollarSign, Plus, Upload, X, Calendar, Tag, CreditCard, TrendingDown,
  Filter, Search, Download, PieChart, BarChart3, Wallet, Receipt,
  ChevronDown, FileText, Image as ImageIcon, Eye
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';

type ExpenseCategory = 'fuel' | 'packaging' | 'salary' | 'rent' | 'utilities' | 'maintenance' | 'misc';
type PaymentMode = 'cash' | 'esewa' | 'fonepay' | 'bank_transfer' | 'cheque';

interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paymentMode: PaymentMode;
  date: string;
  billPhoto?: string;
  workspaceId?: string;
  createdBy?: string;
  createdAt: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string; color: string; bgColor: string }[] = [
  { value: 'fuel', label: 'Fuel', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'packaging', label: 'Packaging', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'salary', label: 'Salary', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'rent', label: 'Rent', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'utilities', label: 'Utilities', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'maintenance', label: 'Maintenance', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'misc', label: 'Miscellaneous', color: 'text-gray-700', bgColor: 'bg-gray-100' },
];

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'fonepay', label: 'FonePay' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

export const ExpensePettyCashPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('misc');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billPhoto, setBillPhoto] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const allExpenses = getFromStorage('expenses', []).filter(
      (e: Expense) => e.workspaceId === currentUser?.workspaceId
    );
    setExpenses(allExpenses);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setBillPhoto(files[0].name);
    }
  };

  const addExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description,
      paymentMode,
      date,
      billPhoto,
      workspaceId: currentUser?.workspaceId,
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString(),
    };

    const allExpenses = getFromStorage('expenses', []);
    saveToStorage('expenses', [...allExpenses, newExpense]);
    
    loadExpenses();
    resetForm();
    setShowAddPanel(false);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('misc');
    setDescription('');
    setPaymentMode('cash');
    setDate(new Date().toISOString().split('T')[0]);
    setBillPhoto('');
  };

  const deleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      const allExpenses = getFromStorage('expenses', []);
      saveToStorage('expenses', allExpenses.filter((e: Expense) => e.id !== id));
      loadExpenses();
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      stats[cat.value] = 0;
    });

    expenses.forEach(expense => {
      stats[expense.category] = (stats[expense.category] || 0) + expense.amount;
    });

    return Object.entries(stats).map(([category, total]) => ({
      category,
      label: CATEGORIES.find(c => c.value === category)?.label || category,
      total,
      color: CATEGORIES.find(c => c.value === category)?.color || 'text-gray-700',
    }));
  };

  const getMonthlyExpenses = () => {
    const monthlyData: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
    });

    return Object.entries(monthlyData).map(([month, total]) => ({ month, total }));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    
    const matchesDateRange = 
      (!dateRange.start || expense.date >= dateRange.start) &&
      (!dateRange.end || expense.date <= dateRange.end);

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryStats = getCategoryStats();
  const monthlyExpenses = getMonthlyExpenses();
  const maxMonthlyExpense = Math.max(...monthlyExpenses.map(m => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">Expense & Petty Cash</h3>
          <p className="text-gray-500 text-sm">Track and manage business expenses</p>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-600 text-sm mb-1">Total Expenses</div>
          <div className="text-gray-900 text-2xl font-semibold">₹{totalExpenses.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-600 text-sm mb-1">Total Entries</div>
          <div className="text-gray-900 text-2xl font-semibold">{filteredExpenses.length}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-600 text-sm mb-1">Avg. Expense</div>
          <div className="text-gray-900 text-2xl font-semibold">
            ₹{filteredExpenses.length > 0 ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString() : 0}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-600 text-sm mb-1">Cash Expenses</div>
          <div className="text-gray-900 text-2xl font-semibold">
            ₹{filteredExpenses.filter(e => e.paymentMode === 'cash').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-gray-900 font-semibold flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>Expense by Category</span>
            </h4>
          </div>

          <div className="space-y-3">
            {categoryStats
              .filter(stat => stat.total > 0)
              .sort((a, b) => b.total - a.total)
              .map((stat) => {
                const percentage = totalExpenses > 0 ? (stat.total / totalExpenses) * 100 : 0;
                return (
                  <div key={stat.category}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-700 font-medium">{stat.label}</span>
                      <span className="text-gray-900 font-semibold">₹{stat.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stat.category === 'fuel' ? 'bg-orange-500' :
                          stat.category === 'packaging' ? 'bg-blue-500' :
                          stat.category === 'salary' ? 'bg-green-500' :
                          stat.category === 'rent' ? 'bg-purple-500' :
                          stat.category === 'utilities' ? 'bg-yellow-500' :
                          stat.category === 'maintenance' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-gray-900 font-semibold flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Monthly Expenses</span>
            </h4>
          </div>

          <div className="space-y-4">
            {monthlyExpenses.map((data) => (
              <div key={data.month}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-700 font-medium">{data.month}</span>
                  <span className="text-gray-900 font-semibold">₹{data.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(data.total / maxMonthlyExpense) * 100}%` }}
                  >
                    {(data.total / maxMonthlyExpense) * 100 > 20 && (
                      <span className="text-white text-xs font-semibold">
                        {((data.total / totalExpenses) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            placeholder="Start date"
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            placeholder="End date"
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Date</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Description</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Category</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Payment Mode</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Amount</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Bill</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const categoryInfo = CATEGORIES.find(c => c.value === expense.category);
                return (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-medium">{expense.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo?.bgColor} ${categoryInfo?.color}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {categoryInfo?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center space-x-2 text-gray-700">
                        <CreditCard className="w-4 h-4" />
                        <span>{PAYMENT_MODES.find(p => p.value === expense.paymentMode)?.label}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-semibold">₹{expense.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      {expense.billPhoto ? (
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No bill</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Slide-over Panel */}
      {showAddPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-gray-900 text-xl font-semibold">Add New Expense</h3>
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        category === cat.value
                          ? `${cat.bgColor} border-current ${cat.color}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Tag className="w-5 h-5 mb-2" />
                      <div className="font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bill Photo */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Attach Bill Photo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-gray-600 hover:text-emerald-600"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Upload bill photo</div>
                  <div className="text-sm">Click to browse files</div>
                </button>

                {billPhoto && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{billPhoto}</span>
                    </div>
                    <button
                      onClick={() => setBillPhoto('')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={addExpense}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
