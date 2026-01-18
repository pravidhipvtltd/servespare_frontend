import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  User,
  FileText,
  Eye,
  Search,
  CheckCircle,
  Clock,
  Truck,
  ArrowRight,
  BoxIcon,
  PackageCheck,
  Info,
  X,
  Trash2,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { Pagination } from "../common/Pagination";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

type OrderStatus =
  | "confirmed"
  | "ready_to_pack"
  | "packed"
  | "ready_to_depart"
  | "in_transit"
  | "delivered"
  | "cancelled";

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

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    color: string;
    icon: any;
    label: string;
    description: string;
    nextStatus?: OrderStatus;
  }
> = {
  confirmed: {
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: CheckCircle,
    label: "Confirmed Order",
    description: "Order confirmed by customer and ready to process",
    nextStatus: "ready_to_pack",
  },
  ready_to_pack: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: Clock,
    label: "Ready to Pack",
    description: "Items ready to be picked and packed",
    nextStatus: "packed",
  },
  packed: {
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: PackageCheck,
    label: "Packed",
    description: "Items packed and ready for dispatch",
    nextStatus: "ready_to_depart",
  },
  ready_to_depart: {
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: BoxIcon,
    label: "Ready to Depart",
    description: "Package ready for courier pickup",
    nextStatus: "in_transit",
  },
  in_transit: {
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
    icon: Truck,
    label: "In Transit",
    description: "Package dispatched and on the way to customer",
    nextStatus: "delivered",
  },
  delivered: {
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle,
    label: "Delivered",
    description: "Order delivered to customer successfully",
  },
  cancelled: {
    color: "bg-red-100 text-red-700 border-red-300",
    icon: X,
    label: "Cancelled",
    description: "Order has been cancelled",
  },
};

interface SalesStats {
  total_orders: number;
  total_revenue: number;
  total_paid: number;
  total_outstanding: number;
  avg_order_value: number;
  today: {
    sales: number;
    revenue: number;
  };
  by_status: {
    confirmed: { count: number; label: string };
    ready_to_pack: { count: number; label: string };
    packed: { count: number; label: string };
    ready_to_depart: { count: number; label: string };
    in_transit: { count: number; label: string };
    delivered: { count: number; label: string };
    cancelled: { count: number; label: string };
  };
  by_payment_status: {
    pending: { count: number; label: string };
    partial: { count: number; label: string };
    paid: { count: number; label: string };
  };
  this_month: {
    orders: number;
    revenue: number;
  };
}

