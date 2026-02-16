import React, { useState, useEffect } from "react";
import {
  Package,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  TrendingDown,
  BarChart3,
  Box,
  Tag,
  ShoppingBag,
  Scan,
  FileText,
  Download,
  Upload,
  Filter,
  ChevronDown,
  Bell,
  Clock,
  Activity,
  TrendingUp,
  Boxes,
  PackageCheck,
  Bookmark,
  Grid,
  List,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Calendar,
  Zap,
  DollarSign,
  Percent,
  Hash,
  AlignLeft,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { usePermissions } from "../contexts/PermissionContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";

// Import panels for Inventory Manager Dashboard
import { TotalInventoryPanel } from "./panels/TotalInventoryPanel";
import { PurchaseOrdersPanel } from "./panels/PurchaseOrdersPanel";
import { BulkImportPanel } from "./panels/BulkImportPanel";
import { AutomotiveInventory } from "./automotive/AutomotiveInventory";
import { EnhancedCategoriesPanel } from "./categories/EnhancedCategoriesPanel";
import { EnhancedLowStockPanel } from "./inventory/EnhancedLowStockPanel";
import { EnhancedStockReports } from "./inventory/EnhancedStockReports";
import { TestModeBanner } from "./TestModeBanner";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStock: number;
  totalCategories: number;
  totalBrands: number;
  totalStockValue: number;
  todayPurchases: number;
  pendingOrders: number;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  badge?: number;
};

