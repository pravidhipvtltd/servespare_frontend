import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Search,
  Filter,
  Wrench,
  Heart,
  User,
  Settings,
  LogOut,
  Package,
  ChevronDown,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Grid,
  List,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowRight,
  Check,
  Menu,
  LogIn,
  UserPlus,
  SlidersHorizontal,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { CustomerAuthEnhanced } from "./customer/CustomerAuthEnhanced";
import { CustomerHomepage } from "./customer/CustomerHomepage";
import { ProductGrid } from "./customer/ProductGrid";
import { ShoppingCartPanel } from "./customer/ShoppingCartPanel";
import { CheckoutPage } from "./customer/CheckoutPage";
import { OrderHistory } from "./customer/OrderHistory";
import { CustomerProfile } from "./customer/CustomerProfile";
import { ProductDetailPage } from "./customer/ProductDetailPage";
import { AllProductsPage } from "./customer/AllProductsPage";
import { CustomerOrdersDashboard } from "./customer/CustomerOrdersDashboard";

type CustomerView =
  | "products"
  | "cart"
  | "orders"
  | "profile"
  | "checkout"
  | "detail"
  | "allProducts"
  | "auth";

interface CustomerPanelProps {
  onBackToEntry: () => void;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({
  onBackToEntry,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<CustomerView>("products");
  const [customerData, setCustomerData] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    details: string[];
    onConfirm: () => void;
    type: "warning" | "danger" | "info" | "success";
  } | null>(null);
  const [productFilters, setProductFilters] = useState<{
    category?: string;
    vehicleType?: string;
    authenticity?: string;
  }>({});

  // Check if customer is already logged in
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer_user");

    if (savedCustomer) {
      setCustomerData(JSON.parse(savedCustomer));
      setIsAuthenticated(true);
      // Fetch cart from API
      fetchCart();
    }
  }, []);

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/cart/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const cartItemsArray = data.items || [];

        const mappedItems = Array.isArray(cartItemsArray)
          ? cartItemsArray.map((item: any) => {
              // Fallback logic for price: try price -> item price -> retail_pricing -> mrp
              const price =
                parseFloat(item.inventory.price || 0) ||
                parseFloat(item.price || 0) ||
                parseFloat(item.inventory.retail_pricing || 0) ||
                parseFloat(item.inventory.mrp || 0);

              return {
                id: String(item.inventory.id),
                name: item.inventory.item_name || "Product",
                category:
                  item.inventory.category_display ||
                  item.inventory.category ||
                  "",
                price: price,
                originalPrice: parseFloat(item.inventory.mrp || 0),
                quantity: parseFloat(item.quantity || 0),
                image: item.inventory.primary_image || "",
                cartItemId: item.id,
              };
            })
          : [];

        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleLogin = (customer: any) => {
    setCustomerData(customer);
    setIsAuthenticated(true);
    localStorage.setItem("customer_user", JSON.stringify(customer));
    setCurrentView("products");
    // Fetch cart after login
    fetchCart();
  };

  const handleLogout = () => {
    setCustomerData(null);
    setIsAuthenticated(false);
    setCartItems([]);
    localStorage.removeItem("customer_user");
    setCurrentView("products");
  };

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart", {
        description: "You need to be logged in to shop",
        action: {
          label: "Login",
          onClick: () => setCurrentView("auth"),
        },
      });
      setCurrentView("auth");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/cart/add/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            inventory_id: parseInt(product.id, 10),
            quantity: quantity,
          }),
        }
      );

      if (response.ok) {
        toast.success(`${product.name} added to cart`, {
          description: `Quantity: ${quantity}`,
        });
        await fetchCart();
      } else {
        const error = await response.json();
        toast.error("Failed to add to cart", {
          description: error.detail || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart", {
        description: "Please check your connection",
      });
    }
  };

  const confirmRemoveFromCart = (productId: string) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    setConfirmConfig({
      title: "Remove Item from Cart",
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
      details: [
        "This item will be removed from your shopping cart",
        "You can add it back anytime from the product page",
      ],
      onConfirm: () => handleRemoveFromCart(productId),
      type: "danger",
    });
    setShowConfirmDialog(true);
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to remove items");
        return;
      }

      const cartItem = cartItems.find((item) => item.id === productId);
      if (!cartItem?.cartItemId) {
        toast.error("Cart item not found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/cart/${
          cartItem.cartItemId
        }/remove/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        toast.success("Item removed from cart");
        await fetchCart();
        setShowConfirmDialog(false);
        setConfirmConfig(null);
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      confirmRemoveFromCart(productId);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const cartItem = cartItems.find((item) => item.id === productId);
      if (!cartItem?.cartItemId) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/carts/cart/${
          cartItem.cartItemId
        }/update/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      if (response.ok) {
        // Refresh cart from API
        await fetchCart();
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info("Please login to proceed with checkout", {
        description: "You need to be logged in to complete your purchase",
        action: {
          label: "Login",
          onClick: () => setCurrentView("auth"),
        },
      });
      setCurrentView("auth");
      return;
    }
    setCurrentView("checkout");
    setCartOpen(false);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setCurrentView("orders");
  };

  const handleViewOrders = () => {
    if (!isAuthenticated) {
      toast.info("Please login to view your orders", {
        description: "You need to be logged in to see order history",
        action: {
          label: "Login",
          onClick: () => setCurrentView("auth"),
        },
      });
      setCurrentView("auth");
      return;
    }
    setCurrentView("orders");
    setShowMobileMenu(false);
  };

  const handleViewProfile = () => {
    if (!isAuthenticated) {
      toast.info("Please login to view your profile", {
        description: "You need to be logged in to access your profile",
        action: {
          label: "Login",
          onClick: () => setCurrentView("auth"),
        },
      });
      setCurrentView("auth");
      return;
    }
    setCurrentView("profile");
    setShowMobileMenu(false);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header - Light Background */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToEntry}
                className="text-gray-400 hover:text-amber-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-yellow-400 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    ></div>

                    <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-orange-600 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/60 ring-2 ring-yellow-400/50 overflow-hidden">
                      <Settings
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/30 animate-spin"
                        style={{ animationDuration: "20s" }}
                      />
                      <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/50 rotate-45 drop-shadow-lg" />
                      <Settings
                        className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-spin z-10"
                        style={{
                          animationDuration: "15s",
                          animationDirection: "reverse",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden md:block border-l border-gray-200 pl-3">
                  <h1 className="text-xl text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text leading-tight">
                    Serve Spares
                  </h1>
                  <p className="text-xs text-gray-500">
                    Premium Auto Parts Store
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentView("products")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${
                  currentView === "products"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                    : "text-gray-700 hover:bg-gray-50 hover:text-amber-600"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop</span>
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleViewOrders}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${
                      currentView === "orders"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                        : "text-gray-700 hover:bg-gray-50 hover:text-amber-600"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={handleViewProfile}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${
                      currentView === "profile"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                        : "text-gray-700 hover:bg-gray-50 hover:text-amber-600"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                </>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please login to view your cart", {
                      description:
                        "You need to be logged in to access your cart",
                      action: {
                        label: "Login",
                        onClick: () => setCurrentView("auth"),
                      },
                    });
                    setCurrentView("auth");
                    return;
                  }
                  setCartOpen(true);
                }}
                className="relative p-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu - Desktop */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {customerData?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customerData?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentView("auth")}
                    className="flex items-center space-x-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("auth")}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/30 rounded-lg transition-all text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentView("products");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                    currentView === "products"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Shop
                </button>

                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleViewOrders}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                        currentView === "orders"
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      My Orders
                    </button>
                    <button
                      onClick={handleViewProfile}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                        currentView === "profile"
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Profile
                    </button>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="px-4 py-2 mb-2">
                        <p className="text-sm text-gray-900">
                          {customerData?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customerData?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setCurrentView("auth");
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg text-amber-600 hover:bg-amber-50 text-sm"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView("auth");
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CustomerAuthEnhanced
                onLogin={handleLogin}
                onBackToEntry={() => setCurrentView("products")}
              />
            </motion.div>
          )}

          {currentView === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CustomerHomepage
                onAddToCart={handleAddToCart}
                onViewProduct={(product) => {
                  setSelectedProduct(product);
                  setCurrentView("detail");
                }}
                onViewAllProducts={() => setCurrentView("allProducts")}
                onOpenCart={() => setCurrentView("cart")}
              />
            </motion.div>
          )}

          {currentView === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ShoppingCartPanel
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
                onContinueShopping={() => setCurrentView("products")}
              />
            </motion.div>
          )}

          {currentView === "checkout" && isAuthenticated && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CheckoutPage
                cartItems={cartItems}
                customerData={customerData}
                onOrderComplete={handleOrderComplete}
                onBack={() => setCurrentView("cart")}
              />
            </motion.div>
          )}

          {currentView === "orders" && isAuthenticated && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CustomerOrdersDashboard
                customerData={customerData}
                onNavigateToCustomerPanel={() => setCurrentView("products")}
              />
            </motion.div>
          )}

          {currentView === "profile" && isAuthenticated && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CustomerProfile
                customerData={customerData}
                onUpdate={(updatedData) => {
                  setCustomerData(updatedData);
                  localStorage.setItem(
                    "customer_user",
                    JSON.stringify(updatedData)
                  );
                }}
              />
            </motion.div>
          )}

          {currentView === "detail" && selectedProduct && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProductDetailPage
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onBack={() => setCurrentView("products")}
              />
            </motion.div>
          )}

          {currentView === "allProducts" && (
            <motion.div
              key="allProducts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AllProductsPage
                onBack={() => setCurrentView("products")}
                onAddToCart={handleAddToCart}
                onViewProduct={(product) => {
                  setSelectedProduct(product);
                  setCurrentView("detail");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Shopping Cart Slide-out Panel */}
      <AnimatePresence>
        {cartOpen && isAuthenticated && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setCartOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-800/50"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-900/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur opacity-50"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text">
                        Shopping Cart
                      </h2>
                      <p className="text-sm text-slate-400 font-light">
                        {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCartOpen(false)}
                    className="p-2 hover:bg-slate-800/50 rounded-xl transition-all text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"></div>
                      <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-700/50 flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-slate-600" />
                      </div>
                    </div>
                    <h3 className="text-lg text-white mb-2 font-light">
                      Your cart is empty
                    </h3>
                    <p className="text-slate-400 mb-6 text-sm font-light">
                      Add some products to get started!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCartOpen(false);
                        setCurrentView("products");
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all inline-flex items-center gap-2 font-light"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Start Shopping</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            height: 0,
                            marginBottom: 0,
                          }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-slate-800/50 hover:border-amber-500/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800/50 border border-slate-700/50">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-slate-600" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-white mb-1 truncate font-light">
                                {item.name}
                              </h4>
                              <p className="text-xs text-amber-500/70 mb-2 font-light">
                                {item.category}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text">
                                  NPR {item.price.toLocaleString()}
                                </p>
                                {item.originalPrice &&
                                  item.originalPrice > item.price && (
                                    <span className="text-xs text-slate-600 line-through font-light">
                                      NPR {item.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Controls - Positioned below product info */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 rounded-md hover:bg-slate-700/50 transition-colors flex items-center justify-center text-slate-400 hover:text-amber-400"
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <span className="text-white w-8 text-center font-light">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 rounded-md hover:bg-slate-700/50 transition-colors flex items-center justify-center text-slate-400 hover:text-amber-400"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>

                            {/* Item Subtotal & Remove */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-white font-light">
                                NPR{" "}
                                {(item.price * item.quantity).toLocaleString()}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => confirmRemoveFromCart(item.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-900/30 backdrop-blur-sm space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-400 font-light">
                      <span>Subtotal</span>
                      <span className="text-white">
                        NPR {cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400 font-light">
                      <span>Shipping</span>
                      <span className="text-green-400">Free</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <span className="text-white font-light">Total</span>
                    <div className="text-right">
                      <div className="text-2xl text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text">
                        NPR {cartTotal.toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-500 font-light">
                        All taxes included
                      </p>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 font-light"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-light">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span>Secure checkout with eSewa & FonePay</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => {
            setShowConfirmDialog(false);
            setConfirmConfig(null);
          }}
          title={confirmConfig.title}
          message={confirmConfig.message}
          details={confirmConfig.details}
          type={confirmConfig.type}
          confirmText="Remove"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};
