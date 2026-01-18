import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  Star,
  Filter,
  Download,
  Edit2,
  Trash2,
  RefreshCw,
  Grid,
  TrendingUp,
  BarChart3,
  Car,
  Bike,
  Eye,
  ShoppingCart,
  Box,
  AlertCircle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

interface Category {
  id: string;
  name: string;
  description?: string;
  type: "local" | "original";
  vehicleType: "two_wheeler" | "four_wheeler";
  totalParts?: number;
  totalStockValue?: number;
  lowStockParts?: number;
  outOfStockParts?: number;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export const EnhancedCategoriesPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<
    "two_wheeler" | "four_wheeler"
  >("two_wheeler");
  const [typeFilter, setTypeFilter] = useState<"local" | "original" | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "parts" | "value" | "updated">(
    "name"
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "local" as "local" | "original",
    vehicleType: "two_wheeler" as "two_wheeler" | "four_wheeler",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const allCategories = getFromStorage("categories", []);
    const products = getFromStorage("products", []);

    // Calculate detailed stats for each category
    const categoriesWithDetails = allCategories
      .filter((c: Category) => c.workspaceId === currentUser?.workspaceId)
      .map((category: Category) => {
        const categoryProducts = products.filter(
          (p: any) =>
            p.category === category.name &&
            p.workspaceId === currentUser?.workspaceId &&
            p.vehicleType === category.vehicleType
        );

        const totalParts = categoryProducts.length;
        const totalStockValue = categoryProducts.reduce(
          (sum: number, p: any) =>
            sum + (p.currentStock || 0) * (p.purchasePrice || 0),
          0
        );
        const lowStockParts = categoryProducts.filter(
          (p: any) =>
            p.currentStock <= (p.minimumStock || 10) && p.currentStock > 0
        ).length;
        const outOfStockParts = categoryProducts.filter(
          (p: any) => p.currentStock === 0
        ).length;

        return {
          ...category,
          totalParts,
          totalStockValue,
          lowStockParts,
          outOfStockParts,
        };
      });

    setCategories(categoriesWithDetails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allCategories = getFromStorage("categories", []);

    // Check for duplicate
    const duplicate = allCategories.some(
      (c: Category) =>
        c.name.toLowerCase() === formData.name.toLowerCase() &&
        c.vehicleType === formData.vehicleType &&
        c.type === formData.type &&
        c.workspaceId === currentUser?.workspaceId &&
        (!editingCategory || c.id !== editingCategory.id)
    );

    if (duplicate) {
      popup.showError(
        "A category with this name already exists for this vehicle type and part type!",
        "Duplicate Category",
        "warning"
      );
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategories = allCategories.map((c: Category) =>
        c.id === editingCategory.id
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      );
      saveToStorage("categories", updatedCategories);
    } else {
      // Add new category
      const newCategory: Category = {
        id: `cat_${formData.vehicleType}_${formData.type}_${Date.now()}`,
        ...formData,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveToStorage("categories", [...allCategories, newCategory]);
    }

    setFormData({
      name: "",
      description: "",
      type: "local",
      vehicleType: "two_wheeler",
    });
    setIsAdding(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
      vehicleType: category.vehicleType,
    });
    setIsAdding(true);
    setViewingCategory(null);
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    const products = getFromStorage("products", []);
    const productsInCategory = products.filter(
      (p: any) =>
        p.category === categoryName &&
        p.workspaceId === currentUser?.workspaceId
    );

    if (productsInCategory.length > 0) {
      popup.showConfirm(
        "Delete Category with Products",
        `This category has ${productsInCategory.length} product(s). Deleting it will remove the category from these products. Do you want to continue?`,
        () => {
          const allCategories = getFromStorage("categories", []);
          const filtered = allCategories.filter(
            (c: Category) => c.id !== categoryId
          );
          saveToStorage("categories", filtered);
          loadCategories();
          popup.showSuccess(
            "Category Deleted",
            "The category has been successfully deleted."
          );
        }
      );
      return;
    }

    popup.showConfirm(
      "Delete Category",
      "Are you sure you want to delete this category?",
      () => {
        const allCategories = getFromStorage("categories", []);
        saveToStorage(
          "categories",
          allCategories.filter((c: Category) => c.id !== categoryId)
        );
        setViewingCategory(null);
        loadCategories();
        popup.showSuccess(
          "Category Deleted",
          "The category has been successfully deleted."
        );
      }
    );
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter((category) => {
      const matchesVehicleType = category.vehicleType === vehicleTypeFilter;
      const matchesType = typeFilter === "all" || category.type === typeFilter;
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      return matchesVehicleType && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "parts":
          return (b.totalParts || 0) - (a.totalParts || 0);
        case "value":
          return (b.totalStockValue || 0) - (a.totalStockValue || 0);
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });

  // Popular categories
  const popular2WLocal = [
    "Engine Parts",
    "Brake Pads",
    "Chain & Sprocket",
    "Air Filter",
    "Oil Filter",
    "Spark Plug",
    "Clutch Plates",
    "Suspension",
    "Exhaust",
    "Battery",
    "Tires",
    "Lights",
    "Mirrors",
    "Cables",
    "Bearings",
  ];
  const popular2WOriginal = [
    "OEM Engine Parts",
    "Genuine Brake Kit",
    "Original Chain Kit",
    "OEM Filters",
    "Genuine Clutch",
    "Original Suspension",
    "OEM Exhaust",
    "Genuine Lights",
    "Original Cables",
    "OEM Bearings",
  ];
  const popular4WLocal = [
    "Engine Parts",
    "Brake Pads",
    "Suspension",
    "Air Filter",
    "Oil Filter",
    "Spark Plug",
    "Clutch",
    "Radiator",
    "Battery",
    "Tires",
    "Headlights",
    "Wipers",
    "Belts",
    "Bearings",
    "Gaskets",
  ];
  const popular4WOriginal = [
    "OEM Engine Parts",
    "Genuine Brake Kit",
    "Original Suspension Kit",
    "OEM Filters",
    "Genuine Clutch",
    "Original Radiator",
    "OEM Lights",
    "Genuine Wipers",
    "Original Belts",
    "OEM Gaskets",
  ];

  const quickAdd = (categoryName: string) => {
    const allCategories = getFromStorage("categories", []);
    const exists = allCategories.some(
      (c: Category) =>
        c.name === categoryName &&
        c.type === (typeFilter === "all" ? "local" : typeFilter) &&
        c.vehicleType === vehicleTypeFilter &&
        c.workspaceId === currentUser?.workspaceId
    );

    if (exists) {
      popup.showError(
        "This category already exists!",
        "Duplicate Category",
        "warning"
      );
      return;
    }

    const newCategory: Category = {
      id: `cat_${vehicleTypeFilter}_${
        typeFilter === "all" ? "local" : typeFilter
      }_${Date.now()}`,
      name: categoryName,
      type: typeFilter === "all" ? "local" : typeFilter,
      vehicleType: vehicleTypeFilter,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage("categories", [...allCategories, newCategory]);
    loadCategories();
  };

  const exportCategories = () => {
    if (filteredCategories.length === 0) {
      popup.showError(
        "No categories to export. Please add categories first.",
        "No Data",
        "warning"
      );
      return;
    }

    const csvData = filteredCategories.map((cat) => ({
      "Category Name": cat.name,
      "Vehicle Type":
        cat.vehicleType === "two_wheeler" ? "2-Wheeler" : "4-Wheeler",
      "Part Type":
        cat.type === "local" ? "Local/Aftermarket" : "Original/Genuine",
      "Total Products": cat.totalParts || 0,
      "Stock Value": `Rs${(cat.totalStockValue || 0).toFixed(2)}`,
      "Low Stock Items": cat.lowStockParts || 0,
      "Out of Stock Items": cat.outOfStockParts || 0,
      Description: cat.description || "",
      Created: new Date(cat.createdAt).toLocaleDateString(),
      "Last Updated": new Date(cat.updatedAt).toLocaleDateString(),
    }));

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
    a.download = `categories_${vehicleTypeFilter}_${typeFilter}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  // Statistics
  const stats = {
    total2WLocal: categories.filter(
      (c) => c.vehicleType === "two_wheeler" && c.type === "local"
    ).length,
    total2WOriginal: categories.filter(
      (c) => c.vehicleType === "two_wheeler" && c.type === "original"
    ).length,
    total4WLocal: categories.filter(
      (c) => c.vehicleType === "four_wheeler" && c.type === "local"
    ).length,
    total4WOriginal: categories.filter(
      (c) => c.vehicleType === "four_wheeler" && c.type === "original"
    ).length,
    totalProducts: categories.reduce((sum, c) => sum + (c.totalParts || 0), 0),
    totalValue: categories.reduce(
      (sum, c) => sum + (c.totalStockValue || 0),
      0
    ),
  };

  const currentStats = {
    totalLocal: categories.filter(
      (c) => c.vehicleType === vehicleTypeFilter && c.type === "local"
    ).length,
    totalOriginal: categories.filter(
      (c) => c.vehicleType === vehicleTypeFilter && c.type === "original"
    ).length,
    totalProducts: filteredCategories.reduce(
      (sum, c) => sum + (c.totalParts || 0),
      0
    ),
    totalValue: filteredCategories.reduce(
      (sum, c) => sum + (c.totalStockValue || 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Simple Header with Key Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold flex items-center space-x-3 mb-2">
              <Grid className="w-10 h-10" />
              <span>Product Categories</span>
            </h3>
            <p className="text-purple-100 text-lg">
              Organize your inventory by vehicle type and part category
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                ...formData,
                vehicleType: vehicleTypeFilter,
                type: typeFilter === "all" ? "local" : typeFilter,
              });
              setIsAdding(true);
              setViewingCategory(null);
            }}
            className="flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-lg transform hover:scale-105 font-bold"
          >
            <Plus className="w-6 h-6" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Simple Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Grid className="w-5 h-5" />
              <span className="text-sm text-purple-100">Total Categories</span>
            </div>
            <p className="text-3xl font-bold">{categories.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-sm text-purple-100">Total Products</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm text-purple-100">Total Value</span>
            </div>
            <p className="text-2xl font-bold">
              Rs{(stats.totalValue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm text-purple-100">Avg Products</span>
            </div>
            <p className="text-3xl font-bold">
              {categories.length > 0
                ? Math.round(stats.totalProducts / categories.length)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Filter Bar */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
        {/* Vehicle Type Selection - PRIMARY */}
        <div>
          <label className="block text-gray-700 font-bold mb-3 text-lg">
            <Car className="inline w-5 h-5 mr-2" />
            Step 1: Select Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setVehicleTypeFilter("two_wheeler")}
              className={`p-6 rounded-xl font-bold transition-all flex flex-col items-center space-y-3 ${
                vehicleTypeFilter === "two_wheeler"
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
              }`}
            >
              <Bike className="w-12 h-12" />
              <div className="text-center">
                <p className="text-2xl">2-Wheeler</p>
                <p
                  className={`text-sm mt-1 ${
                    vehicleTypeFilter === "two_wheeler"
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  {stats.total2WLocal + stats.total2WOriginal} categories
                </p>
              </div>
            </button>
            <button
              onClick={() => setVehicleTypeFilter("four_wheeler")}
              className={`p-6 rounded-xl font-bold transition-all flex flex-col items-center space-y-3 ${
                vehicleTypeFilter === "four_wheeler"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-xl scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
              }`}
            >
              <Car className="w-12 h-12" />
              <div className="text-center">
                <p className="text-2xl">4-Wheeler</p>
                <p
                  className={`text-sm mt-1 ${
                    vehicleTypeFilter === "four_wheeler"
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  {stats.total4WLocal + stats.total4WOriginal} categories
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Part Type Selection - SECONDARY */}
        <div>
          <label className="block text-gray-700 font-bold mb-3 text-lg">
            <Package className="inline w-5 h-5 mr-2" />
            Step 2: Select Part Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTypeFilter("local")}
              className={`p-4 rounded-xl font-bold transition-all flex flex-col items-center space-y-2 ${
                typeFilter === "local"
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <Package className="w-8 h-8" />
              <div className="text-center">
                <p className="text-lg">Local / Aftermarket</p>
                <p
                  className={`text-xs mt-1 ${
                    typeFilter === "local" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {currentStats.totalLocal} categories
                </p>
              </div>
            </button>
            <button
              onClick={() => setTypeFilter("original")}
              className={`p-4 rounded-xl font-bold transition-all flex flex-col items-center space-y-2 ${
                typeFilter === "original"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <Star className="w-8 h-8" />
              <div className="text-center">
                <p className="text-lg">Original / Genuine</p>
                <p
                  className={`text-xs mt-1 ${
                    typeFilter === "original"
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  {currentStats.totalOriginal} categories
                </p>
              </div>
            </button>
            <button
              onClick={() => setTypeFilter("all")}
              className={`p-4 rounded-xl font-bold transition-all flex flex-col items-center space-y-2 ${
                typeFilter === "all"
                  ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <Grid className="w-8 h-8" />
              <div className="text-center">
                <p className="text-lg">All Types</p>
                <p
                  className={`text-xs mt-1 ${
                    typeFilter === "all" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {currentStats.totalLocal + currentStats.totalOriginal}{" "}
                  categories
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="name">Sort by Name</option>
              <option value="parts">Sort by Products</option>
              <option value="value">Sort by Value</option>
              <option value="updated">Sort by Updated</option>
            </select>
            <button
              onClick={exportCategories}
              className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              title="Export"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={loadCategories}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-gray-900 font-bold text-lg">
                  Showing {filteredCategories.length} categories
                </p>
                <p className="text-gray-600 text-sm">
                  {vehicleTypeFilter === "two_wheeler"
                    ? "🏍️ 2-Wheeler"
                    : "🚗 4-Wheeler"}
                  {" • "}
                  {typeFilter === "local" && "📦 Local/Aftermarket"}
                  {typeFilter === "original" && "✨ Original/Genuine"}
                  {typeFilter === "all" && "🔄 All Types"}
                  {" • "}
                  {currentStats.totalProducts} products
                  {" • "}
                  Rs{(currentStats.totalValue / 1000).toFixed(0)}K value
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl border-2 border-purple-300 p-8 shadow-2xl">
          <h4 className="font-bold text-gray-900 text-2xl mb-6 flex items-center space-x-2">
            {editingCategory ? (
              <Edit2 className="w-7 h-7 text-purple-600" />
            ) : (
              <Plus className="w-7 h-7 text-purple-600" />
            )}
            <span>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </span>
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-gray-700 font-bold mb-3 text-lg">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, vehicleType: "two_wheeler" })
                  }
                  className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    formData.vehicleType === "two_wheeler"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105 border-4 border-orange-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  <Bike className="w-6 h-6" />
                  <span className="text-lg">2-Wheeler</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, vehicleType: "four_wheeler" })
                  }
                  className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    formData.vehicleType === "four_wheeler"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105 border-4 border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  <Car className="w-6 h-6" />
                  <span className="text-lg">4-Wheeler</span>
                </button>
              </div>
            </div>

            {/* Part Type */}
            <div>
              <label className="block text-gray-700 font-bold mb-3 text-lg">
                Part Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "local" })}
                  className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    formData.type === "local"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 border-4 border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-lg">Local / Aftermarket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "original" })}
                  className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    formData.type === "original"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105 border-4 border-purple-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  <Star className="w-6 h-6" />
                  <span className="text-lg">Original / Genuine</span>
                </button>
              </div>
            </div>

            {/* Category Name */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Engine Parts, Brake Systems, Filters"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this category..."
                rows={3}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-bold text-xl"
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingCategory(null);
                  setFormData({
                    name: "",
                    description: "",
                    type: "local",
                    vehicleType: "two_wheeler",
                  });
                }}
                className="px-8 py-5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Suggestions */}
      {filteredCategories.length === 0 &&
        !searchQuery &&
        typeFilter !== "all" && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-8">
            <h4 className="font-bold text-gray-900 text-xl mb-6 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span>
                Quick Add Popular{" "}
                {vehicleTypeFilter === "two_wheeler"
                  ? "2-Wheeler"
                  : "4-Wheeler"}{" "}
                {typeFilter === "local"
                  ? "Local/Aftermarket"
                  : "Original/Genuine"}{" "}
                Categories
              </span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {(vehicleTypeFilter === "two_wheeler"
                ? typeFilter === "local"
                  ? popular2WLocal
                  : popular2WOriginal
                : typeFilter === "local"
                ? popular4WLocal
                : popular4WOriginal
              ).map((categoryName) => (
                <button
                  key={categoryName}
                  onClick={() => quickAdd(categoryName)}
                  className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all text-gray-900 font-bold text-center transform hover:scale-105"
                >
                  + {categoryName}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Categories Grid/Table */}
      {filteredCategories.length === 0 && searchQuery ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
          <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 text-lg">Try a different search term</p>
        </div>
      ) : filteredCategories.length === 0 && typeFilter === "all" ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
          <Grid className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-500 text-lg mb-4">
            Select Local or Original to see quick-add options
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-2xl transition-all"
            >
              {/* Header */}
              <div
                className={`p-6 ${
                  category.type === "local"
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-2xl mb-2">
                      {category.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center space-x-1">
                        {category.type === "local" ? (
                          <Package className="w-3 h-3" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                        <span>
                          {category.type === "local" ? "Local" : "Original"}
                        </span>
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center space-x-1">
                        {category.vehicleType === "two_wheeler" ? (
                          <Bike className="w-3 h-3" />
                        ) : (
                          <Car className="w-3 h-3" />
                        )}
                        <span>
                          {category.vehicleType === "two_wheeler"
                            ? "2-Wheeler"
                            : "4-Wheeler"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {category.description && (
                  <p className="text-white/90 text-sm mt-2">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border-2 border-blue-200">
                    <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {category.totalParts || 0}
                    </p>
                    <p className="text-xs text-gray-600">Products</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                    <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">
                      Rs{((category.totalStockValue || 0) / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-600">Stock Value</p>
                  </div>
                </div>

                {(category.lowStockParts! > 0 ||
                  category.outOfStockParts! > 0) && (
                  <div className="flex items-center justify-between text-sm">
                    {category.lowStockParts! > 0 && (
                      <span className="flex items-center space-x-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{category.lowStockParts} low stock</span>
                      </span>
                    )}
                    {category.outOfStockParts! > 0 && (
                      <span className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{category.outOfStockParts} out of stock</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  Updated: {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setViewingCategory(category)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm font-bold"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-1 text-sm font-bold"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`p-6 ${
                viewingCategory.type === "local"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              } text-white`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Category Details</h3>
                <button
                  onClick={() => setViewingCategory(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">
                  {viewingCategory.name}
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 ${
                      viewingCategory.type === "local"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {viewingCategory.type === "local" ? (
                      <Package className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    <span>
                      {viewingCategory.type === "local"
                        ? "Local/Aftermarket"
                        : "Original/Genuine"}
                    </span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 ${
                      viewingCategory.vehicleType === "two_wheeler"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {viewingCategory.vehicleType === "two_wheeler" ? (
                      <Bike className="w-4 h-4" />
                    ) : (
                      <Car className="w-4 h-4" />
                    )}
                    <span>
                      {viewingCategory.vehicleType === "two_wheeler"
                        ? "2-Wheeler"
                        : "4-Wheeler"}
                    </span>
                  </span>
                </div>
                {viewingCategory.description && (
                  <p className="text-gray-600 text-lg">
                    {viewingCategory.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    <span className="text-gray-600 font-semibold">
                      Total Products
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {viewingCategory.totalParts || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <span className="text-gray-600 font-semibold">
                      Stock Value
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    Rs{(viewingCategory.totalStockValue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <span className="text-gray-600 font-semibold">
                      Low Stock
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {viewingCategory.lowStockParts || 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <span className="text-gray-600 font-semibold">
                      Out of Stock
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {viewingCategory.outOfStockParts || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(viewingCategory.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(viewingCategory.updatedAt).toLocaleString()}
                </p>
                <p>
                  <strong>Category ID:</strong> {viewingCategory.id}
                </p>
              </div>

              <div className="flex space-x-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    handleEdit(viewingCategory);
                    setViewingCategory(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-bold text-lg flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Edit Category</span>
                </button>
                <button
                  onClick={() =>
                    handleDelete(viewingCategory.id, viewingCategory.name)
                  }
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold text-lg flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
