import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Heart, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  sold?: number;
  badge?: string;
}

interface EnhancedProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  showViewAll?: boolean;
}

export const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({
  title,
  subtitle,
  products,
  onAddToCart,
  onViewProduct,
  showViewAll = true
}) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [wishlistedItems, setWishlistedItems] = useState<Record<string, string>>({});
  const [loadingWishlist, setLoadingWishlist] = useState<string | null>(null);

  // Fetch user's wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const favorites = data.results || data;
          const wishlistMap: Record<string, string> = {};
          
          favorites.forEach((fav: any) => {
            const inventoryId = String(fav.inventory?.id || fav.inventory_id);
            wishlistMap[inventoryId] = String(fav.id);
          });
          
          setWishlistedItems(wishlistMap);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleWishlistToggle = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setLoadingWishlist(product.id);

    try {
      const isWishlisted = wishlistedItems[product.id];

      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/${isWishlisted}/`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (response.ok) {
          const newWishlist = { ...wishlistedItems };
          delete newWishlist[product.id];
          setWishlistedItems(newWishlist);
          toast.success('Removed from wishlist');
        } else {
          const error = await response.json().catch(() => ({}));
          toast.error(error.detail || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/add/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              inventory_id: parseInt(product.id, 10),
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const favoriteId = String(data.data?.id || data.id);
          setWishlistedItems({ ...wishlistedItems, [product.id]: favoriteId });
          toast.success(data.message || 'Added to wishlist');
        } else {
          const error = await response.json().catch(() => ({}));
          toast.error(error.detail || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoadingWishlist(null);
    }
  };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && (
          <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            View All →
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onHoverStart={() => setHoveredProduct(product.id)}
            onHoverEnd={() => setHoveredProduct(null)}
            onClick={() => onViewProduct && onViewProduct(product)}
            className="bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              
              {/* Discount Badge */}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                  -{calculateDiscount(product.originalPrice, product.price)}%
                </div>
              )}

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
                  {product.badge}
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 transform transition-transform duration-300 ${
                hoveredProduct === product.id ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleWishlistToggle(product, e)}
                    disabled={loadingWishlist === product.id}
                    className={`p-2 rounded-full transition-colors ${
                      wishlistedItems[product.id]
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-900 hover:bg-orange-500 hover:text-white'
                    } ${loadingWishlist === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={wishlistedItems[product.id] ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlistedItems[product.id] ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProduct && onViewProduct(product);
                    }}
                    className="bg-white text-gray-900 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3">
              {/* Product Name */}
              <h3 className="text-sm text-gray-800 mb-1 line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold text-orange-500">
                    NPR {product.price.toLocaleString()}
                  </span>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    NPR {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Sold Count */}
              {product.sold && (
                <div className="text-xs text-gray-500 mb-2">
                  {product.sold} sold
                </div>
              )}

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-sm flex items-center justify-center space-x-1 shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};