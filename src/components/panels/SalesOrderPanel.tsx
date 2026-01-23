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
// import { apiFetch } from "../../utils/apiClient";
import { apiFetch } from "../../utils/apiClient";

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
        const response = await apiFetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/stats/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
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
        const response = await apiFetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          const mappedOrders: SalesOrder[] = data.results.map(
            (apiOrder: any) => ({
              id: apiOrder.id.toString(),
              orderNumber: apiOrder.order_number,
              customerId: apiOrder.customer.toString(),
              customerName: `Customer ${apiOrder.customer}`,
              customerEmail: "",
              customerPhone: "",
              shippingAddress: "",
              items: [],
              subtotal: parseFloat(apiOrder.total_amount),
              tax: 0,
              discount: 0,
              total: parseFloat(apiOrder.total_amount),
              status: apiOrder.order_status.toLowerCase() as OrderStatus,
              paymentMethod: apiOrder.payment_status_display,
              notes: "",
              createdAt: apiOrder.created,
              updatedAt: apiOrder.modified,
              workspaceId: currentUser?.workspaceId,
            }),
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
        : o,
    );
    saveToStorage("salesOrders", updatedOrders);
    loadOrders();
    setViewingOrder((prev) =>
      prev?.id === order.id ? { ...order, status: newStatus } : prev,
    );
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      popup.showError(
        "Please select at least one order to delete.",
        "No Selection",
        "warning",
      );
      return;
    }

    popup.showConfirm(
      "Delete Sales Orders",
      `Are you sure you want to delete ${selectedOrders.length} sales order(s)? This action cannot be undone.`,
      () => {
        const existingOrders = getFromStorage("salesOrders", []);
        const filtered = existingOrders.filter(
          (o: SalesOrder) => !selectedOrders.includes(o.id),
        );
        saveToStorage("salesOrders", filtered);
        setSelectedOrders([]);
        loadOrders();
        popup.showSuccess(
          "Orders Deleted",
          `Successfully deleted ${selectedOrders.length} sales order(s).`,
        );
      },
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
    currentPage * itemsPerPage,
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
          (o) => o.status === "ready_to_pack" || o.status === "packed",
        ).length,
        shipping: filteredOrders.filter(
          (o) => o.status === "ready_to_depart" || o.status === "in_transit",
        ).length,
        delivered: filteredOrders.filter((o) => o.status === "delivered")
          .length,
        totalValue: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h3 className="text-gray-900 text-base sm:text-lg md:text-xl flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span>Sales Order Management</span>
          </h3>
          <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">
            Track and manage customer orders
          </p>
        </div>
        <button
          onClick={() => setShowStatusGuide(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-md transition-all w-fit"
        >
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Status Guide</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-blue-100 text-[10px] sm:text-xs">Total</p>
              <p className="text-sm sm:text-lg font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-blue-100 text-[10px] sm:text-xs">Confirmed</p>
              <p className="text-sm sm:text-lg font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-yellow-100 text-[10px] sm:text-xs">
                Processing
              </p>
              <p className="text-sm sm:text-lg font-bold">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-orange-100 text-[10px] sm:text-xs">Shipping</p>
              <p className="text-sm sm:text-lg font-bold">{stats.shipping}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-green-100 text-[10px] sm:text-xs">Delivered</p>
              <p className="text-sm sm:text-lg font-bold">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <div className="text-right">
              <p className="text-purple-100 text-[10px] sm:text-xs">Value</p>
              <p className="text-xs sm:text-base font-bold truncate">
                Rs{stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
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
              className="flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Delete ({selectedOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 text-sm sm:text-base mb-1">
              No Sales Orders Yet
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm px-4">
              Orders will appear here when customers place them
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === paginatedOrders.length &&
                        paginatedOrders.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Order #
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Customer
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Items
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Total
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status].icon;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <span className="font-mono text-xs font-medium text-blue-600">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                            {order.customerName || "N/A"}
                          </p>
                          {order.customerEmail && (
                            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                              {order.customerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] sm:text-xs">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-NP",
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <span className="text-xs text-gray-900">
                          {order.items.length}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <span className="text-xs font-medium text-green-600">
                          Rs{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <div
                          className={`inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${
                            STATUS_CONFIG[order.status].color
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span className="text-[10px] sm:text-xs font-medium">
                            {STATUS_CONFIG[order.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="hidden sm:inline">View</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">
                    Order Details
                  </h3>
                  <p className="text-blue-100 text-xs font-mono">
                    {viewingOrder.orderNumber}
                  </p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h4 className="text-gray-900 text-sm font-semibold mb-2 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <p className="text-gray-500 text-[10px] sm:text-xs">Name</p>
                    <p className="text-gray-900 text-xs sm:text-sm font-medium">
                      {viewingOrder.customerName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      Email
                    </p>
                    <p className="text-gray-900 text-xs sm:text-sm">
                      {viewingOrder.customerEmail || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      Phone
                    </p>
                    <p className="text-gray-900 text-xs sm:text-sm">
                      {viewingOrder.customerPhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      Order Date
                    </p>
                    <p className="text-gray-900 text-xs sm:text-sm">
                      {new Date(viewingOrder.createdAt).toLocaleString("en-NP")}
                    </p>
                  </div>
                </div>
                {viewingOrder.shippingAddress && (
                  <div className="mt-2 sm:mt-3">
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      Shipping Address
                    </p>
                    <p className="text-gray-900 text-xs sm:text-sm">
                      {viewingOrder.shippingAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h4 className="text-gray-900 text-sm font-semibold mb-2 flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Order Items</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-white border-b border-gray-300">
                      <tr>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-xs font-medium text-gray-700">
                          Item
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-xs font-medium text-gray-700">
                          Qty
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-xs font-medium text-gray-700">
                          Price
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-xs font-medium text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewingOrder.items.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-2 sm:px-3 py-1.5 text-xs text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-2 sm:px-3 py-1.5 text-xs text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-2 sm:px-3 py-1.5 text-xs text-gray-600">
                            Rs{item.price.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-900">
                            Rs{item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-white border-t border-gray-300">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-2 sm:px-3 py-1.5 text-right text-xs font-medium text-gray-900"
                        >
                          Subtotal:
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-900">
                          Rs{viewingOrder.subtotal.toLocaleString()}
                        </td>
                      </tr>
                      {viewingOrder.discount > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-2 sm:px-3 py-1 text-right text-xs text-gray-600"
                          >
                            Discount:
                          </td>
                          <td className="px-2 sm:px-3 py-1 text-xs text-red-600">
                            -Rs{viewingOrder.discount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan={3}
                          className="px-2 sm:px-3 py-1 text-right text-xs text-gray-600"
                        >
                          Tax (13%):
                        </td>
                        <td className="px-2 sm:px-3 py-1 text-xs text-gray-900">
                          Rs{viewingOrder.tax.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td
                          colSpan={3}
                          className="px-2 sm:px-3 py-2 text-right font-semibold text-gray-900 text-xs sm:text-sm"
                        >
                          Total:
                        </td>
                        <td className="px-2 sm:px-3 py-2 font-semibold text-green-600 text-xs sm:text-sm">
                          Rs{viewingOrder.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h4 className="text-gray-900 text-sm font-semibold mb-2">
                  Current Status
                </h4>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    STATUS_CONFIG[viewingOrder.status].color
                  }`}
                >
                  {React.createElement(
                    STATUS_CONFIG[viewingOrder.status].icon,
                    { className: "w-4 h-4" },
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-medium">
                      {STATUS_CONFIG[viewingOrder.status].label}
                    </p>
                    <p className="text-[10px] sm:text-xs opacity-80">
                      {STATUS_CONFIG[viewingOrder.status].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              {viewingOrder.status !== "delivered" && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <h4 className="text-blue-900 text-sm font-semibold mb-2">
                    Update Order Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const isCurrentStatus = viewingOrder.status === status;
                      const StatusIcon = config.icon;

                      return (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusUpdate(
                              viewingOrder,
                              status as OrderStatus,
                            )
                          }
                          disabled={isCurrentStatus}
                          className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg border transition-all ${
                            isCurrentStatus
                              ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                              : `${config.color} hover:scale-[1.02] cursor-pointer`
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium truncate">
                              {config.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewingOrder.status === "delivered" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-green-900 text-xs sm:text-sm font-medium">
                        Order Completed!
                      </p>
                      <p className="text-green-700 text-[10px] sm:text-xs">
                        Successfully delivered to customer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingOrder.notes && (
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h4 className="text-gray-900 text-xs sm:text-sm font-medium mb-1 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notes</span>
                  </h4>
                  <p className="text-gray-700 text-xs">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Guide Modal */}
      {showStatusGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 sm:p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold flex items-center space-x-1.5">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Order Status Guide</span>
                  </h3>
                  <p className="text-purple-100 text-[10px] sm:text-xs mt-0.5">
                    Order fulfillment workflow
                  </p>
                </div>
                <button
                  onClick={() => setShowStatusGuide(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {/* Step 1 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        Confirmed
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      Order confirmed, payment processed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        Ready to Pack
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      Items verified, ready for picking.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <PackageCheck className="w-3.5 h-3.5 text-purple-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        Packed
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      Items packed and quality checked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <BoxIcon className="w-3.5 h-3.5 text-orange-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        Ready to Depart
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      Labeled and ready for courier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        In Transit
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      On the way to customer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    6
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <h5 className="text-gray-900 text-xs sm:text-sm font-medium">
                        Delivered
                      </h5>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                      Order complete, customer received.
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
