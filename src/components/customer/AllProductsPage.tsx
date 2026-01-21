import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  ShoppingCart,
  Eye,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Package,
  Heart,
  Car,
  Bike,
  Shield,
  Tag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "../common/Pagination";

interface Product {
  id: string;
  name: string;
  category: string;
  vehicleType: "two-wheeler" | "four-wheeler" | "both";
  partType: "original" | "local";
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  inStock: boolean;
  description?: string;
}

interface AllProductsPageProps {
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  onBack?: () => void;
}

// Products will be fetched from backend API
// Removed static allProducts array

const categories = [
  "All",
  "Engine Parts",
  "Brakes",
  "Lighting",
  "Suspension",
  "Wheels & Tires",
  "Oils & Fluids",
  "Electronics",
  "Accessories",
];

export const AllProductsPage: React.FC<AllProductsPageProps> = ({
  onAddToCart,
  onViewProduct,
  onBack,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vehicleType, setVehicleType] = useState<
    "all" | "two-wheeler" | "four-wheeler"
  >("all");
  const [partType, setPartType] = useState<"all" | "original" | "local">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "rating"
  >("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (product: Product, quantity: number) => {
    setAddingToCart(product.id);
    if (onAddToCart) {
      await onAddToCart(product, quantity);
    }
    setAddingToCart(null);
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {
          "ngrok-skip-browser-warning": "true",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stock-management/inventory/?page=${currentPage}`,
          { headers },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        // Calculate total pages from count
        const pageSize = 20; // Backend sends 20 items per page
        const calculatedTotalPages = Math.ceil((data.count || 0) / pageSize);
        setTotalPages(calculatedTotalPages);
        setTotalCount(data.count || 0);

        const mappedProducts: Product[] = data.results.map((item: any) => {
          const images = Array.isArray(item.images) ? item.images : [];
          const primaryImage = images.find((img: any) => img.is_primary)?.image;
          const displayImage = primaryImage || images[0]?.image;

          console.log(
            "Product:",
            item.item_name,
            "Images:",
            images,
            "Display Image:",
            displayImage,
          );

          return {
            id: String(item.id),
            name: item.item_name,
            category: item.category,
            vehicleType:
              item.vehicle_type === "two_wheeler"
                ? "two-wheeler"
                : item.vehicle_type === "four_wheeler"
                  ? "four-wheeler"
                  : "both",
            partType: item.item_type === "original" ? "original" : "local",
            price: parseFloat(item.price) || 0,
            originalPrice: parseFloat(item.mrp) || 0,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 10,
            image: displayImage,
            badge: item.is_low_stock ? "Low Stock" : "New",
            inStock: !item.is_low_stock,
            description: item.description || "",
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesVehicleType =
        vehicleType === "all" ||
        product.vehicleType === vehicleType ||
        product.vehicleType === "both";
      const matchesPartType =
        partType === "all" || product.partType === partType;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesVehicleType &&
        matchesPartType &&
        matchesPrice &&
        matchesRating
      );
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [
    products,
    searchQuery,
    selectedCategory,
    vehicleType,
    partType,
    priceRange,
    minRating,
    sortBy,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              className="flex items-center space-x-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl text-white mb-4"
          >
            All Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg"
          >
            Browse our complete collection of auto parts
          </motion.p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow text-amber-600"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow text-amber-600"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {showFilters && <X className="w-4 h-4" />}
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <FilterContent
                  vehicleType={vehicleType}
                  setVehicleType={setVehicleType}
                  partType={partType}
                  setPartType={setPartType}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" />
                Filters
              </h3>
              <FilterContent
                vehicleType={vehicleType}
                setVehicleType={setVehicleType}
                partType={partType}
                setPartType={setPartType}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="md:col-span-3">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing{" "}
                <span className="text-gray-900">{filteredProducts.length}</span>{" "}
                of <span className="text-gray-900">{totalCount}</span> products
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onAddToCart={handleAddToCart}
                    onViewProduct={onViewProduct}
                    hoveredProduct={hoveredProduct}
                    setHoveredProduct={setHoveredProduct}
                    addingToCart={addingToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    index={index}
                    onAddToCart={handleAddToCart}
                    onViewProduct={onViewProduct}
                    addingToCart={addingToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Content Component
const FilterContent: React.FC<{
  vehicleType: "all" | "two-wheeler" | "four-wheeler";
  setVehicleType: (type: "all" | "two-wheeler" | "four-wheeler") => void;
  partType: "all" | "original" | "local";
  setPartType: (type: "all" | "original" | "local") => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
}> = ({
  vehicleType,
  setVehicleType,
  partType,
  setPartType,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
}) => {
  return (
    <div className="space-y-6">
      {/* Vehicle Type */}
      <div>
        <label className="block text-sm text-gray-700 mb-3">Vehicle Type</label>
        <div className="space-y-2">
          <button
            onClick={() => setVehicleType("all")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              vehicleType === "all"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-sm text-gray-700">All</span>
          </button>
          <button
            onClick={() => setVehicleType("two-wheeler")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              vehicleType === "two-wheeler"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-sm text-gray-700">Two-Wheeler</span>
          </button>
          <button
            onClick={() => setVehicleType("four-wheeler")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              vehicleType === "four-wheeler"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-sm text-gray-700">Four-Wheeler</span>
          </button>
        </div>
      </div>

      {/* Part Type */}
      <div>
        <label className="block text-sm text-gray-700 mb-3">Part Type</label>
        <div className="space-y-2">
          <button
            onClick={() => setPartType("all")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              partType === "all"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm text-gray-700">All</span>
          </button>
          <button
            onClick={() => setPartType("original")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              partType === "original"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm text-gray-700">Original</span>
          </button>
          <button
            onClick={() => setPartType("local")}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              partType === "local"
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm text-gray-700">Local</span>
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm text-gray-700 mb-3">Price Range</label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="25000"
            step="500"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], parseInt(e.target.value)])
            }
            className="w-full accent-amber-600"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">NPR 0</span>
            <span className="text-amber-600">
              NPR {priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm text-gray-700 mb-3">
          Minimum Rating
        </label>
        <div className="space-y-2">
          {[4, 3, 2, 1, 0].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                minRating === rating
                  ? "bg-amber-50 border border-amber-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700">
                {rating > 0 ? `${rating}+ stars` : "All"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{
  product: Product;
  index: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  hoveredProduct: string | null;
  setHoveredProduct: (id: string | null) => void;
  addingToCart: string | null;
}> = ({
  product,
  index,
  onAddToCart,
  onViewProduct,
  hoveredProduct,
  setHoveredProduct,
  addingToCart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-amber-200"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs text-white shadow-lg ${
                product.badge === "Hot"
                  ? "bg-red-500"
                  : product.badge === "New"
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
            -
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100,
            )}
            %
          </div>
        )}

        {/* Quick Actions */}
        <AnimatePresence>
          {hoveredProduct === product.id && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-4 bottom-4 flex gap-2"
            >
              <button
                onClick={() => onAddToCart(product, 1)}
                disabled={addingToCart === product.id}
                className={`flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  addingToCart === product.id ? "cursor-wait opacity-90" : ""
                }`}
              >
                {addingToCart === product.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Add to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={() => onViewProduct(product)}
                className="bg-white text-gray-900 p-3 rounded-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                <Eye className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs text-amber-600 mb-2 uppercase tracking-wider">
          {product.category}
        </p>
        <h3 className="text-gray-900 mb-3 text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl text-gray-900">
              NPR {product.price.toLocaleString()}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-400 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          {product.inStock && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              In Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Product List Item Component
const ProductListItem: React.FC<{
  product: Product;
  index: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  addingToCart: string | null;
}> = ({ product, index, onAddToCart, onViewProduct, addingToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-amber-200 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-48 h-48 flex-shrink-0 bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-full text-xs text-white shadow-lg ${
                  product.badge === "Hot"
                    ? "bg-red-500"
                    : product.badge === "New"
                      ? "bg-green-500"
                      : "bg-blue-500"
                }`}
              >
                {product.badge}
              </span>
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
              -
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100,
              )}
              %
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <p className="text-xs text-amber-600 mb-2 uppercase tracking-wider">
              {product.category}
            </p>
            <h3
              className="text-xl text-gray-900 mb-2 hover:text-amber-600 transition-colors cursor-pointer"
              onClick={() => onViewProduct(product)}
            >
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews} reviews)
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-3xl text-gray-900">
                NPR {product.price.toLocaleString()}
              </p>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <p className="text-sm text-gray-400 line-through">
                    NPR {product.originalPrice.toLocaleString()}
                  </p>
                )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewProduct(product)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                View Details
              </button>
              <button
                onClick={() => onAddToCart(product, 1)}
                disabled={addingToCart === product.id}
                className={`px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 ${
                  addingToCart === product.id ? "cursor-wait opacity-90" : ""
                }`}
              >
                {addingToCart === product.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
