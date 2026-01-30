import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  X,
  ShoppingBag,
  Sparkles,
  Shield,
  Truck,
  Tag,
  Gift,
  Percent,
  Heart,
  Star,
  ArrowLeft,
  Lock,
  CreditCard,
  Package,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ShoppingCartPanelProps {
  cartItems: any[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

// Recommended products for upselling
const recommendedProducts = [
  {
    id: "rec1",
    name: "Brake Fluid DOT 4",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop",
    rating: 4.7,
    badge: "Popular",
  },
  {
    id: "rec2",
    name: "Engine Oil Premium",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop",
    rating: 4.9,
    badge: "Best Seller",
  },
  {
    id: "rec3",
    name: "Air Filter Kit",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=300&fit=crop",
    rating: 4.6,
    badge: "Hot",
  },
];

export const ShoppingCartPanel: React.FC<ShoppingCartPanelProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  isOpen = true,
  onClose,
}) => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 5000 ? 0 : 150;
  const promoDiscount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const bulkDiscount = subtotal > 10000 ? Math.round(subtotal * 0.05) : 0;
  const totalDiscount = promoDiscount + bulkDiscount;
  const tax = Math.round((subtotal - totalDiscount) * 0.13);
  const total = subtotal + shipping - totalDiscount + tax;

  const freeShippingProgress = Math.min((subtotal / 5000) * 100, 100);
  const bulkDiscountProgress = Math.min((subtotal / 10000) * 100, 100);

  const handleRemove = (productId: string, productName: string) => {
    onRemoveItem(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    console.log("Updating cart item:", productId, "to quantity:", newQuantity);

    try {
      setUpdatingQuantity(productId);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login to update cart");
        return;
      }

      const apiUrl = `${
        (import.meta as any).env.VITE_API_BASE_URL
      }/carts/cart/${productId}/update/`;
      console.log("Making API call to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API Response data:", data);
        onUpdateQuantity(productId, newQuantity);
        toast.success("Cart updated");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error(errorData.message || "Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleSaveForLater = async (item: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to save items to wishlist");
        return;
      }

      // Add to favorites/wishlist
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/favorites/add/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            
          },
          body: JSON.stringify({
            inventory_id: parseInt(item.id, 10),
          }),
        }
      );

      if (response.ok) {
        // Remove from cart after successfully adding to wishlist
        onRemoveItem(item.id);
        toast.success("Item moved to wishlist");
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.detail || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error saving for later:", error);
      toast.error("Failed to move to wishlist");
    }
  };

  const handleMoveToCart = (item: any) => {
    setSavedItems(savedItems.filter((i) => i.id !== item.id));
    toast.success("Item moved to cart");
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo(promoCode);
      toast.success("Promo code applied! 10% discount added");
      setShowPromoInput(false);
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    toast.info("Promo code removed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Light Background */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onContinueShopping}
              className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Shopping Cart</h1>
                <p className="text-sm text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm p-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="w-16 h-16 text-amber-600" />
              </div>
            </motion.div>
            <h2 className="text-3xl text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Looks like you haven't added anything to your cart yet
            </p>
            <button
              onClick={onContinueShopping}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all inline-flex items-center space-x-2 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bars */}
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                {/* Free Shipping Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {freeShippingProgress >= 100 ? (
                          <span className="text-green-600 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>You got FREE shipping!</span>
                          </span>
                        ) : (
                          `Add NPR ${(
                            5000 - subtotal
                          ).toLocaleString()} more for FREE shipping`
                        )}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(freeShippingProgress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                </div>

                {/* Bulk Discount Progress */}
                {bulkDiscountProgress < 100 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Percent className="w-5 h-5 text-amber-600" />
                        <span className="text-sm text-gray-700">
                          Add NPR {(10000 - subtotal).toLocaleString()} more for
                          5% discount
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(bulkDiscountProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bulkDiscountProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                      />
                    </div>
                  </div>
                )}

                {bulkDiscountProgress >= 100 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">5% bulk discount applied!</span>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          {item.badge && (
                            <div className="absolute top-2 left-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs text-white shadow-lg ${
                                  item.badge === "Hot"
                                    ? "bg-red-500"
                                    : item.badge === "New"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>
                          )}
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs shadow-lg">
                                -
                                {Math.round(
                                  ((item.originalPrice - item.price) /
                                    item.originalPrice) *
                                    100
                                )}
                                %
                              </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl text-gray-900 mb-1 line-clamp-1">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.category}
                              </p>
                              {item.rating && (
                                <div className="flex items-center space-x-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.floor(item.rating)
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    ({item.rating})
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemove(item.id, item.name)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors h-fit"
                            >
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={
                                    item.quantity <= 1 ||
                                    updatingQuantity === item.id
                                  }
                                  className="px-4 py-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-gray-700" />
                                </button>
                                <span className="px-6 py-2 text-lg text-gray-900 border-x-2 border-gray-200">
                                  {updatingQuantity === item.id ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="w-4 h-4"
                                    >
                                      ⏳
                                    </motion.div>
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={updatingQuantity === item.id}
                                  className="px-4 py-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-gray-700" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleSaveForLater(item)}
                                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-amber-600 transition-colors"
                              >
                                <Heart className="w-4 h-4" />
                                <span>Save for later</span>
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-3xl text-gray-900">
                                NPR{" "}
                                {(item.price * item.quantity).toLocaleString()}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-500">
                                  NPR {item.price.toLocaleString()} each
                                </p>
                              )}
                              {item.originalPrice &&
                                item.originalPrice > item.price && (
                                  <p className="text-sm text-gray-400 line-through">
                                    NPR{" "}
                                    {(
                                      item.originalPrice * item.quantity
                                    ).toLocaleString()}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Saved for Later */}
              {savedItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl text-gray-900 mb-4 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Saved for Later ({savedItems.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-3"
                      >
                        <div className="w-full h-24 bg-gray-100 rounded-lg mb-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-900 mb-2">
                          NPR {item.price.toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="w-full text-xs bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Products */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl text-gray-900">
                      You might also need
                    </h3>
                  </div>
                  <span className="text-sm text-amber-600">
                    Based on your cart
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {recommendedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                          {product.badge}
                        </span>
                      </div>
                      <h4 className="text-sm text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500">
                          ({product.rating})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg text-gray-900">
                          NPR {product.price.toLocaleString()}
                        </p>
                        <button className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden sticky top-24">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                  <h3 className="text-2xl mb-2">Order Summary</h3>
                  <p className="text-white/90 text-sm">
                    Review your order details
                  </p>
                </div>

                <div className="p-6">
                  {/* Promo Code */}
                  <div className="mb-6">
                    {!appliedPromo ? (
                      <div>
                        {!showPromoInput ? (
                          <button
                            onClick={() => setShowPromoInput(true)}
                            className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all"
                          >
                            <div className="flex items-center space-x-2">
                              <Tag className="w-5 h-5 text-amber-600" />
                              <span className="text-gray-700">
                                Apply promo code
                              </span>
                            </div>
                            <Plus className="w-5 h-5 text-gray-400" />
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoCode}
                                onChange={(e) =>
                                  setPromoCode(e.target.value.toUpperCase())
                                }
                                placeholder="Enter code"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={handleApplyPromo}
                                className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setShowPromoInput(false);
                                setPromoCode("");
                              }}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <p className="text-xs text-gray-500">
                              Try: SAVE10 for 10% off
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 text-sm">
                            Code: {appliedPromo}
                          </span>
                        </div>
                        <button
                          onClick={handleRemovePromo}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="text-lg">
                        NPR {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span
                        className={
                          shipping === 0 ? "text-green-600" : "text-lg"
                        }
                      >
                        {shipping === 0 ? (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>FREE</span>
                          </span>
                        ) : (
                          `NPR ${shipping}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (13%)</span>
                      <span className="text-lg">
                        NPR {tax.toLocaleString()}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <span>Total Savings</span>
                        </span>
                        <span className="text-lg">
                          -NPR {totalDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                    <span className="text-xl text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-4xl text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text block">
                        NPR {total.toLocaleString()}
                      </span>
                      {totalDiscount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          NPR {(subtotal + shipping + tax).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={onCheckout}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-lg mb-4 group"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Secure Checkout</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <button
                    onClick={onContinueShopping}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all mb-6"
                  >
                    Continue Shopping
                  </button>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Secure SSL Encryption</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>Fast & Reliable Delivery</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <span>100% Genuine Products</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 text-center">
                      We Accept
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      {["eSewa", "FonePay", "Cash"].map((method) => (
                        <div
                          key={method}
                          className="px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-700"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
