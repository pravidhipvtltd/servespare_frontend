import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Car,
  Bike,
  Star,
  Grid,
  Calendar,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage } from "../../utils/mockData";

interface ReportData {
  totalProducts: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  twoWheelerProducts: number;
  fourWheelerProducts: number;
  localParts: number;
  originalParts: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
  brandBreakdown: { brand: string; count: number; value: number }[];
  vehicleTypeBreakdown: { type: string; count: number; value: number }[];
  partTypeBreakdown: { type: string; count: number; value: number }[];
  topProducts: any[];
  lowValueProducts: any[];
}

export const EnhancedStockReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<
    "all" | "two_wheeler" | "four_wheeler"
  >("all");
  const [partTypeFilter, setPartTypeFilter] = useState<
    "all" | "local" | "original"
  >("all");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [reportType, setReportType] = useState<
    "summary" | "category" | "brand" | "value"
  >("summary");

  useEffect(() => {
    generateReport();
  }, [vehicleTypeFilter, partTypeFilter]);

  const generateReport = () => {
    const products = getFromStorage("products", []).filter((p: any) => {
      if (p.workspaceId !== currentUser?.workspaceId) return false;
      if (vehicleTypeFilter !== "all" && p.vehicleType !== vehicleTypeFilter)
        return false;
      if (partTypeFilter !== "all" && p.partType !== partTypeFilter)
        return false;
      return true;
    });

    const totalValue = products.reduce(
      (sum: number, p: any) => sum + (p.currentStock * p.purchasePrice || 0),
      0
    );

    const inStock = products.filter(
      (p: any) => p.currentStock > (p.minimumStock || 10)
    );
    const lowStock = products.filter(
      (p: any) => p.currentStock <= (p.minimumStock || 10) && p.currentStock > 0
    );
    const outOfStock = products.filter((p: any) => p.currentStock === 0);

    // Category breakdown
    const categoryMap = new Map<string, { count: number; value: number }>();
    products.forEach((p: any) => {
      const cat = p.category || "Uncategorized";
      const existing = categoryMap.get(cat) || { count: 0, value: 0 };
      categoryMap.set(cat, {
        count: existing.count + 1,
        value: existing.value + (p.currentStock * p.purchasePrice || 0),
      });
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value);

    // Brand breakdown
    const brandMap = new Map<string, { count: number; value: number }>();
    products.forEach((p: any) => {
      const brand = p.brand || "Unknown";
      const existing = brandMap.get(brand) || { count: 0, value: 0 };
      brandMap.set(brand, {
        count: existing.count + 1,
        value: existing.value + (p.currentStock * p.purchasePrice || 0),
      });
    });
    const brandBreakdown = Array.from(brandMap.entries())
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.value - a.value);

    // Vehicle type breakdown
    const vehicleTypeBreakdown = [
      {
        type: "2-Wheeler",
        count: products.filter((p: any) => p.vehicleType === "two_wheeler")
          .length,
        value: products
          .filter((p: any) => p.vehicleType === "two_wheeler")
          .reduce(
            (sum: number, p: any) =>
              sum + (p.currentStock * p.purchasePrice || 0),
            0
          ),
      },
      {
        type: "4-Wheeler",
        count: products.filter((p: any) => p.vehicleType === "four_wheeler")
          .length,
        value: products
          .filter((p: any) => p.vehicleType === "four_wheeler")
          .reduce(
            (sum: number, p: any) =>
              sum + (p.currentStock * p.purchasePrice || 0),
            0
          ),
      },
    ];

    // Part type breakdown
    const partTypeBreakdown = [
      {
        type: "Local",
        count: products.filter((p: any) => p.partType === "local").length,
        value: products
          .filter((p: any) => p.partType === "local")
          .reduce(
            (sum: number, p: any) =>
              sum + (p.currentStock * p.purchasePrice || 0),
            0
          ),
      },
      {
        type: "Original",
        count: products.filter((p: any) => p.partType === "original").length,
        value: products
          .filter((p: any) => p.partType === "original")
          .reduce(
            (sum: number, p: any) =>
              sum + (p.currentStock * p.purchasePrice || 0),
            0
          ),
      },
    ];

    // Top products by value
    const topProducts = products
      .map((p: any) => ({
        ...p,
        totalValue: p.currentStock * p.purchasePrice || 0,
      }))
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const lowValueProducts = products
      .filter((p: any) => p.currentStock > 0)
      .map((p: any) => ({
        ...p,
        totalValue: p.currentStock * p.purchasePrice || 0,
      }))
      .sort((a: any, b: any) => a.totalValue - b.totalValue)
      .slice(0, 10);

    setReportData({
      totalProducts: products.length,
      totalValue,
      inStock: inStock.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      twoWheelerProducts: products.filter(
        (p: any) => p.vehicleType === "two_wheeler"
      ).length,
      fourWheelerProducts: products.filter(
        (p: any) => p.vehicleType === "four_wheeler"
      ).length,
      localParts: products.filter((p: any) => p.partType === "local").length,
      originalParts: products.filter((p: any) => p.partType === "original")
        .length,
      categoryBreakdown,
      brandBreakdown,
      vehicleTypeBreakdown,
      partTypeBreakdown,
      topProducts,
      lowValueProducts,
    });
  };

  const exportReport = () => {
    if (!reportData) return;

    let csvData: any[] = [];
    let filename = "";

    switch (reportType) {
      case "summary":
        csvData = [
          {
            "Total Products": reportData.totalProducts,
            "Total Stock Value": `Rs${reportData.totalValue.toFixed(2)}`,
            "In Stock": reportData.inStock,
            "Low Stock": reportData.lowStock,
            "Out of Stock": reportData.outOfStock,
            "2-Wheeler Products": reportData.twoWheelerProducts,
            "4-Wheeler Products": reportData.fourWheelerProducts,
            "Local Parts": reportData.localParts,
            "Original Parts": reportData.originalParts,
          },
        ];
        filename = "stock_summary";
        break;
      case "category":
        csvData = reportData.categoryBreakdown.map((item) => ({
          Category: item.category,
          "Product Count": item.count,
          "Total Value": `Rs${item.value.toFixed(2)}`,
          "Average Value": `Rs${(item.value / item.count).toFixed(2)}`,
        }));
        filename = "category_breakdown";
        break;
      case "brand":
        csvData = reportData.brandBreakdown.map((item) => ({
          Brand: item.brand,
          "Product Count": item.count,
          "Total Value": `Rs${item.value.toFixed(2)}`,
          "Average Value": `Rs${(item.value / item.count).toFixed(2)}`,
        }));
        filename = "brand_breakdown";
        break;
      case "value":
        csvData = reportData.topProducts.map((item, index) => ({
          Rank: index + 1,
          SKU: item.sku,
          "Product Name": item.name,
          Stock: item.currentStock,
          "Unit Price": `Rs${item.purchasePrice}`,
          "Total Value": `Rs${item.totalValue.toFixed(2)}`,
        }));
        filename = "top_products_by_value";
        break;
    }

    if (csvData.length === 0) {
      alert("No data to export for this report.");
      return;
    }

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!reportData) {
    return <div className="text-center py-20">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold flex items-center space-x-3 mb-2">
              <BarChart3 className="w-10 h-10" />
              <span>Stock Reports & Analytics</span>
            </h3>
            <p className="text-blue-100 text-lg">
              Comprehensive inventory analysis and insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-bold"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={generateReport}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-sm text-blue-100">Total Products</span>
            </div>
            <p className="text-3xl font-bold">{reportData.totalProducts}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm text-blue-100">Stock Value</span>
            </div>
            <p className="text-2xl font-bold">
              Rs{(reportData.totalValue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm text-blue-100">In Stock</span>
            </div>
            <p className="text-3xl font-bold text-green-200">
              {reportData.inStock}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm text-blue-100">Low Stock</span>
            </div>
            <p className="text-3xl font-bold text-yellow-200">
              {reportData.lowStock}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="text-sm text-blue-100">Out of Stock</span>
            </div>
            <p className="text-3xl font-bold text-red-200">
              {reportData.outOfStock}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Report Type Selection */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        <div className="p-6 space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-3">
              Report Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setReportType("summary")}
                className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  reportType === "summary"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Summary</span>
              </button>
              <button
                onClick={() => setReportType("category")}
                className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  reportType === "category"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-5 h-5" />
                <span>By Category</span>
              </button>
              <button
                onClick={() => setReportType("brand")}
                className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  reportType === "brand"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Star className="w-5 h-5" />
                <span>By Brand</span>
              </button>
              <button
                onClick={() => setReportType("value")}
                className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  reportType === "value"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>By Value</span>
              </button>
            </div>
          </div>

          {/* Filters */}
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
        </div>
      </div>

      {/* Report Content */}
      {reportType === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Type Distribution */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
              <Car className="w-6 h-6 text-blue-600" />
              <span>Vehicle Type Distribution</span>
            </h4>
            <div className="space-y-4">
              {reportData.vehicleTypeBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {item.type}
                    </span>
                    <span className="text-gray-600">
                      {item.count} products • Rs{(item.value / 1000).toFixed(0)}
                      K
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        index === 0
                          ? "bg-gradient-to-r from-orange-500 to-red-500"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      }`}
                      style={{
                        width: `${
                          (item.count / reportData.totalProducts) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {((item.count / reportData.totalProducts) * 100).toFixed(1)}
                    % of inventory
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Part Type Distribution */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
              <Package className="w-6 h-6 text-purple-600" />
              <span>Part Type Distribution</span>
            </h4>
            <div className="space-y-4">
              {reportData.partTypeBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {item.type}
                    </span>
                    <span className="text-gray-600">
                      {item.count} products • Rs{(item.value / 1000).toFixed(0)}
                      K
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        index === 0
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                      style={{
                        width: `${
                          (item.count / reportData.totalProducts) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {((item.count / reportData.totalProducts) * 100).toFixed(1)}
                    % of inventory
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span>Stock Status Overview</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">In Stock</p>
                    <p className="text-sm text-gray-600">
                      Healthy stock levels
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {reportData.inStock}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-bold text-gray-900">Low Stock</p>
                    <p className="text-sm text-gray-600">Needs restocking</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-600">
                  {reportData.lowStock}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-bold text-gray-900">Out of Stock</p>
                    <p className="text-sm text-gray-600">Immediate action</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {reportData.outOfStock}
                </p>
              </div>
            </div>
          </div>

          {/* Value Analysis */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <span>Inventory Value Analysis</span>
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Stock Value</p>
                <p className="text-4xl font-bold text-blue-600">
                  Rs{reportData.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">
                  Average Value per Product
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  Rs
                  {(
                    reportData.totalValue / reportData.totalProducts
                  ).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">In-Stock Value</p>
                  <p className="text-lg font-bold text-green-600">
                    Rs
                    {(
                      (reportData.totalValue * reportData.inStock) /
                      reportData.totalProducts /
                      1000
                    ).toFixed(0)}
                    K
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Low-Stock Value</p>
                  <p className="text-lg font-bold text-red-600">
                    Rs
                    {(
                      (reportData.totalValue * reportData.lowStock) /
                      reportData.totalProducts /
                      1000
                    ).toFixed(0)}
                    K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === "category" && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
            <h4 className="font-bold text-xl flex items-center space-x-2">
              <Grid className="w-6 h-6" />
              <span>Category-wise Breakdown</span>
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Total Value
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Avg Value
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.categoryBreakdown.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
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
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{item.count}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      Rs{item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      Rs{(item.value / item.count).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.value / reportData.totalValue) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {((item.value / reportData.totalValue) * 100).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "brand" && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
            <h4 className="font-bold text-xl flex items-center space-x-2">
              <Star className="w-6 h-6" />
              <span>Brand-wise Breakdown</span>
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Total Value
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    Avg Value
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.brandBreakdown.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                            ? "bg-gray-100 text-gray-700"
                            : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {item.brand}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{item.count}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      Rs{item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      Rs{(item.value / item.count).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.value / reportData.totalValue) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {((item.value / reportData.totalValue) * 100).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "value" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
              <h4 className="font-bold text-xl flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>Top 10 Products by Value</span>
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                          ? "bg-orange-400 text-orange-900"
                          : "bg-green-200 text-green-700"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sku} • Stock: {product.currentStock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      Rs{product.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      @Rs{product.purchasePrice}/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Value Products */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
              <h4 className="font-bold text-xl flex items-center space-x-2">
                <TrendingDown className="w-6 h-6" />
                <span>Lowest 10 Products by Value</span>
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {reportData.lowValueProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-orange-200 text-orange-700">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sku} • Stock: {product.currentStock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-lg">
                      Rs{product.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      @Rs{product.purchasePrice}/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
