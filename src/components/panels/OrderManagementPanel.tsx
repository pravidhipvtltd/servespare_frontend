import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Calendar, DollarSign, User, FileText, Eye, Edit, Trash2, Plus, X, 
  CheckCircle, Clock, XCircle, Search, TrendingUp, AlertCircle, Truck, ArrowRight, 
  ArrowDownRight, ArrowUpRight, Tag, Percent, Info, AlertTriangle, Check
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { PopupContainer } from '../PopupContainer';
import { useCustomPopup } from '../../hooks/useCustomPopup';

type OrderType = 'purchase' | 'sales';
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

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
  workspaceId?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; icon: any; label: string; description: string }> = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
    icon: Clock, 
    label: 'Pending', 
    description: 'Order created, awaiting confirmation'
  },
  confirmed: { 
    color: 'bg-blue-100 text-blue-700 border-blue-300', 
    icon: CheckCircle, 
    label: 'Confirmed', 
    description: 'Order confirmed, ready for processing'
  },
  processing: { 
    color: 'bg-purple-100 text-purple-700 border-purple-300', 
    icon: Package, 
    label: 'Processing', 
    description: 'Order is being prepared'
  },
  shipped: { 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300', 
    icon: Truck, 
    label: 'Shipped', 
    description: 'Order dispatched for delivery'
  },
  delivered: { 
    color: 'bg-teal-100 text-teal-700 border-teal-300', 
    icon: CheckCircle, 
    label: 'Delivered', 
    description: 'Order delivered to customer/received from supplier'
  },
  completed: { 
    color: 'bg-green-100 text-green-700 border-green-300', 
    icon: CheckCircle, 
    label: 'Completed', 
    description: 'Order fulfilled successfully'
  },
  cancelled: { 
    color: 'bg-red-100 text-red-700 border-red-300', 
    icon: XCircle, 
    label: 'Cancelled', 
    description: 'Order cancelled'
  },
};

