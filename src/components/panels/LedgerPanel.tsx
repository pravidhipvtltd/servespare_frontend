import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, TrendingDown, Calendar, Filter, Download,
  Search, ArrowUpRight, ArrowDownLeft, Clock, User,
  DollarSign, FileText, AlertCircle, CheckCircle, XCircle,
  CreditCard, Wallet, ChevronRight, Package, Building2
} from 'lucide-react';
import { getFromStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Party, Order, Bill } from '../../types';

type LedgerType = 'purchase' | 'sales';

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'sale';
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  paymentMethod?: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  items?: any[];
}

export const LedgerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<LedgerType>('purchase');
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'partial'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadParties();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'purchase' && selectedParty) {
      loadTransactions();
    } else if (activeTab === 'sales') {
      loadTransactions();
    }
  }, [selectedParty, activeTab, dateFrom, dateTo, filterStatus]);

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    const workspaceParties = allParties.filter((p: Party) => p.workspaceId === currentUser?.workspaceId);
    
    // For Purchase Ledger - only show supplier type parties
    if (activeTab === 'purchase') {
      const supplierParties = workspaceParties.filter((p: Party) => 
        p.type === 'supplier' || p.type === 'distributor' || p.type === 'wholesaler'
      );
      setParties(supplierParties);
      if (supplierParties.length > 0 && !selectedParty) {
        setSelectedParty(supplierParties[0]);
      } else if (selectedParty && !supplierParties.find(p => p.id === selectedParty.id)) {
        setSelectedParty(supplierParties[0] || null);
      }
    } else {
      // For Sales Ledger - don't need party filtering
      setParties([]);
      setSelectedParty(null);
    }
  };

  const loadTransactions = () => {
    const allOrders = getFromStorage('orders', []);
    const allBills = getFromStorage('bills', []);
    const allCustomerOrders = getFromStorage('customerOrders', []);

    let txns: Transaction[] = [];
    let runningBalance = 0;

    if (activeTab === 'purchase') {
      if (!selectedParty) return;
      
      runningBalance = selectedParty.openingBalance || 0;
      
      // Purchase Ledger - Orders from supplier parties
      const partyOrders = allOrders.filter(
        (o: Order) => o.partyId === selectedParty.id && o.workspaceId === currentUser?.workspaceId
      );

      txns = partyOrders.map((order: Order) => {
        const total = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const debit = total;
        runningBalance += debit;

        return {
          id: order.id,
          date: order.createdAt,
          type: 'purchase' as const,
          referenceNumber: order.orderNumber,
          description: `Purchase Order - ${order.items.length} items`,
          debit: debit,
          credit: 0,
          balance: runningBalance,
          paymentMethod: order.paymentMethod || 'pending',
          paymentStatus: order.status === 'received' ? 'paid' : order.status === 'pending' ? 'pending' : 'pending',
          items: order.items,
        };
      });
    } else {
      // Sales Ledger - ALL Bills and Customer Orders from the system
      const workspaceBills = allBills.filter(
        (b: Bill) => b.workspaceId === currentUser?.workspaceId
      );

      const workspaceCustomerOrders = allCustomerOrders.filter(
        (co: any) => co.workspaceId === currentUser?.workspaceId
      );

      // Combine bills and customer orders
      const billTxns = workspaceBills.map((bill: Bill) => ({
        id: bill.id,
        date: bill.createdAt,
        type: 'sale' as const,
        referenceNumber: bill.billNumber,
        description: `Bill - ${bill.customerName}`,
        debit: 0,
        credit: bill.total,
        balance: 0,
        paymentMethod: bill.paymentMethod,
        paymentStatus: 'paid' as const,
        items: bill.items,
      }));

      const orderTxns = workspaceCustomerOrders.map((order: any) => ({
        id: order.id,
        date: order.createdAt,
        type: 'sale' as const,
        referenceNumber: order.orderNumber,
        description: `Order - ${order.customerName}`,
        debit: 0,
        credit: order.total,
        balance: 0,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.status === 'completed' ? 'paid' as const : 'pending' as const,
        items: order.items,
      }));

      txns = [...billTxns, ...orderTxns];

      // Calculate running balance for sales
      txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      txns = txns.map(txn => {
        runningBalance += txn.credit;
        return { ...txn, balance: runningBalance };
      });
    }

    // Apply date filters
    if (dateFrom) {
      txns = txns.filter(t => new Date(t.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      txns = txns.filter(t => new Date(t.date) <= new Date(dateTo));
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      txns = txns.filter(t => t.paymentStatus === filterStatus);
    }

    // Sort by date descending
    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(txns);
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.phone.includes(searchQuery)
  );

  // Calculate summary statistics
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  const netBalance = activeTab === 'purchase' 
    ? totalDebit - totalCredit 
    : totalCredit - totalDebit;
  const paidTransactions = transactions.filter(t => t.paymentStatus === 'paid').length;
  const pendingTransactions = transactions.filter(t => t.paymentStatus === 'pending').length;

  const exportLedger = () => {
    if (!selectedParty) return;

    const csvContent = [
      ['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance', 'Status'].join(','),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.referenceNumber,
        t.description,
        t.debit || '',
        t.credit || '',
        t.balance,
        t.paymentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedParty.name}_${activeTab}_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Party List (Only for Purchase Ledger) */}
      {activeTab === 'purchase' && (
        <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Tab Switcher */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('purchase')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                  activeTab === 'purchase'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Purchase</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                  activeTab === 'sales'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Sales</span>
                </div>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search supplier parties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Party List */}
          <div className="flex-1 overflow-y-auto">
            {filteredParties.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No supplier parties found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredParties.map((party) => {
                  const isSelected = selectedParty?.id === party.id;
                  return (
                    <button
                      key={party.id}
                      onClick={() => setSelectedParty(party)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {party.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              party.type === 'distributor' ? 'bg-purple-100 text-purple-700' :
                              party.type === 'wholesaler' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {party.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{party.contactPerson}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{party.phone}</span>
                            {party.currentBalance > 0 && (
                              <span className="text-orange-600">
                                ₹{party.currentBalance.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-5 h-5 text-blue-500 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Ledger Details */}
      <div className="flex-1 flex flex-col bg-white">
        {activeTab === 'purchase' && !selectedParty ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg mb-2">Select a party to view ledger</p>
              <p className="text-sm">Choose a party from the list to see transaction history</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      {activeTab === 'purchase' ? (
                        <Package className="w-7 h-7" />
                      ) : (
                        <ShoppingCart className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl text-gray-900 mb-1">
                        {activeTab === 'purchase' ? selectedParty?.name : 'Sales Ledger'}
                      </h2>
                      {activeTab === 'purchase' && selectedParty ? (
                        <>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{selectedParty.contactPerson}</span>
                            </span>
                            <span>•</span>
                            <span>{selectedParty.phone}</span>
                            <span>•</span>
                            <span>{selectedParty.city}, {selectedParty.state}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              selectedParty.type === 'distributor' ? 'bg-purple-100 text-purple-700' :
                              selectedParty.type === 'wholesaler' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {selectedParty.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              Payment Terms: {selectedParty.paymentTerms.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">All sales transactions across the workspace</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Tab Switcher for Sales View */}
                    {activeTab === 'sales' && (
                      <div className="flex space-x-2 bg-gray-100 rounded-lg p-1 mr-2">
                        <button
                          onClick={() => setActiveTab('purchase')}
                          className="py-2 px-4 rounded-lg text-sm text-gray-600 hover:text-gray-900 transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>Purchase</span>
                          </div>
                        </button>
                        <button
                          className="py-2 px-4 rounded-lg text-sm bg-white text-gray-900 shadow-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Sales</span>
                          </div>
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        showFilters
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                    {activeTab === 'purchase' && selectedParty && (
                      <button
                        onClick={exportLedger}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 transition-all flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {activeTab === 'purchase' ? 'Total Purchases' : 'Total Sales'}
                        </span>
                      </div>
                      <p className="text-2xl text-gray-900 font-semibold">
                        ₹{(activeTab === 'purchase' ? totalDebit : totalCredit).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{transactions.length} transactions</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${netBalance >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'} rounded-xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${netBalance >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'} rounded-lg flex items-center justify-center`}>
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Net Balance</span>
                      </div>
                      <p className={`text-2xl font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{netBalance >= 0 ? 'Receivable' : 'Payable'}</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Paid</span>
                      </div>
                      <p className="text-2xl text-gray-900 font-semibold">{paidTransactions}</p>
                      <p className="text-xs text-green-600 mt-1">
                        ₹{transactions.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + (activeTab === 'purchase' ? t.debit : t.credit), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Pending</span>
                      </div>
                      <p className="text-2xl text-gray-900 font-semibold">{pendingTransactions}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        ₹{transactions.filter(t => t.paymentStatus === 'pending').reduce((sum, t) => sum + (activeTab === 'purchase' ? t.debit : t.credit), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="px-6 pb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">From Date</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">To Date</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Transactions</option>
                          <option value="paid">Paid Only</option>
                          <option value="pending">Pending Only</option>
                          <option value="partial">Partial Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transactions Table */}
            <div className="flex-1 overflow-auto">
              {transactions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">No transactions found</p>
                    <p className="text-sm">
                      {activeTab === 'purchase' 
                        ? 'No purchase orders from this supplier party yet'
                        : 'No sales to this party yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs text-gray-600 uppercase">Date</th>
                          <th className="text-left py-3 px-4 text-xs text-gray-600 uppercase">Reference</th>
                          <th className="text-left py-3 px-4 text-xs text-gray-600 uppercase">Description</th>
                          <th className="text-right py-3 px-4 text-xs text-gray-600 uppercase">
                            {activeTab === 'purchase' ? 'Purchase Amount' : 'Sale Amount'}
                          </th>
                          <th className="text-right py-3 px-4 text-xs text-gray-600 uppercase">Balance</th>
                          <th className="text-center py-3 px-4 text-xs text-gray-600 uppercase">Payment</th>
                          <th className="text-center py-3 px-4 text-xs text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((txn, index) => (
                          <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {new Date(txn.date).toLocaleDateString('en-US', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-blue-600">{txn.referenceNumber}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm text-gray-900">{txn.description}</p>
                                {txn.items && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {txn.items.length} item(s)
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`text-sm ${
                                activeTab === 'purchase' 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {activeTab === 'purchase' 
                                  ? `-₹${txn.debit.toLocaleString()}`
                                  : `+₹${txn.credit.toLocaleString()}`}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-sm text-gray-900">
                                ₹{txn.balance.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {txn.paymentMethod && (
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  txn.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                                  txn.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                                  txn.paymentMethod === 'esewa' ? 'bg-purple-100 text-purple-700' :
                                  txn.paymentMethod === 'fonepay' ? 'bg-indigo-100 text-indigo-700' :
                                  txn.paymentMethod === 'credit' ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {txn.paymentMethod === 'esewa' ? 'eSewa' :
                                   txn.paymentMethod === 'fonepay' ? 'FonePay' :
                                   txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1)}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
                                txn.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-700' 
                                  : txn.paymentStatus === 'partial'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {txn.paymentStatus === 'paid' ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : txn.paymentStatus === 'partial' ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span className="capitalize">{txn.paymentStatus}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan={3} className="py-4 px-4 text-right">
                            <span className="text-sm text-gray-900">Total:</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-sm ${
                              activeTab === 'purchase' 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {activeTab === 'purchase' 
                                ? `-₹${totalDebit.toLocaleString()}`
                                : `+₹${totalCredit.toLocaleString()}`}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-sm ${
                              netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{Math.abs(netBalance).toLocaleString()}
                            </span>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 mb-1">
                          {activeTab === 'purchase' 
                            ? 'Purchase Ledger Information'
                            : 'Sales Ledger Information'}
                        </p>
                        <p className="text-xs text-blue-700">
                          {activeTab === 'purchase' 
                            ? `This ledger tracks all purchases made from ${selectedParty.name}. Debit entries represent money owed to the supplier.`
                            : `This ledger tracks all sales made to retailers and parties. Credit entries represent revenue earned.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};