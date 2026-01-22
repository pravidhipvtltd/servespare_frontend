import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Package,
  TrendingUp,
  LogOut,
  Search,
  Edit,
  Trash2,
  Eye,
  Settings,
  Wrench,
  Shield,
  Activity,
  FileText,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  DollarSign,
  Menu,
  X,
  Key,
  Zap,
  CreditCard,
  Filter,
  Plus,
  Clock,
  Wallet,
  Award,
  TrendingDown,
  PieChart,
  Store,
  UserCheck,
  Layers,
  Crown,
  Sparkles,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { PendingVerificationsPanel } from "./panels/PendingVerificationsPanel";
import { PendingApprovalsTab } from "./superadmin/PendingApprovalsTab";
import { AuditLogDetailed } from "./AuditLogDetailed";
import { SystemSettingsFixed } from "./SystemSettingsFixed";
import { getSubscriptions } from "../api/subscription.api";
import { AccessControlPanel } from "./panels/AccessControlPanel";
import { SystemVerificationPanel } from "./SystemVerificationPanel";
import { QuickTestPanel } from "./QuickTestPanel";
import { RoleTestingPanel } from "./RoleTestingPanel";
import {
  AddAdminModal,
  ViewAdminModal,
  EditAdminModal,
  DeleteAdminModal,
  CreateAdminUserModal,
} from "./modals/SuperAdminModals";
import {
  RenewSubscriptionModal,
  UpgradePackageModal,
  MarkAsPaidModal,
  ManagePlanModal,
} from "./modals/SubscriptionPaymentModals";
import { CredentialsModal } from "./modals/CredentialsModal";
import SubscriptionPackageModal from "./modals/SubscriptionPackageModal";
import { ChequeManagementPanel } from "./panels/ChequeManagementPanel";
import { getBranches, Branch } from "../api/branch.api";
import { useNavigate, useLocation } from "react-router-dom";

// Subscription Package Types
export type SubscriptionPackage = "basic" | "professional" | "enterprise";

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
  status: "active" | "suspended" | "expired";
  demoMode: boolean;
  password: string;
  isFirstLogin: boolean;
  createdBySuperAdmin: boolean; // Whether this account was created by SuperAdmin
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
    name: "Basic",
    price: 2500,
    features: {
      users: 3,
      products: 1000,
      branches: 1,
      support: "Email",
    },
    color: "blue",
    icon: Package,
  },
  professional: {
    name: "Professional",
    price: 5000,
    features: {
      users: 10,
      products: 10000,
      branches: 5,
      support: "Priority",
    },
    color: "purple",
    icon: Crown,
  },
  enterprise: {
    name: "Enterprise",
    price: 10000,
    features: {
      users: "Unlimited",
      products: "Unlimited",
      branches: "Unlimited",
      support: "24/7",
    },
    color: "orange",
    icon: Sparkles,
  },
};

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  panel?: string;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, panel: "dashboard" },
  { id: "admins", label: "Admin Accounts", icon: Users, panel: "admins" },
  {
    id: "pending_approvals",
    label: "Pending Approvals",
    icon: UserCheck,
    panel: "pending_approvals",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    panel: "subscriptions",
  },
  { id: "payments", label: "Payments & Dues", icon: Wallet, panel: "payments" },
  {
    id: "cheques",
    label: "Cheque Management",
    icon: Banknote,
    panel: "cheques",
  },
  {
    id: "pending_verifications",
    label: "Pending Verifications",
    icon: UserCheck,
    panel: "pending_verifications",
  },
  {
    id: "access_control",
    label: "Access Control",
    icon: Key,
    panel: "access_control",
  },
  {
    id: "branches",
    label: "Branch Overview",
    icon: Building2,
    panel: "branches",
  },
  {
    id: "role_testing",
    label: "Role Testing",
    icon: Eye,
    panel: "role_testing",
  },
  {
    id: "system_verification",
    label: "System Verification",
    icon: Activity,
    panel: "system_verification",
  },
  {
    id: "quick_test",
    label: "Quick Test",
    icon: CheckCircle,
    panel: "quick_test",
  },
  { id: "reports", label: "Revenue Reports", icon: FileText, panel: "reports" },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    panel: "settings",
  },
  { id: "audit", label: "Audit Log", icon: Shield, panel: "audit" },
];

