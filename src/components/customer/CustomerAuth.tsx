import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Chrome,
  Facebook,
  Github,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerAuthProps {
  onAuthSuccess: (customer: any) => void;
}

export const CustomerAuth: React.FC<CustomerAuthProps> = ({
  onAuthSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]");
      const customer = customers.find(
        (c: any) =>
          c.email === loginData.email && c.password === loginData.password
      );

      if (customer) {
        toast.success("Login successful!");
        onAuthSuccess(customer);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name || !signupData.email || !signupData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]");

      const existingCustomer = customers.find(
        (c: any) => c.email === signupData.email
      );
      if (existingCustomer) {
        toast.error("Email already registered");
        setIsLoading(false);
        return;
      }

      const newCustomer = {
        id: `customer_${Date.now()}`,
        ...signupData,
        createdAt: new Date().toISOString(),
      };

      customers.push(newCustomer);
      localStorage.setItem("customers", JSON.stringify(customers));

      toast.success("Account created successfully!");
      onAuthSuccess(newCustomer);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    const testCustomer = {
      email: "customer@test.com",
      password: "Test@123",
    };
    setLoginData(testCustomer);
    toast.info("Test credentials filled. Click Login to continue.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:block text-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6">
                <ShoppingCart className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text mb-4">
              Serve Spares
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Your trusted auto parts partner
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "100% Genuine Products" },
                { icon: Truck, text: "Fast & Free Delivery" },
                { icon: CheckCircle, text: "1 Year Warranty" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Tab Switcher */}
            <div className="flex bg-gray-100">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 text-center transition-all ${
                  isLogin
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                <LogIn className="w-5 h-5 inline mr-2" />
                <span className="text-lg">Login</span>
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-center transition-all ${
                  !isLogin
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                <span className="text-lg">Sign Up</span>
              </button>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-3xl text-gray-900 mb-2">
                        Welcome Back!
                      </h2>
                      <p className="text-gray-600">
                        Login to continue shopping
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-lg"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Quick Login */}
                    <button
                      type="button"
                      onClick={handleQuickLogin}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-amber-500 hover:text-amber-600 transition-all"
                    >
                      Use Test Account
                    </button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Chrome, name: "Google" },
                        { icon: Facebook, name: "Facebook" },
                        { icon: Github, name: "GitHub" },
                      ].map((social) => (
                        <button
                          key={social.name}
                          type="button"
                          className="py-3 border border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center"
                        >
                          <social.icon className="w-5 h-5 text-gray-600" />
                        </button>
                      ))}
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignup}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-3xl text-gray-900 mb-2">
                        Create Account
                      </h2>
                      <p className="text-gray-600">
                        Join us and start shopping
                      </p>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData({ ...signupData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+977 123-456-7890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <textarea
                        value={signupData.address}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            address: e.target.value,
                          })
                        }
                        placeholder="Your delivery address"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-lg"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Mobile Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="md:hidden text-center mt-8 text-gray-600"
        >
          <p className="text-sm">
            &copy; 2024 Serve Spares. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
