import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Tag, UserCircle, ShoppingBag, Package, FileText, 
  History, BookOpen, TrendingDown, Undo, FileEdit, Building2, Wallet, DollarSign, ShoppingCart, RotateCcw,
  LogOut, ChevronDown, ChevronRight, Menu, X, Search, Settings, Wrench, Upload, Scan
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSync } from '../contexts/SyncContext';
import { usePermissions } from '../contexts/PermissionContext';
import { PermissionGuard, usePermissionCheck } from './PermissionGuard';
import { getFromStorage } from '../utils/mockData';
import { initializeExtendedStorage } from '../utils/extendedMockData';
import { getPermissionForPanel } from '../utils/permissionMapping';

// Import panel components
import { DashboardPanel } from './panels/DashboardPanel';
import { EnhancedDashboardPanel } from './panels/EnhancedDashboardPanel';
import { UserRolesPanel } from './panels/UserRolesPanel';
import { PartiesPanel } from './panels/PartiesPanel';
import { TotalInventoryPanel } from './panels/TotalInventoryPanel';
import { BillsPanel } from './panels/BillsPanel';
import { OrderHistoryPanel } from './panels/OrderHistoryPanel';
import { DayBookPanel } from './panels/DayBookPanel';
import { LedgerPanel } from './panels/LedgerPanel';
import { ReturnPanel } from './panels/ReturnPanel';
import { BillCreationPanel } from './panels/BillCreationPanel';
import { PricingControlPanel } from './panels/PricingControlPanel';
import { PurchaseOrdersPanel } from './panels/PurchaseOrdersPanel';
import { ReturnRefundPanel } from './panels/ReturnRefundPanel';
import { FinancialReportsPanel } from './panels/FinancialReportsPanel';
import { SalesOrderPanel } from './panels/SalesOrderPanel';
import { BankAccountsPanel } from './panels/BankAccountsPanel';
import { CashInHandPanel } from './panels/CashInHandPanel';
import { BulkImportPanel } from './panels/BulkImportPanel';
import { SalesInvoicesPanel } from './panels/SalesInvoicesPanel';
import { CashDrawerMonitorPanel } from './panels/CashDrawerMonitorPanel';

// Import new enhancement components
import { QuickActionsMenu } from './QuickActionsMenu';
import { GlobalSearch } from './GlobalSearch';
import { SystemHealthWidget } from './SystemHealthWidget';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
  children?: MenuItem[];
};

