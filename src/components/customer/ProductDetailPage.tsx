import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Package,
  ChevronLeft,
  Plus,
  Minus,
  X,
  MessageCircle,
  ThumbsUp,
  Camera,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description?: string;
  inStock: boolean;
}

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const relatedProducts = [
  {
    id: "r1",
    name: "Brake Fluid DOT 4",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop",
    rating: 4.7,
  },
  {
    id: "r2",
    name: "Brake Cleaner Spray",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop",
    rating: 4.5,
  },
  {
    id: "r3",
    name: "Brake Pad Shims",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=300&fit=crop",
    rating: 4.6,
  },
  {
    id: "r4",
    name: "Caliper Grease",
    price: 500,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.8,
  },
];

const reviews = [
  {
    id: 1,
    author: "Rajesh Kumar",
    rating: 5,
    date: "2024-12-01",
    comment:
      "Excellent quality brake pads! Very smooth braking and no noise at all. Highly recommended!",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    author: "Sita Sharma",
    rating: 4,
    date: "2024-11-28",
    comment:
      "Good product but took a bit longer to deliver. Quality is great though.",
    helpful: 12,
    verified: true,
  },
  {
    id: 3,
    author: "Amit Thapa",
    rating: 5,
    date: "2024-11-25",
    comment:
      "Perfect fit for my car. Installation was easy and performance is amazing!",
    helpful: 18,
    verified: false,
  },
];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");

  // Check if product is in wishlist on mount
  React.useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const favorites = data.results || data;
          const favorite = favorites.find(
            (fav: any) =>
              String(fav.inventory?.id || fav.inventory_id) ===
              String(product.id),
          );

          if (favorite) {
            setIsWishlisted(true);
            setFavoriteId(String(favorite.id));
          }
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  const images = [product.image];

  const handleShare = () => {
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    };

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText &&
      window.isSecureContext
    ) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch(() => {
          fallbackCopyTextToClipboard(window.location.href);
        });
    } else {
      fallbackCopyTextToClipboard(window.location.href);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleWishlist = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to add items to wishlist");
        return;
      }

      if (isWishlisted && favoriteId) {
       
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/${favoriteId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          setIsWishlisted(false);
          setFavoriteId(null);
          toast.success("Removed from wishlist");
        } else {
          const error = await response.json().catch(() => ({}));
          toast.error(error.detail || "Failed to remove from wishlist");
        }
      } else {
        // Add to favorites
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/add/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              inventory_id: parseInt(product.id, 10),
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Favorite added, API response:", data);
          setIsWishlisted(true);

          const favId = data.data?.id || data.id || data.favorite_id;
          console.log("Storing favorite ID:", favId);
          setFavoriteId(String(favId));
          toast.success(data.message || "Added to wishlist");
        } else {
          const error = await response.json().catch(() => ({}));
          toast.error(error.detail || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg mb-4 aspect-square group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-lg">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </div>
                )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    selectedImage === index
                      ? "ring-2 ring-amber-500 ring-offset-2"
                      : "hover:opacity-75"
                  }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Category */}
              <p className="text-sm text-amber-600 uppercase tracking-wider mb-2">
                {product.category}
              </p>

              {/* Title */}
              <h1 className="text-4xl text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-end gap-3">
                  <span className="text-5xl text-gray-900">
                    NPR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-2xl text-gray-400 line-through mb-2">
                        NPR {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                </div>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <p className="text-green-600 mt-2">
                      You save NPR{" "}
                      {(product.originalPrice - product.price).toLocaleString()}
                    </p>
                  )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>In Stock - Ready to Ship</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="px-6 text-lg text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-500"
                      : "border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 rounded-xl border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-all"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Free Delivery</p>
                    <p className="text-xs text-gray-500">In Pokhara Valley</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">1 Year Warranty</p>
                    <p className="text-xs text-gray-500">
                      Manufacturer warranty
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">
                      7 days return policy
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Genuine Product</p>
                    <p className="text-xs text-gray-500">100% authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {(["description", "specifications", "reviews"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-center transition-all capitalize ${
                      activeTab === tab
                        ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50"
                        : "text-gray-600 hover:text-amber-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose max-w-none"
              >
                <h3 className="text-2xl text-gray-900 mb-4">
                  Product Description
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description || "No description available."}
                </p>
                <h4 className="text-xl text-gray-900 mb-3 mt-6">Features:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Premium ceramic compound for superior braking</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Low dust formula keeps wheels cleaner</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Quiet operation with minimal noise</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Extended pad life for better value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Compatible with most vehicle models</span>
                  </li>
                </ul>
              </motion.div>
            )}

            {activeTab === "specifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl text-gray-900 mb-4">
                  Technical Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Material</p>
                    <p className="text-gray-900">Ceramic Compound</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Part Number</p>
                    <p className="text-gray-900">BP-{product.id}-2024</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Fitment Type</p>
                    <p className="text-gray-900">Direct Fit</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Warranty</p>
                    <p className="text-gray-900">1 Year</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Country of Origin</p>
                    <p className="text-gray-900">Japan</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Package Contents</p>
                    <p className="text-gray-900">Set of 4 Pads</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl text-gray-900">Customer Reviews</h3>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Write a Review
                  </button>
                </div>

                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-5xl text-gray-900 mb-2">
                        {product.rating}
                      </p>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(product.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{product.reviews} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div
                          key={stars}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-sm text-gray-600 w-12">
                            {stars} star
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400"
                              style={{
                                width: `${
                                  stars === 5 ? 70 : stars === 4 ? 20 : 10
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">
                            {stars === 5 ? 70 : stars === 4 ? 20 : 10}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-gray-900">{review.author}</p>
                            {review.verified && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{review.comment}</p>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <div
                key={relProduct.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 hover:border-amber-200 cursor-pointer"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={relProduct.image}
                    alt={relProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2 line-clamp-2">
                    {relProduct.name}
                  </h3>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(relProduct.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg text-gray-900">
                    NPR {relProduct.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
