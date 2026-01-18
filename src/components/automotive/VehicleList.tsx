import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Car, Calendar, Tag, Package, Edit2, Trash2, Bike } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { Brand, VehicleModel } from '../../types/automotive';
import { Pagination } from '../common/Pagination';

interface VehicleListProps {
  brand: Brand;
  onBack: () => void;
  onSelectModel: (model: VehicleModel) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ brand, onBack, onSelectModel }) => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [formData, setFormData] = useState({
    name: '',
    yearFrom: new Date().getFullYear() - 5,
    yearTo: new Date().getFullYear(),
    variants: [] as string[],
    variantInput: ''
  });

  useEffect(() => {
    loadVehicles();
  }, [brand.id]);

  const loadVehicles = () => {
    const allVehicles = getFromStorage('automotive_vehicles', []);
    setVehicles(
      allVehicles.filter(
        (v: VehicleModel) => 
          v.brandId === brand.id && 
          v.workspaceId === currentUser?.workspaceId
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allVehicles = getFromStorage('automotive_vehicles', []);

    const newVehicle: VehicleModel = {
      id: `vehicle_${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      name: formData.name,
      vehicleType: brand.vehicleType,
      yearFrom: formData.yearFrom,
      yearTo: formData.yearTo,
      variants: formData.variants,
      totalParts: 0,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage('automotive_vehicles', [...allVehicles, newVehicle]);
    
    // Update brand's total vehicles count
    const allBrands = getFromStorage('automotive_brands', []);
    const updatedBrands = allBrands.map((b: Brand) =>
      b.id === brand.id ? { ...b, totalVehicles: (b.totalVehicles || 0) + 1 } : b
    );
    saveToStorage('automotive_brands', updatedBrands);

    setFormData({ name: '', yearFrom: new Date().getFullYear() - 5, yearTo: new Date().getFullYear(), variants: [], variantInput: '' });
    setIsAdding(false);
    loadVehicles();
  };

  const handleAddVariant = () => {
    if (formData.variantInput.trim() && !formData.variants.includes(formData.variantInput.trim())) {
      setFormData({
        ...formData,
        variants: [...formData.variants, formData.variantInput.trim()],
        variantInput: ''
      });
    }
  };

  const handleRemoveVariant = (variant: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v !== variant)
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle model?')) {
      const allVehicles = getFromStorage('automotive_vehicles', []);
      saveToStorage('automotive_vehicles', allVehicles.filter((v: VehicleModel) => v.id !== id));
      
      // Update brand's total vehicles count
      const allBrands = getFromStorage('automotive_brands', []);
      const updatedBrands = allBrands.map((b: Brand) =>
        b.id === brand.id ? { ...b, totalVehicles: Math.max(0, (b.totalVehicles || 0) - 1) } : b
      );
      saveToStorage('automotive_brands', updatedBrands);
      
      loadVehicles();
    }
  };

  // Filter and paginate
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

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
            {/* Brand Logo */}
            <div className="flex items-center space-x-4 mb-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                brand.vehicleType === 'two_wheeler'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
                {brand.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-gray-900 text-3xl font-bold">{brand.name}</h3>
                <p className="text-gray-500 flex items-center space-x-2">
                  {brand.vehicleType === 'two_wheeler' ? (
                    <><Bike className="w-4 h-4" /><span>2-Wheeler</span></>
                  ) : (
                    <><Car className="w-4 h-4" /><span>4-Wheeler</span></>
                  )}
                  <span>•</span>
                  <span>{vehicles.length} Models</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle Model</span>
        </button>
      </div>

      {/* Add Vehicle Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-xl">
          <h4 className="font-bold text-gray-900 text-xl mb-4">Add New Vehicle Model</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Apache RTR 160, Jupiter, City, Creta"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Year From
                </label>
                <input
                  type="number"
                  value={formData.yearFrom}
                  onChange={(e) => setFormData({ ...formData, yearFrom: parseInt(e.target.value) })}
                  min="1990"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Year To
                </label>
                <input
                  type="number"
                  value={formData.yearTo}
                  onChange={(e) => setFormData({ ...formData, yearTo: parseInt(e.target.value) })}
                  min={formData.yearFrom}
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Variants (Optional)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={formData.variantInput}
                  onChange={(e) => setFormData({ ...formData, variantInput: e.target.value })}
                  placeholder="e.g., STD, Disc, BS6, FI"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariant())}
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold"
                >
                  Add
                </button>
              </div>
              {formData.variants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.variants.map(variant => (
                    <span
                      key={variant}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center space-x-1"
                    >
                      <span>{variant}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Model
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vehicle models..."
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Vehicle Cards Grid */}
      {paginatedVehicles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicle models yet</h3>
          <p className="text-gray-500 mb-4">Add your first vehicle model to get started</p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add Vehicle Model
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => onSelectModel(vehicle)}
              >
                {/* Model Name */}
                <h4 className="font-bold text-gray-900 text-xl mb-3">{vehicle.name}</h4>

                {/* Year Range */}
                <div className="flex items-center space-x-2 text-gray-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {vehicle.yearFrom} - {vehicle.yearTo === new Date().getFullYear() ? 'Present' : vehicle.yearTo}
                  </span>
                </div>

                {/* Variants */}
                {vehicle.variants && vehicle.variants.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-semibold">Variants:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.variants.slice(0, 3).map(variant => (
                        <span
                          key={variant}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          {variant}
                        </span>
                      ))}
                      {vehicle.variants.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                          +{vehicle.variants.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Parts Count */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600 text-sm flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>Parts Available:</span>
                  </span>
                  <span className="font-bold text-gray-900 text-lg">{vehicle.totalParts || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectModel(vehicle);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    View Parts
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(vehicle.id);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
