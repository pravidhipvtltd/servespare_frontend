import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Calendar, DollarSign, User, FileText, Eye, Edit, Trash2, Plus, X, 
  CheckCircle, Clock, XCircle, Search, TrendingUp, AlertCircle, Truck, ArrowRight, 
  ArrowDownRight, ArrowUpRight, Tag, Percent
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { OrderCreationPanel } from './OrderCreationPanel';

type OrderType = 'purchase' | 'sales';
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'received';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  partyId: string;
  partyName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  expectedDeliveryDate?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; icon: any; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle, label: 'Confirmed' },
  shipped: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Delivered' },
  received: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Received' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Cancelled' },
};

export const OrderManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderType>('purchase');
  const [orders, setOrders] = useState<Order[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showNewOrderPanel, setShowNewOrderPanel] = useState(false); // New modern panel
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    partyId: '',
    items: [] as OrderItem[],
    status: 'pending' as OrderStatus,
    paymentMethod: 'cash',
    notes: '',
    expectedDeliveryDate: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    taxRate: 13,
    applyTax: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const purchaseOrders = getFromStorage('purchaseOrders', []);
    const salesOrders = getFromStorage('salesOrders', []);
    const allOrders = [...purchaseOrders, ...salesOrders];
    setOrders(allOrders);
    setParties(getFromStorage('parties', []));
    setInventory(getFromStorage('inventory', []));
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), name: '', quantity: 1, price: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    
    if (field === 'productId') {
      const product = inventory.find(p => p.id === value);
      if (product) {
        newItems[index].id = product.id;
        newItems[index].name = product.name;
        newItems[index].price = product.price;
        newItems[index].total = product.price * newItems[index].quantity;
      }
    } else if (field === 'quantity' || field === 'price') {
      newItems[index][field] = field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0;
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = formData.discountType === 'percentage' 
      ? subtotal * (formData.discount / 100) 
      : formData.discount;
    const taxableAmount = subtotal - discountAmount;
    const tax = formData.applyTax ? taxableAmount * (formData.taxRate / 100) : 0;
    const total = taxableAmount + tax;
    return { subtotal, discount: discountAmount, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const { subtotal, discount, tax, total } = calculateTotals();
    const party = parties.find(p => p.id === formData.partyId);
    
    const newOrder: Order = {
      id: editingOrder?.id || Date.now().toString(),
      orderNumber: editingOrder?.orderNumber || `ORD-${Date.now()}`,
      type: activeTab,
      partyId: formData.partyId,
      partyName: party?.name || 'Unknown',
      items: formData.items,
      subtotal,
      tax,
      discount,
      total,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedDeliveryDate: formData.expectedDeliveryDate,
    };

    const storageKey = activeTab === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const existingOrders = getFromStorage(storageKey, []);

    if (editingOrder) {
      const updatedOrders = existingOrders.map((o: Order) =>
        o.id === editingOrder.id ? newOrder : o
      );
      saveToStorage(storageKey, updatedOrders);
    } else {
      saveToStorage(storageKey, [...existingOrders, newOrder]);
    }

    loadData();
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
    setFormData({
      partyId: '',
      items: [],
      status: 'pending',
      paymentMethod: 'cash',
      notes: '',
      expectedDeliveryDate: '',
      discount: 0,
      discountType: 'percentage',
      taxRate: 13,
      applyTax: true,
    });
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setActiveTab(order.type);
    setFormData({
      partyId: order.partyId,
      items: order.items,
      status: order.status,
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes || '',
      expectedDeliveryDate: order.expectedDeliveryDate || '',
      discount: order.discount,
      discountType: 'percentage',
      taxRate: 13,
      applyTax: true,
    });
    setShowOrderForm(true);
  };

  const handleDelete = (orderId: string, orderType: OrderType) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const storageKey = orderType === 'purchase' ? 'purchaseOrders' : 'salesOrders';
      const existingOrders = getFromStorage(storageKey, []);
      const updatedOrders = existingOrders.filter((o: Order) => o.id !== orderId);
      saveToStorage(storageKey, updatedOrders);
      loadData();
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = order.type === activeTab;
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.partyName && order.partyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    completed: filteredOrders.filter(o => o.status === 'delivered' || o.status === 'received').length,
    totalValue: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Show OrderCreationPanel if active */}
      {showNewOrderPanel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <OrderCreationPanel />
          <button
            onClick={() => {
              setShowNewOrderPanel(false);
              loadData(); // Reload data after creating order
            }}
            className="fixed top-6 right-6 z-[60] p-3 bg-white text-gray-900 rounded-xl shadow-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl">Order Management</h3>
          <p className="text-gray-500 text-sm mt-1">Manage purchase and sales orders efficiently</p>
        </div>
        <button
          onClick={() => setShowNewOrderPanel(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'purchase'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ArrowDownRight className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm opacity-80">Purchase Orders</div>
              <div className="text-xs opacity-60">From Suppliers</div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'sales'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ArrowUpRight className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm opacity-80">Sales Orders</div>
              <div className="text-xs opacity-60">To Customers</div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Total Orders</div>
          <div className="text-gray-900 text-4xl">{stats.total}</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Pending</div>
          <div className="text-gray-900 text-4xl">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Completed</div>
          <div className="text-gray-900 text-4xl">{stats.completed}</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-2">Total Value</div>
          <div className="text-gray-900 text-4xl">₹{(stats.totalValue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or party name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left text-gray-700 py-4 px-6">Order Details</th>
                <th className="text-left text-gray-700 py-4 px-6">Party</th>
                <th className="text-left text-gray-700 py-4 px-6">Items</th>
                <th className="text-left text-gray-700 py-4 px-6">Amount</th>
                <th className="text-left text-gray-700 py-4 px-6">Status</th>
                <th className="text-left text-gray-700 py-4 px-6">Date</th>
                <th className="text-left text-gray-700 py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 text-xl mb-2">No Orders Found</h3>
                    <p className="text-gray-500 mb-6">Create your first order to get started</p>
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      Create Order
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{order.orderNumber}</div>
                        {order.expectedDeliveryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{order.partyName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{order.items.length} items</div>
                        <div className="text-xs text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">₹{order.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{order.paymentMethod || 'Cash'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm border ${STATUS_CONFIG[order.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{STATUS_CONFIG[order.status].label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id, order.type)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1">Order Details</h3>
                  <p className="text-blue-100 text-sm">{viewingOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 text-sm mb-1">Order Type</div>
                  <div className="text-gray-900 capitalize flex items-center space-x-2">
                    {viewingOrder.type === 'purchase' ? (
                      <><ArrowDownRight className="w-5 h-5 text-green-600" /> <span>Purchase</span></>
                    ) : (
                      <><ArrowUpRight className="w-5 h-5 text-blue-600" /> <span>Sales</span></>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 text-sm mb-1">Status</div>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm border ${STATUS_CONFIG[viewingOrder.status].color}`}>
                    {React.createElement(STATUS_CONFIG[viewingOrder.status].icon, { className: "w-4 h-4" })}
                    <span>{STATUS_CONFIG[viewingOrder.status].label}</span>
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <div className="text-gray-500 text-sm mb-1">Party</div>
                  <div className="text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{viewingOrder.partyName}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 text-sm mb-1">Order Date</div>
                  <div className="text-gray-900">{new Date(viewingOrder.createdAt).toLocaleDateString()}</div>
                </div>

                {viewingOrder.expectedDeliveryDate && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-gray-500 text-sm mb-1">Expected Delivery</div>
                    <div className="text-gray-900">{new Date(viewingOrder.expectedDeliveryDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-gray-900 text-lg mb-4">Order Items</h4>
                <div className="space-y-3">
                  {viewingOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.quantity} × ₹{item.price.toLocaleString()} = ₹{item.total.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-gray-900 text-xl">₹{item.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="text-lg">₹{viewingOrder.subtotal.toLocaleString()}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-₹{viewingOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (13%)</span>
                  <span>+₹{viewingOrder.tax.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-3 flex justify-between text-gray-900">
                  <span className="text-xl">Total Amount</span>
                  <span className="text-2xl">₹{viewingOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="text-gray-700 text-sm mb-1">Notes</div>
                  <div className="text-gray-900">{viewingOrder.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1">{editingOrder ? 'Edit Order' : 'Create New Order'}</h3>
                  <p className="text-green-100 text-sm">
                    {activeTab === 'purchase' ? '📦 Purchase Order (From Supplier)' : '🛍️ Sales Order (To Customer)'}
                  </p>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Party Selection */}
              <div>
                <label className="block text-gray-700 mb-2">
                  {activeTab === 'purchase' ? '🏭 Supplier' : '👤 Customer'} *
                </label>
                <select
                  required
                  value={formData.partyId}
                  onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Select {activeTab === 'purchase' ? 'Supplier' : 'Customer'}</option>
                  {parties
                    .filter(p => activeTab === 'purchase' ? p.type === 'supplier' : p.type === 'customer')
                    .map(party => (
                      <option key={party.id} value={party.id}>{party.name}</option>
                    ))}
                </select>
              </div>

              {/* Order Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-700">📦 Order Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-12 gap-4 items-start">
                        {/* Product Selection */}
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-gray-600 text-sm mb-2">Product</label>
                          <select
                            required
                            value={item.id}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Product</option>
                            {inventory.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.quantity})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-gray-600 text-sm mb-2">Qty</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        {/* Price */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-gray-600 text-sm mb-2">Price</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        {/* Total */}
                        <div className="col-span-10 md:col-span-2">
                          <label className="block text-gray-600 text-sm mb-2">Total</label>
                          <div className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                            ₹{item.total.toLocaleString()}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-2 md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all w-full"
                          >
                            <Trash2 className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.items.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No items added yet. Click "Add Item" to begin.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              {formData.items.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 space-y-4">
                  <h4 className="text-gray-900 text-lg flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>Order Summary</span>
                  </h4>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Subtotal</span>
                    <span className="text-xl">₹{calculateTotals().subtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-gray-700 flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span>Discount</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                            formData.discountType === 'percentage'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-600 border-2 border-gray-300'
                          }`}
                        >
                          <Percent className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                            formData.discountType === 'fixed'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-600 border-2 border-gray-300'
                          }`}
                        >
                          ₹
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount || ''}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        placeholder={formData.discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {formData.discount > 0 && (
                        <div className="text-red-600">-₹{calculateTotals().discount.toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.applyTax}
                          onChange={(e) => setFormData({ ...formData, applyTax: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700">Apply Tax</span>
                      </label>
                      {formData.applyTax && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.taxRate || ''}
                          onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                          placeholder="Rate %"
                          className="w-20 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                        />
                      )}
                    </div>
                    {formData.applyTax && (
                      <div className="flex justify-between text-green-600">
                        <span>Tax ({formData.taxRate}%)</span>
                        <span>+₹{calculateTotals().tax.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-blue-400 pt-4 flex justify-between items-center">
                    <span className="text-gray-900 text-xl">Grand Total</span>
                    <span className="text-3xl text-blue-600">₹{calculateTotals().total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="esewa">eSewa</option>
                    <option value="fonepay">FonePay</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.items.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};