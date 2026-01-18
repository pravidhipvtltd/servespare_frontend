import React, { useState, useEffect } from 'react';
import { 
  Package, Settings, Wrench, LogOut, Menu, X, Search, Plus, Edit, Trash2, 
  AlertCircle, TrendingUp, ShoppingCart, DollarSign, LayoutDashboard,
  FileText, History, Zap, Download, Upload, Filter, ChevronRight, 
  ChevronDown, Box, Tag, Truck, BarChart3, CheckCircle, XCircle, Scan
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSync } from '../contexts/SyncContext';
import { usePermissions } from '../contexts/PermissionContext';
import { PermissionGuard } from './PermissionGuard';
import { InventoryItem, Transaction } from '../types';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { BillingSystem } from './BillingSystem';
import { BulkImportPanel } from './panels/BulkImportPanel';
import { getPermissionForPanel } from '../utils/permissionMapping';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, panel: 'dashboard' },
  { id: 'inventory', label: 'Inventory', icon: Package, panel: 'inventory' },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload, panel: 'bulk-import' },
  { id: 'billing', label: 'Billing & Sales', icon: ShoppingCart, panel: 'billing' },
  { id: 'transactions', label: 'Transactions', icon: History, panel: 'transactions' },
  { id: 'reports', label: 'Reports', icon: BarChart3, panel: 'reports' },
];

