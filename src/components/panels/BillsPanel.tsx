import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, Clock, CheckCircle, Eye, Download, ChevronLeft, ChevronRight, Filter, Calendar, Edit2, Trash2, FileEdit } from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Bill, Party } from '../../types';
import { BillCreationPanel } from './BillCreationPanel';
import { Pagination } from '../common/Pagination';

type BillStatus = 'pending' | 'paid' | 'draft';

export const BillsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [activeTab, setActiveTab] = useState<BillStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const itemsPerPage = 20;

  useEffect(() => {
    loadBills();
    loadParties();
  }, []);

  const loadBills = () => {
    const allBills = getFromStorage('bills', []);
    setBills(allBills.filter((b: Bill) => b.workspaceId === currentUser?.workspaceId));
  };

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    setParties(allParties.filter((p: Party) => p.workspaceId === currentUser?.workspaceId));
  };

  const getPartyName = (customerId?: string) => {
    if (!customerId) return 'Walk-in Customer';
    const party = parties.find(p => p.id === customerId);
    return party?.name || 'Unknown';
  };

  const handleMarkAsPaid = (billId: string) => {
    if (confirm('Mark this bill as paid?')) {
      const allBills = getFromStorage('bills', []);
      const updated = allBills.map((b: Bill) =>
        b.id === billId ? { ...b, paymentStatus: 'paid', paidAt: new Date().toISOString() } : b
      );
      saveToStorage('bills', updated);
      loadBills();
    }
  };

  const handleDeleteDraft = (billId: string) => {
    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      const allBills = getFromStorage('bills', []);
      const updated = allBills.filter((b: Bill) => b.id !== billId);
      saveToStorage('bills', updated);
      setSelectedBills([]);
      loadBills();
    }
  };

  const handleBulkDelete = () => {
    if (selectedBills.length === 0) {
      alert('Please select bills to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedBills.length} bill(s)?`)) {
      const allBills = getFromStorage('bills', []);
      const updated = allBills.filter((b: Bill) => !selectedBills.includes(b.id));
      saveToStorage('bills', updated);
      setSelectedBills([]);
      loadBills();
    }
  };

  const toggleSelectAll = () => {
    if (selectedBills.length === currentBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(currentBills.map(b => b.id));
    }
  };

  const toggleSelectBill = (id: string) => {
    setSelectedBills(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const filteredData = filteredBills;
    const csvContent = [
      ['Order ID', 'Bill Number', 'Customer', 'Phone', 'Total Amount', 'Payment Method', 'Status', 'Date'],
      ...filteredData.map(b => [
        b.id,
        b.billNumber,
        b.customerName,
        b.customerPhone || '',
        b.total.toString(),
        b.paymentMethod,
        b.paymentStatus || 'pending',
        new Date(b.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter bills based on tab and search
  const filteredBills = bills.filter(bill => {
    const status = bill.paymentStatus || 'pending';
    const matchesTab = status === activeTab;
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.customerPhone && bill.customerPhone.includes(searchQuery));
    return matchesTab && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = filteredBills.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs or search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Stats
  const pendingBills = bills.filter(b => b.paymentStatus === 'pending');
  const paidBills = bills.filter(b => b.paymentStatus === 'paid');
  const draftBills = bills.filter(b => b.paymentStatus === 'draft');
  const totalPendingAmount = pendingBills.reduce((sum, b) => sum + b.total, 0);
  const totalPaidAmount = paidBills.reduce((sum, b) => sum + b.total, 0);

  // If editing a bill, show the bill creation panel
  if (editingBill) {
    return (
      <BillCreationPanel
        editingBill={editingBill}
        onSave={() => {
          setEditingBill(null);
          loadBills();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Bills</p>
              <p className="text-3xl mb-1">{bills.length}</p>
              <p className="text-blue-100 text-xs">All transactions</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Pending Bills</p>
              <p className="text-3xl mb-1">{pendingBills.length}</p>
              <p className="text-orange-100 text-xs">₹{totalPendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Paid Bills</p>
              <p className="text-3xl mb-1">{paidBills.length}</p>
              <p className="text-green-100 text-xs">₹{totalPaidAmount.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Draft Bills</p>
              <p className="text-3xl mb-1">{draftBills.length}</p>
              <p className="text-purple-100 text-xs">Unsaved drafts</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileEdit className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white bg-opacity-20' : 'bg-orange-100 text-orange-700'
              }`}>
                {pendingBills.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'paid'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Paid</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'paid' ? 'bg-white bg-opacity-20' : 'bg-green-100 text-green-700'
              }`}>
                {paidBills.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'draft'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileEdit className="w-4 h-4" />
              <span>Drafts</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'draft' ? 'bg-white bg-opacity-20' : 'bg-purple-100 text-purple-700'
              }`}>
                {draftBills.length}
              </span>
            </div>
          </button>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, bill number, customer name, or phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Bulk Delete Button */}
            {selectedBills.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete ({selectedBills.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Bills Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedBills.length === currentBills.length && currentBills.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Order ID</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Bill Number</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Customer Details</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Items</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Amount</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Payment Method</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Date</th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {activeTab} bills found</p>
                  </td>
                </tr>
              ) : (
                currentBills.map((bill, index) => (
                  <tr 
                    key={bill.id} 
                    className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => toggleSelectBill(bill.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-mono text-sm">#{bill.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-blue-600">{bill.billNumber}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900">{bill.customerName}</div>
                        {bill.customerPhone && (
                          <div className="text-gray-500 text-sm">{bill.customerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">{bill.items.length} items</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900">₹{bill.total.toLocaleString()}</div>
                        <div className="text-gray-500 text-xs">
                          {bill.tax > 0 && `Tax: ${bill.tax}%`}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        bill.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                        bill.paymentMethod === 'bank' ? 'bg-blue-100 text-blue-700' :
                        bill.paymentMethod === 'esewa' ? 'bg-purple-100 text-purple-700' :
                        bill.paymentMethod === 'fonepay' ? 'bg-indigo-100 text-indigo-700' :
                        bill.paymentMethod === 'credit' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {bill.paymentMethod === 'esewa' ? 'eSewa' :
                         bill.paymentMethod === 'fonepay' ? 'FonePay' :
                         bill.paymentMethod.charAt(0).toUpperCase() + bill.paymentMethod.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-sm">
                        {new Date(bill.createdAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(bill.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setViewingBill(bill)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {activeTab === 'pending' && (
                          <button 
                            onClick={() => handleMarkAsPaid(bill.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {activeTab === 'draft' && (
                          <>
                            <button 
                              onClick={() => setEditingBill(bill)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit Draft"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDraft(bill.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBills.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* View Bill Details Modal */}
      {viewingBill && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setViewingBill(null)}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">Bill Details</h3>
                  <p className="text-blue-100 text-sm mt-1">{viewingBill.billNumber}</p>
                </div>
                <button
                  onClick={() => setViewingBill(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Order ID</p>
                    <p className="text-gray-900 font-mono">#{viewingBill.id.slice(0, 8)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm ${
                    viewingBill.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : viewingBill.paymentStatus === 'draft'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {viewingBill.paymentStatus === 'paid' ? 'Paid' : 
                     viewingBill.paymentStatus === 'draft' ? 'Draft' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Customer Name</p>
                    <p className="text-gray-900">{viewingBill.customerName}</p>
                  </div>
                  {viewingBill.customerPhone && (
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="text-gray-900">{viewingBill.customerPhone}</p>
                    </div>
                  )}
                  {viewingBill.customerAddress && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-sm">Address</p>
                      <p className="text-gray-900">{viewingBill.customerAddress}</p>
                    </div>
                  )}
                  {viewingBill.customerPanVat && (
                    <div>
                      <p className="text-gray-500 text-sm">PAN/VAT</p>
                      <p className="text-gray-900">{viewingBill.customerPanVat}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <p className="text-gray-900 uppercase">{viewingBill.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date & Time</p>
                    <p className="text-gray-900 text-sm">
                      {new Date(viewingBill.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-gray-900 mb-3">Items</h4>
                <div className="space-y-2">
                  {viewingBill.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900">{item.itemName}</p>
                        <p className="text-gray-500 text-sm">
                          {item.quantity || 0} × ₹{(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-900">₹{(item.total || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{viewingBill.subtotal.toLocaleString()}</span>
                </div>
                {viewingBill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount {viewingBill.discountType === 'percentage' ? `(${viewingBill.discount}%)` : ''}
                    </span>
                    <span>
                      -₹{(viewingBill.discountType === 'percentage' 
                        ? (viewingBill.subtotal * viewingBill.discount) / 100 
                        : viewingBill.discount
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                {viewingBill.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({viewingBill.tax}%)</span>
                    <span>
                      ₹{(
                        ((viewingBill.subtotal - 
                          (viewingBill.discountType === 'percentage' 
                            ? (viewingBill.subtotal * viewingBill.discount) / 100 
                            : viewingBill.discount)) * viewingBill.tax) / 100
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-900 text-lg">
                  <span>Total</span>
                  <span>₹{viewingBill.total.toLocaleString()}</span>
                </div>
              </div>

              {viewingBill.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-gray-900">{viewingBill.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {viewingBill.paymentStatus === 'draft' && (
                  <button
                    onClick={() => {
                      setViewingBill(null);
                      setEditingBill(viewingBill);
                    }}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Edit Draft</span>
                  </button>
                )}
                {viewingBill.paymentStatus === 'pending' && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(viewingBill.id);
                      setViewingBill(null);
                    }}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark as Paid</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};