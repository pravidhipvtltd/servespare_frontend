import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings,
  Package,
  BarChart3,
  Users,
  ShoppingCart,
  FileText,
  Search,
  Menu,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  Clock,
  Bell,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  UserPlus,
  Home,
  Zap,
  Activity,
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  TrendingDown,
  Undo,
  FileEdit,
  Building2,
  Wallet,
  RotateCcw,
  Wrench,
  Crown,
  Shield,
  Star,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Command,
  ArrowRight,
  TrendingDownIcon,
  Layers,
  Grid3x3,
  List,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  CircleDot,
  Inbox,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSync } from "../contexts/SyncContext";
import { usePermissions } from "../contexts/PermissionContext";
import { useDashboardLanguage } from "../contexts/DashboardLanguageContext";
import { PermissionGuard, usePermissionCheck } from "./PermissionGuard";
import { toast } from "sonner";
import { getFromStorage } from "../utils/mockData";
import { getBranches, getCurrentTenantId } from "../api/branch.api";
import { getCurrentUserSubscription } from "../api/subscription.api";
import { getPermissionForPanel } from "../utils/permissionMapping";
import InventoryChatbot from "./chatbot/InventoryChatbot";

// Import panel components
import { DashboardPanel } from "./panels/DashboardPanel";
import { EnhancedDashboardPanel } from "./panels/EnhancedDashboardPanel";
import { UserRolesPanel } from "./panels/UserRolesPanelNew";
import { PartiesPanel } from "./panels/PartiesPanelNew";
import { TotalInventoryPanel } from "./panels/TotalInventoryPanel";
import { BillsPanel } from "./panels/BillsPanel";
import { OrderHistoryPanel } from "./panels/OrderHistoryPanel";
import { DayBookPanel } from "./panels/DayBookPanel";
import { LedgerPanel } from "./panels/LedgerPanel";
import { ReturnPanel } from "./panels/ReturnPanel";
import { BillCreationPanel } from "./panels/BillCreationPanel";
import { PricingControlPanel } from "./panels/PricingControlPanel";
import { PurchaseOrdersPanel } from "./panels/PurchaseOrdersPanel";
import { ReturnRefundPanel } from "./panels/ReturnRefundPanel";
import { FinancialReportsPanel } from "./panels/FinancialReportsPanel";
import { SalesOrderPanel } from "./panels/SalesOrderPanel";
import { BankAccountsPanel } from "./panels/BankAccountsPanel";
import { CashInHandPanel } from "./panels/CashInHandPanel";
import { BulkImportPanel } from "./panels/BulkImportPanel";
import { SalesInvoicesPanel } from "./panels/SalesInvoicesPanel";
import { CashDrawerMonitorPanel } from "./panels/CashDrawerMonitorPanel";
import { AccountLedgerPanel } from "./panels/AccountLedgerPanel";
import { ChequeManagementPanel } from "./panels/ChequeManagementPanel";
import { BranchManagement } from "./BranchManagementEnhanced";
import { SubscriptionManagement } from "./SubscriptionManagement";

// Import new enhancement components
import { GlobalSearch } from "./GlobalSearch";
import { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
import { TestModeBanner } from "./TestModeBanner";
import {
  SubscriptionInfoWidget,
  ExpiryWarningModal,
} from "./SubscriptionInfoWidget";
import { DashboardWidgetSystem } from "./DashboardWidgetSystem";
import { AdvancedThemeCustomizer } from "./AdvancedThemeCustomizer";
import { KeyboardShortcutManager } from "./KeyboardShortcutManager";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
  children?: MenuItem[];
  badge?: string;
  badgeColor?: string;
};

