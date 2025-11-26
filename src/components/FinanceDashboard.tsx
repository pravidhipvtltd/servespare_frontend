import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Settings, Wrench, LogOut, Menu, X, TrendingUp, TrendingDown,
  LayoutDashboard, FileText, CreditCard, Wallet, ChevronRight, Building2,
  BarChart3, PieChart, Download, Calendar, ArrowUpCircle, ArrowDownCircle,
  Package, ShoppingCart, Users, Receipt, AlertCircle, CheckCircle, Clock,
  FileCheck, Banknote, RefreshCw, Filter, Search, Plus, Eye, Edit2,
  Printer, Mail, Phone, MapPin, User, Tag, Percent, Calculator
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSync } from '../contexts/SyncContext';
import { usePermissions } from '../contexts/PermissionContext';
import { PermissionGuard } from './PermissionGuard';
import { Bill, BankAccount, CashTransaction, InventoryItem, Party } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { getPermissionForPanel } from '../utils/permissionMapping';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, panel: 'dashboard' },
  { id: 'sales', label: 'Sales Finance', icon: ShoppingCart, panel: 'sales' },
  { id: 'purchases', label: 'Purchase Finance', icon: Package, panel: 'purchases' },
  { id: 'supplier-ledger', label: 'Supplier Ledger', icon: Users, panel: 'supplier-ledger' },
  { id: 'customer-ledger', label: 'Customer Ledger', icon: FileText, panel: 'customer-ledger' },
  { id: 'expenses', label: 'Expenses', icon: ArrowDownCircle, panel: 'expenses' },
  { id: 'cash-bank', label: 'Cash & Bank', icon: Wallet, panel: 'cash-bank' },
  { id: 'cheques', label: 'Cheque Management', icon: FileCheck, panel: 'cheques' },
  { id: 'returns', label: 'Returns', icon: RefreshCw, panel: 'returns' },
  { id: 'tax', label: 'Tax & VAT', icon: Percent, panel: 'tax' },
  { id: 'pl', label: 'Profit & Loss', icon: TrendingUp, panel: 'pl' },
  { id: 'inventory-value', label: 'Inventory Valuation', icon: Calculator, panel: 'inventory-value' },
  { id: 'reports', label: 'Reports', icon: BarChart3, panel: 'reports' },
];