export const InventoryManagerDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'local' | 'branded'>('all');
  const [filterVehicle, setFilterVehicle] = useState<'all' | 'two_wheeler' | 'four_wheeler'>('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    const allTransactions: Transaction[] = getFromStorage('transactions', []);

    setInventory(allInventory.filter(i => i.workspaceId === currentUser?.workspaceId));
    setTransactions(allTransactions.filter(t => t.workspaceId === currentUser?.workspaceId));
  };

  const handleSaveItem = (item: Partial<InventoryItem>) => {
    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    
    if (editingItem) {
      const updated = allInventory.map(i => 
        i.id === editingItem.id 
          ? { ...i, ...item, lastUpdated: new Date().toISOString() }
          : i
      );
      saveToStorage('inventory', updated);
    } else {
      const newItem: InventoryItem = {
        id: `inv${Date.now()}`,
        ...item as InventoryItem,
        workspaceId: currentUser?.workspaceId,
        lastUpdated: new Date().toISOString(),
      };
      saveToStorage('inventory', [...allInventory, newItem]);
    }
    
    loadData();
    setShowAddItem(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const allInventory: InventoryItem[] = getFromStorage('inventory', []);
      saveToStorage('inventory', allInventory.filter(i => i.id !== id));
      loadData();
    }
  };

  const handleTransactionComplete = () => {
    loadData();
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.partNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesVehicle = filterVehicle === 'all' || item.vehicleType === filterVehicle;
    return matchesSearch && matchesCategory && matchesVehicle;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);
  const todayTransactions = transactions.filter(t => 
    new Date(t.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderPanel = () => {
    // Inventory Manager has full access to all panels - no permission checks
    switch (activePanel) {
      case 'dashboard':
        return <DashboardView 
          inventory={inventory}
          lowStockItems={lowStockItems}
          outOfStockItems={outOfStockItems}
          todayTransactions={todayTransactions}
          todayRevenue={todayRevenue}
          totalInventoryValue={totalInventoryValue}
          onNavigate={setActivePanel}
        />;
      case 'inventory':
        return <InventoryView
          filteredInventory={filteredInventory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterVehicle={filterVehicle}
          setFilterVehicle={setFilterVehicle}
          lowStockItems={lowStockItems}
          onAddItem={() => {
            setEditingItem(null);
            setShowAddItem(true);
          }}
          onEditItem={(item) => {
            setEditingItem(item);
            setShowAddItem(true);
          }}
          onDeleteItem={handleDeleteItem}
        />;
      case 'bulk-import':
        return <BulkImportPanel />;
      case 'billing':
        return <BillingSystem 
          inventory={inventory}
          onTransactionComplete={handleTransactionComplete}
        />;
      case 'transactions':
        return <TransactionsView transactions={transactions} />;
      case 'reports':
        return <ReportsView 
          inventory={inventory}
          transactions={transactions}
        />;
      default:
        return <DashboardView 
          inventory={inventory}
          lowStockItems={lowStockItems}
          outOfStockItems={outOfStockItems}
          todayTransactions={todayTransactions}
          todayRevenue={todayRevenue}
          totalInventoryValue={totalInventoryValue}
          onNavigate={setActivePanel}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Same as Admin */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}>
        {/* Logo & Brand - Same as Admin */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Triple Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              
              {/* Logo Container */}
              <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 left-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 border border-white/30 rounded-full"></div>
                  <div className="absolute bottom-1 left-1 w-2 h-2 border border-white/30 rounded-full"></div>
                </div>
                
                {/* Rotating Gears */}
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
                
                {/* Sparkles */}
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel || item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                activePanel === (item.panel || item.id)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
                <item.icon className={`w-5 h-5 ${
                activePanel === (item.panel || item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className="font-medium">{item.label}</span>
              {activePanel === (item.panel || item.id) && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{currentUser?.name}</div>
              <div className="text-gray-400 text-xs">Inventory Manager</div>
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
          
          <div className="flex items-center space-x-4">
            {/* Notification Badge */}
            {lowStockItems.length > 0 && (
              <div className="relative group cursor-pointer">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{lowStockItems.length}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-sm font-semibold mb-1">Low Stock Alert</p>
                  <p className="text-xs text-gray-300">{lowStockItems.length} items need reordering</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Panel Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </main>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItem && (
        <ItemFormModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Dashboard View
const DashboardView: React.FC<{
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  todayTransactions: Transaction[];
  todayRevenue: number;
  totalInventoryValue: number;
  onNavigate: (panel: string) => void;
}> = ({ inventory, lowStockItems, outOfStockItems, todayTransactions, todayRevenue, totalInventoryValue, onNavigate }) => {
  const stats = [
    { 
      label: 'Total Items', 
      value: inventory.length, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      label: 'Low Stock Alerts', 
      value: lowStockItems.length, 
      icon: AlertCircle, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: `${outOfStockItems.length} out of stock`,
      changeType: 'negative'
    },
    { 
      label: "Today's Sales", 
      value: todayTransactions.length, 
      icon: ShoppingCart, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8.2%',
      changeType: 'positive'
    },
    { 
      label: "Today's Revenue", 
      value: `NPR ${todayRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+15.3%',
      changeType: 'positive'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <span className={`text-xs font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
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
          onClick={() => onNavigate('inventory')}
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all"
        >
          <Package className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Inventory</h3>
          <p className="text-orange-100 text-sm mb-4">Add, edit, or remove items from stock</p>
          <div className="flex items-center text-white font-semibold">
            <span>Go to Inventory</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('billing')}
          className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-green-500/50 transition-all"
        >
          <ShoppingCart className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Create Bill</h3>
          <p className="text-green-100 text-sm mb-4">Process sales and generate invoices</p>
          <div className="flex items-center text-white font-semibold">
            <span>Go to Billing</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
        >
          <BarChart3 className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">View Reports</h3>
          <p className="text-purple-100 text-sm mb-4">Analyze sales and inventory data</p>
          <div className="flex items-center text-white font-semibold">
            <span>Go to Reports</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-red-900 font-bold text-lg">Low Stock Alert</h3>
                <p className="text-red-700 text-sm">{lowStockItems.length} items need immediate attention</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
            >
              View Items
            </button>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map(item => (
              <div key={item.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-gray-900 font-semibold">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({item.partNumber})</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-red-600 font-bold">{item.quantity} units left</span>
                  <span className="text-gray-500 text-sm">Reorder: {item.reorderLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Value */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 mb-2">Total Inventory Value</p>
            <p className="text-4xl font-bold">NPR {totalInventoryValue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-16 h-16 text-indigo-200" />
        </div>
      </div>
    </div>
  );
};

// Inventory View Component
const InventoryView: React.FC<{
  filteredInventory: InventoryItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: 'all' | 'local' | 'branded';
  setFilterCategory: (c: 'all' | 'local' | 'branded') => void;
  filterVehicle: 'all' | 'two_wheeler' | 'four_wheeler';
  setFilterVehicle: (v: 'all' | 'two_wheeler' | 'four_wheeler') => void;
  lowStockItems: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}> = ({ 
  filteredInventory, 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory,
  filterVehicle,
  setFilterVehicle,
  lowStockItems,
  onAddItem,
  onEditItem,
  onDeleteItem 
}) => {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or part number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all ml-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Categories</option>
          <option value="local">Local Parts</option>
          <option value="branded">Branded Parts</option>
        </select>
        
        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value as any)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Vehicles</option>
          <option value="two_wheeler">Two Wheeler</option>
          <option value="four_wheeler">Four Wheeler</option>
        </select>

        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700 text-sm font-semibold">
            {filteredInventory.length} items found
          </span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4">
        {filteredInventory.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 ${item.quantity <= item.reorderLevel ? 'bg-red-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                    <Package className={`w-6 h-6 ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-lg">{item.name}</h4>
                    <p className="text-gray-500 text-sm">Part #: {item.partNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.category === 'branded' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {item.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.vehicleType === 'two_wheeler' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {item.vehicleType.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Price</p>
                    <p className="text-gray-900 font-bold">NPR {item.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Quantity</p>
                    <p className={`font-bold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity} units
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Reorder Level</p>
                    <p className="text-gray-900 font-semibold">{item.reorderLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Supplier</p>
                    <p className="text-gray-700 font-semibold">{item.supplier}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Total Value</p>
                    <p className="text-gray-900 font-bold">NPR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <button
                  onClick={() => onEditItem(item)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transactions View
const TransactionsView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 text-xl font-bold">All Transactions</h3>
        <div className="text-gray-600">Total: {transactions.length} transactions</div>
      </div>
      
      {transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(txn => (
        <div key={txn.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-900 font-bold text-lg">{txn.customerName || 'Walk-in Customer'}</div>
              <div className="text-gray-500 text-sm">{new Date(txn.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-900 text-2xl font-bold">NPR {txn.total.toLocaleString()}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                txn.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                txn.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {txn.paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t border-gray-200">
            {txn.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.itemName} × {item.quantity}</span>
                <span className="text-gray-900 font-semibold">NPR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Reports View
const ReportsView: React.FC<{
  inventory: InventoryItem[];
  transactions: Transaction[];
}> = ({ inventory, transactions }) => {
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h3 className="text-blue-100 mb-2">Total Inventory Value</h3>
          <p className="text-4xl font-bold mb-4">NPR {totalValue.toLocaleString()}</p>
          <p className="text-blue-100 text-sm">{inventory.length} items in stock</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h3 className="text-green-100 mb-2">Total Revenue</h3>
          <p className="text-4xl font-bold mb-4">NPR {totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 text-sm">{transactions.length} transactions</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-900 font-bold text-lg mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {['local', 'branded'].map(category => {
            const items = inventory.filter(i => i.category === category);
            const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
            
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-semibold capitalize">{category}</span>
                  <span className="text-gray-900 font-bold">NPR {value.toLocaleString()} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${category === 'local' ? 'bg-orange-500' : 'bg-blue-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Item Form Modal (Same as before but with updated styling)
interface ItemFormModalProps {
  item: InventoryItem | null;
  onSave: (item: Partial<InventoryItem>) => void;
  onClose: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(item || {
    name: '',
    category: 'local',
    vehicleType: 'two_wheeler',
    quantity: 0,
    price: 0,
    retailPrice: 0,
    reorderLevel: 10,
    supplier: '',
    partNumber: '',
    warrantyPeriod: '',
    brand: '',
    model: '',
    description: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Colorful Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-2xl font-bold">
                  {item ? '✏️ Edit Inventory Item' : '➕ Add New Inventory Item'}
                </h3>
                <p className="text-orange-100 text-sm">
                  {item ? 'Update item details and stock information' : 'Fill in all details to add item to your inventory'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between relative">
            {[1, 2, 3].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step 
                      ? 'bg-white text-orange-600 shadow-lg' 
                      : 'bg-white/30 text-white/70'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${
                    currentStep >= step ? 'text-white' : 'text-white/70'
                  }`}>
                    {step === 1 ? 'Basic Info' : step === 2 ? 'Pricing & Stock' : 'Review'}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-white/30 relative -mt-6">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentStep > step ? 'bg-white w-full' : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-5 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-blue-900 font-bold mb-1 text-lg">📝 Step 1: Basic Information</h4>
                    <p className="text-blue-700 text-sm">Enter the fundamental details about the spare part</p>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2 text-lg">
                  <span>🏷️ Item Name</span>
                  <span className="text-red-500 text-xl">*</span>
                </label>
                <p className="text-gray-600 text-sm mb-3">📌 Enter the complete name of the spare part</p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold"
                  placeholder="Example: Brake Pad Set - Front"
                  required
                />
                <p className="text-gray-500 text-xs mt-2 italic">💡 Tip: Be specific - e.g., "Engine Oil Filter for Pulsar 150"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Part Number */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2">
                    <span>🔢 Part Number / SKU</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-600 text-sm mb-3">📌 Unique identifier for tracking</p>
                  <input
                    type="text"
                    value={formData.partNumber}
                    onChange={e => setFormData({...formData, partNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-mono"
                    placeholder="BP-12345"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-2">💡 Can be manufacturer code or your SKU</p>
                </div>

                {/* Supplier */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2">
                    <span>🏭 Supplier Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-600 text-sm mb-3">📌 Who supplies this part?</p>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    placeholder="ABC Auto Parts"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-2">💡 Distributor or manufacturer name</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2">
                    <span>📦 Category</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-600 text-sm mb-3">📌 Is this local or branded?</p>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-semibold"
                  >
                    <option value="local">🇳🇵 Local Part (Locally made)</option>
                    <option value="branded">✨ Branded Part (Company branded)</option>
                  </select>
                </div>

                {/* Vehicle Type */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2">
                    <span>🚗 Vehicle Type</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-600 text-sm mb-3">📌 Compatible vehicle type</p>
                  <select
                    value={formData.vehicleType}
                    onChange={e => setFormData({...formData, vehicleType: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-semibold"
                  >
                    <option value="two_wheeler">🏍️ Two Wheeler (Bike/Scooter)</option>
                    <option value="four_wheeler">🚗 Four Wheeler (Car/Jeep)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2">🏷️ Brand Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    placeholder="Bosch, TVS, Honda"
                  />
                </div>

                {/* Model */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-gray-900 font-bold mb-2">🚗 Vehicle Model (Optional)</label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    placeholder="Pulsar 150, Splendor+"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-gray-900 font-bold mb-2">📝 Description (Optional)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-base resize-none"
                  placeholder="Additional details: material, features, compatibility..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: PRICING & STOCK */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-5 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-green-900 font-bold mb-1 text-lg">💰 Step 2: Pricing & Stock Management</h4>
                    <p className="text-green-700 text-sm">Set prices, manage inventory levels, and track profit</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Price */}
                <div className="bg-yellow-50 rounded-xl p-5 border-2 border-yellow-200">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2 text-lg">
                    <span>💵 Purchase Price (Your Cost)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-700 text-sm mb-3 font-semibold">📌 How much YOU pay to supplier</p>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-xl">NPR</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full pl-20 pr-5 py-4 border-2 border-yellow-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold text-gray-900"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-gray-600 text-xs mt-2 italic">💡 This is your wholesale/purchase cost</p>
                </div>

                {/* Retail Price */}
                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2 text-lg">
                    <span>💰 Retail Price (Selling Price)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-700 text-sm mb-3 font-semibold">📌 How much CUSTOMERS pay you</p>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-xl">NPR</span>
                    <input
                      type="number"
                      value={formData.retailPrice || formData.price}
                      onChange={e => setFormData({...formData, retailPrice: parseFloat(e.target.value)})}
                      className="w-full pl-20 pr-5 py-4 border-2 border-green-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold text-gray-900"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-gray-600 text-xs mt-2 italic">💡 This is your selling price to customers</p>
                </div>
              </div>

              {/* Profit Calculation */}
              {formData.price && formData.retailPrice && formData.retailPrice > 0 && (
                <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-5">
                  <h4 className="text-orange-900 font-bold mb-3 text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>💰 Profit Analysis</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-1">Profit Per Unit</p>
                      <p className="text-green-600 text-2xl font-bold">NPR {(formData.retailPrice - formData.price).toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-1">Profit Margin</p>
                      <p className="text-blue-600 text-2xl font-bold">{(((formData.retailPrice - formData.price) / formData.price) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-1">Markup</p>
                      <p className="text-purple-600 text-2xl font-bold">{(((formData.retailPrice - formData.price) / formData.price) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Stock */}
                <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2 text-lg">
                    <span>📦 Current Stock Quantity</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-700 text-sm mb-3 font-semibold">📌 Units currently in warehouse</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold text-gray-900"
                      placeholder="0"
                      required
                      min="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">units</span>
                  </div>
                </div>

                {/* Reorder Level */}
                <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                  <label className="block text-gray-900 font-bold mb-2 flex items-center space-x-2 text-lg">
                    <span>⚠️ Reorder Alert Level</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-700 text-sm mb-3 font-semibold">📌 Alert when stock goes below this</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 border-2 border-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold text-gray-900"
                      placeholder="10"
                      required
                      min="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">units</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-2 italic">💡 You&apos;ll get low stock alerts at this level</p>
                </div>
              </div>

              {/* Stock Alert */}
              {formData.quantity !== undefined && formData.reorderLevel !== undefined && formData.quantity <= formData.reorderLevel && (
                <div className="bg-red-100 border-2 border-red-400 rounded-xl p-5 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-red-900 font-bold text-lg">⚠️ Low Stock Warning!</p>
                      <p className="text-red-700">Current stock ({formData.quantity}) is at or below reorder level ({formData.reorderLevel})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warranty */}
              <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                <label className="block text-gray-900 font-bold mb-2 text-lg">🛡️ Warranty Period (Optional)</label>
                <p className="text-gray-700 text-sm mb-3">📌 Guarantee/warranty duration</p>
                <input
                  type="text"
                  value={formData.warrantyPeriod || ''}
                  onChange={e => setFormData({...formData, warrantyPeriod: e.target.value})}
                  className="w-full px-5 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  placeholder="6 months, 1 year, 10,000 km"
                />
                <p className="text-gray-600 text-xs mt-2 italic">💡 Examples: "3 months", "1 year", "No warranty"</p>
              </div>

              {/* Stock Value */}
              {formData.quantity && formData.price && (
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-xl p-5">
                  <h4 className="text-indigo-900 font-bold mb-4 text-lg">📊 Stock Value Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Total Investment</p>
                      <p className="text-orange-600 text-2xl font-bold">NPR {(formData.quantity * formData.price).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs mt-1">{formData.quantity} × NPR {formData.price}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Potential Revenue</p>
                      <p className="text-green-600 text-2xl font-bold">NPR {(formData.quantity * (formData.retailPrice || formData.price)).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs mt-1">If all sold</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Total Profit</p>
                      <p className="text-blue-600 text-2xl font-bold">NPR {(formData.quantity * ((formData.retailPrice || formData.price) - formData.price)).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs mt-1">Potential earnings</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-xl p-5 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-purple-900 font-bold mb-1 text-lg">✅ Step 3: Review & Confirm</h4>
                    <p className="text-purple-700 text-sm">Please review all details before saving</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-6">
                <h4 className="text-orange-900 font-bold mb-6 text-xl flex items-center space-x-2">
                  <FileText className="w-6 h-6" />
                  <span>📋 Complete Item Summary</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">🏷️ Item Name</p>
                    <p className="text-gray-900 font-bold text-lg">{formData.name || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">🔢 Part Number</p>
                    <p className="text-gray-900 font-bold text-lg font-mono">{formData.partNumber || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">📦 Category</p>
                    <p className="text-gray-900 font-bold text-lg capitalize">{formData.category}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">🚗 Vehicle Type</p>
                    <p className="text-gray-900 font-bold text-lg capitalize">{formData.vehicleType?.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">💵 Purchase Price</p>
                    <p className="text-orange-600 font-bold text-xl">NPR {formData.price?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">💰 Selling Price</p>
                    <p className="text-green-600 font-bold text-xl">NPR {(formData.retailPrice || formData.price)?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">📦 Stock Quantity</p>
                    <p className="text-blue-600 font-bold text-xl">{formData.quantity || 0} units</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">⚠️ Reorder Level</p>
                    <p className="text-red-600 font-bold text-xl">{formData.reorderLevel || 0} units</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
                    <p className="text-gray-600 font-semibold mb-2 text-sm">🏭 Supplier</p>
                    <p className="text-gray-900 font-bold text-lg">{formData.supplier || '—'}</p>
                  </div>
                  {formData.brand && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-gray-600 font-semibold mb-2 text-sm">🏷️ Brand</p>
                      <p className="text-gray-900 font-bold text-lg">{formData.brand}</p>
                    </div>
                  )}
                  {formData.warrantyPeriod && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-gray-600 font-semibold mb-2 text-sm">🛡️ Warranty</p>
                      <p className="text-gray-900 font-bold text-lg">{formData.warrantyPeriod}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-400">
                  <p className="text-green-900 font-bold text-lg mb-2">✅ Everything looks good?</p>
                  <p className="text-green-700 text-sm">Click "Save to Inventory" below to add this item to your stock!</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t-2 border-gray-200 mt-8">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all flex items-center space-x-2 text-lg"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  <span>← Previous</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all text-lg"
              >
                ❌ Cancel
              </button>
            </div>

            <div className="flex space-x-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/50 font-bold text-lg transition-all flex items-center space-x-2"
                >
                  <span>Next Step →</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 font-bold text-xl transition-all flex items-center space-x-3 animate-pulse-slow"
                >
                  <CheckCircle className="w-7 h-7" />
                  <span>{item ? '✅ Update Item' : '✅ Save to Inventory'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-center mt-4">
            <p className="text-gray-500 font-semibold">
              📍 Step {currentStep} of {totalSteps}
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};
