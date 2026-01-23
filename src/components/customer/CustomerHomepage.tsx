import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../../utils/apiClient";
import {
  ShoppingBag,
  Star,
  TrendingUp,
  Award,
  Shield,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Tag,
  Truck,
  CheckCircle,
  Heart,
  Eye,
  ShoppingCart,
  Search,
  Play,
  TrendingDown,
  Percent,
  Car,
  Bike,
  Package,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerHomepageProps {
  onAddToCart: (product: any, quantity: number) => void;
  onViewProduct: (product: any) => void;
  onViewAllProducts?: () => void;
  onNavigateWithFilters?: (filters: {
    category?: string;
    vehicleType?: string;
    authenticity?: string;
  }) => void;
  onOpenCart?: () => void;
}

// Color palette for hero slides derived from inventory
const heroSlideGradients = [
  "from-blue-600 to-purple-600",
  "from-red-600 to-orange-600",
  "from-green-600 to-teal-600",
  "from-amber-600 to-rose-600",
];

// Featured products
// Removed static featuredProducts array

const categories = [
  {
    name: "Engine Parts",
    icon: "🔧",
    count: 2500,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Brakes",
    icon: "🛑",
    count: 1800,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    color: "from-red-500 to-red-600",
  },
  {
    name: "Lighting",
    icon: "💡",
    count: 1200,
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    name: "Suspension",
    icon: "⚙️",
    count: 950,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Wheels & Tires",
    icon: "⚫",
    count: 780,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    color: "from-gray-700 to-gray-900",
  },
  {
    name: "Electronics",
    icon: "🔌",
    count: 1100,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    color: "from-green-500 to-green-600",
  },
];

// Floating particles for hero background
const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{
      opacity: [0, 1, 0],
      y: [100, -100],
      x: [0, Math.random() * 100 - 50],
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      delay: delay,
      ease: "linear",
    }}
    className="absolute w-2 h-2 bg-white rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      bottom: 0,
    }}
  />
);

