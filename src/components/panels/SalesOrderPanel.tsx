import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Calendar, DollarSign, User, FileText, Eye, Search, 
  CheckCircle, Clock, Truck, ArrowRight, BoxIcon, PackageCheck, Info, X, Trash2
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Pagination } from '../common/Pagination';

type OrderStatus = 'confirmed' | 'ready_to_pack' | 'packed' | 'ready_to_depart' | 'in_transit' | 'delivered';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
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
  workspaceId?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { 
  color: string; 
  icon: any; 
  label: string; 
  description: string;
  nextStatus?: OrderStatus;
}> = {
  confirmed: { 
    color: 'bg-blue-100 text-blue-700 border-blue-300', 
    icon: CheckCircle, 
    label: 'Confirmed Order', 
    description: 'Order confirmed by customer and ready to process',
    nextStatus: 'ready_to_pack'
  },
  ready_to_pack: { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
    icon: Clock, 
    label: 'Ready to Pack', 
    description: 'Items ready to be picked and packed',
    nextStatus: 'packed'
  },
  packed: { 
    color: 'bg-purple-100 text-purple-700 border-purple-300', 
    icon: PackageCheck, 
    label: 'Packed', 
    description: 'Items packed and ready for dispatch',
    nextStatus: 'ready_to_depart'
  },
  ready_to_depart: { 
    color: 'bg-orange-100 text-orange-700 border-orange-300', 
    icon: BoxIcon, 
    label: 'Ready to Depart', 
    description: 'Package ready for courier pickup',
    nextStatus: 'in_transit'
  },
  in_transit: { 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300', 
    icon: Truck, 
    label: 'In Transit', 
    description: 'Package dispatched and on the way to customer',
    nextStatus: 'delivered'
  },
  delivered: { 
    color: 'bg-green-100 text-green-700 border-green-300', 
    icon: CheckCircle, 
    label: 'Delivered', 
    description: 'Order delivered to customer successfully',
  },
};