export const SuperAdminDashboardRefined: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPanelFromPath = () => {
    const path = location.pathname;
    const prefix = "/admin/super-admin";

    // Check if exactly the prefix or prefix/
    if (path === prefix || path === prefix + "/") return "dashboard";

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

    // Default to dashboard if empty
    if (!relativePart) return "dashboard";

    // Check if it matches a known panel
    const found = menuItems.find((item) => item.panel === relativePart);
    return found ? found.panel : "dashboard";
  };

  const activePanel = getPanelFromPath() || "dashboard";

  const handleNavigate = (panel: string) => {
    navigate(`/admin/super-admin/${panel}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
  
    const pendingUsers = JSON.parse(
      localStorage.getItem("pending_user_verifications") || "[]",
    );
    setPendingVerificationsCount(pendingUsers.length);

    const pendingRegistrations = JSON.parse(
      localStorage.getItem("pending_registrations") || "[]",
    );
    const pendingOnly = pendingRegistrations.filter(
      (r: any) => r.status === "pending",
    );
    setPendingApprovalsCount(pendingOnly.length);

    try {
      const data = await getSubscriptions(1, 1000);

     
      const mappedAccounts: AdminAccount[] = data.results
        .filter((item: any) => item.is_active === true)
        .map((item: any) => {
          const planName =
            item.subscription_plan_detail?.plan_name?.toLowerCase() || "basic";
          const packageType: SubscriptionPackage =
            planName === "professional"
              ? "professional"
              : planName === "enterprise"
                ? "enterprise"
                : "basic";

          return {
            id: item.id.toString(),
            name: item.tenant_detail?.admin_name || "N/A",
            email: item.tenant_detail?.email || "N/A",
            phone: item.tenant_detail?.phone || "",
            businessName: item.tenant_detail?.business_name || "N/A",
            package: packageType,
            packagePrice: parseFloat(
              item.subscription_plan_detail?.plan_price || "0",
            ),
            subscriptionStartDate: item.subscription_date || item.created,
            subscriptionEndDate: item.finish_date || "",
            status: item.is_active ? "active" : "expired",
            demoMode: false,
            password: "",
            isFirstLogin: false,
            createdBySuperAdmin: false,
            dueAmount: 0,
            lastPaymentDate: item.modified || "",
            totalRevenue: 0,
            totalCustomers: 0,
            totalSales: 0,
            createdAt: item.created,
            branches: parseInt(
              item.subscription_plan_detail?.no_of_branch || "1",
            ),
            users: parseInt(item.subscription_plan_detail?.no_of_user || "0"),
            products: parseInt(
              item.subscription_plan_detail?.no_of_product || "0",
            ),
          };
        });

      setAdminAccounts(mappedAccounts);
    } catch (error) {
      console.error("Error loading admin accounts:", error);
      setAdminAccounts([]);
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "dashboard":
        return (
          <DashboardView
            adminAccounts={adminAccounts}
            onNavigate={handleNavigate}
          />
        );
      case "admins":
        return (
          <AdminAccountsView
            adminAccounts={adminAccounts}
            onUpdate={loadData}
          />
        );
      case "pending_approvals":
        return <PendingApprovalsTab onUpdate={loadData} />;
      case "subscriptions":
        return (
          <SubscriptionsView
            adminAccounts={adminAccounts}
            onUpdate={loadData}
          />
        );
      case "payments":
        return (
          <PaymentsDuesView adminAccounts={adminAccounts} onUpdate={loadData} />
        );
      case "cheques":
        return <ChequeManagementPanel />;
      case "pending_verifications":
        return <PendingVerificationsPanel />;
      case "access_control":
        return <AccessControlPanel />;
      case "branches":
        return <BranchesOverviewView adminAccounts={adminAccounts} />;
      case "reports":
        return <RevenueReportsView adminAccounts={adminAccounts} />;
      case "system_verification":
        return <SystemVerificationPanel />;
      case "role_testing":
        return <RoleTestingPanel />;
      case "quick_test":
        return <QuickTestPanel />;
      case "settings":
        return <SystemSettingsFixed onUpdate={loadData} />;
      case "audit":
        return <AuditLogDetailed users={[]} />;
      default:
        return (
          <DashboardView
            adminAccounts={adminAccounts}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  // Update menu items with dynamic badgesxc
  const updatedMenuItems = menuItems.map((item) => {
    if (item.id === "pending_verifications") {
      return { ...item, badge: pendingVerificationsCount };
    } else if (item.id === "pending_approvals") {
      return { ...item, badge: pendingApprovalsCount };
    }
    return item;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed lg:relative h-full z-20`}
      >
        {/* Logo & Brand */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
          <div className="relative">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse"
                style={{ animationDelay: "150ms" }}
              ></div>

              <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
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
              onClick={() => handleNavigate(item.panel || "dashboard")}
              className={`w-full flex items-center justify-between px-6 py-3 text-left transition-all hover:bg-gray-800 ${
                activePanel === item.panel
                  ? "bg-gradient-to-r from-orange-600 to-red-600 border-l-4 border-yellow-400 shadow-lg"
                  : ""
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
              <p className="text-white text-sm font-semibold">
                {currentUser?.name || "Super Admin"}
              </p>
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {menuItems.find((m) => m.panel === activePanel)?.label ||
                  "Dashboard"}
              </h2>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" • "}
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-semibold">
                System Online
              </span>
            </div>
          </div>
        </header>

        {/* Panel Content */}
        <main className="flex-1 overflow-y-auto p-6">{renderPanel()}</main>
      </div>
    </div>
  );
};

// 1. Dashboard View - Super Admin Focused
const DashboardView: React.FC<{
  adminAccounts: AdminAccount[];
  onNavigate: (panel: string) => void;
}> = ({ adminAccounts, onNavigate }) => {
  // NEW: Fetch stats from API
  const [apiStats, setApiStats] = useState<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    suspended_users: number;
    by_role: {
      super_admin: number;
      admin: number;
      cashier: number;
      inventory_manager: number;
      customer: number;
    };
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/stats/`,
          {
            headers,
          },
        );

        if (response.ok) {
          const data = await response.json();
          setApiStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Calculate Super Admin relevant metrics
  const totalAdmins = adminAccounts.length;
  const activeAdmins = adminAccounts.filter(
    (a) => a.status === "active",
  ).length;
  const suspendedAdmins = adminAccounts.filter(
    (a) => a.status === "suspended",
  ).length;
  const expiredAdmins = adminAccounts.filter(
    (a) => a.status === "expired",
  ).length;

  // Total customers across all admin accounts
  const totalCustomers = adminAccounts.reduce(
    (sum, admin) => sum + (admin.totalCustomers || 0),
    0,
  );

  // Total due amount from all admins
  const totalDueAmount = adminAccounts.reduce(
    (sum, admin) => sum + (admin.dueAmount || 0),
    0,
  );

  // Total sales revenue (combined from all admins)
  const totalSalesRevenue = adminAccounts.reduce(
    (sum, admin) => sum + (admin.totalRevenue || 0),
    0,
  );

  // Monthly recurring revenue from subscriptions
  const monthlyRecurringRevenue = adminAccounts
    .filter((a) => a.status === "active")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);

  // Package distribution
  const basicCount = adminAccounts.filter((a) => a.package === "basic").length;
  const professionalCount = adminAccounts.filter(
    (a) => a.package === "professional",
  ).length;
  const enterpriseCount = adminAccounts.filter(
    (a) => a.package === "enterprise",
  ).length;

  const stats = [
    {
      label: "Total Admin Accounts",
      value: apiStats ? apiStats.by_role.admin : totalAdmins,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      subtext: apiStats
        ? `${apiStats.active_users} active users`
        : `${activeAdmins} active`,
      trend: "up",
      trendValue: "+12%",
    },
    {
      label: "Total Customers (All Admins)",
      value: apiStats
        ? apiStats.by_role.customer.toLocaleString()
        : totalCustomers.toLocaleString(),
      icon: UserCheck,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      subtext: "Across all accounts",
      trend: "up",
      trendValue: "+18%",
    },
    {
      label: "Total Due Amount",
      value: `NPR ${totalDueAmount.toLocaleString()}`,
      icon: AlertCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      subtext: "Pending payments",
      trend: "down",
      trendValue: "-5%",
    },
    {
      label: "Total Sales Revenue",
      value: `NPR ${totalSalesRevenue.toLocaleString()}`,
      icon: TrendingUp,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      subtext: "Combined revenue",
      trend: "up",
      trendValue: "+24%",
    },
    {
      label: "Monthly Recurring Revenue",
      value: `NPR ${monthlyRecurringRevenue.toLocaleString()}`,
      icon: Banknote,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      subtext: "From subscriptions",
      trend: "up",
      trendValue: "+8%",
    },
    {
      label: "Suspended Accounts",
      value: apiStats ? apiStats.suspended_users : suspendedAdmins,
      icon: Lock,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      subtext: "Require attention",
    },
    {
      label: "Expired Accounts",
      value: expiredAdmins,
      icon: XCircle,
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      subtext: "Need renewal",
    },
    {
      label: "Avg Revenue per Admin",
      value: `NPR ${Math.round(
        totalSalesRevenue /
          (apiStats ? apiStats.by_role.admin || 1 : totalAdmins || 1),
      ).toLocaleString()}`,
      icon: BarChart3,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      subtext: "Performance metric",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
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
              <div
                className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.trend && (
                <span
                  className={`text-sm font-semibold flex items-center ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.trendValue}
                </span>
              )}
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-bold mb-1">
                {stat.value}
              </p>
              {stat.subtext && (
                <p className="text-gray-500 text-xs">{stat.subtext}</p>
              )}
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
          <p className="text-blue-100 text-sm mb-3">
            NPR {PACKAGES.basic.price}/month
          </p>
          <div className="text-sm text-blue-100 space-y-1">
            <p>• {PACKAGES.basic.features.users} users</p>
            <p>
              • {PACKAGES.basic.features.products.toLocaleString()} products
            </p>
            <p>• {PACKAGES.basic.features.branches} branch</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Crown className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{professionalCount}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Professional Package</h3>
          <p className="text-purple-100 text-sm mb-3">
            NPR {PACKAGES.professional.price}/month
          </p>
          <div className="text-sm text-purple-100 space-y-1">
            <p>• {PACKAGES.professional.features.users} users</p>
            <p>
              • {PACKAGES.professional.features.products.toLocaleString()}{" "}
              products
            </p>
            <p>• {PACKAGES.professional.features.branches} branches</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{enterpriseCount}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">Enterprise Package</h3>
          <p className="text-orange-100 text-sm mb-3">
            NPR {PACKAGES.enterprise.price}/month
          </p>
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
          onClick={() => onNavigate("admins")}
          className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Manage Admins</h3>
          <p className="text-blue-100 text-sm">
            View & manage all admin accounts
          </p>
        </button>

        <button
          onClick={() => onNavigate("subscriptions")}
          className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <CreditCard className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Subscriptions</h3>
          <p className="text-purple-100 text-sm">Manage packages & renewals</p>
        </button>

        <button
          onClick={() => onNavigate("payments")}
          className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <Wallet className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Payments & Dues</h3>
          <p className="text-green-100 text-sm">
            Track payments & collect dues
          </p>
        </button>

        <button
          onClick={() => onNavigate("reports")}
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left hover:scale-105"
        >
          <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-1">Revenue Reports</h3>
          <p className="text-orange-100 text-sm">
            Analyze performance & trends
          </p>
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
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    admin.status === "active"
                      ? "bg-green-100 text-green-600"
                      : admin.status === "suspended"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {admin.businessName}
                  </p>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  NPR {(admin.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {admin.totalSales || 0} sales
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Admin Accounts View
const AdminAccountsView: React.FC<{
  adminAccounts: AdminAccount[];
  onUpdate: () => void;
}> = ({ adminAccounts: initialAdmins, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPackage, setFilterPackage] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{
    name: string;
    username?: string;
    email: string;
    businessName: string;
    password: string;
    package: string;
  } | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string>("");

  const [showCreateAdminUserModal, setShowCreateAdminUserModal] =
    useState(false);
  const [showSubscriptionPackageModal, setShowSubscriptionPackageModal] =
    useState(false);
  const [createdTenantData, setCreatedTenantData] = useState<{
    id: number;
    email: string;
    phone: string;
    name: string;
    location: string;
    businessName: string;
  } | null>(null);

  // API State
  const [apiAdmins, setApiAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/admin_accounts/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin accounts");
      }

      const data = await response.json();
      console.log("Admin Accounts Fetch:", data);

      const results = Array.isArray(data)
        ? data
        : data.results || data.data || [];

      const mappedAdmins: AdminAccount[] = results.map((item: any) => {
        // Safe access to nested properties
        const tenantDetail = item.tenant_detail || {};
        const packageDetail = tenantDetail.package_detail || {};

        const planName = packageDetail.plan_name?.toLowerCase() || "basic";
        const packageType: SubscriptionPackage =
          planName === "professional"
            ? "professional"
            : planName === "enterprise"
              ? "enterprise"
              : "basic";

        return {
          id: item.id.toString(),
          name: item.full_name || item.username || "N/A",
          email: item.email || "N/A",
          phone: item.phone || tenantDetail.phone || "",
          businessName: tenantDetail.business_name || "N/A",
          package: packageType,
          packagePrice: parseFloat(packageDetail.plan_price || "0"),
          subscriptionStartDate: tenantDetail.created || item.created,
          subscriptionEndDate: tenantDetail.created || item.created, // Placeholder
          status: item.status === "active" ? "active" : "expired",
          demoMode: false,
          password: "",
          isFirstLogin: false,
          createdBySuperAdmin: false,
          dueAmount: 0,
          lastPaymentDate: item.modified || "",
          totalRevenue: 0,
          totalCustomers: 0,
          totalSales: 0,
          createdAt: item.created,
          branches: parseInt(packageDetail.no_of_branch || "1"),
          users: parseInt(packageDetail.no_of_user || "0"),
          products: parseInt(packageDetail.no_of_product || "0"),
        };
      });

      setApiAdmins(mappedAdmins);
    } catch (error) {
      console.error("Error fetching admin accounts:", error);
      setApiError("Network error while fetching admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Always use API admins for display
  const displayAdmins = apiAdmins;

  // Filter and sort admins
  const filteredAdmins = displayAdmins
    .filter((admin) => {
      const matchesSearch =
        admin.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || admin.status === filterStatus;
      const matchesPackage =
        filterPackage === "all" || admin.package === filterPackage;
      const matchesMode =
        filterMode === "all" ||
        (filterMode === "demo" && admin.demoMode) ||
        (filterMode === "live" && !admin.demoMode);
      return matchesSearch && matchesStatus && matchesPackage && matchesMode;
    })
    // Sort by creation date - newest first
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Pagination calculation
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPackage, filterMode]);

  const handleAddAdmin = () => {
    setShowAddModal(true);
  };

  const handleViewAdmin = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleEditAdmin = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDeleteAdmin = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const saveNewAdmin = async (formData: any) => {
    // Import API
    const { createTenant } = await import("../api/subscription.api");

    try {
      // Get the package ID from formData
      const packageId = parseInt(formData.package) || 1;

      // 1. Call API to create new tenant (without package for now)
      const createdTenant = await createTenant({
        business_name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        package: 1,
        status: "pending",
        is_active: true,
      });

      // Save to local storage as fallback for UI display (mock data support)
      const newAdmin: AdminAccount = {
        id: createdTenant.id.toString(),
        name: formData.name,
        email: createdTenant.email,
        phone: createdTenant.phone,
        businessName: createdTenant.business_name,
        package: formData.package,
        packagePrice:
          PACKAGES[formData.package as SubscriptionPackage]?.price || 0,
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ).toISOString(),
        status: "active",
        demoMode: formData.demoMode || false,
        password: "", // Will be set in next step
        isFirstLogin: true,
        createdBySuperAdmin: true,
        dueAmount: 0,
        lastPaymentDate: new Date().toISOString(),
        totalRevenue: 0,
        totalCustomers: 0,
        totalSales: 0,
        createdAt: createdTenant.created,
        branches: formData.package === "basic" ? 1 : 1, // Default branch count
        users: formData.package === "basic" ? 3 : 10,
        products: 1000,
      };

      // Note: We no longer save to local storage as we are purely backend-driven.
      // The loadData function will fetch the latest state from the backend.

      // Prepare for Step 2: Subscription Package Selection
      setCreatedTenantData({
        id: createdTenant.id,
        email: createdTenant.email,
        phone: createdTenant.phone,
        name: formData.name,
        location: formData.businessLocation || "",
        businessName: createdTenant.business_name,
      });

      // Close Tenant Modal and Open Subscription Package Modal
      setShowAddModal(false);
      setShowSubscriptionPackageModal(true);
      toast.success(
        "Tenant created successfully. Please select subscription package.",
      );

      onUpdate();
    } catch (error) {
      console.error("Error creating tenant:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create tenant";
      toast.error(errorMessage);
    }
  };

  const handleSubscriptionPackageSelection = async (subscriptionData: any) => {
    try {
      if (!createdTenantData) {
        toast.error("Tenant data not found");
        return;
      }

      const token = localStorage.getItem("accessToken");
      const headers: any = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Call the subscription endpoint with tenant ID and subscription plan
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/subscription/subscriptions/change_plan/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            tenant_id: createdTenantData.id,
            new_plan_id: subscriptionData.subscription_plan,
            subscription_date: subscriptionData.subscription_date,
            finish_date: subscriptionData.finish_date,
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        console.error("Subscription Error Response:", errData);

        if (errData.detail) throw new Error(errData.detail);
        if (errData.message) throw new Error(errData.message);

        throw new Error("Failed to create subscription");
      }

      const subscriptionResult = await res.json();
      console.log("Subscription Created:", subscriptionResult);

      // Close Subscription Modal and Open Admin User Modal
      setShowSubscriptionPackageModal(false);
      setShowCreateAdminUserModal(true);
      toast.success("Subscription package selected successfully!");
    } catch (error) {
      console.error("Error creating subscription:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create subscription";
      toast.error(errorMessage);
    }
  };

  const handleCreateAdminUser = async (userData: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Call the requested API endpoint
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/`, {
        method: "POST",
        headers,
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Backend Error Response:", errData);

        // Handle object-based field errors (e.g. { username: ["Unique constraint failed"], email: [...] })
        if (typeof errData === "object" && errData !== null) {
          // If there is a 'detail' or 'message' property, prefer that
          if (errData.detail) throw new Error(errData.detail);
          if (errData.message) throw new Error(errData.message);

          // Otherwise, collect all field errors
          const fieldErrors = Object.entries(errData)
            .map(([field, errors]) => {
              const errorMsg = Array.isArray(errors)
                ? errors.join(", ")
                : String(errors);
              // Capitalize field name
              const fieldName =
                field.charAt(0).toUpperCase() +
                field.slice(1).replace("_", " ");
              return `${fieldName}: ${errorMsg}`;
            })
            .join("\n");

          if (fieldErrors) throw new Error(fieldErrors);
        }

        throw new Error("Failed to create admin user (Unknown error)");
      }

      const newUser = await res.json();

      // Close the Admin User Modal
      setShowCreateAdminUserModal(false);

      // Show Success / Credentials Modal
      setNewAdminCredentials({
        name: userData.full_name,
        username: userData.username,
        email: userData.email,
        businessName: createdTenantData?.businessName || "",
        password: userData.password,
        package: "Subscription",
      });
      setShowCredentialsModal(true);
      toast.success("Admin account created successfully!");

      onUpdate();
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      toast.error(error.message);
    }
  };

  const updateAdmin = async (formData: any) => {
    if (!selectedAdmin) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Split name into first and last name
      const nameParts = formData.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const payload = {
        email: formData.email,
        full_name: formData.name,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        location: "", // Default or from formData if available
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${selectedAdmin.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        // Update local state
        const updatedAdmins = apiAdmins.map((a) =>
          a.id === selectedAdmin.id
            ? {
                ...a,
                ...formData,
                packagePrice:
                  PACKAGES[formData.package as SubscriptionPackage]?.price || 0,
              }
            : a,
        );
        setApiAdmins(updatedAdmins);
        setShowEditModal(false);
        setSelectedAdmin(null);
        onUpdate();
        toast.success("Admin account updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);

        // Extract specific error messages from backend
        let errorMessage = "Failed to update admin account";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (
            errorData.non_field_errors &&
            Array.isArray(errorData.non_field_errors)
          ) {
            errorMessage = errorData.non_field_errors.join(", ");
          } else {
            // Check for field-specific errors
            const fieldErrors = Object.entries(errorData)
              .filter(([key]) => key !== "status" && key !== "code") // Exclude common metadata
              .map(([field, errors]) => {
                const errorStr = Array.isArray(errors)
                  ? errors.join(", ")
                  : String(errors);
                // Capitalize field name for better readability
                const fieldName =
                  field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/_/g, " ");
                return `${fieldName}: ${errorStr}`;
              });

            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join("\n");
            }
          }
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("An error occurred while updating");
    }
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { deleteTenant } = await import("../api/subscription.api");

      // Delete the tenant from API
      await deleteTenant(selectedAdmin.id);

      // Successfully deleted
      toast.success(`Admin account deleted successfully`);

      // Clear modal first
      setShowDeleteModal(false);
      setSelectedAdmin(null);

      // Refresh data from API
      await fetchAdmins();
      onUpdate();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete admin account";
      toast.error(errorMessage);
    }
  };

  const toggleDemoMode = (admin: AdminAccount) => {
    // TODO: Implement API toggle
    const updatedAdmins = apiAdmins.map((a) =>
      a.id === admin.id ? { ...a, demoMode: !a.demoMode } : a,
    );
    setApiAdmins(updatedAdmins);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Accounts</h2>
          <p className="text-gray-500 text-sm">
            Manage all admin accounts and their subscriptions
          </p>
        </div>
        <button
          onClick={handleAddAdmin}
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Filters and Summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        {/* Results Summary */}
        {searchTerm ||
        filterStatus !== "all" ||
        filterPackage !== "all" ||
        filterMode !== "all" ? (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Found{" "}
              <span className="font-bold text-gray-900">
                {filteredAdmins.length}
              </span>{" "}
              admin{filteredAdmins.length !== 1 ? "s" : ""}
              {searchTerm && (
                <span>
                  {" "}
                  matching "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>
        ) : null}

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

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Modes</option>
            <option value="live">Live Mode</option>
            <option value="demo">Demo Mode</option>
          </select>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">
                            {admin.businessName}
                          </p>

                          {new Date().getTime() -
                            new Date(admin.createdAt).getTime() <
                            24 * 60 * 60 * 1000 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {admin.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.package === "basic"
                          ? "bg-blue-100 text-blue-700"
                          : admin.package === "professional"
                            ? "bg-purple-100 text-purple-700"
                            : admin.package === "enterprise"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {admin.package === "basic" && (
                        <Package className="w-3 h-3 mr-1" />
                      )}
                      {admin.package === "professional" && (
                        <Crown className="w-3 h-3 mr-1" />
                      )}
                      {admin.package === "enterprise" && (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      {(admin.package as string) === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {PACKAGES[admin.package as SubscriptionPackage]?.name ||
                        admin.package.charAt(0).toUpperCase() +
                          admin.package.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-700"
                          : admin.status === "suspended"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {admin.status === "active" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {admin.status === "suspended" && (
                        <Lock className="w-3 h-3 mr-1" />
                      )}
                      {admin.status === "expired" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {admin.status.charAt(0).toUpperCase() +
                        admin.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDemoMode(admin)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        admin.demoMode
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title="Click to toggle mode"
                    >
                      {admin.demoMode ? (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Demo
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Live
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      NPR {(admin.totalRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {admin.totalSales || 0} sales
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {admin.totalCustomers || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {admin.dueAmount > 0 ? (
                      <p className="font-semibold text-red-600">
                        NPR {admin.dueAmount.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-green-600 font-semibold">Paid</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAdmin(admin)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredAdmins.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(endIndex, filteredAdmins.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filteredAdmins.length}</span>{" "}
                admin{filteredAdmins.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 &&
                        pageNum <= currentPage + 1);

                    // Show ellipsis
                    const showEllipsisBefore =
                      pageNum === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      pageNum === currentPage + 2 &&
                      currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No admin accounts found</p>
        </div>
      )}

      {/* Modals */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={saveNewAdmin}
      />

      <CreateAdminUserModal
        isOpen={showCreateAdminUserModal}
        onClose={() => setShowCreateAdminUserModal(false)}
        onSave={handleCreateAdminUser}
        tenantId={createdTenantData?.id || 0}
        initialData={createdTenantData || undefined}
      />

      <ViewAdminModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />

      <EditAdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSave={updateAdmin}
      />

      <DeleteAdminModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onConfirm={confirmDelete}
      />

      {newAdminCredentials && (
        <CredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setNewAdminCredentials(null);
            setEmailSent(false);
            setEmailSending(false);
            setEmailMessage("");
          }}
          adminName={newAdminCredentials.name}
          adminEmail={newAdminCredentials.email}
          businessName={newAdminCredentials.businessName}
          generatedPassword={newAdminCredentials.password}
          packageType={newAdminCredentials.package}
          emailSending={emailSending}
          emailSent={emailSent}
          onSendEmail={async () => {
            setEmailSending(true);
            const { sendCredentialsEmail } =
              await import("../utils/passwordUtils");
            const result = await sendCredentialsEmail(
              newAdminCredentials.name,
              newAdminCredentials.email,
              newAdminCredentials.businessName,
              newAdminCredentials.password,
              newAdminCredentials.package,
            );
            setEmailSending(false);
            if (result.success) {
              setEmailSent(true);
              setEmailMessage(result.message);
            } else {
              setEmailMessage(result.message);
            }
          }}
          emailMessage={emailMessage}
        />
      )}

      <SubscriptionPackageModal
        isOpen={showSubscriptionPackageModal}
        onClose={() => setShowSubscriptionPackageModal(false)}
        onSubmit={handleSubscriptionPackageSelection}
        tenantName={createdTenantData?.businessName || "Tenant"}
      />
    </div>
  );
};

// 3. Subscriptions View
const SubscriptionsView: React.FC<{
  adminAccounts: AdminAccount[];
  onUpdate: () => void;
}> = ({ adminAccounts, onUpdate }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>("all");
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  // API State
  const [apiSubscriptions, setApiSubscriptions] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await getSubscriptions(1, 1000);
      setTotalCount(data.count || 0);

      // Map API response to AdminAccount type - filter only active subscriptions
      const mappedSubscriptions: AdminAccount[] = data.results
        .filter((item: any) => item.is_active === true) // Only show active subscriptions
        .map((item: any) => {
          const planName =
            item.subscription_plan_detail?.plan_name?.toLowerCase() || "basic";
          const packageType: SubscriptionPackage =
            planName === "professional"
              ? "professional"
              : planName === "enterprise"
                ? "enterprise"
                : "basic";

          return {
            id: item.id.toString(),
            name: item.tenant_detail?.admin_name || "N/A",
            email: item.tenant_detail?.admin_email || "N/A",
            phone: item.tenant_detail?.phone || "",
            businessName: item.tenant_detail?.business_name || "N/A",
            package: packageType,
            packagePrice: parseFloat(
              item.subscription_plan_detail?.plan_price || "0",
            ),
            subscriptionStartDate: item.subscription_date || item.created,
            subscriptionEndDate: item.finish_date || "",
            status: item.is_active ? "active" : "expired",
            demoMode: false,
            password: "",
            isFirstLogin: false,
            createdBySuperAdmin: false,
            dueAmount: 0,
            lastPaymentDate: item.renew_date || "",
            totalRevenue: 0,
            totalCustomers: 0,
            totalSales: 0,
            createdAt: item.created,
            branches: item.tenant_detail?.no_of_branch || 1,
            users: 0,
            products: 0,
          };
        });
      setApiSubscriptions(mappedSubscriptions);
      setTotalCount(mappedSubscriptions.length); // Update count to active subscriptions only
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setApiError("Network error while fetching subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Use API subscriptions if available, otherwise fallback to props
  const displaySubscriptions =
    apiSubscriptions.length > 0 ? apiSubscriptions : adminAccounts;

  const activeSubscriptions = displaySubscriptions.filter(
    (a) => a.status === "active",
  );
  const expiringSoon = displaySubscriptions.filter((a) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(a.subscriptionEndDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return (
      daysUntilExpiry <= 30 && daysUntilExpiry > 0 && a.status === "active"
    );
  });

  const filteredAdmins =
    selectedPackage === "all"
      ? displaySubscriptions
      : displaySubscriptions.filter((a) => a.package === selectedPackage);

  const totalMRR = activeSubscriptions.reduce(
    (sum, admin) => sum + (admin.packagePrice || 0),
    0,
  );
  const basicMRR = activeSubscriptions
    .filter((a) => a.package === "basic")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);
  const professionalMRR = activeSubscriptions
    .filter((a) => a.package === "professional")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);
  const enterpriseMRR = activeSubscriptions
    .filter((a) => a.package === "enterprise")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);

  const handleRenew = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowRenewModal(true);
  };

  const handleUpgrade = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowUpgradeModal(true);
  };

  const confirmRenew = (months: number) => {
    if (selectedAdmin) {
      const newEndDate = new Date(selectedAdmin.subscriptionEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      const updatedAdmins = displaySubscriptions.map((a) =>
        a.id === selectedAdmin.id
          ? {
              ...a,
              subscriptionEndDate: newEndDate.toISOString(),
              status: "active" as const,
              lastPaymentDate: new Date().toISOString(),
            }
          : a,
      );
      saveToStorage("admin_accounts", updatedAdmins);
      setApiSubscriptions(updatedAdmins);
      setShowRenewModal(false);
      setSelectedAdmin(null);
      fetchSubscriptions(); // Refresh from API
      onUpdate();
    }
  };

  const confirmUpgrade = (newPackage: SubscriptionPackage) => {
    if (selectedAdmin) {
      const updatedAdmins = displaySubscriptions.map((a) =>
        a.id === selectedAdmin.id
          ? {
              ...a,
              package: newPackage,
              packagePrice:
                PACKAGES[newPackage as keyof typeof PACKAGES]?.price || 0,
            }
          : a,
      );
      saveToStorage("admin_accounts", updatedAdmins);
      setApiSubscriptions(updatedAdmins);
      setShowUpgradeModal(false);
      setSelectedAdmin(null);
      fetchSubscriptions(); // Refresh from API
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription Management
          </h2>
          <p className="text-gray-500 text-sm">
            {isLoading ? (
              "Loading subscriptions..."
            ) : apiError ? (
              <span className="text-red-500">{apiError}</span>
            ) : totalCount > 0 ? (
              `Manage packages, renewals, and upgrades (${totalCount} total)`
            ) : (
              "Manage packages, renewals, and upgrades"
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSubscriptions}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <div className="bg-green-50 px-4 py-2 rounded-xl">
            <p className="text-xs text-green-600 font-semibold">
              Active Subscriptions
            </p>
            <p className="text-2xl font-bold text-green-700">
              {activeSubscriptions.length}
            </p>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-xl">
            <p className="text-xs text-orange-600 font-semibold">
              Expiring Soon
            </p>
            <p className="text-2xl font-bold text-orange-700">
              {expiringSoon.length}
            </p>
          </div>
        </div>
      </div>

      {/* MRR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Banknote className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm text-green-100 mb-1">Total MRR</p>
          <p className="text-3xl font-bold">NPR {totalMRR.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm text-blue-100 mb-1">Basic MRR</p>
          <p className="text-3xl font-bold">NPR {basicMRR.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Crown className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm text-purple-100 mb-1">Professional MRR</p>
          <p className="text-3xl font-bold">
            NPR {professionalMRR.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm text-orange-100 mb-1">Enterprise MRR</p>
          <p className="text-3xl font-bold">
            NPR {enterpriseMRR.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Package Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Packages</option>
            <option value="basic">Basic Package</option>
            <option value="professional">Professional Package</option>
            <option value="enterprise">Enterprise Package</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Subscriptions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Price/Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => {
                const endDate = admin.subscriptionEndDate
                  ? new Date(admin.subscriptionEndDate)
                  : new Date();
                const daysUntilExpiry = Math.ceil(
                  (endDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const isExpiringSoon =
                  daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                // Safe package access with fallback
                const packageKey = admin.package || "basic";
                const packageInfo =
                  PACKAGES[packageKey as keyof typeof PACKAGES] ||
                  PACKAGES.basic;

                return (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {admin.businessName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {admin.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          packageKey === "basic"
                            ? "bg-blue-100 text-blue-700"
                            : packageKey === "professional"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {packageKey === "basic" && (
                          <Package className="w-3 h-3 mr-1" />
                        )}
                        {packageKey === "professional" && (
                          <Crown className="w-3 h-3 mr-1" />
                        )}
                        {packageKey === "enterprise" && (
                          <Sparkles className="w-3 h-3 mr-1" />
                        )}
                        {packageInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        NPR {(admin.packagePrice || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {admin.subscriptionStartDate
                          ? new Date(
                              admin.subscriptionStartDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isExpiringSoon ? "text-orange-600" : "text-gray-600"
                          }`}
                        >
                          {admin.subscriptionEndDate
                            ? new Date(
                                admin.subscriptionEndDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        {isExpiringSoon && (
                          <p className="text-xs text-orange-500 flex items-center mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {daysUntilExpiry} days left
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          admin.status === "active"
                            ? "bg-green-100 text-green-700"
                            : admin.status === "suspended"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {admin.status === "active" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {admin.status === "suspended" && (
                          <Lock className="w-3 h-3 mr-1" />
                        )}
                        {admin.status === "expired" && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {admin.status.charAt(0).toUpperCase() +
                          admin.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRenew(admin)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Renew
                        </button>
                        <button
                          onClick={() => handleUpgrade(admin)}
                          className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-lg hover:shadow-lg transition-all font-semibold"
                        >
                          Manage Plan
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

      {/* Modals */}
      <RenewSubscriptionModal
        isOpen={showRenewModal}
        onClose={() => {
          setShowRenewModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onConfirm={confirmRenew}
      />

      <ManagePlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onConfirm={confirmUpgrade}
      />
    </div>
  );
};

// 4. Payments & Dues View
const PaymentsDuesView: React.FC<{
  adminAccounts: AdminAccount[];
  onUpdate: () => void;
}> = ({ adminAccounts, onUpdate }) => {
  const adminsWithDues = adminAccounts.filter((a) => a.dueAmount > 0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  const handleMarkAsPaid = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (selectedAdmin) {
      const updatedAdmins = adminAccounts.map((a) =>
        a.id === selectedAdmin.id
          ? {
              ...a,
              dueAmount: 0,
              lastPaymentDate: new Date().toISOString(),
            }
          : a,
      );
      saveToStorage("admin_accounts", updatedAdmins);
      setShowPaymentModal(false);
      setSelectedAdmin(null);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments & Dues</h2>
          <p className="text-gray-500 text-sm">
            {adminsWithDues.length} accounts with pending payments
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Due Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Last Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminsWithDues.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {admin.businessName}
                    </p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-red-600">
                      NPR {admin.dueAmount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(admin.lastPaymentDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleMarkAsPaid(admin)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <MarkAsPaidModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onConfirm={confirmPayment}
      />
    </div>
  );
};

// 5. Branches Overview
const BranchesOverviewView: React.FC<{ adminAccounts: AdminAccount[] }> = ({
  adminAccounts,
}) => {
  const [fetchedBranches, setFetchedBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBranches = async () => {
      try {
        const response = await getBranches();
        setFetchedBranches(response.results);
      } catch (error) {
        console.error("Failed to fetch branches", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllBranches();
  }, []);

  const totalBranches =
    fetchedBranches.length ||
    adminAccounts.reduce((sum, admin) => sum + (admin.branches || 0), 0);
  const avgBranchesPerAdmin =
    adminAccounts.length > 0
      ? (totalBranches / adminAccounts.length).toFixed(1)
      : "0";

  // Group by package
  const basicBranches = adminAccounts
    .filter((a) => a.package === "basic")
    .reduce((sum, admin) => sum + (admin.branches || 0), 0);
  const professionalBranches = adminAccounts
    .filter((a) => a.package === "professional")
    .reduce((sum, admin) => sum + (admin.branches || 0), 0);
  const enterpriseBranches = adminAccounts
    .filter((a) => a.package === "enterprise")
    .reduce((sum, admin) => sum + (admin.branches || 0), 0);

  // Top admins by branches
  const topByBranches = [...adminAccounts]
    .sort((a, b) => (b.branches || 0) - (a.branches || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Branches Overview</h2>
        <p className="text-gray-500 text-sm">
          {totalBranches} total branches across all accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-blue-100 mb-1">Total Branches</p>
          <p className="text-4xl font-bold">{totalBranches}</p>
          <p className="text-xs text-blue-100 mt-2">Across all admins</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-purple-100 mb-1">Avg per Admin</p>
          <p className="text-4xl font-bold">{avgBranchesPerAdmin}</p>
          <p className="text-xs text-purple-100 mt-2">Branches per account</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Store className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-green-100 mb-1">Most Branches</p>
          <p className="text-4xl font-bold">
            {topByBranches[0]?.branches || 0}
          </p>
          <p className="text-xs text-green-100 mt-2">
            {topByBranches[0]?.businessName || "N/A"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Layers className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-orange-100 mb-1">Enterprise Branches</p>
          <p className="text-4xl font-bold">{enterpriseBranches}</p>
          <p className="text-xs text-orange-100 mt-2">
            From enterprise accounts
          </p>
        </div>
      </div>

      {/* Fetched Branches List */}
      {fetchedBranches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              All Active Branches (API Data)
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Branch Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fetchedBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {branch.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {branch.name || branch.branch_name || "Unnamed Branch"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {branch.location || branch.address || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{branch.phone || "No phone"}</div>
                      <div className="text-xs text-gray-400">
                        {branch.email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          branch.is_active !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {branch.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branch Distribution by Package */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Basic Package</p>
                <p className="text-2xl font-bold text-gray-900">
                  {basicBranches}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-semibold">Branches</p>
            <p className="text-sm text-gray-600 mt-1">
              Limited to 1 branch per account
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Professional Package</p>
                <p className="text-2xl font-bold text-gray-900">
                  {professionalBranches}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-semibold">Branches</p>
            <p className="text-sm text-gray-600 mt-1">
              Up to 5 branches per account
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enterprise Package</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enterpriseBranches}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600 font-semibold">Branches</p>
            <p className="text-sm text-gray-600 mt-1">Unlimited branches</p>
          </div>
        </div>
      </div>

      {/* Top Admins by Branch Count */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Top Accounts by Branch Count
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Branches
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topByBranches.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-gray-100 text-gray-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {admin.businessName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {admin.email || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.package === "basic"
                          ? "bg-blue-100 text-blue-700"
                          : admin.package === "professional"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {PACKAGES[admin.package as keyof typeof PACKAGES]?.name ||
                        "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-lg font-bold text-gray-900">
                      {admin.branches || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">
                      {admin.users || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">
                      {(admin.products || 0).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-700"
                          : admin.status === "suspended"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {admin.status.charAt(0).toUpperCase() +
                        admin.status.slice(1)}
                    </span>
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

// 6. Revenue Reports
const RevenueReportsView: React.FC<{ adminAccounts: AdminAccount[] }> = ({
  adminAccounts,
}) => {
  // Total revenue calculations
  const totalBusinessRevenue = adminAccounts.reduce(
    (sum, admin) => sum + (admin.totalRevenue || 0),
    0,
  );
  const totalSubscriptionRevenue = adminAccounts
    .filter((a) => a.status === "active")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);
  const totalDues = adminAccounts.reduce(
    (sum, admin) => sum + (admin.dueAmount || 0),
    0,
  );
  const netRevenue =
    totalBusinessRevenue + totalSubscriptionRevenue * 12 - totalDues;

  // Revenue by package
  const basicRevenue = adminAccounts
    .filter((a) => a.package === "basic" && a.status === "active")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);
  const professionalRevenue = adminAccounts
    .filter((a) => a.package === "professional" && a.status === "active")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);
  const enterpriseRevenue = adminAccounts
    .filter((a) => a.package === "enterprise" && a.status === "active")
    .reduce((sum, admin) => sum + (admin.packagePrice || 0), 0);

  // Top revenue generators
  const topByRevenue = [...adminAccounts]
    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    .slice(0, 10);

  // Status-based revenue
  const activeRevenue = adminAccounts
    .filter((a) => a.status === "active")
    .reduce((sum, admin) => sum + (admin.totalRevenue || 0), 0);
  const suspendedRevenue = adminAccounts
    .filter((a) => a.status === "suspended")
    .reduce((sum, admin) => sum + (admin.totalRevenue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Reports</h2>
        <p className="text-gray-500 text-sm">
          Analyze performance and revenue trends
        </p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-10 h-10 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm text-green-100 mb-1">Total Business Revenue</p>
          <p className="text-3xl font-bold">
            Rs{totalBusinessRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-green-100 mt-2">From all admin accounts</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-10 h-10 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm text-blue-100 mb-1">Subscription MRR</p>
          <p className="text-3xl font-bold">
            Rs{totalSubscriptionRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-blue-100 mt-2">
            Monthly recurring revenue
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Banknote className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-purple-100 mb-1">
            Annual Subscription Revenue
          </p>
          <p className="text-3xl font-bold">
            Rs{(totalSubscriptionRevenue * 12).toLocaleString()}
          </p>
          <p className="text-xs text-purple-100 mt-2">
            Projected yearly income
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-10 h-10 opacity-80" />
          </div>
          <p className="text-sm text-orange-100 mb-1">Outstanding Dues</p>
          <p className="text-3xl font-bold">Rs{totalDues.toLocaleString()}</p>
          <p className="text-xs text-orange-100 mt-2">Pending collections</p>
        </div>
      </div>

      {/* Revenue by Package */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Monthly Revenue by Package
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                Rs{basicRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Basic Package
            </p>
            <p className="text-xs text-blue-600">
              {
                adminAccounts.filter(
                  (a) => a.package === "basic" && a.status === "active",
                ).length
              }{" "}
              active accounts
            </p>
            <div className="mt-4 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(basicRevenue / totalSubscriptionRevenue) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                Rs{professionalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-semibold text-purple-900 mb-1">
              Professional Package
            </p>
            <p className="text-xs text-purple-600">
              {
                adminAccounts.filter(
                  (a) => a.package === "professional" && a.status === "active",
                ).length
              }{" "}
              active accounts
            </p>
            <div className="mt-4 bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${
                    (professionalRevenue / totalSubscriptionRevenue) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">
                Rs{enterpriseRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-semibold text-orange-900 mb-1">
              Enterprise Package
            </p>
            <p className="text-xs text-orange-600">
              {
                adminAccounts.filter(
                  (a) => a.package === "enterprise" && a.status === "active",
                ).length
              }{" "}
              active accounts
            </p>
            <div className="mt-4 bg-orange-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${
                    (enterpriseRevenue / totalSubscriptionRevenue) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Active Accounts Revenue
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Business Revenue</span>
                <span className="text-lg font-bold text-gray-900">
                  Rs{activeRevenue.toLocaleString()}
                </span>
              </div>
              <div className="bg-green-100 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {adminAccounts.filter((a) => a.status === "active").length} active
              accounts contributing
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-orange-600" />
            Suspended Accounts Revenue
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Lost Revenue</span>
                <span className="text-lg font-bold text-orange-600">
                  Rs{suspendedRevenue.toLocaleString()}
                </span>
              </div>
              <div className="bg-orange-100 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: "35%" }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {adminAccounts.filter((a) => a.status === "suspended").length}{" "}
              suspended accounts
            </p>
          </div>
        </div>
      </div>

      {/* Top Revenue Generators */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Top 10 Revenue Generators
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Business Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Sales Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Customers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topByRevenue.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-gray-100 text-gray-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {index === 0 && <Crown className="w-4 h-4" />}
                      {index > 0 && index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {admin.businessName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {admin.email || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.package === "basic"
                          ? "bg-blue-100 text-blue-700"
                          : admin.package === "professional"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {PACKAGES[admin.package as keyof typeof PACKAGES]?.name ||
                        "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-lg font-bold text-green-600">
                      Rs{(admin.totalRevenue || 0).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">
                      {(admin.totalSales || 0).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">
                      {(admin.totalCustomers || 0).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-700"
                          : admin.status === "suspended"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {admin.status.charAt(0).toUpperCase() +
                        admin.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm text-green-100 mb-1">
            Average Revenue per Admin
          </p>
          <p className="text-3xl font-bold">
            Rs
            {Math.round(
              totalBusinessRevenue / adminAccounts.length,
            ).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm text-blue-100 mb-1">Revenue per Customer</p>
          <p className="text-3xl font-bold">
            Rs
            {Math.round(
              totalBusinessRevenue /
                (adminAccounts.reduce(
                  (sum, admin) => sum + (admin.totalCustomers || 0),
                  0,
                ) || 1),
            ).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <PieChart className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm text-purple-100 mb-1">
            Total Revenue Potential
          </p>
          <p className="text-3xl font-bold">Rs{netRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardRefined;
