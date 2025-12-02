import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, TrendingUp, Clock, Banknote, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

interface LiveActivityFeedProps {
  bills: any[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ bills }) => {
  const [visibleBills, setVisibleBills] = useState<any[]>([]);

  useEffect(() => {
    if (!bills || bills.length === 0) return;
    
    // Simulate new bills coming in
    setVisibleBills(bills.slice(0, 5));
  }, [bills]);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return Banknote;
      case 'card':
        return CreditCard;
      case 'esewa':
      case 'khalti':
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'from-green-500 to-emerald-600';
      case 'card':
        return 'from-blue-500 to-indigo-600';
      case 'esewa':
      case 'khalti':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!bills || bills.length === 0) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="text-center text-gray-500">
          <Receipt className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Live Activity Feed</h3>
            <p className="text-gray-400 text-sm">Real-time transactions</p>
          </div>
        </div>
        <motion.div
          className="flex items-center space-x-2 text-green-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-sm font-semibold">LIVE</span>
        </motion.div>
      </div>

      <div className="space-y-3 overflow-x-auto">
        <AnimatePresence mode="popLayout">
          {visibleBills.map((bill, idx) => {
            const PaymentIcon = getPaymentIcon(bill.paymentMethod);
            const paymentColor = getPaymentColor(bill.paymentMethod);

            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  delay: idx * 0.05,
                }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${paymentColor} rounded-xl flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <PaymentIcon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-semibold">{bill.billNumber}</p>
                        <span className="text-gray-500">•</span>
                        <p className="text-gray-400 text-sm">{bill.customerName}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(bill.date).toLocaleTimeString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Receipt className="w-3 h-3" />
                          <span>{bill.items.length} items</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <motion.p
                      className="text-white font-bold text-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: idx * 0.05 + 0.2 }}
                    >
                      NPR {bill.total.toLocaleString()}
                    </motion.p>
                    <div className="flex items-center space-x-1 text-green-400 text-xs mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{bill.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-orange-500 to-red-600 mt-3 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
