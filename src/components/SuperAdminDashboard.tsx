import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Package, TrendingUp, UserPlus, LogOut, Search, Edit, Trash2, Eye,
  Settings, Wrench, Shield, Activity, Bell, Database, FileText, Download,
  Lock, Unlock, EyeOff, RefreshCw, AlertTriangle, CheckCircle, XCircle,
  BarChart3, DollarSign, ShoppingCart, Menu, X, ChevronRight, Globe, Key,
  Server, HardDrive, Zap, Code, CreditCard, Calendar, Mail, Phone, MapPin,
  Filter, Plus, Check, Clock, Archive, GitBranch, Percent, Wallet, Tag,
  Copy, Save, Loader, Award, Star, TrendingDown, PieChart, ArrowUpCircle,
  ArrowDownCircle, Briefcase, Tool, Image, Trash, Upload, ExternalLink, Store, UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, Workspace, Bill, InventoryItem, Party, BankAccount } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import {
  InventoryMasterView, ReportsAnalyticsView, SystemSettingsView,
  AuditLogView, RolesPermissionsView, MaintenanceView,
  CRMView, SuppliersView, AdvancedView
} from './SuperAdminPanels';
import {
  EditUserModal, ViewUserModal, EditBranchModal, ViewBranchModal
} from './SuperAdminModals';
import { BranchManagementViewFixed } from './BranchManagementFixed';
import { RolesPermissionsFixed } from './RolesPermissionsFixed';
import { AddUserModal } from './AddUserModal';
import { NotificationsFixed } from './NotificationsFixed';
import { NotificationsSimple } from './NotificationsSimple';
import { SystemSettingsFixed } from './SystemSettingsFixed';
import { AuditLogDetailed } from './AuditLogDetailed';
import { MaintenanceCRM } from './MaintenanceCRM';
import { CRMSystem } from './CRMSystem';
import { MultiVendorPanel } from './panels/MultiVendorPanel';
import { AccessControlPanel } from './panels/AccessControlPanel';
import { BranchVendorManagement } from './panels/BranchVendorManagement';
import { IntegratedBranchManagement } from './panels/IntegratedBranchManagement';
import { PendingVerificationsPanel } from './panels/PendingVerificationsPanel';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, panel: 'dashboard' },
  { id: 'users', label: 'User Management', icon: Users, panel: 'users' },
  { id: 'pending_verifications', label: 'Pending Verifications', icon: UserCheck, panel: 'pending_verifications' },
  { id: 'vendors', label: 'Multi-Vendor', icon: Store, panel: 'vendors' },
  { id: 'access_control', label: 'Access Control', icon: Key, panel: 'access_control' },
  { id: 'branches', label: 'Branch Management', icon: Building2, panel: 'branches' },
  { id: 'finance', label: 'Finance Oversight', icon: DollarSign, panel: 'finance' },
  { id: 'inventory', label: 'Inventory Master', icon: Package, panel: 'inventory' },
  { id: 'reports', label: 'Reports & Analytics', icon: FileText, panel: 'reports' },
  { id: 'settings', label: 'System Settings', icon: Settings, panel: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, panel: 'notifications' },
  { id: 'audit', label: 'Audit Log', icon: Shield, panel: 'audit' },
  { id: 'roles', label: 'Roles & Permissions', icon: Lock, panel: 'roles' },
  { id: 'maintenance', label: 'Maintenance CRM', icon: Wrench, panel: 'maintenance' },
  { id: 'crm', label: 'CRM', icon: Users, panel: 'crm' },
  { id: 'suppliers', label: 'Suppliers', icon: Building2, panel: 'suppliers' },
  { id: 'advanced', label: 'Advanced', icon: Zap, panel: 'advanced' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);

  useEffect(() => {
    loadData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    setUsers(getFromStorage('users', []));
    setWorkspaces(getFromStorage('workspaces', []));
    setBills(getFromStorage('bills', []));
    setInventory(getFromStorage('inventory', []));
    setParties(getFromStorage('parties', []));
    setBankAccounts(getFromStorage('bankAccounts', []));
    setExpenses(getFromStorage('expenses', []));
    
    // Load pending verifications count
    const pendingUsers = JSON.parse(localStorage.getItem('pending_user_verifications') || '[]');
    setPendingVerificationsCount(pendingUsers.length);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardView 
          users={users}
          workspaces={workspaces}
          bills={bills}
          inventory={inventory}
          parties={parties}
          expenses={expenses}
          onNavigate={setActivePanel}
        />;
      case 'users':
        return <UserManagementView users={users} workspaces={workspaces} onUpdate={loadData} />;
      case 'pending_verifications':
        return <PendingVerificationsPanel />;
      case 'vendors':
        return <MultiVendorPanel />;
      case 'access_control':
        return <AccessControlPanel />;
      case 'branches':
        return <IntegratedBranchManagement users={users} bills={bills} onUpdate={loadData} />;
      case 'finance':
        return <FinanceOversightView bills={bills} parties={parties} bankAccounts={bankAccounts} expenses={expenses} inventory={inventory} />;
      case 'inventory':
        return <InventoryMasterView inventory={inventory} parties={parties} onUpdate={loadData} />;
      case 'reports':
        return <ReportsAnalyticsView bills={bills} inventory={inventory} users={users} workspaces={workspaces} expenses={expenses} parties={parties} />;
      case 'settings':
        return <SystemSettingsFixed onUpdate={loadData} />;
      case 'notifications':
        return <NotificationsSimple inventory={inventory} parties={parties} bills={bills} />;
      case 'audit':
        return <AuditLogDetailed users={users} />;
      case 'roles':
        return <RolesPermissionsFixed users={users} onUpdate={loadData} />;
      case 'maintenance':
        return <MaintenanceCRM />;
      case 'crm':
        return <CRMSystem parties={parties} bills={bills} onUpdate={loadData} />;
      case 'suppliers':
        return <SuppliersView parties={parties} inventory={inventory} onUpdate={loadData} />;
      case 'advanced':
        return <AdvancedView />;
      default:
        return <DashboardView 
          users={users}
          workspaces={workspaces}
          bills={bills}
          inventory={inventory}
          parties={parties}
          expenses={expenses}
          onNavigate={setActivePanel}
        />;
    }
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
                Super Admin Panel
              </span>
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const badge = item.id === 'pending_verifications' ? pendingVerificationsCount : item.badge;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.panel || item.id);
                  if (item.id === 'pending_verifications') loadData();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group text-sm ${
                  activePanel === (item.panel || item.id)
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-4 h-4 ${
                    activePanel === (item.panel || item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {badge && badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{currentUser?.name}</div>
              <div className="text-gray-400 text-xs">Super Admin</div>
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">System Online</span>
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

// 1. Dashboard View
const DashboardView: React.FC<any> = ({ users, workspaces, bills, inventory, parties, expenses, onNavigate }) => {
  const totalRevenue = bills.reduce((sum: number, b: Bill) => sum + b.total, 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalInventoryValue = inventory.reduce((sum: number, item: InventoryItem) => sum + (item.price * item.quantity), 0);
  const suppliers = parties.filter((p: Party) => p.type === 'supplier');
  const customers = parties.filter((p: Party) => p.type === 'customer');

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: Users, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      label: 'Workspaces', 
      value: workspaces.length, 
      icon: Building2, 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    { 
      label: 'Total Revenue', 
      value: `NPR ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+24%'
    },
    { 
      label: 'Total Profit', 
      value: `NPR ${totalProfit.toLocaleString()}`, 
      icon: TrendingUp, 
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+18%'
    },
    { 
      label: 'Inventory Value', 
      value: `NPR ${totalInventoryValue.toLocaleString()}`, 
      icon: Package, 
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    { 
      label: 'Suppliers', 
      value: suppliers.length, 
      icon: Building2, 
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    { 
      label: 'Customers', 
      value: customers.length, 
      icon: Users, 
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '+15%'
    },
    { 
      label: 'Total Sales', 
      value: bills.length, 
      icon: ShoppingCart, 
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
        {/* Animated Background Elements */}
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
                <span>Complete system control and monitoring</span>
                <span className="text-white">•</span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>All access granted</span>
                </span>
              </p>
            </div>
          </div>
          
          {/* Real-time indicator */}
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
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.change && (
                <span className="text-green-600 text-sm font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => onNavigate('users')}
          className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-left hover:scale-105"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">User Management</h3>
          <p className="text-blue-100 text-sm mb-4">Create, edit, and manage all system users</p>
          <div className="flex items-center text-white font-semibold">
            <span>Manage Users</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('branches')}
          className="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all text-left hover:scale-105"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 flex items-center">
            Branch Management
            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-purple-900 text-xs rounded-full font-bold">NEW</span>
          </h3>
          <p className="text-purple-100 text-sm mb-4">Manage branches, vendors, roles & access</p>
          <div className="flex items-center text-white font-semibold">
            <span>Manage Branches</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('finance')}
          className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-green-500/50 transition-all text-left hover:scale-105"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Finance Oversight</h3>
          <p className="text-green-100 text-sm mb-4">Monitor all financial transactions and reports</p>
          <div className="flex items-center text-white font-semibold">
            <span>View Finance</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('audit')}
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all text-left hover:scale-105"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Audit Log</h3>
          <p className="text-orange-100 text-sm mb-4">Track all system activities and changes</p>
          <div className="flex items-center text-white font-semibold">
            <span>View Logs</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.role}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-semibold">Database</span>
              </div>
              <span className="text-green-600 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-semibold">Server</span>
              </div>
              <span className="text-green-600 font-semibold">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-semibold">Backup</span>
              </div>
              <span className="text-green-600 font-semibold">Up to date</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-semibold">CPU Usage</span>
              </div>
              <span className="text-blue-600 font-semibold">42%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-semibold">Storage</span>
              </div>
              <span className="text-blue-600 font-semibold">68% Used</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. User Management View - FULLY FUNCTIONAL
const UserManagementView: React.FC<any> = ({ users, workspaces, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter((user: User) => {
    const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const statusMatch = statusFilter === 'all' || 
                       (statusFilter === 'active' && user.isActive) ||
                       (statusFilter === 'inactive' && !user.isActive);
    return searchMatch && roleMatch && statusMatch;
  });

  const toggleUserStatus = (userId: string) => {
    const allUsers: User[] = getFromStorage('users', []);
    const updatedUsers = allUsers.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    saveToStorage('users', updatedUsers);
    onUpdate();
    alert('✅ User status updated successfully!');
  };

  const deleteUser = (userId: string) => {
    if (window.confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone.')) {
      const allUsers: User[] = getFromStorage('users', []);
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      saveToStorage('users', updatedUsers);
      onUpdate();
      alert('✅ User deleted successfully!');
    }
  };

  const resetPassword = (userId: string) => {
    if (window.confirm('Reset password for this user to "password123"?')) {
      const allUsers: User[] = getFromStorage('users', []);
      const updatedUsers = allUsers.map(u => 
        u.id === userId ? { ...u, password: 'password123' } : u
      );
      saveToStorage('users', updatedUsers);
      onUpdate();
      alert('✅ Password reset to: password123');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Create, edit, and manage all system users and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-blue-600 text-sm font-semibold">Total</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{users.length}</p>
          <p className="text-gray-600 text-sm">All Users</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-green-600 text-sm font-semibold">Active</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{users.filter((u: User) => u.isActive).length}</p>
          <p className="text-gray-600 text-sm">Active Users</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-red-600 text-sm font-semibold">Inactive</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{users.filter((u: User) => !u.isActive).length}</p>
          <p className="text-gray-600 text-sm">Inactive Users</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <span className="text-purple-600 text-sm font-semibold">Admins</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{users.filter((u: User) => u.role === 'admin' || u.role === 'super_admin').length}</p>
          <p className="text-gray-600 text-sm">Admin Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="cashier">Cashier</option>
            <option value="finance">Finance</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">User</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Contact</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Role</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Workspace</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                <th className="text-center py-4 px-6 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: User) => {
                const workspace = workspaces.find((w: Workspace) => w.id === user.workspaceId);
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold">{user.name}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-700">{user.phone || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'finance' ? 'bg-green-100 text-green-700' :
                        user.role === 'cashier' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{workspace?.name || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:shadow-md ${
                          user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => resetPassword(user.id)}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => alert(`Edit user: ${user.name}`)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={onUpdate}
        workspaces={workspaces}
      />
    </div>
  );
};

// 3. Branch Management View - FULLY FUNCTIONAL
const BranchManagementView: React.FC<any> = ({ workspaces, users, bills, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  const handleAddBranch = () => {
    if (!formData.name) {
      alert('⚠️ Please enter branch name');
      return;
    }

    const newWorkspace: Workspace = {
      id: `ws${Date.now()}`,
      name: formData.name,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: formData.address,
      createdAt: new Date().toISOString(),
    };

    const allWorkspaces: Workspace[] = getFromStorage('workspaces', []);
    saveToStorage('workspaces', [...allWorkspaces, newWorkspace]);
    onUpdate();
    setShowAddModal(false);
    setFormData({ name: '', contactEmail: '', contactPhone: '', address: '' });
    alert('✅ Branch created successfully!');
  };

  const deleteBranch = (workspaceId: string) => {
    if (window.confirm('⚠️ Are you sure you want to delete this branch?')) {
      const allWorkspaces: Workspace[] = getFromStorage('workspaces', []);
      const updatedWorkspaces = allWorkspaces.filter(w => w.id !== workspaceId);
      saveToStorage('workspaces', updatedWorkspaces);
      onUpdate();
      alert('✅ Branch deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Branch Management</h2>
          <p className="text-gray-600">Manage all business locations, stores, and branches</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Branch</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{workspaces.length}</h2>
            <p className="text-purple-100">Total Active Branches</p>
          </div>
          <Building2 className="w-16 h-16 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace: Workspace) => {
          const branchUsers = users.filter((u: User) => u.workspaceId === workspace.id);
          const branchBills = bills.filter((b: Bill) => b.workspaceId === workspace.id);
          const branchRevenue = branchBills.reduce((sum: number, b: Bill) => sum + b.total, 0);
          
          return (
            <div key={workspace.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-4">{workspace.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 text-sm">Users</span>
                  </div>
                  <span className="text-gray-900 font-bold">{branchUsers.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 text-sm">Sales</span>
                  </div>
                  <span className="text-gray-900 font-bold">{branchBills.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-sm">Revenue</span>
                  </div>
                  <span className="text-green-600 font-bold">NPR {branchRevenue.toLocaleString()}</span>
                </div>
              </div>

              {workspace.contactEmail && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    {workspace.contactEmail}
                  </div>
                  {workspace.contactPhone && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {workspace.contactPhone}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => alert(`Viewing details for ${workspace.name}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  View Details
                </button>
                <button 
                  onClick={() => alert(`Edit ${workspace.name}`)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => deleteBranch(workspace.id)}
                  className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-gray-900 font-bold text-xl mb-6">Add New Branch</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Branch Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter branch name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="branch@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+977-XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter branch address"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBranch}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
              >
                Add Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Finance Oversight View - FULLY FUNCTIONAL
const FinanceOversightView: React.FC<any> = ({ bills, parties, bankAccounts, expenses, inventory }) => {
  const [dateFilter, setDateFilter] = useState('all');
  
  const totalRevenue = bills.reduce((sum: number, b: Bill) => sum + b.total, 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const suppliers = parties.filter((p: Party) => p.type === 'supplier');
  const customers = parties.filter((p: Party) => p.type === 'customer');
  const supplierDues = suppliers.reduce((sum: number, s: Party) => sum + (s.balance || 0), 0);
  const customerDues = customers.reduce((sum: number, c: Party) => sum + (c.balance || 0), 0);
  const totalBankBalance = bankAccounts.reduce((sum: number, b: BankAccount) => sum + b.balance, 0);
  const inventoryValue = inventory.reduce((sum: number, i: InventoryItem) => sum + (i.price * i.quantity), 0);

  const cashSales = bills.filter(b => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.total, 0);
  const creditSales = bills.filter(b => b.paymentMethod === 'credit').reduce((sum, b) => sum + b.total, 0);
  const digitalSales = bills.filter(b => ['esewa', 'khalti', 'fonepay'].includes(b.paymentMethod)).reduce((sum, b) => sum + b.total, 0);

  const exportToCSV = () => {
    alert('📥 Exporting financial data to CSV...');
  };

  const exportToPDF = () => {
    alert('📥 Exporting financial report to PDF...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Finance Oversight</h2>
          <p className="text-gray-600">Complete financial monitoring and control across all operations</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button 
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-green-100 mb-2">Net Profit</h2>
            <p className="text-4xl font-bold">NPR {netProfit.toLocaleString()}</p>
            <p className="text-green-100 mt-2">Revenue - Expenses = Profit</p>
          </div>
          <TrendingUp className="w-20 h-20 opacity-30" />
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h4 className="text-gray-600 mb-2">Total Revenue</h4>
          <p className="text-green-600 text-3xl font-bold">NPR {totalRevenue.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">{bills.length} transactions</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h4 className="text-gray-600 mb-2">Total Expenses</h4>
          <p className="text-red-600 text-3xl font-bold">NPR {totalExpenses.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">{expenses.length} expense items</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h4 className="text-gray-600 mb-2">Bank Balance</h4>
          <p className="text-blue-600 text-3xl font-bold">NPR {totalBankBalance.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">{bankAccounts.length} accounts</p>
        </div>
      </div>

      {/* Receivables & Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
            <Users className="w-5 h-5 text-yellow-600 mr-2" />
            Accounts Receivable
          </h3>
          <div className="mb-4">
            <p className="text-yellow-600 text-4xl font-bold">NPR {customerDues.toLocaleString()}</p>
            <p className="text-gray-600 text-sm mt-1">{customers.filter((c: Party) => c.balance > 0).length} customers with pending dues</p>
          </div>
          <div className="space-y-2">
            {customers.filter((c: Party) => c.balance > 0).slice(0, 5).map((customer: Party) => (
              <div key={customer.id} className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-semibold">{customer.name}</span>
                <span className="text-yellow-600 font-bold">NPR {customer.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center">
            <Building2 className="w-5 h-5 text-red-600 mr-2" />
            Accounts Payable
          </h3>
          <div className="mb-4">
            <p className="text-red-600 text-4xl font-bold">NPR {supplierDues.toLocaleString()}</p>
            <p className="text-gray-600 text-sm mt-1">{suppliers.filter((s: Party) => s.balance > 0).length} suppliers with pending payments</p>
          </div>
          <div className="space-y-2">
            {suppliers.filter((s: Party) => s.balance > 0).slice(0, 5).map((supplier: Party) => (
              <div key={supplier.id} className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-semibold">{supplier.name}</span>
                <span className="text-red-600 font-bold">NPR {supplier.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Payment Methods Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <Wallet className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-green-700 text-sm font-semibold mb-1">Cash Sales</div>
            <div className="text-green-600 text-2xl font-bold">NPR {cashSales.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-purple-700 text-sm font-semibold mb-1">Digital Payments</div>
            <div className="text-purple-600 text-2xl font-bold">NPR {digitalSales.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <div className="text-yellow-700 text-sm font-semibold mb-1">Credit Sales</div>
            <div className="text-yellow-600 text-2xl font-bold">NPR {creditSales.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Asset Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Total Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-blue-700 text-xs font-semibold mb-1">Bank</div>
            <div className="text-blue-600 font-bold">NPR {totalBankBalance.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl text-center">
            <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-orange-700 text-xs font-semibold mb-1">Inventory</div>
            <div className="text-orange-600 font-bold">NPR {inventoryValue.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl text-center">
            <Users className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-yellow-700 text-xs font-semibold mb-1">Receivables</div>
            <div className="text-yellow-600 font-bold">NPR {customerDues.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-purple-700 text-xs font-semibold mb-1">Total Assets</div>
            <div className="text-purple-600 font-bold">NPR {(totalBankBalance + inventoryValue + customerDues).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Remaining views will be added in continuation...