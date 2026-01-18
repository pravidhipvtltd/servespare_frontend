import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Package, Star, Bike, Car, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage } from '../../utils/mockData';
import { InventoryItem } from '../../types';

interface FilterState {
  category: 'local' | 'original' | 'all';
  vehicleType: '2w' | '4w' | 'all';
  searchTerm: string;
}

interface InventoryFilterPanelProps {
  onFilterChange: (filteredItems: InventoryItem[]) => void;
  refreshTrigger?: number; // External trigger to force refresh
}

export const InventoryFilterPanel: React.FC<InventoryFilterPanelProps> = ({
  onFilterChange,
  refreshTrigger = 0,
}) => {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    category: 'local', // Default: Local
    vehicleType: 'all', // Default: All
    searchTerm: '',
  });
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters and update parent component
  const applyFilters = () => {
    setIsRefreshing(true);
    
    const allInventory: InventoryItem[] = getFromStorage('inventory', []);
    const workspaceInventory = allInventory.filter(
      (item) => item.workspaceId === currentUser?.workspaceId
    );

    let filtered = [...workspaceInventory];

    // Filter by category (local/original)
    if (filters.category !== 'all') {
      filtered = filtered.filter((item) => {
        const itemCategory = item.category?.toLowerCase() || '';
        
        if (filters.category === 'local') {
          // Local includes: 'local', 'branded', or anything not 'original'
          return itemCategory === 'local' || itemCategory === 'branded' || 
                 (itemCategory !== 'original' && itemCategory !== '');
        } else if (filters.category === 'original') {
          // Original only
          return itemCategory === 'original';
        }
        return true;
      });
    }

    // Filter by vehicle type (2w/4w)
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter((item) => {
        const vehicleType = item.vehicleType?.toLowerCase() || '';
        
        if (filters.vehicleType === '2w') {
          return vehicleType === 'two_wheeler' || vehicleType === '2w';
        } else if (filters.vehicleType === '4w') {
          return vehicleType === 'four_wheeler' || vehicleType === '4w';
        }
        return true;
      });
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.partNumber?.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower) ||
          item.bikeName?.toLowerCase().includes(searchLower)
      );
    }

    setTotalItems(workspaceInventory.length);
    setFilteredCount(filtered.length);
    onFilterChange(filtered);
    
    setTimeout(() => setIsRefreshing(false), 300);
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, currentUser, refreshTrigger]);

  // Listen for import completion events
  useEffect(() => {
    const handleImportComplete = () => {
      console.log('📥 IMPORT_COMPLETE event received - Auto-refreshing filters');
      applyFilters();
    };

    const handleItemUpdated = () => {
      console.log('🔄 ITEM_UPDATED event received - Auto-refreshing filters');
      applyFilters();
    };

    window.addEventListener('IMPORT_COMPLETE', handleImportComplete);
    window.addEventListener('ITEM_UPDATED', handleItemUpdated);

    return () => {
      window.removeEventListener('IMPORT_COMPLETE', handleImportComplete);
      window.removeEventListener('ITEM_UPDATED', handleItemUpdated);
    };
  }, [filters, currentUser]);

  const handleCategoryChange = (category: 'local' | 'original' | 'all') => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleVehicleTypeChange = (vehicleType: '2w' | '4w' | 'all') => {
    setFilters((prev) => ({ ...prev, vehicleType }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const handleReset = () => {
    setFilters({
      category: 'local',
      vehicleType: 'all',
      searchTerm: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'local' ||
    filters.vehicleType !== 'all' ||
    filters.searchTerm !== '';

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xl">Smart Filters</h3>
            <p className="text-gray-500 text-sm">
              Filter by category and vehicle type
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter - Local/Original */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          📦 Category Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleCategoryChange('local')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.category === 'local'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Local</span>
          </button>
          <button
            onClick={() => handleCategoryChange('original')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.category === 'original'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Original</span>
          </button>
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.category === 'all'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Vehicle Type Filter - 2W/4W */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          🚗 Vehicle Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleVehicleTypeChange('2w')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.vehicleType === '2w'
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bike className="w-5 h-5" />
            <span>2 Wheeler</span>
          </button>
          <button
            onClick={() => handleVehicleTypeChange('4w')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.vehicleType === '4w'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Car className="w-5 h-5" />
            <span>4 Wheeler</span>
          </button>
          <button
            onClick={() => handleVehicleTypeChange('all')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              filters.vehicleType === 'all'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          🔍 Search Items
        </label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, part number, barcode..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isRefreshing ? (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <div>
              <p className="text-gray-900 font-semibold">
                Showing {filteredCount} of {totalItems} items
              </p>
              <p className="text-gray-600 text-sm">
                {filters.category === 'local' && '📦 Local items'}
                {filters.category === 'original' && '✨ Original items'}
                {filters.category === 'all' && '🔄 All categories'}
                {' • '}
                {filters.vehicleType === '2w' && '🏍️ Two-wheelers only'}
                {filters.vehicleType === '4w' && '🚗 Four-wheelers only'}
                {filters.vehicleType === 'all' && '🚀 All vehicles'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-gray-600 text-sm font-semibold">
            Active Filters:
          </span>
          {filters.category !== 'local' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {filters.category === 'original' ? '✨ Original' : '🔄 All Categories'}
            </span>
          )}
          {filters.vehicleType !== 'all' && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {filters.vehicleType === '2w' ? '🏍️ 2W' : '🚗 4W'}
            </span>
          )}
          {filters.searchTerm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              🔍 "{filters.searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Import CheckCircle icon
import { CheckCircle } from 'lucide-react';
