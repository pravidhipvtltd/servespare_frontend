import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  DollarSign,
  Hash,
  Box,
  FileText,
  Image as ImageIcon,
  User,
  Bike,
  Car,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import {
  Brand,
  VehicleModel,
  AutoPart,
  Supplier,
} from "../../types/automotive";
import { emitEvent } from "../../utils/eventBus";

interface ManualAddPartProps {
  onBack: () => void;
  onSuccess: () => void;
  preselectedBrand?: Brand;
  preselectedModel?: VehicleModel;
}

export const ManualAddPart: React.FC<ManualAddPartProps> = ({
  onBack,
  onSuccess,
  preselectedBrand,
  preselectedModel,
}) => {
  const { currentUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    sku: "",
    brandPartNumber: "",
    description: "",

    // Category & Type
    category: "local" as "local" | "original",
    vehicleType:
      preselectedModel?.vehicleType ||
      ("two_wheeler" as "two_wheeler" | "four_wheeler"),

    // Brand & Model (Cascading)
    brandId: preselectedBrand?.id || "",
    modelId: preselectedModel?.id || "",
    modelYear: undefined as number | undefined,
    variant: "",

    // Pricing
    price: "",
    mrp: "",

    // Stock
    stock: "",

    // Supplier
    supplierId: "",

    // Image
    image: "",
  });

  useEffect(() => {
    loadBrands();
    loadSuppliers();
  }, []);

  useEffect(() => {
    // Load vehicles when brand or vehicle type changes
    if (formData.brandId) {
      loadVehiclesForBrand(formData.brandId);
    } else {
      setVehicles([]);
    }
  }, [formData.brandId, formData.vehicleType]);

  const loadBrands = () => {
    const allBrands = getFromStorage("automotive_brands", []);
    setBrands(
      allBrands.filter((b: Brand) => b.workspaceId === currentUser?.workspaceId)
    );
  };

  const loadVehiclesForBrand = (brandId: string) => {
    const allVehicles = getFromStorage("automotive_vehicles", []);
    setVehicles(
      allVehicles.filter(
        (v: VehicleModel) =>
          v.brandId === brandId &&
          v.vehicleType === formData.vehicleType &&
          v.workspaceId === currentUser?.workspaceId
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Part name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.brandId) newErrors.brandId = "Brand is required";
    if (!formData.modelId) newErrors.modelId = "Model is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const allParts = getFromStorage("automotive_parts", []);
    const selectedBrand = brands.find((b) => b.id === formData.brandId);
    const selectedModel = vehicles.find((v) => v.id === formData.modelId);
    const selectedSupplier = suppliers.find(
      (s) => s.id === formData.supplierId
    );

    const newPart: AutoPart = {
      id: `part_${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      brandPartNumber: formData.brandPartNumber || undefined,
      category: formData.category,
      vehicleType: formData.vehicleType,
      brandId: formData.brandId,
      brandName: selectedBrand?.name || "",
      modelId: formData.modelId,
      modelName: selectedModel?.name || "",
      modelYear: formData.modelYear,
      variant: formData.variant || undefined,
      price: parseFloat(formData.price),
      mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price),
      stock: parseInt(formData.stock),
      supplierId: formData.supplierId || undefined,
      supplierName: selectedSupplier?.name,
      image: formData.image || undefined,
      description: formData.description || undefined,
      inStock: parseInt(formData.stock) > 0,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage("automotive_parts", [...allParts, newPart]);

    // Update brand and model part counts
    const allBrands = getFromStorage("automotive_brands", []);
    const updatedBrands = allBrands.map((b: Brand) =>
      b.id === formData.brandId
        ? { ...b, totalParts: (b.totalParts || 0) + 1 }
        : b
    );
    saveToStorage("automotive_brands", updatedBrands);

    const allModels = getFromStorage("automotive_vehicles", []);
    const updatedModels = allModels.map((m: VehicleModel) =>
      m.id === formData.modelId
        ? { ...m, totalParts: (m.totalParts || 0) + 1 }
        : m
    );
    saveToStorage("automotive_vehicles", updatedModels);

    // Emit events
    emitEvent("PART_CREATED", { part: newPart });
    emitEvent("SHOW_NOTIFICATION", {
      type: "success",
      message: `Part "${formData.name}" added successfully!`,
    });

    onSuccess();
  };

  const handleBrandChange = (brandId: string) => {
    setFormData({
      ...formData,
      brandId,
      modelId: "", // Reset model when brand changes
    });
  };

  const selectedBrand = brands.find((b) => b.id === formData.brandId);
  const selectedModel = vehicles.find((v) => v.id === formData.modelId);
  const availableVariants = selectedModel?.variants || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h3 className="text-gray-900 text-3xl font-bold flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <span>Add New Part</span>
            </h3>
            <p className="text-gray-500 mt-1">
              Manually add a new automotive part to your inventory
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg space-y-8"
      >
        {/* Section 1: Basic Information */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Basic Information</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Part Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Brake Pad Set, Engine Oil Filter"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="e.g., BP-TVS-RTR160-001"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sku ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Brand Part Number (Optional)
              </label>
              <input
                type="text"
                value={formData.brandPartNumber}
                onChange={(e) =>
                  setFormData({ ...formData, brandPartNumber: e.target.value })
                }
                placeholder="e.g., 12345-ABC-XYZ"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the part..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Category & Vehicle Type */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
            <Tag className="w-6 h-6 text-purple-600" />
            <span>Category & Vehicle Type</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                Category Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: "local" })
                  }
                  className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                    formData.category === "local"
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📦 Local
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: "original" })
                  }
                  className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                    formData.category === "original"
                      ? "bg-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ✨ Original
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      vehicleType: "two_wheeler",
                      brandId: "",
                      modelId: "",
                    })
                  }
                  className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    formData.vehicleType === "two_wheeler"
                      ? "bg-orange-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <span>2-Wheeler</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      vehicleType: "four_wheeler",
                      brandId: "",
                      modelId: "",
                    })
                  }
                  className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                    formData.vehicleType === "four_wheeler"
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Car className="w-5 h-5" />
                  <span>4-Wheeler</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Brand & Model (Cascading) */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
            <Box className="w-6 h-6 text-green-600" />
            <span>Brand & Model Selection</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brandId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Brand</option>
                {brands
                  .filter((b) => b.vehicleType === formData.vehicleType)
                  .map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
              </select>
              {errors.brandId && (
                <p className="text-red-500 text-sm mt-1">{errors.brandId}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Vehicle Model <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.modelId}
                onChange={(e) =>
                  setFormData({ ...formData, modelId: e.target.value })
                }
                disabled={!formData.brandId}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.modelId ? "border-red-500" : "border-gray-300"
                } ${!formData.brandId ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">Select Model</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
              {errors.modelId && (
                <p className="text-red-500 text-sm mt-1">{errors.modelId}</p>
              )}
              {!formData.brandId && (
                <p className="text-gray-500 text-sm mt-1">
                  Select a brand first
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Model Year (Optional)
              </label>
              <input
                type="number"
                value={formData.modelYear || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    modelYear: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="e.g., 2023"
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Variant (Optional)
              </label>
              {availableVariants.length > 0 ? (
                <select
                  value={formData.variant}
                  onChange={(e) =>
                    setFormData({ ...formData, variant: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Variant</option>
                  {availableVariants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) =>
                    setFormData({ ...formData, variant: e.target.value })
                  }
                  placeholder="e.g., STD, Disc, BS6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Pricing & Stock */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
            <DollarSign className="w-6 h-6 text-yellow-600" />
            <span>Pricing & Stock</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Purchase Price (Rs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                MRP (Rs) (Optional)
              </label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) =>
                  setFormData({ ...formData, mrp: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
                min="0"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Supplier */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
            <User className="w-6 h-6 text-indigo-600" />
            <span>Supplier Information</span>
          </h4>
          <div className="mt-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Supplier (Optional)
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold text-lg"
          >
            <Save className="w-6 h-6" />
            <span>Save & Add Part</span>
          </button>
        </div>
      </form>
    </div>
  );
};
