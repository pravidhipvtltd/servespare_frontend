import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Package,
  Calendar,
  Tag,
  DollarSign,
  Box,
  Edit2,
  Trash2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Bike,
  Car,
  Star,
  TrendingUp,
  BarChart3,
  Sliders,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import {
  VehicleModel,
  AutoPart,
  PartFilters,
  Supplier,
} from "../../types/automotive";
import { listenToEvent, emitEvent } from "../../utils/eventBus";

interface ModelPartsExplorerProps {
  model: VehicleModel;
  onBack: () => void;
  onAddPart: () => void;
}

export const ModelPartsExplorer: React.FC<ModelPartsExplorerProps> = ({
  model,
  onBack,
  onAddPart,
}) => {
  const { currentUser } = useAuth();
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "updated">(
    "updated"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filters, setFilters] = useState<PartFilters>({
    category: "all",
    vehicleType: "all",
    modelYear: undefined,
    variant: undefined,
    supplier: undefined,
    priceMin: undefined,
    priceMax: undefined,
    inStockOnly: false,
    searchQuery: "",
  });

  useEffect(() => {
    loadParts();
    loadSuppliers();

    // Listen for real-time updates
    const cleanup1 = listenToEvent("PART_CREATED", () => loadParts());
    const cleanup2 = listenToEvent("PART_UPDATED", () => loadParts());
    const cleanup3 = listenToEvent("PART_DELETED", () => loadParts());
    const cleanup4 = listenToEvent("IMPORT_COMPLETE", () => {
      loadParts();
      showImportNotification();
    });

    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
      cleanup4();
    };
  }, [model.id]);

  const loadParts = () => {
    const allParts = getFromStorage("automotive_parts", []);
    setParts(
      allParts.filter(
        (p: AutoPart) =>
          p.modelId === model.id && p.workspaceId === currentUser?.workspaceId
      )
    );
  };

  const loadSuppliers = () => {
    const allSuppliers = getFromStorage("suppliers", []);
    setSuppliers(
      allSuppliers.filter(
        (s: Supplier) => s.workspaceId === currentUser?.workspaceId
      )
    );
  };

  const showImportNotification = () => {
    // This will be handled by a toast notification component
    emitEvent("SHOW_NOTIFICATION", {
      type: "success",
      message: "Parts imported successfully! Data refreshed automatically.",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      const allParts = getFromStorage("automotive_parts", []);
      saveToStorage(
        "automotive_parts",
        allParts.filter((p: AutoPart) => p.id !== id)
      );
      loadParts();
      emitEvent("PART_DELETED", { partId: id });
    }
  };

  const handleExport = () => {
    const csvData = filteredAndSortedParts.map((part) => ({
      "Part Name": part.name,
      SKU: part.sku,
      "Brand Part Number": part.brandPartNumber || "",
      Category: part.category,
      "Vehicle Type": part.vehicleType,
      Brand: part.brandName,
      Model: part.modelName,
      "Model Year": part.modelYear || "",
      Variant: part.variant || "",
      Price: part.price,
      MRP: part.mrp,
      Stock: part.stock,
      Supplier: part.supplierName || "",
      "Last Updated": new Date(part.updatedAt).toLocaleString(),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${model.brandName}_${model.name}_parts_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  // Apply filters
  const filteredParts = parts.filter((part) => {
    // Category filter
    if (filters.category !== "all" && part.category !== filters.category)
      return false;

    // Vehicle type filter
    if (
      filters.vehicleType !== "all" &&
      part.vehicleType !== filters.vehicleType
    )
      return false;

    // Model year filter
    if (filters.modelYear && part.modelYear !== filters.modelYear) return false;

    // Variant filter
    if (filters.variant && part.variant !== filters.variant) return false;

    // Supplier filter
    if (filters.supplier && part.supplierId !== filters.supplier) return false;

    // Price range filter
    if (filters.priceMin !== undefined && part.price < filters.priceMin)
      return false;
    if (filters.priceMax !== undefined && part.price > filters.priceMax)
      return false;

    // In stock filter
    if (filters.inStockOnly && part.stock <= 0) return false;

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = part.name.toLowerCase().includes(query);
      const matchesSKU = part.sku.toLowerCase().includes(query);
      const matchesBrandPart = part.brandPartNumber
        ?.toLowerCase()
        .includes(query);
      if (!matchesName && !matchesSKU && !matchesBrandPart) return false;
    }

    return true;
  });

  // Sort parts
  const filteredAndSortedParts = [...filteredParts].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = a.price - b.price;
        break;
      case "stock":
        comparison = a.stock - b.stock;
        break;
      case "updated":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Get unique years and variants for filters
  const availableYears = Array.from(
    new Set(parts.map((p) => p.modelYear).filter(Boolean))
  ).sort() as number[];

  const availableVariants = Array.from(
    new Set(parts.map((p) => p.variant).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>{model.brandName}</span>
              <span>→</span>
              <span className="text-gray-900 font-semibold">{model.name}</span>
            </div>
            {/* Title */}
            <h3 className="text-gray-900 text-3xl font-bold flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <span>Parts Inventory</span>
            </h3>
            {/* Subtitle */}
            <div className="flex items-center space-x-3 mt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  model.vehicleType === "two_wheeler"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {model.vehicleType === "two_wheeler" ? (
                  <Bike className="w-3 h-3" />
                ) : (
                  <Car className="w-3 h-3" />
                )}
                <span>
                  {model.vehicleType === "two_wheeler"
                    ? "2-Wheeler"
                    : "4-Wheeler"}
                </span>
              </span>
              <span className="text-gray-500 text-sm">
                {model.yearFrom} -{" "}
                {model.yearTo === new Date().getFullYear()
                  ? "Present"
                  : model.yearTo}
              </span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-900 font-semibold">
                {parts.length} Parts
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadParts}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onAddPart}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-blue-100 text-sm">Total Parts</p>
          <p className="text-3xl font-bold">{parts.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-green-100 text-sm">In Stock</p>
          <p className="text-3xl font-bold">
            {parts.filter((p) => p.stock > 0).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 opacity-80" />
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-purple-100 text-sm">Original Parts</p>
          <p className="text-3xl font-bold">
            {parts.filter((p) => p.category === "original").length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Box className="w-8 h-8 opacity-80" />
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-orange-100 text-sm">Local Parts</p>
          <p className="text-3xl font-bold">
            {parts.filter((p) => p.category === "local").length}
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                Advanced Filters
              </h4>
              <p className="text-gray-500 text-sm">
                Showing {filteredAndSortedParts.length} of {parts.length} parts
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-6 h-6 text-gray-600 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </div>

        {showFilters && (
          <div className="p-6 space-y-6">
            {/* First Row: Category & Vehicle Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <span>Category Type</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      setFilters({ ...filters, category: "local" })
                    }
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filters.category === "local"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    📦 Local
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, category: "original" })
                    }
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filters.category === "original"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    ✨ Original
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, category: "all" })}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filters.category === "all"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3 flex items-center space-x-2">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span>Vehicle Type</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      setFilters({ ...filters, vehicleType: "two_wheeler" })
                    }
                    className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
                      filters.vehicleType === "two_wheeler"
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>2W</span>
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, vehicleType: "four_wheeler" })
                    }
                    className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
                      filters.vehicleType === "four_wheeler"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>4W</span>
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, vehicleType: "all" })
                    }
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filters.vehicleType === "all"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            {/* Second Row: Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model Year */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span>Model Year</span>
                </label>
                <select
                  value={filters.modelYear || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      modelYear: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span>Variant</span>
                </label>
                <select
                  value={filters.variant || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      variant: e.target.value || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Variants</option>
                  {availableVariants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span>Supplier</span>
                </label>
                <select
                  value={filters.supplier || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      supplier: e.target.value || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Third Row: Price Range & Stock Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span>Min Price (Rs)</span>
                </label>
                <input
                  type="number"
                  value={filters.priceMin || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceMin: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span>Max Price (Rs)</span>
                </label>
                <input
                  type="number"
                  value={filters.priceMax || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceMax: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="10000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span>Availability</span>
                </label>
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      inStockOnly: !filters.inStockOnly,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                    filters.inStockOnly
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filters.inStockOnly ? "✓ In Stock Only" : "Show All"}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-600" />
                <span>Search Parts</span>
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                placeholder="Search by SKU, part name, brand part number..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  setFilters({
                    category: "all",
                    vehicleType: "all",
                    modelYear: undefined,
                    variant: undefined,
                    supplier: undefined,
                    priceMin: undefined,
                    priceMax: undefined,
                    inStockOnly: false,
                    searchQuery: "",
                  })
                }
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        {filteredAndSortedParts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No parts found
            </h3>
            <p className="text-gray-500 mb-4">
              {parts.length === 0
                ? "Add your first part to get started"
                : "Try adjusting your filters"}
            </p>
            <button
              onClick={onAddPart}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Part
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Image
                  </th>
                  <th
                    className="px-4 py-4 text-left text-gray-900 font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy("name");
                      setSortOrder(
                        sortBy === "name" && sortOrder === "asc"
                          ? "desc"
                          : "asc"
                      );
                    }}
                  >
                    Part Name{" "}
                    {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    SKU
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Brand Part #
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Type
                  </th>
                  <th
                    className="px-4 py-4 text-left text-gray-900 font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy("price");
                      setSortOrder(
                        sortBy === "price" && sortOrder === "asc"
                          ? "desc"
                          : "asc"
                      );
                    }}
                  >
                    Price{" "}
                    {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-4 text-left text-gray-900 font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy("stock");
                      setSortOrder(
                        sortBy === "stock" && sortOrder === "asc"
                          ? "desc"
                          : "asc"
                      );
                    }}
                  >
                    Stock{" "}
                    {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Supplier
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Last Updated
                  </th>
                  <th className="px-4 py-4 text-left text-gray-900 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedParts.map((part) => (
                  <tr
                    key={part.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{part.name}</p>
                      {part.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {part.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-900">
                      {part.sku}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-600">
                      {part.brandPartNumber || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          part.category === "original"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {part.category === "original"
                          ? "✨ Original"
                          : "📦 Local"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          part.vehicleType === "two_wheeler"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {part.vehicleType === "two_wheeler" ? "2W" : "4W"}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      Rs{part.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-semibold ${
                          part.stock > 10
                            ? "text-green-600"
                            : part.stock > 0
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {part.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {part.supplierName || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(part.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(part.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
};
