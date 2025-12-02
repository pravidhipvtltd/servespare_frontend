import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Package, TrendingUp, UserPlus, LogOut, Search, Edit, Trash2, Eye,
  Settings, Wrench, Shield, Activity, Bell, Database, FileText, Download,
  Lock, Unlock, EyeOff, RefreshCw, AlertTriangle, CheckCircle, XCircle,
  BarChart3, DollarSign, ShoppingCart, Menu, X, ChevronRight, Globe, Key,
  Server, HardDrive, Zap, Code, CreditCard, Calendar, Mail, Phone, MapPin,
  Filter, Plus, Check, Clock, Archive, GitBranch, Percent, Wallet, Tag,
  Copy, Save, Loader, Award, Star, TrendingDown, PieChart, ArrowUpCircle,
  ArrowDownCircle, Briefcase, Tool, Image, Trash, Upload, ExternalLink, Store, UserCheck,
  Layers, Crown, Sparkles, AlertCircle, BadgeCheck, Receipt, Banknote
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { IntegratedBranchManagement } from './panels/IntegratedBranchManagement';
import { PendingVerificationsPanel } from './panels/PendingVerificationsPanel';
import { AuditLogDetailed } from './AuditLogDetailed';
import { SystemSettingsFixed } from './SystemSettingsFixed';
import { AccessControlPanel } from './panels/AccessControlPanel';

// Subscription Package Types
export type SubscriptionPackage = 'basic' | 'professional' | 'enterprise';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  package: SubscriptionPackage;
  packagePrice: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  status: 'active' | 'suspended' | 'expired';
  dueAmount: number;
  lastPaymentDate: string;
  totalRevenue: number; // Their business revenue
  totalCustomers: number; // Their customers
  totalSales: number; // Their sales count
  createdAt: string;
  branches: number;
  users: number;
  products: number;
}

// Package Definitions
const PACKAGES = {
  basic: {
    name: 'Basic',
    price: 2500,
    features: {
      users: 3,
      products: 1000,
      branches: 1,
      support: 'Email'
    },
    color: 'blue',
    icon: Package
  },
  professional: {
    name: 'Professional',
    price: 5000,
    features: {
      users: 10,
      products: 10000,
      branches: 5,
      support: 'Priority'
    },
    color: 'purple',
    icon: Crown
  },
  enterprise: {
    name: 'Enterprise',
    price: 10000,
    features: {
      users: 'Unlimited',
      products: 'Unlimited',
      branches: 'Unlimited',
      support: '24/7'
    },
    color: 'orange',
    icon: Sparkles
  }
};

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, panel: 'dashboard' },
  { id: 'admins', label: 'Admin Accounts', icon: Users, panel: 'admins' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, panel: 'subscriptions' },
  { id: 'payments', label: 'Payments & Dues', icon: Wallet, panel: 'payments' },
  { id: 'pending_verifications', label: 'Pending Verifications', icon: UserCheck, panel: 'pending_verifications' },
  { id: 'access_control', label: 'Access Control', icon: Key, panel: 'access_control' },
  { id: 'branches', label: 'Branch Overview', icon: Building2, panel: 'branches' },
  { id: 'reports', label: 'Revenue Reports', icon: FileText, panel: 'reports' },
  { id: 'settings', label: 'System Settings', icon: Settings, panel: 'settings' },
  { id: 'audit', label: 'Audit Log', icon: Shield, panel: 'audit' },
];

