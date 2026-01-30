import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  Search,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerOrdersPageProps {
  customerData: any;
  onViewOrderDetails?: (order: any) => void;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface Order {
  id: string;
  orderStatus: OrderStatus;
  createdAt: string;
  items: any[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  progressPercentage: number;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  processing: {
    label: "Processing",
    icon: RefreshCw,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  customerData,
  onViewOrderDetails,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const [statsData, setStatsData] = useState({
    totalOrders: 0,
    inProgress: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          return;
        }

        // Fetch Orders
        const ordersResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/my_orders/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
             
            },
          }
        );

        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          // Handle both array response or paginated response
          const ordersList = Array.isArray(data) ? data : data.results || [];

          const mappedOrders = ordersList.map((apiOrder: any) => ({
            id: apiOrder.order_number || String(apiOrder.id),
            orderStatus: (apiOrder.order_status?.toLowerCase() ||
              "pending") as OrderStatus,
            createdAt: apiOrder.order_date || new Date().toISOString(),
            items: (apiOrder.items || []).map((item: any) => ({
              name: item.item_name || item.inventory_name || "Product",
              quantity: parseFloat(item.quantity || "0"),
              price: parseFloat(item.unit_price || "0"),
              image: "", // Image not provided in API
            })),
            total: parseFloat(apiOrder.total_amount || "0"),
            deliveryAddress: apiOrder.delivery_address || "",
            paymentMethod: apiOrder.payment_method || "Cash on Delivery",
            paymentStatus: apiOrder.payment_status || "Pending",
            progressPercentage:
              apiOrder.status_progress?.progress_percentage || 0,
          }));

          setOrders(mappedOrders);
          setFilteredOrders(mappedOrders);
        }

        // Fetch Stats
        const statsResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sales/orders/my_orders_stats/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setStatsData({
            totalOrders: stats.total_orders || 0,
            inProgress: stats.in_progress?.count || 0,
            delivered: stats.orders_by_status?.delivered?.count || 0,
            cancelled: stats.orders_by_status?.cancelled?.count || 0,
          });
        }
      } catch (error) {
        toast.error("Failed to load orders");
      }
    };

    loadOrders();
  }, [customerData]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const stats = [
    {
      label: "Total Orders",
      value: statsData.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "In Progress",
      value: statsData.inProgress,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Delivered",
      value: statsData.delivered,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Cancelled",
      value: statsData.cancelled,
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by ID or product name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm p-12 text-center"
          >
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all inline-flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onViewDetails={onViewOrderDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard: React.FC<{
  order: Order;
  index: number;
  onViewDetails?: (order: any) => void;
}> = ({ order, index, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

  // Fallback for unknown status
  const status = statusConfig[order.orderStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
    >
      {/* Order Header */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl text-gray-900">Order {order.id}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs ${status.bgColor} ${status.color} ${status.borderColor} border`}
              >
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-lg text-gray-900">
                  NPR {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{expanded ? "Hide" : "View"} Details</span>
            </button>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(order)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-2">
          <div className="flex justify-between mb-2 text-xs text-gray-600">
            <span>Pending</span>
            <span>Processing</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${order.progressPercentage}%`,
              }}
              className={`h-full bg-gradient-to-r ${
                order.orderStatus === "cancelled"
                  ? "from-red-500 to-red-600"
                  : order.orderStatus === "delivered"
                  ? "from-green-500 to-green-600"
                  : "from-amber-500 to-orange-600"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-6 bg-gray-50">
              {/* Items */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 bg-white p-4 rounded-xl"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-gray-900">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Delivery Address</span>
                </h4>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-gray-900">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-700 mb-2">Payment Method</h4>
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-gray-900 capitalize">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-700 mb-2">Payment Status</h4>
                  <div className="bg-white p-4 rounded-xl">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
