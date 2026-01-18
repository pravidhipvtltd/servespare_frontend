import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerOrdersPage } from './CustomerOrdersPage';
import { CustomerOrderTrackingPage } from './CustomerOrderTrackingPage';
import { ReturnRequestFlow } from './ReturnRequestFlow';

type ViewMode = 'orders-list' | 'order-tracking' | 'return-request';

interface CustomerOrdersDashboardProps {
  onNavigateToCustomerPanel?: () => void;
  customerData?: any;
}

export const CustomerOrdersDashboard: React.FC<CustomerOrdersDashboardProps> = ({
  onNavigateToCustomerPanel,
  customerData
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('orders-list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setViewMode('order-tracking');
  };

  const handleBackToOrders = () => {
    setViewMode('orders-list');
    setSelectedOrderId(null);
  };

  const handleNavigate = (page: string) => {
    if (page === 'orders') {
      setViewMode('orders-list');
    } else if (page === 'dashboard') {
      onNavigateToCustomerPanel?.();
    }
    // Add more navigation logic as needed
  };

  const handleReturnSubmit = (returnData: any) => {
    console.log('Return request submitted:', returnData);
    setShowReturnModal(false);
    // Show success message
    alert('Return request submitted successfully! We\'ll review it within 24-48 hours.');
  };

  // Mock order items for return flow
  const mockOrderItems = [
    {
      id: '1',
      name: 'Premium Brake Pads Set',
      sku: 'BP-001',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop',
      price: 4500
    }
  ];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {viewMode === 'orders-list' && (
          <motion.div
            key="orders-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CustomerOrdersPage
              customerData={customerData}
              onViewOrderDetails={handleViewOrder}
            />
          </motion.div>
        )}

        {viewMode === 'order-tracking' && selectedOrderId && (
          <motion.div
            key="order-tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CustomerOrderTrackingPage
              orderId={selectedOrderId}
              onBack={handleBackToOrders}
              onNavigate={handleNavigate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Request Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <ReturnRequestFlow
                orderId={selectedOrderId || 'ORD-2024-001'}
                items={mockOrderItems}
                onSubmit={handleReturnSubmit}
                onCancel={() => setShowReturnModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};