export const SalesOrderPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    let salesOrders = getFromStorage('salesOrders', [])
      .filter((o: SalesOrder) => o.workspaceId === currentUser?.workspaceId);
    
    // Initialize demo data if no orders exist
    if (salesOrders.length === 0) {
      const demoOrders = generateDemoOrders();
      saveToStorage('salesOrders', demoOrders);
      salesOrders = demoOrders;
    }
    
    setOrders(salesOrders);
  };

  const generateDemoOrders = (): SalesOrder[] => {
    const workspaceId = currentUser?.workspaceId || 'ws1';
    const now = new Date();
    
    return [
      {
        id: 'so_001',
        orderNumber: 'SO-001234',
        customerId: 'cust_001',
        customerName: 'Ramesh Thapa',
        customerEmail: 'ramesh.thapa@example.com',
        customerPhone: '+977 9841234567',
        shippingAddress: 'Thamel, Kathmandu, Nepal',
        items: [
          { id: 'item1', name: 'Engine Oil - Castrol 20W-50', quantity: 2, price: 1200, total: 2400 },
          { id: 'item2', name: 'Air Filter - Premium', quantity: 1, price: 850, total: 850 },
          { id: 'item3', name: 'Brake Pads Set', quantity: 1, price: 2500, total: 2500 },
        ],
        subtotal: 5750,
        discount: 0,
        tax: 747.5,
        total: 6497.5,
        status: 'confirmed',
        paymentMethod: 'eSewa',
        notes: 'Customer requested delivery before 5 PM',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_002',
        orderNumber: 'SO-001235',
        customerId: 'cust_002',
        customerName: 'Sita Gurung',
        customerEmail: 'sita.gurung@gmail.com',
        customerPhone: '+977 9851234568',
        shippingAddress: 'Lazimpat, Kathmandu, Nepal',
        items: [
          { id: 'item4', name: 'Headlight Bulb - LED H4', quantity: 2, price: 650, total: 1300 },
          { id: 'item5', name: 'Wiper Blades Pair', quantity: 1, price: 980, total: 980 },
        ],
        subtotal: 2280,
        discount: 100,
        tax: 283.4,
        total: 2463.4,
        status: 'ready_to_pack',
        paymentMethod: 'FonePay',
        notes: '',
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_003',
        orderNumber: 'SO-001236',
        customerId: 'cust_003',
        customerName: 'Bikash Shrestha',
        customerEmail: 'bikash.shrestha@yahoo.com',
        customerPhone: '+977 9861234569',
        shippingAddress: 'Boudha, Kathmandu, Nepal',
        items: [
          { id: 'item6', name: 'Spark Plug - NGK Set of 4', quantity: 1, price: 720, total: 720 },
          { id: 'item7', name: 'Engine Coolant - 1L', quantity: 2, price: 550, total: 1100 },
          { id: 'item8', name: 'Oil Filter', quantity: 1, price: 380, total: 380 },
        ],
        subtotal: 2200,
        discount: 50,
        tax: 279.5,
        total: 2429.5,
        status: 'packed',
        paymentMethod: 'Cash on Delivery',
        notes: 'Fragile items - handle with care',
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_004',
        orderNumber: 'SO-001237',
        customerId: 'cust_004',
        customerName: 'Anita Tamang',
        customerEmail: 'anita.tamang@hotmail.com',
        customerPhone: '+977 9871234570',
        shippingAddress: 'Patan Dhoka, Lalitpur, Nepal',
        items: [
          { id: 'item9', name: 'Battery - Exide 12V 60Ah', quantity: 1, price: 8500, total: 8500 },
        ],
        subtotal: 8500,
        discount: 500,
        tax: 1040,
        total: 9040,
        status: 'ready_to_depart',
        paymentMethod: 'Bank Transfer',
        notes: 'Heavy item - requires careful handling',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_005',
        orderNumber: 'SO-001238',
        customerId: 'cust_005',
        customerName: 'Prakash Rai',
        customerEmail: 'prakash.rai@gmail.com',
        customerPhone: '+977 9881234571',
        shippingAddress: 'Baneshwor, Kathmandu, Nepal',
        items: [
          { id: 'item10', name: 'Tire - MRF 195/65 R15', quantity: 4, price: 6500, total: 26000 },
          { id: 'item11', name: 'Wheel Alignment Service', quantity: 1, price: 1500, total: 1500 },
        ],
        subtotal: 27500,
        discount: 1000,
        tax: 3445,
        total: 29945,
        status: 'in_transit',
        paymentMethod: 'eSewa',
        notes: 'Expected delivery: Today by 6 PM',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_006',
        orderNumber: 'SO-001239',
        customerId: 'cust_006',
        customerName: 'Maya Lama',
        customerEmail: 'maya.lama@example.com',
        customerPhone: '+977 9891234572',
        shippingAddress: 'Kupandole, Lalitpur, Nepal',
        items: [
          { id: 'item12', name: 'Door Mirror - Left Side', quantity: 1, price: 2200, total: 2200 },
          { id: 'item13', name: 'Side Mirror Glass', quantity: 1, price: 650, total: 650 },
        ],
        subtotal: 2850,
        discount: 0,
        tax: 370.5,
        total: 3220.5,
        status: 'delivered',
        paymentMethod: 'FonePay',
        notes: 'Customer was very satisfied',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_007',
        orderNumber: 'SO-001240',
        customerId: 'cust_007',
        customerName: 'Sunil Maharjan',
        customerEmail: 'sunil.maharjan@outlook.com',
        customerPhone: '+977 9801234573',
        shippingAddress: 'Pulchowk, Lalitpur, Nepal',
        items: [
          { id: 'item14', name: 'Clutch Plate Kit', quantity: 1, price: 4500, total: 4500 },
          { id: 'item15', name: 'Pressure Plate', quantity: 1, price: 3200, total: 3200 },
        ],
        subtotal: 7700,
        discount: 200,
        tax: 975,
        total: 8475,
        status: 'confirmed',
        paymentMethod: 'Cash on Delivery',
        notes: 'Urgent order - process ASAP',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_008',
        orderNumber: 'SO-001241',
        customerId: 'cust_008',
        customerName: 'Kamala Sharma',
        customerEmail: 'kamala.sharma@gmail.com',
        customerPhone: '+977 9811234574',
        shippingAddress: 'Koteshwor, Kathmandu, Nepal',
        items: [
          { id: 'item16', name: 'Shock Absorber - Front Pair', quantity: 1, price: 8900, total: 8900 },
        ],
        subtotal: 8900,
        discount: 300,
        tax: 1118,
        total: 9718,
        status: 'ready_to_pack',
        paymentMethod: 'Bank Transfer',
        notes: '',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_009',
        orderNumber: 'SO-001242',
        customerId: 'cust_009',
        customerName: 'Deepak Karki',
        customerEmail: 'deepak.karki@yahoo.com',
        customerPhone: '+977 9821234575',
        shippingAddress: 'Chabahil, Kathmandu, Nepal',
        items: [
          { id: 'item17', name: 'Radiator - Aluminum', quantity: 1, price: 12500, total: 12500 },
          { id: 'item18', name: 'Radiator Hose Set', quantity: 1, price: 1200, total: 1200 },
        ],
        subtotal: 13700,
        discount: 500,
        tax: 1716,
        total: 14916,
        status: 'in_transit',
        paymentMethod: 'eSewa',
        notes: 'Large package - special handling required',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
      {
        id: 'so_010',
        orderNumber: 'SO-001243',
        customerId: 'cust_010',
        customerName: 'Sunita Rana',
        customerEmail: 'sunita.rana@example.com',
        customerPhone: '+977 9831234576',
        shippingAddress: 'Baluwatar, Kathmandu, Nepal',
        items: [
          { id: 'item19', name: 'Seat Cover Set - Premium Leather', quantity: 1, price: 5600, total: 5600 },
          { id: 'item20', name: 'Floor Mat Set', quantity: 1, price: 2800, total: 2800 },
        ],
        subtotal: 8400,
        discount: 400,
        tax: 1040,
        total: 9040,
        status: 'delivered',
        paymentMethod: 'FonePay',
        notes: 'Excellent quality - customer recommended to friends',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        workspaceId,
      },
    ];
  };

  const handleStatusUpdate = (order: SalesOrder, newStatus: OrderStatus) => {
    const existingOrders = getFromStorage('salesOrders', []);
    const updatedOrders = existingOrders.map((o: SalesOrder) =>
      o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    );
    saveToStorage('salesOrders', updatedOrders);
    loadOrders();
    setViewingOrder(prev => prev?.id === order.id ? { ...order, status: newStatus } : prev);
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedOrders.length} sales order(s)?`)) {
      const existingOrders = getFromStorage('salesOrders', []);
      const filtered = existingOrders.filter((o: SalesOrder) => !selectedOrders.includes(o.id));
      saveToStorage('salesOrders', filtered);
      setSelectedOrders([]);
      loadOrders();
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: filteredOrders.length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    processing: filteredOrders.filter(o => o.status === 'ready_to_pack' || o.status === 'packed').length,
    shipping: filteredOrders.filter(o => o.status === 'ready_to_depart' || o.status === 'in_transit').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    totalValue: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span>Sales Order Management</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage customer orders • Orders are created by customers from the website
          </p>
        </div>
        <button
          onClick={() => setShowStatusGuide(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transition-all"
        >
          <Info className="w-5 h-5" />
          <span>Order Status Guide</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-blue-900 font-semibold mb-1">How Sales Orders Work</h4>
            <p className="text-blue-700 text-sm">
              Orders are created by customers through the website/app (user interface will be designed later). 
              As an admin, you can <strong>view orders and update their status</strong> as they progress through fulfillment.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-blue-100 text-xs">Total Orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-blue-100 text-xs">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-yellow-100 text-xs">Processing</p>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-orange-100 text-xs">Shipping</p>
              <p className="text-2xl font-bold">{stats.shipping}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-green-100 text-xs">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-purple-100 text-xs">Total Value</p>
              <p className="text-2xl font-bold">रू{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed Order</option>
            <option value="ready_to_pack">Ready to Pack</option>
            <option value="packed">Packed</option>
            <option value="ready_to_depart">Ready to Depart</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>

          {/* Bulk Delete Button */}
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete ({selectedOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Sales Orders Yet</h3>
            <p className="text-gray-500">
              Orders will appear here when customers place them through the website
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">Order #</th>
                  <th className="px-6 py-4 text-left text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-blue-600">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.customerName || 'N/A'}</p>
                          {order.customerEmail && (
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString('en-NP')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{order.items.length} items</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          रू{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border-2 ${STATUS_CONFIG[order.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{STATUS_CONFIG[order.status].label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <Pagination
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1">Order Details</h3>
                  <p className="text-blue-100 text-sm font-mono">{viewingOrder.orderNumber}</p>
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
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Customer Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Name</p>
                    <p className="text-gray-900 font-semibold">{viewingOrder.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="text-gray-900">{viewingOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <p className="text-gray-900">{viewingOrder.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Order Date</p>
                    <p className="text-gray-900">{new Date(viewingOrder.createdAt).toLocaleString('en-NP')}</p>
                  </div>
                </div>
                {viewingOrder.shippingAddress && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Shipping Address</p>
                    <p className="text-gray-900">{viewingOrder.shippingAddress}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Order Items</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-900">Item</th>
                        <th className="px-4 py-2 text-left text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left text-gray-900">Price</th>
                        <th className="px-4 py-2 text-left text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewingOrder.items.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3 text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-600">रू{item.price.toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">रू{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-white border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-900">Subtotal:</td>
                        <td className="px-4 py-2 font-semibold text-gray-900">रू{viewingOrder.subtotal.toLocaleString()}</td>
                      </tr>
                      {viewingOrder.discount > 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-gray-600">Discount:</td>
                          <td className="px-4 py-2 text-red-600">-रू{viewingOrder.discount.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-gray-600">Tax (13%):</td>
                        <td className="px-4 py-2 text-gray-900">रू{viewingOrder.tax.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 text-lg">Total:</td>
                        <td className="px-4 py-3 font-bold text-green-600 text-lg">रू{viewingOrder.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3">Current Status</h4>
                <div className={`inline-flex items-center space-x-3 px-5 py-3 rounded-xl border-2 ${STATUS_CONFIG[viewingOrder.status].color}`}>
                  {React.createElement(STATUS_CONFIG[viewingOrder.status].icon, { className: "w-6 h-6" })}
                  <div>
                    <p className="font-semibold">{STATUS_CONFIG[viewingOrder.status].label}</p>
                    <p className="text-sm opacity-80">{STATUS_CONFIG[viewingOrder.status].description}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              {viewingOrder.status !== 'delivered' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="text-blue-900 font-semibold mb-3">Update Order Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const isCurrentStatus = viewingOrder.status === status;
                      const StatusIcon = config.icon;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(viewingOrder, status as OrderStatus)}
                          disabled={isCurrentStatus}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            isCurrentStatus
                              ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                              : `${config.color} hover:scale-105 cursor-pointer`
                          }`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-semibold text-sm">{config.label}</p>
                            <p className="text-xs opacity-75">{config.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewingOrder.status === 'delivered' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-green-900 font-semibold">Order Completed!</p>
                      <p className="text-green-700 text-sm">This order has been successfully delivered to the customer.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingOrder.notes && (
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h4 className="text-gray-900 font-semibold mb-2 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Notes</span>
                  </h4>
                  <p className="text-gray-700">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Guide Modal */}
      {showStatusGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl mb-1 flex items-center space-x-2">
                    <Info className="w-7 h-7" />
                    <span>Order Status Workflow Guide</span>
                  </h3>
                  <p className="text-purple-100 text-sm">Complete order fulfillment process from confirmation to delivery</p>
                </div>
                <button
                  onClick={() => setShowStatusGuide(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1 */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <h5 className="text-gray-900 font-semibold">Confirmed Order</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Order has been confirmed by the customer and payment is processed. Ready to begin fulfillment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h5 className="text-gray-900 font-semibold">Ready to Pack</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Items are verified in inventory and ready to be picked for packing. Warehouse team should start picking items.
                    </p>
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
                      <PackageCheck className="w-5 h-5 text-purple-600" />
                      <h5 className="text-gray-900 font-semibold">Packed</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      All items have been packed securely with protective materials. Quality check completed and package is sealed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <BoxIcon className="w-5 h-5 text-orange-600" />
                      <h5 className="text-gray-900 font-semibold">Ready to Depart</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Package is labeled, documented, and ready for courier pickup. Shipping label and invoice are attached.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="w-5 h-5 text-indigo-600" />
                      <h5 className="text-gray-900 font-semibold">In Transit</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Package has been picked up by courier and is on the way to customer. Tracking number should be provided to customer.
                    </p>
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
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h5 className="text-gray-900 font-semibold">Delivered</h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Order successfully delivered to customer. Customer has received the package and order is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};