import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, X, Plus, Minus, AlertCircle, TrendingUp, Receipt, Wallet, Calculator, Save } from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { CashDrawerShift, CashTransaction, Bill } from '../../types';

export const CashierCashDrawerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentShift, setCurrentShift] = useState<CashDrawerShift | null>(null);
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [cashInAmount, setCashInAmount] = useState<number>(0);
  const [cashOutAmount, setCashOutAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState<string>('');

  useEffect(() => {
    loadCurrentShift();
  }, []);

  const loadCurrentShift = () => {
    const allShifts = getFromStorage('cashDrawerShifts', []);
    const myOpenShift = allShifts.find(
      (s: CashDrawerShift) => 
        s.cashierId === currentUser?.id && 
        s.status === 'open' &&
        s.workspaceId === currentUser?.workspaceId
    );
    setCurrentShift(myOpenShift || null);
  };

  const handleOpenShift = () => {
    if (openingAmount <= 0) {
      alert('Please enter a valid opening amount');
      return;
    }

    const newShift: CashDrawerShift = {
      id: Date.now().toString(),
      cashierId: currentUser?.id || '',
      cashierName: currentUser?.name || '',
      branchId: currentUser?.branchId,
      branchName: currentUser?.branchName,
      openedAt: new Date().toISOString(),
      openingAmount: openingAmount,
      expectedAmount: openingAmount,
      actualAmount: openingAmount,
      status: 'open',
      transactions: [{
        id: Date.now().toString(),
        type: 'opening',
        amount: openingAmount,
        description: 'Opening balance',
        timestamp: new Date().toISOString(),
      }],
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
    };

    const allShifts = getFromStorage('cashDrawerShifts', []);
    saveToStorage('cashDrawerShifts', [...allShifts, newShift]);
    
    setCurrentShift(newShift);
    setShowOpenModal(false);
    setOpeningAmount(0);
  };

  const handleCloseShift = () => {
    if (!currentShift) return;
    if (closingAmount < 0) {
      alert('Please enter a valid closing amount');
      return;
    }

    const difference = closingAmount - (currentShift.expectedAmount || 0);

    const closingTransaction: CashTransaction = {
      id: Date.now().toString(),
      type: 'closing',
      amount: closingAmount,
      description: 'Closing balance',
      timestamp: new Date().toISOString(),
    };

    const updatedShift: CashDrawerShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      closingAmount: closingAmount,
      actualAmount: closingAmount,
      difference: difference,
      status: 'closed',
      transactions: [...currentShift.transactions, closingTransaction],
      notes: closingNotes,
    };

    const allShifts = getFromStorage('cashDrawerShifts', []);
    const updatedShifts = allShifts.map((s: CashDrawerShift) => 
      s.id === currentShift.id ? updatedShift : s
    );
    saveToStorage('cashDrawerShifts', updatedShifts);

    setCurrentShift(null);
    setShowCloseModal(false);
    setClosingAmount(0);
    setClosingNotes('');
    
    alert(`Shift closed successfully! ${difference >= 0 ? 'Surplus' : 'Loss'}: NPR ${Math.abs(difference).toLocaleString()}`);
  };

  const handleCashIn = () => {
    if (!currentShift) return;
    if (cashInAmount <= 0 || !description.trim()) {
      alert('Please enter amount and description');
      return;
    }

    const transaction: CashTransaction = {
      id: Date.now().toString(),
      type: 'cash_in',
      amount: cashInAmount,
      description: description,
      timestamp: new Date().toISOString(),
    };

    const updatedShift: CashDrawerShift = {
      ...currentShift,
      expectedAmount: (currentShift.expectedAmount || 0) + cashInAmount,
      actualAmount: (currentShift.actualAmount || 0) + cashInAmount,
      transactions: [...currentShift.transactions, transaction],
    };

    const allShifts = getFromStorage('cashDrawerShifts', []);
    const updatedShifts = allShifts.map((s: CashDrawerShift) => 
      s.id === currentShift.id ? updatedShift : s
    );
    saveToStorage('cashDrawerShifts', updatedShifts);

    setCurrentShift(updatedShift);
    setShowCashInModal(false);
    setCashInAmount(0);
    setDescription('');
  };

  const handleCashOut = () => {
    if (!currentShift) return;
    if (cashOutAmount <= 0 || !description.trim()) {
      alert('Please enter amount and description');
      return;
    }

    const transaction: CashTransaction = {
      id: Date.now().toString(),
      type: 'cash_out',
      amount: cashOutAmount,
      description: description,
      timestamp: new Date().toISOString(),
    };

    const updatedShift: CashDrawerShift = {
      ...currentShift,
      expectedAmount: (currentShift.expectedAmount || 0) - cashOutAmount,
      actualAmount: (currentShift.actualAmount || 0) - cashOutAmount,
      transactions: [...currentShift.transactions, transaction],
    };

    const allShifts = getFromStorage('cashDrawerShifts', []);
    const updatedShifts = allShifts.map((s: CashDrawerShift) => 
      s.id === currentShift.id ? updatedShift : s
    );
    saveToStorage('cashDrawerShifts', updatedShifts);

    setCurrentShift(updatedShift);
    setShowCashOutModal(false);
    setCashOutAmount(0);
    setDescription('');
  };

  // Record sale transactions automatically
  useEffect(() => {
    if (!currentShift) return;

    const handleBillCreated = (event: CustomEvent) => {
      const bill: Bill = event.detail;
      
      // Only track cash sales
      if (bill.paymentMethod !== 'cash' || bill.createdBy !== currentUser?.id) return;

      const transaction: CashTransaction = {
        id: Date.now().toString(),
        type: 'sale',
        amount: bill.total,
        billNumber: bill.billNumber,
        description: `Sale to ${bill.customerName}`,
        timestamp: new Date().toISOString(),
      };

      const updatedShift: CashDrawerShift = {
        ...currentShift,
        expectedAmount: (currentShift.expectedAmount || 0) + bill.total,
        actualAmount: (currentShift.actualAmount || 0) + bill.total,
        transactions: [...currentShift.transactions, transaction],
      };

      const allShifts = getFromStorage('cashDrawerShifts', []);
      const updatedShifts = allShifts.map((s: CashDrawerShift) => 
        s.id === currentShift.id ? updatedShift : s
      );
      saveToStorage('cashDrawerShifts', updatedShifts);
      setCurrentShift(updatedShift);
    };

    window.addEventListener('billCreated', handleBillCreated as EventListener);
    return () => window.removeEventListener('billCreated', handleBillCreated as EventListener);
  }, [currentShift, currentUser]);

  const calculateDuration = () => {
    if (!currentShift) return '0h 0m';
    const start = new Date(currentShift.openedAt);
    const end = new Date();
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getSalesTransactions = () => {
    if (!currentShift) return [];
    return currentShift.transactions.filter(t => t.type === 'sale');
  };

  const getTotalSales = () => {
    return getSalesTransactions().reduce((sum, t) => sum + t.amount, 0);
  };

  const getCashInTotal = () => {
    if (!currentShift) return 0;
    return currentShift.transactions
      .filter(t => t.type === 'cash_in')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCashOutTotal = () => {
    if (!currentShift) return 0;
    return currentShift.transactions
      .filter(t => t.type === 'cash_out')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (!currentShift) {
    return (
      <div className="space-y-6">
        {/* No Active Shift */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-gray-900 text-2xl mb-2">No Active Shift</h3>
            <p className="text-gray-600 mb-6">Start your shift to begin managing cash transactions</p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl transition-all"
            >
              Start New Shift
            </button>
          </div>
        </div>

        {/* Open Shift Modal */}
        {showOpenModal && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowOpenModal(false)}
            />
            
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl flex items-center">
                  <Wallet className="w-6 h-6 mr-2 text-orange-600" />
                  Start New Shift
                </h3>
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Opening Cash Amount (NPR) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={openingAmount || ''}
                    onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter opening amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">Count your starting cash and enter the amount</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenShift}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
                  Start Shift
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shift Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-gray-900 text-xl">Active Shift</h3>
            </div>
            <p className="text-gray-600">Started: {new Date(currentShift.openedAt).toLocaleString('en-NP')}</p>
            <p className="text-gray-600">Duration: {calculateDuration()}</p>
          </div>
          <button
            onClick={() => setShowCloseModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Close Shift</span>
          </button>
        </div>
      </div>

      {/* Cash Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Opening Amount</p>
          <p className="text-gray-900 text-2xl">NPR {currentShift.openingAmount.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Sales</p>
          <p className="text-gray-900 text-2xl">NPR {getTotalSales().toLocaleString()}</p>
          <p className="text-green-600 text-sm">{getSalesTransactions().length} transactions</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Expected Cash</p>
          <p className="text-gray-900 text-2xl">NPR {(currentShift.expectedAmount || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Current Cash</p>
          <p className="text-gray-900 text-2xl">NPR {(currentShift.actualAmount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Cash In/Out Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowCashInModal(true)}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-2xl hover:shadow-green-500/50 transition-all text-left group"
        >
          <ArrowUpCircle className="w-10 h-10 mb-3" />
          <h3 className="text-xl mb-2">Cash In</h3>
          <p className="text-green-100 text-sm mb-3">Add cash to drawer (deposits, corrections)</p>
          <div className="flex items-center text-white font-semibold">
            <span>Add Cash</span>
            <Plus className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setShowCashOutModal(true)}
          className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white hover:shadow-2xl hover:shadow-red-500/50 transition-all text-left group"
        >
          <ArrowDownCircle className="w-10 h-10 mb-3" />
          <h3 className="text-xl mb-2">Cash Out</h3>
          <p className="text-red-100 text-sm mb-3">Remove cash from drawer (expenses, withdrawals)</p>
          <div className="flex items-center text-white font-semibold">
            <span>Remove Cash</span>
            <Minus className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-gray-900 text-lg mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-blue-600" />
          Transaction History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 text-sm py-3 px-4">Time</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Type</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Description</th>
                <th className="text-right text-gray-500 text-sm py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentShift.transactions.slice().reverse().map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(transaction.timestamp).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-700' :
                      transaction.type === 'refund' ? 'bg-red-100 text-red-700' :
                      transaction.type === 'cash_in' ? 'bg-blue-100 text-blue-700' :
                      transaction.type === 'cash_out' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {transaction.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 text-sm">
                    {transaction.description || transaction.billNumber || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm ${
                      transaction.type === 'cash_out' || transaction.type === 'refund' 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {transaction.type === 'cash_out' || transaction.type === 'refund' ? '-' : '+'}
                      NPR {transaction.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash In/Out Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Cash In</p>
              <p className="text-green-600 text-2xl">NPR {getCashInTotal().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Cash Out</p>
              <p className="text-red-600 text-2xl">NPR {getCashOutTotal().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cash In Modal */}
      {showCashInModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCashInModal(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-xl flex items-center">
                <ArrowUpCircle className="w-6 h-6 mr-2 text-green-600" />
                Cash In
              </h3>
              <button
                onClick={() => setShowCashInModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Amount (NPR) *</label>
                <input
                  type="number"
                  value={cashInAmount || ''}
                  onChange={(e) => setCashInAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Initial deposit, Correction"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCashInModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCashIn}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Cash
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cash Out Modal */}
      {showCashOutModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCashOutModal(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-xl flex items-center">
                <ArrowDownCircle className="w-6 h-6 mr-2 text-red-600" />
                Cash Out
              </h3>
              <button
                onClick={() => setShowCashOutModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Amount (NPR) *</label>
                <input
                  type="number"
                  value={cashOutAmount || ''}
                  onChange={(e) => setCashOutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Expense payment, Bank deposit"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCashOutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCashOut}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Cash
              </button>
            </div>
          </div>
        </>
      )}

      {/* Close Shift Modal */}
      {showCloseModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCloseModal(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-xl flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                Close Shift
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Expected Cash:</span>
                <span className="text-blue-700 font-bold">NPR {(currentShift.expectedAmount || 0).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-sm">Count your drawer and enter the actual closing amount</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Actual Closing Amount (NPR) *</label>
                <input
                  type="number"
                  value={closingAmount || ''}
                  onChange={(e) => setClosingAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter actual closing amount"
                  min="0"
                  step="0.01"
                />
              </div>

              {closingAmount > 0 && (
                <div className={`p-4 rounded-lg ${
                  closingAmount - (currentShift.expectedAmount || 0) < 0 
                    ? 'bg-red-50 border border-red-200'
                    : closingAmount - (currentShift.expectedAmount || 0) > 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Difference:</span>
                    <span className={`font-bold ${
                      closingAmount - (currentShift.expectedAmount || 0) < 0 
                        ? 'text-red-700'
                        : closingAmount - (currentShift.expectedAmount || 0) > 0
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {closingAmount - (currentShift.expectedAmount || 0) >= 0 ? '+' : ''}
                      NPR {Math.abs(closingAmount - (currentShift.expectedAmount || 0)).toLocaleString()}
                      {closingAmount - (currentShift.expectedAmount || 0) < 0 ? ' (Loss)' : 
                       closingAmount - (currentShift.expectedAmount || 0) > 0 ? ' (Surplus)' : ' (Balanced)'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any notes about the shift..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShift}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Close Shift</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
