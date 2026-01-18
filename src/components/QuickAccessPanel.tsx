import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  User,
  ShoppingCart,
  Package,
  Shield,
  Users,
  Settings,
  ChevronRight,
  Copy,
  Check,
  X,
  Key,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface QuickAccessPanelProps {
  onClose: () => void;
}

interface TestAccount {
  role: string;
  email: string;
  password: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const testAccounts: TestAccount[] = [
    {
      role: "Super Admin",
      email: "superadmin@servespares.com",
      password: "SuperAdmin@2024",
      description: "Full system access, manage all admins and tenants",
      icon: Shield,
      color: "from-red-500 to-pink-500",
    },
    {
      role: "Admin",
      email: "admin@demo.com",
      password: "Demo@123",
      description: "Business owner with full dashboard access",
      icon: Users,
      color: "from-blue-500 to-indigo-500",
    },
    {
      role: "Inventory Manager",
      email: "inventory@demo.com",
      password: "Demo@123",
      description: "Manage products, stock, and suppliers",
      icon: Package,
      color: "from-green-500 to-emerald-500",
    },
    {
      role: "Cashier",
      email: "cashier@demo.com",
      password: "Demo@123",
      description: "POS system, billing, and sales",
      icon: ShoppingCart,
      color: "from-purple-500 to-violet-500",
    },
  ];

  const handleCopy = (text: string, field: string) => {
    // Try modern clipboard API first
    if (
      navigator.clipboard &&
      navigator.clipboard.writeText &&
      window.isSecureContext
    ) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedField(field);
          toast.success(`${field} copied to clipboard`);
          setTimeout(() => setCopiedField(null), 2000);
        })
        .catch(() => {
          // Fallback method
          fallbackCopyToClipboard(text, field);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text, field);
    }
  };

  const fallbackCopyToClipboard = (text: string, field: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  const quickActions = [
    {
      title: "Customer Shopping",
      description: "Browse products, add to cart, place orders",
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-cyan-500 to-blue-500",
      action: () => {
        toast.info("Navigate to Customer Portal from Entry Page");
      },
    },
    {
      title: "Test Customer Login",
      description: "Use: customer@demo.com / demo123",
      icon: User,
      color: "bg-gradient-to-br from-green-500 to-teal-500",
      action: () => {
        handleCopy("customer@demo.com", "Customer Email");
      },
    },
    {
      title: "View Sample Orders",
      description: "6 sample orders with different statuses",
      icon: Package,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      action: () => {
        toast.success("Login as customer and go to Orders section");
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl text-white">Quick Access Panel</h2>
                <p className="text-indigo-100 text-sm">
                  Test accounts and quick actions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Sparkle effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Test Accounts Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl text-white">Test Accounts</h3>
            </div>
            <div className="grid gap-4">
              {testAccounts.map((account, index) => {
                const Icon = account.icon;
                return (
                  <motion.div
                    key={account.role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${account.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white mb-1">{account.role}</h4>
                        <p className="text-slate-400 text-sm mb-3">
                          {account.description}
                        </p>

                        {/* Credentials */}
                        <div className="space-y-2">
                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <code className="flex-1 text-sm bg-slate-900/50 px-3 py-1.5 rounded text-cyan-400 border border-slate-700 font-mono">
                              {account.email}
                            </code>
                            <button
                              onClick={() => handleCopy(account.email, "Email")}
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="Copy email"
                            >
                              {copiedField === "Email" ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {/* Password */}
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <code className="flex-1 text-sm bg-slate-900/50 px-3 py-1.5 rounded text-pink-400 border border-slate-700 font-mono">
                              {account.password}
                            </code>
                            <button
                              onClick={() =>
                                handleCopy(account.password, "Password")
                              }
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="Copy password"
                            >
                              {copiedField === "Password" ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl text-white">Quick Actions</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={action.action}
                    className={`${action.color} p-4 rounded-xl text-white hover:shadow-lg transition-all group`}
                  >
                    <Icon className="w-8 h-8 mb-3 mx-auto" />
                    <h4 className="text-sm mb-1">{action.title}</h4>
                    <p className="text-xs text-white/80 mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Click to test</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white text-sm mb-1">💡 Pro Tip</h4>
                <p className="text-slate-400 text-xs">
                  All accounts are pre-configured and ready to use. No setup
                  required! Click the copy buttons to quickly paste credentials
                  into login forms.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