export const SuperAdminDashboardRefined: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    loadData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    // Load pending verifications count
    const pendingUsers = JSON.parse(localStorage.getItem('pending_user_verifications') || '[]');
    setPendingVerificationsCount(pendingUsers.length);

    // Load or initialize admin accounts
    const storedAdmins = getFromStorage('admin_accounts', []);
    if (storedAdmins.length === 0) {
      // Initialize with sample data
      const sampleAdmins = generateSampleAdmins();
      saveToStorage('admin_accounts', sampleAdmins);
      setAdminAccounts(sampleAdmins);
    } else {
      setAdminAccounts(storedAdmins);
    }
  };

  // Generate sample admin accounts
  const generateSampleAdmins = (): AdminAccount[] => {
    const packages: SubscriptionPackage[] = ['basic', 'professional', 'enterprise'];
    const statuses: ('active' | 'suspended' | 'expired')[] = ['active', 'active', 'active', 'suspended', 'expired'];
    
    return Array.from({ length: 25 }, (_, i) => {
      const pkg = packages[Math.floor(Math.random() * packages.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueAmount = status === 'active' && Math.random() > 0.7 ? Math.random() * 15000 : 0;
      
      return {
        id: `admin_${i + 1}`,
        name: `Admin ${i + 1}`,
        email: `admin${i + 1}@example.com`,
        phone: `+977-98${String(10000000 + i).substring(1)}`,
        businessName: `Business ${i + 1}`,
        package: pkg,
        packagePrice: PACKAGES[pkg].price,
        subscriptionStartDate: new Date(2024, 0, i + 1).toISOString(),
        subscriptionEndDate: new Date(2025, 0, i + 1).toISOString(),
        status,
        dueAmount: Math.round(dueAmount),
        lastPaymentDate: new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString(),
        totalRevenue: Math.round(Math.random() * 500000 + 50000),
        totalCustomers: Math.floor(Math.random() * 500 + 10),
        totalSales: Math.floor(Math.random() * 1000 + 50),
        createdAt: new Date(2024, 0, i + 1).toISOString(),
        branches: pkg === 'basic' ? 1 : pkg === 'professional' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 1,
        users: pkg === 'basic' ? Math.floor(Math.random() * 3) + 1 : pkg === 'professional' ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 50) + 1,
        products: pkg === 'basic' ? Math.floor(Math.random() * 1000) + 100 : pkg === 'professional' ? Math.floor(Math.random() * 10000) + 1000 : Math.floor(Math.random() * 50000) + 5000,
      };
    });
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardView adminAccounts={adminAccounts} onNavigate={setActivePanel} />;
      case 'admins':
        return <AdminAccountsView adminAccounts={adminAccounts} onUpdate={loadData} />;
      case 'subscriptions':
        return <SubscriptionsView adminAccounts={adminAccounts} onUpdate={loadData} />;
      case 'payments':
        return <PaymentsDuesView adminAccounts={adminAccounts} onUpdate={loadData} />;
      case 'pending_verifications':
        return <PendingVerificationsPanel />;
      case 'access_control':
        return <AccessControlPanel />;
      case 'branches':
        return <BranchesOverviewView adminAccounts={adminAccounts} />;
      case 'reports':
        return <RevenueReportsView adminAccounts={adminAccounts} />;
      case 'settings':
        return <SystemSettingsFixed onUpdate={loadData} />;
      case 'audit':
        return <AuditLogDetailed users={[]} />;
      default:
        return <DashboardView adminAccounts={adminAccounts} onNavigate={setActivePanel} />;
    }
  };

  // Update menu items with dynamic badge
  const updatedMenuItems = menuItems.map(item => 
    item.id === 'pending_verifications' 
      ? { ...item, badge: pendingVerificationsCount }
      : item
  );

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
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl tracking-wide animate-pulse">
                Serve Spares
              </span>
            </h1>
            <p className="text-gray-400 text-xs">Super Admin Panel</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          {updatedMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel || 'dashboard')}
              className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all hover:bg-gray-800 ${
                activePanel === item.panel ? 'bg-gradient-to-r from-orange-600 to-red-600 border-l-4 border-yellow-400 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{currentUser?.name || 'Super Admin'}</p>
              <p className="text-gray-400 text-xs">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {menuItems.find(m => m.panel === activePanel)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' • '}
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-semibold">System Online</span>
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

// 1. Dashboard View - Super Admin Focused
const DashboardView: React.FC<{ adminAccounts: AdminAccount[]; onNavigate: (panel: string) => void }> = ({ adminAccounts, onNavigate }) => {
  // Calculate Super Admin relevant metrics
  const totalAdmins = adminAccounts.length;
  const activeAdmins = adminAccounts.filter(a => a.status === 'active').length;
  const suspendedAdmins = adminAccounts.filter(a => a.status === 'suspended').length;
  const expiredAdmins = adminAccounts.filter(a => a.status === 'expired').length;
  
  // Total customers across all admin accounts
  const totalCustomers = adminAccounts.reduce((sum, admin) => sum + admin.totalCustomers, 0);
  
  // Total due amount from all admins
  const totalDueAmount = adminAccounts.reduce((sum, admin) => sum + admin.dueAmount, 0);
  
  // Total sales revenue (combined from all admins)
  const totalSalesRevenue = adminAccounts.reduce((sum, admin) => sum + admin.totalRevenue, 0);
  
  // Monthly recurring revenue from subscriptions
  const monthlyRecurringRevenue = adminAccounts
    .filter(a => a.status === 'active')
    .reduce((sum, admin) => sum + admin.packagePrice, 0);
  
  // Package distribution
  const basicCount = adminAccounts.filter(a => a.package === 'basic').length;
  const professionalCount = adminAccounts.filter(a => a.package === 'professional').length;
  const enterpriseCount = adminAccounts.filter(a => a.package === 'enterprise').length;

  const stats = [
    { 
      label: 'Total Admin Accounts', 
      value: totalAdmins, 
      icon: Users, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtext: `${activeAdmins} active`,
      trend: 'up',
      trendValue: '+12%'
    },
    { 
      label: 'Total Customers (All Admins)', 
      value: totalCustomers.toLocaleString(), 
      icon: UserCheck, 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtext: 'Across all accounts',
      trend: 'up',
      trendValue: '+18%'
    },
    { 
      label: 'Total Due Amount', 
      value: `NPR ${totalDueAmount.toLocaleString()}`, 
      icon: AlertCircle, 
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      subtext: 'Pending payments',
      trend: 'down',
      trendValue: '-5%'
    },
    { 
      label: 'Total Sales Revenue', 
      value: `NPR ${totalSalesRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtext: 'Combined revenue',
      trend: 'up',
      trendValue: '+24%'
    },
    { 
      label: 'Monthly Recurring Revenue', 
      value: `NPR ${monthlyRecurringRevenue.toLocaleString()}`, 
      icon: Banknote, 
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      subtext: 'From subscriptions',
      trend: 'up',
      trendValue: '+8%'
    },
    { 
      label: 'Suspended Accounts', 
      value: suspendedAdmins, 
      icon: Lock, 
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      subtext: 'Require attention',
    },
    { 
      label: 'Expired Accounts', 
      value: expiredAdmins, 
      icon: XCircle, 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      subtext: 'Need renewal',
    },
    { 
      label: 'Avg Revenue per Admin', 
      value: `NPR ${Math.round(totalSalesRevenue / totalAdmins).toLocaleString()}`, 
      icon: BarChart3, 
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      subtext: 'Performance metric',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Super Admin Dashboard</h2>
              <p className="text-orange-100 flex items-center space-x-2">
                <span>Multi-Tenant System Management</span>
                <span className="text-white">•</span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{activeAdmins} Active Accounts</span>
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">System Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.trend && (
                <span className={`text-sm font-semibold flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {stat.trendValue}
                </span>
              )}
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-bold mb-1">{stat.value}</p>
              {stat.subtext && <p className="text-gray-500 text-xs">{stat.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Package Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{basicCount}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Basic Package</h3>
          <p className="text-blue-100 text-sm mb-3">NPR {PACKAGES.basic.price}/month</p>
          <div className="text-sm text-blue-100 space-y-1">
            <p>• {PACKAGES.basic.features.users} users</p>
            <p>• {PACKAGES.basic.features.products.toLocaleString()} products</p>
            <p>• {PACKAGES.basic.features.branches} branch</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Crown className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{professionalCount}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Professional Package</h3>
          <p className="text-purple-100 text-sm mb-3">NPR {PACKAGES.professional.price}/month</p>
          <div className="text-sm text-purple-100 space-y-1">
            <p>• {PACKAGES.professional.features.users} users</p>
            <p>• {PACKAGES.professional.features.products.toLocaleString()} products</p>
            <p>• {PACKAGES.professional.features.branches} branches</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{enterpriseCount}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Enterprise Package</h3>
          <p className="text-orange-100 text-sm mb-3">NPR {PACKAGES.enterprise.price}/month</p>
          <div className="text-sm text-orange-100 space-y-1">
            <p>• Unlimited users</p>
            <p>• Unlimited products</p>
            <p>• Unlimited branches</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => onNavigate('admins')}
          className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Manage Admins</h3>
          <p className="text-blue-100 text-sm">View & manage all admin accounts</p>
        </button>

        <button
          onClick={() => onNavigate('subscriptions')}
          className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <CreditCard className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Subscriptions</h3>
          <p className="text-purple-100 text-sm">Manage packages & renewals</p>
        </button>

        <button
          onClick={() => onNavigate('payments')}
          className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <Wallet className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Payments & Dues</h3>
          <p className="text-green-100 text-sm">Track payments & collect dues</p>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Revenue Reports</h3>
          <p className="text-orange-100 text-sm">Analyze performance & trends</p>
        </button>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Admin Activities
        </h3>
        <div className="space-y-3">
          {adminAccounts.slice(0, 5).map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  admin.status === 'active' ? 'bg-green-100 text-green-600' : 
                  admin.status === 'suspended' ? 'bg-orange-100 text-orange-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{admin.businessName}</p>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">NPR {admin.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{admin.totalSales} sales</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Admin Accounts View
const AdminAccountsView: React.FC<{ adminAccounts: AdminAccount[]; onUpdate: () => void }> = ({ adminAccounts, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPackage, setFilterPackage] = useState<string>('all');

  const filteredAdmins = adminAccounts.filter(admin => {
    const matchesSearch = admin.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    const matchesPackage = filterPackage === 'all' || admin.package === filterPackage;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Accounts</h2>
          <p className="text-gray-500 text-sm">Manage all admin accounts and their subscriptions</p>
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Packages</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Package</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{admin.businessName}</p>
                      <p className="text-sm text-gray-500">{admin.name}</p>
                      <p className="text-xs text-gray-400">{admin.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      admin.package === 'basic' ? 'bg-blue-100 text-blue-700' :
                      admin.package === 'professional' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {admin.package === 'basic' && <Package className="w-3 h-3 mr-1" />}
                      {admin.package === 'professional' && <Crown className="w-3 h-3 mr-1" />}
                      {admin.package === 'enterprise' && <Sparkles className="w-3 h-3 mr-1" />}
                      {PACKAGES[admin.package].name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      admin.status === 'active' ? 'bg-green-100 text-green-700' :
                      admin.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {admin.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {admin.status === 'suspended' && <Lock className="w-3 h-3 mr-1" />}
                      {admin.status === 'expired' && <XCircle className="w-3 h-3 mr-1" />}
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">NPR {admin.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{admin.totalSales} sales</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{admin.totalCustomers}</p>
                  </td>
                  <td className="px-6 py-4">
                    {admin.dueAmount > 0 ? (
                      <p className="font-semibold text-red-600">NPR {admin.dueAmount.toLocaleString()}</p>
                    ) : (
                      <p className="text-green-600 font-semibold">Paid</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No admin accounts found</p>
        </div>
      )}
    </div>
  );
};

// 3. Subscriptions View
const SubscriptionsView: React.FC<{ adminAccounts: AdminAccount[]; onUpdate: () => void }> = ({ adminAccounts }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <p className="text-gray-500 text-sm">Manage packages, renewals, and upgrades</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-600">Subscription management panel - coming soon</p>
      </div>
    </div>
  );
};

// 4. Payments & Dues View
const PaymentsDuesView: React.FC<{ adminAccounts: AdminAccount[]; onUpdate: () => void }> = ({ adminAccounts }) => {
  const adminsWithDues = adminAccounts.filter(a => a.dueAmount > 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments & Dues</h2>
          <p className="text-gray-500 text-sm">{adminsWithDues.length} accounts with pending payments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Due Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminsWithDues.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{admin.businessName}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-red-600">NPR {admin.dueAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{new Date(admin.lastPaymentDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 5. Branches Overview
const BranchesOverviewView: React.FC<{ adminAccounts: AdminAccount[] }> = ({ adminAccounts }) => {
  const totalBranches = adminAccounts.reduce((sum, admin) => sum + admin.branches, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Branches Overview</h2>
        <p className="text-gray-500 text-sm">{totalBranches} total branches across all accounts</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-600">Branch overview panel - coming soon</p>
      </div>
    </div>
  );
};

// 6. Revenue Reports
const RevenueReportsView: React.FC<{ adminAccounts: AdminAccount[] }> = ({ adminAccounts }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Reports</h2>
        <p className="text-gray-500 text-sm">Analyze performance and revenue trends</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-600">Revenue reports panel - coming soon</p>
      </div>
    </div>
  );
};

export default SuperAdminDashboardRefined;
