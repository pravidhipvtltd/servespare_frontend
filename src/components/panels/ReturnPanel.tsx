import React, { useState, useEffect } from 'react';
import {
  RotateCcw, Search, Package, AlertCircle, Calendar,
  Clock, User, ShoppingCart, ArrowLeft, Check, X,
  FileText, Shield, Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Bill, CustomerOrder, InventoryItem, Party, Order } from '../../types';

type ReturnType = 'sales' | 'purchase';

interface ReturnItem {
  itemId: string;
  itemName: string;
  quantity: number;
  returnQuantity: number;
  price: number;
  total: number;
  warrantyPeriod?: string;
}

interface ReturnRecord {
  id: string;
  returnNumber: string;
  type: 'sales' | 'purchase';
  referenceId: string;
  referenceNumber: string;
  customerName?: string;
  partyId?: string;
  partyName?: string;
  items: ReturnItem[];
  originalDate: string;
  returnDate: string;
  reason: string;
  refundAmount: number;
  status: 'pending' | 'completed' | 'rejected';
  workspaceId?: string;
  createdAt: string;
  createdBy?: string;
}

const WARRANTY_PERIODS = [
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '12 Months' },
  { value: '18', label: '18 Months' },
  { value: '24', label: '24 Months' },
];

export const ReturnPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ReturnType>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Bill | CustomerOrder | Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [customWarranty, setCustomWarranty] = useState('');
  const [showCustomWarranty, setShowCustomWarranty] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadReturns();
    loadParties();
    loadInventory();
  }, []);

  const loadReturns = () => {
    const allReturns = getFromStorage('returns', []);
    const workspaceReturns = allReturns.filter(
      (r: ReturnRecord) => r.workspaceId === currentUser?.workspaceId
    );
    setReturns(workspaceReturns);
  };

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    const workspaceParties = allParties.filter(
      (p: Party) => p.workspaceId === currentUser?.workspaceId
    );
    setParties(workspaceParties);
  };

  const loadInventory = () => {
    const allInventory = getFromStorage('inventory', []);
    const workspaceInventory = allInventory.filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    setInventory(workspaceInventory);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (activeTab === 'sales') {
      // Search in bills and customer orders
      const allBills = getFromStorage('bills', []);
      const allCustomerOrders = getFromStorage('customerOrders', []);

      const bill = allBills.find(
        (b: Bill) =>
          b.workspaceId === currentUser?.workspaceId &&
          (b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) || b.id === searchQuery)
      );

      if (bill) {
        setFoundOrder(bill);
        setSelectedItems(
          bill.items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            returnQuantity: 0,
            price: item.price,
            total: item.total,
            warrantyPeriod: '',
          }))
        );
        return;
      }

      const order = allCustomerOrders.find(
        (o: CustomerOrder) =>
          o.workspaceId === currentUser?.workspaceId &&
          (o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.id === searchQuery)
      );

      if (order) {
        setFoundOrder(order);
        setSelectedItems(
          order.items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            returnQuantity: 0,
            price: item.price,
            total: item.total,
            warrantyPeriod: '',
          }))
        );
        return;
      }

      alert('Order not found. Please check the order ID or bill number.');
    } else {
      // Search in inventory by product ID or name
      const item = inventory.find(
        (i: InventoryItem) =>
          i.id === searchQuery ||
          i.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (item) {
        setFoundOrder({
          id: item.id,
          items: [
            {
              itemId: item.id,
              itemName: item.name,
              quantity: item.quantity,
              price: item.mrp || item.price,
            },
          ],
        } as any);
        setSelectedItems([
          {
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            returnQuantity: 0,
            price: item.mrp || item.price,
            total: 0,
            warrantyPeriod: '',
          },
        ]);
        return;
      }

      alert('Product not found. Please check the product ID or name.');
    }
  };

  const handleReturnQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.itemId === itemId
          ? { ...item, returnQuantity: Math.min(quantity, item.quantity) }
          : item
      )
    );
  };

  const handleWarrantyChange = (itemId: string, warranty: string) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.itemId === itemId ? { ...item, warrantyPeriod: warranty } : item
      )
    );
  };

  const handleAddCustomWarranty = () => {
    if (customWarranty && parseInt(customWarranty) > 0) {
      // Custom warranty will be handled per item
      setShowCustomWarranty(false);
      setCustomWarranty('');
    }
  };

  const calculateRefundAmount = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.returnQuantity * item.price,
      0
    );
  };

  const handleSubmitReturn = () => {
    const itemsToReturn = selectedItems.filter((item) => item.returnQuantity > 0);

    if (itemsToReturn.length === 0) {
      alert('Please select at least one item to return with quantity > 0');
      return;
    }

    if (!returnReason.trim()) {
      alert('Please provide a reason for the return');
      return;
    }

    if (activeTab === 'purchase' && !selectedParty) {
      alert('Please select a supplier party for purchase return');
      return;
    }

    const returnRecord: ReturnRecord = {
      id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      returnNumber: `RET-${Date.now().toString().slice(-8)}`,
      type: activeTab,
      referenceId: foundOrder?.id || '',
      referenceNumber:
        activeTab === 'sales'
          ? (foundOrder as Bill)?.billNumber || (foundOrder as CustomerOrder)?.orderNumber || ''
          : searchQuery,
      customerName:
        activeTab === 'sales'
          ? (foundOrder as Bill)?.customerName || (foundOrder as CustomerOrder)?.customerName
          : undefined,
      partyId: activeTab === 'purchase' ? selectedParty?.id : undefined,
      partyName: activeTab === 'purchase' ? selectedParty?.name : undefined,
      items: itemsToReturn,
      originalDate: foundOrder?.createdAt || new Date().toISOString(),
      returnDate: new Date().toISOString(),
      reason: returnReason,
      refundAmount: calculateRefundAmount(),
      status: 'completed',
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    // Update inventory
    const updatedInventory = [...inventory];
    itemsToReturn.forEach((returnItem) => {
      const inventoryIndex = updatedInventory.findIndex((i) => i.id === returnItem.itemId);
      if (inventoryIndex !== -1) {
        if (activeTab === 'sales') {
          // Sales return - add back to inventory
          updatedInventory[inventoryIndex].quantity += returnItem.returnQuantity;
        } else {
          // Purchase return - reduce from inventory
          updatedInventory[inventoryIndex].quantity -= returnItem.returnQuantity;
        }
      }
    });

    // Save everything
    const allReturns = getFromStorage('returns', []);
    saveToStorage('returns', [...allReturns, returnRecord]);
    saveToStorage('inventory', updatedInventory);

    // Reset form
    setFoundOrder(null);
    setSelectedItems([]);
    setReturnReason('');
    setSearchQuery('');
    setSelectedParty(null);
    loadReturns();
    loadInventory();

    alert(
      `Return ${returnRecord.returnNumber} submitted successfully! Refund amount: ₹${returnRecord.refundAmount.toLocaleString()}`
    );
  };

  const handleReset = () => {
    setFoundOrder(null);
    setSelectedItems([]);
    setReturnReason('');
    setSearchQuery('');
    setSelectedParty(null);
  };

  const filteredReturns = returns.filter((r) => r.type === activeTab);

  const checkWarrantyStatus = (originalDate: string, warrantyPeriod?: string) => {
    if (!warrantyPeriod) return { status: 'none', message: 'No warranty' };

    const months = parseInt(warrantyPeriod);
    const original = new Date(originalDate);
    const expiryDate = new Date(original);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const now = new Date();
    const isValid = now <= expiryDate;

    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: isValid ? 'valid' : 'expired',
      message: isValid ? `${daysLeft} days left` : 'Expired',
      expiryDate: expiryDate.toLocaleDateString(),
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl text-gray-900">Returns Management</h2>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage sales returns and purchase returns
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => {
              setActiveTab('sales');
              handleReset();
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Sales Return</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('purchase');
              handleReset();
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
              activeTab === 'purchase'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Purchase Return</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-600" />
              <span>
                {activeTab === 'sales'
                  ? 'Search Order/Bill by ID'
                  : 'Search Product by ID or Name'}
              </span>
            </h3>

            <div className="flex space-x-3">
              <input
                type="text"
                placeholder={
                  activeTab === 'sales'
                    ? 'Enter order number or bill number...'
                    : 'Enter product ID, part number, or name...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>

            {/* Supplier Party Selection for Purchase Return */}
            {activeTab === 'purchase' && (
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Select Supplier Party <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedParty?.id || ''}
                  onChange={(e) => {
                    const party = parties.find((p) => p.id === e.target.value);
                    setSelectedParty(party || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a supplier party...</option>
                  {parties
                    .filter((p) => p.type === 'supplier' || p.type === 'distributor' || p.type === 'wholesaler')
                    .map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name} - {party.contactPerson}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Order/Product Details */}
          {foundOrder && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">
                      {activeTab === 'sales' ? 'Order Details' : 'Product Details'}
                    </h3>
                    {activeTab === 'sales' ? (
                      <>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>
                              {(foundOrder as Bill).billNumber ||
                                (foundOrder as CustomerOrder).orderNumber}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>
                              {(foundOrder as Bill).customerName ||
                                (foundOrder as CustomerOrder).customerName}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(foundOrder.createdAt).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">Select items and quantities to return to supplier</p>
                    )}
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6">
                <div className="space-y-4">
                  {selectedItems.map((item) => {
                    const warranty = item.warrantyPeriod
                      ? checkWarrantyStatus(foundOrder.createdAt, item.warrantyPeriod)
                      : null;

                    return (
                      <div
                        key={item.itemId}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-gray-900 mb-1">{item.itemName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Original Qty: {item.quantity}</span>
                              <span>•</span>
                              <span>Price: ₹{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                          {warranty && (
                            <div
                              className={`px-3 py-1 rounded-full text-xs flex items-center space-x-1 ${
                                warranty.status === 'valid'
                                  ? 'bg-green-100 text-green-700'
                                  : warranty.status === 'expired'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Shield className="w-3 h-3" />
                              <span>{warranty.message}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Return Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={item.returnQuantity}
                              onChange={(e) =>
                                handleReturnQuantityChange(
                                  item.itemId,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Warranty Period
                            </label>
                            <div className="flex space-x-2">
                              <select
                                value={item.warrantyPeriod || ''}
                                onChange={(e) =>
                                  handleWarrantyChange(item.itemId, e.target.value)
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">No warranty</option>
                                {WARRANTY_PERIODS.map((period) => (
                                  <option key={period.value} value={period.value}>
                                    {period.label}
                                  </option>
                                ))}
                                <option value="custom">Custom...</option>
                              </select>
                              {item.warrantyPeriod === 'custom' && (
                                <input
                                  type="number"
                                  placeholder="Months"
                                  value={customWarranty}
                                  onChange={(e) => setCustomWarranty(e.target.value)}
                                  onBlur={() => {
                                    if (customWarranty) {
                                      handleWarrantyChange(item.itemId, customWarranty);
                                    }
                                  }}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {item.returnQuantity > 0 && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              Refund Amount: ₹{(item.returnQuantity * item.price).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Return Reason */}
                <div className="mt-6">
                  <label className="block text-sm text-gray-600 mb-2">
                    Return Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Enter the reason for this return..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total Refund */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Refund Amount:</span>
                    <span className="text-2xl text-blue-600">
                      ₹{calculateRefundAmount().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleSubmitReturn}
                    disabled={calculateRefundAmount() === 0}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    <span>Submit Return</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Return History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Return History</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {filteredReturns.length}
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showHistory && (
              <div className="p-6">
                {filteredReturns.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No return records found</p>
                    <p className="text-sm mt-1">
                      {activeTab === 'sales'
                        ? 'Sales returns will appear here'
                        : 'Purchase returns will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReturns
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .map((returnRecord) => (
                        <div
                          key={returnRecord.id}
                          className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-gray-900">{returnRecord.returnNumber}</h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs ${
                                    returnRecord.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : returnRecord.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {returnRecord.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{returnRecord.referenceNumber}</span>
                                </span>
                                {returnRecord.customerName && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <User className="w-4 h-4" />
                                      <span>{returnRecord.customerName}</span>
                                    </span>
                                  </>
                                )}
                                {returnRecord.partyName && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <Package className="w-4 h-4" />
                                      <span>{returnRecord.partyName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-600 text-lg mb-1">
                                ₹{returnRecord.refundAmount.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(returnRecord.returnDate).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Reason:</p>
                            <p className="text-sm text-gray-900">{returnRecord.reason}</p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Items Returned:</p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              {returnRecord.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-gray-900">{item.itemName}</span>
                                    <span className="text-gray-500">×{item.returnQuantity}</span>
                                    {item.warrantyPeriod && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs flex items-center space-x-1">
                                        <Shield className="w-3 h-3" />
                                        <span>{item.warrantyPeriod} months</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-gray-700">
                                    ₹{(item.returnQuantity * item.price).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Original Date:{' '}
                              {new Date(returnRecord.originalDate).toLocaleDateString()}
                            </span>
                            <span>
                              Days Since Purchase:{' '}
                              {Math.ceil(
                                (new Date(returnRecord.returnDate).getTime() -
                                  new Date(returnRecord.originalDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};