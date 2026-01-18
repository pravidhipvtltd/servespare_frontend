import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, ChevronDown, Filter } from 'lucide-react';

export interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  rating: number | null;
  availability: 'all' | 'inStock' | 'outOfStock';
  sortBy: 'relevance' | 'priceLowToHigh' | 'priceHighToLow' | 'rating' | 'newest' | 'popular';
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  totalResults?: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  categories,
  totalResults
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      priceRange: { min: 0, max: 100000 },
      rating: null,
      availability: 'all',
      sortBy: 'relevance'
    };
    setTempFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = 
    tempFilters.categories.length +
    (tempFilters.rating ? 1 : 0) +
    (tempFilters.availability !== 'all' ? 1 : 0);

  return (
    <div className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar and Filter Button */}
        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for auto parts, categories, brands..."
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:text-purple-600 transition-colors font-semibold flex items-center space-x-2 relative"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-colors font-semibold cursor-pointer"
          >
            <option value="relevance">Most Relevant</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Results Count */}
        {totalResults !== undefined && (
          <div className="mt-3 text-sm text-gray-600">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            {searchQuery && (
              <span> for "<span className="font-semibold text-gray-900">{searchQuery}</span>"</span>
            )}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Categories</span>
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={tempFilters.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempFilters({
                                ...tempFilters,
                                categories: [...tempFilters.categories, category]
                              });
                            } else {
                              setTempFilters({
                                ...tempFilters,
                                categories: tempFilters.categories.filter(c => c !== category)
                              });
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Price Range (NPR)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Min Price</label>
                      <input
                        type="number"
                        value={tempFilters.priceRange.min}
                        onChange={(e) => setTempFilters({
                          ...tempFilters,
                          priceRange: { ...tempFilters.priceRange, min: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Max Price</label>
                      <input
                        type="number"
                        value={tempFilters.priceRange.max}
                        onChange={(e) => setTempFilters({
                          ...tempFilters,
                          priceRange: { ...tempFilters.priceRange, max: parseInt(e.target.value) || 100000 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        placeholder="100000"
                      />
                    </div>
                    {/* Quick Price Filters */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { label: 'Under 1K', max: 1000 },
                        { label: '1K - 5K', min: 1000, max: 5000 },
                        { label: '5K - 10K', min: 5000, max: 10000 },
                        { label: '10K+', min: 10000, max: 100000 }
                      ].map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setTempFilters({
                            ...tempFilters,
                            priceRange: { min: range.min || 0, max: range.max }
                          })}
                          className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-purple-50 hover:border-purple-600 hover:text-purple-600 transition-colors"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="radio"
                          name="rating"
                          checked={tempFilters.rating === rating}
                          onChange={() => setTempFilters({ ...tempFilters, rating })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex items-center space-x-1">
                          {[...Array(rating)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-700 ml-1">& up</span>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name="rating"
                        checked={tempFilters.rating === null}
                        onChange={() => setTempFilters({ ...tempFilters, rating: null })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">Any Rating</span>
                    </label>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Products' },
                      { value: 'inStock', label: 'In Stock Only' },
                      { value: 'outOfStock', label: 'Out of Stock' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="radio"
                          name="availability"
                          checked={tempFilters.availability === option.value}
                          onChange={() => setTempFilters({ ...tempFilters, availability: option.value as any })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <button
                  onClick={handleResetFilters}
                  className="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Clear All</span>
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
