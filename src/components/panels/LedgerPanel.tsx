import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Eye, ArrowLeft, Calendar, FileText, TrendingUp, 
  TrendingDown, DollarSign, Package, RotateCcw, Users, Building2, 
  Phone, Mail, ChevronRight, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { getFromStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Party, Bill } from '../../types';

type LedgerType = 'purchase' | 'sales';

interface LedgerEntry {
  partyId: string;
  partyName: string;
  partyEmail?: string;
  partyPhone?: string;
  partyAddress?: string;
  itemsPurchased: number;
  itemsReturned: number;
  grossAmount: number;
  returnAmount: number;
  netAmount: number;
  dueRemaining: number;
}

interface Transaction {
  id: string;
  date: string;
  subject: string;
  type: 'purchase' | 'sales' | 'return' | 'payment' | 'inventory';
  credited: number;
  debited: number;
  netAmount: number;
  balanceAmount: number;
  billNumber?: string;
  paymentStatus?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export const LedgerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<LedgerType>('purchase');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingParty, setViewingParty] = useState<LedgerEntry | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLedgerData();
  }, [activeTab]);

  const loadLedgerData = () => {
    const parties = getFromStorage('parties', [])
      .filter((p: Party) => p.workspaceId === currentUser?.workspaceId);
    const bills = getFromStorage('bills', [])
      .filter((b: Bill) => b.workspaceId === currentUser?.workspaceId);
    const purchaseOrders = getFromStorage('purchaseOrders', [])
      .filter((o: any) => o.workspaceId === currentUser?.workspaceId);
    const salesOrders = getFromStorage('salesOrders', [])
      .filter((o: any) => o.workspaceId === currentUser?.workspaceId);
    const returns = getFromStorage('returns', [])
      .filter((r: any) => r.workspaceId === currentUser?.workspaceId);
    
    // Filter parties by type
    const filteredParties = parties.filter((p: Party) => 
      activeTab === 'purchase' ? p.type === 'supplier' : p.type === 'customer'
    );

    // Calculate ledger entries
    const entries: LedgerEntry[] = filteredParties.map((party: Party) => {
      let itemsPurchased = 0;
      let itemsReturned = 0;
      let grossAmount = 0;
      let returnAmount = 0;
      let paidAmount = 0;

      if (activeTab === 'purchase') {
        // Purchase ledger - supplier transactions from purchase orders only
        const partyOrders = purchaseOrders.filter((o: any) => o.supplierId === party.id);
        partyOrders.forEach((order: any) => {
          const totalItems = order.items?.reduce((sum: number, item: any) => sum + item.orderedQuantity, 0) || 0;
          itemsPurchased += totalItems;
          grossAmount += order.totalAmount || 0;
        });

        // Check for purchase returns (items returned to supplier)
        const partyReturns = returns.filter((r: any) => 
          r.type === 'purchase' && r.partyId === party.id
        );
        partyReturns.forEach((ret: any) => {
          const totalItems = ret.items?.reduce((sum: number, item: any) => sum + item.returnQuantity, 0) || 0;
          itemsReturned += totalItems;
          returnAmount += ret.refundAmount || 0;
        });

        // Calculate paid amount from bills
        const partyBills = bills.filter((b: Bill) => 
          b.customerId === party.id && b.paymentStatus === 'paid' && !b.billNumber?.includes('RET')
        );
        paidAmount = partyBills.reduce((sum: number, b: Bill) => sum + (b.total || 0), 0);
      } else {
        // Sales ledger - customer transactions from bills only
        const partyBills = bills.filter((b: Bill) => b.customerId === party.id && !b.billNumber?.includes('RET'));
        partyBills.forEach((bill: Bill) => {
          const totalItems = bill.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          itemsPurchased += totalItems;
          grossAmount += bill.total || 0;
          if (bill.paymentStatus === 'paid') {
            paidAmount += bill.total || 0;
          }
        });

        // Check for returns from customers
        const partyReturns = bills.filter((b: Bill) => 
          b.customerId === party.id && b.billNumber?.includes('RET')
        );
        partyReturns.forEach((ret: Bill) => {
          const totalItems = ret.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          itemsReturned += totalItems;
          returnAmount += ret.total || 0;
        });
      }

      const netAmount = grossAmount - returnAmount;
      const dueRemaining = netAmount - paidAmount;

      return {
        partyId: party.id,
        partyName: party.name,
        partyEmail: party.email,
        partyPhone: party.phone,
        partyAddress: party.address,
        itemsPurchased,
        itemsReturned,
        grossAmount,
        returnAmount,
        netAmount,
        dueRemaining,
      };
    });

    setLedgerEntries(entries);
  };

  const loadPartyTransactions = (party: LedgerEntry) => {
    const bills = getFromStorage('bills', [])
      .filter((b: Bill) => b.workspaceId === currentUser?.workspaceId);
    const purchaseOrders = getFromStorage('purchaseOrders', [])
      .filter((o: any) => o.workspaceId === currentUser?.workspaceId);
    const salesOrders = getFromStorage('salesOrders', [])
      .filter((o: any) => o.workspaceId === currentUser?.workspaceId);
    const returns = getFromStorage('returns', [])
      .filter((r: any) => r.workspaceId === currentUser?.workspaceId);

    const txns: Transaction[] = [];
    let runningBalance = 0;

    if (activeTab === 'purchase') {
      // Purchase transactions for this supplier
      const partyOrders = purchaseOrders
        .filter((o: any) => o.supplierId === party.partyId)
        .sort((a: any, b: any) => new Date(a.createdAt || a.orderDate).getTime() - new Date(b.createdAt || b.orderDate).getTime());

      partyOrders.forEach((order: any) => {
        const totalAmount = order.totalAmount || 0;
        runningBalance += totalAmount;
        
        // Map Purchase Order items to match Transaction interface
        const mappedItems = (order.items || []).map((item: any) => ({
          name: item.itemName || item.name || 'Unknown Item',
          quantity: item.orderedQuantity || item.quantity || 0,
          price: item.unitPrice || item.price || 0,
          total: item.totalAmount || item.total || 0,
        }));
        
        txns.push({
          id: order.id,
          date: order.createdAt || order.orderDate,
          subject: `Purchase Order #${order.poNumber}`,
          type: 'purchase',
          credited: 0,
          debited: totalAmount,
          netAmount: totalAmount,
          balanceAmount: runningBalance,
          billNumber: order.poNumber,
          paymentStatus: order.status,
          items: mappedItems,
        });
      });

      // Returns to supplier
      const partyReturns = returns
        .filter((r: any) => r.type === 'purchase' && r.partyId === party.partyId)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      partyReturns.forEach((ret: any) => {
        runningBalance -= ret.refundAmount || 0;
        
        // Map return items to match Transaction interface
        const mappedItems = (ret.items || []).map((item: any) => ({
          name: item.itemName || 'Unknown Item',
          quantity: item.returnQuantity || 0,
          price: item.price || 0,
          total: (item.returnQuantity || 0) * (item.price || 0),
        }));
        
        txns.push({
          id: ret.id,
          date: ret.createdAt,
          subject: `Purchase Return #${ret.returnNumber}`,
          type: 'return',
          credited: ret.refundAmount || 0,
          debited: 0,
          netAmount: -(ret.refundAmount || 0),
          balanceAmount: runningBalance,
          billNumber: ret.returnNumber,
          items: mappedItems,
        });
      });

      // Payments made
      const payments = bills
        .filter((b: Bill) => b.customerId === party.partyId && b.paymentStatus === 'paid' && !b.billNumber?.includes('RET'))
        .sort((a: Bill, b: Bill) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      payments.forEach((payment: Bill) => {
        runningBalance -= payment.total || 0;
        txns.push({
          id: payment.id,
          date: payment.createdAt,
          subject: `Payment Bill #${payment.billNumber}`,
          type: 'payment',
          credited: payment.total || 0,
          debited: 0,
          netAmount: -(payment.total || 0),
          balanceAmount: runningBalance,
          billNumber: payment.billNumber,
          items: payment.items || [],
        });
      });
    } else {
      // Sales transactions for this customer - from bills only
      const partyBills = bills
        .filter((b: Bill) => b.customerId === party.partyId && !b.billNumber?.includes('RET'))
        .sort((a: Bill, b: Bill) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      partyBills.forEach((bill: Bill) => {
        runningBalance += bill.total || 0;
        txns.push({
          id: bill.id,
          date: bill.createdAt,
          subject: `Sales Bill #${bill.billNumber}`,
          type: 'sales',
          credited: 0,
          debited: bill.total || 0,
          netAmount: bill.total || 0,
          balanceAmount: runningBalance,
          billNumber: bill.billNumber,
          paymentStatus: bill.paymentStatus,
          items: bill.items || [],
        });
      });

      // Returns from customer
      const partyReturns = bills
        .filter((b: Bill) => b.customerId === party.partyId && b.billNumber?.includes('RET'))
        .sort((a: Bill, b: Bill) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      partyReturns.forEach((ret: Bill) => {
        runningBalance -= ret.total || 0;
        txns.push({
          id: ret.id,
          date: ret.createdAt,
          subject: `Product Return #${ret.billNumber}`,
          type: 'return',
          credited: ret.total || 0,
          debited: 0,
          netAmount: -(ret.total || 0),
          balanceAmount: runningBalance,
          billNumber: ret.billNumber,
          items: ret.items || [],
        });
      });
    }

    // Sort all transactions by date
    txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Recalculate running balance
    let balance = 0;
    txns.forEach(txn => {
      balance += txn.netAmount;
      txn.balanceAmount = balance;
    });

    setTransactions(txns);
    setViewingParty(party);
  };

  const filteredEntries = ledgerEntries.filter(entry =>
    entry.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.partyEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStats = {
    totalParties: filteredEntries.length,
    totalGross: filteredEntries.reduce((sum, e) => sum + e.grossAmount, 0),
    totalReturns: filteredEntries.reduce((sum, e) => sum + e.returnAmount, 0),
    totalNet: filteredEntries.reduce((sum, e) => sum + e.netAmount, 0),
    totalDue: filteredEntries.reduce((sum, e) => sum + e.dueRemaining, 0),
  };

  return (
    <div className="space-y-6">
      {!viewingParty ? (
        <>
          {/* Header */}
          <div>
            <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span>Ledger Management</span>
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Track all financial transactions with {activeTab === 'purchase' ? 'suppliers' : 'customers'}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-1 inline-flex">
            <button
              onClick={() => setActiveTab('purchase')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                activeTab === 'purchase'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5" />
                <span>Purchase Ledger</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                activeTab === 'sales'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Sales Ledger</span>
              </div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`${activeTab === 'purchase' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className={`${activeTab === 'purchase' ? 'text-blue-100' : 'text-green-100'} text-xs`}>
                    {activeTab === 'purchase' ? 'Total Suppliers' : 'Total Customers'}
                  </p>
                  <p className="text-2xl font-bold">{totalStats.totalParties}</p>
                </div>
              </div>
            </div>

            <div className={`${activeTab === 'purchase' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className={`${activeTab === 'purchase' ? 'text-purple-100' : 'text-teal-100'} text-xs`}>Gross Amount</p>
                  <p className="text-2xl font-bold">रू{totalStats.totalGross.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <RotateCcw className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-orange-100 text-xs">Return Amount</p>
                  <p className="text-2xl font-bold">रू{totalStats.totalReturns.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className={`${activeTab === 'purchase' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className={`${activeTab === 'purchase' ? 'text-indigo-100' : 'text-emerald-100'} text-xs`}>Net Amount</p>
                  <p className="text-2xl font-bold">रू{totalStats.totalNet.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-red-100 text-xs">Due Remaining</p>
                  <p className="text-2xl font-bold">रू{totalStats.totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'purchase' ? 'supplier' : 'customer'} name or email...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 text-xl mb-2">No Ledger Entries</h3>
                <p className="text-gray-500">
                  No transactions found for {activeTab === 'purchase' ? 'suppliers' : 'customers'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-900">S.N</th>
                      <th className="px-6 py-4 text-left text-gray-900">
                        {activeTab === 'purchase' ? 'Supplier Name' : 'Customer Name'}
                      </th>
                      <th className="px-6 py-4 text-left text-gray-900">Items Purchased</th>
                      <th className="px-6 py-4 text-left text-gray-900">Items Returned</th>
                      <th className="px-6 py-4 text-left text-gray-900">Gross Amount</th>
                      <th className="px-6 py-4 text-left text-gray-900">Return Amount</th>
                      <th className="px-6 py-4 text-left text-gray-900">Net Amount</th>
                      <th className="px-6 py-4 text-left text-gray-900">Due Remaining</th>
                      <th className="px-6 py-4 text-left text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEntries.map((entry, index) => (
                      <tr key={entry.partyId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{entry.partyName}</p>
                            {entry.partyEmail && (
                              <p className="text-sm text-gray-500">{entry.partyEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                            {entry.itemsPurchased}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold">
                            {entry.itemsReturned}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 font-semibold">
                            रू{entry.grossAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-red-600 font-semibold">
                            रू{entry.returnAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 font-semibold">
                            रू{entry.netAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${entry.dueRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            रू{entry.dueRemaining.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => loadPartyTransactions(entry)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Detailed Party View */}
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                setViewingParty(null);
                setTransactions([]);
                setDateRange({ startDate: '', endDate: '' });
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to {activeTab === 'purchase' ? 'Purchase' : 'Sales'} Ledger</span>
            </button>

            {/* Party Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{viewingParty.partyName}</h3>
                    <div className="space-y-1 text-blue-100">
                      {viewingParty.partyEmail && (
                        <p className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{viewingParty.partyEmail}</span>
                        </p>
                      )}
                      {viewingParty.partyPhone && (
                        <p className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{viewingParty.partyPhone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  <div>
                    <p className="text-blue-100 text-sm">Items Purchased</p>
                    <p className="text-3xl font-bold">{viewingParty.itemsPurchased}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Items Returned</p>
                    <p className="text-3xl font-bold">{viewingParty.itemsReturned}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Gross Amount</p>
                    <p className="text-2xl font-bold">रू{viewingParty.grossAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Net Amount</p>
                    <p className="text-2xl font-bold">रू{viewingParty.netAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Filter by Date
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 text-xl mb-2">No Transactions</h3>
                  <p className="text-gray-500">
                    No transaction history found for this {activeTab === 'purchase' ? 'supplier' : 'customer'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-900">S.N</th>
                        <th className="px-6 py-4 text-left text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-gray-900">Subject</th>
                        <th className="px-6 py-4 text-left text-gray-900">Credited</th>
                        <th className="px-6 py-4 text-left text-gray-900">Debited</th>
                        <th className="px-6 py-4 text-left text-gray-900">Net Amount</th>
                        <th className="px-6 py-4 text-left text-gray-900">Balance Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((txn, index) => (
                        <React.Fragment key={txn.id}>
                          <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedTxn(expandedTxn === txn.id ? null : txn.id)}>
                            <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  {new Date(txn.date).toLocaleDateString('en-NP')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-gray-900">{txn.subject}</p>
                                  {txn.billNumber && (
                                    <p className="text-sm text-gray-500 font-mono">{txn.billNumber}</p>
                                  )}
                                  {txn.items && txn.items.length > 0 && (
                                    <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                                      <Package className="w-3 h-3" />
                                      <span>{txn.items.length} item(s) - Click to view details</span>
                                    </p>
                                  )}
                                </div>
                                {txn.items && txn.items.length > 0 && (
                                  <div>
                                    {expandedTxn === txn.id ? (
                                      <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {txn.credited > 0 ? (
                                <span className="text-green-600 font-semibold">
                                  रू{txn.credited.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {txn.debited > 0 ? (
                                <span className="text-red-600 font-semibold">
                                  रू{txn.debited.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${txn.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                रू{txn.netAmount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">
                                रू{txn.balanceAmount.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Expandable Item Details Row */}
                          {expandedTxn === txn.id && txn.items && txn.items.length > 0 && (
                            <tr className="bg-blue-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">Item Details</h4>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs text-gray-700">Item Name</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-700">Quantity</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-700">Unit Price</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-700">Total Price</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {txn.items.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                            <td className="px-4 py-2">
                                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                                                {item.quantity}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">रू{item.price.toLocaleString()}</td>
                                            <td className="px-4 py-2 font-semibold text-blue-600">रू{item.total.toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-gray-50 font-semibold">
                                        <tr>
                                          <td colSpan={3} className="px-4 py-2 text-right text-gray-900">Total Amount:</td>
                                          <td className="px-4 py-2 text-blue-600">
                                            रू{txn.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                          Final Balance:
                        </td>
                        <td colSpan={4} className="px-6 py-4">
                          <span className={`text-xl font-bold ${
                            transactions[transactions.length - 1]?.balanceAmount >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            रू{transactions[transactions.length - 1]?.balanceAmount.toLocaleString() || '0'}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};