export const CustomerHomepage: React.FC<CustomerHomepageProps> = ({
  onAddToCart,
  onViewProduct,
  onViewAllProducts,
  onNavigateWithFilters,
  onOpenCart,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<
    "all" | "two-wheeler" | "four-wheeler"
  >("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Newsletter subscription state
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const heroSlides = useMemo(() => {
    if (!products.length) {
      return [
        {
          id: "placeholder",
          title: "Premium Auto Parts",
          subtitle: "For Every Journey",
          description:
            "Authentic parts for two-wheelers and four-wheelers with guaranteed quality",
          cta: "Shop Now",
          image:
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
          badge: "New Arrivals",
          color: heroSlideGradients[0],
          price: 0,
          originalPrice: 0,
          category: "",
          product: null,
        },
      ];
    }

    return products.slice(0, 4).map((product, index) => ({
      id: product.id,
      title: product.name,
      subtitle: product.category || "Premium auto parts",
      description:
        product.vehicleType && product.vehicleType !== "both"
          ? `Perfect fit for ${product.vehicleType === "two-wheeler" ? "two-wheelers" : "four-wheelers"}`
          : "Quality you can trust",
      cta: "View product",
      image:
        product.image ||
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
      badge: product.badge || (product.inStock ? "In Stock" : "Limited"),
      color: heroSlideGradients[index % heroSlideGradients.length],
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      product,
    }));
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {
          "ngrok-skip-browser-warning": "true",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/`,
          {
            headers,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        const mappedProducts = data.results.map((item: any) => {
          const images = Array.isArray(item.images) ? item.images : [];
          const primaryImage = images.find((img: any) => img.is_primary)?.image;
          const firstImage = images[0]?.image;
          const displayImage = primaryImage || firstImage || "";

          // Show MRP as the primary price as requested
          const displayPrice = parseFloat(item.mrp || 0);
          const originalPrice = parseFloat(item.price || 0);

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
            price: displayPrice,
            originalPrice: originalPrice,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 10,
            image: displayImage,
            badge: item.is_low_stock ? "Low Stock" : "New",
            inStock: !item.is_low_stock,
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (
    product: any,
    quantity: number,
    isBuyNow: boolean = false,
  ) => {
    setAddingToCart(product.id);

    if (onAddToCart) {
      await onAddToCart(product, quantity);
    }

    setAddingToCart(null);

    if (isBuyNow && onOpenCart) {
      setTimeout(() => {
        onOpenCart();
      }, 500);
    }
  };

  // Newsletter subscription handler
  const handleNewsletterSubscribe = async () => {
    if (!subscriptionEmail) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscriptionEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subscription/subscribe-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ email: subscriptionEmail }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to subscribe");
      }

      toast.success("Successfully subscribed to newsletter!");
      setSubscriptionSuccess(true);
      setSubscriptionEmail("");

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubscriptionSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error);
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  // Filter products based on vehicle type and limit to 8 for homepage
  const filteredProducts = products
    .filter((product) => {
      if (vehicleFilter === "all") return true;
      if (product.vehicleType === "both") return true;
      return product.vehicleType === vehicleFilter;
    })
    .slice(0, 8);

  // Auto-advance hero slides
  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    if (!heroSlides.length) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (!heroSlides.length) return;
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const currentHero = heroSlides[currentSlide % heroSlides.length];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero?.id || currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${currentHero?.color || heroSlideGradients[0]}`}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <FloatingParticle key={i} delay={i * 0.2} />
            ))}

            {/* Animated Circles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.05, 0.2],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"
            />

            <div className="max-w-7xl mx-auto px-4 h-full relative z-10">
              <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                {/* Left Content */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-white"
                >
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm">{currentHero?.badge || ""}</span>
                  </motion.div>

                  {/* Title with animated gradient */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-7xl lg:text-8xl mb-4 leading-tight"
                  >
                    <motion.span
                      animate={{
                        backgroundPosition: ["0%", "100%", "0%"],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent bg-[length:200%_auto]"
                    >
                      {currentHero?.title || ""}
                    </motion.span>
                  </motion.h1>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl mb-6 text-white/90"
                  >
                    {currentHero?.subtitle || ""}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-white/80 mb-8 leading-relaxed"
                  >
                    {currentHero?.description || ""}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (currentHero?.product && onViewProduct) {
                          onViewProduct(currentHero.product);
                        } else if (onViewAllProducts) {
                          onViewAllProducts();
                        }
                      }}
                      className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg hover:shadow-2xl transition-all shadow-xl group flex items-center space-x-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>{currentHero?.cta || "Shop Now"}</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg hover:bg-white/20 transition-all flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Watch Demo</span>
                    </motion.button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-3 gap-6 mt-12"
                  >
                    {[
                      { label: "Products", value: "5000+" },
                      { label: "Customers", value: "10K+" },
                      { label: "Rating", value: "4.9⭐" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <p className="text-3xl mb-1">{stat.value}</p>
                        <p className="text-sm text-white/70">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right Content - Animated Product Showcase */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="hidden md:block relative"
                >
                  {/* Main Product Card */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotateY: [0, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                      <div className="relative">
                        <img
                          src={currentHero?.image}
                          alt="Featured Product"
                          className="w-full h-80 object-cover rounded-2xl mb-6"
                        />

                        {/* Floating Price Tag */}
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl"
                        >
                          <div className="flex items-center space-x-2">
                            <Percent className="w-5 h-5" />
                            <span className="text-xl">50% OFF</span>
                          </div>
                        </motion.div>
                      </div>

                      <h3 className="text-2xl text-white mb-4">
                        {currentHero?.title || "Premium Auto Parts"}
                      </h3>

                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-4xl text-white">
                            {currentHero?.price
                              ? `NPR ${currentHero.price.toLocaleString()}`
                              : "Contact for price"}
                          </p>
                          {currentHero?.originalPrice &&
                            currentHero.originalPrice > currentHero.price && (
                              <p className="text-white/60 line-through">
                                NPR {currentHero.originalPrice.toLocaleString()}
                              </p>
                            )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentHero?.product) {
                              handleAddToCart(currentHero.product, 1, false);
                            }
                          }}
                          className="bg-white text-gray-900 p-4 rounded-full shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={
                            !currentHero?.product ||
                            addingToCart === currentHero?.product?.id
                          }
                        >
                          <ShoppingCart className="w-6 h-6" />
                        </motion.button>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9 + i * 0.1 }}
                            >
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            </motion.div>
                          ))}
                        </div>
                        <span className="text-white/80 text-sm">(4.9)</span>
                      </div>
                    </div>

                    {/* Floating Icons */}
                    <motion.div
                      animate={{
                        y: [0, 15, 0],
                        rotate: [0, 10, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-6 -left-6 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-xl"
                    >
                      <Truck className="w-8 h-8 text-white" />
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [0, -15, 0],
                        rotate: [0, -10, 0],
                      }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="absolute -bottom-6 -right-6 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-xl"
                    >
                      <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Slide Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
              <button
                onClick={prevSlide}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="flex space-x-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all ${
                      currentSlide === index
                        ? "w-12 h-3 bg-white"
                        : "w-3 h-3 bg-white/40 hover:bg-white/60"
                    } rounded-full`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Wave Divider */}
        {/* <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div> */}
      </div>

      {/* Quick Search Bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-2 flex items-center"
        >
          <div className="flex-1 flex items-center px-4">
            <Search className="w-6 h-6 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for brake pads, headlights, engine parts..."
              className="flex-1 py-4 text-lg focus:outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all"
          >
            Search
          </motion.button>
        </motion.div>
      </div>

      {/* Categories Section */}
      {/* <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-amber-600 mb-2 inline-flex items-center space-x-2"
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">
              Shop by Category
            </span>
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl text-gray-900 mb-4"
          >
            Find What You Need
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              onClick={() => {
                // Navigate to All Products with category filter
                if (onNavigateWithFilters) {
                  onNavigateWithFilters({ category: category.name });
                } else if (onViewAllProducts) {
                  onViewAllProducts();
                }
              }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
                />
              </div>

              <div className="relative z-10">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-gray-900 group-hover:text-white transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                  {category.count}+ items
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div> */}

      {/* Featured Products Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-amber-600 mb-2 inline-flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wider">
                  Top Picks
                </span>
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl text-gray-900"
              >
                Featured Products
              </motion.h2>
            </div>
            <button
              onClick={onViewAllProducts}
              className="hidden md:flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Vehicle Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVehicleFilter("all")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                vehicleFilter === "all"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>All Products</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  vehicleFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {products.length}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVehicleFilter("two-wheeler")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                vehicleFilter === "two-wheeler"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bike className="w-5 h-5" />
              <span>Two Wheeler</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  vehicleFilter === "two-wheeler"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {
                  products.filter(
                    (p) =>
                      p.vehicleType === "two-wheeler" ||
                      p.vehicleType === "both",
                  ).length
                }
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVehicleFilter("four-wheeler")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                vehicleFilter === "four-wheeler"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Four Wheeler</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  vehicleFilter === "four-wheeler"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {
                  products.filter(
                    (p) =>
                      p.vehicleType === "four-wheeler" ||
                      p.vehicleType === "both",
                  ).length
                }
              </span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => onViewProduct(product)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-amber-200 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

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

                  {product.originalPrice &&
                    product.originalPrice > product.price && (
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

                  <AnimatePresence>
                    {hoveredProduct === product.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-x-4 bottom-4 flex gap-2"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, 1, false);
                          }}
                          disabled={addingToCart === product.id}
                          className="flex-1 bg-white text-gray-900 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center space-x-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingToCart === product.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </motion.div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, 1, true);
                          }}
                          disabled={addingToCart === product.id}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm">Buy Now</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-5">
                  <p className="text-xs text-amber-600 mb-2 uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="text-gray-900 mb-3 text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>

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
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl text-gray-900">
                        NPR {product.price.toLocaleString()}
                      </p>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
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
            ))}
          </div>

          <div className="md:hidden text-center mt-8">
            <button
              onClick={onViewAllProducts}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all inline-flex items-center space-x-2"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 mb-2 inline-flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span className="text-sm uppercase tracking-wider">
                Why Choose Us
              </span>
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl text-white mb-4"
            >
              Your Trusted Partner
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg"
            >
              We provide the best service and quality products
            </motion.p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Genuine",
                description: "All products are authentic with warranty",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Same day delivery in Pokhara Valley",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Award,
                title: "Best Prices",
                description: "Competitive prices guaranteed",
                color: "from-amber-500 to-orange-600",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Round the clock customer service",
                color: "from-purple-500 to-purple-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} items-center justify-center mb-6 shadow-2xl`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl text-white mb-4">
              Get Exclusive Deals & Updates
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Subscribe to our newsletter and save up to 20% on your first order
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={subscriptionEmail}
                onChange={(e) => setSubscriptionEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !subscribing) {
                    handleNewsletterSubscribe();
                  }
                }}
                disabled={subscribing || subscriptionSuccess}
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleNewsletterSubscribe}
                disabled={subscribing || subscriptionSuccess}
                className="bg-white text-amber-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                    Subscribing...
                  </>
                ) : subscriptionSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-xl mb-4">Serve Spares</h3>
              <p className="text-sm text-gray-400">
                Your trusted source for quality auto parts in Nepal.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Engine Parts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Brakes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Lighting
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>Pokhara, Nepal</li>
                <li>+977 9864430493</li>
                <li>info@servespares.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Serve Spares. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
