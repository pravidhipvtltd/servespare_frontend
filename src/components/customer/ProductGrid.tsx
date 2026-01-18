import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Filter,
  Grid,
  List,
  Package,
  ShoppingCart,
  Star,
  MapPin,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ProductGridProps {
  onAddToCart: (product: any, quantity: number) => void;
  customerId: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onAddToCart,
  customerId,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  // Fetch products from all tenants
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Load products from localStorage or generate demo products
      loadDemoProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
      loadDemoProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoProducts = () => {
    const demoProducts = [
      {
        id: "1",
        name: "Brake Pad Set - Front",
        category: "Brakes",
        price: 2500,
        stock: 45,
        description:
          "High-quality ceramic brake pads for superior stopping power",
        seller: "AutoParts Nepal",
        rating: 4.5,
        vehicleType: "Four Wheeler",
      },
      {
        id: "2",
        name: "Engine Oil 5W-30",
        category: "Oils & Lubricants",
        price: 1200,
        stock: 120,
        description: "Synthetic engine oil for optimal performance",
        seller: "Spares Hub",
        rating: 4.8,
        vehicleType: "Both",
      },
      {
        id: "3",
        name: "Air Filter",
        category: "Filters",
        price: 450,
        stock: 80,
        description: "OEM quality air filter for better fuel efficiency",
        seller: "AutoParts Nepal",
        rating: 4.3,
        vehicleType: "Four Wheeler",
      },
      {
        id: "4",
        name: "Spark Plug Set",
        category: "Ignition",
        price: 800,
        stock: 60,
        description: "Premium spark plugs for smooth ignition",
        seller: "Parts Plaza",
        rating: 4.6,
        vehicleType: "Both",
      },
      {
        id: "5",
        name: "Motorcycle Chain",
        category: "Transmission",
        price: 1800,
        stock: 35,
        description: "Heavy-duty chain for motorcycles",
        seller: "Two Wheeler Spares",
        rating: 4.7,
        vehicleType: "Two Wheeler",
      },
      {
        id: "6",
        name: "Battery 12V 45Ah",
        category: "Electrical",
        price: 6500,
        stock: 25,
        description: "Maintenance-free car battery",
        seller: "AutoParts Nepal",
        rating: 4.4,
        vehicleType: "Four Wheeler",
      },
      {
        id: "7",
        name: "Headlight Bulb H4",
        category: "Lighting",
        price: 350,
        stock: 100,
        description: "Bright halogen headlight bulb",
        seller: "Spares Hub",
        rating: 4.2,
        vehicleType: "Both",
      },
      {
        id: "8",
        name: "Clutch Plate",
        category: "Transmission",
        price: 3200,
        stock: 20,
        description: "OEM quality clutch plate",
        seller: "Parts Plaza",
        rating: 4.5,
        vehicleType: "Four Wheeler",
      },
    ];

    setProducts(demoProducts);
    setFilteredProducts(demoProducts);
  };

  const handleAddToCart = (product: any) => {
    onAddToCart(product, 1);
    setAddedToCart((prev) => new Set(prev).add(product.id));
    toast.success(`${product.name} added to cart!`);

    // Remove the "added" state after 2 seconds
    setTimeout(() => {
      setAddedToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div
          className={`grid ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          } gap-6`}
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {/* Product Image */}
              <div
                className={`bg-gray-100 flex items-center justify-center ${
                  viewMode === "grid" ? "h-48 w-full" : "h-full w-48"
                }`}
              >
                <Package className="w-16 h-16 text-gray-400" />
              </div>

              {/* Product Details */}
              <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center text-yellow-500 text-xs">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    <span>{product.rating || "4.5"}</span>
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{product.seller || "Serve Spares"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-indigo-600">
                      NPR {product.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      product.stock === 0 || addedToCart.has(product.id)
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                      addedToCart.has(product.id)
                        ? "bg-green-100 text-green-700"
                        : product.stock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {addedToCart.has(product.id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
