import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Calendar } from 'lucide-react';

interface OrderHistoryProps {
  customerId: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ customerId }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, [customerId]);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
    const customerOrders = allOrders
      .filter((order: any) => order.customerId === customerId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(customerOrders);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-indigo-100 text-indigo-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedOrder) {
    return (
      <div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
          Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id.slice(-8)}</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}>
              {selectedOrder.orderStatus}
            </span>
          </div>

          {/* Delivery Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Name:</span> <span className="font-semibold">{selectedOrder.customerName}</span></p>
              <p><span className="text-gray-600">Phone:</span> <span className="font-semibold">{selectedOrder.phone}</span></p>
              <p><span className="text-gray-600">Address:</span> <span className="font-semibold">{selectedOrder.deliveryAddress}</span></p>
              <p><span className="text-gray-600">Payment:</span> <span className="font-semibold capitalize">{selectedOrder.paymentMethod}</span></p>
              <p><span className="text-gray-600">Payment Status:</span> 
                <span className={`ml-2 font-semibold ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {selectedOrder.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    NPR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>NPR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Shipping</span>
                <span>NPR {selectedOrder.shipping.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-xl text-indigo-600">NPR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.orderStatus)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.paymentMethod}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">
                      NPR {order.total.toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