export const SalesOrderPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiStats, setApiStats] = useState<SalesStats | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/stats/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setApiStats(data);
        }
      }
    } catch (error) {
      console.error("Error fetching sales stats:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const mappedOrders: SalesOrder[] = data.results.map(
            (apiOrder: any) => ({
              id: apiOrder.id.toString(),
              orderNumber: apiOrder.order_number,
              customerId: apiOrder.customer.toString(),
              customerName: `Customer ${apiOrder.customer}`, // Placeholder as name is not in list
              customerEmail: "", // Not in list
              customerPhone: "", // Not in list
              shippingAddress: "", // Not in list
              items: [], // Not in list
              subtotal: parseFloat(apiOrder.total_amount), // Assuming subtotal is total for now
              tax: 0, // Not in list
              discount: 0, // Not in list
              total: parseFloat(apiOrder.total_amount),
              status: apiOrder.order_status.toLowerCase() as OrderStatus,
              paymentMethod: apiOrder.payment_status_display,
              notes: "",
              createdAt: apiOrder.created,
              updatedAt: apiOrder.modified,
              workspaceId: currentUser?.workspaceId,
            })
          );
          setOrders(mappedOrders);
        } else {
          console.error("Failed to fetch orders:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleStatusUpdate = (order: SalesOrder, newStatus: OrderStatus) => {
    const existingOrders = getFromStorage("salesOrders", []);
    const updatedOrders = existingOrders.map((o: SalesOrder) =>
      o.id === order.id
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o
    );
    saveToStorage("salesOrders", updatedOrders);
    loadOrders();
    setViewingOrder((prev) =>
      prev?.id === order.id ? { ...order, status: newStatus } : prev
    );
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      popup.showError(
        "Please select at least one order to delete.",
        "No Selection",
        "warning"
      );
      return;
    }

    popup.showConfirm(
      "Delete Sales Orders",
      `Are you sure you want to delete ${selectedOrders.length} sales order(s)? This action cannot be undone.`,
      () => {
        const existingOrders = getFromStorage("salesOrders", []);
        const filtered = existingOrders.filter(
          (o: SalesOrder) => !selectedOrders.includes(o.id)
        );
        saveToStorage("salesOrders", filtered);
        setSelectedOrders([]);
        loadOrders();
        popup.showSuccess(
          "Orders Deleted",
          `Successfully deleted ${selectedOrders.length} sales order(s).`
        );
      }
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.orderNumber &&
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName &&
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = apiStats
    ? {
        total: apiStats.total_orders,
        confirmed: apiStats.by_status.confirmed.count,
        processing:
          apiStats.by_status.ready_to_pack.count +
          apiStats.by_status.packed.count,
        shipping:
          apiStats.by_status.ready_to_depart.count +
          apiStats.by_status.in_transit.count,
        delivered: apiStats.by_status.delivered.count,
        totalValue: apiStats.total_revenue,
      }
    : {
        total: filteredOrders.length,
        confirmed: filteredOrders.filter((o) => o.status === "confirmed")
          .length,
        processing: filteredOrders.filter(
          (o) => o.status === "ready_to_pack" || o.status === "packed"
        ).length,
        shipping: filteredOrders.filter(
          (o) => o.status === "ready_to_depart" || o.status === "in_transit"
        ).length,
        delivered: filteredOrders.filter((o) => o.status === "delivered")
          .length,
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
            Track and manage customer orders • Orders are created by customers
            from the website
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
              <p className="text-2xl font-bold">
                Rs{stats.totalValue.toLocaleString()}
              </p>
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
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
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
              Orders will appear here when customers place them through the
              website
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
                      checked={
                        selectedOrders.length === paginatedOrders.length &&
                        paginatedOrders.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">Order #</th>
                  <th className="px-6 py-4 text-left text-gray-900">
                    Customer
                  </th>
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
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                          <p className="font-semibold text-gray-900">
                            {order.customerName || "N/A"}
                          </p>
                          {order.customerEmail && (
                            <p className="text-sm text-gray-500">
                              {order.customerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-NP"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          Rs{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border-2 ${
                            STATUS_CONFIG[order.status].color
                          }`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {STATUS_CONFIG[order.status].label}
                          </span>
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
                  <p className="text-blue-100 text-sm font-mono">
                    {viewingOrder.orderNumber}
                  </p>
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
                    <p className="text-gray-900 font-semibold">
                      {viewingOrder.customerName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="text-gray-900">
                      {viewingOrder.customerEmail || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <p className="text-gray-900">
                      {viewingOrder.customerPhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Order Date</p>
                    <p className="text-gray-900">
                      {new Date(viewingOrder.createdAt).toLocaleString("en-NP")}
                    </p>
                  </div>
                </div>
                {viewingOrder.shippingAddress && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Shipping Address</p>
                    <p className="text-gray-900">
                      {viewingOrder.shippingAddress}
                    </p>
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
                        <th className="px-4 py-2 text-left text-gray-900">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-gray-900">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-gray-900">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewingOrder.items.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3 text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            Rs{item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            Rs{item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-white border-t-2 border-gray-300">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right font-semibold text-gray-900"
                        >
                          Subtotal:
                        </td>
                        <td className="px-4 py-2 font-semibold text-gray-900">
                          Rs{viewingOrder.subtotal.toLocaleString()}
                        </td>
                      </tr>
                      {viewingOrder.discount > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-2 text-right text-gray-600"
                          >
                            Discount:
                          </td>
                          <td className="px-4 py-2 text-red-600">
                            -Rs{viewingOrder.discount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right text-gray-600"
                        >
                          Tax (13%):
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          Rs{viewingOrder.tax.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-right font-bold text-gray-900 text-lg"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600 text-lg">
                          Rs{viewingOrder.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3">
                  Current Status
                </h4>
                <div
                  className={`inline-flex items-center space-x-3 px-5 py-3 rounded-xl border-2 ${
                    STATUS_CONFIG[viewingOrder.status].color
                  }`}
                >
                  {React.createElement(
                    STATUS_CONFIG[viewingOrder.status].icon,
                    { className: "w-6 h-6" }
                  )}
                  <div>
                    <p className="font-semibold">
                      {STATUS_CONFIG[viewingOrder.status].label}
                    </p>
                    <p className="text-sm opacity-80">
                      {STATUS_CONFIG[viewingOrder.status].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              {viewingOrder.status !== "delivered" && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="text-blue-900 font-semibold mb-3">
                    Update Order Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const isCurrentStatus = viewingOrder.status === status;
                      const StatusIcon = config.icon;

                      return (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusUpdate(
                              viewingOrder,
                              status as OrderStatus
                            )
                          }
                          disabled={isCurrentStatus}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            isCurrentStatus
                              ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                              : `${config.color} hover:scale-105 cursor-pointer`
                          }`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-semibold text-sm">
                              {config.label}
                            </p>
                            <p className="text-xs opacity-75">
                              {config.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewingOrder.status === "delivered" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-green-900 font-semibold">
                        Order Completed!
                      </p>
                      <p className="text-green-700 text-sm">
                        This order has been successfully delivered to the
                        customer.
                      </p>
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
                  <p className="text-purple-100 text-sm">
                    Complete order fulfillment process from confirmation to
                    delivery
                  </p>
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
                      <h5 className="text-gray-900 font-semibold">
                        Confirmed Order
                      </h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Order has been confirmed by the customer and payment is
                      processed. Ready to begin fulfillment.
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
                      <h5 className="text-gray-900 font-semibold">
                        Ready to Pack
                      </h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Items are verified in inventory and ready to be picked for
                      packing. Warehouse team should start picking items.
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
                      All items have been packed securely with protective
                      materials. Quality check completed and package is sealed.
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
                      <h5 className="text-gray-900 font-semibold">
                        Ready to Depart
                      </h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Package is labeled, documented, and ready for courier
                      pickup. Shipping label and invoice are attached.
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
                      <h5 className="text-gray-900 font-semibold">
                        In Transit
                      </h5>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Package has been picked up by courier and is on the way to
                      customer. Tracking number should be provided to customer.
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
                      Order successfully delivered to customer. Customer has
                      received the package and order is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
