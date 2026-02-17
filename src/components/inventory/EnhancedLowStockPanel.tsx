import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Package,
  Car,
  Bike,
  Star,
  TrendingDown,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Grid,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage } from "../../utils/mockData";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  currentStock: number;
  minimumStock: number;
  purchasePrice: number;
  sellingPrice: number;
  vehicleType?: "two_wheeler" | "four_wheeler";
  partType?: "local" | "original";
  workspaceId?: string;
  shortage?: number;
  estimatedValue?: number;
  status?: string;
}

export const EnhancedLowStockPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<
    "all" | "two_wheeler" | "four_wheeler"
  >("all");
  const [partTypeFilter, setPartTypeFilter] = useState<
    "all" | "local" | "original"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "critical" | "low" | "warning"
  >("all");
  const [sortBy, setSortBy] = useState<"stock" | "name" | "value" | "shortage">(
    "stock",
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const loadLowStockProducts = async () => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/low_stock_alerts/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const apiProducts: Product[] = data.alerts.map((alert: any) => ({
            id: alert.id.toString(),
            name: alert.item_name,
            sku: alert.part_number,
            currentStock: alert.current_quantity,
            minimumStock: alert.minimum_required,
            category: alert.category,
            brand: alert.supplier || "Unknown",
            purchasePrice: alert.estimated_value || 0, // Using estimated_value as a proxy for value
            sellingPrice: 0,
            vehicleType: "two_wheeler", // Placeholder
            partType: alert.category === "local" ? "local" : "original", // Inferring from category if possible
            shortage: alert.shortage,
            estimatedValue: alert.estimated_value,
            status: alert.status,
          }));
          setProducts(apiProducts);
        } else {
          // If API fails, fallback to local
          fallbackToLocalData();
        }
      } else {
        fallbackToLocalData();
      }
    } catch (error) {
      console.error("Failed to fetch low stock alerts:", error);
      fallbackToLocalData();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToLocalData = () => {
    const allProducts = getFromStorage("products", []);
    const lowStock = allProducts.filter(
      (p: Product) =>
        p.workspaceId === currentUser?.workspaceId &&
        p.currentStock <= (p.minimumStock || 10),
    );
    setProducts(lowStock);
  };

  // Get filter options
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const brands = [
    "all",
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ];

  // Calculate severity
  const getSeverity = (product: Product) => {
    const stock = product.currentStock;
    const min = product.minimumStock || 10;

    if (stock === 0) return "critical";
    if (stock <= min * 0.3) return "low";
    return "warning";
  };

  // Filter products
  const filteredProducts = products
    .filter((product) => {
      const matchesVehicleType =
        vehicleTypeFilter === "all" ||
        product.vehicleType === vehicleTypeFilter;
      const matchesPartType =
        partTypeFilter === "all" || product.partType === partTypeFilter;
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || getSeverity(product) === severityFilter;

      return (
        matchesVehicleType &&
        matchesPartType &&
        matchesCategory &&
        matchesBrand &&
        matchesSearch &&
        matchesSeverity
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stock":
          return a.currentStock - b.currentStock;
        case "name":
          return a.name.localeCompare(b.name);
        case "value":
          return (
            b.currentStock * b.purchasePrice - a.currentStock * a.purchasePrice
          );
        case "shortage":
          return (
            (b.minimumStock || 10) -
            b.currentStock -
            ((a.minimumStock || 10) - a.currentStock)
          );
        default:
          return 0;
      }
    });

  // Statistics
  const stats = {
    totalLowStock: products.length,
    critical: products.filter((p) => getSeverity(p) === "critical").length,
    low: products.filter((p) => getSeverity(p) === "low").length,
    warning: products.filter((p) => getSeverity(p) === "warning").length,
    totalValue: products.reduce(
      (sum, p) => sum + (p.estimatedValue || p.currentStock * p.purchasePrice),
      0,
    ),
    totalShortage: products.reduce(
      (sum, p) => sum + (p.shortage || (p.minimumStock || 10) - p.currentStock),
      0,
    ),
  };

  const exportLowStock = () => {
    if (filteredProducts.length === 0) {
      popup.showError(
        "No low stock items to export. Please check your filters or add products to inventory.",
        "No Data to Export",
        "warning",
      );
      return;
    }

    const csvData = filteredProducts.map((product) => ({
      SKU: product.sku,
      "Product Name": product.name,
      Category: product.category,
      Brand: product.brand,
      "Vehicle Type":
        product.vehicleType === "two_wheeler"
          ? "2-Wheeler"
          : product.vehicleType === "four_wheeler"
            ? "4-Wheeler"
            : "N/A",
      "Part Type":
        product.partType === "local"
          ? "Local"
          : product.partType === "original"
            ? "Original"
            : "N/A",
      "Current Stock": product.currentStock,
      "Minimum Stock": product.minimumStock || 10,
      Shortage:
        product.shortage || (product.minimumStock || 10) - product.currentStock,
      "Stock Value": `Rs${(
        product.estimatedValue || product.currentStock * product.purchasePrice
      ).toFixed(2)}`,
      Severity: getSeverity(product).toUpperCase(),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `low_stock_alert_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>CRITICAL - OUT OF STOCK</span>
          </span>
        );
      case "low":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>LOW - URGENT</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>WARNING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold flex items-center space-x-3 mb-2">
              <AlertTriangle className="w-10 h-10" />
              <span>Low Stock Alerts</span>
            </h3>
            <p className="text-orange-100 text-lg">
              Monitor and manage products that need immediate restocking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportLowStock}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all shadow-lg font-bold"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button
              onClick={loadLowStockProducts}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm text-orange-100">Total Low Stock</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalLowStock}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="text-sm text-orange-100">Critical</span>
            </div>
            <p className="text-3xl font-bold text-red-200">{stats.critical}</p>
            <p className="text-xs text-orange-200">Out of Stock</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm text-orange-100">Low</span>
            </div>
            <p className="text-3xl font-bold text-orange-200">{stats.low}</p>
            <p className="text-xs text-orange-200">Urgent Action</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm text-orange-100">Warning</span>
            </div>
            <p className="text-3xl font-bold text-yellow-200">
              {stats.warning}
            </p>
            <p className="text-xs text-orange-200">Monitor</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm text-orange-100">Total Shortage</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalShortage}</p>
            <p className="text-xs text-orange-200">Units Needed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm text-orange-100">Stock Value</span>
            </div>
            <p className="text-2xl font-bold">
              Rs{(stats.totalValue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        <div className="p-6 space-y-4">
          {/* Row 1: Severity Filter */}
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-xl p-2 inline-flex shadow-inner">
              <button
                onClick={() => setSeverityFilter("all")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  severityFilter === "all"
                    ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>All Items</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    severityFilter === "all"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.totalLowStock}
                </span>
              </button>
              <button
                onClick={() => setSeverityFilter("critical")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  severityFilter === "critical"
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Critical</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    severityFilter === "critical"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.critical}
                </span>
              </button>
              <button
                onClick={() => setSeverityFilter("low")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  severityFilter === "low"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Low</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    severityFilter === "low"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.low}
                </span>
              </button>
              <button
                onClick={() => setSeverityFilter("warning")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  severityFilter === "warning"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Warning</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    severityFilter === "warning"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.warning}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Vehicle Type & Part Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-2 inline-flex shadow-inner border-2 border-gray-200">
              <button
                onClick={() => setVehicleTypeFilter("all")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  vehicleTypeFilter === "all"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>All Vehicles</span>
              </button>
              <button
                onClick={() => setVehicleTypeFilter("two_wheeler")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  vehicleTypeFilter === "two_wheeler"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>2-Wheeler</span>
              </button>
              <button
                onClick={() => setVehicleTypeFilter("four_wheeler")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  vehicleTypeFilter === "four_wheeler"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Car className="w-4 h-4" />
                <span>4-Wheeler</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-2 inline-flex shadow-inner border-2 border-gray-200">
              <button
                onClick={() => setPartTypeFilter("all")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  partTypeFilter === "all"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>All Types</span>
              </button>
              <button
                onClick={() => setPartTypeFilter("local")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  partTypeFilter === "local"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Local</span>
              </button>
              <button
                onClick={() => setPartTypeFilter("original")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all flex-1 justify-center ${
                  partTypeFilter === "original"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Original</span>
              </button>
            </div>
          </div>

          {/* Row 3: Search, Category, Brand, Sort */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "all" ? "All Brands" : brand}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="stock">Sort by Stock Level</option>
              <option value="shortage">Sort by Shortage</option>
              <option value="value">Sort by Value</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Results Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-4">
            <div className="flex items-center space-x-3">
              <Filter className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-gray-900 font-bold text-lg">
                  Showing {filteredProducts.length} low stock items
                </p>
                <p className="text-gray-600 text-sm">
                  {severityFilter !== "all" &&
                    `${severityFilter.toUpperCase()} level • `}
                  {vehicleTypeFilter !== "all" &&
                    `${
                      vehicleTypeFilter === "two_wheeler" ? "🏍️ 2W" : "🚗 4W"
                    } • `}
                  {partTypeFilter !== "all" &&
                    `${
                      partTypeFilter === "local" ? "📦 Local" : "✨ Original"
                    } • `}
                  {categoryFilter !== "all" && `Category: ${categoryFilter} • `}
                  {brandFilter !== "all" && `Brand: ${brandFilter}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Great! All products are well stocked
            </h3>
            <p className="text-gray-500 text-lg">
              No items need restocking at the moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">
                    Product Details
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Min Stock</th>
                  <th className="px-6 py-4 text-left font-bold">Shortage</th>
                  <th className="px-6 py-4 text-left font-bold">Stock Value</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const severity = product.status || getSeverity(product);
                  const shortage =
                    product.shortage ||
                    (product.minimumStock || 10) - product.currentStock;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        severity === "critical" || severity === "out_of_stock"
                          ? "bg-red-50"
                          : severity === "low" || severity === "warning"
                            ? "bg-orange-50"
                            : "bg-yellow-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </p>
                          <p className="text-sm text-gray-600">
                            {product.category} • {product.brand}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {product.vehicleType && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold text-white inline-flex items-center space-x-1 w-fit ${
                                product.vehicleType === "two_wheeler"
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                              }`}
                            >
                              {product.vehicleType === "two_wheeler" ? (
                                <Bike className="w-3 h-3" />
                              ) : (
                                <Car className="w-3 h-3" />
                              )}
                              <span>
                                {product.vehicleType === "two_wheeler"
                                  ? "2W"
                                  : "4W"}
                              </span>
                            </span>
                          )}
                          {product.partType && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold text-white inline-flex items-center space-x-1 w-fit ${
                                product.partType === "local"
                                  ? "bg-cyan-500"
                                  : "bg-purple-500"
                              }`}
                            >
                              {product.partType === "local" ? (
                                <Package className="w-3 h-3" />
                              ) : (
                                <Star className="w-3 h-3" />
                              )}
                              <span>
                                {product.partType === "local"
                                  ? "Local"
                                  : "Original"}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`text-2xl font-bold ${
                            severity === "critical"
                              ? "text-red-600"
                              : severity === "low"
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {product.currentStock}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {product.minimumStock || 10}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-red-600">
                          -{shortage}
                        </p>
                        <p className="text-xs text-gray-500">units needed</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          Rs
                          {(
                            product.estimatedValue ||
                            product.currentStock * product.purchasePrice
                          ).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(severity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popup Container */}
      <PopupContainer
        showSuccessPopup={popup.showSuccessPopup}
        successTitle={popup.successTitle}
        successMessage={popup.successMessage}
        onSuccessClose={popup.hideSuccess}
        showErrorPopup={popup.showErrorPopup}
        errorTitle={popup.errorTitle}
        errorMessage={popup.errorMessage}
        errorType={popup.errorType}
        onErrorClose={popup.hideError}
        showConfirmDialog={popup.showConfirmDialog}
        confirmConfig={popup.confirmConfig}
        onConfirmCancel={popup.hideConfirm}
      />
    </div>
  );
};
