import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  Calendar,
  TrendingUp,
  Star,
  Car,
  Bike,
  RefreshCw,
  BarChart3,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { Brand } from "../../types/automotive";
import { listenToEvent } from "../../utils/eventBus";

export const BrandsDirectory: React.FC<{
  onSelectBrand: (brand: Brand) => void;
}> = ({ onSelectBrand }) => {
  const { currentUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<
    "two_wheeler" | "four_wheeler"
  >("two_wheeler");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "name" | "parts" | "vehicles" | "updated"
  >("name");
  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "two_wheeler" as "two_wheeler" | "four_wheeler",
    logo: "",
    description: "",
    country: "",
    website: "",
    established: "",
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const addBrandSectionRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBrands();

    // Listen for real-time updates
    const cleanup = listenToEvent("BRAND_UPDATED", () => {
      loadBrands();
    });

    return cleanup;
  }, []);

  const loadBrands = () => {
    const allBrands = getFromStorage("automotive_brands", []);
    setBrands(
      allBrands.filter(
        (b: Brand) => b.workspaceId === currentUser?.workspaceId,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allBrands = getFromStorage("automotive_brands", []);

    if (editingBrand) {
      // Update existing brand
      const updatedBrands = allBrands.map((b: Brand) =>
        b.id === editingBrand.id
          ? { ...b, ...formData, updatedAt: new Date().toISOString() }
          : b,
      );
      saveToStorage("automotive_brands", updatedBrands);
    } else {
      // Add new brand
      const newBrand: Brand = {
        id: `brand_${Date.now()}`,
        ...formData,
        totalParts: 0,
        totalVehicles: 0,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveToStorage("automotive_brands", [...allBrands, newBrand]);
    }

    setFormData({
      name: "",
      vehicleType: "two_wheeler",
      logo: "",
      description: "",
      country: "",
      website: "",
      established: "",
    });
    setIsAdding(false);
    setEditingBrand(null);
    loadBrands();
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      vehicleType: brand.vehicleType,
      logo: brand.logo || "",
      description: (brand as any).description || "",
      country: (brand as any).country || "",
      website: (brand as any).website || "",
      established: (brand as any).established || "",
    });
    setIsAdding(true);
  };

  const handleDelete = (brandId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this brand? All associated vehicles and parts will remain but will need to be reassigned.",
      )
    ) {
      const allBrands = getFromStorage("automotive_brands", []);
      saveToStorage(
        "automotive_brands",
        allBrands.filter((b: Brand) => b.id !== brandId),
      );
      loadBrands();
    }
  };

  // Filter and sort brands
  const filteredBrands = brands
    .filter((brand) => {
      const matchesVehicleType = brand.vehicleType === vehicleTypeFilter;
      const matchesSearch = brand.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesVehicleType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "parts":
          return (b.totalParts || 0) - (a.totalParts || 0);
        case "vehicles":
          return (b.totalVehicles || 0) - (a.totalVehicles || 0);
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });

  // Popular brands
  const popular2WBrands = [
    "Honda",
    "Hero",
    "Bajaj",
    "TVS",
    "Yamaha",
    "Suzuki",
    "Royal Enfield",
    "KTM",
    "Kawasaki",
    "Ducati",
    "Harley-Davidson",
    "Aprilia",
  ];
  const popular4WBrands = [
    "Maruti Suzuki",
    "Hyundai",
    "Tata",
    "Mahindra",
    "Kia",
    "Toyota",
    "Honda",
    "Volkswagen",
    "Ford",
    "Nissan",
    "Renault",
    "Skoda",
    "MG",
    "Jeep",
    "BMW",
    "Mercedes-Benz",
    "Audi",
  ];

  const quickAddBrand = (brandName: string) => {
    const allBrands = getFromStorage("automotive_brands", []);

    const exists = allBrands.some(
      (b: Brand) =>
        b.name === brandName &&
        b.vehicleType === vehicleTypeFilter &&
        b.workspaceId === currentUser?.workspaceId,
    );

    if (exists) {
      alert("Brand already exists!");
      return;
    }

    const newBrand: Brand = {
      id: `brand_${Date.now()}`,
      name: brandName,
      vehicleType: vehicleTypeFilter,
      totalParts: 0,
      totalVehicles: 0,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage("automotive_brands", [...allBrands, newBrand]);
    loadBrands();
  };

  const toggleBrandSelection = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName],
    );
  };

  const selectAllBrands = () => {
    const popularBrands =
      vehicleTypeFilter === "two_wheeler" ? popular2WBrands : popular4WBrands;
    const allBrands = getFromStorage("automotive_brands", []);

    // Only select brands that don't already exist
    const availableBrands = popularBrands.filter(
      (brandName) =>
        !allBrands.some(
          (b: Brand) =>
            b.name === brandName &&
            b.vehicleType === vehicleTypeFilter &&
            b.workspaceId === currentUser?.workspaceId,
        ),
    );

    setSelectedBrands(availableBrands);
  };

  const deselectAllBrands = () => {
    setSelectedBrands([]);
  };

  const addSelectedBrands = () => {
    if (selectedBrands.length === 0) {
      alert("Please select at least one brand to add.");
      return;
    }

    const allBrands = getFromStorage("automotive_brands", []);
    const newBrands: Brand[] = [];
    let skippedCount = 0;

    selectedBrands.forEach((brandName, index) => {
      const exists = allBrands.some(
        (b: Brand) =>
          b.name === brandName &&
          b.vehicleType === vehicleTypeFilter &&
          b.workspaceId === currentUser?.workspaceId,
      );

      if (!exists) {
        newBrands.push({
          id: `brand_${Date.now()}_${index}`,
          name: brandName,
          vehicleType: vehicleTypeFilter,
          totalParts: 0,
          totalVehicles: 0,
          workspaceId: currentUser?.workspaceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        skippedCount++;
      }
    });

    if (newBrands.length > 0) {
      saveToStorage("automotive_brands", [...allBrands, ...newBrands]);
      loadBrands();
      setSelectedBrands([]);

      const message = `Successfully added ${newBrands.length} brand(s)!${skippedCount > 0 ? ` (${skippedCount} already existed and were skipped)` : ""}`;
      alert(message);
    } else {
      alert("All selected brands already exist!");
    }
  };

  const exportBrands = () => {
    if (filteredBrands.length === 0) {
      alert("No brands to export. Please add brands first.");
      return;
    }

    const csvData = filteredBrands.map((brand) => ({
      "Brand Name": brand.name,
      "Vehicle Type":
        brand.vehicleType === "two_wheeler" ? "2-Wheeler" : "4-Wheeler",
      "Total Vehicles": brand.totalVehicles || 0,
      "Total Parts": brand.totalParts || 0,
      "Created Date": new Date(brand.createdAt).toLocaleDateString(),
      "Last Updated": new Date(brand.updatedAt).toLocaleDateString(),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brands_${vehicleTypeFilter}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Statistics
  const stats = {
    total2W: brands.filter((b) => b.vehicleType === "two_wheeler").length,
    total4W: brands.filter((b) => b.vehicleType === "four_wheeler").length,
    totalVehicles: brands.reduce((sum, b) => sum + (b.totalVehicles || 0), 0),
    totalParts: brands.reduce((sum, b) => sum + (b.totalParts || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold flex items-center space-x-3 mb-2">
              <Star className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
              <span>Brands Directory</span>
            </h3>
            <p className="text-blue-100 text-sm md:text-lg">
              Complete automotive brand and vehicle model management system
            </p>
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setTimeout(() => {
                addBrandSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 100);
            }}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 md:px-8 md:py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg transform hover:scale-105 font-bold"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            <span>Add New Brand</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Bike className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-blue-100">
                2-Wheeler Brands
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.total2W}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-blue-100">
                4-Wheeler Brands
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.total4W}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-blue-100">
                Total Models
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {stats.totalVehicles}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-blue-100">
                Total Parts
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.totalParts}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        <div className="p-4 md:p-6 space-y-4">
          {/* Row 1: Vehicle Type Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="bg-gray-100 rounded-xl p-1.5 md:p-2 flex md:inline-flex shadow-inner w-full md:w-auto">
              <button
                onClick={() => setVehicleTypeFilter("two_wheeler")}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all text-sm md:text-base ${
                  vehicleTypeFilter === "two_wheeler"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Bike className="w-4 h-4 md:w-5 md:h-5" />
                <span className="whitespace-nowrap">2-Wheeler</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] md:text-xs ${
                    vehicleTypeFilter === "two_wheeler"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.total2W}
                </span>
              </button>
              <button
                onClick={() => setVehicleTypeFilter("four_wheeler")}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all text-sm md:text-base ${
                  vehicleTypeFilter === "four_wheeler"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Car className="w-4 h-4 md:w-5 md:h-5" />
                <span className="whitespace-nowrap">4-Wheeler</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] md:text-xs ${
                    vehicleTypeFilter === "four_wheeler"
                      ? "bg-white/20"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {stats.total4W}
                </span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                onClick={exportBrands}
                className="flex-1 md:flex-none flex justify-center items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={loadBrands}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex-none"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Search and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands by name..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="parts">Sort by Parts Count</option>
                <option value="vehicles">Sort by Vehicles Count</option>
                <option value="updated">Sort by Last Updated</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-gray-900 font-bold text-lg">
                    Showing {filteredBrands.length} of{" "}
                    {
                      brands.filter((b) => b.vehicleType === vehicleTypeFilter)
                        .length
                    }{" "}
                    brands
                  </p>
                  <p className="text-gray-600 text-sm">
                    {vehicleTypeFilter === "two_wheeler"
                      ? "🏍️ 2-Wheeler brands"
                      : "🚗 4-Wheeler brands"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Add/Edit Brand Form */}
      {isAdding && (
        <div
          ref={addBrandSectionRef}
          className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-2xl scroll-mt-24"
        >
          <h4 className="font-bold text-gray-900 text-2xl mb-6 flex items-center space-x-2">
            {editingBrand ? (
              <Edit2 className="w-7 h-7 text-blue-600" />
            ) : (
              <Plus className="w-7 h-7 text-blue-600" />
            )}
            <span>{editingBrand ? "Edit Brand" : "Add New Brand"}</span>
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Honda, TVS, Hyundai"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as
                        | "two_wheeler"
                        | "four_wheeler",
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                >
                  <option value="two_wheeler">2-Wheeler</option>
                  <option value="four_wheeler">4-Wheeler</option>
                </select>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g., India, Japan, USA"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.established}
                  onChange={(e) =>
                    setFormData({ ...formData, established: e.target.value })
                  }
                  placeholder="e.g., 1948"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description about this brand..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-lg"
              >
                {editingBrand ? "Update Brand" : "Add Brand"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingBrand(null);
                  setFormData({
                    name: "",
                    vehicleType: "two_wheeler",
                    logo: "",
                    description: "",
                    country: "",
                    website: "",
                    established: "",
                  });
                }}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Add Popular Brands */}
      {filteredBrands.length === 0 && !searchQuery && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-4 md:p-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
            <h4 className="font-bold text-gray-900 text-lg md:text-xl flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600 shrink-0" />
              <span>
                Quick Add Popular{" "}
                {vehicleTypeFilter === "two_wheeler"
                  ? "2-Wheeler"
                  : "4-Wheeler"}{" "}
                Brands
              </span>
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600 font-semibold w-full sm:w-auto text-center sm:text-left">
                {selectedBrands.length} selected
              </span>
              <div className="flex flex-1 sm:flex-none gap-2 w-full sm:w-auto">
                <button
                  onClick={selectAllBrands}
                  className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-bold whitespace-nowrap"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllBrands}
                  className="flex-1 sm:flex-none px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs md:text-sm font-bold whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={addSelectedBrands}
                disabled={selectedBrands.length === 0}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all shadow-md ${
                  selectedBrands.length > 0
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add Selected ({selectedBrands.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {(vehicleTypeFilter === "two_wheeler"
              ? popular2WBrands
              : popular4WBrands
            ).map((brandName) => {
              const isSelected = selectedBrands.includes(brandName);
              const allBrands = getFromStorage("automotive_brands", []);
              const alreadyExists = allBrands.some(
                (b: Brand) =>
                  b.name === brandName &&
                  b.vehicleType === vehicleTypeFilter &&
                  b.workspaceId === currentUser?.workspaceId,
              );

              return (
                <div
                  key={brandName}
                  onClick={() =>
                    !alreadyExists && toggleBrandSelection(brandName)
                  }
                  className={`relative px-4 py-3 rounded-xl transition-all text-gray-900 font-bold text-center cursor-pointer ${
                    alreadyExists
                      ? "bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-2 border-blue-600 shadow-lg transform scale-105"
                        : "bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {!alreadyExists && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrandSelection(brandName)}
                      className="absolute top-2 right-2 w-5 h-5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {alreadyExists && (
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      ✓
                    </span>
                  )}
                  <div className="mt-2">{brandName}</div>
                  {alreadyExists && (
                    <div className="text-xs mt-1 text-gray-500">
                      Already added
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedBrands.length > 0 && (
            <div className="mt-6 p-4 bg-blue-100 border-2 border-blue-300 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900 text-lg">
                    {selectedBrands.length} brand
                    {selectedBrands.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    {selectedBrands.join(", ")}
                  </p>
                </div>
                <button
                  onClick={addSelectedBrands}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold text-lg transform hover:scale-105"
                >
                  Add All Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Brands Grid */}
      {filteredBrands.length === 0 && searchQuery ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
          <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No brands found
          </h3>
          <p className="text-gray-500 text-lg">
            Try adjusting your search or add a new brand
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              {/* Brand Header */}
              <div
                className={`p-6 ${
                  brand.vehicleType === "two_wheeler"
                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl font-bold shadow-lg"
                    style={{
                      color:
                        brand.vehicleType === "two_wheeler"
                          ? "#f97316"
                          : "#3b82f6",
                    }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center space-x-1">
                    {brand.vehicleType === "two_wheeler" ? (
                      <Bike className="w-3 h-3" />
                    ) : (
                      <Car className="w-3 h-3" />
                    )}
                    <span>
                      {brand.vehicleType === "two_wheeler" ? "2W" : "4W"}
                    </span>
                  </span>
                </div>
                <h4 className="text-white font-bold text-2xl mb-1">
                  {brand.name}
                </h4>
                {(brand as any).country && (
                  <p className="text-white/80 text-sm">
                    📍 {(brand as any).country}
                  </p>
                )}
              </div>

              {/* Brand Stats */}
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {brand.totalParts || 0}
                    </p>
                    <p className="text-xs text-gray-600">Parts</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Car className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {brand.totalVehicles || 0}
                    </p>
                    <p className="text-xs text-gray-600">Models</p>
                  </div>
                </div>

                {(brand as any).description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {(brand as any).description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <span>Updated:</span>
                  <span>{new Date(brand.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBrand(brand);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(brand);
                  }}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(brand.id);
                  }}
                  className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