const menuStructure: MenuItem[] = [
  {
    id: "main",
    label: "MAIN",
    icon: null,
    children: [
      { id: "dashboard", label: "Dashboard", icon: Home, panel: "dashboard" },
      {
        id: "branch-management",
        label: "Branch Management",
        icon: Building2,
        panel: "branch-management",
      },
      {
        id: "subscription",
        label: "Subscription",
        icon: Crown,
        panel: "subscription",
        badge: "PRO",
        badgeColor: "amber",
      },
    ],
  },
  {
    id: "stock-management",
    label: "STOCK MANAGEMENT",
    icon: null,
    children: [
      { id: "parties", label: "Parties", icon: Users, panel: "parties" },
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        icon: ShoppingBag,
        panel: "purchase-orders",
      },
      {
        id: "total-inventory",
        label: "Total Inventory",
        icon: Package,
        panel: "total-inventory",
      },
      {
        id: "bulk-import",
        label: "Bulk Import",
        icon: Upload,
        panel: "bulk-import",
      },
      {
        id: "pricing-control",
        label: "Pricing Control",
        icon: DollarSign,
        panel: "pricing-control",
      },
      {
        id: "sales-order",
        label: "Sales Order",
        icon: ShoppingCart,
        panel: "sales-order",
      },
    ],
  },
  {
    id: "sales-management",
    label: "SALES MANAGEMENT",
    icon: null,
    children: [
      { id: "bills", label: "Bills", icon: FileText, panel: "bills" },
      { id: "daybook", label: "DayBook", icon: BookOpen, panel: "daybook" },
      { id: "ledger", label: "Ledger", icon: TrendingDown, panel: "ledger" },
      { id: "return", label: "Return", icon: Undo, panel: "return" },
      {
        id: "sales-invoices",
        label: "Sales Invoices",
        icon: FileText,
        panel: "sales-invoices",
      },
    ],
  },
  {
    id: "account-billing",
    label: "ACCOUNT & BILLING",
    icon: null,
    children: [
      {
        id: "bill-creation",
        label: "Bill Creation",
        icon: FileEdit,
        panel: "bill-creation",
      },
    ],
  },
  {
    id: "cash-bank",
    label: "CASH & BANK",
    icon: null,
    children: [
      {
        id: "bank-accounts",
        label: "Bank Accounts",
        icon: Building2,
        panel: "bank-accounts",
      },
      {
        id: "cash-in-hand",
        label: "Cash In Hand",
        icon: Wallet,
        panel: "cash-in-hand",
      },
      {
        id: "cash-drawer-monitor",
        label: "Cash Drawer Monitor",
        icon: RotateCcw,
        panel: "cash-drawer-monitor",
      },
      {
        id: "account-ledger",
        label: "Account Ledger",
        icon: BookOpen,
        panel: "account-ledger",
      },
      {
        id: "cheque-management",
        label: "Cheque Management",
        icon: CreditCard,
        panel: "cheque-management",
        badge: "NEW",
        badgeColor: "green",
      },
    ],
  },
  {
    id: "financial-reports",
    label: "FINANCIAL REPORTS",
    icon: null,
    children: [
      {
        id: "financial-reports",
        label: "Financial Reports",
        icon: FileText,
        panel: "financial-reports",
      },
      {
        id: "advanced-analytics",
        label: "Advanced Analytics",
        icon: TrendingUp,
        panel: "advanced-analytics",
        badge: "HOT",
        badgeColor: "red",
      },
    ],
  },
];

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout, tenantInfo } = useAuth();
  const { language } = useLanguage();
  const { lastUpdate } = useSync();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState("dashboard");

  // Effect to sync panel with URL
  useEffect(() => {
    const path = location.pathname;
    // Base path for admin dashboard
    const prefix = "/admin/admin";

    // Check if exactly the prefix or prefix/
    if (path === prefix || path === prefix + "/") {
      setActivePanel("dashboard");
      return;
    }

    // Extract section relative to the prefix
    let relativePart = "";
    if (path.startsWith(prefix + "/")) {
      relativePart = path.substring((prefix + "/").length);
    } else if (path.startsWith(prefix)) {
      relativePart = path.substring(prefix.length);
    }

    // Remove any trailing slash from the relative part for matching
    if (relativePart.endsWith("/")) {
      relativePart = relativePart.slice(0, -1);
    }

    if (!relativePart) {
      setActivePanel("dashboard");
      return;
    }

    setActivePanel(relativePart);
  }, [location.pathname]);

  const handleNavigate = (panel: string) => {
    navigate(`/admin/admin/${panel}`);
  };

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "main",
    "stock-management",
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inventoryFilter, setInventoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenuStructure, setFilteredMenuStructure] =
    useState<MenuItem[]>(menuStructure);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryInfo, setExpiryInfo] = useState<{
    daysLeft: number;
    expiryDate: string;
    packageName: string;
  } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recentPanels, setRecentPanels] = useState<string[]>(["dashboard"]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [branches, setBranches] = useState<any[]>([
    {
      id: "all",
      name: "All Branches",
      location: "All Locations",
      isDefault: true,
    },
  ]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  // Fetch branches from centralized API
  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    toast.error("apiii", {
      description: "Backend data required for full dashboard experience",
      duration: 10000,
    });
    try {
      const tenantId = currentUser?.workspaceId || getCurrentTenantId();

      console.log("🔍 [fetchBranches] Starting fetch for tenant:", tenantId);

      const data = await getBranches(tenantId || undefined);
      console.log("📦 [fetchBranches] API response:", data);

      const branchList = data.results || [];

      console.log(
        "🔄 [fetchBranches] Branch list to map:",
        branchList.length,
        branchList,
      );

      const mappedBranches = branchList.map((apiBranch: any) => ({
        id: apiBranch.id.toString(),
        name: apiBranch.branch_name || apiBranch.name,
        location: `${apiBranch.city || ""}, ${apiBranch.state || ""}`.trim(),
        address: apiBranch.Address || apiBranch.address,
        city: apiBranch.city,
        state: apiBranch.state,
        phone: apiBranch.phone,
        email: apiBranch.Email || apiBranch.email,
        isActive: apiBranch.is_active,
        code: apiBranch.branch_code,
      }));

      console.log("✅ [fetchBranches] Mapped branches:", mappedBranches);

      // Add "All Branches" option at the beginning
      const finalBranches = [
        {
          id: "all",
          name: "All Branches",
          location: "All Locations",
          isDefault: true,
        },
        ...mappedBranches,
      ];

      setBranches(finalBranches);
      console.log(
        "✅ Branches loaded:",
        mappedBranches.length,
        "Total:",
        finalBranches.length,
      );
    } catch (error) {
      console.error("❌ Error fetching branches:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Check subscription expiry on dashboard load
  useEffect(() => {
    checkSubscriptionExpiry();
    loadNotifications();
    loadFavorites();
    fetchBranches(); // Load branches from API

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Esc to close command palette
      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Click outside handlers
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        branchRef.current &&
        !branchRef.current.contains(event.target as Node)
      ) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentUser]);

  const loadNotifications = () => {
    // Mock notifications
    setNotifications([
      {
        id: 1,
        title: "Low Stock Alert",
        message: "Product ABC123 is running low",
        type: "warning",
        time: "5m ago",
        read: false,
      },
      {
        id: 2,
        title: "New Order",
        message: "Order #12345 received",
        type: "info",
        time: "10m ago",
        read: false,
      },
      {
        id: 3,
        title: "Payment Received",
        message: "NPR 15,000 from Party XYZ",
        type: "success",
        time: "1h ago",
        read: true,
      },
    ]);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem("dashboard_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = (panelId: string) => {
    const updated = favorites.includes(panelId)
      ? favorites.filter((f) => f !== panelId)
      : [...favorites, panelId];
    setFavorites(updated);
    localStorage.setItem("dashboard_favorites", JSON.stringify(updated));
  };

  const checkSubscriptionExpiry = () => {
    const subscriptions = getFromStorage("subscriptions", []);
    const userSubscription = subscriptions.find(
      (s: any) => s.workspaceId === currentUser?.workspaceId,
    );

    if (userSubscription && userSubscription.expiryDate) {
      const expiryDate = new Date(userSubscription.expiryDate);
      const now = new Date();
      const daysLeft = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft <= 10 && daysLeft >= 0) {
        const hasSeenWarning = sessionStorage.getItem(
          "subscription_warning_seen",
        );
        if (!hasSeenWarning) {
          setExpiryInfo({
            daysLeft,
            expiryDate: userSubscription.expiryDate,
            packageName:
              userSubscription.package || tenantInfo?.package || "basic",
          });
          setShowExpiryModal(true);
        }
      } else if (daysLeft < 0) {
        setExpiryInfo({
          daysLeft: 0,
          expiryDate: userSubscription.expiryDate,
          packageName:
            userSubscription.package || tenantInfo?.package || "basic",
        });
        setShowExpiryModal(true);
      }
    }
  };

  const handleCloseExpiryModal = () => {
    setShowExpiryModal(false);
    sessionStorage.setItem("subscription_warning_seen", "true");
  };

  const handleRenewSubscription = () => {
    setShowExpiryModal(false);
    setActivePanel("subscription");
  };

  useEffect(() => {
    const navigateToPanel = localStorage.getItem("navigateToPanel");
    if (navigateToPanel) {
      console.log("🎯 Navigating to panel after payment:", navigateToPanel);
      setActivePanel(navigateToPanel);
      localStorage.removeItem("navigateToPanel");
    }
  }, []);

  useEffect(() => {
    initializeExtendedStorage();

    const handleQuickStatClick = (event: any) => {
      const { panel, filter } = event.detail;
      setActivePanel(panel);
      setInventoryFilter(filter);
    };

    window.addEventListener("quickStatClick", handleQuickStatClick);
    return () => {
      window.removeEventListener("quickStatClick", handleQuickStatClick);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMenuStructure(menuStructure);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = menuStructure
      .map((section) => {
        const filteredChildren = section.children?.filter((item) =>
          item.label.toLowerCase().includes(query),
        );

        if (filteredChildren && filteredChildren.length > 0) {
          return {
            ...section,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];

    setFilteredMenuStructure(filtered);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getNepalTime = () => {
    const utcTime =
      currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const nepalTime = new Date(utcTime + 5.75 * 60 * 60 * 1000);
    return nepalTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getNepalDate = () => {
    const utcTime =
      currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const nepalTime = new Date(utcTime + 5.75 * 60 * 60 * 1000);
    return nepalTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handlePanelChange = (panelId: string) => {
    setActivePanel(panelId);
    // Add to recent panels
    setRecentPanels((prev) => {
      const updated = [panelId, ...prev.filter((p) => p !== panelId)].slice(
        0,
        5,
      );
      return updated;
    });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const renderPanel = () => {
    // Pass selectedBranch to all panels except dashboard
    const branchFilter = selectedBranch !== "all" ? selectedBranch : undefined;

    switch (activePanel) {
      case "dashboard":
        // Dashboard shows all branches data
        return <DashboardPanel />;
      case "parties":
        return <PartiesPanel branchId={branchFilter} />;
      case "total-inventory":
        return (
          <TotalInventoryPanel
            filter={inventoryFilter}
            branchId={branchFilter}
          />
        );
      case "bills":
        return <BillsPanel branchId={branchFilter} />;
      case "daybook":
        return <DayBookPanel branchId={branchFilter} />;
      case "ledger":
        return <LedgerPanel branchId={branchFilter} />;
      case "return":
        return <ReturnPanel branchId={branchFilter} />;
      case "bill-creation":
        return <BillCreationPanel branchId={branchFilter} />;
      case "bank-accounts":
        return <BankAccountsPanel branchId={branchFilter} />;
      case "pricing-control":
        return <PricingControlPanel branchId={branchFilter} />;
      case "purchase-orders":
        return <PurchaseOrdersPanel branchId={branchFilter} />;
      case "return-refund":
        return <ReturnRefundPanel branchId={branchFilter} />;
      case "financial-reports":
        return <FinancialReportsPanel branchId={branchFilter} />;
      case "sales-order":
        return <SalesOrderPanel branchId={branchFilter} />;
      case "cash-in-hand":
        return <CashInHandPanel branchId={branchFilter} />;
      case "bulk-import":
        return <BulkImportPanel branchId={branchFilter} />;
      case "sales-invoices":
        return <SalesInvoicesPanel branchId={branchFilter} />;
      case "cash-drawer-monitor":
        return <CashDrawerMonitorPanel branchId={branchFilter} />;
      case "account-ledger":
        return <AccountLedgerPanel branchId={branchFilter} />;
      case "cheque-management":
        return <ChequeManagementPanel branchId={branchFilter} />;
      case "advanced-analytics":
        return (
          <AdvancedAnalyticsDashboard
            workspaceId={currentUser?.workspaceId || ""}
            timeRange="week"
            branchId={branchFilter}
          />
        );
      case "branch-management":
        return (
          <BranchManagement
            onNavigateToSubscription={() => setActivePanel("subscription")}
          />
        );
      case "subscription":
        return <SubscriptionManagement />;
      default:
        return <DashboardPanel />;
    }
  };

  const handleSearchSelect = (result: any) => {
    switch (result.type) {
      case "product":
        setActivePanel("total-inventory");
        break;
      case "party":
        setActivePanel("parties");
        break;
      case "bill":
        setActivePanel("bills");
        break;
      case "order":
        setActivePanel("purchase-orders");
        break;
      default:
        break;
    }
  };

  const initializeExtendedStorage = () => {
    console.log("🧹 System initialized with empty data");
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <TestModeBanner />
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 overflow-hidden">
        {/* Enhanced Sidebar */}
        <aside
          className={`${
            sidebarOpen ? (sidebarCollapsed ? "w-20" : "w-72") : "w-0"
          } bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-500 ease-in-out overflow-hidden flex flex-col fixed lg:relative h-full z-30 shadow-2xl border-r border-white/10`}
        >
          {/* Logo & Brand */}
          <div
            className={`p-6 flex items-center ${
              sidebarCollapsed ? "justify-center" : "space-x-3"
            } border-b border-white/10 relative overflow-hidden`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>

            <div className="relative z-10">
              {/* Enhanced Logo with Multiple Layers */}
              <div className="relative w-14 h-14 flex items-center justify-center group cursor-pointer">
                {/* Triple Glow Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"
                  style={{ animationDelay: "150ms" }}
                ></div>

                {/* Main Logo Container */}
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  {/* Hexagonal Pattern Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1 left-1 w-3 h-3 border border-white/40 rotate-45"></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border border-white/40 rotate-45"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 border border-white/30 rounded-full"></div>
                    <div className="absolute bottom-1 left-1 w-2 h-2 border border-white/30 rounded-full"></div>
                  </div>

                  {/* Layered Icons */}
                  <div className="relative">
                    <Settings
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/30 animate-spin"
                      style={{ animationDuration: "20s" }}
                    />
                    <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/50 rotate-45 drop-shadow-lg" />
                    <Settings
                      className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-spin z-10"
                      style={{
                        animationDuration: "15s",
                        animationDirection: "reverse",
                      }}
                    />

                    {/* Sparkle Effects */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                    <div
                      className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-90"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping opacity-60"
                      style={{ animationDelay: "500ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="relative z-10 flex-1">
                <h1 className="text-white relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent font-bold text-xl tracking-wide">
                    Serve Spares
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 blur-lg opacity-50"></span>
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent font-semibold tracking-wide">
                    Inventory System Pro
                  </span>
                </p>
              </div>
            )}

            {/* Close Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/10 hover:bg-red-500/80 rounded-lg flex items-center justify-center transition-all hover:scale-110 z-20"
              title="Close Sidebar"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-900"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-3 h-3 text-white" />
              ) : (
                <ChevronLeft className="w-3 h-3 text-white" />
              )}
            </button>
          </div>

          {/* Enhanced Search Bar */}
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 group-hover:border-white/40 transition-all duration-300 shadow-lg">
                  <div className="flex items-center px-3 py-2.5 space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        searchQuery
                          ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50"
                          : "bg-white/10 group-hover:bg-white/20"
                      }`}
                    >
                      <Search
                        className={`w-4 h-4 transition-all duration-300 ${
                          searchQuery
                            ? "text-white animate-pulse scale-110"
                            : "text-gray-300 group-hover:text-white"
                        }`}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Search menu..."
                      className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") clearSearch();
                      }}
                    />

                    {searchQuery ? (
                      <button
                        onClick={clearSearch}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Clear search (Esc)"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-white/10 text-gray-400 rounded border border-white/20">
                          ⌘K
                        </kbd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Section */}
          {!sidebarCollapsed && favorites.length > 0 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-amber-400 font-semibold mb-2 flex items-center space-x-2">
                <Star className="w-3 h-3 fill-current" />
                <span>FAVORITES</span>
              </div>
              <div className="space-y-1">
                {favorites.slice(0, 3).map((fav) => {
                  const item = menuStructure
                    .flatMap((s) => s.children || [])
                    .find((i) => i.panel === fav);
                  if (!item) return null;
                  return (
                    <button
                      key={fav}
                      onClick={() => handlePanelChange(item.panel!)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-xs ${
                        activePanel === item.panel
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white border border-amber-500/30"
                          : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {filteredMenuStructure.map((section) => (
              <div key={section.id} className="mb-4">
                {!sidebarCollapsed && (
                  <div className="px-4 py-2 text-amber-400/80 text-xs uppercase tracking-wider font-bold flex items-center space-x-2">
                    <Sparkles className="w-3 h-3" />
                    <span>{section.label}</span>
                  </div>
                )}
                {section.children?.map((item) => {
                  const isFavorite = favorites.includes(item.panel || "");
                  return (
                    <div key={item.id} className="relative group/item">
                      <button
                        onClick={() =>
                          handleNavigate(item.panel || "dashboard")
                        }
                        className={`w-full flex items-center ${
                          sidebarCollapsed
                            ? "justify-center px-2"
                            : "space-x-3 px-4"
                        } py-3 transition-all duration-300 relative overflow-hidden ${
                          activePanel === item.panel
                            ? "bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-[0.98]"
                            : "text-gray-300 hover:bg-white/10 hover:translate-x-1"
                        }`}
                      >
                        {activePanel === item.panel && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                        )}

                        <div className="relative flex items-center space-x-3 flex-1">
                          <item.icon
                            className={`w-5 h-5 ${
                              activePanel === item.panel
                                ? "drop-shadow-glow"
                                : ""
                            }`}
                          />
                          {!sidebarCollapsed && (
                            <>
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                                    item.badgeColor === "amber"
                                      ? "bg-amber-500 text-white"
                                      : item.badgeColor === "green"
                                        ? "bg-green-500 text-white"
                                        : item.badgeColor === "red"
                                          ? "bg-red-500 text-white animate-pulse"
                                          : "bg-blue-500 text-white"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {!sidebarCollapsed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.panel!);
                            }}
                            className={`opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded ${
                              isFavorite ? "opacity-100" : ""
                            }`}
                          >
                            <Star
                              className={`w-3 h-3 ${
                                isFavorite
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Enhanced User Info */}
          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center ${
                  sidebarCollapsed ? "justify-center w-full" : "space-x-3"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {currentUser?.name}
                    </div>
                    <div className="text-amber-400 text-xs font-medium">
                      Admin
                    </div>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110 group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* World-Class Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm relative ">
            {/* Animated background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
              </div>
            </div>

            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Menu button to open sidebar - more prominent when sidebar is closed */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`p-2.5 rounded-xl transition-all hover:scale-110 shadow-sm ${
                      sidebarOpen
                        ? "hover:bg-gray-100"
                        : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                    }`}
                  >
                    {sidebarOpen ? (
                      <X className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Menu className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      {React.createElement(
                        menuStructure
                          .flatMap((s) => s.children || [])
                          .find((i) => i.panel === activePanel)?.icon || Home,
                        { className: "w-5 h-5 text-white" },
                      )}
                    </div>
                    <div>
                      <h2 className="text-gray-900 text-xl font-bold capitalize">
                        {activePanel.replace(/-/g, " ")}
                      </h2>
                      <p className="text-gray-500 text-xs">
                        Manage your operations efficiently
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Header Controls */}
                <div className="flex items-center space-x-3">
                  {/* Branch Selector */}
                  <div className="relative" ref={branchRef}>
                    <button
                      onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 transition-all hover:scale-105 border border-blue-200/50 shadow-sm"
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">
                        {branches.find((b) => b.id === selectedBranch)?.name ||
                          "All Branches"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          showBranchDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Branch Dropdown */}
                    {showBranchDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-slideDown">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <h3 className="font-bold text-sm">Select Branch</h3>
                          </div>
                          <p className="text-[10px] text-blue-100 mt-0.5">
                            {isLoadingBranches
                              ? "Loading branches..."
                              : `${branches.length} branches available`}
                          </p>
                        </div>
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                          {isLoadingBranches ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-xs text-gray-500 mt-2">
                                Loading branches...
                              </p>
                            </div>
                          ) : (
                            branches.map((branch) => (
                              <button
                                key={branch.id}
                                onClick={() => {
                                  setSelectedBranch(branch.id);
                                  setShowBranchDropdown(false);
                                }}
                                className={`w-full p-2 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all text-left group ${
                                  selectedBranch === branch.id
                                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        branch.isDefault
                                          ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                          : "bg-gradient-to-br from-blue-500 to-purple-600"
                                      } shadow-md`}
                                    >
                                      {branch.isDefault ? (
                                        <Database className="w-4 h-4 text-white" />
                                      ) : (
                                        <Building2 className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                        {branch.name}
                                      </p>
                                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                        {branch.location}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedBranch === branch.id && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Online Status */}
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                      isOnline
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isOnline ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                    >
                      <Bell className="w-5 h-5 text-gray-700" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                          <h3 className="font-bold text-lg">Notifications</h3>
                          <p className="text-xs text-blue-100">
                            {unreadNotificationCount} unread
                          </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                  !notif.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 ${
                                      notif.type === "warning"
                                        ? "bg-yellow-500"
                                        : notif.type === "success"
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                    }`}
                                  ></div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-900">
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {notif.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                No notifications
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <GlobalSearch />

                  {/* Time Display */}
                  <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div className="text-right">
                      <div className="text-gray-900 text-sm font-bold">
                        {getNepalTime()}
                      </div>
                      <div className="text-gray-500 text-xs">Nepal Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Widget */}
              <div className="mt-4 w-full lg:w-1/2">
                <SubscriptionInfoWidget
                  onNavigateToSubscription={() =>
                    setActivePanel("subscription")
                  }
                />
              </div>
            </div>
          </header>

          {/* Panel Content with Animation */}
          <main className="flex-1 overflow-y-auto p-6 relative">
            {/* Animated background particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-40 right-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 animate-fadeIn">{renderPanel()}</div>
          </main>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideDown">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Command className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-gray-900 outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {menuStructure
                .flatMap((s) => s.children || [])
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handlePanelChange(item.panel!);
                      setShowCommandPalette(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="flex-1 text-gray-900">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <ExpiryWarningModal
        show={showExpiryModal}
        onClose={handleCloseExpiryModal}
        onRenew={handleRenewSubscription}
        daysLeft={expiryInfo?.daysLeft || 0}
        expiryDate={expiryInfo?.expiryDate || ""}
        packageName={expiryInfo?.packageName || "basic"}
      />

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(100%);
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};