export const FinanceDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cheques, setCheques] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const allBills: Bill[] = getFromStorage('bills', []);
    const allBankAccounts: BankAccount[] = getFromStorage('bankAccounts', []);
    const allCashTransactions: CashTransaction[] = getFromStorage('cashTransactions', []);
    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    const allParties: Party[] = getFromStorage('parties', []);
    const allExpenses: any[] = getFromStorage('expenses', []);
    const allCheques: any[] = getFromStorage('cheques', []);
    const allReturns: any[] = getFromStorage('returns', []);

    setBills(allBills.filter(b => b.workspaceId === currentUser?.workspaceId));
    setBankAccounts(allBankAccounts.filter(b => b.workspaceId === currentUser?.workspaceId));
    setCashTransactions(allCashTransactions.filter(c => c.workspaceId === currentUser?.workspaceId));
    setInventory(allInventory.filter(i => i.workspaceId === currentUser?.workspaceId));
    setParties(allParties.filter(p => p.workspaceId === currentUser?.workspaceId));
    setExpenses(allExpenses.filter(e => e.workspaceId === currentUser?.workspaceId));
    setCheques(allCheques.filter(c => c.workspaceId === currentUser?.workspaceId));
    setReturns(allReturns.filter(r => r.workspaceId === currentUser?.workspaceId));
  };

  const renderPanel = () => {
    const panelContent = (() => {
      switch (activePanel) {
        case 'dashboard':
          return <DashboardView 
            bills={bills}
            bankAccounts={bankAccounts}
            cashTransactions={cashTransactions}
            inventory={inventory}
            parties={parties}
            expenses={expenses}
            cheques={cheques}
            onNavigate={setActivePanel}
          />;
        case 'sales':
          return <SalesFinanceView bills={bills} />;
        case 'purchases':
          return <PurchaseFinanceView parties={parties} inventory={inventory} />;
        case 'supplier-ledger':
          return <SupplierLedgerView parties={parties} onUpdate={loadData} currentUser={currentUser} />;
        case 'customer-ledger':
          return <CustomerLedgerView parties={parties} bills={bills} onUpdate={loadData} currentUser={currentUser} />;
        case 'expenses':
          return <ExpensesView expenses={expenses} onUpdate={loadData} currentUser={currentUser} />;
        case 'cash-bank':
          return <CashBankView 
            bankAccounts={bankAccounts}
            cashTransactions={cashTransactions}
            bills={bills}
            onUpdate={loadData}
            currentUser={currentUser}
          />;
        case 'cheques':
          return <ChequesView cheques={cheques} onUpdate={loadData} currentUser={currentUser} />;
        case 'returns':
          return <ReturnsView returns={returns} bills={bills} onUpdate={loadData} currentUser={currentUser} />;
        case 'tax':
          return <TaxVATView bills={bills} />;
        case 'pl':
          return <ProfitLossView bills={bills} expenses={expenses} inventory={inventory} />;
        case 'inventory-value':
          return <InventoryValuationView inventory={inventory} />;
        case 'reports':
          return <ReportsView 
            bills={bills}
            expenses={expenses}
            inventory={inventory}
            parties={parties}
            cheques={cheques}
          />;
        default:
          return <DashboardView 
            bills={bills}
            bankAccounts={bankAccounts}
            cashTransactions={cashTransactions}
            inventory={inventory}
            parties={parties}
            expenses={expenses}
            cheques={cheques}
            onNavigate={setActivePanel}
          />;
      }
    })();

    const permissionKey = getPermissionForPanel(activePanel);
    
    return (
      <PermissionGuard permission={permissionKey}>
        {panelContent}
      </PermissionGuard>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}>
        {/* Logo & Brand */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              
              <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 left-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border border-white/40 rotate-45"></div>
                </div>
                
                <Settings 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/30 animate-spin" 
                  style={{ animationDuration: '20s' }}
                />
                <Wrench 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/50 rotate-45 drop-shadow-lg"
                />
                <Settings 
                  className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-spin z-10" 
                  style={{ animationDuration: '15s', animationDirection: 'reverse' }}
                />
                
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-90" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl tracking-wide animate-pulse">
                Serve Spares
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 blur-lg opacity-50 animate-pulse"></span>
            </h1>
            <p className="text-gray-400 text-xs relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent font-semibold tracking-wide animate-pulse" style={{ animationDelay: '200ms' }}>
                Inventory System
              </span>
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel || item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all group text-sm ${
                activePanel === (item.panel || item.id)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
                <item.icon className={`w-4 h-4 ${
                activePanel === (item.panel || item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{currentUser?.name}</div>
              <div className="text-gray-400 text-xs">Finance Manager</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="text-gray-900 text-xl font-bold">
                {menuItems.find(m => m.panel === activePanel || m.id === activePanel)?.label}
              </h2>
              <p className="text-gray-500 text-sm">
                {currentTime.toLocaleString('en-NP', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Panel Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView: React.FC<any> = ({ 
  bills, bankAccounts, cashTransactions, inventory, parties, expenses, cheques, onNavigate 
}) => {
  // Calculate Financial KPIs
  const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;
  
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalCashIn = cashTransactions.filter(c => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
  const totalCashOut = cashTransactions.filter(c => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);
  const cashInHand = totalCashIn - totalCashOut;
  
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const suppliers = parties.filter(p => p.type === 'supplier');
  const customers = parties.filter(p => p.type === 'customer');
  const supplierDues = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
  const customerDues = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  
  const pendingCheques = cheques.filter(c => c.status === 'pending').length;
  
  const todayBills = bills.filter(b => 
    new Date(b.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `NPR ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+12%'
    },
    { 
      label: 'Total Profit', 
      value: `NPR ${totalProfit.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+8%'
    },
    { 
      label: 'Bank Balance', 
      value: `NPR ${totalBankBalance.toLocaleString()}`, 
      icon: Building2, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    { 
      label: 'Cash in Hand', 
      value: `NPR ${cashInHand.toLocaleString()}`, 
      icon: Wallet, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    { 
      label: 'Inventory Value', 
      value: `NPR ${totalInventoryValue.toLocaleString()}`, 
      icon: Package, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    { 
      label: 'Customer Dues', 
      value: `NPR ${customerDues.toLocaleString()}`, 
      icon: Users, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    { 
      label: 'Supplier Dues', 
      value: `NPR ${supplierDues.toLocaleString()}`, 
      icon: FileText, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    { 
      label: 'Pending Cheques', 
      value: pendingCheques, 
      icon: FileCheck, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">NPR {todayRevenue.toLocaleString()}</h2>
            <p className="text-blue-100">Today's Revenue ({todayBills.length} transactions)</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.trend && (
                <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
              )}
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('sales')}
          className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-green-500/50 transition-all text-left"
        >
          <ShoppingCart className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-bold mb-2">Sales Finance</h3>
          <p className="text-green-100 text-sm mb-4">View all sales & income</p>
          <div className="flex items-center text-white font-semibold">
            <span>View Details</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('supplier-ledger')}
          className="group bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-red-500/50 transition-all text-left"
        >
          <Users className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-bold mb-2">Supplier Ledger</h3>
          <p className="text-red-100 text-sm mb-4">Track payables & dues</p>
          <div className="flex items-center text-white font-semibold">
            <span>Manage Suppliers</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('pl')}
          className="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all text-left"
        >
          <TrendingUp className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-bold mb-2">Profit & Loss</h3>
          <p className="text-purple-100 text-sm mb-4">Business performance</p>
          <div className="flex items-center text-white font-semibold">
            <span>View Report</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {bills.slice(0, 5).map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-gray-900 font-semibold text-sm">{bill.billNumber}</div>
                  <div className="text-gray-500 text-xs">{bill.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">NPR {bill.total.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">{bill.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-gray-900 font-semibold text-sm">{expense.category}</div>
                  <div className="text-gray-500 text-xs">{expense.description}</div>
                </div>
                <div className="text-red-600 font-bold">NPR {expense.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sales Finance View
const SalesFinanceView: React.FC<{ bills: Bill[] }> = ({ bills }) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    const today = new Date();
    
    let dateMatch = true;
    if (dateFilter === 'today') {
      dateMatch = billDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateMatch = billDate >= weekAgo;
    } else if (dateFilter === 'month') {
      dateMatch = billDate.getMonth() === today.getMonth() && billDate.getFullYear() === today.getFullYear();
    }

    const paymentMatch = paymentFilter === 'all' || bill.paymentMethod === paymentFilter;

    return dateMatch && paymentMatch;
  });

  const totalSales = filteredBills.reduce((sum, b) => sum + b.total, 0);
  const totalDiscount = filteredBills.reduce((sum, b) => sum + b.discount, 0);
  const totalTax = filteredBills.reduce((sum, b) => sum + b.tax, 0);
  const netAmount = filteredBills.reduce((sum, b) => sum + b.subtotal, 0);

  const cashSales = filteredBills.filter(b => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.total, 0);
  const creditSales = filteredBills.filter(b => b.paymentMethod === 'credit').reduce((sum, b) => sum + b.total, 0);
  const digitalSales = filteredBills.filter(b => ['esewa', 'khalti', 'fonepay'].includes(b.paymentMethod)).reduce((sum, b) => sum + b.total, 0);
  const cardSales = filteredBills.filter(b => b.paymentMethod === 'card').reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date Filter</label>
            <div className="flex space-x-2">
              {['today', 'week', 'month', 'all'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    dateFilter === filter
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Payment Method</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="fonepay">FonePay</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-green-700 font-semibold mb-1">Total Sales</h4>
          <p className="text-green-600 text-3xl font-bold">NPR {totalSales.toLocaleString()}</p>
          <p className="text-green-600 text-sm mt-1">{filteredBills.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-blue-700 font-semibold mb-1">Net Amount</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {netAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
          <h4 className="text-orange-700 font-semibold mb-1">Total Discount</h4>
          <p className="text-orange-600 text-3xl font-bold">NPR {totalDiscount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <h4 className="text-purple-700 font-semibold mb-1">Total VAT</h4>
          <p className="text-purple-600 text-3xl font-bold">NPR {totalTax.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-green-700 text-sm font-semibold mb-1">Cash Sales</div>
            <div className="text-green-600 text-2xl font-bold">NPR {cashSales.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-blue-700 text-sm font-semibold mb-1">Card Sales</div>
            <div className="text-blue-600 text-2xl font-bold">NPR {cardSales.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-purple-700 text-sm font-semibold mb-1">Digital Wallet</div>
            <div className="text-purple-600 text-2xl font-bold">NPR {digitalSales.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-yellow-700 text-sm font-semibold mb-1">Credit Sales</div>
            <div className="text-yellow-600 text-2xl font-bold">NPR {creditSales.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Sales Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Invoice #</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Customer</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Payment</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Subtotal</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Discount</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">VAT</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Total</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(bill => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{bill.billNumber}</td>
                  <td className="py-3 px-4 text-gray-700">{bill.customerName}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bill.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                      bill.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                      bill.paymentMethod === 'credit' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {bill.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">NPR {bill.subtotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-orange-600">NPR {bill.discount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-purple-600">NPR {bill.tax.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">NPR {bill.total.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{bill.cashierName || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Purchase Finance View
const PurchaseFinanceView: React.FC<{ parties: Party[]; inventory: InventoryItem[] }> = ({ parties, inventory }) => {
  const suppliers = parties.filter(p => p.type === 'supplier');
  
  // Calculate purchase stats from inventory items
  const totalPurchaseValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSupplierDues = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-blue-700 font-semibold mb-1">Total Purchase Value</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {totalPurchaseValue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
          <h4 className="text-red-700 font-semibold mb-1">Supplier Dues</h4>
          <p className="text-red-600 text-3xl font-bold">NPR {totalSupplierDues.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-green-700 font-semibold mb-1">Total Suppliers</h4>
          <p className="text-green-600 text-3xl font-bold">{suppliers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Purchase Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Part Name</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Part Number</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Quantity</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Cost Price</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Total Value</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.partNumber}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold">NPR {item.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">NPR {(item.price * item.quantity).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{item.supplier || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Supplier Ledger View
const SupplierLedgerView: React.FC<any> = ({ parties, onUpdate, currentUser }) => {
  const suppliers = parties.filter((p: Party) => p.type === 'supplier');
  const totalDues = suppliers.reduce((sum: number, s: Party) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Total Supplier Dues</h2>
        <p className="text-4xl font-bold">NPR {totalDues.toLocaleString()}</p>
        <p className="text-red-100 mt-2">{suppliers.length} active suppliers</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Supplier Accounts</h3>
        <div className="space-y-4">
          {suppliers.map((supplier: Party) => (
            <div key={supplier.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-gray-900 font-bold text-lg mb-1">{supplier.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {supplier.phone}</span>
                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {supplier.email}</span>
                  </div>
                  {supplier.address && (
                    <p className="text-gray-600 text-sm mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {supplier.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-gray-600 text-sm mb-1">Outstanding Balance</div>
                  <div className={`text-3xl font-bold ${(supplier.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    NPR {(supplier.balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              {supplier.gstNumber && (
                <div className="text-gray-600 text-sm">
                  <span className="font-semibold">GST/VAT:</span> {supplier.gstNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Customer Ledger View
const CustomerLedgerView: React.FC<any> = ({ parties, bills, onUpdate, currentUser }) => {
  const customers = parties.filter((p: Party) => p.type === 'customer');
  const totalReceivables = customers.reduce((sum: number, c: Party) => sum + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Total Customer Dues</h2>
        <p className="text-4xl font-bold">NPR {totalReceivables.toLocaleString()}</p>
        <p className="text-yellow-100 mt-2">{customers.length} credit customers</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Customer Accounts</h3>
        <div className="space-y-4">
          {customers.map((customer: Party) => {
            const customerBills = bills.filter((b: Bill) => b.customerPhone === customer.phone);
            const totalCredit = customerBills.reduce((sum: number, b: Bill) => sum + b.total, 0);

            return (
              <div key={customer.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-bold text-lg mb-1">{customer.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {customer.phone}</span>
                      {customer.email && <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {customer.email}</span>}
                    </div>
                    <div className="text-gray-600 text-sm mt-2">
                      <span className="font-semibold">Total Purchases:</span> NPR {totalCredit.toLocaleString()} ({customerBills.length} bills)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">Amount Due</div>
                    <div className={`text-3xl font-bold ${(customer.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      NPR {(customer.balance || 0).toLocaleString()}
                    </div>
                    {(customer.balance || 0) > 0 && (
                      <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Expenses View
const ExpensesView: React.FC<any> = ({ expenses, onUpdate, currentUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    description: '',
    paymentMode: 'cash',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = () => {
    const newExpense = {
      id: `exp${Date.now()}`,
      ...formData,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    const allExpenses: any[] = getFromStorage('expenses', []);
    saveToStorage('expenses', [...allExpenses, newExpense]);
    onUpdate();
    setShowAddModal(false);
    setFormData({ category: '', amount: 0, description: '', paymentMode: 'cash', date: new Date().toISOString().split('T')[0] });
  };

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  const categories = ['Salary', 'Electricity', 'Rent', 'Transportation', 'Packaging', 'Internet', 'Miscellaneous'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 flex-1 mr-4">
          <h4 className="text-red-700 font-semibold mb-1">Total Expenses</h4>
          <p className="text-red-600 text-4xl font-bold">NPR {totalExpenses.toLocaleString()}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Expense Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Description</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Payment Mode</th>
                <th className="text-right py-3 px-4 text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense: any) => (
                <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{expense.description}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{expense.paymentMode}</td>
                  <td className="py-3 px-4 text-right font-bold text-red-600">NPR {expense.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">Add Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cash & Bank View
const CashBankView: React.FC<any> = ({ 
  bankAccounts, cashTransactions, bills, onUpdate, currentUser 
}) => {
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    ifscCode: '',
    balance: 0,
  });

  const totalBankBalance = bankAccounts.reduce((sum: number, b: BankAccount) => sum + b.balance, 0);
  const totalCashIn = cashTransactions.filter((c: CashTransaction) => c.type === 'in').reduce((sum: number, c: CashTransaction) => sum + c.amount, 0);
  const totalCashOut = cashTransactions.filter((c: CashTransaction) => c.type === 'out').reduce((sum: number, c: CashTransaction) => sum + c.amount, 0);
  const cashInHand = totalCashIn - totalCashOut;

  const handleAddBank = () => {
    const newAccount: BankAccount = {
      id: `bank${Date.now()}`,
      ...bankFormData,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
    };

    const allAccounts: BankAccount[] = getFromStorage('bankAccounts', []);
    saveToStorage('bankAccounts', [...allAccounts, newAccount]);
    onUpdate();
    setShowAddBankModal(false);
    setBankFormData({ bankName: '', accountNumber: '', accountHolder: '', ifscCode: '', balance: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <Building2 className="w-8 h-8 text-blue-600 mb-3" />
          <h4 className="text-blue-700 font-semibold mb-1">Bank Balance</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {totalBankBalance.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <Wallet className="w-8 h-8 text-green-600 mb-3" />
          <h4 className="text-green-700 font-semibold mb-1">Cash in Hand</h4>
          <p className="text-green-600 text-3xl font-bold">NPR {cashInHand.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="text-purple-700 font-semibold mb-1">Total Available</h4>
          <p className="text-purple-600 text-3xl font-bold">NPR {(totalBankBalance + cashInHand).toLocaleString()}</p>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-900 font-bold text-lg">Bank Accounts</h3>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map((account: BankAccount) => (
            <div key={account.id} className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <Building2 className="w-8 h-8 mb-4 opacity-80" />
              <h4 className="font-bold text-xl mb-1">{account.bankName}</h4>
              <p className="text-blue-100 text-sm mb-4">{account.accountHolder}</p>
              <p className="text-white text-3xl font-bold mb-4">NPR {account.balance.toLocaleString()}</p>
              <div className="text-blue-100 text-xs space-y-1">
                <p>A/C: {account.accountNumber}</p>
                <p>IFSC: {account.ifscCode}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Cash Transactions</h3>
        <div className="space-y-3">
          {cashTransactions.slice(0, 10).map((txn: CashTransaction) => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  txn.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {txn.type === 'in' ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">{txn.description}</div>
                  <div className="text-gray-500 text-sm">{txn.category} • {new Date(txn.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={`font-bold text-lg ${txn.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                {txn.type === 'in' ? '+' : '-'} NPR {txn.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">Add Bank Account</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bank Name"
                value={bankFormData.bankName}
                onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={bankFormData.accountNumber}
                onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Holder"
                value={bankFormData.accountHolder}
                onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="IFSC Code"
                value={bankFormData.ifscCode}
                onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Opening Balance"
                value={bankFormData.balance}
                onChange={(e) => setBankFormData({ ...bankFormData, balance: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddBankModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBank}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cheques View - Placeholder with basic structure
const ChequesView: React.FC<any> = ({ cheques, onUpdate, currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Cheque Management</h2>
        <p className="text-purple-100">Track received and issued cheques</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">No cheques recorded yet</h3>
        <p className="text-gray-600">Cheque management feature coming soon...</p>
      </div>
    </div>
  );
};

// Returns View - Placeholder
const ReturnsView: React.FC<any> = ({ returns, bills, onUpdate, currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Return Management</h2>
        <p className="text-orange-100">Manage sales and purchase returns</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">No returns recorded yet</h3>
        <p className="text-gray-600">Return management feature coming soon...</p>
      </div>
    </div>
  );
};

// Tax & VAT View
const TaxVATView: React.FC<{ bills: Bill[] }> = ({ bills }) => {
  const totalTax = bills.reduce((sum, b) => sum + b.tax, 0);
  const totalSales = bills.reduce((sum, b) => sum + b.total, 0);
  const taxableAmount = bills.reduce((sum, b) => sum + b.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <h4 className="text-purple-700 font-semibold mb-1">Total VAT Collected</h4>
          <p className="text-purple-600 text-3xl font-bold">NPR {totalTax.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-blue-700 font-semibold mb-1">Taxable Amount</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {taxableAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-green-700 font-semibold mb-1">Total Sales</h4>
          <p className="text-green-600 text-3xl font-bold">NPR {totalSales.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Tax Summary by Month</h3>
        <p className="text-gray-600">Detailed tax reports available for download</p>
      </div>
    </div>
  );
};

// Profit & Loss View
const ProfitLossView: React.FC<{ bills: Bill[]; expenses: any[]; inventory: InventoryItem[] }> = ({ 
  bills, expenses, inventory 
}) => {
  const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCOGS = bills.reduce((sum, b) => {
    return sum + b.items.reduce((itemSum, item) => {
      const invItem = inventory.find(i => i.id === item.itemId);
      return itemSum + ((invItem?.price || 0) * item.quantity);
    }, 0);
  }, 0);
  
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Profit & Loss Statement</h2>
        <p className="text-4xl font-bold">NPR {netProfit.toLocaleString()}</p>
        <p className="text-green-100 mt-2">Net Profit • {profitMargin}% margin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Income</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Total Revenue</span>
              <span className="text-green-600 font-bold">NPR {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cost of Goods Sold</span>
              <span className="text-red-600 font-bold">NPR {totalCOGS.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <span className="text-gray-900 font-semibold">Gross Profit</span>
              <span className="text-blue-600 font-bold text-lg">NPR {grossProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Expenses</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Total Expenses</span>
              <span className="text-red-600 font-bold">NPR {totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="text-gray-900 font-semibold">Net Profit</span>
              <span className="text-green-600 font-bold text-lg">NPR {netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Valuation View
const InventoryValuationView: React.FC<{ inventory: InventoryItem[] }> = ({ inventory }) => {
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalRetailValue = inventory.reduce((sum, item) => sum + ((item.retailPrice || item.price) * item.quantity), 0);
  const potentialProfit = totalRetailValue - totalValue;
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const agingStock = inventory.filter(item => new Date(item.createdAt) < sixMonthsAgo);
  const agingValue = agingStock.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-blue-700 font-semibold mb-1">Total Inventory Value</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {totalValue.toLocaleString()}</p>
          <p className="text-blue-600 text-sm mt-1">{inventory.length} items</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-green-700 font-semibold mb-1">Potential Revenue</h4>
          <p className="text-green-600 text-3xl font-bold">NPR {totalRetailValue.toLocaleString()}</p>
          <p className="text-green-600 text-sm mt-1">If all sold at retail</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <h4 className="text-purple-700 font-semibold mb-1">Potential Profit</h4>
          <p className="text-purple-600 text-3xl font-bold">NPR {potentialProfit.toLocaleString()}</p>
          <p className="text-purple-600 text-sm mt-1">Margin on current stock</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Aging Stock (6+ months old)</h3>
        <div className="mb-4">
          <div className="text-yellow-600 text-2xl font-bold">NPR {agingValue.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">{agingStock.length} items aging</div>
        </div>
        <div className="space-y-3">
          {agingStock.slice(0, 10).map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div>
                <div className="text-gray-900 font-semibold">{item.name}</div>
                <div className="text-gray-600 text-sm">Qty: {item.quantity} • Added: {new Date(item.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-bold">NPR {(item.price * item.quantity).toLocaleString()}</div>
                <div className="text-yellow-600 text-xs font-semibold">Old Stock</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reports View
const ReportsView: React.FC<any> = ({ bills, expenses, inventory, parties, cheques }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Financial Reports</h2>
        <p className="text-indigo-100">Download and export financial data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Sales Report', desc: 'Complete sales data with invoices', icon: ShoppingCart },
          { name: 'Purchase Report', desc: 'Purchase history and supplier data', icon: Package },
          { name: 'Expense Report', desc: 'All business expenses breakdown', icon: ArrowDownCircle },
          { name: 'Profit & Loss', desc: 'Financial performance summary', icon: TrendingUp },
          { name: 'Tax Report', desc: 'VAT and tax compliance data', icon: Percent },
          { name: 'Inventory Report', desc: 'Stock valuation and aging', icon: Calculator },
        ].map((report, idx) => (
          <button
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <report.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">{report.name}</h3>
            <p className="text-gray-600 text-sm">{report.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
