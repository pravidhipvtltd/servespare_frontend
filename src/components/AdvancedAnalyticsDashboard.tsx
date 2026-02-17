import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getFromStorage } from "../utils/mockData";
import { Bill, InventoryItem, Party } from "../types";
import { useBranch } from "../contexts/BranchContext";

interface AnalyticsData {
  revenue: {
    total: number;
    trend: number;
    previous: number;
  };
  profit: {
    total: number;
    margin: number;
    trend: number;
  };
  orders: {
    total: number;
    trend: number;
    avgValue: number;
  };
  inventory: {
    value: number;
    items: number;
    lowStock: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  salesByPayment: {
    cash: number;
    esewa: number;
    fonepay: number;
    bank: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

interface AdvancedAnalyticsDashboardProps {
  workspaceId: string;
  timeRange?: "today" | "week" | "month" | "year";
}

export const AdvancedAnalyticsDashboard: React.FC<
  AdvancedAnalyticsDashboardProps
> = ({ workspaceId, timeRange = "week" }) => {
  const { selectedBranchId } = useBranch();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);

  useEffect(() => {
    calculateAnalytics();
  }, [workspaceId, selectedPeriod, selectedBranchId]);

  const matchesSelectedBranch = (recordBranchId: unknown) => {
    if (!selectedBranchId) return true;
    if (recordBranchId === null || recordBranchId === undefined) return false;
    return String(recordBranchId) === selectedBranchId;
  };

  const calculateAnalytics = () => {
    setLoading(true);

    const bills: Bill[] = getFromStorage("bills", []).filter(
      (b: Bill) =>
        b.workspaceId === workspaceId &&
        b.paymentStatus === "paid" &&
        matchesSelectedBranch((b as any).branchId),
    );
    const inventory: InventoryItem[] = getFromStorage("products", []).filter(
      (i: InventoryItem) =>
        i.workspaceId === workspaceId &&
        matchesSelectedBranch((i as any).branchId ?? (i as any).branch),
    );
    const parties: Party[] = getFromStorage("parties", []).filter(
      (p: Party) =>
        p.workspaceId === workspaceId &&
        matchesSelectedBranch((p as any).branchId ?? (p as any).branch),
    );

    // Filter bills by time range
    const now = new Date();
    const filteredBills = bills.filter((bill: Bill) => {
      const billDate = new Date(bill.createdAt);
      const diffDays = Math.floor(
        (now.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (selectedPeriod) {
        case "today":
          return diffDays === 0;
        case "week":
          return diffDays <= 7;
        case "month":
          return diffDays <= 30;
        case "year":
          return diffDays <= 365;
        default:
          return true;
      }
    });

    // Calculate revenue
    const totalRevenue = filteredBills.reduce(
      (sum, bill) => sum + (bill.total || 0),
      0,
    );
    const previousPeriodBills = bills.filter((bill: Bill) => {
      const billDate = new Date(bill.createdAt);
      const diffDays = Math.floor(
        (now.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (selectedPeriod) {
        case "today":
          return diffDays === 1;
        case "week":
          return diffDays > 7 && diffDays <= 14;
        case "month":
          return diffDays > 30 && diffDays <= 60;
        case "year":
          return diffDays > 365 && diffDays <= 730;
        default:
          return false;
      }
    });
    const previousRevenue = previousPeriodBills.reduce(
      (sum, bill) => sum + (bill.total || 0),
      0,
    );
    const revenueTrend =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate profit (assuming 30% margin)
    const totalProfit = totalRevenue * 0.3;
    const profitMargin = 30;

    // Calculate orders
    const totalOrders = filteredBills.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousOrders = previousPeriodBills.length;
    const ordersTrend =
      previousOrders > 0
        ? ((totalOrders - previousOrders) / previousOrders) * 100
        : 0;

    // Calculate inventory value
    const inventoryValue = inventory.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );
    const lowStockItems = inventory.filter(
      (item) => (item.quantity || 0) <= (item.minStockLevel || 0),
    ).length;

    // Top products
    const productSales = new Map<
      string,
      { name: string; sales: number; revenue: number }
    >();
    filteredBills.forEach((bill: Bill) => {
      bill.items?.forEach((item: any) => {
        const existing = productSales.get(item.productId) || {
          name: item.productName,
          sales: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          name: item.productName,
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + item.total,
        });
      });
    });
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top customers
    const customerSales = new Map<
      string,
      { name: string; orders: number; revenue: number }
    >();
    filteredBills.forEach((bill: Bill) => {
      const key = bill.customerName || "Walk-in Customer";
      const existing = customerSales.get(key) || {
        name: key,
        orders: 0,
        revenue: 0,
      };
      customerSales.set(key, {
        name: key,
        orders: existing.orders + 1,
        revenue: existing.revenue + (bill.total || 0),
      });
    });
    const topCustomers = Array.from(customerSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by payment method
    const salesByPayment = {
      cash: 0,
      esewa: 0,
      fonepay: 0,
      bank: 0,
    };
    filteredBills.forEach((bill: Bill) => {
      const method = bill.paymentMethod?.toLowerCase() || "cash";
      if (method in salesByPayment) {
        salesByPayment[method as keyof typeof salesByPayment] +=
          bill.total || 0;
      }
    });

    // Daily sales for last 7 days
    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];

      const dayBills = filteredBills.filter((bill: Bill) =>
        bill.createdAt?.startsWith(dateStr),
      );

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        sales: dayBills.reduce((sum, bill) => sum + (bill.total || 0), 0),
        orders: dayBills.length,
      };
    });

    setAnalytics({
      revenue: {
        total: totalRevenue,
        trend: revenueTrend,
        previous: previousRevenue,
      },
      profit: {
        total: totalProfit,
        margin: profitMargin,
        trend: revenueTrend, // Same as revenue trend
      },
      orders: {
        total: totalOrders,
        trend: ordersTrend,
        avgValue: avgOrderValue,
      },
      inventory: {
        value: inventoryValue,
        items: inventory.length,
        lowStock: lowStockItems,
      },
      topProducts,
      topCustomers,
      salesByPayment,
      dailySales,
    });

    setLoading(false);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <div className="flex space-x-2">
          {(["today", "week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div
              className={`flex items-center space-x-1 ${getTrendColor(analytics.revenue.trend)} bg-white/20 px-2 py-1 rounded-full`}
            >
              {getTrendIcon(analytics.revenue.trend)}
              <span className="text-sm font-bold">
                {Math.abs(analytics.revenue.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">
            NPR {analytics.revenue.total.toLocaleString()}
          </p>
        </div>

        {/* Profit Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <span className="text-sm font-bold">
                {analytics.profit.margin}% Margin
              </span>
            </div>
          </div>
          <p className="text-green-100 text-sm mb-1">Total Profit</p>
          <p className="text-3xl font-bold">
            NPR {analytics.profit.total.toLocaleString()}
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <div
              className={`flex items-center space-x-1 ${getTrendColor(analytics.orders.trend)} bg-white/20 px-2 py-1 rounded-full`}
            >
              {getTrendIcon(analytics.orders.trend)}
              <span className="text-sm font-bold">
                {Math.abs(analytics.orders.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{analytics.orders.total}</p>
          <p className="text-purple-100 text-sm mt-2">
            Avg: NPR {analytics.orders.avgValue.toLocaleString()}
          </p>
        </div>

        {/* Inventory Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 opacity-80" />
            {analytics.inventory.lowStock > 0 && (
              <div className="bg-red-500 px-2 py-1 rounded-full flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {analytics.inventory.lowStock}
                </span>
              </div>
            )}
          </div>
          <p className="text-orange-100 text-sm mb-1">Inventory Value</p>
          <p className="text-3xl font-bold">
            NPR {analytics.inventory.value.toLocaleString()}
          </p>
          <p className="text-orange-100 text-sm mt-2">
            {analytics.inventory.items} items
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Daily Sales Trend</span>
          </h3>
          <div className="space-y-3">
            {analytics.dailySales.map((day, idx) => {
              const maxSales = Math.max(
                ...analytics.dailySales.map((d) => d.sales),
              );
              const percentage =
                maxSales > 0 ? (day.sales / maxSales) * 100 : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {day.date}
                    </span>
                    <span className="text-gray-600">
                      NPR {day.sales.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{day.orders} orders</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-green-600" />
            <span>Payment Methods</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.salesByPayment).map(
              ([method, amount]) => {
                const total = Object.values(analytics.salesByPayment).reduce(
                  (a, b) => a + b,
                  0,
                );
                const percentage = total > 0 ? (amount / total) * 100 : 0;

                const colors: Record<string, string> = {
                  cash: "from-green-500 to-emerald-600",
                  esewa: "from-purple-500 to-purple-600",
                  fonepay: "from-blue-500 to-blue-600",
                  bank: "from-orange-500 to-orange-600",
                };

                return (
                  <div key={method} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {method}
                      </span>
                      <span className="text-gray-600">
                        NPR {amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[method]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Top Products</span>
          </h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.sales} units sold
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  NPR {product.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Top Customers</span>
          </h3>
          <div className="space-y-3">
            {analytics.topCustomers.map((customer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {customer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.orders} orders
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  NPR {customer.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
