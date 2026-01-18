import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Shield,
  ArrowRight,
  Users,
  Store,
  Zap,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { QuickAccessPanel } from "./QuickAccessPanel";

interface EntryLandingPageProps {
  onSelectCustomer: () => void;
  onSelectAdmin: () => void;
}

export const EntryLandingPage: React.FC<EntryLandingPageProps> = ({
  onSelectCustomer,
  onSelectAdmin,
}) => {
  const [showQuickAccess, setShowQuickAccess] = React.useState(false);

  // Show welcome toast on mount
  React.useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("has_seen_welcome");
    if (!hasSeenWelcome) {
      setTimeout(() => {
        toast.success("System Ready! 🚀", {
          description: 'Click "View All Test Accounts" below to get started',
          duration: 5000,
        });
        sessionStorage.setItem("has_seen_welcome", "true");
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="items-center flex justify-center">
            <button className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Settings className="text-white" size={28} />
              </motion.div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Serve Spares
                </div>
              </div>
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Welcome to Serve Spares
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Choose how you'd like to access the system
          </p>

          {/* System Ready Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm shadow-lg"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>System Ready • All Features Working</span>
          </motion.div>
        </motion.div>

        {/* Two Card Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={onSelectCustomer}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-indigo-500 transition-all h-full">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Shop as Customer
              </h2>

              <p className="text-gray-600 mb-6">
                Browse auto parts from multiple sellers, add to cart, and make
                secure payments. Perfect for customers looking to purchase spare
                parts.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span>Browse products from all sellers</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span>Add items to cart & checkout</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span>Pay with eSewa or FonePay</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span>Track your orders</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                <Store className="w-5 h-5" />
                <span>Enter Customer Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Admin Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={onSelectAdmin}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-orange-500 transition-all h-full">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Admin Dashboard
              </h2>

              <p className="text-gray-600 mb-6">
                Manage your inventory, track sales, handle orders, and grow your
                auto parts business. For business owners and administrators.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>Manage inventory & products</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>Process orders & payments</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>Analytics & reports</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <ArrowRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>Multi-user management</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            New to Serve Spares?{" "}
            <span className="text-indigo-600 font-semibold">
              Sign up as a customer
            </span>{" "}
            or{" "}
            <span className="text-orange-600 font-semibold">
              contact us to become a seller
            </span>
          </p>
        </motion.div>
      </div>

      {/* Quick Access Panel */}
      <AnimatePresence>
        {showQuickAccess && (
          <QuickAccessPanel onClose={() => setShowQuickAccess(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
