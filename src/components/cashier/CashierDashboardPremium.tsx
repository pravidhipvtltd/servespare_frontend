import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, ShoppingCart, RotateCcw, History, Wallet,
  TrendingUp, DollarSign, Users, Package, Clock, Zap,
  ArrowUpCircle, ArrowDownCircle, ArrowRight, Activity,
  CreditCard, Banknote, Smartphone, AlertCircle, CheckCircle,
  Menu, X, LogOut, Settings, Wrench, Bell, Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { DashboardCard } from './DashboardCard';
import { ShiftStatusBar } from './ShiftStatusBar';
import { LiveActivityFeed } from './LiveActivityFeed';
import { POSSystem } from './POS/POSSystem';
import { SalesReturnsPanel } from './SalesReturnsPanel';
import { SalesHistoryAdvanced } from './SalesHistoryAdvanced';
import { CashDrawerManagement } from './CashDrawerManagement';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  page: string;
  badge?: number;
};

export const CashierDashboardPremium: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [todayStats, setTodayStats] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    loadShift();
    calculateStats();
    
    return () => clearInterval(timer);
  }, []);

  const loadShift = () => {
    const shifts = getFromStorage('cashier_shifts', []);
    const active = shifts.find((s: any) => s.cashierId === currentUser?.id && s.status === 'active');
    setCurrentShift(active || null);
  };

  const calculateStats = () => {
    const bills = getFromStorage('bills', []);
    const returns = getFromStorage('sales_returns', []);
    const today = new Date().toDateString();
    
    const todayBills = bills.filter((b: any) => 
      new Date(b.date).toDateString() === today && 
      b.workspaceId === currentUser?.workspaceId &&
      b.status !== 'returned'
    );
    
    const todayReturns = returns.filter((r: any) => 
      new Date(r.returnDate).toDateString() === today &&
      r.workspaceId === currentUser?.workspaceId
    );

    const totalSales = todayBills.reduce((sum: number, b: any) => sum + b.total, 0);
    const totalReturns = todayReturns.reduce((sum: number, r: any) => sum + r.total, 0);
    const cashSales = todayBills.filter((b: any) => b.paymentMethod === 'cash');
    const nonCashSales = todayBills.filter((b: any) => b.paymentMethod !== 'cash');
    const cashAmount = cashSales.reduce((sum: number, b: any) => sum + b.total, 0);
    const nonCashAmount = nonCashSales.reduce((sum: number, b: any) => sum + b.total, 0);

    setTodayStats({
      totalSales,
      totalReturns,
      cashAmount,
      nonCashAmount,
      transactionCount: todayBills.length,
      avgInvoice: todayBills.length > 0 ? totalSales / todayBills.length : 0,
      cashDrawer: currentShift ? currentShift.startCash + cashAmount + currentShift.cashIn - currentShift.cashOut : 0,
      recentBills: todayBills.slice(0, 10).reverse()
    });
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { id: 'pos', label: 'Billing & POS', icon: ShoppingCart, page: 'pos' },
    { id: 'returns', label: 'Sales Returns', icon: RotateCcw, page: 'returns' },
    { id: 'history', label: 'Sales History', icon: History, page: 'history' },
    { id: 'cash', label: 'Cash Drawer', icon: Wallet, page: 'cash' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView stats={todayStats} shift={currentShift} onRefresh={calculateStats} />;
      case 'pos':
        return <POSSystem shift={currentShift} onSaleComplete={calculateStats} />;
      case 'returns':
        return <SalesReturnsPanel onReturnComplete={calculateStats} />;
      case 'history':
        return <SalesHistoryAdvanced />;
      case 'cash':
        return <CashDrawerManagement shift={currentShift} onShiftChange={loadShift} />;
      default:
        return <DashboardView stats={todayStats} shift={currentShift} onRefresh={calculateStats} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-72 bg-gray-900/40 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-10"
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="relative w-12 h-12 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl blur-lg opacity-75" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Settings className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '20s' }} />
                    <Wrench className="absolute w-5 h-5 text-white/80 rotate-45" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl">
                    Serve Spares
                  </h1>
                  <p className="text-gray-400 text-xs">Cashier Terminal</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
              {menuItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActivePage(item.page)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl text-left transition-all relative group ${
                    activePage === item.page
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {activePage === item.page && (
                    <motion.div
                      className="absolute left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-600 rounded-r-full"
                      layoutId="activeIndicator"
                    />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{currentUser?.name}</p>
                  <p className="text-gray-400 text-xs">Cashier</p>
                </div>
              </div>
              <motion.button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="bg-gray-900/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </motion.button>
              <div>
                <h2 className="text-xl font-bold text-white">{menuItems.find(m => m.page === activePage)?.label || 'Dashboard'}</h2>
                <p className="text-sm text-gray-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                  <span>•</span>
                  <Globe className="w-4 h-4" />
                  <span>{currentTime.toLocaleDateString('en-NP')}</span>
                  <span>•</span>
                  <span>🇳🇵 NPR</span>
                </p>
              </div>
            </div>

            <ShiftStatusBar shift={currentShift} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView: React.FC<{ stats: any; shift: any; onRefresh: () => void }> = ({ stats, shift, onRefresh }) => {
  if (!stats) return null;

  const kpiCards = [
    {
      label: 'Total Sales Today',
      value: `NPR ${stats.totalSales.toLocaleString()}`,
      change: '+12%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      glow: 'shadow-green-500/50'
    },
    {
      label: 'Cash Drawer Balance',
      value: `NPR ${stats.cashDrawer.toLocaleString()}`,
      subtext: `Cash: ${stats.cashAmount.toLocaleString()}`,
      icon: Wallet,
      color: 'from-blue-500 to-indigo-600',
      glow: 'shadow-blue-500/50'
    },
    {
      label: 'Non-Cash Collection',
      value: `NPR ${stats.nonCashAmount.toLocaleString()}`,
      subtext: 'Card, eSewa, Khalti',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/50'
    },
    {
      label: 'Refunds Issued',
      value: `NPR ${stats.totalReturns.toLocaleString()}`,
      icon: RotateCcw,
      color: 'from-red-500 to-orange-600',
      glow: 'shadow-red-500/50'
    },
    {
      label: 'Transactions Count',
      value: stats.transactionCount,
      icon: Activity,
      color: 'from-yellow-500 to-orange-600',
      glow: 'shadow-yellow-500/50'
    },
    {
      label: 'Avg Invoice Value',
      value: `NPR ${Math.round(stats.avgInvoice).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/50'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, idx) => (
          <DashboardCard key={idx} {...card} delay={idx * 0.1} />
        ))}
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed bills={stats.recentBills} />

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton
          icon={ArrowDownCircle}
          label="Cash In"
          color="from-green-500 to-emerald-600"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={ArrowUpCircle}
          label="Cash Out"
          color="from-red-500 to-rose-600"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={ArrowRight}
          label="Transfer"
          color="from-blue-500 to-indigo-600"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={Clock}
          label="End Shift"
          color="from-orange-500 to-red-600"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: any;
  label: string;
  color: string;
  onClick: () => void;
}> = ({ icon: Icon, label, color, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${color} text-white p-6 rounded-2xl shadow-2xl group`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
      <div className="relative flex flex-col items-center space-y-2">
        <Icon className="w-8 h-8" />
        <span className="font-bold">{label}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </motion.button>
  );
};

export default CashierDashboardPremium;