const menuStructure: MenuItem[] = [
  {
    id: 'main',
    label: 'MAIN',
    icon: null,
    children: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, panel: 'dashboard' },
      { id: 'user-roles', label: 'User Roles', icon: Users, panel: 'user-roles' },
    ],
  },
  {
    id: 'stock-management',
    label: 'STOCK MANAGEMENT',
    icon: null,
    children: [
      { id: 'parties', label: 'Parties', icon: Users, panel: 'parties' },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingBag, panel: 'purchase-orders' },
      { id: 'total-inventory', label: 'Total Inventory', icon: Package, panel: 'total-inventory' },
      { id: 'bulk-import', label: 'Bulk Import', icon: Upload, panel: 'bulk-import' },
      { id: 'pricing-control', label: 'Pricing Control', icon: DollarSign, panel: 'pricing-control' },
      { id: 'sales-order', label: 'Sales Order', icon: ShoppingCart, panel: 'sales-order' },
    ],
  },
  {
    id: 'sales-management',
    label: 'SALES MANAGEMENT',
    icon: null,
    children: [
      { id: 'bills', label: 'Bills', icon: FileText, panel: 'bills' },
      { id: 'daybook', label: 'DayBook', icon: BookOpen, panel: 'daybook' },
      { id: 'ledger', label: 'Ledger', icon: TrendingDown, panel: 'ledger' },
      { id: 'return', label: 'Return', icon: Undo, panel: 'return' },
      { id: 'sales-invoices', label: 'Sales Invoices', icon: FileText, panel: 'sales-invoices' },
    ],
  },
  {
    id: 'account-billing',
    label: 'ACCOUNT & BILLING',
    icon: null,
    children: [
      { id: 'bill-creation', label: 'Bill Creation', icon: FileEdit, panel: 'bill-creation' },
    ],
  },
  {
    id: 'cash-bank',
    label: 'CASH & BANK',
    icon: null,
    children: [
      { id: 'bank-accounts', label: 'Bank Accounts', icon: Building2, panel: 'bank-accounts' },
      { id: 'cash-in-hand', label: 'Cash In Hand', icon: Wallet, panel: 'cash-in-hand' },
      { id: 'cash-drawer-monitor', label: 'Cash Drawer Monitor', icon: RotateCcw, panel: 'cash-drawer-monitor' },
    ],
  },

  {
    id: 'financial-reports',
    label: 'FINANCIAL REPORTS',
    icon: null,
    children: [
      { id: 'financial-reports', label: 'Financial Reports', icon: FileText, panel: 'financial-reports' },
    ],
  },
];

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const { lastUpdate } = useSync();
  const { hasPermission } = usePermissions();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inventoryFilter, setInventoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenuStructure, setFilteredMenuStructure] = useState(menuStructure);

  // New enhancement states
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  useEffect(() => {
    initializeExtendedStorage();
    
    // Listen for quick stat click events
    const handleQuickStatClick = (event: any) => {
      const { panel, filter } = event.detail;
      setActivePanel(panel);
      setInventoryFilter(filter);
    };
    
    // Global search keyboard shortcut (Cmd+K or Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    
    window.addEventListener('quickStatClick', handleQuickStatClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('quickStatClick', handleQuickStatClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMenuStructure(menuStructure);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = menuStructure.map(section => {
      const filteredChildren = section.children?.filter(item =>
        item.label.toLowerCase().includes(query)
      );

      if (filteredChildren && filteredChildren.length > 0) {
        return {
          ...section,
          children: filteredChildren
        };
      }
      return null;
    }).filter(Boolean) as MenuItem[];

    setFilteredMenuStructure(filtered);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getNepalTime = () => {
    // UTC+5:45 (Nepal Time)
    const utcTime = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const nepalTime = new Date(utcTime + (5.75 * 60 * 60 * 1000));
    return nepalTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const getNepalDate = () => {
    const utcTime = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const nepalTime = new Date(utcTime + (5.75 * 60 * 60 * 1000));
    return nepalTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderPanel = () => {
    // Admin has full access to all panels - no permission checks
    switch (activePanel) {
      case 'dashboard': return <DashboardPanel />;
      case 'user-roles': return <UserRolesPanel />;
      case 'parties': return <PartiesPanel />;
      case 'total-inventory': return <TotalInventoryPanel filter={inventoryFilter} />;
      case 'bills': return <BillsPanel />;
      case 'daybook': return <DayBookPanel />;
      case 'ledger': return <LedgerPanel />;
      case 'return': return <ReturnPanel />;
      case 'bill-creation': return <BillCreationPanel />;
      case 'bank-accounts': return <BankAccountsPanel />;
      case 'pricing-control': return <PricingControlPanel />;
      case 'purchase-orders': return <PurchaseOrdersPanel />;
      case 'return-refund': return <ReturnRefundPanel />;
      case 'financial-reports': return <FinancialReportsPanel />;
      case 'sales-order': return <SalesOrderPanel />;
      case 'cash-in-hand': return <CashInHandPanel />;
      case 'bulk-import': return <BulkImportPanel />;
      case 'sales-invoices': return <SalesInvoicesPanel />;
      case 'cash-drawer-monitor': return <CashDrawerMonitorPanel />;
      default: return <DashboardPanel />;
    }
  };

  // Handler for quick action clicks
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-bill':
        setActivePanel('bill-creation');
        break;
      case 'add-inventory':
        setActivePanel('total-inventory');
        break;
      case 'add-party':
        setActivePanel('parties');
        break;
      case 'create-order':
        setActivePanel('purchase-orders');
        break;
      case 'add-expense':
        setActivePanel('cash-in-hand');
        break;
      case 'view-reports':
        setActivePanel('financial-reports');
        break;
      default:
        break;
    }
  };

  // Handler for global search result selection
  const handleSearchSelect = (result: any) => {
    switch (result.type) {
      case 'product':
        setActivePanel('total-inventory');
        break;
      case 'party':
        setActivePanel('parties');
        break;
      case 'bill':
        setActivePanel('bills');
        break;
      case 'order':
        setActivePanel('purchase-orders');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}>
        {/* Logo & Brand */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative">
            {/* Spare Parts Themed Logo with Triple Glow Effect */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Outer Glow Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
              
              {/* Middle Glow Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              
              {/* Logo Container */}
              <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
                {/* Background Pattern - Hexagonal grid effect */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 left-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border border-white/40 rotate-45"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 border border-white/30 rounded-full"></div>
                  <div className="absolute bottom-1 left-1 w-2 h-2 border border-white/30 rounded-full"></div>
                </div>
                
                {/* Main Icon Stack - Layered spare parts */}
                <div className="relative">
                  {/* Background Gear (Large, Rotating) */}
                  <Settings 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/30 animate-spin" 
                    style={{ animationDuration: '20s' }}
                  />
                  
                  {/* Middle Layer - Wrench (Diagonal) */}
                  <Wrench 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/50 rotate-45 drop-shadow-lg"
                  />
                  
                  {/* Front Gear (Smaller, Counter-rotating) */}
                  <Settings 
                    className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-spin z-10" 
                    style={{ animationDuration: '15s', animationDirection: 'reverse' }}
                  />
                  
                  {/* Top Sparkle - Engine spark effect */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                  
                  {/* Bottom Sparkle - Oil drop effect */}
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-90" style={{ animationDelay: '300ms' }}></div>
                  
                  {/* Side Shine effect */}
                  <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '500ms' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl tracking-wide animate-pulse">
                Serve Spares
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 blur-lg opacity-50 animate-pulse"></span>
              <span className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-700 blur-2xl opacity-30 animate-pulse"></span>
            </h1>
            <p className="text-gray-400 text-xs relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent font-semibold tracking-wide animate-pulse" style={{ animationDelay: '200ms' }}>
                Inventory System
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 blur-md opacity-40 animate-pulse" style={{ animationDelay: '200ms' }}></span>
              <span className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 blur-lg opacity-20 animate-pulse" style={{ animationDelay: '200ms' }}></span>
            </p>
          </div>
        </div>

        {/* Cute Search Bar */}
        <div className="p-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300" />
            <div className="relative bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 group-hover:border-transparent transition-all duration-300">
              <div className="flex items-center px-3 py-2.5 space-x-3">
                {/* Amazing Search Icon with Circle Background */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  searchQuery 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50' 
                    : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <Search className={`w-4 h-4 transition-all duration-300 ${
                    searchQuery 
                      ? 'text-white animate-pulse scale-110' 
                      : 'text-gray-300 group-hover:text-white'
                  }`} />
                </div>
                
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') clearSearch();
                  }}
                />
                
                <div className="flex items-center space-x-2">
                  {searchQuery ? (
                    <>
                      <button
                        onClick={clearSearch}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors group/clear"
                        title="Clear search (Esc)"
                      >
                        <X className="w-4 h-4 text-gray-400 group-hover/clear:text-red-400 transition-colors" />
                      </button>
                      <button
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all flex items-center space-x-1.5 shadow-lg shadow-blue-500/20"
                        title="Search"
                      >
                        <Search className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs text-white font-medium">Search</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded border border-gray-600 group-hover:bg-gray-600 transition-colors">
                        ⌘
                      </kbd>
                      <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded border border-gray-600 group-hover:bg-gray-600 transition-colors">
                        K
                      </kbd>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Counter */}
        {searchQuery && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {filteredMenuStructure.reduce((count, section) => count + (section.children?.length || 0), 0)} result(s) found
              </span>
              {filteredMenuStructure.length === 0 && (
                <span className="text-red-400">No matches</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuStructure.map((section) => (
            <div key={section.id} className="mb-4">
              <div className="px-4 py-2 text-gray-500 text-xs uppercase tracking-wider">
                {section.label}
              </div>
              {section.children?.map((item) => {
                // Don't hide menu items - let users see all options
                // Only block access at panel level with PermissionGuard
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePanel(item.panel!);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                      activePanel === item.panel
                        ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <div className="text-white text-sm">{currentUser?.name}</div>
                <div className="text-gray-400 text-xs">Admin</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-gray-900 text-xl capitalize">
                  {activePanel.replace(/-/g, ' ')}
                </h2>
                <p className="text-gray-500 text-sm">Manage your inventory and operations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-900 flex items-center space-x-2">
                <span className="text-blue-600">UTC+5:45</span>
                <span>•</span>
                <span>{getNepalTime()}</span>
              </div>
              <div className="text-gray-500 text-sm">{getNepalDate()}</div>
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