export const InventoryManagerDashboardNew: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();

  // Debug log to verify component is loaded
  console.log(
    "InventoryManagerDashboardNew loaded - AlertCircle imported:",
    typeof AlertCircle,
  );

  const [activePanel, setActivePanel] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalStockValue: 0,
    todayPurchases: 0,
    pendingOrders: 0,
  });

  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      loadDashboardData(); // Refresh data every second for real-time sync
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = () => {
    const products = getFromStorage("products", []).filter(
      (p: any) => p.workspaceId === currentUser?.workspaceId,
    );

    const categories = getFromStorage("categories", []).filter(
      (c: any) => c.workspaceId === currentUser?.workspaceId,
    );

    const brands = getFromStorage("brands", []).filter(
      (b: any) => b.workspaceId === currentUser?.workspaceId,
    );

    const purchaseOrders = getFromStorage("purchaseOrders", []).filter(
      (po: any) => po.workspaceId === currentUser?.workspaceId,
    );

    // Calculate stats
    const lowStock = products.filter(
      (p: any) =>
        p.currentStock <= (p.minimumStock || 10) && p.currentStock > 0,
    );

    const outOfStock = products.filter((p: any) => p.currentStock === 0);

    const totalStockValue = products.reduce(
      (sum: number, p: any) =>
        sum + (p.currentStock || 0) * (p.purchasePrice || 0),
      0,
    );

    const today = new Date().toISOString().split("T")[0];
    const todayPurchases = purchaseOrders.filter((po: any) =>
      po.createdAt?.startsWith(today),
    ).length;

    const pendingOrders = purchaseOrders.filter(
      (po: any) => po.status === "pending" || po.status === "approved",
    ).length;

    setStats({
      totalProducts: products.length,
      lowStockItems: lowStock.length,
      outOfStock: outOfStock.length,
      totalCategories: categories.length,
      totalBrands: brands.length,
      totalStockValue,
      todayPurchases,
      pendingOrders,
    });

    setLowStockItems(lowStock.slice(0, 10));

    // Get recent activity
    const recentProducts = products
      .sort(
        (a: any, b: any) =>
          new Date(b.lastUpdated || b.createdAt).getTime() -
          new Date(a.lastUpdated || a.createdAt).getTime(),
      )
      .slice(0, 5);

    setRecentActivity(recentProducts);
  };

  const menuItems: MenuItem[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "automotive", label: "Brands & Vehicles", icon: Star },
    { id: "bulk-import", label: "Bulk Import", icon: Upload },
    {
      id: "purchase-orders",
      label: "Purchase Orders",
      icon: ShoppingBag,
      badge: stats.pendingOrders,
    },
    {
      id: "low-stock",
      label: "Low Stock Alerts",
      icon: AlertTriangle,
      badge: stats.lowStockItems,
    },
    { id: "reports", label: "Stock Reports", icon: FileText },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {currentUser?.name || "Inventory Manager"} 👋
            </h2>
            <p className="text-blue-100">
              Manage your inventory efficiently with real-time stock tracking
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Current Date & Time</p>
            <p className="text-2xl font-bold">
              {currentTime.toLocaleDateString("en-NP")}
            </p>
            <p className="text-lg">{currentTime.toLocaleTimeString("en-NP")}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActivePanel("products")}
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Products</p>
          <p className="text-4xl font-bold">{stats.totalProducts}</p>
          <p className="text-blue-100 text-xs mt-2">
            Click to view all products
          </p>
        </div>

        <div
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActivePanel("low-stock")}
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-12 h-12 opacity-80" />
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Low Stock Items</p>
          <p className="text-4xl font-bold">{stats.lowStockItems}</p>
          <p className="text-orange-100 text-xs mt-2">Requires attention</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-12 h-12 opacity-80" />
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-red-100 text-sm mb-1">Out of Stock</p>
          <p className="text-4xl font-bold">{stats.outOfStock}</p>
          <p className="text-red-100 text-xs mt-2">Immediate action needed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Stock Value</p>
          <p className="text-4xl font-bold">
            Rs{(stats.totalStockValue / 1000).toFixed(0)}K
          </p>
          <p className="text-green-100 text-xs mt-2">Purchase value</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl border-2 border-purple-200 p-4 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setActivePanel("categories")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Grid className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCategories}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl border-2 border-pink-200 p-4 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setActivePanel("automotive")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Bookmark className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBrands}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl border-2 border-indigo-200 p-4 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setActivePanel("purchase-orders")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Today's Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.todayPurchases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-yellow-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h3 className="text-white font-bold text-lg">Low Stock Alerts</h3>
            </div>
            <button
              onClick={() => setActivePanel("low-stock")}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">
                  All products have sufficient stock!
                </p>
              </div>
            ) : (
              lowStockItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-bold">
                      {item.currentStock} units
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {item.minimumStock || 10}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-white" />
              <h3 className="text-white font-bold text-lg">Recent Activity</h3>
            </div>
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.lastUpdated ? "Updated" : "Added"}{" "}
                        {new Date(
                          item.lastUpdated || item.createdAt,
                        ).toLocaleString("en-NP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        item.currentStock > (item.minimumStock || 10)
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {item.currentStock} units
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActivePanel("products")}
            className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200"
          >
            <Plus className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Add Product
            </span>
          </button>

          <button
            onClick={() => setActivePanel("purchase-orders")}
            className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200"
          >
            <ShoppingBag className="w-8 h-8 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              Create PO
            </span>
          </button>

          <button
            onClick={() => setActivePanel("categories")}
            className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200"
          >
            <Grid className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900">
              Manage Categories
            </span>
          </button>

          <button
            onClick={() => setActivePanel("reports")}
            className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all border-2 border-orange-200"
          >
            <FileText className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-semibold text-gray-900">
              View Reports
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLowStockPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span>Low Stock Alerts</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Products that need restocking
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">All Good!</h3>
            <p className="text-gray-500">
              All products have sufficient stock levels
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-gray-900">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">
                    Minimum Stock
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600 font-bold text-lg">
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {item.minimumStock || 10}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        LOW STOCK
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setActivePanel("purchase-orders")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Create PO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Stock Reports</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Comprehensive inventory analytics
          </p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Stock Summary</h4>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Products:</span>
              <span className="font-bold text-gray-900">
                {stats.totalProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Stock:</span>
              <span className="font-bold text-green-600">
                {stats.totalProducts - stats.outOfStock}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock:</span>
              <span className="font-bold text-orange-600">
                {stats.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock:</span>
              <span className="font-bold text-red-600">{stats.outOfStock}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Value Analysis</h4>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Stock Value:</span>
              <span className="font-bold text-gray-900">
                Rs{stats.totalStockValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. per Product:</span>
              <span className="font-bold text-gray-900">
                Rs
                {stats.totalProducts > 0
                  ? Math.round(
                      stats.totalStockValue / stats.totalProducts,
                    ).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Purchase Orders</h4>
            <ShoppingBag className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today's Orders:</span>
              <span className="font-bold text-gray-900">
                {stats.todayPurchases}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending:</span>
              <span className="font-bold text-yellow-600">
                {stats.pendingOrders}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-8 text-center">
        <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Detailed Reports Coming Soon
        </h3>
        <p className="text-gray-600 mb-4">
          Advanced analytics, trends, and forecasting features are in
          development
        </p>
      </div>
    </div>
  );

  return (
    <>
      <TestModeBanner />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Enhanced Sidebar - Full Height Like Admin */}
        <aside
          className={`${
            sidebarOpen ? (sidebarCollapsed ? "w-20" : "w-72") : "w-0"
          } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col fixed lg:relative h-full z-50 shadow-2xl border-r border-white/10 overflow-hidden`}
        >
          {/* Sidebar Header / Logo */}
          <div
            className={`p-6 flex items-center ${
              sidebarCollapsed ? "justify-center" : "space-x-3"
            } border-b border-white/10 relative overflow-hidden`}
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shrink-0 shadow-lg shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 pr-6">
                <h1 className="text-white font-bold text-lg truncate tracking-tight">
                  Serve Spare
                </h1>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  Inventory Management
                </p>
              </div>
            )}

            {/* Close Button (Mobile and Tablet) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-6 right-2 p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            {/* Collapse Button (Desktop) */}
          </div>

          {/* Navigation Menu Area */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePanel(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between ${
                    sidebarCollapsed ? "px-2" : "px-4"
                  } py-3.5 rounded-xl transition-all relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                  }`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <div
                    className={`flex items-center ${
                      sidebarCollapsed ? "justify-center w-full" : "space-x-4"
                    } min-w-0`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isActive
                          ? "scale-110 drop-shadow-glow"
                          : "group-hover:scale-110"
                      } shrink-0`}
                    />
                    {!sidebarCollapsed && (
                      <span className="font-bold text-sm tracking-wide truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed &&
                    item.badge !== undefined &&
                    item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                          isActive
                            ? "bg-white text-indigo-600"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section: User & Logout */}
          <div className="p-4 mt-auto border-t border-white/10 bg-white/5">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {currentUser?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                      Inv. Manager
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Panel Header (No Duplicate Logo) */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all shadow-sm"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h2 className="text-gray-900 text-lg font-bold capitalize leading-none">
                      {activePanel.replace(/-/g, " ")}
                    </h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
                      Inventory System
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex h-10 px-4 items-center bg-blue-50 text-blue-700 rounded-xl border border-blue-100 space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold tracking-tight uppercase">
                    System Online
                  </span>
                </div>

                <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block" />

                <button
                  onClick={() => setActivePanel("overview")}
                  className={`p-2.5 rounded-xl transition-all ${
                    activePanel === "overview"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent min-w-0">
            <div className="max-w-[1600px] mx-auto">
              {activePanel === "overview" && renderOverview()}
              {activePanel === "products" && <TotalInventoryPanel />}
              {activePanel === "categories" && <EnhancedCategoriesPanel />}
              {activePanel === "automotive" && <AutomotiveInventory />}
              {activePanel === "bulk-import" && <BulkImportPanel />}
              {activePanel === "purchase-orders" && <PurchaseOrdersPanel />}
              {activePanel === "low-stock" && <EnhancedLowStockPanel />}
              {activePanel === "reports" && <EnhancedStockReports />}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};
