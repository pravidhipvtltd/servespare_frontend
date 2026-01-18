import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { CustomerOrder } from "../../types";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

export const OrderHistoryPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);
  const [printingOrder, setPrintingOrder] = useState<CustomerOrder | null>(
    null
  );
  const printRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = getFromStorage("customerOrders", []);
    setOrders(
      allOrders.filter(
        (o: CustomerOrder) => o.workspaceId === currentUser?.workspaceId
      )
    );
  };

  const handleMarkAsCompleted = (orderId: string) => {
    popup.showConfirm(
      "Mark this order as completed?",
      "Confirm Completion",
      () => {
        const allOrders = getFromStorage("customerOrders", []);
        const updated = allOrders.map((o: CustomerOrder) =>
          o.id === orderId
            ? {
                ...o,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : o
        );
        saveToStorage("customerOrders", updated);
        loadOrders();
        popup.showSuccess(
          "Order marked as completed successfully!",
          "Order Completed"
        );
      }
    );
  };

  const handlePrintLabel = (order: CustomerOrder) => {
    setPrintingOrder(order);
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open("", "", "width=800,height=600");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Shipping Label - ${order.orderNumber}</title>
                <style>
                  @page { size: 4in 6in; margin: 0.25in; }
                  body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                    font-size: 12px;
                  }
                  .label-container {
                    border: 2px solid #000;
                    padding: 15px;
                    max-width: 4in;
                  }
                  .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                  }
                  .company-name {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 5px;
                  }
                  .section {
                    margin: 15px 0;
                    padding: 10px;
                    border: 1px solid #ccc;
                  }
                  .section-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 8px;
                    color: #333;
                  }
                  .info-row {
                    margin: 5px 0;
                  }
                  .label {
                    font-weight: bold;
                    display: inline-block;
                    width: 100px;
                  }
                  .order-number {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    margin: 10px 0;
                    padding: 8px;
                    background: #f0f0f0;
                    border: 1px solid #000;
                  }
                  .items-list {
                    margin-top: 10px;
                  }
                  .item {
                    padding: 5px;
                    border-bottom: 1px dotted #ccc;
                  }
                  .amount {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                    padding: 10px;
                    background: #f9f9f9;
                    border: 1px solid #000;
                  }
                </style>
              </head>
              <body>
                ${printRef.current?.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
            setPrintingOrder(null);
          }, 250);
        }
      }
    }, 100);
  };

  // Filter orders based on tab and search
  const filteredOrders = orders.filter((order) => {
    const matchesTab = order.status === activeTab;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs or search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Stats
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCompletedAmount = completedOrders.reduce(
    (sum, o) => sum + o.total,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Orders</p>
              <p className="text-3xl mb-1">{orders.length}</p>
              <p className="text-blue-100 text-xs">All customer orders</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Pending Orders</p>
              <p className="text-3xl mb-1">{pendingOrders.length}</p>
              <p className="text-orange-100 text-xs">
                Rs{totalPendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Completed Orders</p>
              <p className="text-3xl mb-1">{completedOrders.length}</p>
              <p className="text-green-100 text-xs">
                Rs{totalCompletedAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Delivery Revenue</p>
              <p className="text-3xl mb-1">
                Rs{(totalCompletedAmount / 1000).toFixed(1)}k
              </p>
              <p className="text-purple-100 text-xs">From deliveries</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
            activeTab === "pending"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:border-orange-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "pending"
                  ? "bg-white bg-opacity-20"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {pendingOrders.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
            activeTab === "completed"
              ? "bg-green-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:border-green-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Completed Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "completed"
                  ? "bg-white bg-opacity-20"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {completedOrders.length}
            </span>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  S.N
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Order Number
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Quantity
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Customer
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Amount
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Order Date
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {activeTab} orders found</p>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="text-gray-600">
                        {startIndex + index + 1}.
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-blue-600">{order.orderNumber}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-green-600">
                        NPR. {order.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintLabel(order)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Print Shipping Label"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {activeTab === "pending" && (
                          <button
                            onClick={() => handleMarkAsCompleted(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
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
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={i} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Order Details Modal */}
      {viewingOrder && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setViewingOrder(null)}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">Order Details</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {viewingOrder.orderNumber}
                  </p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Order Number</p>
                    <p className="text-gray-900 text-lg">
                      {viewingOrder.orderNumber}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm ${
                      viewingOrder.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {viewingOrder.status === "completed"
                      ? "Completed"
                      : "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Order Date</span>
                    </p>
                    <p className="text-gray-900 text-sm">
                      {new Date(viewingOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <p className="text-gray-900 uppercase">
                      {viewingOrder.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <h4 className="text-blue-900 mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Customer Information</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-blue-700 text-sm">Name</p>
                    <p className="text-blue-900">{viewingOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>Phone</span>
                    </p>
                    <p className="text-blue-900">
                      {viewingOrder.customerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Delivery Address</span>
                    </p>
                    <p className="text-blue-900">
                      {viewingOrder.customerAddress}
                      <br />
                      {viewingOrder.city}, {viewingOrder.state} -{" "}
                      {viewingOrder.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {viewingOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-gray-900">{item.itemName}</p>
                        <p className="text-gray-500 text-sm">
                          {item.quantity || 0} × NPR.{" "}
                          {(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-900">
                        NPR. {(item.total || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>NPR. {viewingOrder.subtotal.toLocaleString()}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-NPR. {viewingOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                {viewingOrder.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>NPR. {viewingOrder.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-900 text-lg">
                  <span>Total</span>
                  <span>NPR. {viewingOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePrintLabel(viewingOrder)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Print Label</span>
                </button>
                {viewingOrder.status === "pending" && (
                  <button
                    onClick={() => {
                      handleMarkAsCompleted(viewingOrder.id);
                      setViewingOrder(null);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden Print Label */}
      {printingOrder && (
        <div ref={printRef} style={{ display: "none" }}>
          <div className="label-container">
            <div className="header">
              <div className="company-name">AutoParts Inventory System</div>
              <div>Shipping Label</div>
            </div>

            <div className="order-number">
              Order: {printingOrder.orderNumber}
            </div>

            <div className="section">
              <div className="section-title">SHIP TO:</div>
              <div className="info-row">
                <span className="label">Name:</span>
                <span>{printingOrder.customerName}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span>{printingOrder.customerPhone}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span>{printingOrder.customerAddress}</span>
              </div>
              <div className="info-row">
                <span className="label">City:</span>
                <span>
                  {printingOrder.city}, {printingOrder.state}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Pincode:</span>
                <span>{printingOrder.pincode}</span>
              </div>
            </div>

            <div className="section">
              <div className="section-title">ORDER DETAILS:</div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span>
                  {new Date(printingOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Payment:</span>
                <span>{printingOrder.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="info-row">
                <span className="label">Items:</span>
                <span>
                  {printingOrder.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}{" "}
                  pieces
                </span>
              </div>
              <div className="items-list">
                {printingOrder.items.map((item, index) => (
                  <div key={index} className="item">
                    • {item.itemName} (Qty: {item.quantity})
                  </div>
                ))}
              </div>
            </div>

            <div className="amount">
              Total Amount: NPR. {printingOrder.total.toLocaleString()}
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