export const OrderManagementPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [activeTab, setActiveTab] = useState<OrderType>('purchase');
  const [orders, setOrders] = useState<Order[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showProcessGuide, setShowProcessGuide] = useState(false);
  
  // New states for searchable dropdown
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  // Alert dialog states - removed, using custom popup system

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

  // Show alert helper - removed, using custom popup system

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.party-dropdown-container')) {
        setShowPartyDropdown(false);
      }
    };

    if (showPartyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPartyDropdown]);

  const loadData = () => {
    const purchaseOrders = getFromStorage('purchaseOrders', [])
      .filter((o: Order) => o.workspaceId === currentUser?.workspaceId);
    const salesOrders = getFromStorage('salesOrders', [])
      .filter((o: Order) => o.workspaceId === currentUser?.workspaceId);
    const allOrders = [...purchaseOrders, ...salesOrders];
    setOrders(allOrders);
    setParties(getFromStorage('parties', []).filter((p: any) => p.workspaceId === currentUser?.workspaceId));
    setInventory(getFromStorage('inventory', []).filter((i: any) => i.workspaceId === currentUser?.workspaceId));
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), name: '', quantity: 0, price: 0, total: 0 }],
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
    } else if (field === 'quantity') {
      // Allow empty string, otherwise convert to number
      const numValue = value === '' ? 0 : parseInt(value) || 0;
      newItems[index].quantity = numValue;
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    } else if (field === 'price') {
      newItems[index].price = parseFloat(value) || 0;
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
      popup.showError('Please add at least one item to the order', 'Validation Error');
      return;
    }

    if (!formData.partyId) {
      popup.showError('Please select a party (customer/supplier) to continue.', 'Party Required');
      return;
    }

    const { subtotal, discount, tax, total } = calculateTotals();
    const party = parties.find(p => p.id === formData.partyId);
    
    const newOrder: Order = {
      id: editingOrder?.id || `ord_${Date.now()}`,
      orderNumber: editingOrder?.orderNumber || `${activeTab === 'purchase' ? 'PO' : 'SO'}-${Date.now().toString().slice(-6)}`,
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
      workspaceId: currentUser?.workspaceId,
    };

    const storageKey = activeTab === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const existingOrders = getFromStorage(storageKey, []);

    if (editingOrder) {
      const updatedOrders = existingOrders.map((o: Order) =>
        o.id === editingOrder.id ? newOrder : o
      );
      saveToStorage(storageKey, updatedOrders);
      popup.showSuccess(`Order ${newOrder.orderNumber} has been updated successfully!`, 'Order Updated');
    } else {
      saveToStorage(storageKey, [...existingOrders, newOrder]);
      popup.showSuccess(`Order ${newOrder.orderNumber} has been created successfully!`, 'Order Created');
    }

    loadData();
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
    setPartySearchQuery('');
    setShowPartyDropdown(false);
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
    setPartySearchQuery(order.partyName || '');
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
    popup.showConfirm(
      'Are you sure you want to delete this order? This action cannot be undone.',
      'Delete Order',
      () => {
        const storageKey = orderType === 'purchase' ? 'purchaseOrders' : 'salesOrders';
        const existingOrders = getFromStorage(storageKey, []);
        const updatedOrders = existingOrders.filter((o: Order) => o.id !== orderId);
        saveToStorage(storageKey, updatedOrders);
        loadData();
        popup.showSuccess('The order has been deleted successfully.', 'Order Deleted');
      }
    );
  };

  const handleStatusUpdate = (order: Order, newStatus: OrderStatus) => {
    const storageKey = order.type === 'purchase' ? 'purchaseOrders' : 'salesOrders';
    const existingOrders = getFromStorage(storageKey, []);
    const updatedOrders = existingOrders.map((o: Order) =>
      o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    );
    saveToStorage(storageKey, updatedOrders);
    loadData();
    setViewingOrder(null);
    popup.showSuccess(`Order status updated to: ${STATUS_CONFIG[newStatus].label}`, 'Status Updated');
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = order.type === activeTab;
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.partyName && order.partyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  // Filtered parties for searchable dropdown
  const filteredParties = parties
    .filter(p => activeTab === 'purchase' ? p.type === 'supplier' : p.type === 'customer')
    .filter(p => p.name.toLowerCase().includes(partySearchQuery.toLowerCase()));

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    inProgress: filteredOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length,
    completed: filteredOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
    totalValue: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header with Process Guide */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span>Order Management</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Create, track, and manage purchase and sales orders from placement to fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowProcessGuide(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transition-all"
          >
            <Info className="w-5 h-5" />
            <span>Order Process Guide</span>
          </button>
          <button
            onClick={() => setShowOrderForm(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Order Process Guide Modal */}
      {showProcessGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1 flex items-center space-x-2">
                    <Info className="w-7 h-7" />
                    <span>Order Management Process Guide</span>
                  </h3>
                  <p className="text-purple-100 text-sm">Complete workflow from order creation to fulfillment</p>
                </div>
                <button
                  onClick={() => setShowProcessGuide(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Types Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                <h4 className="text-gray-900 text-xl mb-4 flex items-center space-x-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <span>Order Types</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 border-2 border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <ArrowDownRight className="w-8 h-8 text-green-600" />
                      <div>
                        <h5 className="text-gray-900 font-semibold">Purchase Orders</h5>
                        <p className="text-gray-500 text-sm">From Suppliers</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Orders placed to suppliers for purchasing inventory items. Used to restock products and manage supplier relationships.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <ArrowUpRight className="w-8 h-8 text-blue-600" />
                      <div>
                        <h5 className="text-gray-900 font-semibold">Sales Orders</h5>
                        <p className="text-gray-500 text-sm">To Customers</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Orders received from customers for selling products. Used to track customer orders and manage sales fulfillment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Lifecycle Steps */}
              <div>
                <h4 className="text-gray-900 text-xl mb-4 flex items-center space-x-2">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                  <span>Order Lifecycle - Step by Step Process</span>
                </h4>
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <h5 className="text-gray-900 font-semibold">Pending - Order Placement</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order is created in the system with customer/supplier details and items.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-yellow-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Select party (customer for sales, supplier for purchase)</li>
                            <li>Add items with quantities and prices</li>
                            <li>Set expected delivery date</li>
                            <li>Add notes if needed</li>
                            <li>Click "Create Order" button</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <h5 className="text-gray-900 font-semibold">Confirmed - Order Verification</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order is verified and confirmed by both parties. Payment terms are finalized.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Review order details</li>
                            <li>Verify item availability (for sales orders)</li>
                            <li>Confirm delivery date</li>
                            <li>Update status to "Confirmed"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          <h5 className="text-gray-900 font-semibold">Processing - Order Preparation</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order is being prepared. For sales: picking and packing. For purchase: supplier prepares items.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Pick items from inventory (sales orders)</li>
                            <li>Quality check products</li>
                            <li>Pack items securely</li>
                            <li>Prepare shipping documents</li>
                            <li>Update status to "Processing"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Truck className="w-5 h-5 text-indigo-600" />
                          <h5 className="text-gray-900 font-semibold">Shipped - Order Dispatch</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order is dispatched for delivery. Tracking information is available.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Hand over to courier/delivery service</li>
                            <li>Generate shipping label and tracking number</li>
                            <li>Send tracking details to customer</li>
                            <li>Update status to "Shipped"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                          <h5 className="text-gray-900 font-semibold">Delivered - Order Receipt</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order delivered to customer (sales) or received from supplier (purchase).
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-teal-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Verify delivery confirmation</li>
                            <li>Check for damages or discrepancies</li>
                            <li>Update inventory (add for purchase, deduct for sales)</li>
                            <li>Update status to "Delivered"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        6
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <h5 className="text-gray-900 font-semibold">Completed - Order Fulfillment</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order successfully fulfilled. Payment completed, inventory updated, records closed.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Confirm payment received/made</li>
                            <li>Update final inventory levels</li>
                            <li>Generate completion reports</li>
                            <li>Archive order records</li>
                            <li>Update status to "Completed"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <h5 className="text-gray-900 font-semibold">Cancelled - Order Termination</h5>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          <strong>What happens:</strong> Order cancelled at any stage before completion. May require refund processing.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <p className="text-gray-600 text-sm"><strong>Actions:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-1">
                            <li>Document cancellation reason</li>
                            <li>Process refund if payment was made</li>
                            <li>Restore inventory if items were allocated</li>
                            <li>Notify all parties involved</li>
                            <li>Update status to "Cancelled"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Importance of Order Tracking */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6">
                <h4 className="text-gray-900 text-xl mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <span>Why Order Status Tracking is Critical</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">✅ Customer Satisfaction</h5>
                    <p className="text-gray-700 text-sm">
                      Customers can track their orders in real-time, reducing anxiety and support queries. Transparency builds trust.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">📊 Inventory Management</h5>
                    <p className="text-gray-700 text-sm">
                      Accurate status tracking ensures inventory is updated at the right time, preventing stock discrepancies.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">💰 Financial Accuracy</h5>
                    <p className="text-gray-700 text-sm">
                      Status tracking ensures payments are processed correctly and accounts are updated at appropriate stages.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">🔍 Operational Visibility</h5>
                    <p className="text-gray-700 text-sm">
                      Management can identify bottlenecks, measure fulfillment speed, and optimize the order process.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">⚡ Problem Resolution</h5>
                    <p className="text-gray-700 text-sm">
                      Quick identification of delayed or problematic orders allows for proactive issue resolution.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <h5 className="text-gray-900 font-semibold mb-2">📈 Performance Metrics</h5>
                    <p className="text-gray-700 text-sm">
                      Track average fulfillment time, cancellation rates, and other KPIs to improve business operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6">
                <h4 className="text-gray-900 text-xl mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                  <span>Best Practices for Order Management</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Update status promptly:</strong> Change order status as soon as each stage is completed to maintain accuracy
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Set realistic delivery dates:</strong> Always add buffer time and communicate clearly with parties
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Add detailed notes:</strong> Document any special instructions, issues, or important information in the notes field
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Regular monitoring:</strong> Check pending orders daily to ensure timely processing and avoid delays
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Verify before finalizing:</strong> Double-check items, quantities, and prices before confirming orders
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-cyan-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">
                      <strong>Communicate proactively:</strong> Notify parties about any delays, changes, or issues immediately
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="text-sm opacity-80 font-semibold">Purchase Orders</div>
              <div className="text-xs opacity-60">Orders from Suppliers</div>
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
              <div className="text-sm opacity-80 font-semibold">Sales Orders</div>
              <div className="text-xs opacity-60">Orders to Customers</div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-1">Total Orders</div>
          <div className="text-gray-900 text-3xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-1">Pending</div>
          <div className="text-gray-900 text-3xl font-bold">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting confirmation</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-1">In Progress</div>
          <div className="text-gray-900 text-3xl font-bold">{stats.inProgress}</div>
          <div className="text-xs text-gray-500 mt-1">Processing & shipping</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-1">Completed</div>
          <div className="text-gray-900 text-3xl font-bold">{stats.completed}</div>
          <div className="text-xs text-gray-500 mt-1">Successfully fulfilled</div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-1">Total Value</div>
          <div className="text-gray-900 text-3xl font-bold">NPR {(stats.totalValue / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-500 mt-1">Current period</div>
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
            <option value="pending">⏳ Pending</option>
            <option value="confirmed">✅ Confirmed</option>
            <option value="processing">📦 Processing</option>
            <option value="shipped">🚚 Shipped</option>
            <option value="delivered">📬 Delivered</option>
            <option value="completed">✔️ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Order Details</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Party</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Items</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Amount</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Status</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Date</th>
                <th className="text-left text-gray-700 py-4 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 text-xl mb-2 font-semibold">No Orders Found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your filters or search query'
                        : 'Create your first order to get started'}
                    </p>
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all inline-flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create First Order</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-gray-900 font-semibold">{order.orderNumber}</div>
                        {order.expectedDeliveryDate && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
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
                        <div className="text-gray-900 font-medium">{order.items.length} items</div>
                        <div className="text-xs text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units total
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900 font-semibold">NPR {order.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{order.paymentMethod || 'Cash'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm border font-medium ${STATUS_CONFIG[order.status].color}`}>
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1 font-semibold">Order Details</h3>
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
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-500 text-sm mb-2">Order Type</div>
                  <div className="text-gray-900 capitalize flex items-center space-x-2 font-semibold">
                    {viewingOrder.type === 'purchase' ? (
                      <><ArrowDownRight className="w-5 h-5 text-green-600" /> <span>Purchase Order</span></>
                    ) : (
                      <><ArrowUpRight className="w-5 h-5 text-blue-600" /> <span>Sales Order</span></>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-500 text-sm mb-2">Current Status</div>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm border ${STATUS_CONFIG[viewingOrder.status].color}`}>
                    {React.createElement(STATUS_CONFIG[viewingOrder.status].icon, { className: "w-4 h-4" })}
                    <span className="font-semibold">{STATUS_CONFIG[viewingOrder.status].label}</span>
                  </span>
                  <div className="text-xs text-gray-500 mt-2">
                    {STATUS_CONFIG[viewingOrder.status].description}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 col-span-2 border border-gray-200">
                  <div className="text-gray-500 text-sm mb-2">Party</div>
                  <div className="text-gray-900 flex items-center space-x-2 font-semibold">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{viewingOrder.partyName}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-500 text-sm mb-2">Order Date</div>
                  <div className="text-gray-900 font-medium">{new Date(viewingOrder.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(viewingOrder.createdAt).toLocaleTimeString()}</div>
                </div>

                {viewingOrder.expectedDeliveryDate && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-gray-500 text-sm mb-2">Expected Delivery</div>
                    <div className="text-gray-900 font-medium flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{new Date(viewingOrder.expectedDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Update Status Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Update Order Status</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const StatusIcon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(viewingOrder, status as OrderStatus)}
                        disabled={viewingOrder.status === status}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          viewingOrder.status === status
                            ? 'bg-white border-purple-400 shadow-lg cursor-default'
                            : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-gray-900 text-lg mb-4 font-semibold flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Order Items ({viewingOrder.items.length})</span>
                </h4>
                <div className="space-y-3">
                  {viewingOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-gray-900 font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center space-x-4">
                            <span>Quantity: <strong>{item.quantity}</strong></span>
                            <span>×</span>
                            <span>Price: <strong>NPR {item.price.toLocaleString()}</strong></span>
                            <span>=</span>
                            <span>Total: <strong>NPR {item.total.toLocaleString()}</strong></span>
                          </div>
                        </div>
                        <div className="text-gray-900 text-xl font-bold">NPR {item.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 space-y-3">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>Order Summary</span>
                </h4>
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="text-lg font-semibold">NPR {viewingOrder.subtotal.toLocaleString()}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span className="font-semibold">-NPR {viewingOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (13% VAT)</span>
                  <span className="font-semibold">+NPR {viewingOrder.tax.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-3 flex justify-between text-gray-900">
                  <span className="text-xl font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold text-blue-600">NPR {viewingOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="text-gray-700 text-sm mb-2 font-semibold flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <span>Notes</span>
                  </div>
                  <div className="text-gray-900">{viewingOrder.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Form Modal - (Keeping existing form structure but can be enhanced if needed) */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1 font-semibold">{editingOrder ? 'Edit Order' : 'Create New Order'}</h3>
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
              {/* Party Selection - Searchable Dropdown */}
              <div className="relative party-dropdown-container">
                <label className="block text-gray-700 mb-2 font-semibold">
                  {activeTab === 'purchase' ? '🏭 Supplier' : '👤 Customer'} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required={!formData.partyId}
                    value={partySearchQuery}
                    onChange={(e) => {
                      setPartySearchQuery(e.target.value);
                      setShowPartyDropdown(true);
                      // Clear selection if user starts typing
                      if (formData.partyId) {
                        setFormData({ ...formData, partyId: '' });
                      }
                    }}
                    onFocus={() => setShowPartyDropdown(true)}
                    placeholder={`Type to search or select ${activeTab === 'purchase' ? 'supplier' : 'customer'}...`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Dropdown List */}
                {showPartyDropdown && filteredParties.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredParties.map(party => (
                      <button
                        key={party.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, partyId: party.id });
                          setPartySearchQuery(party.name);
                          setShowPartyDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.partyId === party.id ? 'bg-green-100 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-gray-900">{party.name}</div>
                            {party.phone && (
                              <div className="text-xs text-gray-500">{party.phone}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showPartyDropdown && partySearchQuery && filteredParties.length === 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg p-4 text-center text-gray-500">
                    No {activeTab === 'purchase' ? 'suppliers' : 'customers'} found matching "{partySearchQuery}"
                  </div>
                )}
              </div>

              {/* Expected Delivery Date & Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">📅 Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">💳 Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    <option value="cash">Cash</option>
                    <option value="esewa">eSewa</option>
                    <option value="fonepay">FonePay</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="credit">Credit</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Order Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-700 font-semibold flex items-center space-x-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span>Order Items *</span>
                  </label>
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
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                                {product.name} - NPR {product.price?.toLocaleString() || 0} (Stock: {product.quantity})
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
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            onFocus={(e) => {
                              // Select all on focus so typing replaces the value
                              e.target.select();
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        {/* Price - Auto-integrated */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-gray-600 text-sm mb-2 flex items-center space-x-1">
                            <span>Price</span>
                            {item.id && item.price > 0 && (
                              <span className="text-xs text-green-600 font-semibold">✓ Auto</span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={item.price || ''}
                              readOnly={item.id !== ''}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all ${
                                item.id && item.price > 0
                                  ? 'bg-green-50 border-green-300 text-green-900 font-semibold cursor-default'
                                  : 'border-gray-300 focus:ring-2 focus:ring-green-500'
                              }`}
                              placeholder="0.00"
                            />
                            {item.id && item.price > 0 && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="col-span-10 md:col-span-2">
                          <label className="block text-gray-600 text-sm mb-2">Total</label>
                          <div className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-semibold">
                            NPR {item.total.toLocaleString()}
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
                  <h4 className="text-gray-900 text-lg flex items-center space-x-2 font-semibold">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>Order Summary</span>
                  </h4>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Subtotal</span>
                    <span className="text-xl font-semibold">NPR {calculateTotals().subtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-gray-700 flex items-center space-x-2 font-semibold">
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
                          NPR
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
                        <div className="text-red-600 font-semibold">-NPR {calculateTotals().discount.toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="border-t border-blue-200 pt-4 flex justify-between items-center text-gray-700">
                    <span>Tax (13% VAT)</span>
                    <span className="font-semibold">+NPR {calculateTotals().tax.toLocaleString()}</span>
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-blue-300 pt-4 flex justify-between items-center">
                    <span className="text-xl text-gray-900 font-semibold">Total Amount</span>
                    <span className="text-3xl text-blue-600 font-bold">NPR {calculateTotals().total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Notes (Optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all font-semibold"
                >
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Container */}
      <PopupContainer
        showSuccessPopup={popup.showSuccessPopup}
        successTitle={popup.successTitle}
        successMessage={popup.successMessage}
        onSuccessClose={popup.hideSuccess}
        showErrorPopup={popup.showErrorPopup}
        errorTitle={popup.errorTitle}
        errorMessage={popup.errorMessage}
        errorType={popup.errorType}
        onErrorClose={popup.hideError}
        showConfirmDialog={popup.showConfirmDialog}
        confirmConfig={popup.confirmConfig}
        onConfirmCancel={popup.hideConfirm}
      />
    </div>
  );
};
